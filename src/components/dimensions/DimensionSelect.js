import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import { DimensionsPanel } from '@dhis2/d2-ui-analytics';
import { loadDimensions } from '../../actions/dimensions';

// Inspired by: https://github.com/dhis2/dashboards-app/blob/feat/period-filter/src/components/ItemFilter/FilterSelector.js
export class DimensionSelect extends Component {
    static propTypes = {
        dimension: PropTypes.string,
        dimensions: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        loadDimensions: PropTypes.func.isRequired,
        style: PropTypes.object,
        errorText: PropTypes.string,
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
        const { dimension, onChange } = this.props;

        if (dim !== dimension) {
            onChange({ id: dim });
        }

        this.setState({ anchorEl: null });
    };

    render() {
        const { dimension, dimensions } = this.props;
        const { anchorEl } = this.state;

        if (!dimensions) {
            return null;
        }

        const selected = dimensions[dimension];

        return (
            <Fragment>
                <TextField
                    label={i18n.t('Dimension')}
                    onClick={this.onOpen}
                    style={{ width: 200 }}
                    value={selected ? selected.name : ''}
                />
                <Popover
                    open={!!anchorEl}
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    onClose={this.onClose}
                    style={{ height: '100%' }}
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
)(DimensionSelect);
