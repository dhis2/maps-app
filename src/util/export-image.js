import FileSaver from 'file-saver'
import { toBlob } from 'html-to-image'

export const downloadMapImage = (sourceEl, filename) =>
    toBlob(sourceEl).then((blob) => FileSaver.saveAs(blob, filename))

const toStringFn = {}.toString

// https://github.com/bubkoo/html-to-image#browsers
// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/svg/foreignobject.js
// TODO: Safari is not supported, as it uses a stricter security model on <foreignObject> tag
export const downloadSupport = () => {
    return (
        !!document.createElementNS &&
        /SVGForeignObject/.test(
            toStringFn.call(
                document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'foreignObject'
                )
            )
        )
    )
}
