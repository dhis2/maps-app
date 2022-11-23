import { FileMenu as UiFileMenu } from '@dhis2/analytics'
import { useDataMutation, useDataEngine } from '@dhis2/app-runtime'
import { useD2 } from '@dhis2/app-runtime-adapter-d2'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setAlert } from '../../actions/alerts.js'
import { newMap, tOpenMap, setMapProps } from '../../actions/map.js'
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

const getSavedMessage = (name) => i18n.t('Map "{{name}}" is saved.', { name })

const getSaveFailureMessage = (message) =>
    i18n.t('Failed to save map. {{message}}', {
        message,
    })

export const FileMenu = ({ map, newMap, tOpenMap, setMapProps, setAlert }) => {
    const { d2 } = useD2()
    const engine = useDataEngine()
    const { keyDefaultBaseMap } = useSystemSettings()
    const setError = ({ message }) => setAlert({ critical: true, message })

    const [saveMapMutate] = useDataMutation(saveMapMutation, {
        onError: (e) => setError({ message: getSaveFailureMessage(e.message) }),
    })
    const [saveAsNewMapMutate] = useDataMutation(saveAsNewMapMutation, {
        onError: (e) => setError({ message: getSaveFailureMessage(e.message) }),
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

        setAlert({ success: true, message: getSavedMessage(config.name) })
    }

    const openMap = async (id) => {
        const error = await tOpenMap(id, keyDefaultBaseMap, engine)
        if (error) {
            setError({
                message: i18n.t(`Error while opening map. ${error.message}`),
            })
        }
    }

    const saveAsNewMap = async ({ name, description }) => {
        const config = {
            ...cleanMapConfig({
                config: map,
                defaultBasemapId: keyDefaultBaseMap,
            }),
            name: name,
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

            setAlert({
                success: true,
                message: getSavedMessage(name),
            })
        } else {
            setError({
                message: `${i18n.t('Error')}: ${response.message}`,
            })
        }
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
            onRename={setMapProps}
            onDelete={newMap}
            onError={setError}
        />
    )
}

FileMenu.propTypes = {
    map: PropTypes.object.isRequired,
    newMap: PropTypes.func.isRequired,
    setAlert: PropTypes.func.isRequired,
    setMapProps: PropTypes.func.isRequired,
    tOpenMap: PropTypes.func.isRequired,
}

export default connect(({ map }) => ({ map }), {
    newMap,
    tOpenMap,
    setMapProps,
    setAlert,
})(FileMenu)
