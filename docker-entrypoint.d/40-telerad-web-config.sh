#!/bin/sh
# Render runtime config.js from $TELERAD_CORE_URL at container start, BEFORE
# nginx serves. The official nginx image runs /docker-entrypoint.d/*.sh in order
# (this runs after 20-envsubst-on-templates.sh). Lets one image serve every env
# by changing the TELERAD_CORE_URL service variable — no rebuild.
set -e
: "${TELERAD_CORE_URL:=}"
envsubst '${TELERAD_CORE_URL}' \
  < /etc/telerad-web/config.js.template \
  > /usr/share/nginx/html/config.js
echo "[telerad-web] config.js rendered: TELERAD_CORE_URL='${TELERAD_CORE_URL}'"
