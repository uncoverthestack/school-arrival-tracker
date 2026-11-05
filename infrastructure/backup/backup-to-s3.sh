#!/usr/bin/env bash
# Nightly logical backup of the Supabase Postgres database to S3.
#
# Supabase Pro keeps only 7 days of daily backups, which is shorter than a school
# term break — a problem discovered after the holidays would be unrecoverable. This
# gives us our own retention on storage we control, and doubles as the export path
# if we ever move off Supabase.
#
# Required env:
#   BACKUP_DATABASE_URL  Session-pooler URI (port 5432, NOT the app's 6543 transaction
#                        pooler — pg_dump cannot run through transaction pooling)
#   BACKUP_S3_BUCKET     e.g. s3://childmap-backups
# Requires pg_dump >= the server major version (currently 17) and the AWS CLI.
set -euo pipefail

: "${BACKUP_DATABASE_URL:?BACKUP_DATABASE_URL is not set}"
: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET is not set}"

STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

DUMP="$WORKDIR/childmap-$STAMP.dump"

echo "==> pg_dump ($(pg_dump --version))"
# -Fc is the compressed custom format: smaller than plain SQL and restorable
# selectively with pg_restore (one table, or schema before data).
# --no-owner/--no-acl keep the dump portable to a database with different roles,
# which matters if we ever restore into RDS rather than back into Supabase.
pg_dump "$BACKUP_DATABASE_URL" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file="$DUMP"

SIZE="$(du -h "$DUMP" | cut -f1)"
echo "==> dump complete ($SIZE)"

# Fail loudly on a suspiciously small dump rather than quietly uploading a broken
# backup that only gets noticed when it is needed.
if [ "$(stat -f%z "$DUMP" 2>/dev/null || stat -c%s "$DUMP")" -lt 10240 ]; then
  echo "ERROR: dump is under 10KB — refusing to upload" >&2
  exit 1
fi

echo "==> verifying dump is readable"
pg_restore --list "$DUMP" > /dev/null

DEST="$BACKUP_S3_BUCKET/postgres/$(date -u +%Y/%m)/childmap-$STAMP.dump"
echo "==> uploading to $DEST"
aws s3 cp "$DUMP" "$DEST" --only-show-errors

echo "==> done: $DEST"
