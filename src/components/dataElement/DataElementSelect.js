import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import { connect } from 'react-redux';
import { SelectField } from '@dhis2/d2-ui-core';
import { loadDataElements } from '../../actions/dataElements';

export class DataElementSelect extends PureComponent {
    static propTypes = {
        dataElement: PropTypes.object,
        dataElements: PropTypes.object,
        dataElementGroup: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidUpdate() {
        const { dataElements, dataElementGroup, loadDataElements } = this.props;

        if (dataElementGroup && !dataElements[dataElementGroup.id]) {
            loadDataElements(dataElementGroup.id);
        }
    }

    render() {
        const {
            dataElement,
            dataElements,
            dataElementGroup,
            onChange,
            style,
        } = this.props;

        if (!dataElementGroup) {
            return null;
        }

        const items = dataElements[dataElementGroup.id];

        return (
            <SelectField
                key="indicators"
                label={i18next.t('Data element')}
                loading={items ? false : true}
                items={items}
                value={dataElement ? dataElement.id : null}
                onChange={dataElement => onChange(dataElement, 'dataElement')}
                style={style}
            />
        );
    }
}

export default connect(
    state => ({
        dataElements: state.dataElements,
    }),
    { loadDataElements }
)(DataElementSelect);
