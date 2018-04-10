import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Dialog from 'material-ui/Dialog';
import PeriodSelect from '../periods/PeriodSelect';
import { closeOrgUnit } from '../../actions/orgUnits';

const styles = {
    dialog: {
        maxWidth: 600,
    },
    content: {
        height: 300,
        maxHeight: 300,
    },
    metadata: {
        fontSize: 14,
        marginTop: -10,
        width: 200,
        float: 'left',
    },
    header: {
        margin: '10px 0 2px 0',
        fontSize: 14,
    },
    data: {
        float: 'left',
        width: 345,
    },
    period: {
        height: 70,
        margin: '-17px 0 0 3px',
    },
    table: {
        display: 'block',
        fontSize: 14,
        maxHeight: 240,
        overflowY: 'auto',
    },
    left: {
        textAlign: 'left',
    },
    right: {
        textAlign: 'right',
        verticalAlign: 'top',
    },
};

class OrgUnitDialog extends Component {
    static contextTypes = {
        d2: PropTypes.object.isRequired,
    };

    state = {
        peridType: null,
        period: null,
        periods: null,
    };

    componentDidMount() {
        this.loadConfigurations();
    }

    componentDidUpdate(prevProps, prevState) {
        const { id } = this.props;
        const { period } = this.state;

        if (
            id &&
            period &&
            (id !== prevProps.id || period !== prevState.period)
        ) {
            this.loadData();
        }
    }

    async loadConfigurations() {
        const d2 = this.context.d2;
        const api = d2.Api.getApi();
        const [
            infrastructuralPeriodType = {},
            infrastructuralIndicators = {},
            infrastructuralDataElements = {},
        ] = await Promise.all([
            api.get('configuration/infrastructuralPeriodType'),
            api.get('configuration/infrastructuralIndicators'),
            api.get('configuration/infrastructuralDataElements'),
        ]);
        const periodType = infrastructuralPeriodType.id || 'Yearly';
        const indicators = infrastructuralIndicators.indicators || [];
        const dataElements = infrastructuralDataElements.dataElements || [];

        this.setState({
            periodType,
            dataItems: [].concat(indicators, dataElements),
        });
    }

    async loadData() {
        const { id } = this.props;
        const { period, dataItems } = this.state;
        const { d2 } = this.context;

        const analyticsRequest = new d2.analytics.request()
            .addDataDimension(dataItems.map(item => item.id))
            .addOrgUnitDimension(id)
            .addPeriodFilter(period.id);

        const data = await d2.analytics.aggregate.get(analyticsRequest);

        if (data.rows) {
            const dxIndex = data.headers.findIndex(
                header => header.name === 'dx'
            );
            const valueIndex = data.headers.findIndex(
                header => header.name === 'value'
            );

            this.setState({
                data: data.rows
                    .map(row => ({
                        id: row[dxIndex],
                        name: data.metaData.items[row[dxIndex]].name,
                        value: row[valueIndex],
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name)),
            });
        }
    }

    // https://medium.freecodecamp.org/react-binding-patterns-5-approaches-for-handling-this-92c651b5af56
    onPeriodChange = period => {
        this.setState({
            period,
        });
    };

    render() {
        const {
            id,
            name,
            code,
            parent,
            coordinates,
            organisationUnitGroups,
            locale,
            closeOrgUnit,
        } = this.props;

        const { periodType, period, data } = this.state;

        if (!id) {
            return null;
        }

        const groups = organisationUnitGroups.toArray();
        const coords = JSON.parse(coordinates);

        return (
            <Dialog
                title={name}
                open={true}
                contentStyle={styles.dialog}
                bodyStyle={styles.body}
                onRequestClose={closeOrgUnit}
            >
                <div style={styles.content}>
                    <div style={styles.metadata}>
                        <h3 style={styles.header}>Parent unit</h3>
                        {parent.name}
                        <h3 style={styles.header}>Code</h3>
                        {code}
                        <h3 style={styles.header}>Groups</h3>
                        {groups.map(group => (
                            <div key={group.id}>{group.name}</div>
                        ))}
                    </div>
                    <div style={styles.data}>
                        <PeriodSelect
                            periodType={periodType}
                            period={period}
                            onChange={this.onPeriodChange}
                            style={styles.period}
                        />
                        {data && data.length ? (
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.left}>
                                            {i18next.t('Data element')}
                                        </th>
                                        <th style={styles.right}>
                                            {i18next.t('Value')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(({ id, name, value }) => (
                                        <tr key={id}>
                                            <td>{name}</td>
                                            <td style={styles.right}>
                                                {value}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : null}
                    </div>
                </div>
            </Dialog>
        );
    }
}

export default connect(
    state => ({
        ...state.orgUnit,
        locale: state.userSettings.keyUiLocale,
    }),
    { closeOrgUnit }
)(OrgUnitDialog);
