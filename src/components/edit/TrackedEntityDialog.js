import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Tabs, Tab } from 'material-ui/Tabs';
import TrackedEntityTypeSelect from '../trackedEntity/TrackedEntityTypeSelect';
import ProgramSelect from '../program/ProgramSelect';
import { layerDialogStyles } from './LayerDialogStyles';
import { setTrackedEntityType, setProgram } from '../../actions/layerEdit';

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
        const {
            trackedEntityType,
            program 
        } = this.props;

        const { 
            setTrackedEntityType, 
            setProgram 
        } = this.props;

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
                            style={styles.select}
                            // errorText={programError}
                        />
                        <ProgramSelect
                            program={program}
                            onChange={setProgram}
                            style={styles.select}
                            // errorText={programError}
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
        setProgram,
    },   
    null,
    {
        withRef: true,
    }
)(TrackedEntityDialog);
