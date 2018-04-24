import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Button from 'material-ui/FlatButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle-outline';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import { grey600 } from 'material-ui/styles/colors';
import i18next from 'i18next';
import size from 'lodash/fp/size';
import {RIGHT_PANEL_WIDTH } from '../../constants/layout';
import InterpretationDialog from '../favorites/InterpretationDialog';
import { getDateFromString } from '../../util/dateUtils';
import Interpretation from './Interpretation';
import './InterpretationsCard.css';
import {
    toggleExpand,
    openInterpretationDialog,
    closeInterpretationDialog,
    saveInterpretation,
} from '../../actions/interpretations';

import { setCurrentInterpretation } from '../../actions/favorites';

const styles = {
    newInterpretation: {
        width: 32,
        height: 32,
        padding: 5,
        position: 'absolute',
        right: 48,
        top: 0,
    },
    back: {
        width: 32,
        height: 32,
        padding: 5,
        position: 'absolute',
        right: 48,
        top: 0,
    },
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
    interpretation: {
        cursor: "pointer",
        padding: 4,
    },
};

const EditButton = props => {
    const { map, tooltip, icon, onClick } = props;
    const iconStyle = {width: 14, height: 14, padding: 0, marginLeft: 2};

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

const InterpretationsList = props => {
    const { interpretations, setCurrentInterpretation, d2 } = props;
    const getUserUrl = user => `${baseurl}/dhis-web-messaging/profile.action?id=${user.id}`;

    return (
        <div>
            <div style={{fontStyle: "italic", marginLeft: 15}}>
                {interpretations.length === 0 && <span>{i18next.t('No interpretations')}</span>}
            </div>

            {interpretations.map(interpretation => (
                <div
                    key={interpretation.id}
                    style={styles.interpretation}
                    onClick={() => setCurrentInterpretation(interpretation.id)}
                >
                    <Interpretation d2={d2} interpretation={interpretation} />
                </div>
            ))}
        </div>
    );
};

const InterpretationDetails = props => {
    const { interpretation, d2 } = props;
    const comments = _(interpretation.comments).sortBy("created").reverse().value();

    return (
        <div>
            <Interpretation d2={d2} interpretation={interpretation} showActions={true} showComments={true} />
        </div>
    );
};

const InterpretationButtons = ({ currentInterpretation, setCurrentInterpretation, openInterpretationDialog }) => (
    currentInterpretation ?
        <IconButton
            style={styles.back}
            onClick={() => setCurrentInterpretation(null)}
            tooltip={i18next.t('Clear interpretation')}
        >
           <SvgIcon icon="ChevronLeft" color={grey600} />
        </IconButton>
    :
        <IconButton
            style={styles.newInterpretation}
            onClick={() => openInterpretationDialog({})}
            tooltip={i18next.t('Write new interpretation')}
            tooltipPosition="bottom-left"
        >
            <SvgIcon icon="Add" color={grey600} />
        </IconButton>
);

const InterpretationsCard = (props, context) => {
    const {
        map,
        isExpanded,
        toggleExpand,
        interpretationToEdit,
        openInterpretationDialog,
        closeInterpretationDialog,
        saveInterpretation,
        interpretations,
        currentInterpretationId,
        setCurrentInterpretation,
    } = props;

    const sortedInterpretations = _(interpretations).sortBy("created").reverse().value();

    const saveInterpretationAndClose = (interpretation) => {
        saveInterpretation(interpretation);
        closeInterpretationDialog();
    };

    const currentInterpretation = currentInterpretationId
        ? interpretations.find(interpretation => interpretation.id === currentInterpretationId)
        : null;

    return (
        <Card
            className="InterpretationsCard"
            containerStyle={styles.container}
            expanded={isExpanded}
            onExpandChange={toggleExpand}
        >
            {interpretationToEdit &&
                <InterpretationDialog
                    favoriteId={map.id}
                    interpretation={interpretationToEdit}
                    onSave={interpretation => saveInterpretationAndClose(interpretation)}
                    onClose={closeInterpretationDialog}
                />
            }

            <CardHeader
                className="InterpretationsCard-header"
                title={i18next.t('Interpretations')}
                showExpandableButton={true}
                textStyle={styles.headerText}
            >
                <InterpretationButtons
                    currentInterpretation={currentInterpretation}
                    setCurrentInterpretation={setCurrentInterpretation}
                    openInterpretationDialog={openInterpretationDialog}
                />
            </CardHeader>

            <CardText expandable={true} style={styles.body}>
                {currentInterpretation
                    ?
                        <InterpretationDetails
                            d2={context.d2}
                            interpretation={currentInterpretation}
                        />
                    :
                        <InterpretationsList
                            d2={context.d2}
                            interpretations={sortedInterpretations}
                            setCurrentInterpretation={setCurrentInterpretation}
                        />
                }
            </CardText>
        </Card>
    );
};

InterpretationsCard.propTypes = {
    map: PropTypes.object.isRequired,
    interpretations: PropTypes.array.isRequired,
    isExpanded: PropTypes.bool,
    toggleExpand: PropTypes.func.isRequired,
    interpretationToEdit: PropTypes.object,
    openInterpretationDialog: PropTypes.func.isRequired,
    closeInterpretationDialog: PropTypes.func.isRequired,
    saveInterpretation: PropTypes.func.isRequired,
    currentInterpretationId: PropTypes.string,
    setCurrentInterpretation: PropTypes.func.isRequired,
};

InterpretationsCard.defaultProps = {
    isExpanded: true,
    interpretationToEdit: null,
    currentInterpretationId: null,
};

InterpretationsCard.contextTypes = {
    d2: PropTypes.object.isRequired,
};


export default connect(
    state => ({
        map: state.map,
        interpretations: state.interpretations.interpretations,
        isExpanded: state.interpretations.isExpanded,
        interpretationToEdit: state.interpretations.interpretationToEdit,
        currentInterpretationId: state.interpretations.currentInterpretationId,
    }),
    {
        toggleExpand,
        openInterpretationDialog,
        closeInterpretationDialog,
        saveInterpretation,
        setCurrentInterpretation,
    },
)(InterpretationsCard);
