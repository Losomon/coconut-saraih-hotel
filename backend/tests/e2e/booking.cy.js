describe('Booking Flow E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/rooms.html');
  });

  describe('Room Selection', () => {
    it('should select a room', () => {
      // Wait for rooms to load
      cy.get('[class*="room"]').first().within(() => {
        cy.get('button, a').contains(/book|reserve|view/i).click();
      });
    });
  });

  describe('Booking Form', () => {
    beforeEach(() => {
      // Navigate to room details or booking page
      cy.visit('/room-details.html');
    });

    it('should display booking form', () => {
      cy.get('form').should('exist');
    });

    it('should have check-in date field', () => {
      cy.get('input[name="checkIn"], input[type="date"]').should('exist');
    });

    it('should have check-out date field', () => {
      cy.get('input[name="checkOut"], input[type="date"]').should('exist');
    });

    it('should have guest count field', () => {
      cy.get('input[name="guestCount"], input[type="number"]').should('exist');
    });

    it('should have guest name field', () => {
      cy.get('input[name="guestName"]').should('exist');
    });

    it('should have guest email field', () => {
      cy.get('input[name="guestEmail"]').should('exist');
    });

    it('should have guest phone field', () => {
      cy.get('input[name="guestPhone"]').should('exist');
    });

    it('should validate required fields', () => {
      cy.get('button[type="submit"]').click();
      cy.get('input:invalid').should('have.length.greaterThan', 0);
    });
  });

  describe('Booking Submission', () => {
    it('should show price calculation', () => {
      cy.get('[class*="total"], [class*="price"]').should('exist');
    });

    it('should have payment options', () => {
      cy.get('[name="paymentMethod"], [class*="payment"]').should('exist');
    });
  });
});

describe('Cart Functionality E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/cart.html');
  });

  describe('Cart Page', () => {
    it('should load cart page', () => {
      cy.url().should('include', 'cart.html');
    });

    it('should display cart items or empty message', () => {
      const body = cy.get('body');
      body.should('contain.html', 'class="cart-item"').or.should('contain', 'empty');
    });
  });

  describe('Cart Actions', () => {
    it('should have checkout button', () => {
      cy.get('button, a').contains(/checkout|proceed/i).should('exist');
    });

    it('should have clear cart option', () => {
      cy.get('button').contains(/clear|remove|delete/i).should('exist');
    });
  });
});

describe('Contact Form E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/contact.html');
  });

  describe('Contact Form', () => {
    it('should display contact form', () => {
      cy.get('form').should('exist');
    });

    it('should have name field', () => {
      cy.get('input[name="name"]').should('exist');
    });

    it('should have email field', () => {
      cy.get('input[name="email"], input[type="email"]').should('exist');
    });

    it('should have message field', () => {
      cy.get('textarea[name="message"]').should('exist');
    });

    it('should validate email format', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      cy.get('input[name="email"]:invalid').should('exist');
    });

    it('should submit contact form', () => {
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('textarea[name="message"]').type('Test message');
      cy.get('button[type="submit"]').click();
      
      // Should show success message or redirect
      cy.get('[class*="success"], [class*="alert"]').should('exist');
    });
  });
});
