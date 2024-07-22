document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    document.getElementById('weatherButton').addEventListener('click', getWeather);
    document.getElementById('locationButton').addEventListener('click', getWeatherForLocation);
    document.getElementById('refreshButton').addEventListener('click', refreshWeather);
    document.getElementById('clearButton').addEventListener('click', clearScreen);
});

function initAutocomplete() {
    const input = document.getElementById('locationInput');
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.setFields(['geometry']);
}

async function getWeather() {
    console.log('getWeather function called');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchWeatherData, () => {
            document.getElementById('weatherText').textContent = 'Unable to retrieve your location.';
        });
    } else {
        document.getElementById('weatherText').textContent = 'Geolocation is not supported by this browser.';
    }
}

async function getWeatherForLocation() {
    console.log('getWeatherForLocation function called');
    const input = document.getElementById('locationInput');
    const location = input.value;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': location }, (results, status) => {
        if (status === 'OK') {
            const latitude = results[0].geometry.location.lat();
            const longitude = results[0].geometry.location.lng();
            fetchWeatherData({ coords: { latitude, longitude } });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

async function fetchWeatherData(position) {
    const { latitude, longitude } = position.coords;
    const apiKey = 'b6b5d04b0246ab914442d994e8d0b745';
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&cnt=16&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        displayWeather(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('weatherText').textContent = 'Sorry, there was an error getting the weather data.';
    }
}

function refreshWeather() {
    console.log('refreshWeather function called');
    if (document.getElementById('locationInput').value !== '') {
        getWeatherForLocation();
    } else {
        getWeather();
    }
}

function clearScreen() {
    console.log('clearScreen function called');
    document.getElementById('weatherContainer').innerHTML = '';
    document.getElementById('weatherText').textContent = '';
    document.getElementById('iconContainer').innerHTML = '';
}

function displayWeather(data) {
    const weatherContainer = document.getElementById('weatherContainer');
    weatherContainer.innerHTML = '';

    const cityName = data.city.name;

    // Current weather (first item in the list)
    const currentWeather = data.list[0];
    const currentTemp = Math.round(currentWeather.main.temp);
    const currentCondition = currentWeather.weather[0].description;
    const currentIcon = getWeatherIcon(currentWeather.weather[0].main);

    // Get current date and time
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const currentTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    // Add weather overview with current conditions
    const overviewContainer = document.createElement('div');
    overviewContainer.className = 'weather-overview';
    overviewContainer.innerHTML = `
    <div class="your-weather">
        <h2>Weather Overview for ${cityName}</h2>
        <div class="current-weather">
            <h3>Current Conditions</h3>
            <p>${currentDay}, ${currentDate} ${currentTime}</p>
            <p>${currentIcon} ${currentTemp}°F - ${currentCondition}</p>
        </div>
    </div>
    `;
    weatherContainer.appendChild(overviewContainer);

    // Group forecasts by day
    const forecastByDay = data.list.reduce((acc, forecast) => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(forecast);
        return acc;
    }, {});

    // Create forecast sections
    const forecastContainer = document.createElement('div');
    forecastContainer.className = 'forecast-box';

    Object.keys(forecastByDay).forEach(day => {
        const dayContainer = document.createElement('div');
        dayContainer.className = 'day-forecast';

        const dayDate = new Date(forecastByDay[day][0].dt * 1000);
        const dayHeader = document.createElement('h3');
        dayHeader.textContent = `${day} (${dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
        dayContainer.appendChild(dayHeader);

        const forecastList = document.createElement('ul');
        forecastList.className = 'forecast-list';

        forecastByDay[day].forEach((forecast, index) => {
            const date = new Date(forecast.dt * 1000);
            const temp = Math.round(forecast.main.temp);
            const condition = forecast.weather[0].description;
            const icon = getWeatherIcon(forecast.weather[0].main);
            const recommendation = getRecommendation(temp);

            const hourlyItem = document.createElement('li');
            hourlyItem.className = 'forecast-item';
            hourlyItem.innerHTML = `
                <span class="forecast-time">${(index === 0 && day === currentDay) ? 'Now' : date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</span>

                
                <div class="temp-condition">
                <span class="forecast-temp">${icon} ${temp}°F</span>
                <span class="forecast-condition">${condition}</span>
                </div>

                <span class="forecast-recommendation">${recommendation.icon} ${recommendation.text}</span>
            `;

            forecastList.appendChild(hourlyItem);
        });

        dayContainer.appendChild(forecastList);
        forecastContainer.appendChild(dayContainer);
    });

    weatherContainer.appendChild(forecastContainer);
}



function groupForecastByDay(forecastList) {
    return forecastList.reduce((groups, item) => {
        const date = item.dt_txt.split(' ')[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(item);
        return groups;
    }, {});
}

function getRecommendation(temp) {
    if (temp < 50) {
        return { 
            text: 'You should wear a heavy coat, scarf, and gloves.', 
            icon: '<i class="fas fa-coat weather-icon"></i><i class="fas fa-scarf weather-icon"></i><i class="fas fa-gloves weather-icon"></i>'
        };
    } else if (temp < 60) {
        return { 
            text: 'You should wear a light jacket and jeans.', 
            icon: '<i class="fas fa-jacket weather-icon"></i><i class="fas fa-jeans weather-icon"></i>'
        };
    } else if (temp < 70) {
        return { 
            text: 'You should wear a long-sleeve shirt and jeans.', 
            icon: '<i class="fas fa-shirt-long weather-icon"></i><i class="fas fa-jeans weather-icon"></i>'
        };
    } else if (temp < 80) {
        return { 
            text: 'You should wear a t-shirt, shorts, and a hat.', 
            icon: '<i class="fas fa-tshirt weather-icon"></i><i class="fas fa-shorts weather-icon"></i><i class="fas fa-hat-wizard weather-icon"></i>'
        };
    } else {
        return { 
            text: 'You should wear a t-shirt and shorts.', 
            icon: '<i class="fas fa-tshirt weather-icon"></i><i class="fas fa-shorts weather-icon"></i>'
        };
    }
}

function getClothingOptions(weatherMain) {
    switch (weatherMain) {
        case 'Thunderstorm':
            return '<i class="fas fa-umbrella weather-icon"></i><i class="fas fa-hat-cowboy weather-icon"></i>';
        case 'Drizzle':
            return '<i class="fas fa-umbrella weather-icon"></i>';
        case 'Rain':
            return '<i class="fas fa-umbrella weather-icon"></i><i class="fas fa-hat-cowboy weather-icon"></i>';
        case 'Snow':
            return '<i class="fas fa-snowflake weather-icon"></i><i class="fas fa-hat-winter weather-icon"></i>';
        case 'Mist':
        case 'Smoke':
        case 'Haze':
        case 'Dust':
        case 'Fog':
        case 'Sand':
        case 'Ash':
        case 'Squall':
        case 'Tornado':
            return '<i class="fas fa-hat-wizard weather-icon"></i><i class="fas fa-glasses weather-icon"></i>';
        case 'Clear':
            return '<i class="fas fa-sunglasses weather-icon"></i><i class="fas fa-hat-sun weather-icon"></i>';
        case 'Clouds':
            return '<i class="fas fa-hat-wizard weather-icon"></i>';
        default:
            return '';
    }
}

function getWeatherIcon(weatherMain) {
    switch (weatherMain) {
        case 'Thunderstorm':
            return '<i class="fas fa-bolt"></i>';
        case 'Drizzle':
            return '<i class="fas fa-cloud-rain"></i>';
        case 'Rain':
            return '<i class="fas fa-cloud-showers-heavy"></i>';
        case 'Snow':
            return '<i class="fas fa-snowflake"></i>';
        case 'Mist':
        case 'Smoke':
        case 'Haze':
        case 'Dust':
        case 'Fog':
        case 'Sand':
        case 'Ash':
        case 'Squall':
        case 'Tornado':
            return '<i class="fas fa-smog"></i>';
        case 'Clear':
            return '<i class="fas fa-sun"></i>';
        case 'Clouds':
            return '<i class="fas fa-cloud"></i>';
        default:
            return '';
    }
}

window.onload = initAutocomplete;