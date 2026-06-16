import { addLayer } from '../../actions/layers.js'

/**
 * @param {Function} dispatch - Redux dispatch
 * @returns {(args: Object) => Promise<Object>}
 */
const isValidOrgUnit = (ou) =>
    /^LEVEL-\d+$/.test(ou) ||
    /^USER_ORGUNIT(_CHILDREN|_GRANDCHILDREN)?$/.test(ou) ||
    /^[A-Za-z0-9]{11}$/.test(ou)

export const makeAddFacilityLayer =
    (dispatch, getState) =>
    async ({ orgUnits, organisationUnitGroupSetId }) => {
        const badOrgUnit = orgUnits?.find((ou) => !isValidOrgUnit(ou))
        if (badOrgUnit) {
            return {
                success: false,
                message: `Invalid org unit "${badOrgUnit}". Call resolve_org_units first and use the items from its results.`,
            }
        }
        const config = {
            layer: 'facility',
            name: 'Facilities',
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

        const before = getState().map?.mapViews?.map((l) => l.id) ?? []
        dispatch(addLayer(config))
        const newLayer = getState().map?.mapViews?.find(
            (l) => !before.includes(l.id)
        )

        return {
            success: true,
            layerId: newLayer?.id ?? null,
            message: `Added facility layer. Layer id: ${
                newLayer?.id ?? 'unknown'
            }.`,
        }
    }
