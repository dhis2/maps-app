import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mui3theme from '@dhis2/d2-ui-core/theme/mui3.theme';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import AppMenu from './AppMenu';
import LayersPanel from '../layers/LayersPanel';
import LayersToggle from '../layers/LayersToggle';
import MapContainer from '../map/MapContainer';
import BottomPanel from '../datatable/BottomPanel';
import LayerEdit from '../edit/LayerEdit';
import ContextMenu from '../map/ContextMenu';
import AlertSnackbar from '../alerts/AlertSnackbar';
import Message from '../message/Message';
import InterpretationsPanel from '../interpretations/InterpretationsPanel';
import DataDownloadDialog from '../layers/download/DataDownloadDialog';
import OpenAsMapDialog from '../openAs/OpenAsMapDialog';

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
            <MuiThemeProvider theme={theme}>
                <AppMenu />
                <InterpretationsPanel />
                <LayersPanel />
                <LayersToggle />
                <MapContainer />
                <BottomPanel />
                <LayerEdit />
                <ContextMenu />
                <AlertSnackbar />
                <Message />
                <DataDownloadDialog />
                <OpenAsMapDialog />
            </MuiThemeProvider>
        );
    }
}

export default App;
