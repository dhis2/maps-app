import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    container: {
        float: 'left',
        width: 120,
        marginLeft: 12,
        cursor: 'pointer',
        boxSizing: 'border-box',
        height: 90,
    },
    imageContainer: {
        position: 'relative',
        height: 56,
        width: '100%',
        marginTop: 4,
        overflow: 'hidden',
        outline: `1px solid ${theme.palette.divider}`,
    },
    selected: {
        outline: `3px solid ${theme.palette.primary.main}`,
    },
    image: {
        position: 'absolute',
        clip: 'rect(64px, 256px, 192px, 0)',
        width: '100%',
        top: -64,
    },
    noImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: theme.palette.background.default,
        color: theme.palette.text.hint,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: '56px',
    },
    name: {
        fontSize: 12,
        color: theme.palette.text.secondary,
        paddingTop: 4,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'center',
        lineHeight: '18px',
    },
    nameSelected: {
        color: theme.palette.primary.dark,
        fontWeight: 500,
    },
});

// TODO: Use ImageSelect.js component for selectable image
const Basemap = ({ classes, id, img, name, isSelected, onClick }) => {
    return (
        <div
            className={classes.container}
            title={name}
            onClick={() => onClick(id)}
            data-test="basemaplistitem"
        >
            <div
                className={`${classes.imageContainer} ${
                    isSelected ? classes.selected : ''
                }`}
                data-test="basemaplistitem-img"
            >
                {img ? (
                    <img src={img} className={classes.image} />
                ) : (
                    <div className={classes.noImage}>
                        {i18n.t('External basemap')}
                    </div>
                )}
            </div>
            <div
                className={`${classes.name} ${
                    isSelected ? classes.nameSelected : ''
                }`}
                data-test="basemaplistitem-name"
            >
                {i18n.t(name)}
            </div>
        </div>
    );
};

Basemap.propTypes = {
    classes: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    img: PropTypes.string,
    name: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

Basemap.defaultProps = {
    title: '',
};

export default withStyles(styles)(Basemap);
