alembic revision --autogenerate -m "any comment" #apply changes in models

# Endpoints

- POST   /api/v1/users              Register
- POST   /api/v1/sessions           Login
- POST   /api/v1/sessions/refresh   Refresh tokens
- DELETE /api/v1/sessions           Logout
- GET    /api/v1/users/me           Current user info
- GET    /.well-known/jwks.json     Public keys for JWT verification