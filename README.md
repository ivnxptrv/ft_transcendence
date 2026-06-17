*This project has been created as part of the 42 curriculum by .*

## Description

A matching marketplace connecting "Clients" seeking specific insights with "Insiders" possessing relevant lived experience or expertise. The platform utilizes natural language processing and vector similarity to match client requests with insider profiles, facilitating a micro-transaction economy for authentic human responses.

# Key features:

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

1. `make develop` — builds and starts all services.
2. Open `https://localhost:4009`

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
| Ivan | Product Owner, Project Manager, Developer | product, management, infrastructure, docs |
| Vica | Lead Developer  | auth, api design, general architecture and services interaction |
| Max | Developer | UX/UI; services: web, interaction |
| Jack | Developer | semantics, embeddings, math core |
| Junior | Developer | ledger, documentation |

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

### Justification for major technical choices

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


## Modules

**Total:  points** (14 required to pass).

| Module | Type | Points | Owner |
| :--- | :--- | :--- | :--- |
| Fullstack-framework | Major | 2 |  |
| OAuth | Minor | 1 |  |
| Public API | Major | 2 |  |
| 2fa (Two-Factor Authentication) | Minor | 1 |  |
| Support for additional browser | Minor | 1 |  |
|  Infrastructure for log management using ELK | Major | 2 |  |
| Support for multiple languages | Minor | 1 |  |
| Monitoring system with Prometheus and Grafana | Major | 2 |  |
| Microservices | Major | 2 |  |
| **Total** | | ** ** | |

### Justification and implementation



## Individual Contributions



<!-- Actually, legal & Documentation part was supposed to be in the web, upon the sign-up button, The following is the draft version of that. -->

## Legal & Documentation
This project is open-source and respects user privacy. Detailed policies can be found in the following documents:

* [Privacy Policy](./PRIVACY.md) — How we collect, use, and protect your data.
* [Terms of Service](./TERMS.md) — The rules and conditions for using this platform.

