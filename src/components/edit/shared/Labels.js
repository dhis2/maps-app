import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import cx from 'classnames';
import { Checkbox, FontStyle } from '../../core';
import styles from '../styles/LayerDialog.module.css';

import {
    setLabels,
    setLabelFontColor,
    setLabelFontSize,
    setLabelFontWeight,
    setLabelFontStyle,
} from '../../../actions/layerEdit';

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
    );
};

Labels.propTypes = {
    labels: PropTypes.bool,
    labelFontColor: PropTypes.string,
    labelFontSize: PropTypes.string,
    labelFontStyle: PropTypes.string,
    labelFontWeight: PropTypes.string,
    setLabels: PropTypes.func.isRequired,
    setLabelFontColor: PropTypes.func.isRequired,
    setLabelFontSize: PropTypes.func.isRequired,
    setLabelFontWeight: PropTypes.func.isRequired,
    setLabelFontStyle: PropTypes.func.isRequired,
};

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
)(Labels);
