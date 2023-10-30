import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import React from 'react'
import useEarthEngineLayersStore from '../../../hooks/useEarthEngineLayersStore'
import styles from './styles/LayerRow.module.css'

const LayerCard = ({ layer }) => {
    const { storedLayers, addLayer, removeLayer } = useEarthEngineLayersStore()
    const { layerId, name, img, description, source } = layer
    const isAdded = storedLayers.includes(layerId)

    const add = () => addLayer(layerId)
    const remove = () => removeLayer(layerId)

    return (
        <tr className={styles.layerRow}>
            <td>
                {img ? (
                    <img src={img} className={styles.image} />
                ) : (
                    <div className={styles.noImage}>
                        {i18n.t('Earth Engine layer')}
                    </div>
                )}
            </td>
            <td>
                <h2>{name}</h2>
                <p>{description}</p>
                <p className={styles.source}>
                    {i18n.t('Source')}: {source}
                </p>
            </td>
            <td className={styles.action}>
                {isAdded ? (
                    <Button onClick={remove}>{i18n.t('Hide')}</Button>
                ) : (
                    <Button primary onClick={add}>
                        {i18n.t('Show')}
                    </Button>
                )}
            </td>
        </tr>
    )
}

export default LayerCard
