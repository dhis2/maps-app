import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import { Popover, TextField } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown ';
import { DimensionsPanel } from '@dhis2/d2-ui-analytics';
import { loadDimensions } from '../../actions/dimensions';

const styles = {
    dropdown: {
        display: 'inline-block',
        width: '40%',
        position: 'relative',
        paddingRight: 24,
    },
    textField: {
        margin: '12px 0',
    },
    input: {
        '& input': {
            cursor: 'pointer',
            color: '#000',
        },
    },
    icon: {
        position: 'absolute',
        top: 32,
        right: 24,
    },
    dimensions: {
        width: 400,
        marginTop: -13,
        marginLeft: -8,
    },
};

export class DimensionSelect extends Component {
    static propTypes = {
        dimension: PropTypes.string,
        dimensions: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        loadDimensions: PropTypes.func.isRequired,
        style: PropTypes.object,
        errorText: PropTypes.string,
        classes: PropTypes.object.isRequired,
    };

    state = {
        anchorEl: null,
    };

    componentDidMount() {
        const { dimensions, loadDimensions } = this.props;

        if (!dimensions) {
            loadDimensions();
        }
    }

    onOpen = evt => {
        this.setState({ anchorEl: evt.currentTarget });
    };

    onClose = () => {
        this.setState({ anchorEl: null });
    };

    onDimensionClick = dim => {
        const { dimension, dimensions, onChange } = this.props;

        if (dim !== dimension) {
            onChange(dimensions[dim]);
        }

        this.setState({ anchorEl: null });
    };

    render() {
        const { dimension, dimensions, classes } = this.props;
        const { anchorEl } = this.state;

        if (!dimensions) {
            return null;
        }

        const selected = dimensions[dimension];

        return (
            <Fragment>
                <div onClick={this.onOpen} className={classes.dropdown}>
                    <TextField
                        label={i18n.t('Dimension')}
                        value={selected ? selected.name : ''}
                        fullWidth={true}
                        className={classes.textField}
                        InputProps={{
                            autoFocus: false,
                            className: classes.input,
                            disabled: true,
                        }}
                    />
                    <ArrowDropDownIcon className={classes.icon} />
                </div>
                <Popover
                    open={!!anchorEl}
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    onClose={this.onClose}
                    classes={{ paper: classes.dimensions }}
                >
                    <DimensionsPanel
                        dimensions={dimensions}
                        onDimensionClick={this.onDimensionClick}
                        selectedIds={[dimension]}
                    />
                </Popover>
            </Fragment>
        );
    }
}

export default connect(
    ({ dimensions }) => ({
        dimensions: dimensions
            ? dimensions.reduce((obj, dim) => {
                  obj[dim.id] = dim;
                  return obj;
              }, {})
            : null,
    }),
    { loadDimensions }
)(withStyles(styles)(DimensionSelect));
