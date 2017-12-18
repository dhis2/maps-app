import GIS from './core/index.js';
import isBoolean from 'd2-utilizr/lib/isBoolean';
import isObject from 'd2-utilizr/lib/isObject';
import isString from 'd2-utilizr/lib/isString';
import arrayClean from 'd2-utilizr/lib/arrayClean';
import arrayPluck from 'd2-utilizr/lib/arrayPluck';
import '../scss/plugin.scss';

window.GIS = GIS;

Ext.onReady(function() {
    const init = {
        user: {},
        systemInfo: {}
    };
    const configs = [];
    let isInitStarted = false;
    let isInitComplete = false;
    let gis;
    let execute;
    let onUserAccountLoad;
    let onScriptReady;

    GIS.i18n = {
        boundary_layer: 'Boundary layer',
        coordinates_could_not_be_loaded: 'Coordinates could not be loaded',
        drill_down_one_level: 'Drill down one level',
        drill_up_one_level: 'Drill up one level',
        event_time: 'Event time',
        event_layer: 'Event layer',
        facility_layer: 'Facility layer',
        invalid_coordinates: 'Invalid coordinates',
        latitude: 'Latitude',
        level: 'Level',
        longitude: 'Longitude',
        measure_distance: 'Measure distance',
        no_valid_coordinates_found: 'No valid coordinates found',
        organisation_unit: 'Organisation unit',
        parent_unit: 'Parent unit',
        show: 'Show',
        show_lon_lat: 'Show longitude/latitude',
        thematic_layer: 'Thematic layer'
    };

    GIS.plugin = {};

    const getInit = function(config) {
        const requests = [];
        let callbacks = 0;

        init.contextPath = config.url;
        init.apiPath = init.contextPath + '/api/' + GIS.apiVersion + '/';
        init.analyticsPath = init.contextPath + '/api/25/'; // TODO: Only use apiPath

        init.defaultHeaders = {};

        if (config.username && config.password) {
            Ext.Ajax.defaultHeaders = {
                'Authorization': 'Basic ' + btoa(config.username + ':' + config.password)
            };

            init.defaultHeaders['Authorization'] = 'Basic ' + btoa(config.username + ':' + config.password);
        }

        const fn = function() {
            if (++callbacks === requests.length) {
                isInitComplete = true;
                configs.forEach(config => execute(config));
            }
        };

        const onSystemInfoLoad = function(r) {
            const systemInfo = r.responseText ? JSON.parse(r.responseText) : r;
            init.systemInfo.databaseInfo = systemInfo.databaseInfo;
            fn();
        };

        const onSystemSettingsLoad = function(r) {
            const systemSettings = r.responseText ? JSON.parse(r.responseText) : r;

            init.systemInfo.dateFormat = isString(systemSettings.keyDateFormat) ? systemSettings.keyDateFormat.toLowerCase() : 'yyyy-mm-dd';
            init.systemInfo.calendar = systemSettings.keyCalendar;
            init.systemInfo.googleMapsKey = systemSettings.keyGoogleMapsApiKey;

            // user-account
            const userAccountConfig = {
                url: init.contextPath + '/api/me/user-account.json',
                disableCaching: false,
                success: onUserAccountLoad
            };

            Ext.Ajax.request(userAccountConfig);
        };

        const onOrgUnitsLoad = function(r) {
            const organisationUnits = (r.responseText ? JSON.parse(r.responseText).organisationUnits : r) || [];
            const ou = [];
            let ouc = [];

            if (organisationUnits.length) {
                organisationUnits.forEach(org => {
                    ou.push(org.id);

                    if (org.children) {
                        ouc = arrayClean(ouc.concat(arrayPluck(org.children, 'id') || []));
                    }
                });

                init.user = init.user || {};
                init.user.ou = ou;
                init.user.ouc = ouc;
            } else {
                gis.alert('User is not assigned to any organisation units');
            }

            fn();
        };

        const onDimensionsLoad = function(r) {
            init.dimensions = r.responseText ? JSON.parse(r.responseText).dimensions : r.dimensions;
            fn();
        };

        onUserAccountLoad = function(r) {
            init.userAccount = r.responseText ? JSON.parse(r.responseText) : r;

            // init
            if (window['dhis2'] && window['jQuery']) {
                onScriptReady();
            } else {
                Ext.Loader.injectScriptElement(init.contextPath + '/dhis-web-commons/javascripts/jQuery/jquery.min.js', () => {
                    Ext.Loader.injectScriptElement(init.contextPath + '/dhis-web-commons/javascripts/dhis2/dhis2.util.js', () => {
                        Ext.Loader.injectScriptElement(init.contextPath + '/dhis-web-commons/javascripts/dhis2/dhis2.storage.js', () => {
                            Ext.Loader.injectScriptElement(init.contextPath + '/dhis-web-commons/javascripts/dhis2/dhis2.storage.idb.js', () => {
                                Ext.Loader.injectScriptElement(init.contextPath + '/dhis-web-commons/javascripts/dhis2/dhis2.storage.ss.js', () => {
                                    Ext.Loader.injectScriptElement(init.contextPath + '/dhis-web-commons/javascripts/dhis2/dhis2.storage.memory.js', () => {
                                        onScriptReady();
                                    });
                                });
                            });
                        });
                    });
                });
            }
        };

        const onOptionSetsLoad = function(r) {
            const optionSets = (r.responseText ? JSON.parse(r.responseText).optionSets : r.optionSets) || [];
            const store = dhis2.gis.store;
            const ids = [];
            let url = '';
            let callbacks = 0;

            if (!optionSets.length) {
                fn();
                return;
            }

            const optionSetConfig = {
                url: encodeURI(init.apiPath + 'optionSets.json?fields=id,name,version,options[code,name]&paging=false' + url),
                disableCaching: false,
                success(r) {
                    const sets = r.responseText ? JSON.parse(r.responseText).optionSets : r.optionSets;
                    store.setAll('optionSets', sets).done(fn);
                }
            };

            const updateStore = function() {
                if (++callbacks === optionSets.length) {
                    if (!ids.length) {
                        fn();
                        return;
                    }

                    url += '&filter=id:in:[' + ids.join(',') + ']';

                    Ext.Ajax.request(optionSetConfig);
                }
            };

            const registerOptionSet = function(optionSet) {
                store.get('optionSets', optionSet.id).done(obj => {
                    if (!isObject(obj) || obj.version !== optionSet.version) {
                        ids.push(optionSet.id);
                    }

                    updateStore();
                });
            };

            store.open().done(() => {
                optionSets.forEach(optionSet => registerOptionSet(optionSet));
            });
        };

        onScriptReady = function() {
            const defaultKeyUiLocale = 'en';
            const defaultKeyAnalysisDisplayProperty = 'displayName';
            const displayPropertyMap = {
                'name': 'displayName',
                'displayName': 'displayName',
                'shortName': 'displayShortName',
                'displayShortName': 'displayShortName'
            };

            init.userAccount.settings.keyUiLocale = init.userAccount.settings.keyUiLocale || defaultKeyUiLocale;
            init.userAccount.settings.keyAnalysisDisplayProperty = displayPropertyMap[init.userAccount.settings.keyAnalysisDisplayProperty] || defaultKeyAnalysisDisplayProperty;

            // local vars
            const contextPath = init.contextPath;
            const keyAnalysisDisplayProperty = init.userAccount.settings.keyAnalysisDisplayProperty;
            const namePropertyUrl = keyAnalysisDisplayProperty + '~rename(name)';

            init.namePropertyUrl = namePropertyUrl;

            // dhis2
            dhis2.util.namespace('dhis2.gis');

            dhis2.gis.store = dhis2.gis.store || new dhis2.storage.Store({
                name: 'dhis2',
                adapters: [dhis2.storage.IndexedDBAdapter, dhis2.storage.DomSessionStorageAdapter, dhis2.storage.InMemoryAdapter],
                objectStores: ['optionSets']
            });

            // user orgunit
            Ext.Ajax.request({
                url: encodeURI(init.apiPath + 'organisationUnits.json?userOnly=true&fields=id,' + init.namePropertyUrl + ',children[id,' + init.namePropertyUrl + ']&paging=false'),
                disableCaching: false,
                success: onOrgUnitsLoad
            });

            // option sets
            Ext.Ajax.request({
                url: encodeURI(contextPath + '/api/optionSets.json?fields=id,version&paging=false'),
                disableCaching: false,
                success: onOptionSetsLoad
            });
        };

        // system info
        requests.push({
            url: encodeURI(init.apiPath + 'system/info.json'),
            disableCaching: false,
            success: onSystemInfoLoad
        });

        // dhis2
        requests.push({
            url: encodeURI(init.apiPath + 'systemSettings.json?key=keyCalendar&key=keyDateFormat&key=keyGoogleMapsApiKey'),
            disableCaching: false,
            success: onSystemSettingsLoad
        });

        // dimensions
        requests.push({
            url: encodeURI(init.apiPath + 'dimensions.json?fields=id,displayName~rename(name)&paging=false'),
            disableCaching: false,
            success: onDimensionsLoad
        });

        requests.forEach(request => Ext.Ajax.request(request));
    };

    execute = function(config) {
        const validateConfig = function() {
            if (!isString(config.url)) {
                gis.alert('Invalid url (' + config.el + ')');
                return false;
            }

            if (config.url.split('').pop() === '/') {
                config.url = config.url.substr(0, config.url.length - 1);
            }

            if (!isString(config.el)) {
                gis.alert('Invalid html element id (' + config.el + ')');
                return false;
            }

            config.id = config.id || config.uid;

            if (config.id && !isString(config.id)) {
                gis.alert('Invalid map id (' + config.el + ')');
                return false;
            }

            return true;
        };

        const extendInstance = function(gis, appConfig) {
            const init = gis.init;
            const store = gis.store;

            init.el = config.el;

            gis.plugin = appConfig.plugin;
            gis.dashboard = appConfig.dashboard;
            gis.crossDomain = appConfig.crossDomain;
            gis.skipMask = appConfig.skipMask;
            gis.skipFade = appConfig.skipFade;
            gis.el = appConfig.el;
            gis.username = appConfig.username;
            gis.password = appConfig.password;

            // store
            store.groupsByGroupSet = Ext.create('Ext.data.Store', {
                fields: ['id', 'name', 'symbol'],
            });
        };

        const initLayout = function(appConfig) {
            const container = document.getElementById(appConfig.el);
            const titleEl = document.createElement('div');
            const map = gis.instance;

            container.className = 'dhis2-map-widget-container';
            titleEl.className = 'dhis2-map-title';

            container.appendChild(titleEl);
            container.appendChild(map.getContainer());

            container.titleEl = titleEl;

            container.setViewportWidth = function() {
                map.invalidateSize();
            };

            // Needed to fix bug with client cluster on google maps layer
            map.options.maxZoom = 18;

            map.addControl({
                type: 'zoom',
                position: 'topright'
            });

            map.invalidateSize();
            // map.fitBounds([[-34.9, -18.7], [35.9, 50.2]]);

            // basemap
            gis.map.basemap = gis.map.basemap || 'osmLight';

            return container;
        };

        (function() {
            if (!validateConfig()) {
                return;
            }

            const appConfig = {
                plugin: true,
                dashboard: isBoolean(config.dashboard) ? config.dashboard : false,
                crossDomain: isBoolean(config.crossDomain) ? config.crossDomain : true,
                skipMask: isBoolean(config.skipMask) ? config.skipMask : false,
                skipFade: isBoolean(config.skipFade) ? config.skipFade : false,
                el: isString(config.el) ? config.el : null,
                username: isString(config.username) ? config.username : null,
                password: isString(config.password) ? config.password : null
            };

            // core
            gis = GIS.core.getInstance(init, appConfig);
            extendInstance(gis, appConfig);

            gis.map = config;
            gis.container = initLayout(appConfig);

            gis.instance.scrollWheelZoom.disable();

            GIS.core.MapLoader(gis, config).load();
        }());
    };

    GIS.plugin.getMap = function(config) {
        if (isString(config.url) && config.url.split('').pop() === '/') {
            config.url = config.url.substr(0, config.url.length - 1);
        }

        if (isInitComplete) {
            execute(config);
        } else {
            configs.push(config);

            if (!isInitStarted) {
                isInitStarted = true;

                getInit(config);
            }
        }
    };

    const DHIS = isObject(window['DHIS']) ? window.DHIS : {};

    DHIS.getMap = GIS.plugin.getMap;

    window.DHIS = DHIS;
});
