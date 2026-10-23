import i18n from '@dhis2/d2-i18n'
import React, { useState } from 'react'
import styles from '../download/styles/DownloadButton.module.css'
import OsmImportModal from './OsmImportModal.jsx'

const OsmImportButton = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button className={styles.button} onClick={() => setIsOpen(true)}>
                {i18n.t('Import OSM')}
            </button>
            {isOpen && <OsmImportModal onClose={() => setIsOpen(false)} />}
        </>
    )
}

export default OsmImportButton
