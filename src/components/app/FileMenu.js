import {
    FileMenu as UiFileMenu,
    useCachedDataQuery,
    preparePayloadForSave,
    preparePayloadForSaveAs,
    VIS_TYPE_MAP,
} from '@dhis2/analytics'
import { useDataMutation, useDataEngine } from '@dhis2/app-runtime'
import { useAlert } from '@dhis2/app-service-alerts'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setMapProps } from '../../actions/map.js'
import {
    ALERT_CRITICAL,
    ALERT_WARNING,
    ALERT_MESSAGE_DYNAMIC,
    ALERT_OPTIONS_DYNAMIC,
    ALERT_SUCCESS_DELAY,
} from '../../constants/alerts.js'
import {
    cleanMapConfig,
    // getUnloadedCleanMapConfig,
} from '../../util/favorites.js'
import { addOrgUnitPaths } from '../../util/helpers.js'
import history from '../../util/history.js'
import {
    fetchMap,
    fetchMapNameDesc,
    fetchMapSubscribers,
} from '../../util/requests.js'

const updateMapMutation = {
    resource: 'maps',
    type: 'update',
    id: ({ id }) => id,
    params: {
        skipTranslation: true,
        skipSharing: true,
    },
    data: ({ data }) => data,
}

const createMapMutation = {
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

const FileMenu = ({ onFileMenuAction }) => {
    const map = useSelector((state) => state.map)
    const dispatch = useDispatch()
    const engine = useDataEngine()
    const { systemSettings, currentUser } = useCachedDataQuery()
    const defaultBasemap = systemSettings.keyDefaultBaseMap
    //alerts
    const saveAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_OPTIONS_DYNAMIC)
    const renameFailedAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_WARNING)
    const renameSuccessAlert = useAlert(
        ALERT_MESSAGE_DYNAMIC,
        ALERT_SUCCESS_DELAY
    )
    const saveAsAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_OPTIONS_DYNAMIC)
    const deleteAlert = useAlert(
        'Map successfully deleted',
        ALERT_SUCCESS_DELAY
    )
    const fileMenuErrorAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)

    const [putMap] = useDataMutation(updateMapMutation, {
        onError: (e) => {
            saveAlert.show({
                msg: getSaveFailureMessage(e.message),
                isError: true,
            })
        },
    })

    const [renameMap] = useDataMutation(updateMapMutation, {
        onError: () => {
            renameFailedAlert.show({
                msg: i18n.t('Rename failed'),
                isError: true,
            })
        },
    })

    const [postMap] = useDataMutation(createMapMutation, {
        onError: (e) => {
            saveAsAlert.show({
                msg: getSaveFailureMessage(e.message),
                isError: true,
            })
        },
    })

    const onSave = async ({ name, description }) => {
        const { subscribers } = await fetchMapSubscribers({
            id: map.id,
            engine,
        })

        const cleanedMap = cleanMapConfig({
            config: map,
            defaultBasemapId: defaultBasemap,
        })

        const config = preparePayloadForSave({
            visualization: {
                ...cleanedMap,
                subscribers,
                type: VIS_TYPE_MAP,
            },
            name,
            description,
        })

        await putMap({
            id: map.id,
            data: config,
        })

        saveAlert.show({ msg: getSavedMessage(map.name) })
        if (map.id) {
            history.replace(`/${map.id}`)
        }
    }

    const onRename = async ({ name, description }) => {
        // fetch the original Map
        const fetchedMap = await fetchMap({
            id: map.id,
            engine,
            defaultBasemap,
            withSubscribers: true,
        })

        const latestMap = {
            ...fetchedMap,
            mapViews: addOrgUnitPaths(fetchedMap.mapViews),
        }

        const cleanedMap = cleanMapConfig({
            config: latestMap,
            defaultBasemapId: defaultBasemap,
            cleanMapviewConfig: false,
        })

        const config = preparePayloadForSave({
            visualization: { ...cleanedMap, type: VIS_TYPE_MAP },
            name,
            description,
        })

        await renameMap({
            id: map.id,
            data: config,
        })

        const { map: updatedMapNameDesc } = await fetchMapNameDesc({
            id: map.id,
            engine,
        })

        dispatch(setMapProps(updatedMapNameDesc))

        renameSuccessAlert.show({ msg: i18n.t('Rename successful') })

        onFileMenuAction()
    }

    const onSaveAs = async ({ name, description }) => {
        const cleanedMap = cleanMapConfig({
            config: map,
            defaultBasemapId: defaultBasemap,
        })

        const config = preparePayloadForSaveAs({
            visualization: { ...cleanedMap, type: VIS_TYPE_MAP },
            name,
            description,
        })

        const res = await postMap({ data: config })

        if (res.status === 'OK') {
            saveAsAlert.show({ msg: getSavedMessage(getMapName(name)) })

            if (res.response.uid) {
                history.push(`/${res.response.uid}`)
            }
        }
    }

    const onDelete = () => {
        onNew()
        deleteAlert.show()
    }

    const onNew = () => {
        if (history.location.pathname === '/') {
            history.replace('/')
        } else {
            history.push('/')
        }
    }

    const onOpen = async (id) => {
        const path = `/${id}`
        if (history.location.pathname === path) {
            history.replace(path)
        } else {
            history.push(path)
        }
    }

    const onFileMenuError = (e) =>
        fileMenuErrorAlert.show({
            msg: e.message,
        })

    return (
        <UiFileMenu
            currentUser={currentUser}
            fileType="map"
            fileObject={map}
            onNew={onNew}
            onOpen={onOpen}
            onSave={onSave}
            onSaveAs={onSaveAs}
            onRename={onRename}
            onDelete={onDelete}
            onError={onFileMenuError}
            onShare={onFileMenuAction}
            onTranslate={onFileMenuAction}
        />
    )
}

FileMenu.propTypes = {
    onFileMenuAction: PropTypes.func.isRequired,
}

export default FileMenu
