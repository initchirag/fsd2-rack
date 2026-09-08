# PostScheduler API

A Spring Boot REST API for scheduling and managing social media posts.
Built as part of lab experiments covering REST API design, global exception handling, and structured logging.

---

## Experiments Covered

| Experiment | Topic |
|---|---|
| 2.1.1 | RESTful API Design with Spring Boot — CRUD, Bean Validation, CORS, Standardized Responses |
| 2.1.2 | Global Exception Handling, Filters, Interceptors, Correlation ID Logging |

---

## Tech Stack

- Java 17
- Spring Boot 3.2
- Spring Data JPA
- H2 In-Memory Database
- Spring Validation (Bean Validation)
- SLF4J + Logback

---

## Project Structure

```
src/main/java/com/lab/postscheduler/
├── controller/       → HTTP layer — handles requests, returns responses
├── service/          → Business logic
├── repository/       → Database access (Spring Data JPA)
├── model/            → Post entity (JPA)
├── dto/              → Request and response objects
├── response/         → ApiResponse wrapper, ErrorDetail
├── exception/        → Custom exceptions + @ControllerAdvice global handler
├── filter/           → CorrelationIdFilter, RequestLoggingInterceptor
└── config/           → CORS, WebMvc, DataSeeder
```

---

## Running the Project

**Prerequisites:** Java 17+, Maven

```bash
mvn spring-boot:run
```

Server starts at `http://localhost:8080`

---

## API Endpoints

Base URL: `/api/v1/posts`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/posts` | Get all posts (filter by `?status=` or `?platform=`) |
| GET | `/posts/{id}` | Get post by ID |
| POST | `/posts` | Create a new post |
| PUT | `/posts/{id}` | Update a post |
| DELETE | `/posts/{id}` | Delete a post |
| GET | `/posts/due` | Posts past their scheduled time |
| GET | `/posts/range?from=&to=` | Posts scheduled within a date range |

### Example Request — Create Post

```json
POST /api/v1/posts
Content-Type: application/json

{
  "title": "Product launch thread",
  "content": "We are live!",
  "platform": "TWITTER",
  "status": "SCHEDULED",
  "scheduledAt": "2026-12-01T10:00:00"
}
```

### Example Response

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": 5,
    "title": "Product launch thread",
    "platform": "TWITTER",
    "status": "SCHEDULED",
    "scheduledAt": "2026-12-01T10:00:00",
    "createdAt": "2026-09-08T14:32:01"
  },
  "timestamp": "2026-09-08T14:32:01",
  "correlationId": "A3F9C2B1"
}
```

### Validation Error Response (400)

```json
{
  "success": false,
  "message": "Invalid request data",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "fieldErrors": {
      "title": "Title must not be blank"
    }
  }
}
```

---

## Supported Values

**Platform:** `TWITTER` `INSTAGRAM` `LINKEDIN` `YOUTUBE`

**Status:** `DRAFT` `SCHEDULED` `PUBLISHED`

---

## Testing

### H2 Database Console

```
URL:      http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:postschedulerdb
Username: sa
Password: (leave blank)
```

4 sample posts are seeded automatically on startup.

### Postman

Import `postman_collection.json` from the project root. Contains pre-built requests for all endpoints including error cases.

---

## Key Concepts Demonstrated

**Exp 2.1.1**
- Layered architecture — Controller → Service → Repository
- Bean Validation with `@NotBlank`, `@Size`, `@NotNull` on request DTOs
- Standardized `ApiResponse<T>` wrapper on all endpoints
- CORS configured for React frontend on `localhost:3000` and `localhost:5173`

**Exp 2.1.2**
- `@ControllerAdvice` in `GlobalExceptionHandler` — one place handles all exceptions
- Custom exceptions — `PostNotFoundException` (404), `InvalidScheduleException` (422)
- `CorrelationIdFilter` — assigns a unique ID to every request, injects it into MDC so it appears in every log line for that request
- `RequestLoggingInterceptor` — logs the resolved handler after Spring routing
- Correlation ID echoed back in `X-Correlation-ID` response header

---

## Author

Karan — B.E. Cyber Security, Chandigarh University
