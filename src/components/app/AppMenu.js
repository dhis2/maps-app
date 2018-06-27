import React from 'react';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import AddLayer from '../layers/layers/AddLayer';
import FileMenu from './FileMenu';
import InterpretationsToggle from '../interpretations/InterpretationsToggle';

const style = {
    position: 'absolute',
    width: '100%',
    height: 40,
    backgroundColor: '#f3f3f3',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.227451)',
    zIndex: 1200,
};

export const AppMenu = () => (
    <Toolbar style={style} className="dhis-gis-menu">
        <ToolbarGroup firstChild={true}>
            <AddLayer />
            <FileMenu />
        </ToolbarGroup>
        <ToolbarGroup lastChild={true}>
            <InterpretationsToggle />
        </ToolbarGroup>
    </Toolbar>
);

export default AppMenu;
