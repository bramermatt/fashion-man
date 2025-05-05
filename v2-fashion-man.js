document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
  
    const weatherButton = document.getElementById('weatherButton');
    weatherButton.addEventListener('click', getWeather);
});
  
async function getWeather() {
    console.log('getWeather function called');
  
    document.getElementById('weatherText').textContent = 'Loading weather data...';
    document.getElementById('outfitRecommendation').textContent = '';
    document.getElementById('weatherResult').classList.remove('hidden');
    document.getElementById('hourlyForecast').classList.add('hidden'); // Keep hourly forecast hidden initially

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchWeatherData, () => {
            document.getElementById('weatherText').textContent = 'Unable to retrieve your location.';
        });
    } else {
        document.getElementById('weatherText').textContent = 'Geolocation is not supported by this browser.';
    }
}
  
async function fetchWeatherData(position) {
    const { latitude, longitude } = position.coords;
    const apiKey = 'b6b5d04b0246ab914442d994e8d0b745';
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&cnt=12&appid=${apiKey}`;
  
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        displayWeather(data);
        displayHourlyForecast(data);  // Display hourly breakdown
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('weatherText').textContent = 'Sorry, there was an error getting the weather data.';
    }
}

function displayWeather(data) {
    const currentWeather = data.list[0];
    const currentTemp = Math.round(currentWeather.main.temp);
    const currentCondition = currentWeather.weather[0].description;
    const currentIcon = getWeatherIcon(currentWeather.weather[0].main);
  
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const currentTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  
    document.getElementById('weatherText').innerHTML = `
      ${currentDay}, ${currentDate} ${currentTime}<br>
      ${currentIcon} ${currentTemp}°F - ${currentCondition}
    `;
  
    const outfitRecommendation = getRecommendation(currentTemp);
    document.getElementById('outfitRecommendation').innerHTML = `
      ${outfitRecommendation.icon} ${outfitRecommendation.text}
    `;
  
    document.getElementById('weatherResult').classList.remove('hidden');
}

function displayHourlyForecast(data) {
    const hourlyContent = document.getElementById('hourlyContent');
    hourlyContent.innerHTML = '';  // Clear any previous hourly content
  
    // Loop through the hourly data (next 12 hours)
    data.list.slice(0, 12).forEach(hourData => {
        const hour = new Date(hourData.dt * 1000);  // Convert timestamp to Date object
        const hourText = hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });  // Hourly format (HH:mm)
        const temp = Math.round(hourData.main.temp);
        const condition = hourData.weather[0].description;
        const icon = getWeatherIcon(hourData.weather[0].main);

        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');
        hourlyItem.innerHTML = `
            <div class="hourly-time">${hourText}</div>
            <div class="hourly-icon">${icon}</div>
            <div class="hourly-temp">${temp}°F</div>
            <div class="hourly-condition">${condition}</div>
            <div class="hourly-outfit">${getRecommendation(temp).icon} ${getRecommendation(temp).text}</div>
        `;
        hourlyContent.appendChild(hourlyItem);
    });

    // Show the hourly forecast after data is loaded
    document.getElementById('hourlyForecast').classList.remove('hidden');
}

function getRecommendation(temp) {
    if (temp < 50) {
        return {
            text: 'You should wear a heavy coat, scarf, and gloves.',
            icon: '<i class="fas fa-person-booth weather-icon"></i> <i class="fas fa-scarf weather-icon"></i> <i class="fas fa-mitten weather-icon"></i>'
        };
    } else if (temp < 60) {
        return {
            text: 'You should wear a light jacket and jeans.',
            icon: '<i class="fas fa-jacket weather-icon"></i> <i class="fas fa-jeans weather-icon"></i>'
        };
    } else if (temp < 70) {
        return {
            text: 'You should wear a long-sleeve shirt and jeans.',
            icon: '<i class="fas fa-shirt-long-sleeve weather-icon"></i> <i class="fas fa-jeans weather-icon"></i>'
        };
    } else if (temp < 80) {
        return {
            text: 'You should wear a t-shirt, shorts, and a hat.',
            icon: '<i class="fas fa-tshirt weather-icon"></i> <i class="fas fa-shorts weather-icon"></i> <i class="fas fa-hat-cowboy weather-icon"></i>'
        };
    } else {
        return {
            text: 'You should wear a t-shirt and shorts.',
            icon: '<i class="fas fa-tshirt weather-icon"></i> <i class="fas fa-shorts weather-icon"></i>'
        };
    }
}

function getWeatherIcon(weatherMain) {
    switch (weatherMain) {
        case 'Thunderstorm':
            return '<i class="fas fa-bolt weather-icon"></i>';
        case 'Drizzle':
            return '<i class="fas fa-cloud-rain weather-icon"></i>';
        case 'Rain':
            return '<i class="fas fa-cloud-showers-heavy weather-icon"></i>';
        case 'Snow':
            return '<i class="fas fa-snowflake weather-icon"></i>';
        case 'Mist':
        case 'Smoke':
        case 'Haze':
        case 'Dust':
        case 'Fog':
        case 'Sand':
        case 'Ash':
        case 'Squall':
        case 'Tornado':
            return '<i class="fas fa-smog weather-icon"></i>';
        case 'Clear':
            return '<i class="fas fa-sun weather-icon"></i>';
        case 'Clouds':
            return '<i class="fas fa-cloud weather-icon"></i>';
        default:
            return '<i class="fas fa-question-circle weather-icon"></i>';
    }
}
