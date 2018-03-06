import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Dialog from 'material-ui/Dialog';
import Button from 'd2-ui/lib/button/Button';
import { closeAboutDialog } from '../../actions/about';

const style = {
    padding: 5,
};

const AboutDialog = ({ aboutDialogOpen, closeAboutDialog }, { d2 }) => {
    const system = d2.system.systemInfo;
    const user = d2.currentUser;

    const data = [
        {
            name: i18next.t('Time since last data update'),
            value: system.intervalSinceLastAnalyticsTableSuccess,
        },
        {
            name: i18next.t('Version'),
            value: system.version,
        },
        {
            name: i18next.t('Revision'),
            value: system.revision,
        },
        {
            name: i18next.t('Username'),
            value: user.username,
        },
    ];

    return (
        <Dialog
            title={i18next.t('About DHIS2 Maps')}
            actions={[
                <Button color="primary" onClick={closeAboutDialog}>
                    Close
                </Button>,
            ]}
            open={aboutDialogOpen}
            onRequestClose={closeAboutDialog}
        >
            {data.map(({ name, value }) => (
                <div key={name} style={style}>
                    <b>{name}</b>: {value}
                </div>
            ))}
        </Dialog>
    );
};

AboutDialog.propTypes = {
    aboutDialogOpen: PropTypes.bool.isRequired,
    closeAboutDialog: PropTypes.func.isRequired,
};

AboutDialog.contextTypes = {
    d2: PropTypes.object,
};

export default connect(
    state => ({
        aboutDialogOpen: state.ui.aboutDialogOpen,
    }),
    { closeAboutDialog }
)(AboutDialog);
