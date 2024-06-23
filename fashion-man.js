document.getElementById('weatherButton').addEventListener('click', getWeather);
document.getElementById('locationButton').addEventListener('click', getWeatherForLocation);
document.getElementById('refreshButton').addEventListener('click', refreshWeather); // Add event listener for refresh button

function initAutocomplete() {
    const input = document.getElementById('locationInput');
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.setFields(['geometry']);
}

function getWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            const apiKey = 'b6b5d04b0246ab914442d994e8d0b745';
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log(data); // Log the data to the console
                const temperature = data.main.temp;
                const recommendation = getRecommendation(temperature);
                document.getElementById('weatherText').textContent = `It's ${temperature} degrees, ${recommendation.text}`;
                document.getElementById('iconContainer').innerHTML = recommendation.icon;
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
    const input = document.getElementById('locationInput');
    const location = input.value;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': location }, async function (results, status) {
        if (status === 'OK') {
            const latitude = results[0].geometry.location.lat();
            const longitude = results[0].geometry.location.lng();
            const apiKey = 'b6b5d04b0246ab914442d994e8d0b745';
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log(data); // Log the data to the console
                const temperature = data.main.temp;
                const recommendation = getRecommendation(temperature);
                document.getElementById('weatherText').textContent = `It's ${temperature} degrees, ${recommendation.text}`;
                document.getElementById('iconContainer').innerHTML = recommendation.icon;
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
    // Call the appropriate function based on the current input or location
    if (document.getElementById('locationInput').value !== '') {
        getWeatherForLocation();
    } else {
        getWeather();
    }
}

function getRecommendation(temp) {
    if (temp < 50) {
        return { 
            text: 'you should wear a heavy coat, scarf, and gloves.', 
            icon: '<i class="fas fa-coat weather-icon"></i><i class="fas fa-scarf weather-icon"></i><i class="fas fa-gloves weather-icon"></i>'
        };
    } else if (temp < 60) {
        return { 
            text: 'you should wear a light jacket and jeans.', 
            icon: '<i class="fas fa-jacket weather-icon"></i><i class="fas fa-jeans weather-icon"></i>'
        };
    } else if (temp < 70) {
        return { 
            text: 'you should wear a long-sleeve shirt and jeans.', 
            icon: '<i class="fas fa-shirt-long weather-icon"></i><i class="fas fa-jeans weather-icon"></i>'
        };
    } else {
        return { 
            text: 'you should wear a t-shirt and shorts.', 
            icon: '<i class="fas fa-tshirt weather-icon"></i><i class="fas fa-shorts weather-icon"></i>'
        };
    }
}

// Initialize the autocomplete when the page loads
window.onload = initAutocomplete;
