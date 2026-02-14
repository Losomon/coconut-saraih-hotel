describe('Hotel Homepage E2E Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
  });

  describe('Homepage Loading', () => {
    it('should load the homepage successfully', () => {
      cy.url().should('include', 'index.html');
      cy.get('body').should('be.visible');
    });

    it('should display the hotel name', () => {
      cy.get('header').should('contain', 'Coconut Saraih');
    });

    it('should have a working navigation menu', () => {
      // Check navigation links exist
      cy.get('nav').within(() => {
        cy.get('a').should('have.length.greaterThan', 0);
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to rooms page', () => {
      cy.get('nav').contains('Rooms').click();
      cy.url().should('include', 'rooms.html');
    });

    it('should navigate to restaurant page', () => {
      cy.get('nav').contains('Restaurant').click();
      cy.url().should('include', 'restaurant');
    });

    it('should navigate to activities page', () => {
      cy.get('nav').contains('Activities').click();
      cy.url().should('include', 'activities.html');
    });

    it('should navigate to contact page', () => {
      cy.get('nav').contains('Contact').click();
      cy.url().should('include', 'contact.html');
    });
  });

  describe('Hero Section', () => {
    it('should display hero section', () => {
      cy.get('.hero, [class*="hero"]').should('exist');
    });

    it('should have a call-to-action button', () => {
      cy.get('.hero, [class*="hero"]')
        .find('button, a')
        .first()
        .should('be.visible');
    });
  });

  describe('Footer', () => {
    it('should display footer', () => {
      cy.get('footer').should('be.visible');
    });

    it('should have copyright text', () => {
      cy.get('footer').should('contain', '©');
    });
  });
});

describe('Rooms Page E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/rooms.html');
  });

  describe('Rooms Page Loading', () => {
    it('should load the rooms page', () => {
      cy.url().should('include', 'rooms.html');
      cy.get('body').should('be.visible');
    });

    it('should display room listings', () => {
      cy.get('[class*="room"]').should('exist');
    });
  });

  describe('Room Filters', () => {
    it('should have room type filter', () => {
      cy.get('select[name="roomType"], [class*="filter"]').should('exist');
    });

    it('should have price range filter', () => {
      cy.get('input[type="number"], [class*="filter"]').should('exist');
    });
  });

  describe('Room Cards', () => {
    it('should display room images', () => {
      cy.get('[class*="room"] img').should('exist');
    });

    it('should display room prices', () => {
      cy.get('[class*="room"]').within(() => {
        cy.get('[class*="price"]').should('exist');
      });
    });

    it('should have book now button', () => {
      cy.get('[class*="room"]').within(() => {
        cy.get('button, a').contains(/book|reserve/i).should('exist');
      });
    });
  });
});
