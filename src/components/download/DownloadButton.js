import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useDispatch } from 'react-redux'
import { toggleDownloadDialog } from '../../actions/download.js'
import { MenuButton } from '../core/index.js'
import DownloadDialog from './DownloadDialog.js'

const DownloadButton = () => {
    const dispatch = useDispatch()

    return (
        <>
            <MenuButton onClick={() => dispatch(toggleDownloadDialog(true))}>
                {i18n.t('Download')}
            </MenuButton>
            <DownloadDialog />
        </>
    )
}

export default DownloadButton
