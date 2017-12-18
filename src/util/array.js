import isArray from 'd2-utilizr/lib/isArray';
import isObject from 'd2-utilizr/lib/isObject';
import isString from 'd2-utilizr/lib/isString';
import isNumber from 'd2-utilizr/lib/isNumber';

// supports [number], [string], [{key: number}], [{key: string}], [[string]], [[number]]
export function arraySort(array, direction, key, emptyFirst) {

    if (!isArray(array) && !array.length) {
        return [];
    }

    key = !!key || isNumber(key) ? key : 'name';

    array.sort((a, b) => {

        // if object, get the property values
        if (isObject(a) && isObject(b)) {
            a = a[key];
            b = b[key];
        }

        // if array, get from the right index
        if (isArray(a) && isArray(b)) {
            a = a[key];
            b = b[key];
        }

        // string
        if (isString(a) && isString(b)) {
            a = a.toLowerCase();
            b = b.toLowerCase();

            if (direction === 'DESC') {
                return a < b ? 1 : (a > b ? -1 : 0);
            }
            else {
                return a < b ? -1 : (a > b ? 1 : 0);
            }
        }
        // number
        else if (isNumber(a) && isNumber(b)) {
            return direction === 'DESC' ? b - a : a - b;
        }

        else if (a === undefined || a === null) {
            return emptyFirst ? -1 : 1;
        }

        else if (b === undefined || b === null) {
            return emptyFirst ? 1 : -1;
        }

        return -1;
    });

    return array;
}