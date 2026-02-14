// E2E Test Support File
// This file runs before each test file

// Import Cypress commands
import './commands';

// Hide fetch/XHR requests from command log unless they fail
const app = window.top;
if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  app.document.head.appendChild(style);
}

// Set up global aliases for common elements
Cypress.Commands.add('getByTestId', (testId) => {
  return cy.get(`[data-test-id="${testId}"]`);
});

Cypress.Commands.add('getByRole', (role, options) => {
  return cy.get(`[role="${role}"]`, options);
});

Cypress.Commands.add('getByLabel', (label) => {
  return cy.get(`[aria-label="${label}"]`);
});

// Custom command to login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.getByTestId('logout-button').click();
});

// Custom command to fill booking form
Cypress.Commands.add('fillBookingForm', (bookingData) => {
  if (bookingData.checkIn) {
    cy.get('input[name="checkIn"]').type(bookingData.checkIn);
  }
  if (bookingData.checkOut) {
    cy.get('input[name="checkOut"]').type(bookingData.checkOut);
  }
  if (bookingData.guestCount) {
    cy.get('input[name="guestCount"]').type(bookingData.guestCount);
  }
  if (bookingData.guestName) {
    cy.get('input[name="guestName"]').type(bookingData.guestName);
  }
  if (bookingData.guestEmail) {
    cy.get('input[name="guestEmail"]').type(bookingData.guestEmail);
  }
  if (bookingData.guestPhone) {
    cy.get('input[name="guestPhone"]').type(bookingData.guestPhone);
  }
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail tests on uncaught exceptions
  // Log them for debugging
  console.error('Uncaught Exception:', err.message);
  return false;
});

// Handle test failures
Cypress.on('fail', (error, runnable) => {
  // Log error details for debugging
  console.error('Test Failed:', error.message);
  throw error;
});
