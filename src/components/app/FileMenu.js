import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { FileMenu as UiFileMenu } from '@dhis2/analytics';
import { useD2 } from '@dhis2/app-runtime-adapter-d2';
import { useDataMutation, useDataEngine } from '@dhis2/app-runtime';
import { useAlert } from '@dhis2/app-service-alerts';
import { newMap, tOpenMap, setMapProps } from '../../actions/map';
import { fetchMap } from '../../util/requests';
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
    i18n.t('Failed to save map: {{message}}', {
        message,
        nsSeparator: ';',
    });

export const FileMenu = ({ map, newMap, tOpenMap, setMapProps }) => {
    const { d2 } = useD2();
    const engine = useDataEngine();
    const { keyDefaultBaseMap } = useSystemSettings();
    //alerts
    const saveAlert = useAlert(
        ({ msg }) => msg,
        ({ isCritical }) =>
            isCritical ? { critical: true } : { success: true }
    );
    const saveAsAlert = useAlert(
        ({ msg }) => msg,
        ({ isCritical }) =>
            isCritical ? { critical: true } : { success: true }
    );
    const deleteAlert = useAlert('Map successfully deleted', {
        success: true,
        duration: 3000,
    });
    const fileMenuErrorAlert = useAlert(({ msg }) => msg, { critical: true });
    const openMapErrorAlert = useAlert(({ msg }) => msg, { critical: true });

    const [saveMapMutate] = useDataMutation(saveMapMutation, {
        onError: e =>
            saveAlert.show({
                msg: getSaveFailureMessage(e.message),
                isCritical: true,
            }),
    });
    const [saveAsNewMapMutate] = useDataMutation(saveAsNewMapMutation, {
        onError: e =>
            saveAsAlert.show({
                msg: getSaveFailureMessage(e.message),
                isCritical: true,
            }),
    });

    const onFileMenuError = e =>
        fileMenuErrorAlert.show({
            msg: e.message,
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

        saveAlert.show({ msg: getSavedMessage(config.name) });
    };

    const openMap = async id => {
        const error = await tOpenMap(id, keyDefaultBaseMap, engine);
        if (error) {
            openMapErrorAlert.show({
                msg: i18n.t(`Error while opening map: ${error.message}`, {
                    nsSeparator: ';',
                }),
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
            const newMapConfig = await fetchMap(
                response.response.uid,
                engine,
                keyDefaultBaseMap
            );

            delete newMapConfig.mapViews;
            setMapProps(newMapConfig);

            saveAsAlert.show({ msg: getSavedMessage(config.name) });
        } else {
            saveAsAlert.show({
                msg: getSaveFailureMessage(response.message),
                isCritical: true,
            });
        }
    };

    const onDelete = () => {
        newMap();
        deleteAlert.show();
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
            onDelete={onDelete}
            onError={onFileMenuError}
        />
    );
};

FileMenu.propTypes = {
    map: PropTypes.object.isRequired,
    newMap: PropTypes.func.isRequired,
    tOpenMap: PropTypes.func.isRequired,
    setMapProps: PropTypes.func.isRequired,
};

export default connect(({ map }) => ({ map }), {
    newMap,
    tOpenMap,
    setMapProps,
})(FileMenu);
