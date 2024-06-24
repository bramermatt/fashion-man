document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    document.getElementById('weatherButton').addEventListener('click', () => {
        console.log('Weather button clicked');
        getWeather();
    });
    document.getElementById('locationButton').addEventListener('click', () => {
        console.log('Location button clicked');
        getWeatherForLocation();
    });
    document.getElementById('refreshButton').addEventListener('click', () => {
        console.log('Refresh button clicked');
        refreshWeather();
    });
    document.getElementById('tenDayButton').addEventListener('click', () => {
        console.log('Ten-day button clicked');
        getTenDayForecast();
    });
    document.getElementById('clearButton').addEventListener('click', () => {
        console.log('Clear button clicked');
        clearScreen();
    });
});

function initAutocomplete() {
    const input = document.getElementById('locationInput');
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.setFields(['geometry']);
}

function getWeather() {
    console.log('getWeather function called');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            const apiKey = 'b6b5d04b0246ab914442d994e8d0b745';
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log(data); // Log the data to the console
                displayWeather(data, 7); // Display 7 days by default
            } catch (error) {
                console.error('Error fetching weather data:', error);
                document.getElementById('weatherText').textContent = 'Sorry, there was an error getting the weather data.';
            }
        }, () => {
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
    geocoder.geocode({ 'address': location }, async function (results, status) {
        if (status === 'OK') {
            const latitude = results[0].geometry.location.lat();
            const longitude = results[0].geometry.location.lng();
            const apiKey = 'b6b5d04b0246ab914442d994e8d0b745';
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log(data); // Log the data to the console
                displayWeather(data, 7); // Display 7 days by default
            } catch (error) {
                console.error('Error fetching weather data:', error);
                document.getElementById('weatherText').textContent = 'Sorry, there was an error getting the weather data.';
            }
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function refreshWeather() {
    console.log('refreshWeather function called');
    // Call the appropriate function based on the current input or location
    if (document.getElementById('locationInput').value !== '') {
        getWeatherForLocation();
    } else {
        getWeather();
    }
}

function getTenDayForecast() {
    console.log('getTenDayForecast function called');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            const apiKey = 'b6b5d04b0246ab914442d994e8d0b745';
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log(data); // Log the data to the console
                displayWeather(data, 10); // Display 10 days
            } catch (error) {
                console.error('Error fetching weather data:', error);
                document.getElementById('weatherText').textContent = 'Sorry, there was an error getting the weather data.';
            }
        }, () => {
            document.getElementById('weatherText').textContent = 'Unable to retrieve your location.';
        });
    } else {
        document.getElementById('weatherText').textContent = 'Geolocation is not supported by this browser.';
    }
}

function clearScreen() {
    console.log('clearScreen function called');
    document.getElementById('weatherContainer').innerHTML = '';
    document.getElementById('weatherText').textContent = '';
    document.getElementById('iconContainer').innerHTML = '';
}

function displayWeather(data, days) {
    console.log('displayWeather function called with days:', days);
    const weatherContainer = document.getElementById('weatherContainer');
    weatherContainer.innerHTML = ''; // Clear previous content

    const forecast = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, days);
    
    forecast.forEach(item => {
        const date = new Date(item.dt_txt).toLocaleDateString();
        const temp = Math.round(item.main.temp); // Round the temperature to the nearest whole number
        const weatherCondition = item.weather[0].description;
        const recommendation = getRecommendation(temp);
        const weatherIcon = getWeatherIcon(item.weather[0].main); // Get the Font Awesome icon based on weather condition
        const clothingOptions = getClothingOptions(item.weather[0].main); // Get clothing options based on weather condition
        const weatherItem = document.createElement('div');
        weatherItem.className = 'weather-item';

        weatherItem.innerHTML = `

        <div class="weather-container">
            <h2>${date}</h2>
            <div class="weather-container-text">
                <h3>${temp}°F</h3>    
                <h3>${weatherCondition}</h3>
 
            </div>
        </div>

        <div class="response-container">
            <p>${recommendation.text}</p>
            <div class="response-icons">${clothingOptions} ${recommendation.icon}</div>
        </div>
        `;

        weatherContainer.appendChild(weatherItem);
    });
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
            return '<i class="fas fa-sun weather-icon"></i><i class="fas fa-sunglasses weather-icon"></i>';
        case 'Clouds':
            return '<i class="fas fa-cloud weather-icon"></i>';
        default:
            return '<i class="fas fa-question-circle weather-icon"></i>';
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

// Initialize the autocomplete when the page loads
window.onload = initAutocomplete;
