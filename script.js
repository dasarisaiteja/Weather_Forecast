// API key from OpenWeatherMap
const apiKey = "69e77be11aab1f328c9f1023e95796be";

// Get the button element
const button = document.querySelector("#search_btn");

// Add click event listener to the button
button.addEventListener("click", ()=> {
    // Get the city name from the input field
    const city = document.querySelector("#city_name").value;

    if (city === "") {
        alert("Please enter a city name");
        return;
    }

    // Call the function to get weather
    getWeather(city);
    city.value=""
});

// Function to get weather data
async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 200) {
            showWeather(data);
        } else {
            // Error handling for city not found
            document.querySelector("#today_weather").innerHTML = "<h2>Today's Weather</h2><p>City not found. Please try again.</p>";
        }
    } catch (error) {
        console.error("Fetch error: ", error); // Use console.error for errors
    }
}
// Function to show weather on the page
function showWeather(data) {
    const container = document.querySelector("#today_weather");

    container.innerHTML = "<h2>Today's Weather</h2>" +
        "<p><strong>City:</strong> " + data.name + "</p>" +
        "<p><strong>Temperature:</strong> " + data.main.temp + " °C</p>" +
        "<p><strong>Weather:</strong> " + data.weather[0].description + "</p>" +
        "<p><strong>Humidity:</strong> " + data.main.humidity + "%</p>";
}
