import { createHashHistory } from 'history'
import queryString from 'query-string'

const history = createHashHistory()
export default history

const getHashUrlParams = (loc) => {
    const params = queryString.parse(loc.search || '', {
        parseBooleans: true,
    })

    const pathParts = loc.pathname.slice(1).split('/')
    if (pathParts[0]) {
        if (pathParts[0] === 'currentAnalyticalObject') {
            params.isCurrentAO = true
        } else {
            params.mapId = pathParts[0]
        }

        if (pathParts[1] === 'download') {
            params.isDownload = true
        }
    }

    return params
}

const openDownloadMode = () => {
    history.push(`${history.location.pathname}/download`)
}

const closeDownloadMode = () => {
    const rootPath = history.location.pathname.split('/download')[0]
    history.push(rootPath)
}

export { getHashUrlParams, openDownloadMode, closeDownloadMode }
