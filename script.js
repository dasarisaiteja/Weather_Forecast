// API key from OpenWeatherMap
const apiKey = "69e77be11aab1f328c9f1023e95796be";

// --- Global Element Selectors  ---
const button = document.querySelector("#search_btn");
const cityInput = document.querySelector("#city_name"); // Declare and assign the input element
const todayContainer = document.querySelector("#today_weather");
// Assuming your HTML uses #display_5days_data for the forecast
const forecastContainer = document.querySelector("#display_5days_data"); 

// Set count for the 5-day / 3-hour forecast (40 entries max)
const FORECAST_COUNT = 40; 

//current location button
const curlocbtn=document.querySelector("#current_location_btn");

// Get current location weather
curlocbtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Fetch weather by coordinates
                await getWeatherByCoords(lat, lon);
                await getForecastByCoords(lat, lon);
            },
            (error) => {
                alert("Geolocation error: " + error.message);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser");
    }
});

async function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === 200) {
            showWeather(data);
        } else {
            todayContainer.innerHTML = "<h2>Today's Weather</h2><p>Unable to get weather for current location.</p>";
        }
    } catch (error) {
        console.error("Error fetching current location weather: ", error);
        todayContainer.innerHTML = "<h2>Today's Weather</h2><p>Error fetching data.</p>";
    }
}

async function getForecastByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=${FORECAST_COUNT}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === "200") {
            showForecastWeather(data);
        } else {
            forecastContainer.innerHTML = "<h2>5-Day Forecast</h2><p>Unable to get forecast for current location.</p>";
        }
    } catch (error) {
        console.error("Error fetching forecast for current location: ", error);
        forecastContainer.innerHTML = "<h2>5-Day Forecast</h2><p>Error fetching data.</p>";
    }
}

// --- Event Listener ---

button.addEventListener("click", () => {
    // Get the city value
    const city = cityInput.value; 

    if (city === "") {
        alert("Please enter a city name");
        return;
    }

    // Call both functions
    getWeather(city);
    getForecastWeather(city); 

    // Correctly clear the input field using the declared cityInput element
    cityInput.value = "";
});

// --- Today's Weather Logic ---

async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 200) {
            showWeather(data);
        } else {
            todayContainer.innerHTML = "<h2>Today's Weather</h2><p>City not found. Please try again.</p>";
        }
    } catch (error) {
        console.error("Today's Weather Fetch error: ", error);
        todayContainer.innerHTML = "<h2>Today's Weather</h2><p>Error fetching data.</p>";
    }
}

function showWeather(data) {
    // Using global selector todayContainer
    todayContainer.innerHTML = `
        <h2>Today's Weather in ${data.name}</h2>
        <p><strong>Temperature:</strong> ${data.main.temp.toFixed(1)} °C</p>
        <p><strong>Weather:</strong> ${data.weather[0].description}</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
    `;
}

// --- 5-Day Forecast Logic  ---

// Renamed to reflect function, fixed API endpoint
async function getForecastWeather(city) {
    // Use the standard free-tier endpoint: /forecast
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&cnt=${FORECAST_COUNT}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        // The forecast API returns code "200" as a string for success
        if (data.cod === "200") { 
            showForecastWeather(data);
        } else {
            // Use the correct container and context
            forecastContainer.innerHTML = "<h2>5-Day Forecast</h2><p>Forecast data not found. Please try again.</p>";
        }
    } catch (error) {
        console.error("Forecast Fetch error: ", error);
        forecastContainer.innerHTML = "<h2>5-Day Forecast</h2><p>Error fetching data.</p>";
    }
}

// Renamed to match the fetch function
function showForecastWeather(data) {
    // Using global selector forecastContainer
    let html = "<h2>5-Day Forecast</h2><div class='forecast-grid'>";

    // Filter to get one data point per day (close to noon is standard practice)
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyForecasts.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        html += `
            <div class='day-card'>
                <h4>${day}</h4>
                <p>Temp: ${item.main.temp.toFixed(1)} °C</p>
                <p>Condition: ${item.weather[0].description}</p>
            </div>
        `;
    });

    html += "</div>";
    forecastContainer.innerHTML = html; // Using the globally declared element
}