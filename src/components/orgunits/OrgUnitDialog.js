import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Button from 'd2-ui/lib/button/Button';
import Dialog from 'material-ui/Dialog';
import PeriodSelect from '../periods/PeriodSelect';
import { closeOrgUnit } from '../../actions/orgUnits';
import { loadConfigurations, loadData } from '../../util/infrastructural';
import './OrgUnitDialog.css';

class OrgUnitDialog extends Component {
    static propTypes = {
        id: PropTypes.string,
        name: PropTypes.string,
        code: PropTypes.string,
        parent: PropTypes.shape({
            name: PropTypes.string.isRequired,
        }),
        organisationUnitGroups: PropTypes.object,
        closeOrgUnit: PropTypes.func.isRequired,
    };

    state = {
        peridType: null,
        period: null,
        periods: null,
    };

    componentDidUpdate(prevProps, prevState) {
        const { id } = this.props;
        const { period, periodType, dataItems } = this.state;

        if (!periodType || !dataItems) {
            loadConfigurations().then(config => this.setState(config));
        } else if (
            id &&
            dataItems &&
            period &&
            (id !== prevProps.id || period !== prevState.period)
        ) {
            loadData(id, period.id, dataItems).then(data =>
                this.setState({ data })
            );
        }
    }

    // Change of period state will trigger data load above
    onPeriodChange = period => {
        this.setState({
            period,
        });
    };

    // Clear data and period before closing dialog
    onClose = () => {
        this.setState({
            period: null,
            data: null,
        });
        this.props.closeOrgUnit();
    };

    render() {
        const { id, name, code, parent, organisationUnitGroups } = this.props;
        const { periodType, period, data } = this.state;

        if (!id) {
            return null;
        }

        const groups = organisationUnitGroups.toArray();

        const closeBtn = (
            <Button color="primary" onClick={this.onClose}>
                {i18next.t('Close')}
            </Button>
        );

        return (
            <Dialog
                title={name}
                open={true}
                contentStyle={{ maxWidth: 600 }}
                onRequestClose={this.onClose}
                actions={closeBtn}
                className="OrgUnitDialog"
            >
                <div className="OrgUnitDialog-content">
                    <div className="OrgUnitDialog-metadata">
                        <h3>{i18next.t('Parent unit')}</h3>
                        {parent.name}
                        <h3>{i18next.t('Code')}</h3>
                        {code}
                        <h3>{i18next.t('Groups')}</h3>
                        {groups.map(group => (
                            <div key={group.id}>{group.name}</div>
                        ))}
                    </div>
                    <div className="OrgUnitDialog-data">
                        <PeriodSelect
                            periodType={periodType}
                            period={period}
                            onChange={this.onPeriodChange}
                            style={{ height: 70, margin: '-17px 0 0 3px' }}
                        />
                        {data && data.length ? (
                            <table className="OrgUnitDialog-table">
                                <thead>
                                    <tr>
                                        <th className="left">
                                            {i18next.t('Data element')}
                                        </th>
                                        <th className="right">
                                            {i18next.t('Value')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(({ id, name, value }) => (
                                        <tr key={id}>
                                            <td>{name}</td>
                                            <td className="right">{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="OrgUnitDialog-nodata">
                                {i18next.t('No data found for this period.')}
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>
        );
    }
}

export default connect(
    state => ({
        ...state.orgUnit,
    }),
    { closeOrgUnit }
)(OrgUnitDialog);
