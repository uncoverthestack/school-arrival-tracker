#!/usr/bin/env bash
# Mirrors Supabase Storage (student photos) into our own S3 bucket.
#
# pg_dump covers the database only. Student photos live in Supabase Storage, so a
# database-only backup would restore rows whose photo_url points at files we no
# longer have. Supabase Storage speaks the S3 protocol, so this is a plain sync.
#
# Required env:
#   SUPABASE_S3_ENDPOINT    https://<project-ref>.storage.supabase.co/storage/v1/s3
#   SUPABASE_S3_REGION      project region, e.g. eu-north-1
#   SUPABASE_S3_KEY_ID      storage access key id   (Storage settings -> S3 access keys)
#   SUPABASE_S3_SECRET      storage secret access key
#   BACKUP_S3_BUCKET        e.g. s3://childmap-backups
set -euo pipefail

: "${SUPABASE_S3_ENDPOINT:?SUPABASE_S3_ENDPOINT is not set}"
: "${SUPABASE_S3_REGION:?SUPABASE_S3_REGION is not set}"
: "${SUPABASE_S3_KEY_ID:?SUPABASE_S3_KEY_ID is not set}"
: "${SUPABASE_S3_SECRET:?SUPABASE_S3_SECRET is not set}"
: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET is not set}"

BUCKET="${SUPABASE_STORAGE_BUCKET:-student-photos}"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

# Two different S3 endpoints with two different credential sets, so pull down with
# Supabase's keys and push up with ours rather than trying to stream between them.
echo "==> downloading from Supabase Storage bucket '$BUCKET'"
AWS_ACCESS_KEY_ID="$SUPABASE_S3_KEY_ID" \
AWS_SECRET_ACCESS_KEY="$SUPABASE_S3_SECRET" \
aws s3 sync "s3://$BUCKET" "$WORKDIR/$BUCKET" \
  --endpoint-url "$SUPABASE_S3_ENDPOINT" \
  --region "$SUPABASE_S3_REGION" \
  --only-show-errors

COUNT="$(find "$WORKDIR/$BUCKET" -type f 2>/dev/null | wc -l | tr -d ' ')"
echo "==> downloaded $COUNT file(s)"

# Mirror into a dated prefix, so deleting a photo in Supabase does not silently
# delete our only copy of it. Costs more storage; worth it for a restore trail.
DEST="$BACKUP_S3_BUCKET/storage/$(date -u +%Y/%m/%d)/$BUCKET"
echo "==> uploading to $DEST"
aws s3 sync "$WORKDIR/$BUCKET" "$DEST" --only-show-errors

echo "==> done: $COUNT file(s) -> $DEST"
