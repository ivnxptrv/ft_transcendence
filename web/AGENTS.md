<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# AGENT.md: Coding Standards for Python FastAPI, TypeScript (Next.js, Postgres)

This document provides guidelines to ensure your code is **readable, maintainable, and AI-friendly** for Claude Code and other AI agents working with your stack: **PythonFastAPI, TypeScript (Next.js), and PostgreSQL**.

---

## 📌 **1. Naming Conventions**

| Element   | Python Example         | TypeScript Example   | Notes                                    |
| --------- | ---------------------- | -------------------- | ---------------------------------------- |
| Variables | `user_account_balance` | `userAccountBalance` | Use snake_case (Python) / camelCase (TS) |
| Functions | `calculate_tax()`      | `calculateTax()`     | Verbs for actions, nouns for outputs.    |
| Classes   | `UserProfileManager`   | `UserProfileManager` | PascalCase for classes.                  |
| Constants | `MAX_RETRIES = 3`      | `MAX_RETRIES = 3`    | UPPER_SNAKE_CASE for constants.          |
| Modules   | `data_processing.py`   | `dataProcessing.ts`  | Short, descriptive, all lowercase.       |

**Avoid:**

- `x`, `v`, `T`, `data1` (too vague)
- `get_data()` unless it’s generic (prefer `fetchUserData()`)

---

## 📌 **2. Code Structure & Readability**

### **A. Python FastAPI**

#### **Functions**

- **Single Responsibility:** One function = one task.
- **Small & Focused:** < 20 lines per function.
- **Pure Functions:** Avoid side effects (e.g., modifying globals).

```python
def calculate_total(items: list[dict]) -> float:
    # Calculate the total price of items.
    #
    # Args:
    #     items: List of item dictionaries with a 'price' key.
    #
    # Returns:
    #     float: Total price.
    return sum(item['price'] for item in items)
```

#### **Docstrings**

Use **Google-style** or **NumPy style** for functions/classes.

```python
def fetch_user_data(user_id: int) -> dict:
    # Fetch user data from the database.
    #
    # Args:
    #     user_id: Unique identifier for the user.
    #
    # Returns:
    #     dict: User data as a dictionary.
    #
    # Raises:
    #     UserNotFoundError: If the user does not exist.
    ...
```

#### **Imports**

Group imports logically:

```python
# Standard library
import os
import sys

# Third-party
import numpy as np
import fastapi

# Local
from .utils import validate_input
```

#### **Whitespace**

- 2 blank lines between functions/classes.
- Spaces around operators (`x = y + z`).
- 4-space indentation.

---

### **B. TypeScript (Next.js)**

#### **Functions**

```typescript
function calculateDiscount(price: number, discountRate: number): number {
  return price * (1 - discountRate);
}
```

#### **Interfaces & Types**

```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

function fetchUsers(): User[] {
    ...
}
```

#### **Whitespace**

- 2 blank lines between functions.
- 2-space indentation.

---

## 📌 **3. Error Handling**

### **Python**

- **Avoid bare `except:`** Always catch specific exceptions.
- **Custom Exceptions:** Define exceptions for domain-specific errors.

```python
from fastapi import HTTPException

@app.get("/users/{user_id}")
def get_user(user_id: int):
    try:
        user = db.fetch_user(user_id)
        return user
    except UserNotFoundError:
        raise HTTPException(status_code=404, detail="User not found")
```

### **TypeScript**

```typescript
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
}
```

---

## 📌 **4. Type Hints**

### **Python**

```python
from typing import List, Dict, Optional

def process_users(users: List[Dict[str, str]]) -> Optional[List[int]]:
    # Process a list of user dictionaries.
    if not users:
        return None
    return [user["id"] for user in users]
```

### **TypeScript**

```typescript
function calculateTax(price: number, rate: number): number {
  return price * rate;
}
```

---

## 📌 **5. Logging & Debugging**

### **Python**

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info("Starting data processing...")
    try:
        data = load_data()
    except Exception as e:
        logger.error(f"Failed to load data: {e}")
        raise
```

### **TypeScript (Next.js)**

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

logger.info("Starting API server...");
```

---

## 📌 **6. PostgreSQL Best Practices**

### **Schema Design**

- **Naming:** Use snake_case for tables/columns.
- **Primary Keys:** Always define primary keys.
- **Indexes:** Add indexes for frequently queried columns.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### **Queries**

- **Use Parameterized Queries** to prevent SQL injection.
- **Avoid SELECT \*:** Explicitly list columns.

```python
# ✅ Good
cursor.execute("SELECT id, name FROM users WHERE email = %s", (email,))

# ❌ Bad
cursor.execute("SELECT * FROM users")
```

---

## 📌 **7. FastAPI Specifics**

### **FastAPI**

- **Path Operations:** Use clear, RESTful endpoints.
- **Request Models:** Use Pydantic models for request/response validation.

```python
from pydantic import BaseModel
from fastapi import FastAPI

app = FastAPI()

class UserCreate(BaseModel):
    name: str
    email: str

@app.post("/users/")
def create_user(user: UserCreate):
    # Create a new user.
    db.save_user(user.dict())
    return {"message": "User created"}
```

---

## 📌 **8. Testing**

### **Python**

```python
import pytest

def test_calculate_discount():
    assert calculate_discount(100, 0.1) == 90
```

### **TypeScript**

```typescript
test("calculateDiscount", () => {
  expect(calculateDiscount(100, 0.1)).toBe(90);
});
```

---

## 📌 **9. Version Control**

### **Commit Messages**

- Use **imperative mood**: `"Fix login timeout bug"` (not `"Fixed login timeout"`).
- Include context: `"Update user model to handle null emails (#123)"`.

### **Branching**

- Use feature branches: `feat/add-login`, `fix/header-overflow`.

---

## 📌 **10. Tools to Enforce Standards**

| Tool           | Purpose                         | Usage Example                |
| -------------- | ------------------------------- | ---------------------------- |
| **Black**      | Auto-formatting (PEP 8)         | `black .`                    |
| **Flake8**     | Linting (PEP 8 + custom rules)  | `flake8 src/`                |
| **mypy**       | Static type checking (Python)   | `mypy --strict .`            |
| **ESLint**     | Linting (TypeScript)            | `eslint src/`                |
| **Pre-commit** | Run linters/tests before commit | `pre-commit run --all-files` |

---

## 📌 **11. AI-Specific Tips**

### **Prompting for Clarity**

- **For AI Agents:** Use clear, structured prompts:

  ```markdown
  **Task:** Refactor the `UserManager` class to use dependency injection.
  **Requirements:**

  - Extract database logic into a separate class.
  - Add type hints.
  - Write unit tests for the new `DatabaseClient`.
  ```

- **Avoid Ambiguity:** Specify output format (e.g., "Return a JSON array").

### **Code Generation**

- Specify constraints: "Use SQLAlchemy for the ORM. Do not use raw SQL."
- Provide examples: "The code should match the style of `./examples/good_api.py`."

### **Reviewing AI-Generated Code**

- Check for:
  - Overly complex logic (AI agents sometimes over-engineer).
  - Missing edge cases (e.g., `None` inputs).
  - Performance anti-patterns (e.g., nested loops in Python).

---

## 🔗 **Resources**

- [PEP 8 – Python Style Guide](https://peps.python.org/pep-0008/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/best-practices/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
