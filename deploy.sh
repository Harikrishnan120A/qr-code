#!/bin/bash

# Lab Login System - Deployment Script
# This script builds and deploys the application

set -e  # Exit on any error

echo "🚀 Lab Login System - Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version must be 18 or higher. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) detected"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    print_success "npm $(npm --version) detected"
}

# Check environment file
check_environment() {
    if [ ! -f "lab-login-app/.env.production" ]; then
        print_warning ".env.production not found. Creating from template..."
        cp lab-login-app/.env.production.template lab-login-app/.env.production
        print_warning "Please edit lab-login-app/.env.production with your production settings before continuing."
        read -p "Press Enter to continue after editing the environment file..."
    fi
    print_success "Environment file checked"
}

# Install server dependencies
install_server_deps() {
    print_status "Installing server dependencies..."
    cd lab-login-app/server
    npm ci --only=production
    print_success "Server dependencies installed"
    cd ../..
}

# Install client dependencies  
install_client_deps() {
    print_status "Installing client dependencies..."
    cd lab-login-app/client
    npm ci --only=production
    print_success "Client dependencies installed"
    cd ../..
}

# Generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    cd lab-login-app/server
    npx prisma generate
    print_success "Prisma client generated"
    cd ../..
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    cd lab-login-app/server
    npx prisma migrate deploy
    print_success "Database migrations completed"
    cd ../..
}

# Build server
build_server() {
    print_status "Building server..."
    cd lab-login-app/server
    npm run build
    print_success "Server built successfully"
    cd ../..
}

# Build client
build_client() {
    print_status "Building client..."
    cd lab-login-app/client
    npm run build
    print_success "Client built successfully"
    cd ../..
}

# Create production package
create_package() {
    print_status "Creating production package..."
    
    # Create deployment directory
    mkdir -p deploy/lab-login-app
    
    # Copy server build
    cp -r lab-login-app/server/dist deploy/lab-login-app/
    cp -r lab-login-app/server/node_modules deploy/lab-login-app/
    cp lab-login-app/server/package.json deploy/lab-login-app/
    cp -r lab-login-app/server/prisma deploy/lab-login-app/
    
    # Copy client build
    cp -r lab-login-app/client/dist deploy/lab-login-app/public
    
    # Copy environment file
    cp lab-login-app/.env.production deploy/lab-login-app/.env
    
    print_success "Production package created in ./deploy directory"
}

# Main deployment function
main() {
    echo
    print_status "Starting deployment process..."
    echo
    
    # Pre-deployment checks
    check_node
    check_npm
    check_environment
    
    echo
    print_status "Building application..."
    echo
    
    # Build process
    install_server_deps
    install_client_deps
    generate_prisma
    run_migrations
    build_server
    build_client
    create_package
    
    echo
    print_success "🎉 Deployment completed successfully!"
    echo
    print_status "Next steps:"
    echo "1. Review the production package in ./deploy directory"
    echo "2. Deploy using your preferred platform:"
    echo "   - Docker: docker build -t lab-login-app ."
    echo "   - Railway: railway up"
    echo "   - Vercel: vercel --prod"
    echo "   - Manual: Upload ./deploy contents to your server"
    echo
    print_status "Production deployment options:"
    echo "- Docker: Use the provided Dockerfile and docker-compose.yml"
    echo "- Railway: Configure with railway.toml"
    echo "- Vercel: Use vercel.json configuration"
    echo "- Render: Use render.yaml configuration"
    echo
}

# Run the deployment
main "$@"