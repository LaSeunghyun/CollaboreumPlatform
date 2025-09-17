describe('Login Flow', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should display login form', () => {
        cy.get('[data-testid="login-form"]').should('be.visible');
        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="password"]').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
        cy.get('button[type="submit"]').click();
        cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('should login with valid credentials', () => {
        cy.get('input[type="email"]').type('test@example.com');
        cy.get('input[type="password"]').type('password123');
        cy.get('button[type="submit"]').click();

        // Assuming successful login redirects to dashboard
        cy.url().should('include', '/dashboard');
    });
});
