import { addLayer } from '../../actions/layers.js'

/**
 * Build and dispatch a thematic (choropleth/bubble) layer config.
 * Mirrors exactly what LayerEdit.jsx does on submit.
 *
 * @param {Function} dispatch - Redux dispatch
 * @returns {(args: Object) => Promise<Object>}
 */
export const makeAddThematicLayer =
    (dispatch) =>
    async ({
        dataItem,
        orgUnits,
        periods,
        thematicMapType = 'CHOROPLETH',
        method = 2,
        classes = 5,
    }) => {
        if (!Array.isArray(orgUnits) || !Array.isArray(periods)) {
            return {
                success: false,
                message:
                    'orgUnits and periods must be resolved arrays before calling add_thematic_layer.',
            }
        }
        const config = {
            layer: 'thematic',
            name: dataItem.name ?? dataItem.id,
            thematicMapType,
            method,
            classes,
            isLoaded: false,
            isLoading: false,
            editCounter: 0,
            backupPeriodsDates: undefined,
            columns: [
                {
                    dimension: 'dx',
                    items: [
                        {
                            id: dataItem.id,
                            name: dataItem.name ?? dataItem.id,
                            dimensionItemType: dataItem.dimensionItemType,
                        },
                    ],
                },
            ],
            rows: [
                {
                    dimension: 'ou',
                    items: orgUnits.map((ou) => ({ id: ou })),
                },
            ],
            filters: [
                {
                    dimension: 'pe',
                    items: periods.map((pe) => ({ id: pe })),
                },
            ],
        }

        dispatch(addLayer(config))

        return {
            success: true,
            message: `Added ${thematicMapType.toLowerCase()} layer for ${
                dataItem.name ?? dataItem.id
            }.`,
        }
    }
