import i18n from '@dhis2/d2-i18n'
import { Help, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setOptionStyle } from '../../actions/layerEdit.js'
import { qualitativeColors } from '../../constants/colors.js'
import useOptionSet from '../../hooks/useOptionSet.js'
import { getUniqueColor } from '../../util/colors.js'
import OptionStyle from './OptionStyle.jsx'
import styles from './styles/OptionSetStyle.module.css'

const MAX_OPTIONS = 50

const getColor = getUniqueColor(qualitativeColors)

const addOptionStyle = (option, index) => ({
    ...option,
    style: {
        color: option.style ? option.style.color : getColor(index),
    },
})

const OptionSetStyle = ({ styledOptionSet }) => {
    const { optionSet } = useOptionSet(styledOptionSet.id)
    const [warning, setWarning] = useState()
    const dispatch = useDispatch()

    const options =
        styledOptionSet.id === optionSet?.id ? optionSet.options : null
    const styledOptions = styledOptionSet.options

    const onChange = useCallback(
        (id, color) => {
            dispatch(
                setOptionStyle(
                    // Update options style
                    styledOptionSet.options.map((option) =>
                        option.id === id
                            ? {
                                  ...option,
                                  style: {
                                      color,
                                  },
                              }
                            : option
                    )
                )
            )
        },
        [styledOptionSet, dispatch]
    )

    useEffect(() => {
        if (!styledOptions && options) {
            if (options.length <= MAX_OPTIONS) {
                // Set default options style
                dispatch(setOptionStyle(options.map(addOptionStyle)))
            } else {
                setWarning(
                    i18n.t(
                        'This data element has too many options ({{length}}). Max options for styling is {{max}}.',
                        {
                            length: options.length,
                            max: MAX_OPTIONS,
                        }
                    )
                )
            }
        }
    }, [styledOptions, options, dispatch])

    return (
        <div className={styles.optionSetStyle}>
            {styledOptions ? (
                styledOptions.map(({ id, name, style }) => (
                    <OptionStyle
                        key={id}
                        name={name}
                        color={style.color}
                        onChange={(color) => onChange(id, color)}
                    />
                ))
            ) : warning ? (
                <Help warning>{warning}</Help>
            ) : (
                <CircularLoader small />
            )}
        </div>
    )
}

OptionSetStyle.propTypes = {
    styledOptionSet: PropTypes.shape({
        id: PropTypes.string.isRequired,
        options: PropTypes.array,
    }).isRequired,
}

export default OptionSetStyle
