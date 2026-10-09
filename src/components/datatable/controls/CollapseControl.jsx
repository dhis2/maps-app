import i18n from '@dhis2/d2-i18n'
import { IconChevronDown16, IconChevronUp16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import ToolbarIconButton from './ToolbarIconButton.jsx'

const CollapseControl = ({ isCollapsed, onClick }) => (
    <ToolbarIconButton
        tooltip={isCollapsed ? i18n.t('Restore') : i18n.t('Collapse')}
        onClick={onClick}
    >
        {isCollapsed ? <IconChevronUp16 /> : <IconChevronDown16 />}
    </ToolbarIconButton>
)

CollapseControl.propTypes = {
    isCollapsed: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
}

export default CollapseControl
