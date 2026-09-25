import i18n from '@dhis2/d2-i18n'
import { IconEmptyFrame16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import ToolbarIconButton from './ToolbarIconButton.jsx'

const ShowInViewControl = ({ active, onClick }) => (
    <ToolbarIconButton
        tooltip={i18n.t('Show only features in current map view')}
        onClick={onClick}
        active={active}
    >
        <IconEmptyFrame16 />
    </ToolbarIconButton>
)

ShowInViewControl.propTypes = {
    onClick: PropTypes.func.isRequired,
    active: PropTypes.bool,
}

export default ShowInViewControl
