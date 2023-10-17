import queryString from 'query-string'
import history from './history.js'

const removeInterpretationQueryParams = () => {
    const parsed = queryString.parse(history.location.search, {
        parseBooleans: true,
    })
    // Keep all other query params in tact
    const parsedWithoutInterpretationId = Object.entries(parsed).reduce(
        (acc, [key, value]) => {
            if (
                key !== 'interpretationId' &&
                key !== 'interpretationid' &&
                key !== 'initialFocus'
            ) {
                acc[key] = value
            }
            return acc
        },
        {}
    )
    const search = queryString.stringify(parsedWithoutInterpretationId)

    history.push(
        {
            ...history.location,
            search,
        },
        {
            isModalClosing: true,
        }
    )
}

export { removeInterpretationQueryParams }
