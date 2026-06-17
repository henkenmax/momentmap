import './style.css'
import { createMap } from './MapView'
import { t } from './i18n.js'

document.querySelector('#app').innerHTML = `
  <div class="app">

    <div id="introModal" class="login-modal hidden">
      <div class="login-card">
        <button id="closeIntroModal" class="close-login">✕</button>

        <h2>${t('appTitle')}</h2>

        <p class="intro-text">
          ${t('introText')}
        </p>

        <div class="intro-explainer">
          <strong>${t('momentTitle')}</strong>
<span>${t('momentDescription')}</span>
        </div>

        <div class="intro-explainer">
         <strong>${t('echoTitle')}</strong>
<span>${t('echoDescription')}</span>
        </div>

        <button id="continueToLogin">
          ${t('continue')}
        </button>

        <div class="legal-links">
          <button id="showImpressum" class="legal-link">Impressum</button>
          <span>·</span>
          <button id="showPrivacy" class="legal-link">Datenschutz</button>
          <span>·</span>
          <button id="showContact" class="legal-link">Kontakt</button>
        </div>
      </div>
    </div>

    <div id="loginModal" class="login-modal hidden">
      <div class="login-card">
        <button id="closeLoginModal" class="close-login">✕</button>
        <h2>${t('welcomeTitle')}</h2>
<p>${t('welcomeText')}</p>

        <input
          id="usernameInput"
          maxlength="20"
          placeholder="${t('username')}"
        />

        <input
          id="emailInput"
          type="email"
          placeholder="${t('email')}"
        />

        <input
          id="passwordInput"
          type="password"
          placeholder="${t('password')}"
        />

        <button id="signupButton">
          ${t('signup')}
        </button>

        <button id="loginButton" class="secondary">
          ${t('login')}
        </button>
      </div>
    </div>

    <main>
      <div class="top-right-buttons">
  <button id="profileButton" class="profile-status-button hidden" title="Mein Profil">
    ✓
  </button>

  <button id="logoutButton" class="logout-button hidden" title="Logout">
    <svg viewBox="0 0 64 64" class="logout-icon" aria-hidden="true">
      <path d="M38 10h14v44H38" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 16l24-6v44l-24-6V16z" fill="currentColor"/>
      <circle cx="29" cy="32" r="2.5" fill="#fff176"/>
    </svg>
  </button>
</div>

<div id="profilePostit" class="profile-postit hidden"></div>

      <div id="map"></div>

      <div id="momentForm" class="moment-form hidden">
        <textarea
          id="momentText"
          maxlength="200"
          placeholder="📝"
        ></textarea>

        <div class="counter">
          <span id="charCount">0</span>/200
        </div>

        <button id="saveMoment">✓</button>
        <button id="cancelMoment" class="secondary">✕</button>
      </div>

      <div id="echoForm" class="moment-form echo-form hidden">
        <textarea
          id="echoText"
          maxlength="100"
          placeholder="✨"
        ></textarea>

        <div class="counter">
          <span id="echoCharCount">0</span>/100
        </div>

        <button id="saveEcho">✓</button>
        <button id="cancelEcho" class="secondary">✕</button>
      </div>
    </main>
  </div>
`

createMap()