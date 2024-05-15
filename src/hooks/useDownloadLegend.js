import { useSelector } from 'react-redux'

export function useDownloadLegend() {
    const downloadModeLegendOpen = useSelector(
        (state) => state.ui.downloadModeLegend
    )

    return { downloadModeLegendOpen }
}
