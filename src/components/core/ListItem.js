import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/ListItem.module.css'

// Left aligned label (no wrap) and right align value of variable width
const ListItem = ({ label, formatter, children }) =>
    children !== null && children !== undefined && children !== '' ? (
        <table className={styles.listItem}>
            <tbody>
                <tr>
                    <th>{label}</th>
                    <td>{formatter ? formatter(children) : children}</td>
                </tr>
            </tbody>
        </table>
    ) : null

ListItem.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
    formatter: PropTypes.func,
}

export default ListItem
