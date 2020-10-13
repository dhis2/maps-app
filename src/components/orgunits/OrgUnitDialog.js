import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Table,
    TableHead,
    TableRowHead,
    TableCellHead,
    TableBody,
    TableRow,
    TableCell,
    Button,
} from '@dhis2/ui';
import PeriodSelect from '../periods/PeriodSelect';
import { closeOrgUnit } from '../../actions/orgUnits';
import { loadConfigurations, loadData } from '../../util/infrastructural';
import styles from './styles/OrgUnitDialog.module.css';

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
        const { id, name, code, parent, organisationUnitGroups } = this.props;
        const { periodType, period, data } = this.state;

        if (!id) {
            return null;
        }

        const groups = organisationUnitGroups.toArray();

        return (
            <Modal position="middle" onClose={this.onClose}>
                <ModalTitle>{name}</ModalTitle>
                <ModalContent>
                    <div className={styles.orgunit}>
                        <div className={styles.metadata}>
                            <h3>{i18n.t('Parent unit')}</h3>
                            {parent.name}
                            <h3>{i18n.t('Code')}</h3>
                            {code}
                            <h3>{i18n.t('Groups')}</h3>
                            {groups.map(group => (
                                <div key={group.id}>{group.name}</div>
                            ))}
                        </div>
                        <div className={styles.data}>
                            <PeriodSelect
                                periodType={periodType}
                                period={period}
                                onChange={this.onPeriodChange}
                            />
                            {data && data.length ? (
                                <Table>
                                    <TableHead>
                                        <TableRowHead>
                                            <TableCellHead dense>
                                                {i18n.t('Data element')}
                                            </TableCellHead>
                                            <TableCellHead
                                                dense
                                                className={styles.right}
                                            >
                                                {i18n.t('Value')}
                                            </TableCellHead>
                                        </TableRowHead>
                                    </TableHead>
                                    <TableBody>
                                        {data.map(({ id, name, value }) => (
                                            <TableRow key={id}>
                                                <TableCell dense>
                                                    {name}
                                                </TableCell>
                                                <TableCell
                                                    dense
                                                    className={styles.right}
                                                >
                                                    {value}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className={styles.nodata}>
                                    {i18n.t('No data found for this period.')}
                                </div>
                            )}
                        </div>
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
    ({ orgUnit }) => ({
        ...orgUnit,
    }),
    { closeOrgUnit }
)(OrgUnitDialog);
