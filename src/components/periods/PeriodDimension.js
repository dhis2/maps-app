import React, { Component } from 'react';
import { PeriodSelector } from '@dhis2/d2-ui-period-selector-dialog';

class PeriodDimension extends Component {
    render = () => {
        return (
            <PeriodSelector
                onSelect={() => {}}
                onDeselect={() => {}}
                onReorder={() => {}}
                selectedItems={[]}
            />
        );
    };
}

export default PeriodDimension;
