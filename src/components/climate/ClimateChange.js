import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'
import DataLoading from './DataLoading.js'
import ERA5Source from './ERA5Source.js'
import TemperatureAnomaly from './TemperatureAnomaly.js'

// https://climate.copernicus.eu/copernicus-september-2023-unprecedented-temperature-anomalies
// https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_MONTHLY_AGGR
// https://developers.google.com/earth-engine/datasets/catalog/NASA_GDDP-CMIP6
// https://developers.google.com/earth-engine/datasets/catalog/NASA_NEX-GDDP
const ClimateChange = ({ data }) => {
    return data ? (
        <>
            <TemperatureAnomaly data={data} />
            <ERA5Source />
        </>
    ) : (
        <DataLoading />
    )
}

ClimateChange.propTypes = {
    data: PropTypes.array,
}

export default ClimateChange
