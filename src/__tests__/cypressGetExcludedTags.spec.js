import { getExcludedTags } from '../../cypress/support/getExcludedTags.js'
import { minDHIS2Version } from '../../d2.config.js'

const minVersion = parseInt(minDHIS2Version.slice(2))

/*
    If the minVersion is 40, and the instance version 41, then the generated tags
    should be: <40, <=40, <41, >41, >=42, >42, >=43
*/

describe('get excluded Cypress tags', () => {
    test(`instanceVersion 2.${minVersion}`, () => {
        expect(getExcludedTags(`2.${minVersion}`)).toEqual([
            `<${minVersion}`,
            `>${minVersion}`,
            `>=${minVersion + 1}`,
            `>${minVersion + 1}`,
            `>=${minVersion + 2}`,
            `>${minVersion + 2}`,
            `>=${minVersion + 3}`,
        ])
    })

    test(`instanceVersion 2.${minVersion + 1}`, () => {
        expect(getExcludedTags(`${minVersion + 1}`)).toEqual([
            `<=${minVersion}`,
            `<${minVersion}`,
            `<${minVersion + 1}`,
            `>${minVersion + 1}`,
            `>=${minVersion + 2}`,
            `>${minVersion + 2}`,
            `>=${minVersion + 3}`,
        ])
    })

    test(`instanceVersion 2.${minVersion + 2}`, () => {
        expect(getExcludedTags(`${minVersion + 2}`)).toEqual([
            `<=${minVersion}`,
            `<${minVersion}`,
            `<=${minVersion + 1}`,
            `<${minVersion + 1}`,
            `<${minVersion + 2}`,
            `>${minVersion + 2}`,
            `>=${minVersion + 3}`,
        ])
    })

    test(`instanceVersion 2.${minVersion + 3}-SNAPSHOT`, () => {
        expect(getExcludedTags(`${minVersion + 3}-SNAPSHOT`)).toEqual([
            `<=${minVersion}`,
            `<${minVersion}`,
            `<=${minVersion + 1}`,
            `<${minVersion + 1}`,
            `<${minVersion + 2}`,
            `<=${minVersion + 2}`,
            `<${minVersion + 3}`,
        ])
    })

    test('instanceVersion dev', () => {
        expect(getExcludedTags('dev')).toEqual([
            `<=${minVersion}`,
            `<${minVersion}`,
            `<=${minVersion + 1}`,
            `<${minVersion + 1}`,
            `<${minVersion + 2}`,
            `<=${minVersion + 2}`,
            `<${minVersion + 3}`,
        ])
    })

    test(`instanceVersion number 2.${minVersion}`, () => {
        const version = parseFloat(`2.${minVersion}`).toFixed(2)
        expect(getExcludedTags(version)).toEqual([
            `<${minVersion}`,
            `>${minVersion}`,
            `>=${minVersion + 1}`,
            `>${minVersion + 1}`,
            `>=${minVersion + 2}`,
            `>${minVersion + 2}`,
            `>=${minVersion + 3}`,
        ])
    })

    // unexpected argument forms
    test(`instanceVersion ${minVersion}`, () => {
        expect(getExcludedTags(`${minVersion}`)).toEqual([
            `<${minVersion}`,
            `>${minVersion}`,
            `>=${minVersion + 1}`,
            `>${minVersion + 1}`,
            `>=${minVersion + 2}`,
            `>${minVersion + 2}`,
            `>=${minVersion + 3}`,
        ])
    })

    test(`instanceVersion ${minVersion}-SNAPSHOT.2`, () => {
        expect(getExcludedTags(`${minVersion}-SNAPSHOT.2`)).toEqual([
            `<${minVersion}`,
            `>${minVersion}`,
            `>=${minVersion + 1}`,
            `>${minVersion + 1}`,
            `>=${minVersion + 2}`,
            `>${minVersion + 2}`,
            `>=${minVersion + 3}`,
        ])
    })

    test('instanceVersion Dev', () => {
        expect(getExcludedTags('Dev')).toEqual([
            `<=${minVersion}`,
            `<${minVersion}`,
            `<=${minVersion + 1}`,
            `<${minVersion + 1}`,
            `<${minVersion + 2}`,
            `<=${minVersion + 2}`,
            `<${minVersion + 3}`,
        ])
    })

    test(`instanceVersion ${minVersion - 1}`, () => {
        expect(() => {
            getExcludedTags(`2.${minVersion - 1}`)
        }).toThrow()
    })
})
