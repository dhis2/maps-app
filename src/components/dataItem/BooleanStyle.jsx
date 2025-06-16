import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setBooleanStyle } from '../../actions/layerEdit.js'
import { qualitativeColors } from '../../constants/colors.js'
import OptionStyle from '../optionSet/OptionStyle.jsx'

const style = {
    marginTop: 20,
}

const BooleanStyle = ({ valueType, values }) => {
    const dispatch = useDispatch()

    useEffect(() => {
        if (!values) {
            dispatch(setBooleanStyle('true', qualitativeColors[0]))

            if (valueType === 'BOOLEAN') {
                dispatch(setBooleanStyle('false', qualitativeColors[1]))
            }
        }
    }, [dispatch, valueType, values])

    if (!values) {
        return null
    }

    return (
        <div style={style}>
            <OptionStyle
                name={i18n.t('Yes')}
                color={values.true}
                onChange={(color) => dispatch(setBooleanStyle('true', color))}
            />
            {valueType === 'BOOLEAN' && (
                <OptionStyle
                    name={i18n.t('No')}
                    color={values.false}
                    onChange={(color) =>
                        dispatch(setBooleanStyle('false', color))
                    }
                />
            )}
        </div>
    )
}

BooleanStyle.propTypes = {
    valueType: PropTypes.string.isRequired,
    values: PropTypes.shape({
        true: PropTypes.string.isRequired,
        false: PropTypes.string,
    }),
}

export default BooleanStyle
