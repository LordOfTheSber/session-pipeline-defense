export type Locale = 'en' | 'ru';

const LANGUAGE_KEY = 'session-defense:language';

const translations = {
  en: {
    divisionConsole: 'Division Console',
    activeOperator: 'Active operator',
    mode: 'Mode',
    difficulty: 'Difficulty',
    backendStatus: 'Backend status',
    savePreferences: 'Save Preferences',
    language: 'Language',
    english: 'English',
    russian: 'Русский',
    pause: 'Pause',
    resume: 'Resume',
    timed3m: 'TIMED 3 MIN',
    timed5m: 'TIMED 5 MIN',
    nextShift: 'NEXT SHIFT',
  },
  ru: {
    divisionConsole: 'Консоль подразделения',
    activeOperator: 'Активный оператор',
    mode: 'Режим',
    difficulty: 'Сложность',
    backendStatus: 'Статус сервера',
    savePreferences: 'Сохранить настройки',
    language: 'Язык',
    english: 'English',
    russian: 'Русский',
    pause: 'Пауза',
    resume: 'Продолжить',
    timed3m: 'НА ВРЕМЯ 3 МИН',
    timed5m: 'НА ВРЕМЯ 5 МИН',
    nextShift: 'СЛЕДУЮЩАЯ СМЕНА',
  },
} as const;

export function getStoredLanguage(): Locale {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored === 'en' || stored === 'ru') {
    return stored;
  }

  return 'ru';
}

export function setStoredLanguage(locale: Locale): void {
  localStorage.setItem(LANGUAGE_KEY, locale);
}

export function t(locale: Locale, key: keyof (typeof translations)['en']): string {
  return translations[locale][key] ?? translations.en[key];
}
