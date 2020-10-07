import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
} from '@dhis2/ui';
import PeriodSelect from '../periods/PeriodSelect';
import { closeOrgUnit } from '../../actions/orgUnits';
import { loadConfigurations, loadData } from '../../util/infrastructural';

const styles = {
    metadata: {
        fontSize: 14,
        marginTop: -10,
        width: 200,
        float: 'left',
    },
    heading: {
        margin: '10px 0 2px 0',
        fontWeight: 'bold',
    },
    data: {
        float: 'left',
        width: 345,
        marginTop: -12,
    },
    nodata: {
        fontStyle: 'italic',
        padding: 5,
        fontSize: 14,
    },
    table: {
        display: 'block',
        fontSize: 14,
        width: 345,
        maxHeight: 240,
        overflowY: 'auto',
        marginTop: -24,
        '& th': {
            fontWeight: 'bold',
        },
    },
    left: {
        textAlign: 'left',
        width: 270,
    },
    right: {
        textAlign: 'right',
        verticalAlign: 'top',
        width: 75,
        paddingRight: 8,
    },
};

export class OrgUnitDialog extends Component {
    static propTypes = {
        id: PropTypes.string,
        name: PropTypes.string,
        code: PropTypes.string,
        parent: PropTypes.shape({
            name: PropTypes.string.isRequired,
        }),
        organisationUnitGroups: PropTypes.object,
        closeOrgUnit: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
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
            dataItems.length &&
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
        const {
            id,
            name,
            code,
            parent,
            organisationUnitGroups,
            classes,
        } = this.props;
        const { periodType, period, data } = this.state;

        if (!id) {
            return null;
        }

        const groups = organisationUnitGroups.toArray();

        return (
            <Modal position="middle" open={true} onClose={this.onClose}>
                <ModalTitle>{name}</ModalTitle>
                <ModalContent>
                    <div className={classes.metadata}>
                        <h3 className={classes.heading}>
                            {i18n.t('Parent unit')}
                        </h3>
                        {parent.name}
                        <h3 className={classes.heading}>{i18n.t('Code')}</h3>
                        {code}
                        <h3 className={classes.heading}>{i18n.t('Groups')}</h3>
                        {groups.map(group => (
                            <div key={group.id}>{group.name}</div>
                        ))}
                    </div>
                    <div className={classes.data}>
                        <PeriodSelect
                            periodType={periodType}
                            period={period}
                            onChange={this.onPeriodChange}
                        />
                        {data && data.length ? (
                            <table className={classes.table}>
                                <thead>
                                    <tr>
                                        <th className={classes.left}>
                                            {i18n.t('Data element')}
                                        </th>
                                        <th className={classes.right}>
                                            {i18n.t('Value')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(({ id, name, value }) => (
                                        <tr key={id}>
                                            <td>{name}</td>
                                            <td className={classes.right}>
                                                {value}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className={classes.nodata}>
                                {i18n.t('No data found for this period.')}
                            </div>
                        )}
                    </div>
                </ModalContent>
                <ModalActions>
                    <Button secondary onClick={this.onClose}>
                        {i18n.t('Close')}
                    </Button>
                </ModalActions>
            </Modal>
        );
    }
}

export default connect(
    state => ({
        ...state.orgUnit,
    }),
    { closeOrgUnit }
)(withStyles(styles)(OrgUnitDialog));
