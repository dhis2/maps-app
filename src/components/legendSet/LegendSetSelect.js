import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadLegendSets } from '../../actions/legendSets';

export class LegendSetSelect extends Component {

    static propTypes = {
        legendSet: PropTypes.object,
        legendSets: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        const { legendSets, loadLegendSets } = this.props;

        if (!legendSets) {
            loadLegendSets();
        }
    }

    render() {
        const { legendSet, legendSets, onChange, style } = this.props;

        if (!legendSets) {
            return null; // TODO: Add loading indicator
        }

        return (
            <SelectField
                label={i18next.t('Legend set')}
                items={legendSets}
                value={legendSet ? legendSet.id : null}
                onChange={onChange}
                style={style}
            />
        );
    }
}

export default connect(
    (state) => ({
        legendSets: state.legendSets,
    }),
    { loadLegendSets }
)(LegendSetSelect);
