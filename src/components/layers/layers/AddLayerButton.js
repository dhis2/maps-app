import React from 'react';
import i18n from '@dhis2/d2-i18n';
import { DropdownButton } from '@dhis2/ui';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import AddLayerPopover from './AddLayerPopover';
import styles from './styles/DownloadDialog.module.css';

const AddLayerButton = () => (
    <div className={styles.addLayerBtn}>
        <DropdownButton
            secondary
            component={<AddLayerPopover />}
            icon={<AddIcon />}
            dataTest="addlayerbutton"
        >
            {i18n.t('Add layer')}
        </DropdownButton>
    </div>
);

export default AddLayerButton;
