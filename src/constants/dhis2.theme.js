import { createMuiTheme } from '@material-ui/core/styles';

// Color palette from https://projects.invisionapp.com/share/A7LT4TJYETS#/screens/302550228_Color
export const colors = {
    accentPrimary: '#1976d2',
    accentPrimaryDark: '#004BA0',
    accentPrimaryLight: '#63A4FF',
    accentPrimaryLightest: '#EAF4FF',

    accentSecondary: '#00796B',
    accentSecondaryDark: '#004C40',
    accentSecondaryLight: '#48A999',
    accentSecondaryLightest: '#B2DFDB',

    black: '#000000',
    greyBlack: '#494949',
    grey: '#9E9E9E',
    greyLight: '#E0E0E0',
    blueGrey: '#ECEFF1',
    snow: '#F4F6F8',
    white: '#FFFFFF', // Not included in palette!

    negative: '#E53935',
    warning: '#F19C02',
    positive: '#3D9305',
    info: '#EAF4FF',
};
export const palette = {
    common: {
        white: colors.white,
        black: colors.black,
    },
    action: {
        active: colors.greyBlack,
        disabled: colors.greyLight,
    },
    text: {
        primary: colors.black,
        secondary: colors.greyBlack,
        disabled: colors.grey,
        hint: colors.grey,
    },
    primary: {
        main: colors.accentPrimary,
        dark: colors.accentPrimaryDark,
        light: colors.accentPrimaryLight,
        lightest: colors.accentPrimaryLightest, // Custom extension, not used by default
        // contrastText: 'white',
    },
    secondary: {
        main: colors.accentSecondary,
        dark: colors.accentSecondaryDark,
        light: colors.accentSecondaryLight,
        lightest: colors.accentSecondaryLightest, // Custom extension, not used by default
        // contrastText: 'white',
    },
    error: {
        main: colors.negative, // This is automatically expanded to main/light/dark/contrastText, what do we use here?
    },
    status: {
        //Custom colors collection, not used by default in MUI
        negative: colors.negative,
        warning: colors.warning,
        positive: colors.positive,
        info: colors.info,
    },
    background: {
        paper: colors.white,
        default: colors.snow,
        grey: '#FCFCFC',
        hover: colors.greyLight,
    },
    divider: colors.greyLight,
    shadow: colors.grey,
};

const spacingUnit = 8; // 8px unit spacing

export const muiTheme = createMuiTheme({
    colors,
    palette,
    typography: {
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
        useNextVariants: true,
    },
    spacing: {
        unit: spacingUnit,
    },
    overrides: {
        MuiDivider: {
            light: {
                backgroundColor: palette.divider, // No light dividers for now
            },
        },
        MuiDialogTitle: {
            root: {
                padding: '20px 24px 4px 24px',
                fontSize: 16,
                fontWeight: 'bold',
            },
        },
        MuiDialogContent: {
            root: {
                margin: spacingUnit * 3,
                padding: 0,
                '&:first-child': {
                    paddingTop: 0,
                },
            },
        },
        MuiDialogActions: {
            root: {
                padding: `${spacingUnit * 1.5}px ${spacingUnit * 3}px`,
                margin: 0,
                '&> *:last-child': {
                    marginRight: 0,
                },
                borderTop: `1px solid ${palette.divider}`,
            },
        },
        MuiSelect: {
            select: {
                '&:focus': {
                    background: 'transparent',
                },
            },
        },
    },
});
