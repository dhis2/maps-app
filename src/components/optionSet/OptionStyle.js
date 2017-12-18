import React, { Component } from 'react';
import ColorPicker from '../d2-ui/ColorPicker';

const styles = {
    color: {
        width: 32,
        height: 32,
        marginRight: 8,
    },
    label: {
        display: 'inline-block',
        height: 24,
        lineHeight: '32px',
        verticalAlign: 'top',
    }
};

const OptionStyle = ({ id, name, color, onChange }) => (
    <div>
        <ColorPicker color={color} onChange={newColor => onChange(id, newColor)} style={styles.color} />
        <span style={styles.label}>{name}</span>
    </div>
);

export default OptionStyle;
