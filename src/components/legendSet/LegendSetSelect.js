import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '@dhis2/d2-ui-core';
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

        return (
            <SelectField
                label={i18n.t('Legend set')}
                loading={legendSets ? false : true}
                items={legendSets}
                value={legendSet ? legendSet.id : null}
                onChange={onChange}
                style={style}
            />
        );
    }
}

export default connect(
    state => ({
        legendSets: state.legendSets,
    }),
    { loadLegendSets }
)(LegendSetSelect);
