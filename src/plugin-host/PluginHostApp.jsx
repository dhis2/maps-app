// eslint-disable-next-line import/no-unresolved -- package exports subpath
import { Plugin } from '@dhis2/app-runtime/experimental'
import React, { useCallback, useEffect, useRef, useState } from 'react'

// About the plugin area of a new dashboard item (20 × 29 grid units)
const DEFAULT_SIZE = { width: 400, height: 520 }
// Space the dashboard keeps for its fullscreen controls (getAvailableDimensions)
const FULLSCREEN_CONTROLS_HEIGHT = 40

// The props a dashboard sends for a map item it hasn't loaded itself
const getMapIdProps = (id) => ({
    isVisualizationLoaded: true,
    forDashboard: true,
    displayProperty: 'name',
    visualization: { id },
    cacheId: `plugin-host-${id}`,
    isParentCached: false,
})

export const PluginHostApp = () => {
    // Cypress sets the initial props and size before the page loads
    // (window.pluginProps, window.pluginSize) and changes them later through
    // the window setters below
    const [pluginProps, setPluginProps] = useState(() => window.pluginProps)
    const [size, setSize] = useState(() => window.pluginSize ?? DEFAULT_SIZE)
    const [mapIdInput, setMapIdInput] = useState('')
    const [mapId, setMapId] = useState('')
    const [hasError, setHasError] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const itemRef = useRef()

    // Like the dashboard's slideshow, which shows an item fullscreen: the
    // plugin reacts to the fullscreenchange event in its parent document
    useEffect(() => {
        const onFullscreenChange = () =>
            setIsFullscreen(
                Boolean(itemRef.current) &&
                    document.fullscreenElement === itemRef.current
            )
        document.addEventListener('fullscreenchange', onFullscreenChange)
        return () =>
            document.removeEventListener('fullscreenchange', onFullscreenChange)
    }, [])

    const itemSize = isFullscreen
        ? {
              width: '100%',
              height: window.innerHeight - FULLSCREEN_CONTROLS_HEIGHT,
          }
        : size

    useEffect(() => {
        window.setPluginProps = (props) => {
            setHasError(false)
            setPluginProps(props)
        }
        window.setPluginSize = setSize

        return () => {
            delete window.setPluginProps
            delete window.setPluginSize
        }
    }, [])

    // Stable identities: Plugin sends updated props whenever a prop changes
    const onError = useCallback(() => setHasError(true), [])
    const onInstallationStatusChange = useCallback(() => {}, [])

    const onMapIdSubmit = (event) => {
        event.preventDefault()
        const id = mapIdInput.trim()
        setMapId(id)
        setHasError(false)
        setPluginProps(id ? getMapIdProps(id) : undefined)
    }

    return (
        <div style={{ padding: 16, display: 'grid', gap: 16 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600 }}>
                Plugin host (dev only)
            </h1>

            <form
                onSubmit={onMapIdSubmit}
                style={{ display: 'flex', alignItems: 'end', gap: 8 }}
            >
                <label style={{ display: 'grid', gap: 4, width: 300 }}>
                    Map id
                    {/* Native input, not a @dhis2/ui one: cy.type needs a real <input> */}
                    <input
                        type="text"
                        data-test="plugin-host-map-id-input"
                        value={mapIdInput}
                        onChange={(event) => setMapIdInput(event.target.value)}
                    />
                </label>
                <button type="submit" data-test="plugin-host-map-id-submit">
                    Show
                </button>
            </form>

            {hasError && (
                <p data-test="plugin-host-error">
                    The plugin reported an error
                </p>
            )}

            {pluginProps && (
                <button
                    type="button"
                    data-test="plugin-host-fullscreen"
                    style={{ justifySelf: 'start' }}
                    onClick={() => itemRef.current.requestFullscreen()}
                >
                    View fullscreen
                </button>
            )}

            {pluginProps && (
                <div
                    ref={itemRef}
                    data-test="plugin-host-iframe-wrap"
                    style={{
                        display: 'flex',
                        width: itemSize.width,
                        outline: '1px solid #d5dde5',
                        background: 'white',
                    }}
                >
                    {/* Keyed by the submitted map id only, so props set by
                    Cypress update the same iframe, like a dashboard item */}
                    <Plugin
                        key={mapId}
                        pluginSource="/plugin.html"
                        width={itemSize.width}
                        height={itemSize.height}
                        onError={onError}
                        onInstallationStatusChange={onInstallationStatusChange}
                        {...pluginProps}
                    />
                </div>
            )}
        </div>
    )
}
