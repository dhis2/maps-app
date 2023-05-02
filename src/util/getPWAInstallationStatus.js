export const INSTALLATION_STATES = {
    READY: 'READY',
    INSTALLING: 'INSTALLING',
}

function handleInstallingWorker({ installingWorker, onStateChange }) {
    installingWorker.onstatechange = () => {
        if (installingWorker.state === 'activated') {
            // ... and update state to 'ready'
            onStateChange(INSTALLATION_STATES.READY)
        }
    }
}

/**
 * Gets the current installation state of the PWA features, which is intended
 * to be reported from this plugin to the parent app to indicate that the
 * static assets are cached and ready to be accessed locally instead of over
 * the network.
 *
 * Returns either READY, INSTALLING, or `null` for not installed/won't install
 */
export async function getPWAInstallationStatus({ onStateChange }) {
    if (!navigator.serviceWorker) {
        // Nothing to do here
        return null
    }

    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
        // This shouldn't happen since this is a PWA app, but return null
        return null
    }

    if (registration.active) {
        return INSTALLATION_STATES.READY
    }
    // note that 'registration.waiting' is skipped - it implies there's an active one
    if (registration.installing) {
        handleInstallingWorker({
            installingWorker: registration.installing,
            onStateChange,
        })
        return INSTALLATION_STATES.INSTALLING
    }

    // It shouldn't normally be possible to get here, but just in case,
    // listen for installations
    registration.onupdatefound = () => {
        // update state for this plugin to 'installing'
        onStateChange(INSTALLATION_STATES.INSTALLING)

        // also listen for the installing worker to become active
        const installingWorker = registration.installing
        if (!installingWorker) {
            return
        }
        handleInstallingWorker({ installingWorker, onStateChange })
    }

    // and in the mean time, return null to show 'not installed'
    return null
}
