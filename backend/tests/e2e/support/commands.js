// Custom Cypress Commands

// Command to select element by data attribute
Cypress.Commands.add('getByData', (selector) => {
  return cy.get(`[data-${selector}]`);
});

// Command to select element by text content
Cypress.Commands.add('getByText', (text) => {
  return cy.contains(text);
});

// Command to click element by text
Cypress.Commands.add('clickByText', (text) => {
  return cy.contains(text).click();
});

// Command to assert element contains text
Cypress.Commands.add('assertContains', (selector, text) => {
  return cy.get(selector).should('contain', text);
});

// Command to wait for API response
Cypress.Commands.add('waitForApi', (alias, timeout = 10000) => {
  return cy.wait(alias, { timeout });
});

// Command to check if element is visible
Cypress.Commands.add('shouldBeVisible', (selector) => {
  return cy.get(selector).should('be.visible');
});

// Command to check if element is hidden
Cypress.Commands.add('shouldBeHidden', (selector) => {
  return cy.get(selector).should('not.be.visible');
});

// Command to fill form fields
Cypress.Commands.add('fillForm', (fields) => {
  Object.entries(fields).forEach(([key, value]) => {
    cy.get(`[name="${key}"]`).clear().type(value);
  });
  return cy;
});

// Command to submit form
Cypress.Commands.add('submitForm', (submitButtonSelector = 'button[type="submit"]') => {
  return cy.get(submitButtonSelector).click();
});

// Command to check URL
Cypress.Commands.add('shouldHaveUrl', (url) => {
  return cy.url().should('include', url);
});

// Command to check page title
Cypress.Commands.add('shouldHaveTitle', (title) => {
  return cy.title().should('include', title);
});

// Command to scroll to element
Cypress.Commands.add('scrollToElement', (selector) => {
  return cy.get(selector).scrollIntoView();
});

// Command to simulate keyboard input
Cypress.Commands.add('pressKey', (key) => {
  return cy.get('body').type(key);
});

// Command to clear local storage
Cypress.Commands.add('clearLocalStorage', () => {
  return cy.clearLocalStorage();
});

// Command to set local storage item
Cypress.Commands.add('setLocalStorage', (key, value) => {
  return cy.window().then((win) => {
    win.localStorage.setItem(key, value);
  });
});

// Command to get local storage item
Cypress.Commands.add('getLocalStorage', (key) => {
  return cy.window().then((win) => {
    return win.localStorage.getItem(key);
  });
});

// Command to clear cookies
Cypress.Commands.add('clearCookies', () => {
  return cy.clearCookies();
});

// Command to mock API response
Cypress.Commands.add('mockApiResponse', (method, url, response, statusCode = 200) => {
  return cy.intercept(method, url, {
    statusCode,
    body: response
  });
});

// Command to stub API response
Cypress.Commands.add('stubApiResponse', (method, url, response) => {
  return cy.intercept(method, url, (req) => {
    req.reply(response);
  });
});
