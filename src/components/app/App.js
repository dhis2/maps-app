import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import appTheme from './app.theme'; // TODO: Delete file
import MapProvider from '../map/MapProvider';
import AppHeader from './AppHeader';
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

// Makes d2 available in all child components
// Not using AppWithD2 from d2-ui because it requires d2 to be a promise
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

    // TODO: Remove MuiThemeProvider
    // <MuiThemeProvider muiTheme={appTheme}>
    render() {
        return (
            <React.Fragment>
                <MuiThemeProvider>
                    <MapProvider>
                        <div id="dhis-gis-container">
                            <AppHeader />
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
                        </div>
                    </MapProvider>
                </MuiThemeProvider>
            </React.Fragment>
        );
    }
}

export default App;
