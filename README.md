# health-service

A lightweight, framework-independent health check library for Node.js.

`health-service` provides a simple, extensible way to expose application health endpoints for databases, caches, message queues, external APIs, and other dependencies. It is built on the native Node.js HTTP module and can be used with Express, Fastify, Koa, NestJS, or plain Node.js servers.

## Features

- Simple `HealthChecker` interface
- Aggregate multiple health checks
- Hierarchical health status
- Custom error serialization
- Lightweight with zero runtime dependencies
- Framework independent
- Native HTTP controller
- Easy to extend
- TypeScript support

---

## Installation

```bash
npm install health-service
```

or

```bash
yarn add health-service
```

---


## Examples:
- [rabbitmq-sample](https://github.com/typescript-tutorial/rabbitmq-sample): An example to consume message from rabbitmq.
- [activemq-sample](https://github.com/typescript-tutorial/activemq-sample): An example to consume message from activemq.
- [pubsub-sample](https://github.com/typescript-tutorial/pubsub-sample): An example to consume message from pubsub.
- [ibmmq-sample](https://github.com/typescript-tutorial/ibmmq-sample): An example to consume message from ibmmq.
- [kafka-sample](https://github.com/typescript-tutorial/kafka-sample): An example to consume message from kafka.
- [nats-sample](https://github.com/typescript-tutorial/nats-sample): An example to consume message from nats.
- [sqs-sample](https://github.com/typescript-tutorial/sqs-sample): An example to consume message from AWS sqs.

---

## Quick Example

```typescript
import { createServer } from "http";
import { HealthChecker, HealthController, AnyMap } from "health-service";

class DatabaseChecker implements HealthChecker {
  name(): string {
    return "database";
  }

  async check(): Promise<AnyMap> {
    // verify database connection

    return {
      version: "MySQL 8.0",
      latency: 12
    };
  }

  build(data: AnyMap, err: any): AnyMap {
    return {
      message: err.message
    };
  }
}

const controller = new HealthController([
  new DatabaseChecker()
]);

const server = createServer(controller.check);

server.listen(3000);
```

Visiting

```
GET /health
```

returns

```json
{
  "status": "UP",
  "details": {
    "database": {
      "status": "UP",
      "data": {
        "version": "MySQL 8.0",
        "latency": 12
      }
    }
  }
}
```

---

# Architecture

```
                HTTP Request
                      │
                      ▼
              HealthController
                      │
                      ▼
               check(checkers)
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
MySQLChecker    RedisChecker    RabbitMQChecker
      │               │                │
      └───────────────┼────────────────┘
                      ▼
            Combined Health Result
                      │
                      ▼
              JSON HTTP Response
```

---

# Health Model

The library returns a hierarchical health object.

```typescript
interface Health {
    status: "UP" | "DOWN";
    data?: AnyMap;
    details?: HealthMap;
}
```

Example

```json
{
  "status": "DOWN",
  "details": {
    "database": {
      "status": "UP"
    },
    "redis": {
      "status": "DOWN",
      "data": {
        "message": "Connection timeout"
      }
    }
  }
}
```

---

# Creating a Health Checker

Every component implements the `HealthChecker` interface.

```typescript
export interface HealthChecker {
    name(): string;
    check(): Promise<AnyMap>;
    build(data: AnyMap, error: any): AnyMap;
}
```

## name()

Returns the checker name.

```typescript
name() {
    return "database";
}
```

The name becomes the key inside `details`.

---

## check()

Returns application-specific health information.

```typescript
async check() {
    return {
        version: "8.0",
        latency: 10
    };
}
```

Throw an exception when the component is unavailable.

```typescript
async check() {
    throw new Error("Database unavailable");
}
```

---

## build()

Converts exceptions into JSON.

```typescript
build(data, err) {
    return {
        message: err.message
    };
}
```

This allows applications to expose only the information they choose.

---

# Multiple Checkers

Health checks are automatically aggregated.

```typescript
const controller = new HealthController([
    new DatabaseChecker(),
    new RedisChecker(),
    new RabbitMQChecker()
]);
```

Result

```json
{
  "status": "UP",
  "details": {
    "database": {
      "status": "UP"
    },
    "redis": {
      "status": "UP"
    },
    "rabbitmq": {
      "status": "UP"
    }
  }
}
```

If any checker fails, the overall status becomes

```json
{
    "status":"DOWN"
}
```

while successful checkers still appear in the response.

---

# Supported Use Cases

Health checks can be implemented for

- MySQL
- PostgreSQL
- Oracle
- SQL Server
- MongoDB
- Redis
- RabbitMQ
- Kafka
- Elasticsearch
- REST APIs
- gRPC services
- File systems
- Disk space
- Memory
- Custom services

---

# HTTP Response

Healthy

```
HTTP 200
```

```json
{
    "status":"UP"
}
```

Unhealthy

```
HTTP 500
```

```json
{
    "status":"DOWN"
}
```

---

# Why health-service?

Many applications need a health endpoint for monitoring systems such as Kubernetes, Docker, cloud load balancers, and observability platforms.

`health-service` focuses on providing this functionality with minimal complexity.

Unlike framework-specific solutions, it has no dependency on Express, Fastify, NestJS, or Koa. The same health check implementation can be reused across different Node.js frameworks.

---

# Design Principles

- Framework independent
- Minimal API surface
- Simple extension model
- Single responsibility
- Type-safe
- Zero runtime dependencies
- Production friendly
 
---

# Related Projects

This library is part of the **core-ts** ecosystem.

- **config-plus** — Configuration management
- **validation-core** — Data validation
- **security-express** — Authorization middleware
- **authentication-express** — Authentication middleware
- **express-jsonwebtoken** — JWT verification
- **authen-service** — Authentication service
- **password-service** — Password management
- **signup-service** — User registration
- **sql-core** — Database abstraction and repository framework
- **mysql2-core** — MySQL adapter for sql-core
- **io-one** — Streaming import/export utilities

---

# License

MIT