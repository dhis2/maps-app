import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { loadLegendSets } from '../../actions/legendSets';
import { setLegendSet } from '../../actions/layerEdit';

const style = {
    width: '100%',
};

export class LegendSetSelect extends Component {
    static propTypes = {
        legendSet: PropTypes.object,
        legendSets: PropTypes.array,
        legendSetError: PropTypes.string,
        loadLegendSets: PropTypes.func.isRequired,
        setLegendSet: PropTypes.func.isRequired,
    };

    componentDidMount() {
        const { legendSets, loadLegendSets } = this.props;

        if (!legendSets) {
            loadLegendSets();
        }
    }

    render() {
        const {
            legendSet,
            legendSets,
            legendSetError,
            setLegendSet,
        } = this.props;

        return (
            <SelectField
                label={i18n.t('Legend set')}
                loading={legendSets ? false : true}
                items={legendSets}
                value={legendSet ? legendSet.id : null}
                errorText={legendSetError}
                onChange={setLegendSet}
                style={style}
            />
        );
    }
}

export default connect(
    state => ({
        legendSet: state.layerEdit.legendSet,
        legendSets: state.legendSets,
    }),
    { loadLegendSets, setLegendSet }
)(LegendSetSelect);
