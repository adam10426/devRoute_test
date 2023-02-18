import axios from 'axios'

// weather API base url
export const api = axios.create({
    baseURL : 'https://api.openweathermap.org/data/2.5'
})

//geo location API base url
export const geoAPI = axios.create({
    baseURL:'http://api.openweathermap.org/geo/1.0'
})


export default {
  baseApi:api ,
  geoApi:geoAPI 
}

