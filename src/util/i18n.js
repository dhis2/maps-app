import i18next from 'i18next';
import XHR from 'i18next-xhr-backend';

export const configI18n = (userSettings) => {
    i18next
        .use(XHR)
        .init({
            returnEmptyString: false,
            fallbackLng: false,
            keySeparator: '|',
            backend: {
                loadPath: '/i18n/{{lng}}.json'
            }
        }, (err, t) => {
            const uiLocale = userSettings.keyUiLocale;
            if (uiLocale && uiLocale !== 'en') {
                i18next.changeLanguage(uiLocale);
            }
        });
};