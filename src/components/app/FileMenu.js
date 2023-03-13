import { FileMenu as UiFileMenu } from '@dhis2/analytics'
import { useDataMutation, useDataEngine } from '@dhis2/app-runtime'
import { useD2 } from '@dhis2/app-runtime-adapter-d2'
import { useAlert } from '@dhis2/app-service-alerts'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { newMap, tOpenMap, setMapProps } from '../../actions/map.js'
import {
    ALERT_CRITICAL,
    ALERT_MESSAGE_DYNAMIC,
    ALERT_OPTIONS_DYNAMIC,
    ALERT_SUCCESS_DELAY,
} from '../../constants/alerts.js'
import { cleanMapConfig } from '../../util/favorites.js'
import { fetchMap } from '../../util/requests.js'
import { useSystemSettings } from '../SystemSettingsProvider.js'

const saveMapMutation = {
    resource: 'maps',
    type: 'update',
    id: ({ id }) => id,
    params: {
        skipTranslation: true,
        skipSharing: true,
    },
    data: ({ data }) => data,
}

const saveAsNewMapMutation = {
    resource: 'maps',
    type: 'create',
    data: ({ data }) => data,
}

export const getMapName = (name) =>
    name ||
    i18n.t('Untitled map, {{date}}', {
        date: new Date().toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        }),
    })

const getSavedMessage = (name) => i18n.t('Map "{{- name}}" is saved.', { name })

const getSaveFailureMessage = (message) =>
    i18n.t('Failed to save map: {{message}}', {
        message,
        nsSeparator: ';',
    })

const FileMenu = ({ map, newMap, tOpenMap, setMapProps }) => {
    const { d2 } = useD2()
    const engine = useDataEngine()
    const { keyDefaultBaseMap } = useSystemSettings()
    //alerts
    const saveAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_OPTIONS_DYNAMIC)
    const saveAsAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_OPTIONS_DYNAMIC)
    const deleteAlert = useAlert(
        'Map successfully deleted',
        ALERT_SUCCESS_DELAY
    )
    const fileMenuErrorAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    const openMapErrorAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)

    const [saveMapMutate] = useDataMutation(saveMapMutation, {
        onError: (e) =>
            saveAlert.show({
                msg: getSaveFailureMessage(e.message),
                isError: true,
            }),
    })
    const [saveAsNewMapMutate] = useDataMutation(saveAsNewMapMutation, {
        onError: (e) =>
            saveAsAlert.show({
                msg: getSaveFailureMessage(e.message),
                isError: true,
            }),
    })

    const onFileMenuError = (e) =>
        fileMenuErrorAlert.show({
            msg: e.message,
        })

    const saveMap = async () => {
        const config = cleanMapConfig({
            config: map,
            defaultBasemapId: keyDefaultBaseMap,
        })

        if (config.mapViews) {
            config.mapViews.forEach((view) => delete view.id)
        }

        await saveMapMutate({
            id: map.id,
            data: config,
        })

        saveAlert.show({ msg: getSavedMessage(config.name) })
    }

    const openMap = async (id) => {
        const error = await tOpenMap(id, keyDefaultBaseMap, engine)
        if (error) {
            openMapErrorAlert.show({
                msg: i18n.t(`Error while opening map: ${error.message}`, {
                    nsSeparator: ';',
                }),
            })
        }
    }

    const saveAsNewMap = async ({ name, description }) => {
        const config = {
            ...cleanMapConfig({
                config: map,
                defaultBasemapId: keyDefaultBaseMap,
            }),
            name: getMapName(name),
            description: description,
        }

        delete config.id

        if (config.mapViews) {
            config.mapViews.forEach((view) => delete view.id)
        }

        const response = await saveAsNewMapMutate({
            data: config,
        })

        if (response.status === 'OK') {
            const newMapConfig = await fetchMap(
                response.response.uid,
                engine,
                keyDefaultBaseMap
            )

            delete newMapConfig.mapViews
            setMapProps(newMapConfig)

            saveAsAlert.show({ msg: getSavedMessage(config.name) })
        } else {
            saveAsAlert.show({
                msg: getSaveFailureMessage(response.message),
                isError: true,
            })
        }
    }

    const onRename = ({ name, description }) =>
        setMapProps({ name: getMapName(name), description })

    const onDelete = () => {
        newMap()
        deleteAlert.show()
    }

    return (
        <UiFileMenu
            currentUser={d2.currentUser}
            fileType="map"
            fileObject={map}
            onNew={newMap}
            onOpen={openMap}
            onSave={saveMap}
            onSaveAs={saveAsNewMap}
            onRename={onRename}
            onDelete={onDelete}
            onError={onFileMenuError}
        />
    )
}

FileMenu.propTypes = {
    map: PropTypes.object.isRequired,
    newMap: PropTypes.func.isRequired,
    setMapProps: PropTypes.func.isRequired,
    tOpenMap: PropTypes.func.isRequired,
}

export default connect(({ map }) => ({ map }), {
    newMap,
    tOpenMap,
    setMapProps,
})(FileMenu)
