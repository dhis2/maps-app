import i18n from '@dhis2/d2-i18n'
import { Button, InputField, NoticeBox } from '@dhis2/ui'
import React, { useState } from 'react'
import useOpenClimateService from '../../hooks/useOpenClimateService.js'
import LayerSource from './LayerSource.jsx'
import styles from './styles/OpenClimateServiceSource.module.css'

// The linked Open Climate Service instance, the default one until an administrator
// links another. Its published raster and vector datasets are listed, and the
// administrator chooses which are available to add to maps.
const OpenClimateServiceSource = () => {
    const {
        url,
        isDefault,
        layerSources,
        enabled,
        error,
        link,
        unlink,
        setVisibility,
    } = useOpenClimateService()
    const [isChanging, setIsChanging] = useState(false)
    const [value, setValue] = useState('')
    const [linkError, setLinkError] = useState()
    const [isLinking, setIsLinking] = useState(false)

    const onCancel = () => {
        setIsChanging(false)
        setValue('')
        setLinkError(null)
    }

    const onLink = () => {
        setIsLinking(true)
        setLinkError(null)
        link(value)
            .then(onCancel)
            .catch(() =>
                setLinkError(
                    i18n.t(
                        'Could not connect to an Open Climate Service at this address'
                    )
                )
            )
            .finally(() => setIsLinking(false))
    }

    return (
        <>
            <div
                className={styles.source}
                data-test="openclimateservice-source"
            >
                <h2>{i18n.t('Open Climate Service')}</h2>
                <p>
                    {i18n.t(
                        'Climate and earth observation data published by an Open Climate Service instance.'
                    )}
                </p>
                {url && !isChanging && (
                    <div className={styles.linked}>
                        <span>
                            {i18n.t('Linked to')} <strong>{url}</strong>
                            {isDefault && ` (${i18n.t('default')})`}
                        </span>
                        <Button
                            small
                            secondary
                            onClick={() => setIsChanging(true)}
                        >
                            {i18n.t('Change')}
                        </Button>
                        {!isDefault && (
                            <Button small secondary onClick={unlink}>
                                {i18n.t('Use default')}
                            </Button>
                        )}
                    </div>
                )}
                {isChanging && (
                    <div className={styles.link}>
                        <InputField
                            dense
                            label={i18n.t('Address')}
                            placeholder="https://climate.example.org"
                            value={value}
                            validationText={linkError}
                            error={!!linkError}
                            onChange={({ value }) => setValue(value)}
                            className={styles.input}
                        />
                        <Button
                            small
                            primary
                            disabled={!value.trim()}
                            loading={isLinking}
                            onClick={onLink}
                        >
                            {i18n.t('Link')}
                        </Button>
                        <Button small secondary onClick={onCancel}>
                            {i18n.t('Cancel')}
                        </Button>
                    </div>
                )}
                {url && error && (
                    <NoticeBox warning className={styles.notice}>
                        {i18n.t('The Open Climate Service is not responding')}
                    </NoticeBox>
                )}
            </div>
            {layerSources.map((layerSource) => {
                const { datasetId } = layerSource.config
                return (
                    <LayerSource
                        key={layerSource.layerId}
                        layerSource={layerSource}
                        isAdded={enabled.includes(datasetId)}
                        onShow={() => setVisibility(datasetId, true)}
                        onHide={() => setVisibility(datasetId, false)}
                    />
                )
            })}
        </>
    )
}

export default OpenClimateServiceSource
