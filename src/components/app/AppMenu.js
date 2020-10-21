import React from 'react';
import AddLayer from '../layers/layers/AddLayer';
import FileMenu from './FileMenu';
import DownloadButton from '../download/DownloadButton';
import InterpretationsToggle from '../interpretations/InterpretationsToggle';
import styles from './styles/AppMenu.module.css';

export const AppMenu = () => (
    <div className={styles.appMenu}>
        <AddLayer />
        <FileMenu />
        <DownloadButton />
        <InterpretationsToggle />
    </div>
);

export default AppMenu;
