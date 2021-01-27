import React, { Fragment, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
} from '@dhis2/ui';
import ValueTypeSelect from './ValueTypeSelect';
import DataSetSelect from './DataSetSelect';
import DataElementSelect from './DataElementSelect';
import NumberPrecision from './NumberPrecision';
import DataPreview from './DataPreview';
import { apiFetch } from '../../../util/api';
import { getPeriodFromFilter } from '../../../util/earthEngine';
import { numberPrecision } from '../../../util/numbers';
import { setAlert } from '../../../actions/alerts';

const ImportDialog = ({ layer, onClose, setAlert }) => {
    const [valueType, setValueType] = useState();
    const [dataSet, setDataSet] = useState();
    const [dataElement, setDataElement] = useState();
    const [precision, setPrecision] = useState();

    const {
        name,
        periodType = 'Yearly',
        filter,
        aggregationType = [],
        classes,
        data,
        legend,
    } = layer;

    const year = new Date().getFullYear();
    const period = getPeriodFromFilter(filter) || { id: year, name: year };
    const valueTypeItems = classes && legend ? legend.items : null;

    const setResponse = useCallback(
        response => {
            if (response && response.status === 'SUCCESS') {
                setAlert({
                    success: true,
                    message: i18n.t('Import process completed successfully'),
                });
            } else {
                setAlert({
                    cirtical: true,
                    message: `${i18n.t('Error')}: ${response.description}`,
                });
            }

            onClose();
        },
        [setAlert, onClose]
    );

    const onImportClick = useCallback(() => {
        const valueFormat = numberPrecision(precision);

        const dataValues = data.map(d => ({
            dataElement: dataElement.id,
            period: period.id,
            orgUnit: d.id,
            value: valueFormat(d.properties[valueType.id]),
        }));

        // https://docs.dhis2.org/2.35/en/dhis2_developer_manual/web-api.html#data-values
        // '/dataValueSets?importStrategy=CREATE_AND_UPDATE&dryRun=true',
        apiFetch('/dataValueSets', 'POST', {
            dataValues,
        })
            .then(response => response.json())
            .then(setResponse);
    }, [period, valueType, dataSet, dataElement, data, precision]);

    // console.log('data', data);

    return (
        <Modal position="middle" small onClose={onClose}>
            <ModalTitle>{`${i18n.t('Import data')}: ${name}`}</ModalTitle>
            <ModalContent>
                {period && (
                    <div>
                        {i18n.t('Period')}: {period.name}
                    </div>
                )}
                <ValueTypeSelect
                    value={valueType}
                    valueTypes={valueTypeItems}
                    defaultTypes={aggregationType}
                    onChange={setValueType}
                />
                <DataSetSelect
                    value={dataSet ? dataSet.id : null}
                    periodType={periodType}
                    onChange={setDataSet}
                />
                {dataSet && (
                    <DataElementSelect
                        dataSet={dataSet}
                        value={dataElement ? dataElement.id : null}
                        onChange={setDataElement}
                    />
                )}
                {valueType && dataSet && dataElement && (
                    <Fragment>
                        <NumberPrecision
                            precision={precision}
                            onChange={setPrecision}
                        />
                        <DataPreview
                            periodType={periodType}
                            period={period}
                            valueType={valueType}
                            dataSet={dataSet}
                            dataElement={dataElement}
                            data={data}
                            precision={precision}
                        />
                    </Fragment>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        primary
                        disabled={!valueType || !dataSet}
                        onClick={onImportClick}
                    >
                        {i18n.t('Import')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    );
};

ImportDialog.propTypes = {
    layer: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    setAlert: PropTypes.func.isRequired,
};

export default connect(null, { setAlert })(ImportDialog);
