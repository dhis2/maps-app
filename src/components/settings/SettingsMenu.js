import i18n from '@dhis2/d2-i18n'
import React, { useState } from 'react'
import {
    HoverMenuListItem,
    HoverMenuList,
    HoverMenuDropdown,
} from '@dhis2/analytics'
import { colors, IconWorld24 } from '@dhis2/ui'
import EarthEngineModal from './earthEngine/EarthEngineModal.js'
import { useUserSettings } from '../UserSettingsProvider.js'

const iconActiveColor = colors.grey700

const SettingsMenu = () => {
    const [earthEngineOpen, setEarthEngineOpen] = useState(false)
    const { isMapsAdmin } = useUserSettings()

    if (!isMapsAdmin) {
        return null
    }

    return (
        <>
            <HoverMenuDropdown label={i18n.t('Settings')}>
                <HoverMenuList dataTest="settings-menu-container">
                    <HoverMenuListItem
                        label={i18n.t('Earth Engine Layers')}
                        icon={<IconWorld24 color={iconActiveColor} />}
                        onClick={() => setEarthEngineOpen(true)}
                        dataTest="settings-menu-earth-engine-layers"
                    />
                </HoverMenuList>
            </HoverMenuDropdown>
            {earthEngineOpen && (
                <EarthEngineModal onClose={() => setEarthEngineOpen(false)} />
            )}
        </>
    )
}

export default SettingsMenu
