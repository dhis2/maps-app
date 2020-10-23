import React, { Fragment, useState, useRef } from 'react';
import i18n from '@dhis2/d2-i18n';
import MenuButton from '../../core/MenuButton';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import AddLayerPopover from './AddLayerPopover';
import styles from './styles/AddLayerButton.module.css';

const AddLayerButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef();
    const toggleDialog = () => setIsOpen(!isOpen);

    return (
        <Fragment>
            <div className={styles.addLayerBtn} ref={buttonRef}>
                <MenuButton onClick={toggleDialog} dataTest="addlayerbutton">
                    <span className={styles.btnContent}>
                        <AddIcon className={styles.addIcon} />{' '}
                        {i18n.t('Add layer')}
                    </span>
                </MenuButton>
            </div>
            {isOpen && (
                <AddLayerPopover anchorEl={buttonRef} onClose={toggleDialog} />
            )}
        </Fragment>
    );
};

export default AddLayerButton;
