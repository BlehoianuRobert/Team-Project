describe('Catalog și navigare', () => {

    it('Catalogul afișează produse', () => {
        cy.visit('/products')
        cy.contains('Catalog Produse').should('be.visible')
        cy.get('img').should('have.length.greaterThan', 0)
    })

    it('Click pe produs deschide pagina de detalii', () => {
        cy.visit('/products')
        cy.contains('Stecher incarcator HAMA').click()
        cy.url().should('include', '/products/')
    })

    it('Acces la închirieri fără autentificare redirectează', () => {
        cy.visit('/my-rentals')
        cy.url().should('not.include', '/my-rentals')
    })

})