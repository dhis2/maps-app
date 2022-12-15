import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import cx from 'classnames';
import { Checkbox, FontStyle, LabelDisplayOptions } from '../../core';
import styles from '../styles/LayerDialog.module.css';

import {
    setLabels,
    setLabelFontColor,
    setLabelFontSize,
    setLabelFontWeight,
    setLabelFontStyle,
    setLabelTemplate,
} from '../../../actions/layerEdit';

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
                                <div>{i18n.t('Label font style')}</div>
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
    );
};

Labels.propTypes = {
    includeDisplayOption: PropTypes.bool,
    labels: PropTypes.bool,
    labelTemplate: PropTypes.string,
    labelFontColor: PropTypes.string,
    labelFontSize: PropTypes.string,
    labelFontStyle: PropTypes.string,
    labelFontWeight: PropTypes.string,
    setLabels: PropTypes.func.isRequired,
    setLabelTemplate: PropTypes.func.isRequired,
    setLabelFontColor: PropTypes.func.isRequired,
    setLabelFontSize: PropTypes.func.isRequired,
    setLabelFontWeight: PropTypes.func.isRequired,
    setLabelFontStyle: PropTypes.func.isRequired,
};

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
)(Labels);
