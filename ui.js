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
    
    const windSymbol = currentUnit === 'metric' ? 'km/h' : 'mph';
    document.getElementById('wind-speed').innerText = `${data.wind.speed} ${windSymbol}`;
    
    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    const unitDisplay = document.querySelector('.weather-display .unit');
    if (unitDisplay) {
        unitDisplay.innerText = unitSymbol;
    }
    
    const iconCode = data.weather[0].icon;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    updateLocalTime(data.timezone);
    updateBackground(data.weather[0].main, data.sys.sunrise, data.sys.sunset);
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
