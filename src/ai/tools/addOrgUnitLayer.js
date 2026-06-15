import { addLayer } from '../../actions/layers.js'

/**
 * @param {Function} dispatch - Redux dispatch
 * @returns {(args: Object) => Promise<Object>}
 */
export const makeAddOrgUnitLayer =
    (dispatch) =>
    async ({ orgUnits, organisationUnitGroupSetId }) => {
        const config = {
            layer: 'orgUnit',
            name: 'Organisation units',
            isLoaded: false,
            isLoading: false,
            editCounter: 0,
            backupPeriodsDates: undefined,
            rows: [
                {
                    dimension: 'ou',
                    items: orgUnits.map((ou) => ({ id: ou })),
                },
            ],
            ...(organisationUnitGroupSetId && {
                organisationUnitGroupSet: { id: organisationUnitGroupSetId },
            }),
        }

        dispatch(addLayer(config))

        return {
            success: true,
            message: `Added org unit / boundaries layer.`,
        }
    }
