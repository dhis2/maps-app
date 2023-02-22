import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch } from 'react-redux'
import { setDownloadProperty } from '../../actions/download.js'
import { Checkbox } from '../core/index.js'
import styles from './styles/LegendLayers.module.css'

const LegendLayers = ({ layers, show }) => {
    const dispatch = useDispatch()

    return (
        <div className={styles.legendLayers}>
            {layers
                .map(({ id, name }) => (
                    <Checkbox
                        key={id}
                        label={name}
                        checked={show.includes(id)}
                        onChange={(checked) =>
                            dispatch(
                                setDownloadProperty({
                                    showInLegend: checked
                                        ? [...show, id]
                                        : show.filter((l) => l !== id),
                                })
                            )
                        }
                    />
                ))
                .reverse()}
        </div>
    )
}

LegendLayers.propTypes = {
    layers: PropTypes.array.isRequired,
    show: PropTypes.PropTypes.array,
}

export default LegendLayers
