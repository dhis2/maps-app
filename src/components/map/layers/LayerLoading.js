import React from 'react';
import { ComponentCover, CenteredContent, CircularLoader } from '@dhis2/ui';
import i18n from '@dhis2/d2-i18n';
import styles from './styles/LayerLoading.module.css';

const LayerLoading = () => (
    <ComponentCover>
        <CenteredContent>
            <div className={styles.layerLoading}>
                <CircularLoader small />
                {i18n.t('Loading layer data')}
            </div>
        </CenteredContent>
    </ComponentCover>
);

export default LayerLoading;
