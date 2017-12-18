import { blue500, blue700, blue100, orange500, grey100, darkBlack, white, grey500, grey400 } from 'material-ui/styles/colors';
import { fade } from 'material-ui/utils/colorManipulator';
import Spacing from 'material-ui/styles/spacing';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

// Copied from https://github.com/dhis2/maintenance-app/blob/master/src/App/app.theme.js - TODO: Add to d2-ui?
const theme = {
    spacing: Spacing,
    fontFamily: 'Roboto, sans-serif',
    palette: {
        primary1Color: blue500,
        primary2Color: blue700,
        primary3Color: blue100,
        accent1Color: orange500,
        accent2Color: grey100,
        accent3Color: grey500,
        textColor: darkBlack,
        alternateTextColor: white,
        canvasColor: white,
        borderColor: grey400,
        disabledColor: fade(darkBlack, 0.3),
    },
};

const muiTheme = getMuiTheme(theme, {
    tabs: {
        backgroundColor: 'rgb(39, 102, 150)',
    },
});

export default muiTheme;
