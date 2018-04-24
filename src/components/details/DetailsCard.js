import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import { grey600 } from 'material-ui/styles/colors';
import i18next from 'i18next';
import { getDateFromString } from '../../util/dateUtils';
import size from 'lodash/fp/size';
import pick from 'lodash/fp/pick';
import SharingDialog from 'd2-ui-sharing';
import DetailsDialog from '../favorites/DetailsDialog';

import {
    toggleDetailsExpand,
    openSharingDialog,
    closeSharingDialog,
    openDetailsDialog,
    closeDetailsDialog,
} from '../../actions/details';

import { updateMap } from '../../actions/map';

import { saveFavorite } from '../../actions/favorites';

import './DetailsCard.css';

const styles = {
    container: {
        paddingBottom: 0,
    },
    headerText: {
        position: 'relative',
        width: 210,
        top: '50%',
        transform: 'translateY(-50%)',
        paddingRight: 0,
    },
    body: {
        padding: 0,
    },
};

const List = ({children}) =>
    <div className="DetailsCard-list">{children}</div>;

const ListItem = ({label, children}) => (
    <div>
        {label && <label style={{fontWeight: "bold", marginRight: 5}}>{label}:</label>}
        {children}
    </div>
);

const EditButton = props => {
    const { map, tooltip, icon, onClick } = props;
    const iconStyle = { width: 14, height: 14, padding: 0, marginLeft: 2 };

    if (map && map.access && map.access.update) {
        return (
            <IconButton tooltip={tooltip} onClick={onClick} style={iconStyle} iconStyle={iconStyle}>
                <SvgIcon icon={icon} color={grey600} />
            </IconButton>
        );
    } else {
        return null;
    }
};

const descriptionMaxLength = 250;

const getDescription = map => {
    const {description} = map;

    if (!description) {
        return (<i>{i18next.t('No description')}</i>)
    } else if (description.length < descriptionMaxLength) {
        return description;
    } else {
        return description.substring(0, descriptionMaxLength) + ' ...';
    }
};

const getOwner = map => {
    return map.user ? map.user.displayName : '-';
};

const accessMapping = {
    "--------": "None",
    "r-------": "Read",
    "rw------": "Read/Write",
};

const getSharingText = map => {
    const publicAccessKey = accessMapping[map.publicAccess] || "Unknown";
    const publicAccess = i18next.t('Public') + ": " + i18next.t(publicAccessKey);

    const userGroupsCount = _.size(map.userGroupAccesses);
    const userGroupsInfo = userGroupsCount > 2
        ? `${userGroupsCount} ${i18next.t('user groups')}`
        : (map.userGroupAccesses || []).map(userGroup => userGroup.displayName).join(", ");

    return publicAccess + (userGroupsInfo ? ` + ${userGroupsInfo}` : "");
};

const DetailsCard = (props, context) => {
    const {
        map,
        isExpanded,
        toggleDetailsExpand,
        isSharingDialogOpen,
        openSharingDialog,
        closeSharingDialog,
        openDetailsDialog,
        closeDetailsDialog,
        isDetailsDialogOpen,
        saveFavorite,
        updateMap,
    } = props;

    const saveDetailsAndCloseDialog = (map, newAttributes) => {
        updateMap(newAttributes);
        saveFavorite(Object.keys(newAttributes));
        closeDetailsDialog()
    };

    const updateMapAndCloseDialog = (map) => {
        const newAttributes = pick(["publicAccess", "userGroupAccesses"], map);
        updateMap(newAttributes);
        closeSharingDialog();
    };

    return (
        <Card
            className="DetailsCard"
            containerStyle={styles.container}
            expanded={isExpanded}
            onExpandChange={toggleDetailsExpand}
        >
            <SharingDialog
                open={isSharingDialogOpen}
                type="map"
                id={map.id}
                onRequestClose={updateMapAndCloseDialog}
                d2={context.d2}
            />

            <DetailsDialog
                open={isDetailsDialogOpen}
                favorite={map}
                onSave={saveDetailsAndCloseDialog}
                onClose={closeDetailsDialog}
            />

            <CardHeader
                className="DetailsCard-header"
                title={i18next.t('Details')}
                showExpandableButton={true}
                textStyle={styles.headerText}
            >
            </CardHeader>

            <CardText expandable={true} style={styles.body}>
                <List>
                    <ListItem>
                        {getDescription(map)}
                        <EditButton icon="Create" map={map} tooltip="Edit details" onClick={openDetailsDialog} />
                    </ListItem>

                    <ListItem label={i18next.t('Owner')}>
                        {getOwner(map)}
                    </ListItem>

                    <ListItem label={i18next.t('Created')}>
                        {getDateFromString(map.created)}
                    </ListItem>

                    <ListItem label={i18next.t('Last updated')}>
                        {getDateFromString(map.lastUpdated)}
                    </ListItem>

                    <ListItem label={i18next.t('Views')}>
                        {map.favoriteViews}
                    </ListItem>

                    <ListItem label={i18next.t('Sharing')}>
                        {getSharingText(map)}
                        <EditButton icon="Group" map={map} tooltip="Edit sharing" onClick={openSharingDialog} />
                    </ListItem>
                </List>
            </CardText>
        </Card>
    );
};

DetailsCard.propTypes = {
    map: PropTypes.object.isRequired,
    isExpanded: PropTypes.bool,
    toggleDetailsExpand: PropTypes.func.isRequired,
    isSharingDialogOpen: PropTypes.bool.isRequired,
    openSharingDialog: PropTypes.func.isRequired,
    closeSharingDialog: PropTypes.func.isRequired,
    openDetailsDialog: PropTypes.func.isRequired,
    closeDetailsDialog: PropTypes.func.isRequired,
    updateMap: PropTypes.func.isRequired,
};

DetailsCard.defaultProps = {
    isExpanded: true,
    isSharingDialogOpen: false,
    isDetailsDialogOpen: false,
};

DetailsCard.contextTypes = {
    d2: PropTypes.object.isRequired,
};

export default connect(
    state => ({
        map: state.map,
        isExpanded: state.details.isExpanded,
        isSharingDialogOpen: state.details.isSharingDialogOpen,
        isDetailsDialogOpen: state.details.isDetailsDialogOpen,
    }),
    {
        toggleDetailsExpand,
        openSharingDialog,
        closeSharingDialog,
        openDetailsDialog,
        closeDetailsDialog,
        saveFavorite,
        updateMap,
    },
)(DetailsCard);
