import { ensureProgramOrgUnits, fetchOsmEventsByValue } from '../osmRequests.js'

const createEngine = ({ assigned = [], events = [] } = {}) => ({
    query: jest.fn(async (query) => {
        if (query.orgUnits) {
            return { orgUnits: { organisationUnits: assigned } }
        }
        return { result: { events } }
    }),
    mutate: jest.fn(async () => ({})),
})

describe('osmRequests', () => {
    it('adds only the org units missing from the program', async () => {
        const engine = createEngine({ assigned: [{ id: 'ou1' }] })
        await ensureProgramOrgUnits(engine, 'prg', ['ou1', 'ou2', 'ou2'])

        expect(engine.query.mock.calls[0][0].orgUnits.params.filter).toEqual([
            'id:in:[ou1,ou2]',
            'programs.id:eq:prg',
        ])
        expect(engine.mutate).toHaveBeenCalledWith({
            resource: 'programs/prg/organisationUnits',
            type: 'create',
            data: { additions: [{ id: 'ou2' }] },
        })
    })

    it('writes nothing when all org units are assigned', async () => {
        const engine = createEngine({ assigned: [{ id: 'ou1' }] })
        await ensureProgramOrgUnits(engine, 'prg', ['ou1'])
        expect(engine.mutate).not.toHaveBeenCalled()
    })

    it('looks up OSM ids unescaped, joined and in chunks of 100', async () => {
        const engine = createEngine()
        const values = Array.from({ length: 150 }, (_, i) => `node/${i}`)
        await fetchOsmEventsByValue(engine, {
            programId: 'prg',
            dataElement: 'de',
            values,
        })

        const filters = engine.query.mock.calls.map(
            ([query]) => query.result.params.filter
        )
        expect(filters).toHaveLength(2)
        expect(filters[0].startsWith('de:in:node/0;node/1;')).toBe(true)
        expect(filters[1]).toBe(`de:in:${values.slice(100).join(';')}`)
        expect(engine.query.mock.calls[0][0].result.params).toMatchObject({
            orgUnitMode: 'ACCESSIBLE',
            program: 'prg',
        })
        expect(
            engine.query.mock.calls[0][0].result.params.orgUnit
        ).toBeUndefined()
    })
})
