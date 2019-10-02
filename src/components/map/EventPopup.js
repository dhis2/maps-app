import React from 'react';
import PropTypes from 'prop-types';
// import i18n from '@dhis2/d2-i18n';
import Popup from './Popup';

const EventPopup = props => {
    const { coordinates } = props;
    // console.log('EventPopup', props);

    return <Popup coordinates={coordinates}>###</Popup>;
};

EventPopup.propTypes = {
    coordinates: PropTypes.array.isRequired,
};

export default EventPopup;
