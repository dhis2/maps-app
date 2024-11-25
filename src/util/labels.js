import i18n from '@dhis2/d2-i18n';
import { cssColor } from './colors';
import {
    LABEL_FONT_SIZE,
    LABEL_FONT_STYLE,
    LABEL_FONT_WEIGHT,
    LABEL_FONT_COLOR,
} from '../constants/layers';

export const getLabelStyle = ({
    labelFontSize,
    labelFontStyle,
    labelFontWeight,
    labelFontColor,
}) => {
    const fontSize = labelFontSize || LABEL_FONT_SIZE;
    return {
        fontSize,
        fontStyle: labelFontStyle || LABEL_FONT_STYLE,
        fontWeight: labelFontWeight || LABEL_FONT_WEIGHT,
        lineHeight: parseInt(fontSize, 10) * 1.2 + 'px',
        color: cssColor(labelFontColor) || LABEL_FONT_COLOR,
        paddingTop: '10px',
        labelNoData: i18n.t('No data'),
    };
};
