import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CircularLoader } from '@dhis2/ui';
import OptionStyle from './OptionStyle';
import { loadOptionSet } from '../../actions/optionSets';
import { setOptionStyle } from '../../actions/layerEdit';
import { qualitativeColors } from '../../constants/colors';
import styles from './styles/OptionSetStyle.module.css';

const OptionSetStyle = ({
    id,
    options,
    optionSet,
    loadOptionSet,
    setOptionStyle,
}) => {
    const onChange = useCallback(
        (id, color) => {
            setOptionStyle(
                options.map(option =>
                    option.id === id
                        ? {
                              ...option,
                              style: {
                                  color,
                              },
                          }
                        : option
                )
            );
        },
        [options, setOptionStyle]
    );

    useEffect(() => {
        if (!optionSet) {
            loadOptionSet(id);
        } else {
            const { options } = optionSet;

            if (options.length <= 50) {
                setOptionStyle(
                    options.map((option, index) => ({
                        ...option,
                        style: {
                            color: option.style
                                ? option.style.color
                                : qualitativeColors[index] || '#ffffff',
                        },
                    }))
                );
            } else {
                // console.log('TOO MANY OPTIONS!', options.length);
            }
        }
    }, [id, optionSet, loadOptionSet, setOptionStyle]);

    return (
        <div className={styles.optionSetStyle}>
            {options ? (
                options.map(({ id, name, style }) => (
                    <OptionStyle
                        key={id}
                        name={name}
                        color={style.color}
                        onChange={color => onChange(id, color)}
                    />
                ))
            ) : (
                <CircularLoader small />
            )}
        </div>
    );
};

OptionSetStyle.propTypes = {
    id: PropTypes.string.isRequired,
    options: PropTypes.array,
    optionSet: PropTypes.object,
    loadOptionSet: PropTypes.func.isRequired,
    setOptionStyle: PropTypes.func.isRequired,
};

export default connect(
    (state, props) => ({
        optionSet: state.optionSets[props.id],
    }),
    { loadOptionSet, setOptionStyle }
)(OptionSetStyle);
