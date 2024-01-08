const apiKey = '4279676e2edcd6a6fc6d79e7c22e7416'; // Use your actual API key

document.getElementById('search-button').addEventListener('click', function() {
    const city = document.getElementById('city-input').value.trim();
    if (city && !isCityInHistory(city)) {
        fetchWeatherData(city);
        addCityToHistory(city);
    }
});

function fetchWeatherData(city) {
    const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    fetch(geocodingUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if(data && data.length > 0) {
                const { lat, lon } = data[0];
                fetchForecast(lat, lon);
            } else {
                console.log("No location found.");
                alert("No location found. Please try another city.");
            }
        })
        .catch(error => {
            console.error("Error fetching coordinates:", error);
            alert("Error fetching coordinates. Please try again.");
        });
}

function fetchForecast(lat, lon) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            updateWeatherDisplay(data);
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            alert("Error fetching weather data. Please try again.");
        });
}

function updateWeatherDisplay(weatherData) {
    const currentWeatherDiv = document.getElementById('current-weather');
    const forecastCardsDiv = document.getElementById('forecast-cards');

    currentWeatherDiv.innerHTML = '';
    forecastCardsDiv.innerHTML = '';

    const currentWeather = weatherData.list[0];
    const currentWeatherContent = `
        <h2>${weatherData.city.name} (${new Date(currentWeather.dt_txt).toLocaleDateString()})</h2>
        <p>Temp: ${currentWeather.main.temp}°C</p>
        <p>Wind: ${currentWeather.wind.speed} m/s</p>
        <p>Humidity: ${currentWeather.main.humidity}%</p>
    `;
    currentWeatherDiv.innerHTML = currentWeatherContent;

    for (let i = 0; i < weatherData.list.length; i += 8) {
        const forecast = weatherData.list[i];
        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        const forecastCardContent = `
            <h4>${new Date(forecast.dt_txt).toLocaleDateString()}</h4>
            <p>Temp: ${forecast.main.temp}°C</p>
            <p>Wind: ${forecast.wind.speed} m/s</p>
            <p>Humidity: ${forecast.main.humidity}%</p>
        `;
        forecastCard.innerHTML = forecastCardContent;
        forecastCardsDiv.appendChild(forecastCard);
    }

    const weatherCondition = weatherData.list[0].weather[0].main;
    applyWeatherGradient(weatherCondition);
}

function applyWeatherGradient(condition) {
    const body = document.body;
    let gradient = "linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)"; // Default clear sky

    switch (condition) {
        case 'Clouds':
            gradient = "linear-gradient(120deg, #d3d3d3 0%, #c4c4c4 100%)";
            break;
        case 'Rain':
        case 'Drizzle':
            gradient = "linear-gradient(120deg, #a4b0be 0%, #747d8c 100%)";
            break;
        case 'Thunderstorm':
            gradient = "linear-gradient(120deg, #373b44 0%, #4286f4 100%)";
            break;
        case 'Snow':
            gradient = "linear-gradient(120deg, #f7f7f7 0%, #cfd9df 100%)";
            break;
        // Add more cases as necessary
    }
    body.style.backgroundImage = gradient;
}

function isCityInHistory(city) {
    const historyContainer = document.getElementById('search-history');
    return Array.from(historyContainer.children).some(button => button.textContent.toLowerCase() === city.toLowerCase());
}

function addCityToHistory(city) {
    const historyContainer = document.getElementById('search-history');
    if(!isCityInHistory(city)){
        const cityButton = document.createElement('button');
        cityButton.textContent = city;
        cityButton.classList.add('city-button');
        cityButton.addEventListener('click', function() {
            fetchWeatherData(city);
        });
        historyContainer.appendChild(cityButton);
    }
}

function saveCityToLocalStorage(city) {
    localStorage.setItem('lastViewedCity', city);
    let cities = JSON.parse(localStorage.getItem('searchedCities')) || [];
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem('searchedCities', JSON.stringify(cities));
    }
}

function loadSearchHistory() {
    const cities = JSON.parse(localStorage.getItem('searchedCities')) || [];
    cities.forEach(city => addCityToHistory(city));
}

