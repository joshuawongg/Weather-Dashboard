
//script.js

const API_KEY = 'c54c1b918eb16b8de919e09a4622860a';
const searchForm = $('#search-form');
const cityInput = $('#city-input');
const searchHistory = $('#search-history ul');
const currentWeatherContainer = $('#current-weather-container');
const forecastContainer = $('#forecast-container');
let searchHistoryList = [];

// Load search history from local storage
if (localStorage.getItem('searchHistory')) {
  searchHistoryList = JSON.parse(localStorage.getItem('searchHistory'));
  renderSearchHistory();
}

// Add event listener to search form
searchForm.on('submit', function(event) {
  event.preventDefault();
  const city = cityInput.val().trim();
  if (city === '') return;
  getWeatherData(city);
  cityInput.val('');
});

// Add event listener to search history items
searchHistory.on('click', 'li', function() {
  const city = $(this).text();
  getWeatherData(city);
});

async function getWeatherData(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=imperial`;
  const response = await fetch(url);
  const data = await response.json();

  // Handle invalid city name
  if (data.cod === '404') {
    alert('City not found. Please enter a valid city name.');
    return;
  }

  // Update search history
  if (!searchHistoryList.includes(city)) {
    searchHistoryList.push(city);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistoryList));
    renderSearchHistory();
  }

  // Render current weather
  const date = new Date(data.dt * 1000);
  const iconUrl = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
  currentWeatherContainer.html(`
    <div class="weather-card">
      <h3>${data.name} (${date.toLocaleDateString()}) <img src="${iconUrl}" alt="${data.weather[0].description}"></h3>
      <p>Temperature: ${data.main.temp}&deg;F</p>
      <p>Humidity: ${data.main.humidity}%</p>
      <p>Wind Speed: ${data.wind.speed} mph</p>
    </div>
  `);

  // Fetch 5-day forecast data
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=imperial`;
  const forecastResponse = await fetch(forecastUrl);
  const forecastData = await forecastResponse.json();
  const forecast = forecastData.list.filter((item) => item.dt_txt.includes('12:00:00'));

  // Render 5-day forecast
  forecastContainer.empty();
  forecast.forEach((item) => {
    const forecastDate = new Date(item.dt * 1000);
    const forecastIconUrl = `https://openweathermap.org/img/w/${item.weather[0].icon}.png`;
    forecastContainer.append(`
      <div class="weather-card">
        <h3>${forecastDate.toLocaleDateString()} <img src="${forecastIconUrl}" alt="${item.weather[0].description}"></h3>
        <p>Temp: ${item.main.temp}&deg;F</p>
        <p>Humidity: ${item.main.humidity}%</p>
      </div>
    `);
  });
}

function renderSearchHistory() {
  searchHistory.empty();
  searchHistoryList.forEach((item) => {
    searchHistory.append(`<li>${item}</li>`);
  });
}
