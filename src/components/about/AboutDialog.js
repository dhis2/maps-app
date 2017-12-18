import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Dialog from 'material-ui/Dialog';
import Button from 'd2-ui/lib/button/Button';
import { closeAboutDialog } from '../../actions/about';

const style = {
  padding: 5
};

const AboutDialog = ({ aboutDialogOpen, closeAboutDialog }, { d2 }) => {
    const system = d2.system.systemInfo;
    const user = d2.currentUser;

    return (
        <Dialog
            title={i18next.t('About DHIS 2 Maps')}
            actions={[
                <Button
                    color='primary'
                    onClick={closeAboutDialog}
                >Close</Button>
            ]}
            open={aboutDialogOpen}
            onRequestClose={closeAboutDialog}
        >
            <div style={style}><b>{i18next.t('Time since last data update')}</b>: {system.intervalSinceLastAnalyticsTableSuccess}</div>
            <div style={style}><b>{i18next.t('Version')}</b>: {system.version}</div>
            <div style={style}><b>{i18next.t('Revision')}</b>: {system.revision}</div>
            <div style={style}><b>{i18next.t('Username')}</b>: {user.username}</div>
        </Dialog>
    );
};

AboutDialog.contextTypes = {
    d2: PropTypes.object
};

export default connect(
    (state) => ({
        aboutDialogOpen: state.ui.aboutDialogOpen,
    }),
    { closeAboutDialog, }
)(AboutDialog);
