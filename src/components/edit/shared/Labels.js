import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import {
    setLabels,
    setLabelFontColor,
    setLabelFontSize,
    setLabelFontWeight,
    setLabelFontStyle,
} from '../../../actions/layerEdit.js'
import { Checkbox, FontStyle } from '../../core/index.js'
import styles from '../styles/LayerDialog.module.css'

const Labels = ({
    labels,
    labelFontColor,
    labelFontSize,
    labelFontStyle,
    labelFontWeight,
    setLabels,
    setLabelFontColor,
    setLabelFontSize,
    setLabelFontWeight,
    setLabelFontStyle,
}) => {
    return (
        <div className={cx(styles.flexInnerColumnFlow)}>
            <div>
                <Checkbox
                    label={i18n.t('Labels')}
                    checked={labels}
                    onChange={setLabels}
                />
                {labels && (
                    <FontStyle
                        color={labelFontColor}
                        size={labelFontSize}
                        weight={labelFontWeight}
                        fontStyle={labelFontStyle}
                        onColorChange={setLabelFontColor}
                        onSizeChange={setLabelFontSize}
                        onWeightChange={setLabelFontWeight}
                        onStyleChange={setLabelFontStyle}
                    />
                )}
            </div>
        </div>
    )
}

Labels.propTypes = {
    setLabelFontColor: PropTypes.func.isRequired,
    setLabelFontSize: PropTypes.func.isRequired,
    setLabelFontStyle: PropTypes.func.isRequired,
    setLabelFontWeight: PropTypes.func.isRequired,
    setLabels: PropTypes.func.isRequired,
    labelFontColor: PropTypes.string,
    labelFontSize: PropTypes.string,
    labelFontStyle: PropTypes.string,
    labelFontWeight: PropTypes.string,
    labels: PropTypes.bool,
}

export default connect(
    ({ layerEdit }) => ({
        labels: layerEdit.labels,
        labelFontColor: layerEdit.labelFontColor,
        labelFontSize: layerEdit.labelFontSize,
        labelFontStyle: layerEdit.labelFontStyle,
        labelFontWeight: layerEdit.labelFontWeight,
    }),
    {
        setLabels,
        setLabelFontColor,
        setLabelFontSize,
        setLabelFontWeight,
        setLabelFontStyle,
    }
)(Labels)
