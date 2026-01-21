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


window.onload = () => {
    getWeatherData('Warszawa');
    initMoodChart();
    disableMoodButtons(); 
    renderFavorites();}
   