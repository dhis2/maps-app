import FileSaver from 'file-saver';
import domtoimage from 'dom-to-image';

export const dataURItoBlob = dataURI => {
    const binary = atob(dataURI.split(',')[1]);

    // separate out the mime component
    const mimeString = dataURI
        .split(',')[0]
        .split(':')[1]
        .split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(binary.length);

    // create a view into the buffer
    const ia = new Uint8Array(ab);

    for (let i = 0; i < binary.length; i++) {
        ia[i] = binary.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
};

export const convertToPng = (sourceElem, options) =>
    domtoimage.toPng(sourceElem, options);

export const downloadFile = (fileBlob, filename) =>
    FileSaver.saveAs(fileBlob, filename);

const toStringFn = {}.toString;

// https://github.com/tsayen/dom-to-image#browsers
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
    );
};
