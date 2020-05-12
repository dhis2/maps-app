import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setStartDate, setEndDate } from '../../actions/layerEdit';

/*
<DatePicker
key="startdate"
label={i18n.t('Start date')}
value={startDate}
onChange={setStartDate}
style={styles.select}
/>
<DatePicker
key="enddate"
label={i18n.t('End date')}
value={endDate}
onChange={setEndDate}
style={styles.select}
/>
periodError && (
<div key="error" style={styles.error}>
{periodError}
</div>
)
*/

const StartEndDates = props => {
    return <Fragment>###</Fragment>;
};

StartEndDates.propTypes = {
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    errorText: PropTypes.string,
};

export default connect(
    ({ settings }) => ({
        locale: settings.user.keyUiLocale,
    }),
    { setStartDate, setEndDate }
)(StartEndDates);
