import "@babel/polyfill"
import { login, logout } from './login'
import { displayMap } from './mapBox'
import { updateData } from "./updateSettings"
// DOM Elements
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logOutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')

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
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;

    updateData(name,email)
  })  
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout)
}