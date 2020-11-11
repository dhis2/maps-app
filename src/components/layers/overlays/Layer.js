import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import styles from './styles/Layer.module.css';

const Layer = ({ layer, onClick }) => {
    const { img, type, name } = layer;
    const label = name || i18n.t(type);

    return (
        <div
            className={styles.container}
            onClick={() => onClick(layer)}
            data-test={`addlayeritem-${label}`}
        >
            {img ? (
                <img src={img} className={styles.image} />
            ) : (
                <div className={styles.noImage}>{i18n.t('External layer')}</div>
            )}
            <div className={styles.name}>{label}</div>
        </div>
    );
};

Layer.propTypes = {
    layer: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default Layer;
