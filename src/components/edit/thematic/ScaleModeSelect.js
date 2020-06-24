import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../../core/SelectField';
import Bubbles from '../../legend/Bubbles';

// https://github.com/d3/d3-scale
// https://www.d3-graph-gallery.com/graph/bubble_legend.html
// https://makingmaps.net/2007/08/28/perceptual-scaling-of-map-symbols/
// https://codepen.io/mxfh/pen/pggXoW

// Function wrapper to delay i18n translation
const modes = () => [
    {
        id: 'linear',
        name: i18n.t('Linear'),
    },
    {
        id: 'perceptual',
        name: i18n.t('Perceptual'),
    },
];

const ScaleModeSelect = props => {
    const { value, radiusLow, radiusHigh, onChange } = props;

    return (
        <Fragment>
            <SelectField
                label={i18n.t('Symbol scaling')}
                items={modes()}
                value={value}
                onChange={mode => onChange(mode.id)}
            />
            <Bubbles radiusLow={radiusLow} radiusHigh={radiusHigh} />
        </Fragment>
    );
};

ScaleModeSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

export default ScaleModeSelect;
