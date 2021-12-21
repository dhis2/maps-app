import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { FileMenu as UiFileMenu } from '@dhis2/analytics';
import { useD2 } from '@dhis2/app-runtime-adapter-d2';
import { useDataMutation, useDataEngine } from '@dhis2/app-runtime';
import { newMap, setMapProps } from '../../actions/map';
import { setAlert } from '../../actions/alerts';
import { setMap } from '../../actions/map';
import { loadLayer } from '../../actions/layers';
import { fetchMap } from '../../util/requests';
import { cleanMapConfig } from '../../util/favorites';
import { useSystemSettings } from '../SystemSettingsProvider';
import {
    renameBoundaryLayerToOrgUnitLayer,
    addOrgUnitPaths,
} from '../../util/helpers';
import styles from './styles/FileMenu.module.css';

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
    params: {
        skipTranslation: true,
        skipSharing: true,
    },
    data: ({ data }) => data,
};

const getSavedMessage = name => i18n.t('Map "{{name}}" is saved.', { name });

export const FileMenu = ({
    map,
    newMap,
    setMap,
    loadLayer,
    setMapProps,
    setAlert,
}) => {
    const { d2 } = useD2();
    const [saveMapMutate] = useDataMutation(saveMapMutation);
    const [saveAsNewMapMutate] = useDataMutation(saveAsNewMapMutation);
    const engine = useDataEngine();
    const { keyDefaultBaseMap } = useSystemSettings().systemSettings;
    const setError = ({ message }) => setAlert({ critical: true, message });

    const saveMap = async () => {
        const config = cleanMapConfig({
            config: map,
            defaultBasemap: { id: keyDefaultBaseMap },
        });

        if (config.mapViews) {
            config.mapViews.forEach(view => delete view.id);
        }

        await saveMapMutate({
            id: map.id,
            data: config,
        });

        setAlert({
            success: true,
            message: getSavedMessage(config.name),
        });
    };

    const openMap = async id => {
        const config = await fetchMap(id, engine, keyDefaultBaseMap);
        const cleanedConfig = renameBoundaryLayerToOrgUnitLayer(config);

        setMap(cleanedConfig);
        addOrgUnitPaths(cleanedConfig.mapViews).map(loadLayer);
    };

    const saveAsNewMap = async ({ name, description }) => {
        const config = {
            ...cleanMapConfig({
                config: map,
                defaultBasemap: { id: keyDefaultBaseMap },
            }),
            name: name,
            description: description,
        };

        delete config.id;

        if (config.mapViews) {
            config.mapViews.forEach(view => delete view.id);
        }

        try {
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

                setAlert({
                    success: true,
                    message: getSavedMessage(name),
                });
            } else {
                setAlert({
                    critical: true,
                    message: `${i18n.t('Error')}: ${response.message}`,
                });
            }
        } catch (e) {
            setAlert({
                critical: true,
                message: `${i18n.t('Error')}: ${e.message}`,
            });
        }
    };

    return (
        <div className={styles.fileMenu}>
            <UiFileMenu
                d2={d2}
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
        </div>
    );
};

FileMenu.propTypes = {
    map: PropTypes.object.isRequired,
    newMap: PropTypes.func.isRequired,
    setMap: PropTypes.func.isRequired,
    loadLayer: PropTypes.func.isRequired,
    setMapProps: PropTypes.func.isRequired,
    setAlert: PropTypes.func.isRequired,
};

export default connect(({ map }) => ({ map }), {
    newMap,
    setMap,
    setMapProps,
    loadLayer,
    setAlert,
})(FileMenu);
