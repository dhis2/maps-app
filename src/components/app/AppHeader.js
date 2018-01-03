import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import { LAYERS_PANEL_WIDTH } from '../../constants/layout';
import HomeIcon from 'material-ui/svg-icons/action/home';

const styles = {
    header: {
        position: 'relative',
        boxSizing: 'border-box',
        height: 48,
        borderBottom: '1px solid #ddd',
    },
    logo: {
        position: 'absolute',
        width: LAYERS_PANEL_WIDTH,
        borderRight: '1px solid #ddd',
        height: '100%',
    },
    title: {
        position: 'absolute',
        left: LAYERS_PANEL_WIDTH,
        right: 0,
        height: '100%',
        fontFamily: 'Roboto, sans-serif',
        lineHeight: '48px',
        marginTop: 2,
        marginLeft: 16,
    },
    star: {
        verticalAlign: 'middle',
        marginTop: -5,
        marginRight: 16,
        fill: '#aaa',
    },
    homeBtn: {
        position: 'absolute',
        right: 0,
    },
    homeIcon: {
        fill: '#777',
    }
};

const AppHeader = ({ name, contextPath }) => (
    <div style={styles.header}>
        <div style={styles.logo}></div>
        <div style={styles.title}>
            {name ? [<SvgIcon icon='Star' style={styles.star} />, name]: i18next.t('Maps App')}
            <IconButton
                onClick={() => window.location.href = `${contextPath}/dhis-web-commons-about/redirect.action`}
                style={styles.homeBtn} iconStyle={styles.homeIcon}>
                <HomeIcon />
            </IconButton>
        </div>
    </div>
);

const mapStateToProps = (state) => ({
    name: state.map ? state.map.name : null,
});

export default connect(
    mapStateToProps,
)(AppHeader);
