import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import 'typeface-roboto';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mui3theme from '@dhis2/d2-ui-core/theme/mui3.theme';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
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

import './styles/App.css';

const theme = createMuiTheme({ ...mui3theme, spacing: 8 }); // TODO: Changed syntax i MUI4

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
                    baseUrl: DHIS_CONFIG.baseUrl,
                    apiVersion: '35',
                }}
            >
                <FatalErrorBoundary>
                    <CssReset />
                    <CssVariables colors spacers theme />
                    <HeaderBar appName={i18n.t('Maps')} />
                    <MuiThemeProvider theme={theme}>
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
                    </MuiThemeProvider>
                </FatalErrorBoundary>
            </Provider>
        );
    }
}

export default App;
