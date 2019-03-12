import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import HeaderBar from '@dhis2/ui/widgets/HeaderBar';
import mui3theme from '@dhis2/d2-ui-core/theme/mui3.theme';
import MapProvider from '../map/MapProvider';
import AppMenu from './AppMenu';
import LayersPanel from '../layers/LayersPanel';
import LayersToggle from '../layers/LayersToggle';
import Map from '../map/Map';
import BottomPanel from '../datatable/BottomPanel';
import LayerEdit from '../edit/LayerEdit';
import ContextMenu from '../map/ContextMenu';
import AlertSnackbar from '../alerts/AlertSnackbar';
import Message from '../message/Message';
import InterpretationsPanel from '../interpretations/InterpretationsPanel';
import DataDownloadDialog from '../layers/download/DataDownloadDialog';
import OpenAsMapDialog from '../openAs/OpenAsMapDialog';
import FatalErrorBoundary from '../errors/FatalErrorBoundary';
import '@dhis2/ui/defaults/reset.css';
import './App.css';

const theme = createMuiTheme(mui3theme);

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
            <FatalErrorBoundary>
                <HeaderBar appName={i18n.t('Maps')} />
                <MuiThemeProvider theme={theme}>
                    <MapProvider>
                        <AppMenu />
                        <InterpretationsPanel />
                        <LayersPanel />
                        <LayersToggle />
                        <Map />
                        <BottomPanel />
                        <LayerEdit />
                        <ContextMenu />
                        <AlertSnackbar />
                        <Message />
                        <DataDownloadDialog />
                        <OpenAsMapDialog />
                    </MapProvider>
                </MuiThemeProvider>
            </FatalErrorBoundary>
        );
    }
}

export default App;
