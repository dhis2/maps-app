import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import DataItemSelect from '../dataItem/DataItemSelect';
import FilterSelect from './FilterSelect';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
    container: {
        height: 68,
        marginBottom: 8,
        padding: '-0 56px 0 8px',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        clear: 'both',
        borderRadius: 8,
        border: `1px solid ${theme.palette.divider}`,
    },
    select: {
        marginRight: 24,
        float: 'left',
        width: 'calc((100% - 48px) / 8 * 3)',
    },
    removeBtnContainer: {
        borderLeft: `1px solid ${theme.palette.divider}`,
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        padding: '10px 0px',
        '&:hover': {
            backgroundColor: theme.palette.background.menu,
        },
    },
    removeBtn: {
        '&:hover': {
            backgroundColor: 'inherit',
        },
    },
});

class FilterRow extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        dataItems: PropTypes.array,
        dimension: PropTypes.string,
        filter: PropTypes.string,
        program: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        programStage: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        onRemove: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    onChange(dimension, filter) {
        const { index, dataItems, onChange } = this.props;

        const name = dataItems.filter(d => d.id === dimension)[0].name;

        if (dimension !== this.props.dimension) {
            // New dimension
            onChange(index, {
                dimension,
                name,
                filter: null,
            });
        } else {
            onChange(index, {
                dimension,
                name,
                filter,
            });
        }
    }

    render() {
        const {
            classes,
            index,
            dimension,
            filter,
            dataItems,
            program,
            programStage,
            onRemove,
        } = this.props;
        let dataItem;

        if (dataItems && dimension) {
            dataItem = dataItems.filter(d => d.id === dimension)[0];
        }

        return (
            <div className={classes.container}>
                <DataItemSelect
                    className={classes.select}
                    value={dimension || null}
                    program={program}
                    programStage={programStage}
                    excludeTypes={[
                        'FILE_RESOURCE',
                        'ORGANISATION_UNIT',
                        'COORDINATE',
                    ]}
                    onChange={dataItem => this.onChange(dataItem.id, filter)}
                />
                {dimension ? (
                    <FilterSelect
                        {...dataItem}
                        filter={filter}
                        onChange={filter => this.onChange(dimension, filter)}
                    />
                ) : null}
                <div className={classes.removeBtnContainer}>
                    <IconButton
                        tooltip={i18n.t('Remove filter')}
                        className={classes.removeBtn}
                        onClick={() => onRemove(index)}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(FilterRow);
