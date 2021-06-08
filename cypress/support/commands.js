Cypress.Commands.add('waitForResources', function(resources = []) {
    const globalTimeout = 20000;
    const resourceCheckInterval = 2000;
    const idleTimesInit = 3;
    let idleTimes = idleTimesInit;
    let resourcesLengthPrevious;
    let timeout;

    return new Cypress.Promise((resolve, reject) => {
        const checkIfResourcesLoaded = () => {
            const resourcesLoaded = cy
                .state('window')
                .performance.getEntriesByType('resource')
                .filter(
                    r => !['script', 'xmlhttprequest'].includes(r.initiatorType)
                );

            const allFilesFound = resources.every(resource => {
                const found = resourcesLoaded.filter(resourceLoaded => {
                    return resourceLoaded.name.includes(resource.name);
                });
                if (found.length === 0) {
                    return false;
                }
                return !resource.number || found.length >= resource.number;
            });

            if (allFilesFound) {
                if (resourcesLoaded.length === resourcesLengthPrevious) {
                    idleTimes--;
                } else {
                    idleTimes = idleTimesInit;
                    resourcesLengthPrevious = resourcesLoaded.length;
                }
            }
            if (!idleTimes) {
                resolve();
                return;
            }

            timeout = setTimeout(checkIfResourcesLoaded, resourceCheckInterval);
        };

        checkIfResourcesLoaded();
        setTimeout(() => {
            reject();
            clearTimeout(timeout);
        }, globalTimeout);
    });
});
