  ▎ 1. Delete generateJwtToken and JWT_SECRET. Web no longer mints tokens — identity does.
  ▎ 2. Replace the stubbed login / signup / logout actions in src/actions/auth.ts with real fetch calls
  ▎ to identity:
  ▎   - POST ${IDENTITY_URL}/api/v1/tokens/ with {email, password} → returns TokenPair
  ▎   - POST ${IDENTITY_URL}/api/v1/users/ with {email, password, role, first_name, last_name} → returns
  ▎ TokenPair
  ▎   - DELETE ${IDENTITY_URL}/api/v1/tokens/ with Authorization: Bearer <access> and {refresh_token}
  ▎ body
  ▎   - Store the access token in the jwt_token cookie and the refresh token in a separate refresh_token
  ▎ cookie (both httpOnly).
  ▎ 3. Switch JWT verification from HS256 to RS256 via JWKS in both src/lib/auth.ts (getCurrentUser) and
  ▎ proxy.ts (middleware):
  ▎ const JWKS = createRemoteJWKSet(new URL(`${IDENTITY_URL}/api/v1/.well-known/jwks.json`));
  ▎ const { payload } = await jwtVerify(token, JWKS, { issuer: "identity", audience: "ft-transcendence"
  ▎ });
  ▎ 3. Read payload.sub and payload.role (singular string, "client" | "insider").
  ▎ 4. Implement silent refresh (I didn't): when the access cookie expires, call POST
  ▎ /api/v1/tokens/refresh with the refresh cookie and re-set both cookies, instead of bouncing the user
  ▎ to /login every 15 min.
  ▎ 5. Surface signup/login errors to the user (also not implemented): both actions currently redirect to
  ▎  ?error=1 with no UI. Wire it through useActionState.
  ▎ 6. Env quirk to watch: devenv's dotenv loader doesn't expand ${VAR} inside other vars, so
  ▎ IDENTITY_URL from .env-root arrives as a literal template string. I worked around it by composing
  ▎ http://${IDENTITY_HOST}:${IDENTITY_PORT} in code — feel free to do it differently.
  ▎
  ▎ Identity contract (OpenAPI): services/identity/contract.yml.
  ▎ Local smoke test: cd services/identity && bash scripts/smoke.sh.