import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    setNoDataLegend,
    setUnclassifiedLegend,
} from '../../actions/layerEdit.js'
import {
    numberValueTypes,
    booleanValueTypes,
} from '../../constants/valueTypes.js'
import NumericLegendStyle from '../classification/NumericLegendStyle.jsx'
import NoDataLegend from '../edit/shared/NoDataLegend.jsx'
import UnclassifiedLegend from '../edit/shared/UnclassifiedLegend.jsx'
import OptionSetStyle from '../optionSet/OptionSetStyle.jsx'
import BooleanStyle from './BooleanStyle.jsx'

const DataItemStyle = ({ dataItem, style }) => {
    const noDataLegend = useSelector((state) => state.layerEdit.noDataLegend)
    const unclassifiedLegend = useSelector(
        (state) => state.layerEdit.unclassifiedLegend
    )
    const dispatch = useDispatch()

    if (!dataItem) {
        return null
    }

    const { valueType, optionSet } = dataItem
    const hasClassification =
        numberValueTypes.includes(valueType) ||
        booleanValueTypes.includes(valueType) ||
        !!optionSet

    return (
        <div style={style}>
            {!optionSet && numberValueTypes.includes(valueType) ? (
                <NumericLegendStyle
                    dataItem={dataItem}
                    style={{ width: '100%' }}
                />
            ) : null}

            {!optionSet && booleanValueTypes.includes(valueType) ? (
                <BooleanStyle {...dataItem} />
            ) : null}

            {optionSet ? <OptionSetStyle styledOptionSet={optionSet} /> : null}

            {hasClassification && (
                <UnclassifiedLegend
                    label={i18n.t('Include unclassified events')}
                    value={unclassifiedLegend}
                    onChange={(v) => dispatch(setUnclassifiedLegend(v))}
                />
            )}
            <NoDataLegend
                label={i18n.t('Include events with no data')}
                value={noDataLegend}
                onChange={(v) => dispatch(setNoDataLegend(v))}
            />
        </div>
    )
}

DataItemStyle.propTypes = {
    dataItem: PropTypes.object,
    style: PropTypes.object,
}

export default DataItemStyle
