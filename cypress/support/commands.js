import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

addMatchImageSnapshotCommand({
    comparisonMethod: 'ssim',
    failureThreshold: 0.01,
    failureThresholdType: 'percent',
});

/**
 * This command will periodically check window for loaded resources.
 * The check will occur every 2 seconds.
 * When the number of loaded resources hasn't changed after 3 checks,
 * then resources loading is considered complete.
 *
 * A list of resources of interest can be supplied. This is an array of objects:
 * [{name: 'resourcename', number: integer}]
 *
 * Credit to https://www.artmann.co/articles/waiting-for-network-resources-in-cypress
 * and https://github.com/cypress-io/cypress/issues/1773#issuecomment-813812612
 */

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

Cypress.Commands.add('setResolution', size => {
    if (Cypress._.isArray(size)) {
        cy.viewport(size[0], size[1]);
    } else {
        cy.viewport(size);
    }
});
