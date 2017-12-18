import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isNumeric from 'd2-utilizr/lib/isNumeric';
import isString from 'd2-utilizr/lib/isString';
import { closeOrgUnit } from '../../actions/orgUnits';

// TODO: Reactify!
let infrastructuralWindow;
const infrastructuralDataElementValuesStore = Ext.create('Ext.data.Store', {
    fields: ['name', 'value'],
    sorters: [{
        property: 'name',
        direction: 'ASC'
    }]
});

// Infrastructural data
const showInfo = function(att) {

    // Destroy window if created previously
    if (infrastructuralWindow) {
        infrastructuralWindow.destroy();
        infrastructuralDataElementValuesStore.removeAll();
    }

    const orgUnitInfo = Ext.create('Ext.panel.Panel', {
        cls: 'gis-container-inner',
        width: 150,
        bodyStyle: 'padding-right:5px;',
        items: [
            {
                html: GIS.i18n.name,
                cls: 'gis-panel-html-title'
            },
            {
                html: att.name || '',
                cls: 'gis-panel-html'
            },
            {
                cls: 'gis-panel-html-separator'
            }
        ]
    });

    const onPeriodChange = function(cmp) {
        const period = cmp.getValue();
        const url = gis.init.analyticsPath + 'analytics.json?';
        const iig = gis.init.systemSettings.infrastructuralIndicatorGroup || {};
        const ideg = gis.init.systemSettings.infrastructuralDataElementGroup || {};
        const indicators = iig.indicators || [];
        const dataElements = ideg.dataElements || [];
        const data = [].concat(indicators, dataElements);

        // data
        let paramString = 'dimension=dx:';
        data.forEach((d, i) => paramString += d.id + (i < data.length - 1 ? ';' : ''));

        // period
        paramString += '&filter=pe:' + period;

        // orgunit
        paramString += '&dimension=ou:' + att.id;

        Ext.Ajax.request({
            url: encodeURI(url + paramString),
            success(r) {
                const records = [];
                let dxIndex;
                let valueIndex;

                r = JSON.parse(r.responseText);

                if (!r.rows && r.rows.length) {
                    return;
                }
                else {
                    // index
                    r.headers.forEach((header, i) => {
                        if (header.name === 'dx') {
                            dxIndex = i;
                        }
                        if (header.name === 'value') {
                            valueIndex = i;
                        }
                    });

                    // records
                    r.rows.forEach(row => {
                        const value = row[valueIndex];
                        records.push({
                            name: r.metaData.names[row[dxIndex]],
                            value: isNumeric(value) ? parseFloat(value) : value
                        });

                    });

                    infrastructuralDataElementValuesStore.loadData(records);
                }
            }
        });
    };

    const orgUnitDataCombo = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: GIS.i18n.period,
        editable: false,
        valueField: 'id',
        displayField: 'name',
        emptyText: 'Select period',
        forceSelection: true,
        width: 340,
        labelWidth: 70,
        store: {
            fields: ['id', 'name'],
            data: function() {
                const periodType = gis.init.systemSettings.infrastructuralPeriodType.id;
                const generator = gis.init.periodGenerator;
                let periods = generator.filterFuturePeriodsExceptCurrent(generator.generateReversedPeriods(periodType, undefined)) || [];

                if (Array.isArray(periods) && periods.length) {
                    periods.forEach(period => period.id = period.iso);
                    periods = periods.slice(0,5);
                }

                return periods;
            }()
        },
        lockPosition: false,
        listeners: {
            change: onPeriodChange,
            render() {
                this.select(this.getStore().getAt(0));
            }
        }
    });

    const orgUnitDataGrid = Ext.create('Ext.grid.Panel',                     {
        xtype: 'grid',
        cls: 'gis-grid plain',
        height: 163,
        width: 340,
        scroll: 'vertical',
        columns: [
            {
                id: 'name',
                text: GIS.i18n.dataelement,
                dataIndex: 'name',
                sortable: true,
                width: 190
            },
            {
                id: 'value',
                header: GIS.i18n.value,
                dataIndex: 'value',
                sortable: true,
                width: 150
            }
        ],
        disableSelection: true,
        store: infrastructuralDataElementValuesStore
    });

    // Ext.form.Panel
    const orgUnitForm = Ext.create('Ext.panel.Panel', {
        cls: 'gis-container-inner gis-form-widget',
        bodyStyle: 'padding-left:4px;',
        width: 350,
        items: [
            {
                html: GIS.i18n.infrastructural_data,
                cls: 'gis-panel-html-title'
            },
            {
                cls: 'gis-panel-html-separator'
            },
            orgUnitDataCombo,
            orgUnitDataGrid
        ]
    });

    infrastructuralWindow = Ext.create('Ext.window.Window', {
        title: GIS.i18n.information,
        layout: 'column',
        iconCls: 'gis-window-title-icon-information',
        cls: 'gis-container-default',
        height: 250,
        period: null,
        modal: true,
        items: [orgUnitInfo, orgUnitForm],
        listeners: {
            close: att.closeOrgUnit
        }
    });

    infrastructuralWindow.show();
    // gis.util.gui.window.setPositionTopRight(infrastructuralWindow);

    // Load info about organisation unit
    Ext.Ajax.request({
        url: encodeURI(gis.init.apiPath + 'organisationUnits/' + att.id + '.json?fields=id,' + gis.init.namePropertyUrl + ',code,address,email,phoneNumber,coordinates,parent[id,' + gis.init.namePropertyUrl + '],organisationUnitGroups[id,' + gis.init.namePropertyUrl + ']'),
        success(r) {
            const ou = JSON.parse(r.responseText);

            if (ou.parent) {
                orgUnitInfo.add(
                    {
                        html: GIS.i18n.parent_unit,
                        cls: 'gis-panel-html-title'
                    },
                    {
                        html: ou.parent.name,
                        cls: 'gis-panel-html'
                    },
                    {
                        cls: 'gis-panel-html-separator'
                    }
                );
            }

            if (ou.code) {
                orgUnitInfo.add(
                    {
                        html: GIS.i18n.code,
                        cls: 'gis-panel-html-title'
                    },
                    {
                        html: ou.code,
                        cls: 'gis-panel-html'
                    },
                    {
                        cls: 'gis-panel-html-separator'
                    }
                );
            }

            if (ou.address) {
                orgUnitInfo.add(
                    {
                        html: GIS.i18n.address,
                        cls: 'gis-panel-html-title'
                    },
                    {
                        html: ou.address,
                        cls: 'gis-panel-html'
                    },
                    {
                        cls: 'gis-panel-html-separator'
                    }
                );
            }

            if (ou.email) {
                orgUnitInfo.add(
                    {
                        html: GIS.i18n.email,
                        cls: 'gis-panel-html-title'
                    },
                    {
                        html: ou.email,
                        cls: 'gis-panel-html'
                    },
                    {
                        cls: 'gis-panel-html-separator'
                    }
                );
            }

            if (ou.phoneNumber) {
                orgUnitInfo.add(
                    {
                        html: GIS.i18n.phone_number,
                        cls: 'gis-panel-html-title'
                    },
                    {
                        html: ou.phoneNumber,
                        cls: 'gis-panel-html'
                    },
                    {
                        cls: 'gis-panel-html-separator'
                    }
                );
            }

            if (isString(ou.coordinates)) { // TODO: We don't need to download coordinates
                var co = JSON.parse(ou.coordinates);

                if (typeof co[0] === 'number') {
                    orgUnitInfo.add(
                        {
                            html: GIS.i18n.coordinates,
                            cls: 'gis-panel-html-title'
                        },
                        {
                            html: co.join(', '),
                            cls: 'gis-panel-html'
                        },
                        {
                            cls: 'gis-panel-html-separator'
                        }
                    );
                }
            }

            if (Array.isArray(ou.organisationUnitGroups) && ou.organisationUnitGroups.length) {
                let html = '';

                ou.organisationUnitGroups.forEach((group, index) => {
                    html += group.name;
                    html += index < ou.organisationUnitGroups.length - 1 ? '<br/>' : '';
                });

                orgUnitInfo.add(
                    {
                        html: GIS.i18n.groups,
                        cls: 'gis-panel-html-title'
                    },
                    {
                        html: html,
                        cls: 'gis-panel-html'
                    },
                    {
                        cls: 'gis-panel-html-separator'
                    }
                );
            }
        }
    });
};

class OrgUnitDialog extends Component {

    componentDidUpdate(prevProps) {
        showInfo(this.props);
    }

    // TODO: Add react component here later
    render() {
        return null;
    }

}

export default connect(
    state => ({
        ...state.orgUnit
    }),
    { closeOrgUnit, }
)(OrgUnitDialog);

