*This project has been created as part of the 42 curriculum by ipetrov, vvoronts, mmaksimo, jichompo, juhtoo-h.*

# Description

Vekko, a matching marketplace connecting "Clients" seeking specific insights with "Insiders" possessing relevant lived experience or expertise. The platform utilizes natural language processing and vector similarity to match client requests with insider profiles, facilitating a micro-transaction economy for authentic human responses.

## Key features:

### **1. User Roles**

- **Clients:** Users who seek specific information, insights, or authentic human experiences. They hold funds in an internal wallet to purchase answers.
- **Insiders:** Knowledgeable individuals or experts who provide answers based on their background. They monetize their expertise by setting prices for their responses.

### **2. Core Data Structures & Technical Stack**

- **Text-to-Tensor Conversion:** Both Client requests and Insider background essays are processed through an embedding model to convert the plain text into high-dimensional vectors (tensors).
- **Vector Database:** These tensors are stored in a specialized database optimized for vector similarity search.
- **Matching Engine:** The system calculates the proximity (vector similarity) between a new Client request tensor and the database of Insider expertise tensors to find the most relevant matches.

### **3. User Journeys**

**A. Insider Onboarding Journey**

1. **Profile Creation:** The Insider writes a detailed essay describing their background, lived experiences, and specific areas of expertise in plain text.
2. **Processing:** The system converts this essay into a tensor and stores it in the vector database.

**B. Client Request & Transaction Journey**

1. **Fund Wallet:** The Client tops up their internal platform wallet with funds.
2. **Submit Request:** The Client writes a specific query or request in plain text.
3. **Tensor Processing:** The Client's request is converted into a tensor.
4. **Proximity Matching:** The system queries the vector database and identifies the top 5 Insiders whose background tensors most closely match the request tensor.
5. **Insider Notification & Response:** The top 5 matched Insiders receive a notification. They review the request and, if they choose, craft a response message based on their authentic human experience.
6. **Pricing:** Each responding Insider sets a specific, custom price for their response.
7. **Client Review:** The Client is presented with a list of the submitted responses. For each response, they can only see:
    - A one-sentence, anonymous description of the responding Insider's profile.
    - The price set by the Insider.
8. **Reveal & Transaction:** The Client selects a response to read and pays the specified price using their internal wallet. The full message is then revealed.
9. **Assessment & Feedback:** After reading the revealed message, the Client assesses their satisfaction with the depth and quality of the response.
10. **Credibility Update:** The Client's assessment is used to calculate and update the Insider's ongoing "Credibility Score."


## Instructions

- `make install-nix`
- `make develop`
- `devenv up` — builds and starts all services.
- Open `https://localhost:4009`

## Resources

### References

| Service | Technology |
| :--- | :--- |
| **frontend framework** | [React](https://react.dev/) |
| **gateway** | [Nginx](https://nginx.org/en/docs/) |
| **backend framework** | [Next.js](https://nextjs.org/docs),  [FastAPI](https://fastapi.tiangolo.com/), [Python](https://www.python.org) |
| **database** | [PostgreSQL](https://www.postgresql.org/docs/) |
| **logs** | [ELK Stack](https://www.elastic.co/guide/index.html) |
| **metrics** | [Prometheus](https://prometheus.io/docs/) / [Grafana](https://grafana.com/docs/) |monitoring |


### Vocabulary 

- user — whether `client` or `insider`
- client — `user` who seeks specific information
- insider — `user` who provides answers based on their background
- legend — raw text from an `insider` describing his expertise    
- soul — a `legend` represented as an embedding
- order — raw text from a `client` describing his interest
- inquiry — an `order` represented as an embedding
- match — `order` dispatched to an `insider` which matches an `inquiry` with required `score`
- insight — raw text from an `insider` as a response to an `order` with a button to reveal text for a price
- score — similarity between an `inquiry` and a `soul` from 0 to 1
- embedding — vector, tensor; text semantically represented as an array of floats

### AI usage

AI tools were used throughout the project to support development. Specific uses include:

- **Code assistance**: generating boilerplate for NestJS modules, Prisma schema models, and React components; all generated code was reviewed and adapted by the responsible team member.

- **Debugging**: diagnosing TypeScript type errors, Prisma relation issues, and Docker networking problems.

- **Documentation**: drafting this README, the manual testing checklist, and the CHANGELOG; all content was reviewed for accuracy.

All AI-generated content was verified, understood, and owned by the team member who integrated it.

## Team Information

| Member | Role | Responsibilities |
| :--- | :--- | :--- |
| ipetrov | Product Owner, Project Manager, Developer | product, management, infrastructure, docs |
| vvoronts | Lead Developer  | auth, api design, general architecture and services interaction |
| mmaksimo | Developer | UX/UI; services: web, interaction, ledger |
| jichompo| Developer | semantics, embeddings, math core |
| juhtoo-h| Developer | ledger, documentation |

## Project Management

- Work was distributed by layer — frontend, backend, DevOps — with each service owned by one or two members.
- Coordination, planning, and blockers handled by the Project Manager in regular team syncs.
- Communication : Discord, on-site meeting (once a week)
- Project tooling: GitHub (feature branches → pull requests for code review).

## Technical Stack

| Layer | Technology |
| :--- | :--- |
| **frontend** | [React](https://react.dev/) | Client-side interface |
| **gateway** | [Nginx](https://nginx.org/en/docs/) | Reverse proxy & traffic routing |
| **backend** | [Next.js](https://nextjs.org/docs) | Core application server |
| **identity-service** | [FastAPI](https://fastapi.tiangolo.com/), [Python](https://www.python.org)| User management & authentication |
| **interaction-service** | [FastAPI](https://fastapi.tiangolo.com/), [Python](https://www.python.org)| Feature interaction handling |
| **ledger-service** | [FastAPI](https://fastapi.tiangolo.com/), [Python](https://www.python.org) | Wallet & financial logic |
| **semantic-service** | [FastAPI](https://fastapi.tiangolo.com/), [Python](https://www.python.org) | AI / Tensor-based processing |
| **database** | [PostgreSQL](https://www.postgresql.org/docs/) | Persistent data storage |
| **logs** | [ELK Stack](https://www.elastic.co/guide/index.html) | Log aggregation & monitoring |
| **metrics** | [Prometheus](https://prometheus.io/docs/) / [Grafana](https://grafana.com/docs/) | Performance monitoring |

## Justification for major technical choices

- **React** — React offers a massive, stable ecosystem and a component-driven architecture that makes building complex UI states predictable and maintainable.

- **Nginx** — It acts as a high-performance "shield." It excels at reverse proxying, load balancing, and handling SSL termination before traffic ever hits your application code.

- **PostgreSQL** - The gold standard for relational data. It offers ACID compliance, complex query support, and the ability to store unstructured data via JSONB when needed.

- **ELK Stack** - Provides centralized observability. It’s perfect for aggregating, indexing, and performing complex searches across logs from your distributed services.

- **Prometheus/Grafana** - The gold standard for time-series monitoring. Prometheus scrapes your metrics, and Grafana turns them into actionable visualizations and alerts.

## Database Schema

PostgreSQL 16 via Prisma ORM. The full schema lives in [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).

| Model | Table | Description |
| :--- | :--- | :--- |
| `User` | `users` | Identity management, auth, and role=based access control.  |
| `RefreshToken` | `tokens` | Token rotation and revocation state |
| `Apikey` | `api_keys` | Programmatic access and audit logs |
| `Order` | `orders` | Core unit of work; links clients to potential matches |
| `Match` | `matches` | Connects orders to 'insiders' with ranking scores |
| `Insight` | `insights` | The final deliverable; links to orders, matches and ledger |
| `Soul` | `souls` | Represents an "insider" entity, storing their profile text, credibility, and biographical data |
| `Inquiry` | `inquiries` | Represents a client's request, linked to a specific `order_id` and query context. |
| `Score` | `scores` | Junction/Join table quantifying the relationship between a `Soul` and an `Inquiry` using a float-based ranking. |
| `Transaction` | `transactions` | Track the monetary movement (ledger) for an event |
| `Purchase` | `purchases` | The transaction link between client, insider and insight |

### Key relationships

- A `User` is the main data that are 'Client' requesting legends and 'Insider' providing answers.

- The client creates an `Order` containing `Inquiry`.

- The `Soul` table stores insider's data.

- The `Score` matchmakes the fit between `Soul` and `Inquiry`. The `Match` connects the `Inquiry` to top 5 `Soul` with ranking `Score`.

- The `Order` initiate the task and tha `Match`  and the `Insight` serves the final delivery.

- The `Purchase` defines the link between `Insight` and `Transaction` to confirm if the `Transaction` has been done or not.

## Features List

### Frontend Pages (mmaksimo)
- Login / signup pages and the cookie-based session
- The client dashboard (list of orders, order detail, insight cards, unlock flow)
- The insider dashboard (list of matched orders, insight reply form)
- A wallet view, settings view, and a "legend" (insider bio) editor
- The single source of truth for client-side UI state and navigation 

### Identity-Service, Backend (vvronts)
- **Public API** — secured API key, rate limiting, documentation, ≥5 endpoints.
  Identity owns `X-API-Key` auth and per-key rate limiting (429 over the window)
  and forwards each call to the resource owner (orders → interaction, balance →
  ledger, account → local). 5 endpoints; documented via OpenAPI/Swagger.
- **OAuth 2.0 remote authentication (Google).** The web BFF runs the browser flow;
  identity provisions/links the user and mints its own JWT pair.
- **2FA.** TOTP (pyotp) with one-time recovery codes, enforced inline on the
  password grant: a missing/invalid `otp` returns 401 `{"totp_required": true}`
  and the client re-POSTs the same grant with `otp` (single round-trip, no
  challenge cookie).
- **ORM.** SQLAlchemy (async) with Alembic migrations.
- **JWT auth.** RS256 access + refresh tokens; public keys published via JWKS so
  peers verify locally. Refresh rotation with a grace window (tolerates concurrent
  refreshes); logout revokes by `jti`.
- **Credential security.** Passwords hashed with bcrypt; API keys stored as
  SHA-256 digests, never in plaintext.

### Interaction-Service, Backend (vvronts, mmaksimo)
- **Orders** — create, list, get, update, delete.
- **Matches** — bulk create (from the Semantic matcher), list by insider.
- **Insights** — create, list by order, get by id, update (set `transaction_id` when paid).

### Semantic-Service, Backend (jichompo)
- Create a `soul` or `order`. Once received, it will create an object in it's databases, and embed the raw text into `embedding`. 
- **Comparing** - calculate `score` for each `soul`, post an object that contains the top 5 `soul`s to Interaction service.
- **sentence_transformers** - framework to transform and compare embeddings. (Sentence-transformers is a Python framework for state-of-the-art text, image, and audio embeddings. It is widely used for semantic search, retrieval-augmented generation (RAG), clustering, and paraphrase mining.)

### Ledger-Service, Backend (juhtoo-h, mmaksimo)
- **Transaction** - Manage the transactions of the wallet (Deposit/Transfer)
- **Balance** - Maintain the balance in the wallet of each user.
- **Purchase** - Confirm the amount of money that a user has it enough or not, if it is enough, it will make a purchase.

### DevOps (ipetrov)
- **ELK Stack** — Elasticsearch + Logstash + Kibana for log management
- **Prometheus + Grafana** — Monitoring system, collect metrics, configure exporters and integrations, create custom Grafana dashboard, setup alerting rules, secure access to Grafana.
- **Microservices** - Design loosely-coupled services with clear interfaces. Use REST APIs or message queues for communication.


### Internationalization (mmaksimo)

- i18n — react-i18next with EN / RU; all user-facing strings translated; switchable from NavBar and Settings


## Modules

**Total:  points** (14 required to pass).

| Module | Type | Points | Owner |
| :--- | :--- | :--- | :--- |
| Fullstack-framework | Major | 2 | ipetrov, vvoronts, mmaksimo, jichompo, juhtoo-h |
| OAuth | Minor | 1 | vvoronts|
| Public API | Major | 2 | vvoronts |
| 2fa (Two-Factor Authentication) | Minor | 1 | vvoronts |
| Support for additional browser | Minor | 1 | mmaksimo |
| Infrastructure for log management using ELK | Major | 2 | ipetrov |
| Support for multiple languages | Minor | 1 | mmaksimo |
| Monitoring system with Prometheus and Grafana | Major | 2 | ipetrov |
| Microservices | Major | 2 | ipetrov |
| Use an ORM for the database | Minor | 1 | ipetrov |
| Advanced permissions system | Major | 2 | vvoronts |
| **Total** | | ** ** | |

## Justification and implementation

- **Web — Frameworks (react + tailwind-css, Major)** — Provides a structure for the web interface, and managing the architecture across all dashboards.

- **Web (OAuth 2.0 Integration, Minor)** — Implements authentication to support "Sign in with Google".

- **Web — Browser support (Minor)** — tested on Chrome, Firefox with consistent UI/UX.

- **Web — Support for multi languages (i18n, Minor)** — implements a internationalization system to ensure the textes are transalatable.

- **Web - ELK log management (Elasticsearch, Major)** - Using Elasticsearch to store and index logs, Logstach to collect and transform logs, Kibana for visualization and dashboards. Implement log retention and archiving policies and secure to all components.

- **User — 2FA (Minor)** — Implement a complete 2FA (Two-Factor Authentication) system for the users.

- **DevOps — Database with ORM (SQLAlchemy, Minor)** — Abstracts database complextiy.

- **DevOps — Monitoring with Prometheus + Grafana (Major)** — Set up Prometheus to collect metrics, configure exporters and integrations. Create custom Grafana dashboards, set up alerting rules and secure access to Grafana.



## Individual Contributions

### ipetrov (Role - Product Owner, Project Manager, Developer)

#### Contribution

- Backend as microservices
    - Design loosely-coupled services with clear interfaces.
    - Use REST APIs or message queues for communications

- Deployment
    - Store credentials (API keys, environment variables, etc.) in a local .env file that is ignored by Git and provide an .env.example file.

- Logs
    - Infrastructure for log management using ELK (Elasticsearch, Logstach, Kibana)

- Monitoring System with Prometheus and Grafana
    - Set up Prometheus to collect metrics.
    - Configure exporters and integrations.
    - Create custom Grafana dashboards.
    - Set up alerting rules.
    - Secure access to Grafana.


### vvoronts (Role - Lead Developer)

#### Contribution

- Identity Service
    - Handles only user registration, login (JWT generation), and basic profile data. It uses a small PostgreSQL database.
    - **Authentication Data:** Email, hashed password, and MFA settings.
    - **Core Profile:** Username, display name, and bio.
    - **Demographics:** Age/Date of Birth and Location (if needed for matching).
    - **Assets:** URL to their **Avatar** (stored in S3/MinIO, with the link saved in the DB).
    - **Metadata:** Account creation date and "Last Seen" timestamp
    - Implement remote authentication with OAuth2.0 (Google, Github, 42,etc)
    - **Rolebase access control** (tbac in cassdor)
    - **2fa** Implement a complete 2FA (Two-Factor Authentication) system for the users.
    - Create Public API to interact with the database with a secured API key, rate limiting, documentation.

- Interaction Service
    - A FastAPI microservice that owns the **marketplace core**: client orders, insider matches, and the paid insights that insiders write in response to matched orders. It is the only backend service that holds order, match, and insight data.
    - Manages what users are doing on the platform.
    - Creates `orders` from the `clients` and matches with the `insiders`.
    - Manages the `insights` and set `transaction_id` when paid.

#### Challenges



### mmaksimo (Role - Developer)

#### Contribution

- Frontend
    - **Dashboard** (Rendering of client, insider and wallet dashboard)
    - **BFF Pattern** (Acts as a Backend-for-Frontend)
    - **Security** (Multilayer security validation)
    - **Authenticated Page Load**
    - **Cookies** (proxy.ts runs at the edge)

- Interation Service
    - A FastAPI microservice that owns the **marketplace core**: client orders, insider matches, and the paid insights that insiders write in response to matched orders. It is the only backend service that holds order, match, and insight data.
    - Manages what users are doing on the platform.
    - Creates `orders` from the `clients` and matches with the `insiders`.
    - Manages the `insights` and set `transaction_id` when paid.

- Ledger Service
    - Manages the wallet balances and processes the deductions when a Client pays an Insider.
    - Connect with `interaction` service to confirm the purchase has been made or not.

#### Challenges





### jichompo (Role - Developer)

#### Contribution

- Semantic Service
    - Receives raw text (legend/order), processes it through the sentence_transformers and stores the results.
    - The service help the `Interaction` service match the top 5 insiders and the client.

#### Challenges




### juhtoo-h (Role - Developer)

#### Contribution

- Ledger Service
    - Creates the end points in the service.
    - Manages the financial micro-transactions.
    - Manages the wallet balances and processes the deductions when a Client pays an Insider.
    - Connect with `interaction` service to confirm the purchase has been made or not.

- Documentation
    - Implement the global README.md
    - Manage the Terms & Policy of the app
 
#### Challenges



<!-- Actually, legal & Documentation part was supposed to be in the web, upon the sign-up button as a footer-link, The following is the draft version of that. -->

## Legal & Documentation
Detailed policies can be found in the following documents:

* [Privacy Policy](./PRIVACY.md) — How we collect, use, and protect your data.
* [Terms of Service](./TERMS.md) — The rules and conditions for using this platform.

