import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { IconCross16 } from '@dhis2/ui';
import { changeOrgUnitCoordinate } from '../../actions/orgUnits';
import styles from './styles/RelocateDialog.module.css';

const RelocateDialog = props => {
    const { feature, layerId, map, changeOrgUnitCoordinate, onClose } = props;

    const onMapClick = ({ lngLat }) => {
        changeOrgUnitCoordinate(
            layerId,
            feature.properties.id,
            lngLat.toArray()
        );

        onClose();
    };

    useEffect(() => {
        const container = map
            .getContainer()
            .getElementsByClassName('maplibregl-interactive')[0];

        container.style.cursor = 'crosshair';
        map.getMapGL().on('click', onMapClick);

        return () => {
            container.style.cursor = 'grab';
            map.getMapGL().off('click', onMapClick);
        };
    }, [map]);

    return (
        <div className={styles.relocate}>
            <span className={styles.close} onClick={onClose}>
                <IconCross16 />
            </span>
            <div className={styles.name}>{feature.properties.name}</div>
            {i18n.t('Click the map where you want to relocate the facility.')}
        </div>
    );
};

RelocateDialog.propTypes = {
    feature: PropTypes.object.isRequired,
    layerId: PropTypes.string.isRequired,
    map: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    changeOrgUnitCoordinate: PropTypes.func.isRequired,
};

export default connect(null, { changeOrgUnitCoordinate })(RelocateDialog);
