import React from 'react';
import { ComponentCover, CenteredContent, CircularLoader } from '@dhis2/ui';

const MapLoadingMask = () => (
    <ComponentCover translucent>
        <CenteredContent>
            <CircularLoader />
        </CenteredContent>
    </ComponentCover>
);

export default MapLoadingMask;
