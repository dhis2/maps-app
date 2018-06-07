import React, { Component } from 'react';
// import PropTypes from 'prop-types';
//import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Tabs, Tab } from 'material-ui/Tabs';
import TrackedEntityTypeSelect from '../trackedEntity/TrackedEntityTypeSelect';
import { layerDialogStyles } from './LayerDialogStyles';

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

    componentDidMount() {}

    render() {
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
                        <TrackedEntityTypeSelect onChange={console.log} />
                    </div>
                </Tab>
                <Tab value="period" label={i18n.t('period')} />
                <Tab value="filter" label={i18n.t('Filter')} />
                <Tab value="orgunits" label={i18n.t('Org units')} />
                <Tab value="style" label={i18n.t('Style')} />
            </Tabs>
        );
    }
}

export default TrackedEntityDialog;
