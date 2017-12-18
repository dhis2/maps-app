import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import appTheme from './app.theme';
import MapProvider from '../map/MapProvider';
import AppMenu from './AppMenu';
import AddOverlayDialog from '../layers/overlays/AddOverlayDialog';
import FavoritesDialog from '../favorites/FavoritesDialog';
import LayersPanel from '../layers/LayersPanel';
import LayersToggle from '../layers/LayersToggle';
import Map from '../map/Map';
import BottomPanel from "../datatable/BottomPanel";
import LayerEdit from '../edit/LayerEdit';
import ContextMenu from '../map/ContextMenu';
import OrgUnitDialog from '../orgunits/OrgUnitDialog';
import RelocateDialog from '../orgunits/RelocateDialog';
import AboutDialog from '../about/AboutDialog';

// Makes d2 available in all child components
// Not using AppWithD2 from d2-ui because it requires d2 to be a promise
class App extends Component {

    static childContextTypes = {
        d2: PropTypes.object.isRequired,
    };

    getChildContext() {
        return {
            d2: this.props.d2
        };
    }

    render () {
        return (
            <MuiThemeProvider muiTheme={appTheme}>
                <MapProvider>
                    <div id="dhis-gis-container">
                        <AppMenu />
                        <AddOverlayDialog />
                        <FavoritesDialog />
                        <LayersPanel />
                        <LayersToggle />
                        <Map />
                        <BottomPanel />
                        <LayerEdit />
                        <ContextMenu />
                        <OrgUnitDialog />
                        <RelocateDialog />
                        <AboutDialog />
                    </div>
                </MapProvider>
            </MuiThemeProvider>
        )
    }
}

export default App;
