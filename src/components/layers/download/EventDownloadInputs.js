import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { SelectField, Checkbox } from '../../core/index.js'
import styles from './styles/EventDownloadInputs.module.css'

const EventDownloadInputs = ({
    formatOptions,
    selectedFormatOption,
    humanReadableChecked,
    onChangeFormatOption,
    onCheckHumanReadable,
}) => (
    <>
        <div className={styles.headingDiv}>{i18n.t('GeoJSON Properties:')}</div>
        <div className={styles.selectField}>
            <SelectField
                label={i18n.t('ID Format')}
                items={formatOptions}
                value={selectedFormatOption}
                onChange={onChangeFormatOption}
            />
        </div>
        <Checkbox
            className={styles.checkboxRoot}
            label={i18n.t('Use human-readable keys')}
            checked={humanReadableChecked}
            onChange={onCheckHumanReadable}
        />
    </>
)
EventDownloadInputs.propTypes = {
    formatOptions: PropTypes.array.isRequired,
    humanReadableChecked: PropTypes.bool.isRequired,
    onChangeFormatOption: PropTypes.func.isRequired,
    onCheckHumanReadable: PropTypes.func.isRequired,
    selectedFormatOption: PropTypes.number,
}

export default EventDownloadInputs
