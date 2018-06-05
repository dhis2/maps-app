import i18n from '../locales';

export const configI18n = userSettings => {
  i18n.changeLanguage(userSettings.keyUiLocale);
};
