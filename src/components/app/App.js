import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import 'typeface-roboto';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { useDataEngine } from '@dhis2/app-runtime';
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
import { setAnalyticalObject } from '../../actions/analyticalObject';
import { setOrgUnitTree } from '../../actions/orgUnits';
import { setMap } from '../../actions/map';
import { loadLayer } from '../../actions/layers';
import {
    removeBingBasemaps,
    setBingMapsApiKey,
    addBasemap,
} from '../../actions/basemap';
import { addExternalLayer } from '../../actions/externalLayers';
import {
    fetchOrgUnits,
    fetchExternalLayers,
    fetchMap,
} from '../../util/requests';
import { createExternalLayer } from '../../util/external';
import {
    getCurrentAnalyticalObject,
    clearAnalyticalObjectFromUrl,
    hasSingleDataDimension,
    getThematicLayerFromAnalyticalObject,
} from '../../util/analyticalObject';
import {
    renameBoundaryLayerToOrgUnitLayer,
    addOrgUnitPaths,
} from '../../util/helpers';

import styles from './styles/App.module.css';

const isBaseMap = layer => layer.mapLayerPosition === 'BASEMAP';
const isOverlay = layer => !isBaseMap(layer);

const App = ({
    mapId,
    analyticalObject,
    addBasemap,
    addExternalLayer,
    removeBingBasemaps,
    setBingMapsApiKey,
    setOrgUnitTree,
    setAnalyticalObject,
    setMap,
    loadLayer,
}) => {
    const { systemSettings } = useSystemSettings();
    const engine = useDataEngine();

    useEffect(() => {
        async function fetchData() {
            const orgUnitTree = await fetchOrgUnits(engine);
            setOrgUnitTree(orgUnitTree.orgUnitTree.organisationUnits);

            const externalLayers = await fetchExternalLayers(engine);
            externalLayers.externalLayers.externalMapLayers
                .filter(isBaseMap)
                .map(createExternalLayer)
                .map(addBasemap);

            externalLayers.externalLayers.externalMapLayers
                .filter(isOverlay)
                .map(createExternalLayer)
                .map(addExternalLayer);

            if (mapId) {
                const config = await fetchMap(mapId, engine);
                const cleanedConfig = renameBoundaryLayerToOrgUnitLayer(config);
                setMap(cleanedConfig);
                addOrgUnitPaths(cleanedConfig.mapViews).map(loadLayer);
            }

            if (analyticalObject === 'true') {
                getCurrentAnalyticalObject().then(ao => {
                    clearAnalyticalObjectFromUrl();
                    return hasSingleDataDimension(ao)
                        ? getThematicLayerFromAnalyticalObject(ao).then(
                              loadLayer
                          )
                        : setAnalyticalObject(ao);
                });
            }
        }
        fetchData();
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
    addBasemap: PropTypes.func,
    addExternalLayer: PropTypes.func,
    removeBingBasemaps: PropTypes.func,
    setBingMapsApiKey: PropTypes.func,
    setOrgUnitTree: PropTypes.func,
    setMap: PropTypes.func,
    setAnalyticalObject: PropTypes.func,
    loadLayer: PropTypes.func,
};

export default connect(null, {
    addBasemap,
    addExternalLayer,
    loadFavorite,
    removeBingBasemaps,
    setBingMapsApiKey,
    setOrgUnitTree,
    setMap,
    setAnalyticalObject,
    loadLayer,
})(App);
