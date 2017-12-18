import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from 'material-ui/MenuItem';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';

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

const OpenAsMenu = ({ id }) => (
    <MenuItem
        primaryText='Open as ...'
        rightIcon={<SvgIcon icon='ArrowDropRight' style={styles.icon} />}
        menuItems={[
            <MenuItem primaryText="Pivot" style={styles.menuItem} />,
            <MenuItem primaryText="Chart" style={styles.menuItem} />,
        ]}
        style={styles.menuItem}
    />
);

OpenAsMenu.propTypes = {
    id: PropTypes.string.isRequired,
};

export default OpenAsMenu
