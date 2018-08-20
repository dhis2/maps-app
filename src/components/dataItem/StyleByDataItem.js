import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import DataItemSelect from './DataItemSelect';
import DataItemStyle from './DataItemStyle';

import { setStyleDataItem } from '../../actions/layerEdit';

export const StyleByDataItem = ({
    program,
    programStage,
    styleDataItem,
    setStyleDataItem,
}) => [
    <DataItemSelect
        key="select"
        label={i18n.t('Style by data item')}
        program={program}
        programStage={programStage}
        allowNone={true}
        value={styleDataItem ? styleDataItem.id : null}
        onChange={setStyleDataItem}
        // style={styles.select}
    />,
    styleDataItem && <DataItemStyle key="style" dataItem={styleDataItem} />,
];

StyleByDataItem.propTypes = {
    setStyleDataItem: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        program: layerEdit.program,
        programStage: layerEdit.programStage,
        styleDataItem: layerEdit.styleDataItem,
    }),
    { setStyleDataItem }
)(StyleByDataItem);

/*
<DataItemStyle
key="style"
// method={method}
// classes={classes}
//colorScale={colorScale}
// style={styles.select}
// {...styleDataItem}
/>,
*/
