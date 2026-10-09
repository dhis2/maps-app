# Thematic mapping / classification

`src/components/classification/` implements the legend/color-scale config UI: `Classification.jsx`, `LegendTypeSelect.jsx`, `LegendSetSelect.jsx`, `NumericLegendStyle.jsx`, `DecimalPlacesSelect.jsx`, `IsolatedClass.jsx`, `SingleColor.jsx`. This produces the `legendSet`/color-scale config consumed by `ThematicLayer.jsx` and ultimately rendered by `@dhis2/maps-gl`.

`src/constants/colorbrewer.js` and `colors.js` back the available color-scale choices.

This is the layer of the app most likely to have subtly-wrong edge cases (decimal place rounding, legend-set vs. ad-hoc classification, single-color vs. scaled) — when touching it, check both the "predefined legend set" and "custom classification" code paths, not just one.
