import { useDataEngine, useDataQuery } from '@dhis2/app-runtime'
import React, { useEffect, useState } from 'react'
import { FiltersSelect } from './FiltersSelect.jsx'
import { MapSelect } from './MapSelect.jsx'
import { DEFAULT_SIZE, PluginHost } from './PluginHost.jsx'
import {
    applyDashboardFilters,
    getDashboardItemProps,
    getFilterPlaceholder,
} from './pluginHostHelpers.js'
import { MAP_QUERY, SUGGESTIONS_QUERY } from './pluginHostQueries.js'
import styles from './styles/PluginHostApp.module.css'

export const PluginHostApp = () => {
    const engine = useDataEngine()
    const { data: suggestions } = useDataQuery(SUGGESTIONS_QUERY)
    // Cypress sets the initial props and size before the page loads
    // (window.pluginProps, window.pluginSize) and changes them later through
    // the window setters below
    const [pluginProps, setPluginProps] = useState(() => window.pluginProps)
    const [size, setSize] = useState(() => window.pluginSize ?? DEFAULT_SIZE)
    const [map, setMap] = useState()
    const [loadError, setLoadError] = useState()

    useEffect(() => {
        window.setPluginProps = setPluginProps
        window.setPluginSize = setSize

        return () => {
            delete window.setPluginProps
            delete window.setPluginSize
        }
    }, [])

    const onMapSelect = async (id) => {
        setLoadError()
        try {
            const { map } = await engine.query(MAP_QUERY, {
                variables: { id },
            })
            setMap(map)
            setPluginProps(getDashboardItemProps(map))
        } catch (error) {
            setLoadError(error.message)
        }
    }

    const onMapClear = () => {
        setLoadError()
        setMap()
        setPluginProps()
    }

    const onApplyFilters = (filters) =>
        setPluginProps(
            getDashboardItemProps(applyDashboardFilters(map, filters))
        )

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Plugin host (dev only)</h1>

            <MapSelect
                maps={suggestions?.maps.maps ?? []}
                loadError={loadError}
                onSelect={onMapSelect}
                onClear={onMapClear}
            />

            {map && (
                <FiltersSelect
                    orgUnits={suggestions?.orgUnits.organisationUnits ?? []}
                    periodPlaceholder={getFilterPlaceholder(map, 'pe')}
                    orgUnitPlaceholder={getFilterPlaceholder(map, 'ou')}
                    onApply={onApplyFilters}
                />
            )}

            {/* Keyed by the loaded map only, so props set by Cypress update
            the same iframe, like a dashboard item */}
            {pluginProps && (
                <PluginHost
                    key={map?.id ?? ''}
                    pluginProps={pluginProps}
                    size={size}
                    onSizeChange={setSize}
                />
            )}
        </div>
    )
}
