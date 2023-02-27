import i18n from '@dhis2/d2-i18n'
import { HeaderBar } from '@dhis2/ui'
import cx from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'
import AlertStack from '../alerts/AlertStack.js'
import BottomPanel from '../datatable/BottomPanel.js'
import DownloadMode from '../download/DownloadMode.js'
import LayerEdit from '../edit/LayerEdit.js'
import InterpretationsPanel from '../interpretations/InterpretationsPanel.js'
import LayersPanel from '../layers/LayersPanel.js'
import LayersToggle from '../layers/LayersToggle.js'
import LayersLoader from '../loaders/LayersLoader.js'
import ContextMenu from '../map/ContextMenu.js'
import MapPosition from '../map/MapPosition.js'
import OpenAsMapDialog from '../openAs/OpenAsMapDialog.js'
import OrgUnitProfile from '../orgunits/OrgUnitProfile.js'
import AppMenu from './AppMenu.js'
import styles from './styles/AppLayout.module.css'

const AppLayout = () => {
    const downloadMode = useSelector((state) => state.download.downloadMode)

    return (
        <>
            <HeaderBar appName={i18n.t('Maps')} />
            <div
                className={cx(styles.appLayout, {
                    [styles.downloadMode]: downloadMode,
                })}
            >
                {downloadMode ? (
                    <DownloadMode />
                ) : (
                    <>
                        <AppMenu />
                        <LayersToggle />
                        <LayersPanel />
                        <LayersLoader />
                    </>
                )}
                <MapPosition />
                <InterpretationsPanel />
                <BottomPanel />
                <LayerEdit />
                <ContextMenu />
                <AlertStack />
                <OpenAsMapDialog />
                <OrgUnitProfile />
            </div>
        </>
    )
}

export default AppLayout