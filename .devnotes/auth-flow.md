# Identity ↔ Web auth flow

## High level

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant W as Web (Next.js)
    participant I as Identity (FastAPI)
    participant DB as Postgres

    Note over B,W: Sign up
    B->>W: POST /signup {email, pw, role}
    W->>I: POST /api/v1/users
    I->>DB: INSERT user (bcrypt hash)
    I-->>W: 201 {access, refresh, expires_in}
    W-->>B: Set-Cookie: access, refresh

    Note over B,W: Login
    B->>W: POST /login {email, pw}
    W->>I: POST /api/v1/sessions
    I->>DB: verify bcrypt + INSERT token row
    I-->>W: 200 {access, refresh, expires_in}
    W-->>B: Set-Cookie: access, refresh

    Note over B,W: Authed request
    B->>W: GET /protected (cookie: access)
    W->>W: jwtVerify(access, JWKS) — offline
    W-->>B: 200 page

    Note over B,W: Profile (the "me" part)
    B->>W: GET /me
    W->>I: GET /api/v1/users/me<br/>Authorization: Bearer <access>
    I->>I: decode token → read `sub`
    I->>DB: SELECT user WHERE sub = ?
    I-->>W: 200 {id, email, role, first_name, last_name}
    W-->>B: profile JSON

    Note over B,W: Refresh on 401
    W->>I: POST /api/v1/sessions/refresh {refresh_token}
    I->>DB: revoke old jti + INSERT new
    I-->>W: 200 {access, refresh, expires_in}

    Note over B,W: Logout
    B->>W: POST /logout
    W->>I: DELETE /api/v1/sessions<br/>Authorization: Bearer <access><br/>{refresh_token}
    I->>DB: UPDATE tokens SET revoked_at = now
    I-->>W: 204
    W-->>B: clear cookies
```

## Components

```mermaid
flowchart LR
    subgraph Browser
      UI[Pages / forms / cookies]
    end

    subgraph Web[Web — Next.js]
      SA[Server Actions<br/>/signup /login /logout]
      MW[middleware.ts<br/>jwtVerify with JWKS]
      ME[/me page/]
    end

    subgraph Identity[Identity — FastAPI]
      U[POST /users<br/>GET /users/me]
      S[POST /sessions<br/>POST /sessions/refresh<br/>DELETE /sessions]
      J[GET /.well-known/jwks.json]
      H[bcrypt hash/verify]
      JWT[RS256 sign / decode]
    end

    DB[(Postgres<br/>users, tokens)]

    UI --> SA
    UI --> MW
    UI --> ME
    SA -->|HTTP + Bearer| U
    SA -->|HTTP + Bearer| S
    ME -->|HTTP + Bearer| U
    MW -->|fetch once, cache| J

    U --> H
    U --> DB
    S --> H
    S --> JWT
    S --> DB
    JWT --> J
```

## Why "me"

```mermaid
flowchart LR
    A[Browser cookie:<br/>access JWT] -->|forwarded| B[Web]
    B -->|Authorization: Bearer ...| C[Identity]
    C -->|decode JWT| D[sub claim<br/>= user UUID]
    D -->|SELECT * WHERE sub=?| E[(users)]
    E --> F[Return that user]
```

`me` is not session state inside identity — it's whatever `sub` the token carries.
Web is just a relay; identity authenticates each request from the token alone.

## Token lifetimes

| Token   | Lifetime | Where stored                   | Revocable? |
| ------- | -------- | ------------------------------ | ---------- |
| Access  | 15 min   | cookie (web), client memory    | No (short) |
| Refresh | 14 days  | cookie (web), `tokens` table   | Yes (jti)  |
