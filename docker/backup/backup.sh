#!/bin/sh
# Dumps the database to /backups and keeps only the newest $BACKUP_KEEP dumps.

file="/backups/$(date +%Y-%m-%d_%H%M%S).sql.gz"

if MYSQL_PWD="$DB_PASSWORD" mariadb-dump -h "$DB_HOST" -u "$DB_USERNAME" \
        --single-transaction --no-tablespaces "$DB_DATABASE" | gzip > "$file.tmp" \
    && gunzip -c "$file.tmp" | tail -n 1 | grep -q 'Dump completed'; then
    mv "$file.tmp" "$file"
    echo "[backup] saved $file"
else
    rm -f "$file.tmp"
    echo "[backup] failed" >&2
    exit 1
fi

ls -1t /backups/*.sql.gz | tail -n +$((BACKUP_KEEP + 1)) | xargs -r rm --
