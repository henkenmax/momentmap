import './style.css'
import { createMap } from './MapView'

document.querySelector('#app').innerHTML = `
  <div class="app">

    <div id="introModal" class="login-modal hidden">
      <div class="login-card">
        <button id="closeIntroModal" class="close-login">✕</button>

        <h2>MomentMap</h2>

        <p class="intro-text">
          Jeder Ort erzählt Geschichten.
        </p>

        <div class="intro-explainer">
          <strong>📌 Moment</strong>
          <span>Teile deinen Moment an einem Ort.</span>
        </div>

        <div class="intro-explainer">
          <strong>✨ Echo</strong>
          <span>Reagiere auf einen Moment.</span>
        </div>

        <button id="continueToLogin">
          Weiter
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
        <h2>Schön, dass du da bist.</h2>
        <p>Melde dich an oder erstelle ein Konto.</p>

        <input
          id="usernameInput"
          maxlength="20"
          placeholder="Benutzername"
        />

        <input
          id="emailInput"
          type="email"
          placeholder="E-Mail"
        />

        <input
          id="passwordInput"
          type="password"
          placeholder="Passwort"
        />

        <button id="signupButton">
          Konto erstellen
        </button>

        <button id="loginButton" class="secondary">
          Einloggen
        </button>
      </div>
    </div>

    <main>
      <button id="logoutButton" class="logout-button hidden" title="Logout">
        <svg viewBox="0 0 64 64" class="logout-icon" aria-hidden="true">
          <path d="M38 10h14v44H38" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 16l24-6v44l-24-6V16z" fill="currentColor"/>
          <circle cx="29" cy="32" r="2.5" fill="#fff176"/>
        </svg>
      </button>

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