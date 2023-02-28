import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useDispatch } from 'react-redux'
import { setDownloadMode } from '../../actions/download.js'
import { MenuButton } from '../core/index.js'

const DownloadButton = () => {
    const dispatch = useDispatch()

    return (
        <>
            <MenuButton onClick={() => dispatch(setDownloadMode(true))}>
                {i18n.t('Download')}
            </MenuButton>
        </>
    )
}

export default DownloadButton
