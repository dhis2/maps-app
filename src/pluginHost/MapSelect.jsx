import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import styles from './styles/select.module.css'

export const MapSelect = ({ maps, loadError, onSelect, onClear }) => {
    const [mapId, setMapId] = useState('')

    const onSubmit = (event) => {
        event.preventDefault()
        const id = mapId.trim()
        if (id) {
            onSelect(id)
        }
    }

    const onClearClick = () => {
        setMapId('')
        onClear()
    }

    return (
        <>
            <form onSubmit={onSubmit} className={styles.form}>
                <label className={cx(styles.field, styles.mapId)}>
                    <span>Map id</span>
                    <input
                        type="text"
                        className={styles.input}
                        data-test="plugin-host-map-id-input"
                        list="plugin-host-maps"
                        value={mapId}
                        onChange={(event) => setMapId(event.target.value)}
                    />
                    <datalist id="plugin-host-maps">
                        {maps.map(({ id, name }) => (
                            <option key={id} value={id}>
                                {name}
                            </option>
                        ))}
                    </datalist>
                </label>
                <button type="submit" data-test="plugin-host-map-id-submit">
                    Show
                </button>
                <button type="button" onClick={onClearClick}>
                    Clear
                </button>
            </form>

            {loadError && <p data-test="plugin-host-load-error">{loadError}</p>}
        </>
    )
}

MapSelect.propTypes = {
    maps: PropTypes.arrayOf(
        PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })
    ).isRequired,
    onClear: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    loadError: PropTypes.string,
}
