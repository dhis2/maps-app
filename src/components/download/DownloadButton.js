import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useDispatch } from 'react-redux'
import { toggleDownloadMode } from '../../actions/download.js'
import { MenuButton } from '../core/index.js'
import DownloadDialog from './DownloadDialog.js'

const DownloadButton = () => {
    const dispatch = useDispatch()

    return (
        <>
            <MenuButton onClick={() => dispatch(toggleDownloadMode(true))}>
                {i18n.t('Download')}
            </MenuButton>
            <DownloadDialog />
        </>
    )
}

export default DownloadButton
