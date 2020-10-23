import React from 'react';
import AddLayerButton from '../layers/layers/AddLayerButton';
import FileMenu from './FileMenu';
import DownloadButton from '../download/DownloadButton';
import InterpretationsToggle from '../interpretations/InterpretationsToggle';
import styles from './styles/AppMenu.module.css';

export const AppMenu = () => (
    <div className={styles.appMenu}>
        <AddLayerButton />
        <FileMenu />
        <DownloadButton />
        <InterpretationsToggle />
    </div>
);

export default AppMenu;
