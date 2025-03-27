export const setHeaderbarVisible = (show) => {
    // Header provided by the global shell
    const globalShellHeader = window.top.document.querySelector(
        '.global-shell-header'
    )
    // Header in the current iframe
    const iframeHeader = document.querySelector('header')
    const header = globalShellHeader ? globalShellHeader : iframeHeader

    const setHeaderStyle = (ref, value) => {
        ref.style.display = value
    }

    if (show) {
        setHeaderStyle(header, 'block')
    } else {
        setHeaderStyle(header, 'none')
    }
}
