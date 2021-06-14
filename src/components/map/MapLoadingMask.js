import React from 'react';
import { ComponentCover, CenteredContent, CircularLoader } from '@dhis2/ui';
import styles from './styles/MapLoadingMask.module.css';

const MapLoadingMask = () => (
    <ComponentCover translucent className={styles.cover}>
        <CenteredContent>
            <CircularLoader dataTest="map-loading-indicator" />
        </CenteredContent>
    </ComponentCover>
);

export default MapLoadingMask;
