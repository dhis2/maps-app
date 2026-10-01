import i18n from '@dhis2/d2-i18n'
import {
    CHART_TYPE_BAR,
    THEMATIC_CHART_MARKER_MIN_SIZE,
    THEMATIC_CHART_MARKER_MAX_SIZE,
} from '../constants/layers.js'
import { getContrastColor } from './colors.js'

// Mockup for DHIS2-21461: donut/bar chart markers for thematic chart maps.
// Builds a small standalone SVG string per feature — segments is an array
// of { name, color, value }.

// Matches the hover tooltip's own background exactly (see .dhis2-map-label
// .maplibregl-popup-content in @dhis2/maps-gl's Label.css) — the tooltip
// is the reference, not the other way around, so a chart marker and the
// tooltip it opens read as the same translucent surface
const MARKER_BG = 'var(--marker-bg, rgba(255, 255, 255, 0.9))'
// A thin outer outline is what gives the marker definition against the
// basemap, not a shadow: filter: drop-shadow() paints its shadow directly
// behind the marker's own content in the same pass, and on a marker this
// small that shadow shows through the translucent MARKER_BG fill across
// nearly the whole shape rather than just its edges, visibly darkening it
// below the tooltip's own reference shade
const MARKER_OUTLINE = 'rgba(0,0,0,0.22)'
const LABEL_COLOR = '#33373d'

// Escapes text going into the hover tooltip's HTML (segment names come
// from user-entered data item metadata)
const escapeHtml = (str) =>
    String(str).replace(
        /[&<>]/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])
    )

const round1 = (n) => {
    const rounded = Math.round(n * 10) / 10
    return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)
}

// Compact number for on-marker labels (10.5k, 1.2M), full precision is
// still available in the tooltip
const formatCompact = (value) => {
    const abs = Math.abs(value)
    if (abs >= 1e6) {
        return `${round1(value / 1e6)}M`
    }
    if (abs >= 1e3) {
        return `${round1(value / 1e3)}k`
    }
    return String(Math.round(value))
}

// HTML shown in the map's hover label (see Map#showLabel in @dhis2/maps-gl,
// the same mechanism choropleth/bubble thematic layers use for hover
// tooltips) — one swatch+value row per positive segment
export const buildChartTooltipHtml = (segments) => {
    const positive = segments.filter((s) => s.value > 0)

    if (!positive.length) {
        return `<div>${escapeHtml(i18n.t('No data'))}</div>`
    }

    return `<div>${positive
        .map(
            (segment) =>
                '<div style="display:flex;align-items:center;gap:6px;padding:1px 0">' +
                `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${segment.color};flex-shrink:0"></span>` +
                `<span>${escapeHtml(
                    segment.name
                )}: ${segment.value.toLocaleString()}</span>` +
                '</div>'
        )
        .join('')}</div>`
}

const polarToCartesian = ({ cx, cy, r, angleRad }) => [
    cx + r * Math.cos(angleRad),
    cy + r * Math.sin(angleRad),
]

// SVG path for one donut wedge, start/end as a fraction (0-1) of the circle
const donutWedgePath = ({ start, end, r, r0, cx, cy }) => {
    const a0 = 2 * Math.PI * start - Math.PI / 2
    const a1 = 2 * Math.PI * end - Math.PI / 2
    const largeArc = end - start > 0.5 ? 1 : 0
    const [x0, y0] = polarToCartesian({ cx, cy, r, angleRad: a0 })
    const [x1, y1] = polarToCartesian({ cx, cy, r, angleRad: a1 })
    const [x2, y2] = polarToCartesian({ cx, cy, r: r0, angleRad: a1 })
    const [x3, y3] = polarToCartesian({ cx, cy, r: r0, angleRad: a0 })

    return [
        `M ${x0} ${y0}`,
        `A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}`,
        `L ${x2} ${y2}`,
        `A ${r0} ${r0} 0 ${largeArc} 0 ${x3} ${y3}`,
        'Z',
    ].join(' ')
}

// Total value in the donut hole. Always rendered, even on markers too
// small to hold it legibly at rest — same reasoning as the percentage
// labels in buildDonutSvg: a font-size floor plus the size-dependent hover
// zoom (see getDonutHoverScale) is what makes it readable on small
// markers, rather than hiding it outright below some size
const donutCenterLabel = (r, r0, total) => {
    const fontSize = Math.max(Math.min(r0 * 0.78, 13), 6)
    return `<text x="${r}" y="${r}" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}" font-weight="600" fill="${LABEL_COLOR}">${formatCompact(
        total
    )}</text>`
}

// Fixed zoom for bar markers — their layout doesn't vary continuously with
// a scalar size (width comes from category count, not size; see
// buildBarSvg), so there's no size to scale the zoom amount against.
const BAR_HOVER_SCALE = 1.35

// Donuts get a bigger hover zoom the smaller they are: a marker at
// THEMATIC_CHART_MARKER_MIN_SIZE is where percentage labels are most
// cramped and benefit most from zooming in, while a marker already at
// THEMATIC_CHART_MARKER_MAX_SIZE is legible enough at rest that it only
// needs the same modest zoom bar markers get.
const DONUT_HOVER_SCALE_AT_MIN_SIZE = 2.5
const DONUT_HOVER_SCALE_AT_MAX_SIZE = BAR_HOVER_SCALE

const getDonutHoverScale = (size) => {
    const span = THEMATIC_CHART_MARKER_MAX_SIZE - THEMATIC_CHART_MARKER_MIN_SIZE
    const t = Math.min(
        Math.max((size - THEMATIC_CHART_MARKER_MIN_SIZE) / span, 0),
        1
    )
    return (
        DONUT_HOVER_SCALE_AT_MIN_SIZE -
        t * (DONUT_HOVER_SCALE_AT_MIN_SIZE - DONUT_HOVER_SCALE_AT_MAX_SIZE)
    )
}

export const buildDonutSvg = (segments, size) => {
    const r = size / 2
    const ring = r - 0.75 // leave room for the outer stroke inside the viewBox
    const r0 = r * 0.55
    const positive = segments.filter((s) => s.value > 0)
    const total = positive.reduce((sum, s) => sum + s.value, 0)

    // The CSS transform that zooms a marker on hover (see
    // createChartMarkerElement) scales everything uniformly, strokes
    // included, so a boundary drawn at a fixed width would visually
    // thicken right along with the zoom. Pre-dividing by that marker's own
    // hover scale here means the stroke ends up back at its intended
    // width once zoomed, instead of ballooning — most noticeable on small
    // donuts, which also zoom the most (see getDonutHoverScale).
    const strokeWidth = 1.5 / getDonutHoverScale(size)

    if (!total) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${r}" cy="${r}" r="${ring}" fill="#dcdcdc" stroke="${MARKER_OUTLINE}" stroke-width="${strokeWidth}" /><circle cx="${r}" cy="${r}" r="${r0}" fill="${MARKER_BG}" /></svg>`
    }

    // A single segment covering everything can't be drawn as an SVG arc
    // (start === end after a full turn), so fall back to plain rings
    if (positive.length === 1) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${r}" cy="${r}" r="${ring}" fill="${
            positive[0].color
        }" stroke="${MARKER_OUTLINE}" stroke-width="${strokeWidth}" /><circle cx="${r}" cy="${r}" r="${r0}" fill="${MARKER_BG}" />${donutCenterLabel(
            r,
            r0,
            total
        )}</svg>`
    }

    // Percentage labels sit mid-ring on every wedge wide enough to hold one
    // without overlapping its neighbors. They always render, even on small
    // markers where they'd be too small to read at rest, because hovering
    // a marker scales it up (see createChartMarkerElement) — a floor on
    // the font size means that zoom reliably makes them legible rather
    // than relying on text that may not have been drawn at all
    const percentFontSize = Math.max(Math.min((ring - r0) * 0.6, 10), 6)
    const midRadius = (r0 + ring) / 2

    // Built as two separate passes — all wedges, then all percent labels —
    // rather than interleaved per segment, so every label paints on top of
    // every wedge's boundary stroke. SVG paints in document order, so an
    // interleaved path+label, path+label, ... sequence lets a later
    // wedge's stroke cut across an earlier wedge's label wherever the two
    // happen to overlap near a shared boundary.
    let offset = 0
    const percentLabels = []
    const wedges = positive
        .map((segment) => {
            const start = offset / total
            const end = (offset + segment.value) / total
            const path = donutWedgePath({
                start,
                end,
                r: ring,
                r0,
                cx: r,
                cy: r,
            })
            offset += segment.value

            const fraction = end - start
            if (fraction >= 0.04) {
                const mid = (start + end) / 2
                const angle = 2 * Math.PI * mid - Math.PI / 2
                const [x, y] = polarToCartesian({
                    cx: r,
                    cy: r,
                    r: midRadius,
                    angleRad: angle,
                })
                percentLabels.push(
                    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${percentFontSize}" font-weight="700" fill="${getContrastColor(
                        segment.color
                    )}">${Math.round(fraction * 100)}%</text>`
                )
            }

            // A thin border in the marker background color separates
            // adjacent wedges so segments stay legible when colors clash
            return `<path d="${path}" fill="${segment.color}" stroke="${MARKER_BG}" stroke-width="${strokeWidth}" stroke-linejoin="round" />`
        })
        .join('')

    // The hole background circle paints before the percent labels (not
    // after) so a label that happens to sit right at the inner ring edge
    // never gets clipped by it — text always needs to be the topmost layer.
    // The outer outline is a separate stroke-only circle on top of the
    // wedges rather than being added to each wedge's own stroke, since
    // wedges already use their stroke for the (differently-colored)
    // separator between adjacent segments.
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${wedges}<circle cx="${r}" cy="${r}" r="${r0}" fill="${MARKER_BG}" />${percentLabels.join(
        ''
    )}${donutCenterLabel(
        r,
        r0,
        total
    )}<circle cx="${r}" cy="${r}" r="${ring}" fill="none" stroke="${MARKER_OUTLINE}" stroke-width="${strokeWidth}" /></svg>`
}

// Bar layout is entirely fixed in pixels — width per bar, gap, and max
// height are all constants, not derived from a feature's total. Width only
// grows with the number of categories (more bars), height comes from one
// linear value-to-pixel scale shared across the whole layer (maxValue).
// Together this keeps every dimension of a bar marker strictly about the
// data it encodes rather than the org unit's overall magnitude, so bar
// charts are visually comparable from one org unit to the next — a "500"
// bar is the same width and height everywhere on the map.
const BAR_WIDTH = 7
const BAR_GAP = 3
const BAR_MAX_HEIGHT = 56
const BAR_PAD_RIGHT = 5
const BAR_PAD_BOTTOM = 5
const BAR_LABEL_FONT_SIZE = 11
const BAR_PAD_TOP = BAR_LABEL_FONT_SIZE + 5
const BAR_CARD_RADIUS = 4
// Reserved column on the left for the y-axis's two labels (0 and this
// chart's own peak value), so a bar's height can be read as an actual
// number instead of only compared by eye against other bars. Wide enough
// for the longest label formatCompact can produce (e.g. "999.9k") without
// it clipping against the marker's left edge.
const BAR_AXIS_WIDTH = 26
const BAR_AXIS_FONT_SIZE = 7
const BAR_AXIS_COLOR = '#6b7280'

// maxValue is expected to already be a "nice" round ceiling (see
// ThematicLayer's use of d3's scaleLinear().nice()) shared across every
// marker in the layer, so a given value is always the same bar height
// everywhere on the map
export const buildBarSvg = (segments, maxValue) => {
    const barsWidth =
        segments.length * BAR_WIDTH + (segments.length - 1) * BAR_GAP
    const width = BAR_AXIS_WIDTH + barsWidth + BAR_PAD_RIGHT
    const height = BAR_PAD_TOP + BAR_MAX_HEIGHT + BAR_PAD_BOTTOM
    const scaleMax = Math.max(maxValue, 1)
    const baselineY = BAR_PAD_TOP + BAR_MAX_HEIGHT
    // Pre-divided by the fixed hover zoom so the card border and baseline
    // return to their intended width once zoomed, instead of thickening
    // along with it (see the matching comment in buildDonutSvg)
    const strokeWidth = 1 / BAR_HOVER_SCALE

    const bars = segments
        .map((segment, index) => {
            const rawHeight =
                (Math.max(segment.value, 0) / scaleMax) * BAR_MAX_HEIGHT
            // Keep small positive values visible as a short stub rather
            // than disappearing into the baseline
            const barHeight = segment.value > 0 ? Math.max(rawHeight, 2) : 0
            if (!barHeight) {
                return ''
            }
            const x = BAR_AXIS_WIDTH + index * (BAR_WIDTH + BAR_GAP)
            const y = baselineY - barHeight
            return `<rect x="${x}" y="${y}" width="${BAR_WIDTH}" height="${barHeight}" rx="1.5" fill="${segment.color}" />`
        })
        .join('')

    const total = segments.reduce((sum, s) => sum + Math.max(s.value, 0), 0)
    const label = `<text x="${
        BAR_AXIS_WIDTH + barsWidth / 2
    }" y="${BAR_LABEL_FONT_SIZE}" text-anchor="middle" font-size="${BAR_LABEL_FONT_SIZE}" font-weight="600" fill="${LABEL_COLOR}">${formatCompact(
        total
    )}</text>`

    // The top axis label sits at this chart's own peak bar height (on the
    // shared scale), not at the scale's global ceiling — so it reads as
    // "here's this chart's own highest value" rather than a distant number
    // that may belong to some much larger org unit elsewhere on the map.
    // Skipped when that peak is too close to the baseline to avoid
    // overlapping the "0" label.
    const peakValue = Math.max(...segments.map((s) => Math.max(s.value, 0)))
    const peakHeight = Math.min(
        (peakValue / scaleMax) * BAR_MAX_HEIGHT,
        BAR_MAX_HEIGHT
    )
    const axisLabelX = BAR_AXIS_WIDTH - 3
    const axis =
        (peakValue > 0 && peakHeight >= 10
            ? `<text x="${axisLabelX}" y="${
                  baselineY - peakHeight
              }" text-anchor="end" dominant-baseline="middle" font-size="${BAR_AXIS_FONT_SIZE}" fill="${BAR_AXIS_COLOR}">${formatCompact(
                  peakValue
              )}</text>`
            : '') +
        `<text x="${axisLabelX}" y="${baselineY}" text-anchor="end" dominant-baseline="middle" font-size="${BAR_AXIS_FONT_SIZE}" fill="${BAR_AXIS_COLOR}">0</text>`

    // A faint card behind the bars anchors them to a baseline instead of
    // leaving them floating on top of the basemap, kept tight and mostly
    // transparent so it reads as a chart, not a UI placeholder. The thin
    // outline (not a shadow — see MARKER_OUTLINE) is what gives the card
    // its edge definition against the basemap, the same as the donut's
    // outer ring.
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect x="0.5" y="0.5" width="${
        width - 1
    }" height="${
        height - 1
    }" rx="${BAR_CARD_RADIUS}" fill="${MARKER_BG}" stroke="${MARKER_OUTLINE}" stroke-width="${strokeWidth}" />${label}${axis}${bars}<line x1="${BAR_AXIS_WIDTH}" y1="${baselineY}" x2="${
        width - BAR_PAD_RIGHT
    }" y2="${baselineY}" stroke="rgba(0,0,0,0.25)" stroke-width="${strokeWidth}" /></svg>`
}

// Used by ThematicLayer to push the hover tooltip's anchor sideways so
// the zoomed-in marker doesn't grow past it and overlap
export const TOOLTIP_OFFSET_X = 40

// Returns a positioned, clickable DOM element for a maplibre-gl Marker.
// The chart itself lives in an inner wrapper so hover styling (transform)
// never touches the outer element's transform, which maplibre-gl
// overwrites directly to position the marker on the map. size only applies
// to donuts (bar layout is fixed, see buildBarSvg); maxValue only to bars.
export const createChartMarkerElement = (
    chartType,
    segments,
    { size, maxValue }
) => {
    const el = document.createElement('div')
    el.style.cursor = 'pointer'

    const hoverScale =
        chartType === CHART_TYPE_BAR
            ? BAR_HOVER_SCALE
            : getDonutHoverScale(size)

    const inner = document.createElement('div')
    inner.style.transition = 'transform 120ms ease-out'
    inner.style.transformOrigin = 'center'
    inner.innerHTML =
        chartType === CHART_TYPE_BAR
            ? buildBarSvg(segments, maxValue)
            : buildDonutSvg(segments, size)

    el.addEventListener('mouseenter', () => {
        // Many markers render small; scaling up on hover (rather than only
        // relying on the tooltip) is what makes fine detail like donut
        // percentages actually readable without zooming the whole map
        inner.style.transform = `scale(${hoverScale})`
        el.style.zIndex = 1
    })
    el.addEventListener('mouseleave', () => {
        inner.style.transform = ''
        el.style.zIndex = ''
    })

    el.appendChild(inner)
    return el
}
