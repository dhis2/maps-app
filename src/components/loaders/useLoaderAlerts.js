import { useAlert } from '@dhis2/app-service-alerts'
import i18n from '@dhis2/d2-i18n'
import {
    ALERT_MESSAGE_DYNAMIC,
    ALERT_CRITICAL,
    ALERT_WARNING,
    WARNING_NO_DATA,
    WARNING_NO_OU_COORD,
    WARNING_NO_GEOMETRY_COORD,
    WARNING_NO_FACILITY_COORD,
    WARNING_PAGED_EVENTS,
    ERROR_NO_ACCESS,
    ERROR_UNKNOWN,
    ERROR_CRITICAL,
} from '../../constants/alerts.js'

function useLoaderAlerts() {
    const errorAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    const noDataAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_WARNING)
    const noOUCoordinatesAlert = useAlert(({ msg }) => msg, ALERT_WARNING)

    const noGeometryCoordinatesAlert = useAlert(
        ALERT_MESSAGE_DYNAMIC,
        ALERT_WARNING
    )
    const noFacilityCoordinatesAlert = useAlert(
        ALERT_MESSAGE_DYNAMIC,
        ALERT_WARNING
    )

    const pagedEventsAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_WARNING)
    const noAccessAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    const unknownErrorAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)

    const showAlerts = (alerts) => {
        console.log('here with alerts', alerts)
        alerts.forEach(({ message: msg, code, custom }) => {
            switch (code) {
                case WARNING_NO_DATA:
                    noDataAlert.show({ msg })
                    break
                case WARNING_NO_OU_COORD: {
                    const custommessage = i18n.t(
                        'Selected org units for {{name}}: No coordinates found',
                        {
                            name: custom,
                            nsSeparator: ';',
                        }
                    )
                    noOUCoordinatesAlert.show({ msg: custommessage })
                    break
                }
                case WARNING_NO_GEOMETRY_COORD: {
                    const custommessage = i18n.t(
                        '{{name}}: No coordinates found',
                        {
                            name: custom,
                            nsSeparator: ';',
                        }
                    )
                    noGeometryCoordinatesAlert.show({ msg: custommessage })
                    break
                }

                case WARNING_NO_FACILITY_COORD:
                    noFacilityCoordinatesAlert.show({ msg })
                    break
                case WARNING_PAGED_EVENTS:
                    pagedEventsAlert.show({ msg })
                    break
                case ERROR_NO_ACCESS:
                    noAccessAlert.show({ msg })
                    break
                case ERROR_UNKNOWN:
                    unknownErrorAlert.show({ msg })
                    break
                case ERROR_CRITICAL: {
                    const custommessage= i18n.t('Error: {{message}}', {
                        message: error.message || error,
                        nsSeparator: ';',
                    })
                    errorAlert.show({ msg: custommessage })
                     break
                }
                default:
                    break
            }
        })
    }

    return { showAlerts }
}

export default useLoaderAlerts

// Facility

// alerts.push({
//     warning: true,
//     code: WARNING_NO_FACILITY_COORD,
//     message: i18n.t('Facilities: No coordinates found', {
//         nsSeparator: ';',
//     }),
// })

// // Event
// const accessDeniedAlert = {
//     warning: true,
//     code: ERROR_NO_ACCESS,
//     message: i18n.t("You don't have access to this layer data"),
// }
// const unknownErrorAlert = {
//     critical: true,
//     code: ERROR_UNKNOWN,
//     message: i18n.t('An unknown error occurred while reading layer data'),
// }

// alert = {
//     warning: true,
//     code: WARNING_PAGED_EVENTS,
//     message: `${config.name}: ${i18n.t(
//         'Displaying first {{pageSize}} events out of {{total}}',
//         {
//             pageSize: EVENT_CLIENT_PAGE_SIZE,
//             total,
//         }
//     )}`,
// }

// NO_DATA - TE layer, Thematic
// TE
  message: `${trackedEntityType.name}: ${i18n.t("No tracked entities found")}`
// Thematic
  message: `${name}: ${i18n.t("No data found")}`
// EVENT
  message: `${name}: ${i18n.t("No data found")}`



// ERROR_CRITICAL ee, thematic, ou, facility
    message: i18n.t('Error: {{message}}', {
        message: error.message,
        nsSeparator: ';',
    }),
        message: `${i18n.t('Error')}: ${error.message || error}`
    message: i18n.t('Error: {{message}}', {
        message: error.message,
        nsSeparator: ';',
    message: i18n.t('Error: {{message}}', {
        message: error.message,
        nsSeparator: ';',






