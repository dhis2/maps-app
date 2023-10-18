import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'
import DataLoading from './DataLoading.js'
import ERA5Source from './ERA5Source.js'
import TemperatureAnomaly from './TemperatureAnomaly.js'

// https://developers.google.com/earth-engine/datasets/catalog/NASA_GDDP-CMIP6
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
