import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import { JSDOM } from 'jsdom';

configure({ adapter: new Adapter() });

// const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
// const { window } = jsdom;

// function copyProps(src, target) {
//     const props = Object.getOwnPropertyNames(src)
//         .filter(prop => typeof target[prop] === 'undefined')
//         .reduce((result, prop) => ({
//             ...result,
//             [prop]: Object.getOwnPropertyDescriptor(src, prop),
//         }), {});
//     Object.defineProperties(target, props);
// }

global.window = {};
// // global.document = window.document;
global.navigator = global.window.navigator = {
    userAgent: 'node.js',
};
// copyProps(window, global);