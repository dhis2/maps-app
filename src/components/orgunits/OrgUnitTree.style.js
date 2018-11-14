// TODO: The d2-ui component should use classes, not styles!
// Copied from https://github.com/dhis2/d2-ui/blob/master/packages/org-unit-dialog/src/styles/OrgUnitDialog.style.js
// Currently we don't use the org-unit-dialog component in the maps app, but we try to keep the same look
export default {
    selectedLabelStyle: {
        fontWeight: 400,
        fontSize: 14,
        color: 'inherit',
        position: 'relative',
        bottom: 2,
    },
    labelStyle: {
        fontSize: 14,
        fontWeight: 400,
        position: 'relative',
        bottom: 2,

        checkbox: {
            position: 'relative',
            bottom: 3,
        },
        folderIcon: {
            fontSize: 18,
            position: 'relative',
            top: 3,
            margin: '0 4px 0 2px',
            color: '#6eadff',
        },
        stopIcon: {
            color: '#a8a7a8',
            fontSize: 12,
            margin: '2px 3px 2px 2px',
            position: 'relative',
            top: 2,
        },
    },
    treeStyle: {
        marginLeft: 5,
        arrow: {
            color: '#a7a7a7',
            fontSize: 15,
        },
    },
};
