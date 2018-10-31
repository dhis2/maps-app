import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';

import { SelectField } from '../../core/SelectField';
import Checkbox from '../../core/Checkbox';

const styles = theme => ({
    contentDiv: {
        marginBottom: theme.spacing.unit * 1.5,
    },
    selectField: {
        width: '50%',
        marginLeft: theme.spacing.unit * 1.5,
    },
    inputContainer: {
        margin: `${theme.spacing.unit * 3}px 0`,
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
        <div className={classes.contentDiv}>
            {i18n.t('Please select the format for dimension attributes')}
        </div>
        <div className={classes.inputContainer}>
            <SelectField
                classes={{
                    textField: classes.selectField,
                }}
                label={i18n.t('Meta-data ID scheme')}
                items={formatOptions}
                value={selectedFormatOption}
                onChange={onChangeFormatOption}
            />
            <Checkbox
                label={i18n.t(
                    'Use human-readable keys for all other attributes'
                )}
                checked={humanReadableChecked}
                onCheck={onCheckHumanReadable}
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
