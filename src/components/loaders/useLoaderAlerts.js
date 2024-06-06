import { useAlert } from '@dhis2/app-service-alerts'
import i18n from '@dhis2/d2-i18n'
import {
    ALERT_MESSAGE_DYNAMIC,
    ALERT_CRITICAL,
    ALERT_WARNING,
    ALERT_INFO,
    INFO_NO_DATA,
    WARNING_NO_OU_COORD,
    WARNING_NO_GEOMETRY_COORD,
    ERROR_CRITICAL,
    CUSTOM_ALERT,
} from '../../constants/alerts.js'

function useLoaderAlerts() {
    const errorAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    const warningAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_WARNING)
    const infoAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_INFO)
    const noDataAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_INFO)
    const noOUCoordinatesAlert = useAlert(({ msg }) => msg, ALERT_WARNING)

    const noGeometryCoordinatesAlert = useAlert(
        ALERT_MESSAGE_DYNAMIC,
        ALERT_WARNING
    )

    const showAlerts = (alerts) => {
        alerts.forEach(({ message: msg, code, warning, critical }) => {
            switch (code) {
                case INFO_NO_DATA: {
                    noDataAlert.show({
                        msg: `${msg}: ${i18n.t('No data found')}`,
                    })
                    break
                }
                case WARNING_NO_OU_COORD: {
                    noOUCoordinatesAlert.show({
                        msg: i18n.t(
                            'No coordinates found for selected org units'
                        ),
                    })
                    break
                }
                case WARNING_NO_GEOMETRY_COORD: {
                    noGeometryCoordinatesAlert.show({
                        msg: `${msg}: ${i18n.t('No coordinates found')}`,
                    })
                    break
                }
                case ERROR_CRITICAL: {
                    errorAlert.show({ msg: `${i18n.t('Error')}: ${msg}` })
                    break
                }
                case CUSTOM_ALERT: {
                    if (critical) {
                        errorAlert.show({ msg })
                    } else if (warning) {
                        warningAlert.show({ msg })
                    } else {
                        infoAlert.show({ msg })
                    }
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
