import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import IconButton from 'material-ui/IconButton';
import { SvgIcon } from '@dhis2/d2-ui-core';
import HomeIcon from 'material-ui/svg-icons/action/home';
import { LAYERS_PANEL_WIDTH } from '../../constants/layout';

const styles = {
    header: {
        position: 'relative',
        boxSizing: 'border-box',
        height: 48,
        borderBottom: '1px solid #ddd',
    },
    logo: {
        boxSizing: 'border-box',
        position: 'absolute',
        width: LAYERS_PANEL_WIDTH + 1,
        height: '100%',
        padding: '4px 20px',
    },
    svg: {
        width: 74,
    },
    title: {
        position: 'absolute',
        left: LAYERS_PANEL_WIDTH + 1,
        right: 0,
        height: '100%',
        fontFamily: 'Roboto, sans-serif',
        lineHeight: '48px',
        marginTop: 2,
        marginLeft: 16,
    },
    noFavorite: {
        color: '#aaa',
        fontStyle: 'italic',
    },
    star: {
        verticalAlign: 'middle',
        marginTop: -5,
        marginRight: 8,
        fill: '#bbb',
    },
    homeBtn: {
        position: 'absolute',
        right: 0,
    },
    homeIcon: {
        fill: '#777',
    },
};

export const AppHeader = ({ name }) => (
    <div style={styles.header}>
        <div style={styles.logo}>
            <svg
                style={styles.svg}
                viewBox="0 0 400 233.33"
                xmlns="http://www.w3.org/2000/svg"
                display="block"
            >
                <g fillRule="evenodd">
                    <path
                        d="M61.709 67.458c.063 17.337.047 16.968 1.017 23.417.276 1.833-.062 2.02-1.127.625-6.259-8.209-19.501-12.133-32.611-9.666-17.62 3.316-27.441 20.003-25.814 43.861C4.7 148.07 16.634 160.558 36.5 160.568c10.941.006 19.555-3.722 24.899-10.776.971-1.282.784-1.649 3.328 6.541l.905 2.917 7.101.043 7.1.044V51.333H61.65l.059 16.125M106 105.333v54h18.153l.056-22.041c.063-24.6.019-23.626 1.286-28.51 2.345-9.045 7.93-13.383 18.168-14.115 9.292-.664 15.048 2.384 17.344 9.185 1.12 3.319 1.052 1.488 1.114 29.856l.056 25.625h18.156v-26.125c-.001-16.914-.063-26.8-.176-28.041-1.245-13.637-8.659-21.381-22.519-23.521-14.009-2.164-27.238 1.954-32.853 10.225-.437.643-.627.788-1.038.791l-.502.005.288-2.875c.51-5.081.631-9.744.633-24.25l.001-14.209H106v54m106.756-52.159c-5.24.825-7.909 3.861-7.92 9.008-.012 5.962 3.896 9.194 10.816 8.944 6.153-.223 9.417-3.364 9.396-9.043-.024-6.379-5.08-10.045-12.292-8.909M272 81.27c-18.419 1.587-28.234 9.783-27.02 22.565.965 10.166 6.582 15.116 24.52 21.608 17.105 6.191 21.293 9.634 19.342 15.903-2.618 8.412-22.26 8.962-41.804 1.17-.941-.376-1.785-.683-1.875-.683-.104 0-.163 2.569-.163 7.081v7.082l.625.269c12.045 5.19 34.308 5.897 46.165 1.467 10.373-3.875 15.693-11.417 15.154-21.482-.577-10.787-5.85-15.511-25.111-22.502-14.97-5.434-18.232-7.437-19.016-11.676-1.618-8.751 13.789-10.841 32.85-4.455 2.062.69 3.846 1.266 3.963 1.278.181.018 6.128-12.202 5.996-12.321-.024-.021-1.055-.416-2.293-.878-5.44-2.031-10.812-3.322-17.166-4.125-1.983-.251-12.225-.469-14.167-.301m-66.167 39.48v38.417H224V82.333h-18.167v38.417M45.968 94.939c12.003 1.708 16.858 10.072 16.481 28.394-.333 16.204-5.504 22.834-18.612 23.866-14.23 1.121-21.727-7.193-22.121-24.532-.46-20.223 8.114-30.025 24.252-27.728"
                        fill="#194f90"
                    />
                    <path
                        d="M355.25 56.447c-11.836.604-24.275 5.368-32.993 12.636l-.6.5 4.35 4.834c2.393 2.658 4.6 5.087 4.905 5.397l.554.563 2.642-1.753c8.936-5.932 14.971-8.012 23.309-8.032 13.145-.032 19.638 7.968 16.502 20.331-2.215 8.732-6.372 13.368-37.544 41.872l-15.208 13.906v12.466h75.666v-14.5h-26.512c-22.702 0-26.504-.034-26.458-.235.044-.193 14.177-12.744 20.637-18.327 19.554-16.899 26.547-26.394 28.101-38.156 2.618-19.815-12.727-32.757-37.351-31.502"
                        fill="#4dc6ff"
                    />
                </g>
            </svg>
        </div>
        <div style={{ ...styles.title, ...(!name ? styles.noFavorite : {}) }}>
            {name ? (
                <span>
                    <SvgIcon icon="Star" style={styles.star} />
                    {name}
                </span>
            ) : (
                i18next.t('No favorite selected')
            )}
            <IconButton
                onClick={() =>
                    (window.location.href = `../dhis-web-commons-about/redirect.action`)
                }
                style={styles.homeBtn}
                iconStyle={styles.homeIcon}
            >
                <HomeIcon />
            </IconButton>
        </div>
    </div>
);

AppHeader.propTypes = {
    name: PropTypes.string,
};

AppHeader.defaultProps = {
    name: '',
};

export default connect(state => ({
    name: state.map ? state.map.name : null,
}))(AppHeader);
