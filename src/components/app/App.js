import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import 'typeface-roboto';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { CssReset, CssVariables, HeaderBar } from '@dhis2/ui';
import isEmpty from 'lodash/isEmpty';
import AppMenu from './AppMenu';
import { useSystemSettings } from '../SystemSettingsProvider';
import LayersPanel from '../layers/LayersPanel';
import LayersToggle from '../layers/LayersToggle';
import MapContainer from '../map/MapContainer';
import BottomPanel from '../datatable/BottomPanel';
import LayerEdit from '../edit/LayerEdit';
import ContextMenu from '../map/ContextMenu';
import OrgUnitProfile from '../orgunits/OrgUnitProfile';
import AlertStack from '../alerts/AlertStack';
import InterpretationsPanel from '../interpretations/InterpretationsPanel';
import DataDownloadDialog from '../layers/download/DataDownloadDialog';
import OpenAsMapDialog from '../openAs/OpenAsMapDialog';
import FatalErrorBoundary from '../errors/FatalErrorBoundary';
import { loadFavorite } from '../../actions/favorites';
import { getAnalyticalObject } from '../../actions/analyticalObject';
import { loadOrgUnitTree } from '../../actions/orgUnits';
import { removeBingBasemaps, setBingMapsApiKey } from '../../actions/basemap';
import { loadExternalLayers } from '../../actions/externalLayers';

import styles from './styles/App.module.css';

const App = ({
    mapId,
    analyticalObject,
    loadOrgUnitTree,
    loadExternalLayers,
    removeBingBasemaps,
    setBingMapsApiKey,
}) => {
    const { systemSettings } = useSystemSettings();

    useEffect(() => {
        loadOrgUnitTree();
        loadExternalLayers();

        if (mapId) {
            loadFavorite(mapId);
        }

        // If analytical object is passed from another app
        if (analyticalObject === 'true') {
            getAnalyticalObject();
        }
    }, []);

    useEffect(() => {
        if (!isEmpty(systemSettings)) {
            if (!systemSettings.keyBingMapsApiKey) {
                removeBingBasemaps();
            } else {
                setBingMapsApiKey(systemSettings.keyBingMapsApiKey);
            }
        }
    }, [systemSettings]);

    return (
        <FatalErrorBoundary>
            <div className={styles.app}>
                <CssReset />
                <CssVariables colors spacers theme />
                <HeaderBar appName={i18n.t('Maps')} />
                <AppMenu />
                <InterpretationsPanel />
                <LayersPanel />
                <LayersToggle />
                <MapContainer />
                <BottomPanel />
                <LayerEdit />
                <ContextMenu />
                <AlertStack />
                <DataDownloadDialog />
                <OpenAsMapDialog />
                <OrgUnitProfile />
            </div>
        </FatalErrorBoundary>
    );
};

App.propTypes = {
    mapId: PropTypes.string,
    analyticalObject: PropTypes.string,
    loadOrgUnitTree: PropTypes.func,
    loadExternalLayers: PropTypes.func,
    removeBingBasemaps: PropTypes.func,
    setBingMapsApiKey: PropTypes.func,
};

export default connect(null, {
    loadOrgUnitTree,
    loadExternalLayers,
    loadFavorite,
    getAnalyticalObject,
    removeBingBasemaps,
    setBingMapsApiKey,
})(App);
