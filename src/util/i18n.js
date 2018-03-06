import i18next from 'i18next';
import XHR from 'i18next-xhr-backend';
import { config } from 'd2/lib/d2';

export const configI18n = userSettings => {
    const uiLocale = userSettings.keyUiLocale;

    if (uiLocale && uiLocale !== 'en') {
        config.i18n.sources.add(`./i18n/i18n_module_${uiLocale}.properties`);
    }

    config.i18n.sources.add('./i18n/i18n_module_en.properties');

    i18next.use(XHR).init(
        {
            returnEmptyString: false,
            fallbackLng: false,
            keySeparator: '|',
            backend: {
                loadPath: '/i18n/{{lng}}.json',
            },
        },
        (err, t) => {
            if (uiLocale && uiLocale !== 'en') {
                i18next.changeLanguage(uiLocale);
            }
        }
    );
};
