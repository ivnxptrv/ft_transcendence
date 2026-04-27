#!/usr/bin/env bash
# End-to-end smoke test for the Identity service.
# Run the service first (devenv up), then: bash scripts/smoke.sh
#
# Exits non-zero on the first failing assertion.

set -euo pipefail

BASE="${IDENTITY_URL:-http://localhost:4010}"
EMAIL="smoke-$(date +%s)-$$@test.local"
PASSWORD="SmokeTest123"

say() { printf "\n\033[1;34m[>] %s\033[0m\n" "$*"; }
ok()  { printf "\033[1;32m    PASS\033[0m %s\n" "$*"; }
die() { printf "\033[1;31m    FAIL\033[0m %s\n" "$*" >&2; exit 1; }

json_get() {
  python3 -c 'import json,sys; print(json.loads(sys.stdin.read())[sys.argv[1]])' "$1"
}

expect_status() {
  local want="$1"; shift
  local got
  got=$(curl -s -o /dev/null -w '%{http_code}' "$@")
  [[ "$got" == "$want" ]] || die "expected HTTP $want, got $got"
  ok "HTTP $got"
}

say "0. health check"
curl -fsS "$BASE/health" >/dev/null && ok "/health"

say "1. JWKS exposed"
jwks=$(curl -fsS "$BASE/api/v1/.well-known/jwks.json")
echo "$jwks" | python3 -c 'import json,sys; d=json.loads(sys.stdin.read()); assert d["keys"][0]["kty"]=="RSA"' \
  && ok "public RSA key present"

say "2. register new user: $EMAIL"
curl -fsS -X POST "$BASE/api/v1/users/" \
  -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" >/dev/null \
  && ok "user created"

say "3. duplicate register -> 400"
expect_status 400 -X POST "$BASE/api/v1/users/" \
  -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

say "4. weak password -> 422"
expect_status 422 -X POST "$BASE/api/v1/users/" \
  -H 'content-type: application/json' \
  -d "{\"email\":\"weak-$(date +%s)@test.local\",\"password\":\"short\"}"

say "5. login"
tokens=$(curl -fsS -X POST "$BASE/api/v1/tokens/" \
  -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
access=$(printf '%s' "$tokens"  | json_get access_token)
refresh=$(printf '%s' "$tokens" | json_get refresh_token)
[[ -n "$access" && -n "$refresh" ]] || die "missing tokens in response"
ok "access + refresh tokens returned"

say "6. login with wrong password -> 401"
expect_status 401 -X POST "$BASE/api/v1/tokens/" \
  -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"wrong\"}"

say "7. refresh rotates token"
rotated=$(curl -fsS -X POST "$BASE/api/v1/tokens/refresh" \
  -H 'content-type: application/json' \
  -d "{\"refresh_token\":\"$refresh\"}")
new_access=$(printf '%s' "$rotated"  | json_get access_token)
new_refresh=$(printf '%s' "$rotated" | json_get refresh_token)
[[ "$new_refresh" != "$refresh" ]] || die "refresh token was not rotated"
ok "new refresh token differs from old"

say "8. old refresh is now revoked -> 401"
expect_status 401 -X POST "$BASE/api/v1/tokens/refresh" \
  -H 'content-type: application/json' \
  -d "{\"refresh_token\":\"$refresh\"}"

say "9. logout without bearer -> 401"
expect_status 401 -X DELETE "$BASE/api/v1/tokens/" \
  -H 'content-type: application/json' \
  -d "{\"refresh_token\":\"$new_refresh\"}"

say "10. logout with new refresh + bearer -> 204"
expect_status 204 -X DELETE "$BASE/api/v1/tokens/" \
  -H 'content-type: application/json' \
  -H "Authorization: Bearer $new_access" \
  -d "{\"refresh_token\":\"$new_refresh\"}"

say "11. refresh after logout -> 401"
expect_status 401 -X POST "$BASE/api/v1/tokens/refresh" \
  -H 'content-type: application/json' \
  -d "{\"refresh_token\":\"$new_refresh\"}"

say "12. access token JWT shape"
printf '%s' "$access" | python3 -c '
import sys, base64, json
tok = sys.stdin.read().strip().split(".")
assert len(tok) == 3, "not a JWT"
pad = lambda s: s + "=" * (-len(s) % 4)
hdr = json.loads(base64.urlsafe_b64decode(pad(tok[0])))
body = json.loads(base64.urlsafe_b64decode(pad(tok[1])))
assert hdr["alg"] == "RS256", hdr
assert body["typ"] == "access", body
assert body["iss"] == "identity", body
print("  kid:", hdr.get("kid"), "sub:", body["sub"], "exp_in:", body["exp"]-body["iat"], "s")
' && ok "RS256 header + access claims look correct"

printf "\n\033[1;32m[OK]\033[0m all smoke checks passed\n"
