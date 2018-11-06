export default {
    paddingBottom: 16,
    margin: 0,
    '& table': {
        borderCollapse: 'collapse',
        borderSpacing: 0,
        '& tr': {
            height: 24,
        },
        '& th': {
            minWidth: 24,
            height: 24,
            padding: 0,
            verticalAlign: 'middle',
            '& span': {
                display: 'block',
                width: '100%',
                height: '100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
            },
        },
        '& td': {
            paddingLeft: 8,
            whiteSpace: 'nowrap',
        },
    },
};
