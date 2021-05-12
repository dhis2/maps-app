import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import 'typeface-roboto';
import React, { Component } from 'react';
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
import OrgUnitDialog from '../orgunits/OrgUnitDialog';
import AlertStack from '../alerts/AlertStack';
import InterpretationsPanel from '../interpretations/InterpretationsPanel';
import DataDownloadDialog from '../layers/download/DataDownloadDialog';
import OpenAsMapDialog from '../openAs/OpenAsMapDialog';
import FatalErrorBoundary from '../errors/FatalErrorBoundary';
import { apiVersion } from '../../constants/settings';
import styles from './styles/App.module.css';

// Makes d2 available in all child components
export class App extends Component {
    static propTypes = {
        d2: PropTypes.object,
    };

    static childContextTypes = {
        d2: PropTypes.object.isRequired,
    };

    getChildContext() {
        return {
            d2: this.props.d2,
        };
    }

    render() {
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
                        <OrgUnitDialog />
                    </div>
                </FatalErrorBoundary>
            </Provider>
        );
    }
}

export default App;
