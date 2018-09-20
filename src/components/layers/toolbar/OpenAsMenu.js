import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowIcon from '@material-ui/icons/KeyboardArrowRight';

const styles = {
    icon: {
        margin: 4,
    },
    menuItem: {
        lineHeight: '32px',
        minHeight: 32,
        fontSize: 14,
    },
};

// NB! Created with an older version of Material-UI
const OpenAsMenu = ({ id }) => (
    <MenuItem
        primaryText={`${i18n.t('Open as')} ...`}
        rightIcon={<ArrowIcon style={styles.icon} />}
        menuItems={[
            <MenuItem
                key="pivot"
                primaryText={i18n.t('Pivot')}
                style={styles.menuItem}
            />,
            <MenuItem
                key="chart"
                primaryText={i18n.t('Chart')}
                style={styles.menuItem}
            />,
        ]}
        style={styles.menuItem}
    />
);

OpenAsMenu.propTypes = {
    id: PropTypes.string.isRequired,
};

export default OpenAsMenu;
