#\!/bin/bash

# Simple Restore Script
# Usage: ./restore_backup.sh [db|files] [backup_file]

set -e

DB_HOST="localhost"
DB_USER="yamz"
DB_PASSWORD="filez123"
DB_NAME="fileupload"
PROJECT_DIR="/home/yamz/sites/filez"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# List available backups
list_backups() {
    echo "Available backups:"
    echo ""
    echo "Database backups:"
    ls -lh filez_db_backup_*.sql.gz 2>/dev/null || echo "  No database backups found"
    echo ""
    echo "Project backups:"
    ls -lh filez_project_backup_*.tar.gz 2>/dev/null || echo "  No project backups found"
}

# Restore database
restore_database() {
    local backup_file="$1"
    
    if [ \! -f "$backup_file" ]; then
        log_error "Database backup file not found: $backup_file"
        return 1
    fi
    
    log_info "Restoring database from: $backup_file"
    
    export PGPASSWORD="$DB_PASSWORD"
    
    if gunzip -c "$backup_file" | psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"; then
        log_success "Database restored successfully"
    else
        log_error "Database restore failed"
        return 1
    fi
    
    unset PGPASSWORD
}

# Main logic
case "$1" in
    "list")
        list_backups
        ;;
    "db")
        if [ -z "$2" ]; then
            log_error "Please specify a database backup file"
            exit 1
        fi
        restore_database "$2"
        ;;
    *)
        echo "Usage: $0 [list|db] [backup_file]"
        echo ""
        echo "Examples:"
        echo "  $0 list"
        echo "  $0 db filez_db_backup_20251120_081644.sql.gz"
        exit 1
        ;;
esac
