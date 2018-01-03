import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import i18next from 'i18next';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Button from 'material-ui/FlatButton'; // TODO: Support buttons with without uppercase in d2-ui
// import Button from 'd2-ui/lib/button/Button';
import { openLayersDialog } from '../../actions/layers';
import { openFavoritesDialog } from '../../actions/ui';
import { openAboutDialog } from '../../actions/about';
import { LAYERS_PANEL_WIDTH } from '../../constants/layout';

import ArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';


const styles = {
    toolbar: {
        position: 'absolute',
        width: '100%',
        height: 40,
        backgroundColor: '#f3f3f3',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.227451)',
        zIndex: 1200,
    },
    addLayer: {
        position: 'relative',
        boxSizing: 'border-box',
        width: LAYERS_PANEL_WIDTH + 1,
        borderRight: '1px solid #ddd',
        textAlign: 'left',
        paddingLeft: 18,
    },
    dropDown: {
        position: 'absolute',
        top: 8,
        right: 8,
        fill: '#333',
    },
    button: {
        color: '#333',
        height: 40,
        margin: 0,
        paddingLeft: 16,
        paddingRight: 16,
        minWidth: 50,
    },
};

const AppMenu = ({ openLayersDialog, openFavoritesDialog, openAboutDialog, contextPath }) => (
    <Toolbar
        style={styles.toolbar}
        className='dhis-gis-menu'
    >
        <ToolbarGroup firstChild={true}>
            <Button
                onClick={openLayersDialog}
                style={{ ...styles.button, ...styles.addLayer }}
                icon={<ArrowDropDown style={styles.dropDown} />}
            >{i18next.t('Add layer')}</Button>
            <Button
                onClick={openFavoritesDialog}
                style={styles.button}
            >{i18next.t('Favorites')}</Button>
        </ToolbarGroup>
        <ToolbarGroup lastChild={true}>
            <Button
                onClick={openAboutDialog}
                style={styles.button}
            >{i18next.t('About')}</Button>
        </ToolbarGroup>
    </Toolbar>
);

AppMenu.contextTypes = {
  d2: PropTypes.object
};

export default connect(
    null,
    { openLayersDialog, openFavoritesDialog, openAboutDialog }
)(AppMenu);
