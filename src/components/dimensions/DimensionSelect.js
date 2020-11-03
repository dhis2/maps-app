import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Popover } from '@dhis2/ui';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { DimensionsPanel } from '@dhis2/d2-ui-analytics';
import { loadDimensions } from '../../actions/dimensions';
import styles from './styles/DimensionSelect.module.css';

// https://github.com/dhis2/dashboards-app/blob/master/src/components/ItemFilter/FilterSelector.js
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
        const { dimension, dimensions, onChange } = this.props;

        if (dim !== dimension) {
            onChange(dimensions[dim]);
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
                <div onClick={this.onOpen} className={styles.dropdown}>
                    <label>{i18n.t('Dimension')}</label>
                    <div>{selected ? selected.name : ''}</div>
                    <ArrowDropDownIcon />
                </div>
                {anchorEl && (
                    <Popover
                        open={!!anchorEl}
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        onClose={this.onClose}
                        classes={{ paper: styles.dimensions }}
                    >
                        <DimensionsPanel
                            dimensions={dimensions}
                            onDimensionClick={this.onDimensionClick}
                            selectedIds={[dimension]}
                        />
                    </Popover>
                )}
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
