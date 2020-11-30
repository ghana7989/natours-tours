
async function login(email, password) {
  console.log('email, password: ', email, password);
  const response = await fetch(`/api/v1/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
  const result = await response.json()
  console.log('result: ', result);
  if (result.status === "success") {
    alert("Logged in successfully");
    window.setTimeout(() => {
      location.assign("/")
    }, 1500)
  } else {
    alert(result.message)
  }
}

document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault()
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  login(email, password)
})