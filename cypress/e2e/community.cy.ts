describe('Community Features', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then(win => {
      win.localStorage.setItem('token', 'mock-jwt-token');
    });
    cy.visit('/community');
  });

  it('should display community posts list', () => {
    cy.get('[data-testid="community-posts"]').should('be.visible');
    cy.get('[data-testid="post-item"]').should('have.length.greaterThan', 0);
  });

  it('should allow creating new post', () => {
    cy.get('[data-testid="create-post-button"]').click();
    cy.get('[data-testid="post-form"]').should('be.visible');

    cy.get('input[name="title"]').type('Test Post Title');
    cy.get('textarea[name="content"]').type('This is a test post content');
    cy.get('select[name="category"]').select('general');

    cy.get('button[type="submit"]').click();

    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should allow filtering posts by category', () => {
    cy.get('[data-testid="category-filter"]').select('music');
    cy.get('[data-testid="post-item"]').each($el => {
      cy.wrap($el).should('contain', 'music');
    });
  });
});
