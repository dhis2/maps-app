import i18n from '@dhis2/d2-i18n'
import { Button, Card, InputField, Layer, Popper, Calendar } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import styles from './styles/CalendarInput.module.css'

const offsetModifier = {
    name: 'offset',
    options: {
        offset: [0, 2],
    },
}

export const CalendarInput = ({
    onDateSelect,
    calendar,
    date,
    dir,
    locale,
    numberingSystem,
    weekDayFormat,
    timeZone,
    width,
    cellSize,
    clearable,
    dataTest = 'calendar-inputfield',
    ...rest
} = {}) => {
    const ref = useRef()
    const [open, setOpen] = useState(false)

    const calendarProps = React.useMemo(() => {
        const onDateSelectWrapper = (selectedDate) => {
            setOpen(false)
            onDateSelect?.(selectedDate)
        }
        return {
            onDateSelect: onDateSelectWrapper,
            calendar,
            date,
            dir,
            locale,
            numberingSystem,
            weekDayFormat,
            timeZone,
            width,
            cellSize,
        }
    }, [
        calendar,
        cellSize,
        date,
        dir,
        locale,
        numberingSystem,
        onDateSelect,
        timeZone,
        weekDayFormat,
        width,
    ])

    const onFocus = () => {
        setOpen(true)
    }

    const onChange = (e) => {
        setOpen(false)
        rest.onChange(e)
    }

    return (
        <>
            <div className={styles.calendarInputWrapper} ref={ref}>
                <InputField
                    {...rest}
                    dataTest={dataTest}
                    type="text"
                    onFocus={onFocus}
                    onChange={onChange}
                    value={date}
                />
                {clearable && (
                    <div className={styles.calendarClearButton}>
                        <Button
                            dataTest="calendar-clear-button"
                            secondary
                            small
                            onClick={() => calendarProps.onDateSelect(null)}
                            type="button"
                        >
                            {i18n.t('Clear')}
                        </Button>
                    </div>
                )}
            </div>
            {open && (
                <Layer
                    onBackdropClick={() => {
                        setOpen(false)
                    }}
                >
                    <Popper
                        reference={ref}
                        placement="bottom-start"
                        modifiers={[offsetModifier]}
                    >
                        <Card>
                            <Calendar {...calendarProps} date={date} />
                        </Card>
                    </Popper>
                </Layer>
            )}
        </>
    )
}

CalendarInput.propTypes = {
    calendar: PropTypes.object,
    cellSize: PropTypes.number,
    clearable: PropTypes.bool,
    dataTest: PropTypes.string,
    date: PropTypes.string,
    dir: PropTypes.string,
    locale: PropTypes.string,
    numberingSystem: PropTypes.string,
    timeZone: PropTypes.string,
    weekDayFormat: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onDateSelect: PropTypes.func,
}
