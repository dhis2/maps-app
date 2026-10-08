// eslint-disable-next-line import/no-unresolved -- package exports subpath
import { Plugin } from '@dhis2/app-runtime/experimental'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './styles/PluginHost.module.css'

const SIZE_PRESETS = {
    // About the plugin area of a new dashboard item (20 × 29 grid units)
    'New item': { width: 400, height: 520 },
    Wide: { width: 800, height: 500 },
    Small: { width: 300, height: 300 },
}
export const DEFAULT_SIZE = SIZE_PRESETS['New item']

// Space the dashboard keeps for its fullscreen controls (getAvailableDimensions)
const FULLSCREEN_CONTROLS_HEIGHT = 40

export const PluginHost = ({ pluginProps, size, onSizeChange }) => {
    const [hasError, setHasError] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const itemRef = useRef()

    useEffect(() => setHasError(false), [pluginProps])

    // Like the dashboard's slideshow fullscreen
    useEffect(() => {
        const onFullscreenChange = () =>
            setIsFullscreen(document.fullscreenElement === itemRef.current)
        document.addEventListener('fullscreenchange', onFullscreenChange)
        return () =>
            document.removeEventListener('fullscreenchange', onFullscreenChange)
    }, [])

    // Follows the item when it's resized by hand, like a dashboard item in
    // edit mode
    useEffect(() => {
        const observer = new ResizeObserver(([entry]) => {
            if (document.fullscreenElement) {
                return
            }
            const width = Math.round(entry.contentRect.width)
            const height = Math.round(entry.contentRect.height)
            onSizeChange((current) =>
                current.width === width && current.height === height
                    ? current
                    : { width, height }
            )
        })
        observer.observe(itemRef.current)
        return () => observer.disconnect()
    }, [onSizeChange])

    const itemSize = isFullscreen
        ? {
              width: '100%',
              height: window.innerHeight - FULLSCREEN_CONTROLS_HEIGHT,
          }
        : size

    // Stable identities: Plugin sends updated props whenever a prop changes
    const onError = useCallback(() => setHasError(true), [])
    const onInstallationStatusChange = useCallback(() => {}, [])

    return (
        <>
            {hasError && (
                <p data-test="plugin-host-error">
                    The plugin reported an error
                </p>
            )}

            <div className={styles.toolbar}>
                <button
                    type="button"
                    data-test="plugin-host-fullscreen"
                    onClick={() => itemRef.current.requestFullscreen()}
                >
                    View fullscreen
                </button>
                <select
                    aria-label="Item size"
                    value=""
                    onChange={(event) =>
                        onSizeChange(SIZE_PRESETS[event.target.value])
                    }
                >
                    <option value="" disabled>
                        Size presets
                    </option>
                    {Object.entries(SIZE_PRESETS).map(([name, preset]) => (
                        <option key={name} value={name}>
                            {`${name} (${preset.width} × ${preset.height})`}
                        </option>
                    ))}
                </select>
                <span data-test="plugin-host-size">
                    {`${size.width} × ${size.height}`}
                </span>
            </div>

            <div
                ref={itemRef}
                data-test="plugin-host-iframe-wrap"
                className={cx(styles.item, {
                    [styles.resizable]: !isFullscreen,
                })}
                style={{ width: itemSize.width, height: itemSize.height }}
            >
                <Plugin
                    pluginSource="plugin.html"
                    width={itemSize.width}
                    height={itemSize.height}
                    onError={onError}
                    onInstallationStatusChange={onInstallationStatusChange}
                    {...pluginProps}
                />
            </div>
        </>
    )
}

PluginHost.propTypes = {
    pluginProps: PropTypes.object.isRequired,
    size: PropTypes.shape({
        height: PropTypes.number,
        width: PropTypes.number,
    }).isRequired,
    onSizeChange: PropTypes.func.isRequired,
}
