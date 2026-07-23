#!/bin/bash
set -e  # Fail fast

# ==================================================
# STARK FACTORY - Google Cloud SDK Installer (v2)
# Operator-run. Apt-repo method (NOT snap - sandboxing
# causes path/auth issues; apt is Google's documented
# route for Debian/Ubuntu/Zorin).
# Field-verified: 2026-07-14 (Zorin VM, clean install
# through auth, end to end).
# ==================================================

echo "STARK FACTORY: Installing Google Cloud SDK..."

# 1. Pre-requisites
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates gnupg curl

# 2. Add Google's signing key (skip if present)
if [ ! -f /usr/share/keyrings/cloud.google.gpg ]; then
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
fi

# 3. Add the repo - IDEMPOTENT (v2 fix: v1 appended a
#    duplicate source line on every re-run)
REPO_LINE="deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main"
if ! grep -qsF "$REPO_LINE" /etc/apt/sources.list.d/google-cloud-sdk.list 2>/dev/null; then
    echo "$REPO_LINE" | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list
fi

# 4. Install
sudo apt-get update && sudo apt-get install -y google-cloud-cli

echo "GCloud Installed."
echo "--------------------------------------------------"
echo "ACTION REQUIRED: Logging you in..."
echo "1. A browser opens (or a link prints)."
echo "2. Log in with the SAME Google account your GCP org uses."
echo "3. Complete the flow; return here."
echo "--------------------------------------------------"

# 5. Trigger Login
gcloud auth login

echo "--------------------------------------------------"
echo "Authentication Complete."
echo "   Verify: gcloud --version && gcloud auth list"
echo "   'Current project is [None]' is EXPECTED on a fresh"
echo "   machine - the bootstrap walkthrough sets it."
