import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
// import SelectField from '../core/SelectField';
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

    componentDidMount() {
        const { dimensions, loadDimensions } = this.props;

        if (!dimensions) {
            loadDimensions();
        }
    }

    render() {
        const { dimension, dimensions, onChange } = this.props;

        if (!dimensions) {
            return null;
        }

        console.log('dimensions', dimensions);

        return (
            <Fragment>
                <TextField
                    label={i18n.t('Dimension')}
                    // className={classes.textField}
                    // value={this.state.currency}
                    // onChange={console.log}
                    // helperText="Please select your currency"
                    // margin="normal"
                    onClick={console.log}
                    style={{ width: 200 }}
                />
            </Fragment>
        );

        /*

                <Popover
                    open={true}
                    onClose={console.log}
                    style={{ height: '100%' }}
                >
                    <DimensionsPanel
                        dimensions={dimensions}
                        onDimensionClick={console.log}
                        selectedIds={['uIuxlbV1vRT']}
                    />
                </Popover>

        return (
            <SelectField
                label={i18n.t('Dimension')}
                loading={dimensions ? false : true}
                items={dimensions}
                value={dimension}
                onChange={onChange}
                //style={style}
                //errorText={!program && errorText ? errorText : null}
                data-test="dimensionselect"
                style={{ width: 200 }}
            />
        );
        */
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
