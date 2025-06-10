#!/bin/bash

# OMVS App Deployment Script
# This script automates the deployment of the OMVS application with Docker

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="omvs-app"
COMPOSE_FILE="docker-compose.yml"
PROD_COMPOSE_FILE="docker-compose.prod.yml"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Docker and Docker Compose are installed"
}

check_ports() {
    local ports=("5984" "19000" "19006" "8080")
    local occupied_ports=()
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            occupied_ports+=($port)
        fi
    done
    
    if [ ${#occupied_ports[@]} -ne 0 ]; then
        log_warning "The following ports are occupied: ${occupied_ports[*]}"
        log_warning "Please stop services using these ports or the deployment may fail"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

setup_environment() {
    log_info "Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        log_info "Creating .env file..."
        cat > .env << EOF
# CouchDB Configuration
COUCHDB_PASSWORD=secure_production_password
COUCHDB_SECRET=$(openssl rand -hex 32)

# Grafana Configuration (for monitoring)
GRAFANA_PASSWORD=admin123

# Application Configuration
NODE_ENV=production
EOF
        log_success ".env file created"
    else
        log_info ".env file already exists"
    fi
    
    # Create necessary directories
    mkdir -p docker/ssl
    mkdir -p logs
    
    log_success "Environment setup completed"
}

build_images() {
    log_info "Building Docker images..."
    
    if [ "$1" = "prod" ]; then
        docker-compose -f $PROD_COMPOSE_FILE build --no-cache
    else
        docker-compose -f $COMPOSE_FILE build --no-cache
    fi
    
    log_success "Docker images built successfully"
}

deploy_development() {
    log_info "Deploying development environment..."
    
    # Stop existing containers
    docker-compose -f $COMPOSE_FILE down --remove-orphans
    
    # Start services
    docker-compose -f $COMPOSE_FILE up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    check_services_health
    
    log_success "Development environment deployed successfully!"
    show_access_info
}

deploy_production() {
    log_info "Deploying production environment..."
    
    # Stop existing containers
    docker-compose -f $PROD_COMPOSE_FILE down --remove-orphans
    
    # Start services
    docker-compose -f $PROD_COMPOSE_FILE up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 45
    
    # Check service health
    check_services_health "prod"
    
    log_success "Production environment deployed successfully!"
    show_access_info "prod"
}

check_services_health() {
    local env=${1:-"dev"}
    local couchdb_container="omvs-couchdb"
    
    if [ "$env" = "prod" ]; then
        couchdb_container="omvs-couchdb-prod"
    fi
    
    log_info "Checking service health..."
    
    # Check CouchDB
    if docker exec $couchdb_container curl -f http://localhost:5984/_up > /dev/null 2>&1; then
        log_success "CouchDB is healthy"
    else
        log_error "CouchDB is not responding"
        return 1
    fi
    
    # Check databases
    if docker exec $couchdb_container curl -f http://admin:password@localhost:5984/omvs_distributions > /dev/null 2>&1; then
        log_success "Databases are accessible"
    else
        log_warning "Databases may not be initialized yet"
    fi
}

show_access_info() {
    local env=${1:-"dev"}
    
    echo
    log_success "=== OMVS Application Access Information ==="
    echo
    
    if [ "$env" = "dev" ]; then
        echo -e "${GREEN}🌐 Expo Development Server:${NC} http://localhost:19000"
        echo -e "${GREEN}📱 Expo Web App:${NC} http://localhost:19006"
        echo -e "${GREEN}🗄️  CouchDB Fauxton:${NC} http://localhost:8080"
    fi
    
    echo -e "${GREEN}🗄️  CouchDB Direct:${NC} http://localhost:5984/_utils"
    echo -e "${GREEN}📊 CouchDB API:${NC} http://localhost:5984"
    echo
    echo -e "${YELLOW}Credentials:${NC}"
    echo -e "  Username: admin"
    echo -e "  Password: password"
    echo
    
    if [ "$env" = "prod" ]; then
        echo -e "${GREEN}📈 Monitoring (optional):${NC}"
        echo -e "  Prometheus: http://localhost:9090"
        echo -e "  Grafana: http://localhost:3000"
        echo
    fi
}

show_logs() {
    local service=$1
    
    if [ -z "$service" ]; then
        log_info "Available services:"
        docker-compose -f $COMPOSE_FILE ps --services
        return
    fi
    
    log_info "Showing logs for $service..."
    docker-compose -f $COMPOSE_FILE logs -f $service
}

cleanup() {
    log_info "Cleaning up Docker resources..."
    
    # Stop and remove containers
    docker-compose -f $COMPOSE_FILE down --remove-orphans
    docker-compose -f $PROD_COMPOSE_FILE down --remove-orphans
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful!)
    read -p "Remove all unused volumes? This will delete all data! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
        log_warning "All unused volumes removed"
    fi
    
    log_success "Cleanup completed"
}

backup_data() {
    log_info "Creating backup of CouchDB data..."
    
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $backup_dir
    
    # Backup CouchDB data
    docker exec omvs-couchdb curl -X GET http://admin:password@localhost:5984/omvs_distributions/_all_docs?include_docs=true > $backup_dir/distributions.json
    docker exec omvs-couchdb curl -X GET http://admin:password@localhost:5984/omvs_gps_photos/_all_docs?include_docs=true > $backup_dir/gps_photos.json
    
    log_success "Backup created in $backup_dir"
}

show_help() {
    echo "OMVS Application Deployment Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  dev         Deploy development environment"
    echo "  prod        Deploy production environment"
    echo "  build       Build Docker images"
    echo "  logs [svc]  Show logs for service (or list services)"
    echo "  status      Show status of all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  cleanup     Clean up Docker resources"
    echo "  backup      Backup CouchDB data"
    echo "  help        Show this help message"
    echo
    echo "Examples:"
    echo "  $0 dev              # Deploy development environment"
    echo "  $0 prod             # Deploy production environment"
    echo "  $0 logs couchdb     # Show CouchDB logs"
    echo "  $0 backup           # Create data backup"
}

# Main script logic
case "${1:-help}" in
    "dev")
        check_docker
        check_ports
        setup_environment
        build_images
        deploy_development
        ;;
    "prod")
        check_docker
        check_ports
        setup_environment
        build_images "prod"
        deploy_production
        ;;
    "build")
        check_docker
        build_images
        ;;
    "logs")
        show_logs $2
        ;;
    "status")
        docker-compose -f $COMPOSE_FILE ps
        ;;
    "stop")
        log_info "Stopping all services..."
        docker-compose -f $COMPOSE_FILE down
        docker-compose -f $PROD_COMPOSE_FILE down
        log_success "All services stopped"
        ;;
    "restart")
        log_info "Restarting services..."
        docker-compose -f $COMPOSE_FILE restart
        log_success "Services restarted"
        ;;
    "cleanup")
        cleanup
        ;;
    "backup")
        backup_data
        ;;
    "help"|*)
        show_help
        ;;
esac 