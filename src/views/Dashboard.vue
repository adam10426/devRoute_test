<template>
  <div>
    <!-- upper card -->
    <v-card color="#192b63" rounded="0" flat height="50vh">
      <v-card-title class="mt-n5">
        <!-- search bar -->
        <v-responsive class="mx-auto" max-width="200">
          <v-text-field
            placeholder="Search Location"
            append-icon="mdi-magnify"
            density="compact"
            variant="solo"
            single-line
            hide-details
            v-model="city"
            @click:append="searchWeather"
          ></v-text-field>
        </v-responsive>
        <!-- search bar -->
      </v-card-title>

      <v-card-text>
        <div class="d-flex flex-column align-center mt-4">
          <!-- city Name -->
          <span class="w-5 text-center text-white">
            <h2>{{ currentWeatherData.city }}</h2>
          </span>
          <!-- city Name -->

          <!-- weather information -->
          <div class="flexbox mt-3">
            <!-- weather icon -->
            <i :class="currentWeatherData.icon" class="icon-yellow ml-15"></i>
            <!-- weather icon -->

            <!-- weather temperature -->
            <span class="align-self-center text-white ml-2 f-40">
              {{ temperature }}<sup>o</sup>{{ temperatureUnit }}
            </span>

            <!-- divider -->
            <v-divider inset vertical color="#ffffff" class="ml-6"></v-divider>
            <!-- divider -->

            <!-- percipitation humidity wind -->
            <div class="d-flex flex-column text-white justify-center ml-2">
              <span class="attribute-text">Percipitation: {{ "0" }} %</span>
              <span class="attribute-text"
                >Humidity: {{ currentWeatherData.humidity }} %</span
              >
              <span class="attribute-text"
                >Wind: {{ currentWeatherData.wind }} km/h</span
              >
            </div>
            <!-- percipitation humidity wind -->
          </div>
          <!-- weather information -->

          <!-- weather description -->
          <div class="w-5 text-white text-center mt-3">
            <h2 class="weather-condition-text text-capitalize">
              {{ currentWeatherData.description }}
            </h2>
          </div>
          <!-- weather description -->

          <!-- celsius farenheit toggle -->
          <label class="switch mt-4">
            <input type="checkbox" v-model="isFarenheit" />

            <span
              class="slider d-flex flex-row justify-space-around align-center"
            >
              <div><sup>o</sup>C</div>
              <div><sup>o</sup>F</div>
            </span>
          </label>
          <!-- celsius farenheit toggle -->
        </div>
      </v-card-text>
    </v-card>
    <!-- upper card -->

    <!-- lower card -->
    <v-card rounded="0" flat>
      <!-- weekly weather information -->
      <v-card-text>
        <div class="d-flex flex-row justify-center align-center">
          <v-card
            width="10%"
            class="ml-14 mt-14"
            v-for="(weather, index) in forecast"
            :key="index"
          >
            <v-card-text>
              <div class="d-flex flex-column justify-center alig-center">
                <div class="mx-auto f-large text-blue">
                  {{ weather.date }}
                </div>
                <i
                  :class="weather.icon"
                  class="mx-auto mt-3 f-large icon-blue"
                ></i>

                <span class="mx-auto mt-3 f-large text-blue"
                  >{{ weather.temp }}<sup>o</sup></span
                >
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
      <!-- weekly weather information -->
    </v-card>
    <!-- lower card -->
  </div>
</template>
<script>
import weatherAPI from "@/services/weatherAPI";
import moment from "moment";
export default {
  data: () => ({
    currentWeatherData: {
      city: "",
      degrees: "",
      percipitation: "",
      humidity: "",
      wind: "",
      description: "",
      icon: "",
    },
    forecast: [],
    isFarenheit: false,
    city: undefined,
  }),

  computed: {
    temperature() {
      if (this.isFarenheit) {
        //converting celsius to farenheit on toggle
        return this.convertToFarenheit(this.currentWeatherData.degrees);
      } else return this.currentWeatherData.degrees;
    },

    temperatureUnit() {
      if (this.isFarenheit) {
        //changing units on toggle
        return "F";
      } else return "C";
    },
  },

  methods: {
    async updateCurrentWeatherDetails(lat, lon) {
      //fetch current weather
      let response = await weatherAPI.getCurrentWeather(lat, lon);

      //   update the weather
      this.currentWeatherData.city = response.name;
      this.currentWeatherData.degrees = this.kelvinToCelsius(
        response.main.temp
      ).toFixed(2);
      this.currentWeatherData.humidity = response.main.humidity;
      this.currentWeatherData.wind = response.wind.speed;
      this.currentWeatherData.description = response.weather[0].description;
      this.currentWeatherData.icon = this.weatherIcon(
        response.weather[0].description
      );
    },

    async updateWeekWeatherDetails(lat, lon) {
      this.forecast = [];
      //fetch weather for 5 days
      const weatherData = await weatherAPI.getweekForecast(lat, lon);

      //removing duplicates as the API return data of 5 days, each day frangmented by 3hrs
      weatherData["list"].find((forecast, index, self) => {
        if (
          index ===
          self.findIndex((dailyWeather) => {
            return (
              dailyWeather.dt_txt.split(" ")[0] ===
              forecast.dt_txt.split(" ")[0]
            );
          })
        ) {
          this.forecast.push(forecast);
        }
      });

      // mapping only the relevant values from the objects
      this.forecast = this.forecast.map((weather) => {
        return {
          date: this.fetchDay(weather.dt_txt),
          temp: this.kelvinToCelsius(weather.main.temp).toFixed(2),
          icon: this.weatherIcon(weather.weather[0].description),
        };
      });
    },

    fetchDay(date) {
      //returning day abbreviation on the basis of date
      return moment(date).format("ddd");
    },

    kelvinToCelsius(temperature) {
      // changing the teperature to Celsius as the temp receive in API is in Kelvin
      return parseFloat(temperature) - 273.15;
    },

    convertToFarenheit(temp) {
      //convert to farenheit
      return ((parseInt(temp) * 9) / 5 + 32).toFixed(2);
    },

    async searchWeather() {
      // fetches the lattitude and Longitude of the Location searched
      let coordinates = await weatherAPI.getCityCoordinates(this.city);
      //updated the current and 5 days weather of the location being searched
      this.updateCurrentWeatherDetails(coordinates.lat, coordinates.lon);
      this.updateWeekWeatherDetails(coordinates.lat, coordinates.lon);
    },

    weatherIcon(weatherDescription) {
      // returning dynamic icons on the basis of the description
      switch (weatherDescription) {
        case "rain":
          return "bi bi-cloud-rain";
        case "shower rain":
          return "bi bi-cloud-rain";
        case "thunderstrom":
          return "bi bi-cloud-lightning-rain";
        case "drizzle":
          return "bi bi-cloud-drizzle";
        case "clear sky":
          return "bi bi-brightness-high";
        case "few clouds":
          return "bi bi-cloud-sun";
        case "broken clouds":
          return "bi bi-clouds";
        case "snow":
          return "bi bi-snow";
        case ("mist", "fog"):
          return "bi bi-cloud-fog2";
        case "haze":
          return "bi bi-cloud-haze2";
        default:
          return "bi bi-cloudy";
      }
    },
  },

  created() {
    //use to get realtime location of the user
    navigator.geolocation.getCurrentPosition(async (position) => {
      //updating current weather
      this.updateCurrentWeatherDetails(
        position.coords.latitude,
        position.coords.longitude
      );

      //updating 5 days weather
      this.updateWeekWeatherDetails(
        position.coords.latitude,
        position.coords.longitude
      );
    });
  },
};
</script>
<style lang="scss" scoped>
.text-white {
  color: white !important;
}
.flexbox {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 50%;
  height: 50px;
}
.icon-yellow {
  color: #ffa232 !important;
  font-size: 40px;
}

.w-5 {
  width: 30%;
}
.attribute-text {
  font-size: x-small;
  font-weight: 100;
  line-height: normal;
}
.f-40 {
  font-size: 40px;
}
.weather-condition-text {
  font-weight: 400;
}
/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 15px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;

  color: black;

  border-radius: 2px;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  border-radius: 2px;
  content: "";
  opacity: 0.8;
  height: 15px;
  width: 30px;
  left: 0px;
  bottom: 0px;
  background-color: #ffa232;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #ffffff;
}

input:focus + .slider {
  box-shadow: 0 0 1px #ffffff;
}

input:checked + .slider:before {
  -webkit-transform: translateX(30px);
  -ms-transform: translateX(30px);
  transform: translateX(30px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

::v-deep .v-text-field input {
  flex: 1 1 auto;
  line-height: 2px;
  font-size: 12px;
  padding: 8px 0px 8px;
  padding-left: 10px;
  max-width: 100%;
  min-width: 0px;
  width: 100%;
  background-color: white !important;
  //   .v-input__control > .v-input__slot {
  //     background-color: white !important;
}
::v-deep .v-input__control,
.v-input__slot {
  background-color: white !important;
  cursor: pointer !important;
}

.f-large {
  font-size: large;
}
.icon-blue,
.text-blue {
  color: #192b63;
}
</style>
