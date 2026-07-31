#!/bin/bash
set -euo pipefail

# ==================================================
# STARK FACTORY — App Deployment Script
# App: Cyber Pharma V1
# ==================================================

# --- CONFIG (change these per app) ---
PROJECT_ID="cyberize-nextjs-staging"
REGION="us-east1"
SERVICE_NAME="cyber-pharma-prod"

# --- PUBLIC VARIABLES (change these per app) ---
# Custom domain known upfront → Two-Deploy Pattern WAIVED (one deploy).
NEXT_PUBLIC_APP_URL="https://cyber-pharma.cyberizedev.com"
NEXT_PUBLIC_SITE_URL="https://cyber-pharma.cyberizedev.com"
NEXT_PUBLIC_SUPABASE_URL="https://yrsuwikjnbmvpznrgydb.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_8FvPLZTmChxMrPwv7q9-rw_NgjoDk1S"  # publishable — client-shipped, safe as plaintext
NEXT_PUBLIC_ENABLE_MOOSE_PORTAL="false"                # operator-ruled: escape hatch OFF in cloud

# --- GUARD: refuse to deploy with unfilled placeholders ---
if grep -q "REPLACE_ME" <<< "${NEXT_PUBLIC_SUPABASE_URL}${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}"; then
  echo "❌ ABORT: REPLACE_ME placeholders still present in deploy.sh — fill them from .env.local first."
  exit 1
fi

# --- EXECUTION (do not modify below this line) ---
echo "=================================================="
echo "🤖 Stark Deployment Agent: Initiating Sequence"
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo "   Service: $SERVICE_NAME"
echo "   URL:     $NEXT_PUBLIC_APP_URL"
echo "=================================================="

gcloud config set project "$PROJECT_ID" --quiet

echo "🚀 Submitting Cloud Build..."
# STRING-BUILDER PATTERN (mandatory — Issue #5). Never split --substitutions across
# ,\ continuation lines: bash keeps each line's leading indent, producing separate
# argv tokens and gcloud "unrecognized arguments". One += per public var:
SUBSTITUTIONS="_REGION=${REGION}"
SUBSTITUTIONS+=",_SERVICE_NAME=${SERVICE_NAME}"
SUBSTITUTIONS+=",_NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}"
SUBSTITUTIONS+=",_NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}"
SUBSTITUTIONS+=",_NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}"
SUBSTITUTIONS+=",_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}"
SUBSTITUTIONS+=",_NEXT_PUBLIC_ENABLE_MOOSE_PORTAL=${NEXT_PUBLIC_ENABLE_MOOSE_PORTAL}"

gcloud builds submit \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --config cloudbuild.yaml \
  --substitutions "$SUBSTITUTIONS"

echo "=================================================="
echo "✅ Deployment Sequence Complete."
echo "   Service: $SERVICE_NAME"
echo "   URL:     $NEXT_PUBLIC_APP_URL"
echo "=================================================="
