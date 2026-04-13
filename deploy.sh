#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  deploy.sh — TravelTracker full-stack deployment pipeline
# ─────────────────────────────────────────────────────────────
set -euo pipefail

# ── Configuration ────────────────────────────────────────────
REMOTE_USER="sdosremedios"
REMOTE_HOST="10.0.0.24"
SSH_KEY="$HOME/.ssh/id_ed25519"
PM2_PROCESS_NAME="traveltracker-backend"

FRONTEND_DIR="./frontend"
BACKEND_DIR="./backend"
REMOTE_FRONTEND_PATH="/var/www/traveltracker"
REMOTE_BACKEND_PATH="/var/www/traveltracker-backend"
REMOTE_TMP="/tmp/traveltracker-deploy"

HEALTH_LOCAL="http://localhost:3001/api/health"
HEALTH_PROXIED="https://${REMOTE_HOST}/api/health"
HEALTH_TIMEOUT=10
HEALTH_RETRIES=5
HEALTH_DELAY=3

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
FRONTEND_ARCHIVE="traveltracker-frontend-${TIMESTAMP}.tar.gz"
BACKEND_ARCHIVE="traveltracker-backend-${TIMESTAMP}.tar.gz"

# ── Flags ────────────────────────────────────────────────────
SKIP_BUILD=false
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    --dry-run)    DRY_RUN=true ;;
    *)            echo "Unknown flag: $arg"; exit 1 ;;
  esac
done

# ── Helpers ──────────────────────────────────────────────────
SSH_CMD="ssh -i ${SSH_KEY} -o StrictHostKeyChecking=accept-new ${REMOTE_USER}@${REMOTE_HOST}"
SCP_CMD="scp -i ${SSH_KEY} -o StrictHostKeyChecking=accept-new"

step=0
total_steps=8

log_step() {
  step=$((step + 1))
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  [$step/$total_steps]  $1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

log_ok()   { echo "  ✓  $1"; }
log_warn() { echo "  ⚠  $1"; }
log_fail() { echo "  ✗  $1"; }

die() {
  log_fail "$1"
  exit 1
}

# ── Pre-flight checks ───────────────────────────────────────
echo ""
echo "  TravelTracker Deploy  ·  ${TIMESTAMP}"
echo "  Target: ${REMOTE_USER}@${REMOTE_HOST}"
echo "  Flags:  skip-build=${SKIP_BUILD}  dry-run=${DRY_RUN}"
echo ""

[ -d "$FRONTEND_DIR" ] || die "Frontend directory not found: $FRONTEND_DIR"
[ -d "$BACKEND_DIR" ]  || die "Backend directory not found: $BACKEND_DIR"

if [ "$DRY_RUN" = false ]; then
  $SSH_CMD "echo 'SSH connection OK'" 2>/dev/null \
    || die "Cannot connect via SSH to ${REMOTE_HOST}"
  log_ok "SSH connection verified"
fi

# ─────────────────────────────────────────────────────────────
#  Step 1 · Build frontend
# ─────────────────────────────────────────────────────────────
log_step "Build frontend"

if [ "$SKIP_BUILD" = true ]; then
  log_warn "Skipping build (--skip-build)"
  [ -d "${FRONTEND_DIR}/dist" ] || die "No existing dist/ found — cannot skip build"
  log_ok "Using existing dist/"
else
  echo "  → npm ci"
  (cd "$FRONTEND_DIR" && npm ci --silent) || die "npm ci failed"
  log_ok "Dependencies installed"

  echo "  → npm run build"
  (cd "$FRONTEND_DIR" && npm run build) || die "Build failed"
  log_ok "Frontend built → ${FRONTEND_DIR}/dist/"
fi

# ─────────────────────────────────────────────────────────────
#  Step 2 · Create archives
# ─────────────────────────────────────────────────────────────
log_step "Create archives"

tar -czf "/tmp/${FRONTEND_ARCHIVE}" -C "${FRONTEND_DIR}/dist" . \
  || die "Failed to create frontend archive"
log_ok "Frontend archive → /tmp/${FRONTEND_ARCHIVE}  ($(du -h "/tmp/${FRONTEND_ARCHIVE}" | cut -f1))"

tar -czf "/tmp/${BACKEND_ARCHIVE}" \
  --exclude='node_modules' \
  --exclude='.env.local' \
  --exclude='.env' \
  --exclude='database.sqlite' \
  --exclude='logs' \
  --exclude='*.log' \
  -C "$BACKEND_DIR" . \
  || die "Failed to create backend archive"
log_ok "Backend archive  → /tmp/${BACKEND_ARCHIVE}  ($(du -h "/tmp/${BACKEND_ARCHIVE}" | cut -f1))"

# ── Dry-run exit ─────────────────────────────────────────────
if [ "$DRY_RUN" = true ]; then
  echo ""
  log_ok "Dry run complete — archives created, no remote operations performed."
  rm -f "/tmp/${FRONTEND_ARCHIVE}" "/tmp/${BACKEND_ARCHIVE}"
  exit 0
fi

# ─────────────────────────────────────────────────────────────
#  Step 3 · Upload archives
# ─────────────────────────────────────────────────────────────
log_step "Upload archives to server"

$SSH_CMD "mkdir -p ${REMOTE_TMP}"

$SCP_CMD "/tmp/${FRONTEND_ARCHIVE}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_TMP}/" \
  || die "Frontend upload failed"
log_ok "Frontend archive uploaded"

$SCP_CMD "/tmp/${BACKEND_ARCHIVE}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_TMP}/" \
  || die "Backend upload failed"
log_ok "Backend archive uploaded"

rm -f "/tmp/${FRONTEND_ARCHIVE}" "/tmp/${BACKEND_ARCHIVE}"

# ─────────────────────────────────────────────────────────────
#  Step 4 · Unpack frontend
# ─────────────────────────────────────────────────────────────
log_step "Unpack frontend"

$SSH_CMD bash -s <<FRONTEND_DEPLOY
set -euo pipefail

if [ -d "${REMOTE_FRONTEND_PATH}" ]; then
  sudo rm -rf "${REMOTE_FRONTEND_PATH}.prev"
  sudo mv "${REMOTE_FRONTEND_PATH}" "${REMOTE_FRONTEND_PATH}.prev"
  echo "  ✓  Previous frontend backed up to ${REMOTE_FRONTEND_PATH}.prev"
fi

sudo mkdir -p "${REMOTE_FRONTEND_PATH}"
sudo tar -xzf "${REMOTE_TMP}/${FRONTEND_ARCHIVE}" -C "${REMOTE_FRONTEND_PATH}"
sudo chown -R www-data:www-data "${REMOTE_FRONTEND_PATH}"
echo "  ✓  Frontend unpacked to ${REMOTE_FRONTEND_PATH}"
FRONTEND_DEPLOY

log_ok "Frontend deployed"

# ─────────────────────────────────────────────────────────────
#  Step 5 · Unpack backend + install dependencies
# ─────────────────────────────────────────────────────────────
log_step "Unpack backend and install dependencies"

$SSH_CMD bash -s <<BACKEND_DEPLOY
set -euo pipefail

PRESERVED_ENV=""
PRESERVED_DB=""

if [ -f "${REMOTE_BACKEND_PATH}/.env" ]; then
  cp "${REMOTE_BACKEND_PATH}/.env" /tmp/_tt_env_backup
  PRESERVED_ENV="true"
  echo "  ✓  .env preserved"
fi

if [ -f "${REMOTE_BACKEND_PATH}/database.sqlite" ]; then
  cp "${REMOTE_BACKEND_PATH}/database.sqlite" /tmp/_tt_db_backup
  PRESERVED_DB="true"
  echo "  ✓  database.sqlite preserved"
fi

if [ -d "${REMOTE_BACKEND_PATH}" ]; then
  sudo rm -rf "${REMOTE_BACKEND_PATH}.prev"
  sudo mv "${REMOTE_BACKEND_PATH}" "${REMOTE_BACKEND_PATH}.prev"
  echo "  ✓  Previous backend backed up to ${REMOTE_BACKEND_PATH}.prev"
fi

sudo mkdir -p "${REMOTE_BACKEND_PATH}"
sudo tar -xzf "${REMOTE_TMP}/${BACKEND_ARCHIVE}" -C "${REMOTE_BACKEND_PATH}"
sudo chown -R ${REMOTE_USER}:${REMOTE_USER} "${REMOTE_BACKEND_PATH}"

if [ "\$PRESERVED_ENV" = "true" ]; then
  cp /tmp/_tt_env_backup "${REMOTE_BACKEND_PATH}/.env"
  rm -f /tmp/_tt_env_backup
  echo "  ✓  .env restored"
fi

if [ "\$PRESERVED_DB" = "true" ]; then
  cp /tmp/_tt_db_backup "${REMOTE_BACKEND_PATH}/database.sqlite"
  rm -f /tmp/_tt_db_backup
  echo "  ✓  database.sqlite restored"
fi

cd "${REMOTE_BACKEND_PATH}"
npm ci --omit=dev --silent
echo "  ✓  Backend dependencies installed"
BACKEND_DEPLOY

log_ok "Backend deployed"

# ─────────────────────────────────────────────────────────────
#  Step 6 · Restart PM2
# ─────────────────────────────────────────────────────────────
log_step "Restart PM2 process"

$SSH_CMD bash -s <<PM2_RESTART
set -euo pipefail

if pm2 describe "${PM2_PROCESS_NAME}" > /dev/null 2>&1; then
  pm2 restart "${PM2_PROCESS_NAME}" --update-env
  echo "  ✓  PM2 process '${PM2_PROCESS_NAME}' restarted"
else
  cd "${REMOTE_BACKEND_PATH}"
  pm2 start server.js --name "${PM2_PROCESS_NAME}"
  echo "  ✓  PM2 process '${PM2_PROCESS_NAME}' started (first deploy)"
fi

pm2 save
echo "  ✓  PM2 process list saved"
PM2_RESTART

log_ok "PM2 ready"

# ─────────────────────────────────────────────────────────────
#  Step 7 · Reload Apache
# ─────────────────────────────────────────────────────────────
log_step "Reload Apache"

$SSH_CMD bash -s <<APACHE_RELOAD
set -euo pipefail

sudo apachectl configtest 2>&1 || { echo "  ✗  Apache config test failed"; exit 1; }
echo "  ✓  Apache config valid"

sudo systemctl reload apache2
echo "  ✓  Apache reloaded"
APACHE_RELOAD

log_ok "Apache ready"

# ─────────────────────────────────────────────────────────────
#  Step 8 · Health checks
# ─────────────────────────────────────────────────────────────
log_step "Health checks"

health_ok=true

# ── Check 1: Local API (on the server, bypasses Apache) ──
echo "  → Checking local API: ${HEALTH_LOCAL}"
LOCAL_STATUS=$($SSH_CMD "
  for i in \$(seq 1 ${HEALTH_RETRIES}); do
    status=\$(curl -s -o /dev/null -w '%{http_code}' --max-time ${HEALTH_TIMEOUT} '${HEALTH_LOCAL}' 2>/dev/null || echo '000')
    if [ \"\$status\" = '200' ]; then
      echo '200'
      exit 0
    fi
    sleep ${HEALTH_DELAY}
  done
  echo \"\$status\"
")

if [ "$LOCAL_STATUS" = "200" ]; then
  log_ok "Local API health check passed (HTTP 200)"
else
  log_fail "Local API health check failed (HTTP ${LOCAL_STATUS})"
  health_ok=false
fi

# ── Check 2: Proxied API (from this machine, through Apache) ──
echo "  → Checking proxied API: ${HEALTH_PROXIED}"
PROXIED_STATUS="000"
for i in $(seq 1 $HEALTH_RETRIES); do
  PROXIED_STATUS=$(curl -s -o /dev/null -w '%{http_code}' --max-time "$HEALTH_TIMEOUT" "$HEALTH_PROXIED" 2>/dev/null || echo "000")
  if [ "$PROXIED_STATUS" = "200" ]; then
    break
  fi
  sleep "$HEALTH_DELAY"
done

if [ "$PROXIED_STATUS" = "200" ]; then
  log_ok "Proxied API health check passed (HTTP 200)"
else
  log_fail "Proxied API health check failed (HTTP ${PROXIED_STATUS})"
  health_ok=false
fi

# ── Final status ─────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$health_ok" = true ]; then
  echo "  ✓  Deploy complete — all health checks passed"
  echo "  ✓  ${TIMESTAMP}"
else
  echo "  ⚠  Deploy complete — one or more health checks failed"
  echo ""
  echo "  Rollback commands:"
  echo ""
  echo "    # Frontend"
  echo "    ssh ${REMOTE_USER}@${REMOTE_HOST} \\"
  echo "      'sudo rm -rf ${REMOTE_FRONTEND_PATH} && sudo mv ${REMOTE_FRONTEND_PATH}.prev ${REMOTE_FRONTEND_PATH}'"
  echo ""
  echo "    # Backend"
  echo "    ssh ${REMOTE_USER}@${REMOTE_HOST} \\"
  echo "      'sudo rm -rf ${REMOTE_BACKEND_PATH} && sudo mv ${REMOTE_BACKEND_PATH}.prev ${REMOTE_BACKEND_PATH} && pm2 restart ${PM2_PROCESS_NAME}'"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

$SSH_CMD "rm -rf ${REMOTE_TMP}" 2>/dev/null || true

if [ "$health_ok" = false ]; then
  exit 1
fi
