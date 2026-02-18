#!/bin/bash
# SnapLink Database Backup Script
# Backs up PostgreSQL database to timestamped SQL file

set -e

# Load environment
source .env.local || source .env.example

# Extract database info from DATABASE_URL
# Format: postgresql://user:pass@host:port/dbname
DB_URL=$DATABASE_URL
DB_USER=$(echo $DB_URL | sed 's/.*:\/\/\([^:]*\).*/\1/')
DB_HOST=$(echo $DB_URL | sed 's/.*@\([^:]*\).*/\1/')
DB_PORT=$(echo $DB_URL | sed 's/.*@[^:]*:\([0-9]*\).*/\1/')
DB_NAME=$(echo $DB_URL | sed 's/.*\///g')
DB_PASSWORD=$(echo $DB_URL | sed 's/.*:\/\/[^:]*:\([^@]*\).*/\1/')

# Generate backup filename with timestamp
BACKUP_FILE="backups/snaplink-backup-$(date +%Y%m%d-%H%M%S).sql"
mkdir -p backups

echo "🔄 Backing up SnapLink database..."
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"
echo "  File: $BACKUP_FILE"

# Create backup
PGPASSWORD=$DB_PASSWORD pg_dump \
    -h $DB_HOST \
    -p $DB_PORT \
    -U $DB_USER \
    -d $DB_NAME \
    --clean \
    --if-exists \
    -f $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE
BACKUP_FILE="$BACKUP_FILE.gz"

FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo "✅ Backup successful!"
echo "  Size: $FILE_SIZE"
echo "  Location: $BACKUP_FILE"
echo ""
echo "💡 To restore from this backup:"
echo "  gunzip $BACKUP_FILE"
echo "  psql -U $DB_USER -h $DB_HOST -d $DB_NAME < ${BACKUP_FILE%.gz}"
