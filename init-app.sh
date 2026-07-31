#!/bin/bash
set -euo pipefail

# ==================================================
# STARK FACTORY — One-Time App Setup
# App: Cyber Pharma V1 | Project: cyberize-nextjs-staging
# IDEMPOTENT — safe to run multiple times.
# ==================================================

PROJECT_ID="cyberize-nextjs-staging"
REGION="us-east1"
APP_NAME="cyber-pharma"

echo "=================================================="
echo "🤖 Stark Factory: Initializing $APP_NAME"
echo "   Project: $PROJECT_ID | Region: $REGION"
echo "=================================================="

gcloud config set project "$PROJECT_ID" --quiet
gcloud config set run/region "$REGION" --quiet

# --- ENABLE APIs ---
echo "📌 Enabling APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com iam.googleapis.com
echo "   ✅ APIs enabled."

# --- ARTIFACT REGISTRY (shared across apps) ---
REPO_NAME="cloud-run-source-deploy"
echo "📦 Checking Artifact Registry..."
if gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" &>/dev/null; then
  echo "   ✅ Repo exists."
else
  gcloud artifacts repositories create "$REPO_NAME" \
    --repository-format=docker --location="$REGION" \
    --description="Docker repository for Cloud Run"
  echo "   ✅ Repo created."
fi

# --- CREATE SECRETS ---
echo "🔐 Creating secrets..."
SECRET_NAME="${APP_NAME}-supabase-secret-key"
if gcloud secrets describe "$SECRET_NAME" --project "$PROJECT_ID" &>/dev/null; then
  echo "   ✅ $SECRET_NAME exists."
else
  echo -n "REPLACE_WITH_ACTUAL_VALUE" | gcloud secrets create "$SECRET_NAME" \
    --data-file=- --project "$PROJECT_ID"
  echo "   ✅ Created $SECRET_NAME — ⚠️ UPDATE THE VALUE!"
  echo "      Run: echo -n 'real-value' | gcloud secrets versions add $SECRET_NAME --data-file=- --project $PROJECT_ID"
fi

# --- RUNTIME SERVICE ACCOUNT ---
RUNTIME_SA="sa-${APP_NAME}-runtime"
echo "👤 Checking runtime SA..."
if gcloud iam service-accounts describe "${RUNTIME_SA}@${PROJECT_ID}.iam.gserviceaccount.com" &>/dev/null; then
  echo "   ✅ Runtime SA exists."
else
  gcloud iam service-accounts create "$RUNTIME_SA" \
    --display-name="${APP_NAME} Runtime SA" --project "$PROJECT_ID"

  # IAM PROPAGATION GUARD (Issue #4): a freshly created SA can 400 "does not exist"
  # if bound milliseconds later. Poll until describable before any binding:
  echo "   ⏳ Waiting for SA propagation..."
  for i in 1 2 3 4 5 6; do
    if gcloud iam service-accounts describe "${RUNTIME_SA}@${PROJECT_ID}.iam.gserviceaccount.com" --project "$PROJECT_ID" &>/dev/null; then
      echo "   ✅ SA visible."; break
    fi
    if [ "$i" -eq 6 ]; then
      # Guard must BLOCK, not narrate: continuing here would bind IAM against a
      # nonexistent SA and fail confusingly downstream.
      echo "   ⚠️ SA still not visible after 60s — aborting. Re-run this script."
      exit 1
    fi
    sleep 10
  done
  echo "   ✅ Runtime SA created."
fi

# --- BUILD SA BINDINGS ---
# cyber-pharma has ZERO build-time secrets (SUPABASE_SECRET_KEY is runtime-only,
# verified: factory-function reads at utils/supabase/admin.ts + moose-portal/_lib/admin.ts).
echo "🔑 Build SA bindings..."
echo "   ✅ None needed — no build-time secrets for this app."

# --- RUNTIME SA BINDINGS ---
echo "🔑 Runtime SA bindings..."
RUNTIME_SA_EMAIL="${RUNTIME_SA}@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
  --project "$PROJECT_ID" \
  --member="serviceAccount:${RUNTIME_SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor" --quiet
echo "   ✅ Runtime SA bindings complete."

# --- VERIFICATION ---
echo ""
echo "=================================================="
echo "🔍 VERIFICATION"
echo "=================================================="
echo "Secrets:"
gcloud secrets list --project "$PROJECT_ID" --format="table(name)" --filter="name:${APP_NAME}"
echo ""
echo "Secret value status (version count only — values never read):"
VERSION_COUNT="$(gcloud secrets versions list "$SECRET_NAME" --project "$PROJECT_ID" --format='value(name)' | wc -l)"
if [ "$VERSION_COUNT" -le 1 ]; then
  echo "   =================================================="
  echo "   ⚠️⚠️⚠️  SECRET STILL HOLDS PLACEHOLDER  ⚠️⚠️⚠️"
  echo "   $SECRET_NAME has only the placeholder version."
  echo "   Add the real value BEFORE running deploy.sh:"
  echo "   echo -n 'real-value' | gcloud secrets versions add $SECRET_NAME --data-file=- --project $PROJECT_ID"
  echo "   =================================================="
else
  echo "   ✅ real value present (versions: $VERSION_COUNT)"
fi
echo ""
echo "Runtime SA:"
gcloud iam service-accounts describe "${RUNTIME_SA_EMAIL}" --project "$PROJECT_ID" --format="value(email)" 2>/dev/null \
  && echo "   ✅ Exists" || echo "   ❌ NOT FOUND"
echo ""
echo "=================================================="
echo "✅ Init complete for $APP_NAME."
echo "   Next step: ./deploy.sh"
echo "=================================================="
