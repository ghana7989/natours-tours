import "@babel/polyfill"
import { login, logout } from './login'
import { displayMap } from './mapBox'
import { updateSettings } from "./updateSettings"
// DOM Elements
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logOutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-settings')

// Values
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations)
  displayMap(locations)
}
if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email, password)
  })
}

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault()
    const form = new FormData();
    form.append('name', document.getElementById('name').value)
    form.append('email', document.getElementById('email').value)
    form.append('photo', document.getElementById('photo').files[0])

    updateSettings(form, 'data')
  })
}
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    document.querySelector('.btn--save-password').textContent = 'Updating...'
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings({ password, passwordConfirm, passwordCurrent }, 'password');
    document.getElementById('password-current').value = null
    document.getElementById('password').value = null
    document.getElementById('password-confirm').value = null
    document.getElementById('password-confirm').blur()
    document.querySelector('.btn--save-password').textContent = 'Save Password'
  })
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout)
}