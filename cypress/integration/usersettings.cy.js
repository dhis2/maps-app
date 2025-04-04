import { ThematicLayer } from '../elements/thematic_layer.js'
import { EXTENDED_TIMEOUT } from '../support/util.js'

const testMap = {
    id: 'ZBjCfSaLSqD',
    name: 'ANC: LLITN coverage district and facility',
    cardTitle: 'ANC LLITN coverage',
}

const interceptRequest = (url, param, where = 'body') => {
    cy.intercept(url, (req) => {
        delete req.headers['if-none-match']
        req.reply((res) => {
            if (where === 'body') {
                res.send({
                    body: {
                        ...res.body,
                        [param.name]: param.value,
                    },
                })
            }
            if (where === 'settings') {
                res.send({
                    body: {
                        ...res.body,
                        settings: {
                            ...res.body.settings,
                            [param.name]: param.value,
                        },
                    },
                })
            }
        })
    })
}
const interceptRequests = (param) => {
    interceptRequest('**userSettings**', param, 'body')
    interceptRequest(
        '**me?fields=authorities,avatar,email,name,settings**',
        param,
        'settings'
    )
    interceptRequest(
        '**me?fields=:all,organisationUnits[id],userGroups[id],userCredentials[:all,!user,userRoles[id]**',
        param,
        'settings'
    )
    interceptRequest(
        '**me?fields=id%2Cusername%2CdisplayName~rename(name)%2Cauthorities%2Csettings%5BkeyAnalysisDisplayProperty%2CkeyUiLocale%5D**',
        param,
        'settings'
    )
}

const interceptLanguage = (keyUiLocale) => {
    const param = { name: 'keyUiLocale', value: keyUiLocale }
    interceptRequests(param)
}

const interceptNameProperty = (keyAnalysisDisplayProperty) => {
    const param = {
        name: 'keyAnalysisDisplayProperty',
        value: keyAnalysisDisplayProperty,
    }
    interceptRequests(param)
    interceptRequest(
        '**systemSettings?key=keyAnalysisRelativePeriod,keyBingMapsApiKey,keyHideDailyPeriods,keyHideWeeklyPeriods,keyHideBiWeeklyPeriods,keyHideMonthlyPeriods,keyHideBiMonthlyPeriods,keyDefaultBaseMap**',
        param, 'body'
    )
}

describe('uses the correct locale', () => {
    it('shows the app in Norwegian', () => {
        interceptLanguage('nb')

        cy.visit(`/?id=${testMap.id}`)
        cy.get('[data-test=layercard]')
            .find('h2')
            .contains(`${testMap.cardTitle}`)
            .should('be.visible')

        cy.containsExact('Fil', EXTENDED_TIMEOUT).should('be.visible')
        cy.contains('File').should('not.exist')
        cy.contains('Last ned').should('be.visible')
        cy.contains('Download').should('not.exist')

        // TODO - updated component, this isn't translated yet
        // cy.contains('Tolkninger').click()
        // cy.getByDataTest('interpretations-list')
        //     .find('.date-section')
        //     .contains('14. mai 2021')
        //     .should('be.visible')
    })
    it('shows the app in English', () => {
        interceptLanguage('en')

        cy.visit(`/?id=${testMap.id}`)
        cy.get('[data-test=layercard]')
            .find('h2')
            .contains(`${testMap.cardTitle}`)
            .should('be.visible')

        cy.contains('File', EXTENDED_TIMEOUT).should('be.visible')
        cy.containsExact('Fil').should('not.exist')
        cy.contains('Last ned').should('not.exist')
        cy.contains('Download').should('be.visible')

        cy.contains('Interpretations and details').click()
        cy.getByDataTest('interpretations-list')
            .find('.date-section')
            .contains('May 14')
            .should('be.visible')
    })
})

describe('uses the correct name property', () => {
    it('shows shortNames', () => {
        interceptNameProperty('shortName')

        cy.visit('/')
        const ThemLayer = new ThematicLayer()
        ThemLayer.openDialog('Thematic')
            .selectIndicatorGroup('ANC')
            .selectIndicator('ANC visit clinical prof')

        ThemLayer.selectItemType('Data element')
            .selectDataElementGroup('Acute Flaccid Paralysis (AFP)')
            .selectDataElement('AFP follow-up')

        cy.get('input[type=radio][value=details]').click()
        ThemLayer.selectDataElementOperand('AFP follow-up 0-11m')
    })
    it('shows names', () => {
        interceptNameProperty('name')

        cy.visit('/')
        const ThemLayer = new ThematicLayer()
        ThemLayer.openDialog('Thematic')
            .selectIndicatorGroup('ANC')
            .selectIndicator('ANC visits per clinical professional')

        ThemLayer.selectItemType('Data element')
            .selectDataElementGroup('Acute Flaccid Paralysis (AFP)')
            .selectDataElement('Acute Flaccid Paralysis (AFP) follow-up')

        cy.get('input[type=radio][value=details]').click()
        ThemLayer.selectDataElementOperand(
            'Acute Flaccid Paralysis (AFP) follow-up 0-11m'
        )
    })
})
