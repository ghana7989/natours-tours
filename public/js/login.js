import axios from "axios"
import { showAlert } from './alerts';

export async function login(email, password) {
  try {
    const result = await axios({
      method: 'POST',
      url: `http://localhost:3000/api/v1/users/login`,
      data: {
        email,
        password
      }
    })
    if (result.data.status = "success") {
      showAlert("success", "Logged In Successfully")
      window.location.assign("/")
    }
  } catch (error) {
    showAlert("error", error.response?.data?.message)
  }
}

export const logout = async () => {
  try {
    await axios.get("http://localhost:3000/api/v1/users/logout");
    location.reload()
  } catch (error) {
    showAlert("error", error.response?.data?.message)
  }
}