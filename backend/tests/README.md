# Testing Guide - Coconut Saraih Hotel

This directory contains all test files for the Coconut Saraih Hotel backend and frontend.

## Directory Structure

```
tests/
├── unit/                 # Unit tests
│   ├── models/          # Model tests
│   ├── utils/           # Utility function tests
│   └── services/       # Service layer tests
├── integration/         # Integration tests
│   └── routes/         # API endpoint tests
├── e2e/                # End-to-end tests (Cypress)
│   ├── support/       # Cypress support files
│   └── *.cy.js       # E2E test files
└── helpers/           # Test helper utilities
```

## Prerequisites

- Node.js >= 18.0.0
- MongoDB (running locally or via Docker)
- Redis (for caching tests)

## Installation

The project already has Jest configured. For E2E testing with Cypress:

```bash
# Install Cypress
npm install --save-dev cypress
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:watch

# Run specific unit test file
npm test -- tests/unit/models/Room.test.js
```

### Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test file
npm test -- tests/integration/routes/rooms.test.js
```

### All Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch
```

### E2E Tests (Cypress)

```bash
# Open Cypress Test Runner
npx cypress open

# Run E2E tests in headless mode
npx cypress run

# Run specific E2E test file
npx cypress run --spec "tests/e2e/homepage.cy.js"
```

## Test Configuration

### Jest Configuration

Jest configuration is in `jest.config.js`:
- Test environment: Node.js
- Test pattern: `**/tests/**/*.test.js`
- Coverage directory: `coverage/`

### Cypress Configuration

Cypress configuration is in `tests/e2e/cypress.config.js`:
- Base URL: http://localhost:3000
- Spec pattern: `tests/e2e/**/*.cy.{js,jsx,ts,tsx}`

## Writing Tests

### Unit Tests

```javascript
describe('Module Name', () => {
  it('should do something specific', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Integration Tests

```javascript
describe('API Endpoint', () => {
  it('should return expected response', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);
      
    expect(response.body).toHaveProperty('data');
  });
});
```

### E2E Tests

```javascript
describe('Feature', () => {
  it('should work end-to-end', () => {
    cy.visit('/page');
    cy.get('button').click();
    cy.url().should('include', '/result');
  });
});
```

## Test Helpers

Available in `tests/helpers/index.js`:

- `generateTestToken()` - Generate JWT tokens
- `generateObjectId()` - Create MongoDB ObjectIds
- `createMockRequest()` - Create mock request objects
- `createMockResponse()` - Create mock response objects
- `createTestUser()` - Create test user data
- `createTestRoom()` - Create test room data
- `createTestBooking()` - Create test booking data

## Environment Variables

For testing, set the following environment variables:

```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/coconut-saraih-test
JWT_SECRET=your-test-secret
```

## CI/CD Integration

Tests can be run in CI/CD pipelines:

```bash
# Run tests and generate coverage report
npm test -- --coverage

# Run E2E tests in CI
npx cypress run --config video=false
```

## Troubleshooting

### MongoDB Connection Issues

Ensure MongoDB is running:
```bash
# Start MongoDB via Docker
docker run -d -p 27017:27017 mongo
```

### Port Already in Use

If port 3000 is in use, change the test configuration or kill the process:
```bash
# Find process using port 3000
netstat -ano | findstr :3000
```

### Test Timeouts

Increase timeout in `jest.config.js`:
```javascript
jest: {
  testTimeout: 30000
}
```

## Coverage Reports

After running tests with coverage:
- HTML report: `coverage/lcov-report/index.html`
- LCOV file: `coverage/lcov.info`

## Best Practices

1. **Test File Naming**: Use `.test.js` for Jest, `.cy.js` for Cypress
2. **Describe Blocks**: Use descriptive test names
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Isolation**: Each test should be independent
5. **Mock External Services**: Use mocks for APIs and databases
6. **Clean Up**: Delete test data after tests

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
