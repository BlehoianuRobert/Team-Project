describe('Autentificare', () => {

    it('Login cu credențiale valide', () => {
        cy.visit('/login')
        cy.get('input[type="text"], input[name="username"]').first().type('robert_blehoianu')
        cy.get('input[type="password"]').type('12345678')
        cy.get('button[type="submit"]').click()
        cy.url().should('not.include', '/login')
    })

    it('Login cu parolă greșită', () => {
        cy.visit('/login')
        cy.get('input[type="text"], input[name="username"]').first().type('robert_blehoianu')
        cy.get('input[type="password"]').type('parolaGresita123')
        cy.get('button[type="submit"]').click()
        cy.url().should('include', '/login')
    })

    it('Pagina principală se încarcă', () => {
        cy.visit('/')
        cy.contains('Catalog').should('be.visible')
    })

})