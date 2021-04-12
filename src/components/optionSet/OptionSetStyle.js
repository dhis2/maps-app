import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Help, CircularLoader } from '@dhis2/ui';
import OptionStyle from './OptionStyle';
import { loadOptionSet } from '../../actions/optionSets';
import { setOptionStyle } from '../../actions/layerEdit';
import { qualitativeColors } from '../../constants/colors';
import styles from './styles/OptionSetStyle.module.css';

const MAX_OPTIONS = 50;
const DEFAULT_COLOR = '#FFFFFF';

const addOptionStyle = (option, index) => ({
    ...option,
    style: {
        color: option.style
            ? option.style.color
            : qualitativeColors[index] || DEFAULT_COLOR,
    },
});

const OptionSetStyle = ({
    id,
    options,
    optionSet,
    loadOptionSet,
    setOptionStyle,
}) => {
    const [warning, setWarning] = useState();

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
            // const { options } = optionSet;
            let { options } = optionSet;
            // options = options.slice(0, 50);

            // console.log('options', options);

            if (options.length <= MAX_OPTIONS) {
                setOptionStyle(options.map(addOptionStyle));
            } else {
                setWarning(
                    i18n.t(
                        'This data element has too many options ({{length}}). Max options for styling is {{max}}.',
                        {
                            length: options.length,
                            max: MAX_OPTIONS,
                        }
                    )
                );
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
            ) : warning ? (
                <Help warning>{warning}</Help>
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
