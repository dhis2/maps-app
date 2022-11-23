import { DimensionsPanel } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import { Popover, IconChevronDown24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Fragment, useRef, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { loadDimensions } from '../../actions/dimensions.js'
import styles from './styles/DimensionSelect.module.css'

const DimensionSelect = ({
    dimension,
    dimensions,
    onChange,
    loadDimensions,
}) => {
    const dropdownRef = useRef()
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (!dimensions) {
            loadDimensions()
        }
    }, [dimensions, loadDimensions])

    if (!dimensions) {
        return null
    }

    const findDimension = (id) => dimensions.find((d) => d.id === id)
    const selected = findDimension(dimension)

    const onDimensionClick = (dim) => {
        if (dim !== dimension) {
            onChange(findDimension(dim))
        }
        setIsOpen(false)
    }

    return (
        <Fragment>
            <div onClick={() => setIsOpen(true)} className={styles.dropdown}>
                <label>{i18n.t('Dimension')}</label>
                <div ref={dropdownRef}>
                    <span>{selected ? selected.name : ''}</span>
                    <IconChevronDown24 />
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
    )
}

DimensionSelect.propTypes = {
    loadDimensions: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    dimension: PropTypes.string,
    dimensions: PropTypes.array,
}

export default connect(
    ({ dimensions }) => ({
        dimensions,
    }),
    { loadDimensions }
)(DimensionSelect)
