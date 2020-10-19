import React, { Fragment, useState } from 'react';
import i18n from '@dhis2/d2-i18n';
import { Button } from '@dhis2/ui';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import AddLayerPopover from './AddLayerPopover';
import styles from './styles/AddLayer.module.css';

const AddLayerButton = () => {
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const [buttonRef, setButtonRef] = useState();
    const toggleDialog = () => setDialogIsOpen(!dialogIsOpen);

    return (
        <Fragment>
            <div ref={setButtonRef}>
                <Button onClick={toggleDialog} data-test="addlayerbutton">
                    <AddIcon className={styles.icon} /> {i18n.t('Add layer')}
                </Button>
            </div>
            {dialogIsOpen && (
                <AddLayerPopover anchorEl={buttonRef} onClose={toggleDialog} />
            )}
        </Fragment>
    );
};

export default AddLayerButton;
