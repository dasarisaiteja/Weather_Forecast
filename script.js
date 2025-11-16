// API Key 
const apiKey = '69e77be11aab1f328c9f1023e95796be'; 
// api link
const API_URL = 'https://api.openweathermap.org/data/2.5';

// Variables to store current unit celsius or fahrenheit
let isCelsius = true;
let currentTempCelsius = 0;
// Variable to store raw 5-day forecast data for unit conversion
let rawForecastData = null; 

// Get elements from HTML
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const errorMessage = document.getElementById('errorMessage');
const currentWeather = document.getElementById('currentWeather');
const forecastSection = document.getElementById('forecastSection');
const recentSearchesContainer = document.getElementById('recentSearchesContainer');
const recentSearchesSelect = document.getElementById('recentSearches');
const unitToggle = document.getElementById('unitToggle');

// Event listeners for buttons
searchBtn.addEventListener('click', function() {
    const city = cityInput.value.trim();
    if (city === '') {
        showError('Please enter a city name');
        return;
    }
    getWeatherByCity(city);
    cityInput.value = '';
});

// Allow user to press Enter key to search
cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

locationBtn.addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoordinates(lat, lon);
            },
            function(error) {
                showError('Unable to get your location. Please enable location access.');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
});

// Event listener for recent searches dropdown
recentSearchesSelect.addEventListener('change', function() {
    const selectedCity = this.value;
    if (selectedCity) {
        getWeatherByCity(selectedCity);
    }
});

// Event listener for temperature unit toggle
unitToggle.addEventListener('click', function() {
    isCelsius = !isCelsius;
    
    // Update current weather display
    const tempElement = document.getElementById('temperature');
    if (isCelsius) {
        unitToggle.textContent = '°C';
        tempElement.textContent = Math.round(currentTempCelsius) + '°';
    } else {
        unitToggle.textContent = '°F';
        const tempF = (currentTempCelsius * 9/5) + 32;
        tempElement.textContent = Math.round(tempF) + '°';
    }

    
    updateUnitDependentText();
    
});

// Function to update 'Feels like' and forecast text when unit changes
function updateUnitDependentText() {
    // 1. Update 'Feels like' temperature
    const feelsLikeElement = document.getElementById('feelsLike');
    if (feelsLikeElement) {
        const currentFeelsLikeC = parseFloat(feelsLikeElement.dataset.feelsLikeC);
        let feelsLikeText = Math.round(currentFeelsLikeC);
        let feelsLikeUnit = '°C';
        
        if (!isCelsius) {
            feelsLikeText = Math.round((currentFeelsLikeC * 9/5) + 32);
            feelsLikeUnit = '°F';
        }
        feelsLikeElement.textContent = `Feels like ${feelsLikeText}${feelsLikeUnit}`;
    }

    // 2. Re-render the forecast
    if (rawForecastData) {
        displayForecast(rawForecastData);
    }
}


// Function to fetch weather by city name
function getWeatherByCity(city) {
    hideError();
    
    // Fetch current weather
    fetch(`${API_URL}/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayCurrentWeather(data);
            saveToRecentSearches(city);
            
            // Fetch 5-day forecast 
            return fetch(`${API_URL}/forecast?q=${city}&appid=${apiKey}&units=metric`);
        })
        .then(response => response.json())
        .then(data => {
            // Store raw data for unit conversion and re-rendering
            rawForecastData = data; 
            displayForecast(data);
        })
        .catch(error => {
            showError('City not found. Please check the spelling and try again.');
        });
}

// Function to fetch weather by coordinates
function getWeatherByCoordinates(lat, lon) {
    hideError();
    
    // Fetch current weather
    fetch(`${API_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
            saveToRecentSearches(data.name);
            
            // Fetch 5-day forecast 
            return fetch(`${API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        })
        .then(response => response.json())
        .then(data => {
            // Store raw data for unit conversion and re-rendering
            rawForecastData = data; 
            displayForecast(data);
        })
        .catch(error => {
            showError('Unable to fetch weather data. Please try again.');
        });
}

// Function to display current weather
function displayCurrentWeather(data) {
    currentWeather.classList.remove('hidden');
    
    // Store temperature in celsius for unit conversion
    currentTempCelsius = data.main.temp;
    
    // Update city name and date
    document.getElementById('cityName').textContent = data.name + ', ' + data.sys.country;
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Update weather icon and description
    const iconCode = data.weather[0].icon;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById('weatherDescription').textContent = data.weather[0].description;
    
    // Update temperature (based on current unit)
    const tempElement = document.getElementById('temperature');
    if (isCelsius) {
        tempElement.textContent = Math.round(data.main.temp) + '°';
        unitToggle.textContent = '°C';
    } else {
        const tempF = (data.main.temp * 9/5) + 32;
        tempElement.textContent = Math.round(tempF) + '°';
        unitToggle.textContent = '°F';
    }
    
    // Update 'Feels like' with data-attribute for conversion
    const feelsLikeElement = document.getElementById('feelsLike');
    feelsLikeElement.dataset.feelsLikeC = data.main.feels_like; // Store C value
    
    let feelsLikeText = Math.round(data.main.feels_like);
    let feelsLikeUnit = '°C';

    if (!isCelsius) {
        feelsLikeText = Math.round((data.main.feels_like * 9/5) + 32);
        feelsLikeUnit = '°F';
    }
    
    feelsLikeElement.textContent = `Feels like ${feelsLikeText}${feelsLikeUnit}`;
    
    // Update other weather details
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('windSpeed').textContent = data.wind.speed + ' m/s';
    document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
    
    // Check for extreme temperature and show alert
    if (data.main.temp > 40) {
        showWeatherAlert('⚠️ Extreme Heat Warning! Temperature is very high. Stay hydrated and avoid direct sunlight.');
    } else if (data.main.temp < 0) {
        showWeatherAlert('❄️ Freezing Temperature Alert! Dress warmly and be cautious of icy conditions.');
    } else {
        hideWeatherAlert();
    }
    
    // Change background based on weather condition
    changeBackgroundByWeather(data.weather[0].main);
}

// Function to display 5-day forecast
function displayForecast(data) {
    forecastSection.classList.remove('hidden');
    const forecastCards = document.getElementById('forecastCards');
    forecastCards.innerHTML = '';
    
    // Get one forecast per day 
    const dailyForecasts = [];
    
    // The OpenWeatherMap /forecast endpoint returns the forecast in a 'list' property
    const forecastList = data.list; 

    for (let i = 0; i < forecastList.length; i++) {
        const forecast = forecastList[i];
        const date = new Date(forecast.dt * 1000);
        const hour = date.getHours();
        
        // Get forecast at 12:00 PM
        if (hour >= 11 && hour <= 13) {
            dailyForecasts.push(forecast);
            if (dailyForecasts.length === 5) break;
        }
    }
    
    // Create forecast cards
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Convert temperature based on current unit
        let tempValue = forecast.main.temp;
        let tempUnit = '°C';
        
        if (!isCelsius) {
            tempValue = (tempValue * 9/5) + 32;
            tempUnit = '°F';
        }

        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-lg p-4 text-center';
        card.innerHTML = `
            <p class="font-bold text-gray-800 mb-2">${dayName}</p>
            <p class="text-sm text-gray-600 mb-2">${dateStr}</p>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" 
                 alt="Weather Icon" 
                 class="w-16 h-16 mx-auto mb-2">
            <p class="text-sm text-gray-700 capitalize mb-2">${forecast.weather[0].description}</p>
            <p class="text-2xl font-bold text-gray-800 mb-2">🌡️ ${Math.round(tempValue)}${tempUnit}</p>
            <p class="text-sm text-gray-600">💧 ${forecast.main.humidity}%</p>
            <p class="text-sm text-gray-600">💨 ${forecast.wind.speed} m/s</p>
        `;
        forecastCards.appendChild(card);
    });
}

// Function to show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    currentWeather.classList.add('hidden');
    forecastSection.classList.add('hidden');
}

// Function to hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// Function to show weather alert
function showWeatherAlert(message) {
    const alertBox = document.getElementById('weatherAlert');
    alertBox.textContent = message;
    alertBox.classList.remove('hidden');
}

// Function to hide weather alert
function hideWeatherAlert() {
    document.getElementById('weatherAlert').classList.add('hidden');
}

// Function to change background based on weather
function changeBackgroundByWeather(weather) {
    const body = document.body;
    // Remove all weather classes
    body.className = 'min-h-screen transition-colors duration-500';
    
    // Add appropriate class based on weather
    const weatherLower = weather.toLowerCase();
    if (weatherLower.includes('rain') || weatherLower.includes('drizzle')) {
        body.classList.add('rainy');
    } else if (weatherLower.includes('cloud')) {
        body.classList.add('cloudy');
    } else if (weatherLower.includes('clear')) {
        body.classList.add('clear');
    } else if (weatherLower.includes('snow')) {
        body.classList.add('snow');
    } else {
        body.classList.add('sunny');
    }
}

// Function to save city to recent searches
function saveToRecentSearches(city) {
    // Get existing searches from localStorage
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    
    // Check if city already exists (case insensitive)
    const cityLower = city.toLowerCase();
    recentSearches = recentSearches.filter(c => c.toLowerCase() !== cityLower);
    
    // Add new city to the beginning
    recentSearches.unshift(city);
    
    // Keep only last 5 searches
    if (recentSearches.length > 5) {
        recentSearches = recentSearches.slice(0, 5);
    }
    
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    
    // Update dropdown
    updateRecentSearchesDropdown();
}

// Function to update recent searches dropdown
function updateRecentSearchesDropdown() {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    
    if (recentSearches.length > 0) {
        recentSearchesContainer.classList.remove('hidden');
        recentSearchesSelect.innerHTML = '<option value="">Select a recent city...</option>';
        
        recentSearches.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            recentSearchesSelect.appendChild(option);
        });
    } else {
        recentSearchesContainer.classList.add('hidden');
    }
}

// Load recent searches when page loads
window.addEventListener('load', function() {
    updateRecentSearchesDropdown();
});