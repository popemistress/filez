#\!/bin/bash

# Filez Complete Backup Script
# Usage: ./create_backup.sh [backup_type]

set -e

# Configuration
DB_HOST="localhost"
DB_USER="yamz"
DB_PASSWORD="filez123"
DB_NAME="fileupload"
PROJECT_DIR="/home/yamz/sites/filez"
BACKUP_DIR="/home/yamz/sites/filez/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Database backup function
backup_database() {
    log_info "Starting database backup..."
    
    local db_backup_file="$BACKUP_DIR/filez_db_backup_$TIMESTAMP.sql"
    
    export PGPASSWORD="$DB_PASSWORD"
    
    if pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" --clean --no-owner --no-privileges > "$db_backup_file"; then
        log_success "Database backup created: $db_backup_file"
        
        if gzip "$db_backup_file"; then
            log_success "Database backup compressed: ${db_backup_file}.gz"
            echo "Database backup size: $(du -h "${db_backup_file}.gz" | cut -f1)"
        fi
    else
        log_error "Database backup failed"
        return 1
    fi
    
    unset PGPASSWORD
}

# Project files backup function
backup_project_files() {
    log_info "Starting project files backup..."
    
    local files_backup_file="$BACKUP_DIR/filez_project_backup_$TIMESTAMP.tar.gz"
    
    if tar -czf "$files_backup_file" -C "$PROJECT_DIR" \
        --exclude="./backup" \
        --exclude="./node_modules" \
        --exclude="./.next" \
        --exclude="./logs" \
        --exclude="./.git" \
        --exclude="./.env.local" \
        .; then
        log_success "Project files backup created: $files_backup_file"
        echo "Project backup size: $(du -h "$files_backup_file" | cut -f1)"
    else
        log_error "Project files backup failed"
        return 1
    fi
}

# Main backup function
create_full_backup() {
    log_info "Starting full backup process..."
    echo "Timestamp: $TIMESTAMP"
    echo "Backup directory: $BACKUP_DIR"
    echo ""
    
    backup_database
    backup_project_files
    
    log_success "Full backup completed\!"
    echo ""
    echo "Backup files created:"
    ls -lh "$BACKUP_DIR"/*"$TIMESTAMP"* 2>/dev/null || log_warning "No backup files found"
}

# Main script logic
BACKUP_TYPE=${1:-full}

case "$BACKUP_TYPE" in
    "full")
        create_full_backup
        ;;
    "db")
        backup_database
        ;;
    "files")
        backup_project_files
        ;;
    *)
        echo "Usage: $0 [full|db|files]"
        exit 1
        ;;
esac

log_success "Backup operation completed successfully\!"
