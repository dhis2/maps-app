import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { InputField, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import {
    MAP_LAYER_POSITION_BASEMAP,
    MAP_LAYER_POSITION_OVERLAY,
} from '../../constants/layers.js'
import { supportedMapServices } from '../../util/external.js'
import styles from './styles/AddLayerSourceForm.module.css'

// PROTOTYPE ONLY - mocks the "Add source" flow of the layer source catalog.
// The field set mirrors the External map layer form in the Maintenance app and
// every field maps 1:1 to an externalMapLayers property, but nothing is ever
// written to the API - see ManageLayerSourcesModal.onAddSource().

// Same query as components/classification/LegendSetSelect.jsx, which is bound to
// redux layerEdit state and so can't be reused here
const LEGEND_SETS_QUERY = {
    legendSets: {
        resource: 'legendSets',
        params: {
            fields: ['id', 'displayName~rename(name)'],
            paging: false,
        },
    },
}

const WMS = 'WMS'
const RASTER_SERVICES = ['WMS', 'XYZ', 'TMS']

// Labels for the services the app supports - the option list itself is derived
// from supportedMapServices so it can never offer an unsupported one
const MAP_SERVICE_LABELS = {
    WMS: i18n.t('WMS'),
    XYZ: i18n.t('XYZ tiles'),
    TMS: i18n.t('TMS tiles'),
    VECTOR_STYLE: i18n.t('Vector style'),
    GEOJSON_URL: i18n.t('GeoJSON URL'),
}

const MAP_SERVICE_OPTIONS = supportedMapServices.map((value) => ({
    value,
    label: MAP_SERVICE_LABELS[value] || value,
}))

const IMAGE_FORMAT_OPTIONS = [
    { value: 'PNG', label: i18n.t('PNG') },
    { value: 'JPG', label: i18n.t('JPG') },
]

const POSITION_OPTIONS = [
    { value: MAP_LAYER_POSITION_OVERLAY, label: i18n.t('Overlay') },
    { value: MAP_LAYER_POSITION_BASEMAP, label: i18n.t('Basemap') },
]

const URL_PLACEHOLDER = {
    WMS: 'https://example.org/geoserver/wms',
    XYZ: 'https://example.org/tiles/{z}/{x}/{y}.png',
    TMS: 'https://example.org/tiles/{z}/{x}/{y}.png',
    VECTOR_STYLE: 'https://example.org/styles/style.json',
    GEOJSON_URL: 'https://example.org/data/districts.geojson',
}

const URL_HELP = {
    WMS: i18n.t('Base URL of the WMS service, without query parameters'),
    XYZ: i18n.t('Tile URL template with {z}/{x}/{y} placeholders'),
    TMS: i18n.t('Tile URL template, using TMS tile ordering'),
    VECTOR_STYLE: i18n.t('URL of a vector style JSON document'),
    GEOJSON_URL: i18n.t('URL of a GeoJSON FeatureCollection'),
}

export const EMPTY_FORM = {
    name: '',
    code: '',
    mapService: 'XYZ',
    url: '',
    layers: '',
    imageFormat: 'PNG',
    mapLayerPosition: MAP_LAYER_POSITION_OVERLAY,
    attribution: '',
    legendSet: null,
    legendSetUrl: '',
}

const isValidUrl = (value) => {
    try {
        return ['http:', 'https:'].includes(new URL(value).protocol)
    } catch {
        return false
    }
}

// Keyed by field name so the form can show each message on its own field
export const getFormErrors = (form) => {
    const errors = {}

    if (!form.name.trim()) {
        errors.name = i18n.t('A name is required')
    }

    if (!form.url.trim()) {
        errors.url = i18n.t('A URL is required')
    } else if (!isValidUrl(form.url.trim())) {
        errors.url = i18n.t('Enter a full URL, including https://')
    }

    if (form.mapService === WMS && !form.layers.trim()) {
        errors.layers = i18n.t('WMS services need at least one layer name')
    }

    return errors
}

// An API-shaped externalMapLayer, ready for createExternalOverlayLayer().
// Fields the app ignores for the chosen service are left out entirely.
export const getExternalLayerModel = (form, id) => ({
    id,
    name: form.name.trim(),
    code: form.code.trim() || undefined,
    mapService: form.mapService,
    url: form.url.trim(),
    layers: form.mapService === WMS ? form.layers.trim() : undefined,
    imageFormat: RASTER_SERVICES.includes(form.mapService)
        ? form.imageFormat
        : undefined,
    mapLayerPosition: form.mapLayerPosition,
    attribution: form.attribution.trim() || undefined,
    legendSet: form.legendSet || undefined,
    legendSetUrl: form.legendSetUrl.trim() || undefined,
})

const AddLayerSourceForm = ({ form, errors, onChange }) => {
    // Errors only show once a field has been visited, so an untouched form
    // isn't covered in red the moment it opens
    const [touched, setTouched] = useState({})
    const { loading, error, data } = useDataQuery(LEGEND_SETS_QUERY)

    const legendSets = data?.legendSets?.legendSets ?? []
    const isWms = form.mapService === WMS
    const isRaster = RASTER_SERVICES.includes(form.mapService)

    const textField = (field) => ({
        dense: true,
        value: form[field],
        error: Boolean(touched[field] && errors[field]),
        validationText: touched[field] ? errors[field] : undefined,
        onBlur: () => setTouched((prev) => ({ ...prev, [field]: true })),
        onChange: ({ value }) => onChange(field, value),
    })

    return (
        <div className={styles.form}>
            <div className={styles.sectionTitle}>{i18n.t('Service')}</div>
            <InputField
                {...textField('name')}
                className={styles.full}
                required
                label={i18n.t('Name')}
                dataTest="addlayersource-name"
            />
            <SingleSelectField
                dense
                required
                label={i18n.t('Map service')}
                selected={form.mapService}
                onChange={({ selected }) => onChange('mapService', selected)}
                dataTest="addlayersource-mapservice"
            >
                {MAP_SERVICE_OPTIONS.map(({ value, label }) => (
                    <SingleSelectOption
                        key={value}
                        value={value}
                        label={label}
                    />
                ))}
            </SingleSelectField>
            {/* Maintenance-app parity only - createExternalLayerConfig() does
                not carry code into the layer config, so nothing displays it */}
            <InputField
                {...textField('code')}
                label={i18n.t('Code')}
                dataTest="addlayersource-code"
            />
            <InputField
                {...textField('url')}
                className={styles.full}
                required
                label={i18n.t('URL')}
                placeholder={URL_PLACEHOLDER[form.mapService]}
                helpText={URL_HELP[form.mapService]}
                dataTest="addlayersource-url"
            />
            {isWms && (
                <InputField
                    {...textField('layers')}
                    className={styles.full}
                    required
                    label={i18n.t('Layers')}
                    placeholder="district_boundaries,facilities"
                    helpText={i18n.t(
                        'Comma separated WMS layer names, as published by the service'
                    )}
                    dataTest="addlayersource-layers"
                />
            )}
            {isRaster && (
                <SingleSelectField
                    dense
                    label={i18n.t('Image format')}
                    selected={form.imageFormat}
                    onChange={({ selected }) =>
                        onChange('imageFormat', selected)
                    }
                    dataTest="addlayersource-imageformat"
                >
                    {IMAGE_FORMAT_OPTIONS.map(({ value, label }) => (
                        <SingleSelectOption
                            key={value}
                            value={value}
                            label={label}
                        />
                    ))}
                </SingleSelectField>
            )}
            <SingleSelectField
                dense
                label={i18n.t('Layer position')}
                selected={form.mapLayerPosition}
                helpText={
                    form.mapLayerPosition === MAP_LAYER_POSITION_BASEMAP
                        ? i18n.t('Basemaps are not listed in this catalog')
                        : undefined
                }
                onChange={({ selected }) =>
                    onChange('mapLayerPosition', selected)
                }
                dataTest="addlayersource-position"
            >
                {POSITION_OPTIONS.map(({ value, label }) => (
                    <SingleSelectOption
                        key={value}
                        value={value}
                        label={label}
                    />
                ))}
            </SingleSelectField>
            <div className={styles.sectionTitle}>
                {i18n.t('Attribution and legend')}
            </div>
            <InputField
                {...textField('attribution')}
                className={styles.full}
                label={i18n.t('Attribution')}
                helpText={i18n.t(
                    'Credit shown in the attribution control on the map'
                )}
                dataTest="addlayersource-attribution"
            />
            <SingleSelectField
                dense
                clearable
                loading={loading}
                loadingText={i18n.t('Loading legend sets')}
                error={Boolean(error)}
                validationText={error?.message}
                label={i18n.t('Legend set')}
                selected={form.legendSet?.id ?? ''}
                onChange={({ selected }) =>
                    onChange(
                        'legendSet',
                        legendSets.find((ls) => ls.id === selected) ?? null
                    )
                }
                dataTest="addlayersource-legendset"
            >
                {legendSets.map(({ id, name }) => (
                    <SingleSelectOption key={id} value={id} label={name} />
                ))}
            </SingleSelectField>
            <InputField
                {...textField('legendSetUrl')}
                label={i18n.t('Legend set URL')}
                dataTest="addlayersource-legendseturl"
            />
        </div>
    )
}

AddLayerSourceForm.propTypes = {
    errors: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default AddLayerSourceForm
