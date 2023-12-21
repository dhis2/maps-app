import log from 'loglevel';
import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { FileMenu as UiFileMenu } from '@dhis2/analytics';
import { useD2 } from '@dhis2/app-runtime-adapter-d2';
import { useDataMutation, useDataEngine } from '@dhis2/app-runtime';
import { newMap, tOpenMap, setMapProps } from '../../actions/map';
import { setAlert } from '../../actions/alerts';
import { fetchMap, dataStatisticsMutation } from '../../util/requests';
import { cleanMapConfig } from '../../util/favorites';
import { useSystemSettings } from '../SystemSettingsProvider';

const saveMapMutation = {
    resource: 'maps',
    type: 'update',
    id: ({ id }) => id,
    params: {
        skipTranslation: true,
        skipSharing: true,
    },
    data: ({ data }) => data,
};

const saveAsNewMapMutation = {
    resource: 'maps',
    type: 'create',
    data: ({ data }) => data,
};

const getSavedMessage = name => i18n.t('Map "{{name}}" is saved.', { name });

const getSaveFailureMessage = message =>
    i18n.t('Failed to save map. {{message}}', {
        message,
    });

export const FileMenu = ({ map, newMap, tOpenMap, setMapProps, setAlert }) => {
    const { d2 } = useD2();
    const engine = useDataEngine();
    const { keyDefaultBaseMap } = useSystemSettings();
    const setError = ({ message }) => setAlert({ critical: true, message });

    const [saveMapMutate] = useDataMutation(saveMapMutation, {
        onError: e => setError({ message: getSaveFailureMessage(e.message) }),
    });
    const [saveAsNewMapMutate] = useDataMutation(saveAsNewMapMutation, {
        onError: e => setError({ message: getSaveFailureMessage(e.message) }),
    });

    const [postDataStatistics] = useDataMutation(dataStatisticsMutation, {
        onError: e => log.error('Error:', e.message),
    });

    const saveMap = async () => {
        const config = cleanMapConfig({
            config: map,
            defaultBasemapId: keyDefaultBaseMap,
        });

        if (config.mapViews) {
            config.mapViews.forEach(view => delete view.id);
        }

        await saveMapMutate({
            id: map.id,
            data: config,
        });

        postDataStatistics({ id: map.id });

        setAlert({ success: true, message: getSavedMessage(config.name) });
    };

    const openMap = async id => {
        const error = await tOpenMap(id, keyDefaultBaseMap, engine);
        if (error) {
            setError({
                message: i18n.t(`Error while opening map. ${error.message}`),
            });
        }
    };

    const saveAsNewMap = async ({ name, description }) => {
        const config = {
            ...cleanMapConfig({
                config: map,
                defaultBasemapId: keyDefaultBaseMap,
            }),
            name: name,
            description: description,
        };

        delete config.id;

        if (config.mapViews) {
            config.mapViews.forEach(view => delete view.id);
        }

        const response = await saveAsNewMapMutate({
            data: config,
        });

        if (response.status === 'OK') {
            const newMapId = response.response.uid;
            postDataStatistics({ id: newMapId });

            const newMapConfig = await fetchMap(
                newMapId,
                engine,
                keyDefaultBaseMap
            );

            delete newMapConfig.mapViews;
            setMapProps(newMapConfig);

            setAlert({
                success: true,
                message: getSavedMessage(name),
            });
        } else {
            setError({
                message: `${i18n.t('Error')}: ${response.message}`,
            });
        }
    };

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
    );
};

FileMenu.propTypes = {
    map: PropTypes.object.isRequired,
    newMap: PropTypes.func.isRequired,
    tOpenMap: PropTypes.func.isRequired,
    setMapProps: PropTypes.func.isRequired,
    setAlert: PropTypes.func.isRequired,
};

export default connect(({ map }) => ({ map }), {
    newMap,
    tOpenMap,
    setMapProps,
    setAlert,
})(FileMenu);
