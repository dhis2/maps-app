/* global Cypress */

import { DEFAULT_MODE } from './constants';
import { parseMode, getEnvHosts } from './utils';

export const getConfig = ({ mode, hosts, ...opts } = {}) => {
    return {
        mode:
            parseMode(Cypress.env('NETWORK_SHIM_MODE')) ||
            parseMode(mode) ||
            DEFAULT_MODE,
        hosts: getEnvHosts(hosts),
        ...opts,
    };
};
