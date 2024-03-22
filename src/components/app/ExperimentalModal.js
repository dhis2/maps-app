import i18n from '@dhis2/d2-i18n'
import { useState } from 'react'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
} from '@dhis2/ui'

const ExperimentalModal = () => {
    const [isOpen, setIsOpen] = useState(true)

    return isOpen ? (
        <Modal position="middle">
            <ModalTitle>DHIS2 Maps Climate Pilot</ModalTitle>
            <ModalContent>
                <p>
                    This is an experimental app that allows you to explore
                    weather, climate and environmental data in a similar
                    interface to DHIS2 Maps.
                </p>
                <p>
                    You can add multiple layers to the map, including data from
                    your DHIS2 instance, allowing you to look for relationships
                    between different data sources.
                </p>
                <p>
                    Please note that maps created with this app can not be saved
                    and added to a dashboard. You can use{' '}
                    <em>DHIS2 Climate Data Import</em> app to import weater and
                    climate data into a DHIS2 data element, which can then be
                    used in all the analytics apps.
                </p>
                <p>
                    We will use this app to test new datasets for the DHIS2
                    Climate & Health project, and to explore new features for
                    DHIS2 Maps.
                </p>
                <p>
                    Please send your feedback about this app to{' '}
                    <a href="mailto:climate@dhis2.org">climate@dhis2.org</a>
                </p>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button primary onClick={() => setIsOpen(false)}>
                        {i18n.t('Close')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    ) : null
}

export default ExperimentalModal
