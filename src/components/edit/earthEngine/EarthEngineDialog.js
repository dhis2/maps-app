import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PeriodSelect from './PeriodSelect';
import { getEarthEngineLayer } from '../../../util/earthEngine';
import { setParams } from '../../../actions/layerEdit';
import styles from '../styles/LayerDialog.module.css';

const EarthEngineDialog = props => {
    const {
        datasetId,
        // params,
        filter,
        // setParams,
    } = props;

    const dataset = getEarthEngineLayer(datasetId);

    // console.log('EarthEngineDialog', datasetId, filter);

    return (
        <div>
            <div className={styles.tabContent}>
                <div className={styles.flexColumnFlow}>
                    <div className={styles.flexColumn}>
                        <div>{dataset.description}</div>
                        {datasetId !== 'USGS/SRTMGL1_003' && ( // If not elevation
                            <PeriodSelect
                                // label={dataset.collectionLabel}
                                id={datasetId}
                                filter={filter}
                                // className={styles.flexFull}
                                // errorText={filterError}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

EarthEngineDialog.propTypes = {
    datasetId: PropTypes.string.isRequired,
    filter: PropTypes.array,
    params: PropTypes.shape({
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        palette: PropTypes.string.isRequired,
    }),
    setParams: PropTypes.func.isRequired,
};

export default connect(null, { setParams }, null, {
    forwardRef: true,
})(EarthEngineDialog);
