import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setLegendSet } from '../../actions/layerEdit.js'
import { loadLegendSets } from '../../actions/legendSets.js'
import { SelectField } from '../core/index.js'

const style = {
    width: '100%',
}

class LegendSetSelect extends Component {
    static propTypes = {
        loadLegendSets: PropTypes.func.isRequired,
        setLegendSet: PropTypes.func.isRequired,
        legendSet: PropTypes.object,
        legendSetError: PropTypes.string,
        legendSets: PropTypes.array,
    }

    componentDidMount() {
        const { legendSets, loadLegendSets } = this.props

        if (!legendSets) {
            loadLegendSets()
        }
    }

    render() {
        const { legendSet, legendSets, legendSetError, setLegendSet } =
            this.props

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
        )
    }
}

export default connect(
    (state) => ({
        legendSet: state.layerEdit.legendSet,
        legendSets: state.legendSets,
    }),
    { loadLegendSets, setLegendSet }
)(LegendSetSelect)
