import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
// import { Button } from '@dhis2/d2-ui-core';
import Button from 'material-ui/FlatButton'; // TODO: Support buttons without uppercase in d2-ui
import AddLayer from '../layers/layers/AddLayer';
import FileMenu from './FileMenu';
import InterpretationsToggle from '../interpretations/InterpretationsToggle';
import { openAboutDialog } from '../../actions/about';

const styles = {
    toolbar: {
        position: 'absolute',
        width: '100%',
        height: 40,
        backgroundColor: '#f3f3f3',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.227451)',
        zIndex: 1200,
    },
    button: {
        color: '#333',
        height: 40,
        margin: 0,
        padding: '4px 16px 0 16px',
        minWidth: 50,
    },
};

export const AppMenu = ({ openAboutDialog }) => (
    <Toolbar style={styles.toolbar} className="dhis-gis-menu">
        <ToolbarGroup firstChild={true}>
            <AddLayer />
            <FileMenu />
            <InterpretationsToggle />
        </ToolbarGroup>
        <ToolbarGroup lastChild={true}>
            <Button onClick={openAboutDialog} style={styles.button}>
                {i18n.t('About')}
            </Button>
        </ToolbarGroup>
    </Toolbar>
);

AppMenu.propTypes = {
    openAboutDialog: PropTypes.func.isRequired,
};

export default connect(
    null,
    { openAboutDialog }
)(AppMenu);
