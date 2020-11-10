import React, { Fragment, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Popover } from '@dhis2/ui';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { DimensionsPanel } from '@dhis2/d2-ui-analytics';
import { loadDimensions } from '../../actions/dimensions';
import styles from './styles/DimensionSelect.module.css';

const DimensionSelect = ({
    dimension,
    dimensions,
    onChange,
    loadDimensions,
}) => {
    const dropdownRef = useRef();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!dimensions) {
            loadDimensions();
        }
    }, [dimensions, loadDimensions]);

    if (!dimensions) {
        return null;
    }

    const selected = dimensions[dimension];

    const onDimensionClick = dim => {
        if (dim !== dimension) {
            onChange(dimensions[dim]);
        }
        setIsOpen(false);
    };

    return (
        <Fragment>
            <div
                ref={dropdownRef}
                onClick={() => setIsOpen(true)}
                className={styles.dropdown}
            >
                <label>{i18n.t('Dimension')}</label>
                <div>
                    <span>{selected ? selected.name : ''}</span>
                    <ExpandMore />
                </div>
            </div>
            {isOpen && (
                <Popover
                    reference={dropdownRef}
                    placement="bottom-start"
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div className={styles.dimensions}>
                        <DimensionsPanel
                            dimensions={dimensions}
                            onDimensionClick={onDimensionClick}
                            selectedIds={[dimension]}
                        />
                    </div>
                </Popover>
            )}
        </Fragment>
    );
};

DimensionSelect.propTypes = {
    dimension: PropTypes.string,
    dimensions: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    loadDimensions: PropTypes.func.isRequired,
};

export default connect(
    ({ dimensions }) => ({
        dimensions: dimensions
            ? dimensions.reduce((obj, dim) => {
                  obj[dim.id] = dim;
                  return obj;
              }, {})
            : null,
    }),
    { loadDimensions }
)(DimensionSelect);
