// Copyright (c) 2018 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 *
 * This file is copied from kepler.gl on 31 Oct 2018:
 * https://github.com/uber/kepler.gl/blob/master/src/utils/export-image-utils.js
 * NPM global dependency and unused calculateExportImageSize function has been removed
 */

import domtoimage from './dom-to-image';

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

export const convertToPng = (sourceElem, options) =>
    domtoimage.toPng(sourceElem, options);

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

export const downloadFile = (fileBlob, filename) => {
    const url = URL.createObjectURL(fileBlob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
