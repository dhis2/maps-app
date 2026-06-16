import { addLayer } from '../../actions/layers.js'

/**
 * Build and dispatch a thematic (choropleth/bubble) layer config.
 * Mirrors exactly what LayerEdit.jsx does on submit.
 *
 * @param {Function} dispatch - Redux dispatch
 * @returns {(args: Object) => Promise<Object>}
 */
const isValidOrgUnit = (ou) =>
    /^LEVEL-\d+$/.test(ou) ||
    /^USER_ORGUNIT(_CHILDREN|_GRANDCHILDREN)?$/.test(ou) ||
    /^[A-Za-z0-9]{11}$/.test(ou)

const isValidDhis2Uid = (id) => /^[A-Za-z0-9]{11}$/.test(id)

export const makeAddThematicLayer =
    (dispatch, getState) =>
    async ({
        dataItem,
        orgUnits,
        periods,
        thematicMapType = 'CHOROPLETH',
        method = 2,
        classes = 5,
    }) => {
        if (
            !Array.isArray(orgUnits) ||
            orgUnits.length === 0 ||
            !Array.isArray(periods) ||
            periods.length === 0
        ) {
            return {
                success: false,
                message:
                    'You must call resolve_org_units AND resolve_periods first and pass their results. Do not call add_thematic_layer with empty arrays.',
            }
        }

        // Reject hallucinated IDs — the model must call search_data_items and resolve_org_units first
        if (!dataItem?.id || !isValidDhis2Uid(dataItem.id)) {
            return {
                success: false,
                message: `Invalid data item id "${dataItem?.id}". You must call search_data_items first and use the id from its results. DHIS2 ids are exactly 11 alphanumeric characters.`,
            }
        }
        const badOrgUnit = orgUnits.find((ou) => !isValidOrgUnit(ou))
        if (badOrgUnit) {
            return {
                success: false,
                message: `Invalid org unit "${badOrgUnit}". You must call resolve_org_units first and use the items from its results. Valid values are LEVEL-N, USER_ORGUNIT, USER_ORGUNIT_CHILDREN, USER_ORGUNIT_GRANDCHILDREN, or an 11-character DHIS2 id.`,
            }
        }
        // Normalize period ids to correct DHIS2 format and fix common hallucinations
        const normalizePeriodId = (p) => {
            // Strip "P_" prefix some models add (e.g. "P_2023Q1" → "2023Q1")
            let n = p.replace(/^P_/i, '')
            // "2023-Q1" or "2023_Q1" → "2023Q1"
            n = n.replace(/^(\d{4})[-_]Q([1-4])$/i, '$1Q$2')
            // "Q1-2023" or "Q1_2023" or "Q1 2023" → "2023Q1"
            n = n.replace(/^Q([1-4])[-_ ](\d{4})$/i, '$2Q$1')
            // "2023-01" or "2023_01" → "202301" (month)
            n = n.replace(/^(\d{4})[-_](\d{2})$/, '$1$2')
            // Fix common LLM period hallucinations (PREVIOUS_* / CURRENT_* are not valid DHIS2 ids)
            n = n.replace(/^PREVIOUS_YEAR$/i, 'LAST_YEAR')
            n = n.replace(/^CURRENT_YEAR$/i, 'THIS_YEAR')
            n = n.replace(/^PREVIOUS_QUARTER$/i, 'LAST_QUARTER')
            n = n.replace(/^CURRENT_QUARTER$/i, 'THIS_QUARTER')
            n = n.replace(/^PREVIOUS_MONTH$/i, 'LAST_MONTH')
            n = n.replace(/^CURRENT_MONTH$/i, 'THIS_MONTH')
            return n
        }
        const normalizedPeriods = periods.map(normalizePeriodId)

        const dataItemName =
            dataItem.displayName ?? dataItem.name ?? dataItem.id
        const config = {
            layer: 'thematic',
            name: dataItemName,
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
                            name: dataItemName,
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
                    items: normalizedPeriods.map((pe) => ({ id: pe })),
                },
            ],
        }

        const before = getState().map?.mapViews?.map((l) => l.id) ?? []
        dispatch(addLayer(config))
        const after = getState().map?.mapViews ?? []
        const newLayer = after.find((l) => !before.includes(l.id))

        return {
            success: true,
            layerId: newLayer?.id ?? null,
            message: `Added ${thematicMapType.toLowerCase()} layer for ${dataItemName}. Layer id: ${
                newLayer?.id ?? 'unknown'
            }.`,
        }
    }
