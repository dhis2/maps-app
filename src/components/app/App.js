import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import 'typeface-roboto';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { useDataEngine } from '@dhis2/app-runtime';
import { useSetting } from '@dhis2/app-service-datastore';
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
import FeatureProfile from '../feature/FeatureProfile';
import AlertStack from '../alerts/AlertStack';
import InterpretationsPanel from '../interpretations/InterpretationsPanel';
import DataDownloadDialog from '../layers/download/DataDownloadDialog';
import OpenAsMapDialog from '../openAs/OpenAsMapDialog';
import FatalErrorBoundary from '../errors/FatalErrorBoundary';
import { tSetAnalyticalObject } from '../../actions/analyticalObject';
import { tSetOrgUnitTree } from '../../actions/orgUnits';
import { tOpenMap } from '../../actions/map';
import { tSetExternalLayers } from '../../actions/externalLayers';
import { removeBingBasemaps, setBingMapsApiKey } from '../../actions/basemap';
import { CURRENT_AO_KEY } from '../../util/analyticalObject';
import { getUrlParameter } from '../../util/requests';

import styles from './styles/App.module.css';

const App = ({
    removeBingBasemaps,
    setBingMapsApiKey,
    tSetAnalyticalObject,
    tSetOrgUnitTree,
    tSetExternalLayers,
    tOpenMap,
}) => {
    const [basemapsLoaded, setBasemapsLoaded] = useState(false);
    const systemSettings = useSystemSettings();
    const engine = useDataEngine();
    const [currentAO] = useSetting(CURRENT_AO_KEY);

    useEffect(() => {
        async function fetchData() {
            await tSetOrgUnitTree();
            await tSetExternalLayers(engine);
            setBasemapsLoaded(true);

            const mapId = getUrlParameter('id');
            if (mapId) {
                await tOpenMap(mapId, systemSettings.keyDefaultBaseMap, engine);
            }

            if (getUrlParameter('currentAnalyticalObject') === 'true') {
                await tSetAnalyticalObject(currentAO);
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
                <FeatureProfile />
            </div>
        </FatalErrorBoundary>
    );
};

App.propTypes = {
    removeBingBasemaps: PropTypes.func,
    setBingMapsApiKey: PropTypes.func,
    loadLayer: PropTypes.func,
    tOpenMap: PropTypes.func,
    tSetAnalyticalObject: PropTypes.func,
    tSetExternalLayers: PropTypes.func,
    tSetOrgUnitTree: PropTypes.func,
};

export default connect(null, {
    removeBingBasemaps,
    setBingMapsApiKey,
    tOpenMap,
    tSetAnalyticalObject,
    tSetExternalLayers,
    tSetOrgUnitTree,
})(App);
