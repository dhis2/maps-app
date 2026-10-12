import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalContent,
    ModalTitle,
    Transfer,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import styles from './styles/ColumnsModal.module.css'

const getDefaultColumns = (allHeaders) =>
    allHeaders.filter((h) => !h.hidden).map((h) => h.dataKey)

const ColumnsModal = ({ allHeaders, selected, onApply, onClose }) => {
    const [picked, setPicked] = useState(selected)

    const options = allHeaders.map(({ name, dataKey }) => ({
        label: name,
        value: dataKey,
    }))

    const defaults = getDefaultColumns(allHeaders)
    const isDefault =
        picked.length === defaults.length &&
        picked.every((key, i) => key === defaults[i])

    return (
        <Modal
            large
            position="middle"
            onClose={onClose}
            dataTest="columns-modal"
        >
            <ModalTitle>{i18n.t('Manage data table columns')}</ModalTitle>
            <ModalContent>
                <Transfer
                    options={options}
                    selected={picked}
                    onChange={({ selected }) => setPicked(selected)}
                    enableOrderChange
                    filterable
                    filterPlaceholder={i18n.t('Search available columns')}
                    rightHeader={
                        <p className={styles.rightHeader}>
                            {i18n.t('Selected columns')}
                        </p>
                    }
                    selectedEmptyComponent={
                        <p className={styles.empty}>
                            {i18n.t('Add at least one column')}
                        </p>
                    }
                    height="320px"
                    optionsWidth="340px"
                    selectedWidth="340px"
                />
            </ModalContent>
            <div className={styles.actions}>
                <Button
                    secondary
                    disabled={isDefault}
                    onClick={() => setPicked(defaults)}
                >
                    {i18n.t('Reset to default')}
                </Button>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        primary
                        disabled={!picked.length}
                        onClick={() => onApply(picked)}
                        dataTest="columns-modal-apply"
                    >
                        {i18n.t('Update columns')}
                    </Button>
                </ButtonStrip>
            </div>
        </Modal>
    )
}

ColumnsModal.propTypes = {
    allHeaders: PropTypes.arrayOf(
        PropTypes.shape({
            dataKey: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            hidden: PropTypes.bool,
        })
    ).isRequired,
    selected: PropTypes.arrayOf(PropTypes.string).isRequired,
    onApply: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default ColumnsModal
