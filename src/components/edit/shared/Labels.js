import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import {
    setLabels,
    setLabelFontColor,
    setLabelFontSize,
    setLabelFontWeight,
    setLabelFontStyle,
    setLabelTemplate,
} from '../../../actions/layerEdit.js'
import { LABEL_TEMPLATE_NAME_ONLY } from '../../../constants/layers.js'
import { Checkbox, FontStyle, LabelDisplayOptions } from '../../core/index.js'
import styles from '../styles/LayerDialog.module.css'

const Labels = ({
    includeDisplayOption,
    labels,
    labelTemplate,
    labelFontColor,
    labelFontSize,
    labelFontStyle,
    labelFontWeight,
    setLabels,
    setLabelTemplate,
    setLabelFontColor,
    setLabelFontSize,
    setLabelFontWeight,
    setLabelFontStyle,
}) => {
    useEffect(() => {
        if (labels && includeDisplayOption && !labelTemplate) {
            setLabelTemplate(LABEL_TEMPLATE_NAME_ONLY)
        }
    }, [labels, includeDisplayOption, labelTemplate, setLabelTemplate])

    return (
        <div className={cx(styles.flexInnerColumnFlow)}>
            <div>
                <Checkbox
                    label={i18n.t('Labels')}
                    checked={labels}
                    onChange={setLabels}
                />
                {labels && (
                    <>
                        {includeDisplayOption && (
                            <div className={styles.labelDisplayOptions}>
                                <LabelDisplayOptions
                                    option={labelTemplate}
                                    onDisplayOptionChange={setLabelTemplate}
                                />
                            </div>
                        )}
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
                    </>
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
    setLabelTemplate: PropTypes.func.isRequired,
    setLabels: PropTypes.func.isRequired,
    includeDisplayOption: PropTypes.bool,
    labelFontColor: PropTypes.string,
    labelFontSize: PropTypes.string,
    labelFontStyle: PropTypes.string,
    labelFontWeight: PropTypes.string,
    labelTemplate: PropTypes.string,
    labels: PropTypes.bool,
}

export default connect(
    ({ layerEdit }) => ({
        labels: layerEdit.labels,
        labelTemplate: layerEdit.labelTemplate,
        labelFontColor: layerEdit.labelFontColor,
        labelFontSize: layerEdit.labelFontSize,
        labelFontStyle: layerEdit.labelFontStyle,
        labelFontWeight: layerEdit.labelFontWeight,
    }),
    {
        setLabels,
        setLabelTemplate,
        setLabelFontColor,
        setLabelFontSize,
        setLabelFontWeight,
        setLabelFontStyle,
    }
)(Labels)
