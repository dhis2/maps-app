import { createPeriodGeneratorsForLocale } from 'd2/period/generators';

export const createPeriods = (locale, periodType, year) => {
    const localePeriodGenerator = createPeriodGeneratorsForLocale(locale);

    const periodGenerator =
        localePeriodGenerator[`generate${periodType}PeriodsForYear`] ||
        localePeriodGenerator[`generate${periodType}PeriodsUpToYear`];

    if (!periodGenerator) {
        return null;
    }

    return periodGenerator(year).reverse();
};
