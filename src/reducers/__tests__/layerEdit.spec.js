import * as types from '../../constants/actionTypes.js'
import layerEdit from '../layerEdit.js'

describe('layerEdit reducer', () => {
    it('keeps countEventsOutsideOrgUnits and countFeaturesWithoutCoordinates when the program changes', () => {
        const state = {
            countEventsOutsideOrgUnits: true,
            countFeaturesWithoutCoordinates: true,
        }

        const result = layerEdit(state, {
            type: types.LAYER_EDIT_PROGRAM_SET,
            program: { id: 'prog1' },
        })

        expect(result.countEventsOutsideOrgUnits).toBe(true)
        expect(result.countFeaturesWithoutCoordinates).toBe(true)
    })

    it('keeps countEventsOutsideOrgUnits and countFeaturesWithoutCoordinates when the program stage changes', () => {
        const state = {
            countEventsOutsideOrgUnits: true,
            countFeaturesWithoutCoordinates: true,
        }

        const result = layerEdit(state, {
            type: types.LAYER_EDIT_PROGRAM_STAGE_SET,
            programStage: { id: 'stage1' },
        })

        expect(result.countEventsOutsideOrgUnits).toBe(true)
        expect(result.countFeaturesWithoutCoordinates).toBe(true)
    })
})
