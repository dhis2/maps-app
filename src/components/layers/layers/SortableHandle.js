import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { SortableHandle } from 'react-sortable-hoc';

const styles = theme => ({
    svg: {
        width: 24,
        height: 24,
        position: 'absolute',
        left: 6,
        top: 16,
        cursor: 'ns-resize',
        fill: theme.colors.greyBlack,
    },
});

const Handle = ({ classes }) => (
    <svg className={classes.svg} viewBox="0 0 24 24">
        <path d="M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z" />
    </svg>
);

Handle.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SortableHandle(Handle));
