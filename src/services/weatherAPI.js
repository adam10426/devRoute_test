import API from '@/services/BaseApi';
const APIKey = '605b88d8e4d2818a1afcd8560e04c41f'
export default{
    
    async getCurrentWeather(lat,lon){
        const response = await API.baseApi.get(`weather?lat=${lat}&lon=${lon}&appid=${APIKey}`)
        return response.data
    },

 
    async getweekForecast(lat,lon){
  
        const response = await API.baseApi.get(`forecast?lat=${lat}&lon=${lon}&appid=${APIKey}`)
        return response.data
    
    },

    async getCityCoordinates(city){
        const response = await API.geoApi.get(`direct?q=${city}&appid=${APIKey}`)
        return response.data[0] 
    }
}