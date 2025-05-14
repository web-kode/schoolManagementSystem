import axios from "axios";

export async function getApi(url) {
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      const refreshUrl=`/api/refresh`
      await axios.post(refreshUrl)
      const response = await axios.get(url)
      return response.data
    }
}