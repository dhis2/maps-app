import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import DimensionSelect from './DimensionSelect';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { Tooltip } from '@material-ui/core';

const styles = () => ({});

class DimensionRow extends Component {
    render() {
        return (
            <div>
                <DimensionSelect />
            </div>
        );
    }
}

export default withStyles(styles)(DimensionRow);
