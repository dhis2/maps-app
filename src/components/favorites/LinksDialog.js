import React from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import Dialog from 'material-ui/Dialog';
import Button from 'd2-ui/lib/button/Button';
import { config } from 'd2/lib/d2';

const styles = {
    dialog: {
        maxWidth: 600,
        fontSize: 12,
    },
    heading: {
        fontWeight: 'normal',
        color: '#111',
        fontSize: 14,
        marginTop: 0,
        marginBottom: 5,
    },
    link: {
        display: 'block',
        fontSize: 14,
        marginBottom: 20,
    }
};

const LinkDialog = ({ favoriteId, onClose }, { d2 }) => {
    const contextPath = d2.system.systemInfo.contextPath;
    const appUrl = `${contextPath}/dhis-web-maps/?id=${favoriteId}`;
    const apiUrl = `${config.baseUrl}/maps/${favoriteId}/data`;

    return (
        <Dialog
            title={i18next.t('Favorite link')}
            open={true}
            onRequestClose={onClose}
            actions={<Button onClick={onClose}>{i18next.t('Close')}</Button>}
            contentStyle={styles.dialog}
        >
            <h3 style={styles.heading}>{i18next.t('Open in this app')}</h3>
            <a href={appUrl} target='_blank' style={styles.link}>{appUrl}</a>
            <h3 style={styles.heading}>{i18next.t('Open in Web API (limited support)')}</h3>
            <a href={apiUrl} target='_blank' style={styles.link}>{apiUrl}</a>
        </Dialog>
    )
};

LinkDialog.contextTypes = {
    d2: PropTypes.object.isRequired
};

export default LinkDialog;
