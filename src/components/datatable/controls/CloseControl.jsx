import i18n from '@dhis2/d2-i18n'
import { IconCross16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import ToolbarIconButton from './ToolbarIconButton.jsx'

const CloseControl = ({ onClick }) => (
    <ToolbarIconButton tooltip={i18n.t('Close')} onClick={onClick}>
        <IconCross16 />
    </ToolbarIconButton>
)

CloseControl.propTypes = {
    onClick: PropTypes.func.isRequired,
}

export default CloseControl
