import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Tabs, Tab } from 'material-ui/Tabs';
import TrackedEntityTypeSelect from '../trackedEntity/TrackedEntityTypeSelect';
import { layerDialogStyles } from './LayerDialogStyles';
import { setTrackedEntityType } from '../../actions/layerEdit';

const styles = {
    ...layerDialogStyles,
};

export class TrackedEntityDialog extends Component {
    static propTypes = {
        // classes: PropTypes.number,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            tab: 'data',
        };
    }

    render() {
        const { trackedEntityType, setTrackedEntityType } = this.props;
        const { tab } = this.state;

        return (
            <Tabs
                style={styles.tabs}
                tabItemContainerStyle={styles.tabBar}
                value={tab}
                onChange={tab => this.setState({ tab })}
            >
                <Tab value="data" label={i18n.t('data')}>
                    <div style={styles.flexColumnFlow}>
                        <TrackedEntityTypeSelect 
                            trackedEntityType={trackedEntityType}
                            onChange={setTrackedEntityType} 
                        />
                    </div>
                </Tab>
                <Tab value="period" label={i18n.t('period')} />
                <Tab value="filter" label={i18n.t('Filter')} />
                <Tab value="orgunits" label={i18n.t('Org units')} />
                <Tab value="style" label={i18n.t('Style')} />
            </Tabs>
        );
    }

    validate() {
        // TODO
        return true;
    }
}

export default connect(
    null,
    {
        setTrackedEntityType,
    },   
    null,
    {
        withRef: true,
    }
)(TrackedEntityDialog);
