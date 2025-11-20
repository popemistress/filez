# Filez Backup System

This directory contains backup and restore scripts for the Filez project.

## Files

- `create_backup.sh` - Main backup script
- `restore_backup.sh` - Restore script
- `README.md` - This documentation

## Backup Types

### Full Backup (Recommended)
Creates a complete backup including database, project files, and environment configuration.
```bash
./create_backup.sh full
```

### Database Only
Backs up only the PostgreSQL database.
```bash
./create_backup.sh db
```

### Project Files Only
Backs up project source code and configuration files (excludes node_modules, .next, logs).
```bash
./create_backup.sh files
```

### Environment Configuration Only
Backs up environment files, PM2 config, and nginx configuration.
```bash
./create_backup.sh env
```

## Restore Operations

### List Available Backups
```bash
./restore_backup.sh list
```

### Restore Database
```bash
./restore_backup.sh db filez_db_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Restore Project Files
```bash
./restore_backup.sh files filez_project_backup_YYYYMMDD_HHMMSS.tar.gz
```

## Backup File Naming Convention

- Database: `filez_db_backup_YYYYMMDD_HHMMSS.sql.gz`
- Project: `filez_project_backup_YYYYMMDD_HHMMSS.tar.gz`
- Environment: `filez_env_backup_YYYYMMDD_HHMMSS.tar.gz`

## Automated Cleanup

The backup script automatically keeps only the 5 most recent backups of each type to save disk space.

## Security Notes

- Database backups are compressed with gzip
- Sensitive files like `.env.local` are excluded from project backups
- Environment backups include production configuration but exclude development secrets

## Scheduling Backups

To schedule automatic backups, add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /home/yamz/sites/filez/backup/create_backup.sh full >> /home/yamz/sites/filez/backup/backup.log 2>&1

# Weekly cleanup (Sunday at 3 AM)
0 3 * * 0 /home/yamz/sites/filez/backup/create_backup.sh cleanup >> /home/yamz/sites/filez/backup/backup.log 2>&1
```

## Troubleshooting

1. **Permission Denied**: Make sure scripts are executable
   ```bash
   chmod +x create_backup.sh restore_backup.sh
   ```

2. **Database Connection Issues**: Verify database credentials in the script configuration section

3. **Disk Space**: Monitor backup directory size and adjust retention policy if needed

## Configuration

Edit the configuration section in both scripts to match your environment:
- `DB_HOST`: Database host (default: localhost)
- `DB_USER`: Database username (default: yamz)
- `DB_PASSWORD`: Database password (default: filez123)
- `DB_NAME`: Database name (default: fileupload)
- `PROJECT_DIR`: Project directory path
- `BACKUP_DIR`: Backup storage directory
