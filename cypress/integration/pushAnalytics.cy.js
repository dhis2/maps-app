describe('push-analytics', () => {
    it(['>=41'], 'has a push-analytics.json file', () => {
        cy.visit('/')
        cy.request('push-analytics.json').as('file')

        cy.get('@file').should((response) => {
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('version')
            expect(response.body).to.have.property('showVisualization')
            expect(response.body).to.have.property('triggerDownload')
            expect(response.body).to.have.property('obtainDownloadArtifact')
            expect(response.body).to.have.property('clearVisualization')
        })
    })
    /* The Push Analytics service produces a map artefact using the exact
     * same process as is verified in `mapDownload.cy.js`, so no further
     * tests are required here. */
})
