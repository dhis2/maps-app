import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';

import SelectField from '../../core/SelectField';
import Checkbox from '../../core/Checkbox';

const styles = theme => ({
    headingDiv: {
        marginBottom: theme.spacing(1),
    },
    selectField: {
        width: '50%',
    },
    checkboxRoot: {
        margin: `${theme.spacing(0.5)}px 0`,
        marginLeft: -theme.spacing(1.5),
    },
});

export const EventDownloadInputs = ({
    classes,

    formatOptions,
    selectedFormatOption,
    humanReadableChecked,
    onChangeFormatOption,
    onCheckHumanReadable,
}) => (
    <Fragment>
        <div className={classes.headingDiv}>
            {i18n.t('GeoJSON Properties:')}
        </div>
        <div className={classes.selectField}>
            <SelectField
                label={i18n.t('ID Format')}
                items={formatOptions}
                value={selectedFormatOption}
                onChange={onChangeFormatOption}
            />
        </div>
        <div>
            <Checkbox
                classes={{
                    root: classes.checkboxRoot,
                }}
                label={i18n.t('Use human-readable keys')}
                checked={humanReadableChecked}
                onChange={onCheckHumanReadable}
            />
        </div>
    </Fragment>
);
EventDownloadInputs.propTypes = {
    classes: PropTypes.object.isRequired,

    formatOptions: PropTypes.array.isRequired,
    selectedFormatOption: PropTypes.number.isRequired,
    humanReadableChecked: PropTypes.bool.isRequired,

    onChangeFormatOption: PropTypes.func.isRequired,
    onCheckHumanReadable: PropTypes.func.isRequired,
};

export default withStyles(styles)(EventDownloadInputs);
