import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import 'typeface-roboto';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import log from 'loglevel';
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
import { setAnalyticalObject } from '../../actions/analyticalObject';
import { setOrgUnitTree } from '../../actions/orgUnits';
import { setMap } from '../../actions/map';
import { loadLayer } from '../../actions/layers';
import {
    removeBingBasemaps,
    setBingMapsApiKey,
    addBasemaps,
} from '../../actions/basemap';
import { addExternalLayer } from '../../actions/externalLayers';
import {
    fetchOrgUnits,
    fetchExternalLayers,
    fetchMap,
    getUrlParameter,
} from '../../util/requests';
import { createExternalLayer } from '../../util/external';
import {
    getCurrentAnalyticalObject,
    clearAnalyticalObjectFromUrl,
    hasSingleDataDimension,
    getThematicLayerFromAnalyticalObject,
} from '../../util/analyticalObject';
import { addOrgUnitPaths } from '../../util/helpers';
import { defaultBasemaps, getFallbackBasemap } from '../../constants/basemaps';

import styles from './styles/App.module.css';

const isBaseMap = layer => layer.mapLayerPosition === 'BASEMAP';
const isOverlay = layer => !isBaseMap(layer);

const App = ({
    addBasemaps,
    addExternalLayer,
    removeBingBasemaps,
    setBingMapsApiKey,
    setOrgUnitTree,
    setAnalyticalObject,
    setMap,
    loadLayer,
}) => {
    const [basemapsLoaded, setBasemapsLoaded] = useState(false);
    const systemSettings = useSystemSettings();
    const engine = useDataEngine();

    useEffect(() => {
        async function fetchData() {
            try {
                const orgUnitTree = await fetchOrgUnits();
                setOrgUnitTree(orgUnitTree);
            } catch (e) {
                log.error('Could not load organisation unit tree');
            }
            let externalBasemaps = [];

            try {
                const externalLayers = await fetchExternalLayers(engine);
                externalBasemaps = externalLayers.externalLayers.externalMapLayers
                    .filter(isBaseMap)
                    .map(createExternalLayer);

                addBasemaps(externalBasemaps);
                setBasemapsLoaded(true);

                externalLayers.externalLayers.externalMapLayers
                    .filter(isOverlay)
                    .map(createExternalLayer)
                    .map(addExternalLayer);
            } catch (e) {
                log.error('Could not load external map layers');
            }

            const mapId = getUrlParameter('id');
            const analyticalObject = getUrlParameter('currentAnalyticalObject');

            if (mapId) {
                try {
                    const map = await fetchMap(
                        mapId,
                        engine,
                        systemSettings.keyDefaultBaseMap
                    );

                    const basemaps = externalBasemaps.concat(defaultBasemaps());

                    const basemap =
                        basemaps.find(bm => bm.id === map.basemap.id) ||
                        getFallbackBasemap();

                    setMap({ ...map, basemap });
                    addOrgUnitPaths(map.mapViews).map(loadLayer);
                } catch (e) {
                    log.error(`Could not load map with id ${mapId}`);
                }
            }

            if (analyticalObject === 'true') {
                try {
                    getCurrentAnalyticalObject().then(ao => {
                        clearAnalyticalObjectFromUrl();
                        return hasSingleDataDimension(ao)
                            ? getThematicLayerFromAnalyticalObject(ao).then(
                                  loadLayer
                              )
                            : setAnalyticalObject(ao);
                    });
                } catch (e) {
                    log.error('Could not load current analytical object');
                }
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
                {basemapsLoaded && (
                    <>
                        <LayersToggle />
                        <LayersPanel />
                        <MapContainer />
                    </>
                )}
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
    addBasemaps: PropTypes.func,
    addExternalLayer: PropTypes.func,
    removeBingBasemaps: PropTypes.func,
    setBingMapsApiKey: PropTypes.func,
    setOrgUnitTree: PropTypes.func,
    setMap: PropTypes.func,
    setAnalyticalObject: PropTypes.func,
    loadLayer: PropTypes.func,
};

export default connect(null, {
    addBasemaps,
    addExternalLayer,
    removeBingBasemaps,
    setBingMapsApiKey,
    setOrgUnitTree,
    setMap,
    setAnalyticalObject,
    loadLayer,
})(App);
