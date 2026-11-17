# ADR-002: Mock Vendor API Selection

- **Status:** Accepted
- **Owner:** Vick Tahil
- **Deciders:** Vick Tahil
- **Date created:** 17 November 2026
- **Date decided:** 17 November 2026
- **Date updated:** 17 November 2026

## Context

The Commission Quote application requires integration with a third-party vendor API that is currently unavailable.

A mock API is required to support development and testing until the actual vendor API becomes available. The mock must implement the agreed contract, enforce API-key authentication, calculate responses based on request data and simulate intermittent failures.

Rather than developing and maintaining a custom API service, existing API mocking solutions should be considered to minimise implementation effort.

The selected approach should also support ongoing development and testing as the application evolves into a production system.

## Requirements

### Functional Requirements

| ID | Requirement | Description |
|---|---|---|
| FR-01 | HTTP API | Expose an HTTP endpoint for generating commission quotes. |
| FR-02 | API contract | Accept `loanAmount`, `loanTermInMonths`, `riskBand` (LOW, MEDIUM, HIGH), and return `quoteId`, `commissionRate`, `totalCommission`. |
| FR-03 | Configurable response rules | Support basic calculations and conditional rules to generate responses based on request data. |
| FR-04 | API-key authentication | Require a valid `api-key` header and reject unauthorised requests. |
| FR-05 | Failure simulation | Occasionally return random errors to simulate external service failures. |

### Non-Functional Requirements

| ID | Requirement | Description |
|---|---|---|
| NFR-01 | Minimal implementation effort | Prefer existing solutions and configuration over custom development. |
| NFR-02 | Reproducibility | The mock must be straightforward to configure, run and reproduce in different environments. |
| NFR-03 | Testability | Support deterministic testing of successful requests, authentication and failure scenarios. |
| NFR-04 | Extensibility | Support evolving integration and testing requirements as the application becomes a production system. |
| NFR-05 | Maintainability | Prefer established, actively maintained solutions with good documentation and support. |

## Principles

- Reuse existing capabilities rather than building unnecessary infrastructure.
- Keep the mock independent of application business logic.
- Prefer configuration that can be version-controlled and reproduced.
- Avoid dependencies on external services where they introduce unnecessary development or testing risk.
- Keep the implementation proportionate to the challenge requirements.

## Options

### Option 1: Mockoon

[Mockoon](https://mockoon.com/)

Open-source API mocking software supporting locally hosted mock APIs, request matching, dynamic response templates, conditional rules and failure simulation.

**Pros**

- No custom API server development required.
- Visual interface for configuring endpoints and responses.
- Dynamic templating supports conditional logic and calculations.
- Mock definitions can be stored in source control.
- CLI supports local execution and automated environments.
- No reliance on a hosted third-party service during development.

**Cons**

- Complex response rules can be harder to maintain than ordinary code.
- Random-response mode bypasses response-matching rules, complicating authentication combined with random failures.
- Requires a separate local process.
- Must verify that templated failure simulation and authentication work together correctly.

### Option 2: Beeceptor

[Beeceptor](https://beeceptor.com/)

Hosted API mocking platform supporting request matching, dynamic response templates, calculations and weighted random responses.

**Pros**

- Minimal setup and no local server required.
- Supports dynamic response generation and conditional rules.
- Supports weighted random failure responses.
- Provides request inspection and debugging tools.

**Cons**

- Dependent on an external hosted service.
- Free-tier limits and endpoint access restrictions.
- Mock configuration must be exported or otherwise made reproducible.
- Less control over service availability and lifecycle during the interview.

### Option 3: Postman Mock Servers

[Postman](https://www.postman.com/product/mock-servers/)

API mocking capabilities supporting predefined responses and programmable JavaScript-based mocks.

**Pros**

- Established API development platform.
- Integrates with API collections and testing workflows.
- Code-based mocks support dynamic behaviour.
- Can be incorporated into existing API development processes.

**Cons**

- Traditional example-based mocks are limited for calculated responses.
- Programmable hosted mocks require an eligible paid plan.
- Additional tooling and configuration may be required.
- Less compelling if Postman is not already part of the development workflow.

### Option 4: Custom HTTP Implementation

Implement the mock through Next.js Route Handlers or a lightweight Node.js HTTP framework.

**Pros**

- Complete control over authentication, calculations and simulated failures.
- Straightforward automated testing.
- No specialised API mocking platform required.
- Business rules can be expressed directly in TypeScript.

**Cons**

- Requires custom implementation and maintenance.
- Additional code for routing, validation and failure handling.
- More development effort than a suitable configuration-driven solution.

## Considerations

| Criteria | Mockoon | Beeceptor | Postman | Custom HTTP |
|---|---|---|---|---|
| Minimal custom development | High | High | Medium | Low |
| Dynamic response rules | Yes | Yes | Programmable mocks | Yes |
| API-key validation | Configurable | Configurable | Programmable mocks | Yes |
| Random failures | Supported, with rule constraints | Weighted responses | Programmable mocks | Yes |
| Reproducible from repository | Yes | Configuration export required | Yes, with local code mocks | Yes |
| Independent of hosted service | Yes | No | Local mode only | Yes |
| Extensibility | Good for API simulation | Good for API simulation | Good | High |

The main distinction is between a **configuration-driven mock**, which reduces initial development effort, and a **custom implementation**, which offers greater flexibility for complex future behaviour.

A mock does not need to become the production vendor service. It must remain useful for development and testing while allowing the application to transition to the actual vendor API.

## Preferred Option

**Option 1: Mockoon — provisional preference.**

Mockoon offers a suitable balance of configuration-driven development, reproducibility, local execution and extensibility.

Its ability to store the mock definition in source control and run it through a CLI makes it attractive for the coding challenge and subsequent live pair-programming session.

However, Mockoon's random-response mode ignores response-matching rules. Before confirming the selection, the combined authentication, dynamic calculation and random failure requirements must be demonstrated using conditional response templates or another supported configuration.

Beeceptor is a strong alternative where hosted convenience takes priority over local reproducibility.

A custom HTTP implementation remains the fallback if the mocking platforms require more configuration or workarounds than implementing the behaviour directly.

## Selected Option
**Option 1: Mockoon — provisional selection.**
Spike verified that Mockoon can implement the agreed contract, enforce API-key validation, calculate responses based on request data and simulate random failures. The mock configuration can be stored in the repository and executed through the CLI.


## Next Steps

1. Configure a minimal Mockoon endpoint implementing the agreed contract.
2. Verify API-key validation, dynamic calculations and random failure simulation together.
3. Confirm that success and failure scenarios can be tested deterministically.
4. Store the mock configuration in the repository and verify CLI execution.
5. Confirm Mockoon or select the simplest alternative if the requirements cannot be met cleanly.

## References

- [Mockoon documentation](https://mockoon.com/docs/latest/)
- [Mockoon response rules](https://mockoon.com/docs/latest/route-responses/dynamic-rules/)
- [Mockoon CLI](https://github.com/mockoon/mockoon/tree/main/packages/cli)
- [Beeceptor documentation](https://beeceptor.com/docs/)
- [Postman mock server documentation](https://learning.postman.com/docs/design-apis/mock-apis/overview/)