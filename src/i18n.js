export const translations = {
  de: {
    appTitle: 'MomentMap',
    introText: 'Jeder Ort erzählt Geschichten.',
    momentTitle: '📌 Moment',
    momentDescription: 'Teile deinen Moment an einem Ort.',
    echoTitle: '✨ Echo',
    echoDescription: 'Reagiere auf einen Moment.',
    continue: 'Weiter',

    welcomeTitle: 'Schön, dass du da bist.',
    welcomeText: 'Melde dich an oder erstelle ein Konto.',
    username: 'Benutzername',
    email: 'E-Mail',
    password: 'Passwort',
    signup: 'Konto erstellen',
    login: 'Einloggen',

    myProfile: 'Mein Profil',
    moments: 'Momente',
    activeEchos: 'Echos',
    display: 'Anzeige',
    allMoments: 'Alle Momente',
    onlyMyMoments: 'Nur meine Momente'
  },

  en: {
    appTitle: 'MomentMap',
    introText: 'Every place tells stories.',
    momentTitle: '📌 Moment',
    momentDescription: 'Share your moment at a place.',
    echoTitle: '✨ Echo',
    echoDescription: 'React to a moment.',
    continue: 'Continue',

    welcomeTitle: 'Nice to have you here.',
    welcomeText: 'Sign in or create an account.',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    signup: 'Create account',
    login: 'Log in',

    myProfile: 'My profile',
    moments: 'Moments',
    activeEchos: 'Echoes',
    display: 'Display',
    allMoments: 'All moments',
    onlyMyMoments: 'Only my moments'
  }
}

export function getLanguage() {
  const browserLanguage = navigator.language.slice(0, 2)

  if (translations[browserLanguage]) {
    return browserLanguage
  }

  return 'en'
}

export function t(key) {
  const lang = getLanguage()

  return translations[lang][key] || translations.en[key] || key
}