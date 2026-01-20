const API_KEY = '25ec1e50addf6cf00e0e1dffe1b3b192';
let currentUnit = 'metric'; 
let tempChart, moodChart;

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const geoBtn = document.getElementById('geo-btn');
const unitCheckbox = document.getElementById('unit-checkbox');
const favBtn = document.getElementById('fav-btn');

// Pobieranie z api

async function getWeatherData(query, isCoords = false) {
    const type = isCoords ? `lat=${query.lat}&lon=${query.lon}` : `q=${query}`;
    const url = `https://api.openweathermap.org/data/2.5/weather?${type}&units=${currentUnit}&appid=${API_KEY}&lang=pl`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?${type}&units=${currentUnit}&appid=${API_KEY}&lang=pl`;

    try {
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(url),
            fetch(forecastUrl)
        ]);
        
        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        if (weatherRes.ok) {
            updateUI(weatherData);
            updateForecast(forecastData);
            initTempChart(forecastData);
            saveRecentSearch(weatherData.name);
            predictMood(forecastData); 
        } else {
            alert("Nie znaleziono miasta!");
        }
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
    }
}

//Update godziny na terazniejsza

function updateLocalTime(timezoneOffset) {
    const dateElement = document.getElementById('date');
    const tick = () => {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const cityDate = new Date(utc + (1000 * timezoneOffset));

        const options = { 
            weekday: 'long', 
            hour: '2-digit', 
            minute: '2-digit',
            day: 'numeric',
            month: 'long'
        };

        dateElement.innerText = cityDate.toLocaleDateString('pl-PL', options);
    };
    if (window.timeTicker) clearInterval(window.timeTicker);
    tick(); // Wywołaj od razu
    window.timeTicker = setInterval(tick, 60000);
}

function updateUI(data) {
    document.getElementById('city-name').innerText = data.name;
    document.getElementById('temperature').innerText = Math.round(data.main.temp);
    document.getElementById('description').innerText = data.weather[0].description;
    document.getElementById('humidity').innerText = `${data.main.humidity}%`;
    document.getElementById('wind-speed').innerText = `${data.wind.speed} km/h`;
    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    const unitDisplay = document.querySelector('.weather-display .unit');
    if (unitDisplay) {
        unitDisplay.innerText = unitSymbol;
    }
    const iconCode = data.weather[0].icon;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    updateLocalTime(data.timezone);
    updateUI: updateBackground(data.weather[0].main, data.sys.sunrise, data.sys.sunset);
    updateFavIcon(data.name);
    renderFavorites();
}

// Inne tło aplikacji, które zależy od tego, jaka jest pogoda
function updateBackground(condition,sunrise,sunset) {
    const body = document.body;
    body.className = ''; 
    const currentTime = Math.floor(Date.now() / 1000); // Czas w sekundach (Unix)

    const isNight = currentTime < sunrise || currentTime > sunset;
    if (isNight) {
        body.classList.add('bg-night');
    } else {
        switch (condition.toLowerCase()) {
            case 'clouds': body.classList.add('bg-cloudy'); break;
            case 'rain': body.classList.add('bg-rainy'); break;
            case 'clear': body.classList.add('bg-sunny'); break;
            default: body.classList.add('bg-default');
        }
    }
}

//ostatnie 5 wyszukiwan
const toggleRecentBtn = document.getElementById('toggle-recent-menu');
const recentMenuContent = document.getElementById('recent-menu-content');
const recentListContainer = document.getElementById('recent-list');
toggleRecentBtn.addEventListener('click', () => {
    toggleRecentBtn.classList.toggle('active');
    recentMenuContent.classList.toggle('show');
});
function saveRecentSearch(cityName) {
    let recent = JSON.parse(localStorage.getItem('recentSearches')) || [];
    recent = recent.filter(city => city.toLowerCase() !== cityName.toLowerCase());
    recent.unshift(cityName);
    if (recent.length > 5) {
        recent = recent.slice(0, 5);
    }

    localStorage.setItem('recentSearches', JSON.stringify(recent));
    renderRecent();
}

    function renderRecent() {
    const recent = JSON.parse(localStorage.getItem('recentSearches')) || [];
    recentListContainer.innerHTML = '';

    if (recent.length === 0) {
        recentListContainer.innerHTML = '<p>Brak ostatnich wyszukiwań</p>';
        return;
    }

    recent.forEach(city => {
        const chip = document.createElement('div');
        chip.className = 'city-chip';
        chip.innerHTML = `<span class="city-name-link">${city}</span>`;
        chip.addEventListener('click', () => {
            getWeatherData(city);
            recentMenuContent.classList.remove('show');
            toggleRecentBtn.classList.remove('active');
        });

        recentListContainer.appendChild(chip);
    });
}

//dodawanie miast do ulubionych
const favListContainer = document.getElementById('fav-list');
function updateFavIcon(cityName) {
    let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    const icon = favBtn.querySelector('i');
    
    if (favorites.includes(cityName)) {
        icon.classList.replace('fa-regular', 'fa-solid'); // Pełne serce
        icon.style.color = '#ff4d4d';
    } else {
        icon.classList.replace('fa-solid', 'fa-regular'); // Puste serce
        icon.style.color = '#fff';
    }
}

favBtn.addEventListener('click', () => {
    const cityName = document.getElementById('city-name').innerText;
    let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

    if (favorites.includes(cityName)) {
        favorites = favorites.filter(fav => fav !== cityName);
    } else {
        favorites.push(cityName);
    }

    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    updateFavIcon(cityName);
    renderFavorites();
});

const toggleFavBtn = document.getElementById('toggle-fav-menu');
const favMenuContent = document.getElementById('fav-menu-content');
toggleFavBtn.addEventListener('click', () => {
    toggleFavBtn.classList.toggle('active');
    favMenuContent.classList.toggle('show');
});

function renderFavorites() {
    const favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    const favListContainer = document.getElementById('fav-list');
    favListContainer.innerHTML = '';
    if (favorites.length === 0) {
        favListContainer.innerHTML = '<p>Brak ulubionych miast</p>';
        return;
    }

    favorites.forEach(city => {
        const chip = document.createElement('div');
        chip.className = 'city-chip';
        chip.innerHTML = `
            <span class="city-name-link">${city}</span>
            <i class="fa-solid fa-xmark remove-fav" data-city="${city}"></i>
        `;
        chip.querySelector('.city-name-link').addEventListener('click', () => {
            getWeatherData(city);
            favMenuContent.classList.remove('show');
            toggleFavBtn.classList.remove('active');
        }
    );
        chip.querySelector('.remove-fav').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavorite(city);
        }
    );

        favListContainer.appendChild(chip);
    });
}
// Mood tracker

const moodButtons = document.querySelectorAll('.mood-btn');

moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const today = new Date().toLocaleDateString();
        let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
        const alreadySubmitted = history.find(entry => entry.date === today);

        if (alreadySubmitted) {
            alert("Nastrój już został dziś wprowadzony.");
            return; 
        }
        const moodValue = btn.getAttribute('data-mood');
        const cityName = document.getElementById('city-name').innerText;
        const temp = document.getElementById('temperature').innerText;
        
        const entry = {
            date: today,
            mood: parseInt(moodValue),
            temp: parseInt(temp),
            city: cityName
        };

        history.push(entry);
        localStorage.setItem('moodHistory', JSON.stringify(history));
        alert("Humor zapisany!");
        initMoodChart(); 
        disableMoodButtons(); 
    });
});


function disableMoodButtons() {
    const today = new Date().toLocaleDateString();
    let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const alreadySubmitted = history.find(entry => entry.date === today);

    if (alreadySubmitted) {
        moodButtons.forEach(btn => {
            btn.style.opacity = "0.5";
            btn.style.cursor = "not-allowed";
            btn.title = "Dzisiejszy humor został już zapisany";
        });
    }
}

window.onload = () => {
    getWeatherData('Warszawa');
    initMoodChart();
    disableMoodButtons(); 
    renderFavorites();}
   
// Wykresy

function initTempChart(forecastData) {
    const ctx = document.getElementById('tempChart').getContext('2d');
    if (tempChart) tempChart.destroy();
    const hours = forecastData.list.slice(0, 8).map(item => item.dt_txt.split(' ')[1].slice(0, 5));
    const temps = forecastData.list.slice(0, 8).map(item => item.main.temp);

    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Temperatura (°C)',
                data: temps,
                borderColor: '#fff',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }]
        },
        options: { responsive: true, scales: { y: { display: false }, x: { ticks: { color: '#fff' } } } }
    });
}

function initMoodChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');
    const history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    if (moodChart) moodChart.destroy();

    moodChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: history.map(h => h.date).slice(-7), 
            datasets: [{
                label: 'Twój Humor (1-5)',
                data: history.map(h => h.mood).slice(-7),
                backgroundColor: '#ffd700'
            }]
        }
    });
}

// Mood prediction - funkcje do 'przewidywania' nastroju klienta w oparciu o wcześniejsze dane (tzn. nastrój powiązany z pogodą)

function predictMood(forecastData) {
    const history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const predictionEl = document.querySelector('#mood-prediction span');
    
    if (history.length < 3) {
        predictionEl.innerText = "Potrzebuję więcej danych (min. 3 dni)";
        return;
    }

    const tomorrowTemp = forecastData.list[8].main.temp; 
    const similarDays = history.filter(h => Math.abs(h.temp - tomorrowTemp) < 3);
    
    if (similarDays.length > 0) {
        const avgMood = similarDays.reduce((acc, curr) => acc + curr.mood, 0) / similarDays.length;
        predictionEl.innerText = avgMood > 3 ? "Będzie dobrze!" : "Możesz czuć się sennie";
    } else {
        predictionEl.innerText = "Nie wiem, mam za mało danych!";
    }
}

// Eventy

searchBtn.addEventListener('click', () => {
    if (cityInput.value) getWeatherData(cityInput.value);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cityInput.value) getWeatherData(cityInput.value);
});

geoBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(pos => {
        getWeatherData({ lat: pos.coords.latitude, lon: pos.coords.longitude }, true);
    });
});

unitCheckbox.addEventListener('change', () => {
    currentUnit = unitCheckbox.checked ? 'imperial' : 'metric';
    const currentCity = document.getElementById('city-name').innerText;
    getWeatherData(currentCity);
});


window.onload = () => {
    getWeatherData('Warszawa');
    initMoodChart();
};

function updateForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = ''; 
    const dailyData = forecastData.list.filter(reading => reading.dt_txt.includes("12:00:00"));

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('pl-PL', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const icon = day.weather[0].icon;
        const desc = day.weather[0].description;

        const forecastCard = `
            <div class="forecast-card">
                <p class="forecast-day">${dayName}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
                <p class="forecast-temp">${temp}°</p>
                <p class="forecast-desc">${desc}</p>
            </div>
        `;
        forecastContainer.insertAdjacentHTML('beforeend', forecastCard);
    });
}

