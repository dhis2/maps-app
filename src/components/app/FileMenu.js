import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { FileMenu as UiFileMenu } from '@dhis2/analytics';
import { useDataMutation, useDataEngine } from '@dhis2/app-runtime';
import { newMap, setMapProps } from '../../actions/map';
import { loadFavorite } from '../../actions/favorites';
import { setAlert } from '../../actions/alerts';
import { fetchMap } from '../../util/requests';
import { useSystemSettings } from '../../hooks/SystemSettingsProvider';
import { cleanMapConfig } from '../../util/favorites';
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

export const FileMenu = (
    { map, newMap, setMapProps, loadFavorite, setAlert },
    { d2 }
) => {
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
            const response = await saveAsNewMapMutate({ data: config });

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

    //TODO: test this with cypress
    // if (error) {
    //     setError(error);
    // }

    return (
        <div className={styles.fileMenu}>
            <UiFileMenu
                d2={d2}
                fileType="map"
                fileObject={map}
                onNew={newMap}
                onOpen={loadFavorite}
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
    setMapProps: PropTypes.func.isRequired,
    loadFavorite: PropTypes.func.isRequired,
    setAlert: PropTypes.func.isRequired,
};

FileMenu.contextTypes = {
    d2: PropTypes.object,
};

export default connect(({ map }) => ({ map }), {
    newMap,
    setMapProps,
    loadFavorite,
    setAlert,
})(FileMenu);
