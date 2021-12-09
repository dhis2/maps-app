import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import 'typeface-roboto';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Provider } from '@dhis2/app-runtime';
import { CssReset, CssVariables, HeaderBar } from '@dhis2/ui';
import AppMenu from './AppMenu';
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
import { apiVersion } from '../../constants/settings';
import { loadFavorite } from '../../actions/favorites';
import { getAnalyticalObject } from '../../actions/analyticalObject';

import styles from './styles/App.module.css';

const App = ({ mapId, analyticalObject }) => {
    useEffect(() => {
        if (mapId) {
            loadFavorite(mapId);
        }

        // If analytical object is passed from another app
        if (analyticalObject === 'true') {
            getAnalyticalObject();
        }
    }, []);

    return (
        <Provider
            config={{
                baseUrl: process.env.DHIS2_BASE_URL,
                apiVersion,
            }}
        >
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
        </Provider>
    );
};

App.propTypes = {
    mapId: PropTypes.string,
    analyticalObject: PropTypes.string,
};

export default connect(null, {
    loadFavorite,
    getAnalyticalObject,
})(App);
