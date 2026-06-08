import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from './supabase.js'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

export function createMap() {
  let selectedLocation = null
  let selectedMomentForEcho = null
  let momentsCache = []
  let echosCache = []
  let currentUser = null

  const map = L.map('map', {
    zoomControl: false
  }).setView([51.1657, 10.4515], 6)

  L.control.zoom({
    position: 'bottomleft'
  }).addTo(map)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  const form = document.querySelector('#momentForm')
  const textInput = document.querySelector('#momentText')
  const charCount = document.querySelector('#charCount')
  const saveButton = document.querySelector('#saveMoment')
  const cancelButton = document.querySelector('#cancelMoment')

  const echoForm = document.querySelector('#echoForm')
  const echoText = document.querySelector('#echoText')
  const echoCharCount = document.querySelector('#echoCharCount')
  const saveEchoButton = document.querySelector('#saveEcho')
  const cancelEchoButton = document.querySelector('#cancelEcho')

  const loginModal = document.querySelector('#loginModal')
  const usernameInput = document.querySelector('#usernameInput')
  const emailInput = document.querySelector('#emailInput')
  const passwordInput = document.querySelector('#passwordInput')
  const signupButton = document.querySelector('#signupButton')
  const loginButton = document.querySelector('#loginButton')
  const logoutButton = document.querySelector('#logoutButton')
  const closeLoginModal = document.querySelector('#closeLoginModal')

  const markersById = {}
  const echoMarkersById = {}

 function getUsername() {
  console.log('User metadata:', currentUser?.user_metadata)

  return currentUser?.user_metadata?.username || 'MomentMap Nutzer'
}

  function isLoggedIn() {
    return !!currentUser
  }

  function showLoginModal() {
    loginModal.classList.remove('hidden')
    usernameInput.focus()
  }

  function hideLoginModal() {
    loginModal.classList.add('hidden')
  }

  function updateLogoutButton() {
    if (isLoggedIn()) {
      logoutButton.classList.remove('hidden')
    } else {
      logoutButton.classList.add('hidden')
    }
  }

  async function updateAuthState() {
  const { data } = await supabase.auth.getUser()

  currentUser = data.user

  console.log('Aktueller User:', currentUser)
  console.log('User Metadata:', currentUser?.user_metadata)

  updateLogoutButton()
}

  async function signup() {
    const username = usernameInput.value.trim()
    const email = emailInput.value.trim()
    const password = passwordInput.value.trim()

    if (!username || !email || !password) {
      alert('Bitte Benutzername, E-Mail und Passwort eingeben.')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    })

    if (error) {
      alert(error.message)
      return
    }

    currentUser = data.user
    hideLoginModal()
    updateLogoutButton()
  }

  async function login() {
  const username = usernameInput.value.trim()
  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()

  if (!email || !password) {
    alert('Bitte E-Mail und Passwort eingeben.')
    return
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    alert(error.message)
    return
  }

  currentUser = data.user

  if (username && !currentUser.user_metadata?.username) {
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      data: {
        username: username
      }
    })

    if (!updateError) {
      currentUser = updateData.user
    }
  }

  hideLoginModal()
  updateLogoutButton()
}

  async function logout() {
    await supabase.auth.signOut()
    currentUser = null

    form.classList.add('hidden')
    echoForm.classList.add('hidden')
    hideLoginModal()
    updateLogoutButton()

    map.closePopup()
  }

  function getTodayKey() {
    return new Date().toISOString().split('T')[0]
  }

  function getMomentDay(moment) {
    return moment.createdAt.split('T')[0]
  }

  function formatTimeAgo(dateString) {
    if (!dateString) {
      return 'Erstellt vor unbekannter Zeit'
    }

    const created = new Date(dateString)

    if (Number.isNaN(created.getTime())) {
      return 'Erstellt vor unbekannter Zeit'
    }

    const now = new Date()
    const seconds = Math.max(
      0,
      Math.floor((now.getTime() - created.getTime()) / 1000)
    )

    if (seconds < 60) {
      return 'Erstellt vor wenigen Sekunden'
    }

    const minutes = Math.floor(seconds / 60)

    if (minutes < 60) {
      return `Erstellt vor ${minutes} Minute${minutes > 1 ? 'n' : ''}`
    }

    const hours = Math.floor(minutes / 60)

    if (hours < 24) {
      return `Erstellt vor ${hours} Stunde${hours > 1 ? 'n' : ''}`
    }

    const days = Math.floor(hours / 24)

    if (days === 1) {
      return 'Erstellt gestern'
    }

    if (days < 30) {
      return `Erstellt vor ${days} Tagen`
    }

    const months = Math.floor(days / 30)

    if (months < 12) {
      return `Erstellt vor ${months} Monat${months > 1 ? 'en' : ''}`
    }

    const years = Math.floor(months / 12)

    return `Erstellt vor ${years} Jahr${years > 1 ? 'en' : ''}`
  }

  function formatEchoTime(dateString) {
    return formatTimeAgo(dateString).replace('Erstellt ', '')
  }

  function getSavedMoments() {
    return momentsCache
  }

  function getSavedEchos() {
    return echosCache
  }

  function getActiveEchos() {
    const now = new Date()

    return getSavedEchos().filter((echo) => {
      return new Date(echo.expiresAt) > now
    })
  }

  function cleanupExpiredEchos() {
    echosCache = getActiveEchos()

    Object.keys(echoMarkersById).forEach((echoId) => {
      const stillActive = echosCache.some((echo) => echo.id === echoId)

      if (!stillActive) {
        map.removeLayer(echoMarkersById[echoId])
        delete echoMarkersById[echoId]
      }
    })
  }

  function getActiveEchosForMoment(momentId) {
    return getActiveEchos().filter((echo) => echo.momentId === momentId)
  }

  function hasMomentToday() {
    const moments = getSavedMoments()
    const today = getTodayKey()

    return moments.some((moment) => {
      return getMomentDay(moment) === today && moment.userId === currentUser?.id
    })
  }

  async function deleteMoment(momentId) {
    const momentToDelete = momentsCache.find((moment) => moment.id === momentId)

    if (!momentToDelete || momentToDelete.userId !== currentUser?.id) {
      alert('Du kannst nur deine eigenen Momente löschen.')
      return
    }

    const { error } = await supabase
      .from('moments')
      .delete()
      .eq('id', momentId)

    if (error) {
      console.error('Fehler beim Löschen:', error)
      alert('Moment konnte nicht gelöscht werden.')
      return
    }

    momentsCache = momentsCache.filter((moment) => moment.id !== momentId)
    echosCache = echosCache.filter((echo) => echo.momentId !== momentId)

    Object.keys(echoMarkersById).forEach((echoId) => {
      const echoStillExists = echosCache.some((echo) => echo.id === echoId)

      if (!echoStillExists) {
        map.removeLayer(echoMarkersById[echoId])
        delete echoMarkersById[echoId]
      }
    })

    if (markersById[momentId]) {
      map.removeLayer(markersById[momentId])
      delete markersById[momentId]
    }

    map.closePopup()
  }

  function createPostitContent(moment) {
    const isOwnMoment = moment.userId === currentUser?.id
    const activeEchoCount = getActiveEchosForMoment(moment.id).length

    return `
      <div class="postit">
        <div class="postit-text">
          ${moment.text}
        </div>

        <span class="postit-user">
          — ${moment.username}
        </span>

        <span class="postit-date">
          ${formatTimeAgo(moment.createdAt)}
        </span>

        <div class="postit-echo-count">
          ✨ ${activeEchoCount}
        </div>

        <button class="create-echo-button" data-moment-id="${moment.id}">
          ✨
        </button>

        ${
          isOwnMoment
            ? `
              <button class="delete-moment-button" data-moment-id="${moment.id}">
                🗑️
              </button>
            `
            : ''
        }
      </div>
    `
  }

  function createEchoContent(echo) {
    return `
      <div class="postit echo-postit">
        <div class="postit-text">
          ${echo.text}
        </div>

        <span class="postit-user">
          — ${echo.username}
        </span>

        <span class="postit-date">
          ${formatEchoTime(echo.createdAt)}
        </span>
      </div>
    `
  }

  function createEchoIcon() {
    return L.divIcon({
      className: 'echo-marker',
      html: '✨',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })
  }

  function getEchoPosition(moment, index, total) {
    const angle = (2 * Math.PI * index) / Math.max(total, 1)
    const radius = 0.0018

    return [
      moment.lat + Math.sin(angle) * radius,
      moment.lng + Math.cos(angle) * radius
    ]
  }

  function addEchoToMap(echo, moment, index, total) {
    const echoMarker = L.marker(getEchoPosition(moment, index, total), {
      icon: createEchoIcon()
    })
      .addTo(map)
      .bindPopup(createEchoContent(echo))

    echoMarkersById[echo.id] = echoMarker
  }

  function refreshEchosForMoment(moment) {
    getActiveEchosForMoment(moment.id).forEach((echo) => {
      if (echoMarkersById[echo.id]) {
        map.removeLayer(echoMarkersById[echo.id])
        delete echoMarkersById[echo.id]
      }
    })

    const activeEchos = getActiveEchosForMoment(moment.id)

    activeEchos.forEach((echo, index) => {
      addEchoToMap(echo, moment, index, activeEchos.length)
    })

    if (markersById[moment.id]) {
      markersById[moment.id].setPopupContent(createPostitContent(moment))
    }
  }

  function refreshAllEchos() {
    Object.keys(echoMarkersById).forEach((echoId) => {
      map.removeLayer(echoMarkersById[echoId])
      delete echoMarkersById[echoId]
    })

    getSavedMoments().forEach((moment) => {
      refreshEchosForMoment(moment)
    })
  }

  function addMomentToMap(moment) {
    const marker = L.marker([moment.lat, moment.lng])
      .addTo(map)
      .bindPopup(createPostitContent(moment))

    marker.on('click', () => {
      if (!isLoggedIn()) {
        marker.closePopup()
        showLoginModal()
        return
      }

      marker.setPopupContent(createPostitContent(moment))
    })

    markersById[moment.id] = marker
  }

  async function loadMoments() {
    const { data, error } = await supabase
      .from('moments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fehler beim Laden der Momente:', error)
      return
    }

    momentsCache = data.map((moment) => {
      return {
        id: moment.id,
        text: moment.text,
        lat: moment.lat,
        lng: moment.lng,
        userId: moment.user_id,
        username: moment.username || 'MomentMap Nutzer',
        createdAt: moment.created_at
      }
    })

    momentsCache.forEach((moment) => {
      addMomentToMap(moment)
    })
  }

  async function loadEchos() {
    const { data, error } = await supabase
      .from('echoes')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Fehler beim Laden der Echos:', error)
      return
    }

    echosCache = data.map((echo) => {
      return {
        id: echo.id,
        momentId: echo.moment_id,
        text: echo.text,
        userId: echo.user_id,
        username: echo.username || 'MomentMap Nutzer',
        createdAt: echo.created_at,
        expiresAt: echo.expires_at
      }
    })
  }

  signupButton.addEventListener('click', signup)
  loginButton.addEventListener('click', login)
  logoutButton.addEventListener('click', logout)
  closeLoginModal.addEventListener('click', () => {
  hideLoginModal()
})

  document.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.delete-moment-button')

    if (deleteButton) {
      const momentId = deleteButton.dataset.momentId
      deleteMoment(momentId)
      return
    }

    const echoButton = event.target.closest('.create-echo-button')

    if (echoButton) {
      if (!isLoggedIn()) {
        showLoginModal()
        return
      }

      const momentId = echoButton.dataset.momentId
      const moment = getSavedMoments().find((savedMoment) => savedMoment.id === momentId)

      if (!moment) {
        return
      }

      selectedMomentForEcho = moment
      map.closePopup()

      echoText.value = ''
      echoCharCount.textContent = '0'
      echoForm.classList.remove('hidden')
      echoText.focus()
    }
  })

  map.on('popupopen', (event) => {
    if (!isLoggedIn()) {
      event.popup.close()
      showLoginModal()
    }
  })

  map.on('click', (event) => {
    if (!isLoggedIn()) {
      showLoginModal()
      return
    }

    if (hasMomentToday()) {
      alert('Du hast deinen Moment für heute bereits festgehalten.')
      return
    }

    selectedLocation = event.latlng
    echoForm.classList.add('hidden')
    form.classList.remove('hidden')
    textInput.value = ''
    charCount.textContent = '0'
    textInput.focus()
  })

  textInput.addEventListener('input', () => {
    charCount.textContent = textInput.value.length
  })

  echoText.addEventListener('input', () => {
    echoCharCount.textContent = echoText.value.length
  })

  saveButton.addEventListener('click', async () => {
    const text = textInput.value.trim()

    if (!text) {
      alert('Bitte schreibe etwas.')
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData.session

    if (!session?.user) {
      showLoginModal()
      alert('Bitte logge dich erneut ein.')
      return
    }

    currentUser = session.user

    if (hasMomentToday()) {
      alert('Du hast deinen Moment für heute bereits festgehalten.')
      form.classList.add('hidden')
      return
    }

    const { data, error } = await supabase
  .from('moments')
  .insert({
    text: text,
    lat: selectedLocation.lat,
    lng: selectedLocation.lng,
    user_id: session.user.id,
    username: getUsername()
  })
      .select()
      .single()

    if (error) {
      console.error('Fehler beim Speichern des Moments:', error)
      alert('Moment konnte nicht gespeichert werden.')
      return
    }

    const newMoment = {
      id: data.id,
      text: data.text,
      lat: data.lat,
      lng: data.lng,
      userId: data.user_id,
      username: getUsername(),
      createdAt: data.created_at
    }

    momentsCache.push(newMoment)
    addMomentToMap(newMoment)

    form.classList.add('hidden')
  })

  saveEchoButton.addEventListener('click', async () => {
    const text = echoText.value.trim()

    if (!text || !selectedMomentForEcho) {
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData.session

    if (!session?.user) {
      showLoginModal()
      alert('Bitte logge dich erneut ein.')
      return
    }

    currentUser = session.user

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000)

    const { data, error } = await supabase
  .from('echoes')
  .insert({
    moment_id: selectedMomentForEcho.id,
    text: text,
    user_id: session.user.id,
    username: getUsername(),
    expires_at: expiresAt.toISOString()
  })
      .select()
      .single()

    if (error) {
      console.error('Fehler beim Speichern des Echos:', error)
      alert('Echo konnte nicht gespeichert werden.')
      return
    }

    const newEcho = {
      id: data.id,
      momentId: data.moment_id,
      text: data.text,
      userId: data.user_id,
      username: getUsername(),
      createdAt: data.created_at,
      expiresAt: data.expires_at
    }

    echosCache.push(newEcho)

    refreshEchosForMoment(selectedMomentForEcho)

    echoForm.classList.add('hidden')
    selectedMomentForEcho = null
  })

  cancelButton.addEventListener('click', () => {
    form.classList.add('hidden')
  })

  cancelEchoButton.addEventListener('click', () => {
    echoForm.classList.add('hidden')
    selectedMomentForEcho = null
  })

  passwordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      loginButton.click()
    }
  })

  updateAuthState().then(() => {
    updateLogoutButton()
    cleanupExpiredEchos()

    loadMoments().then(() => {
      loadEchos().then(() => {
        refreshAllEchos()
      })
    })
  })

  setInterval(() => {
    cleanupExpiredEchos()
    refreshAllEchos()
  }, 60 * 1000)

  return map
}