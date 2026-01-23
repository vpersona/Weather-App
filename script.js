//Przycisk wyszukania 
searchBtn.addEventListener('click', () => {
    if (cityInput.value) getWeatherData(cityInput.value);
});

//Po naciśnięciu enter aplikacja wczytuje dane pogody
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cityInput.value) getWeatherData(cityInput.value);
});

//Odczyt własnej lokalizacji po wciśnięciu ikonki lokalizaji (GPS)
geoBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(pos => {
        getWeatherData({ lat: pos.coords.latitude, lon: pos.coords.longitude }, true);
    });
});

//Zmiana jednostki na °C lub na °F, odświeżenie danych - musimy ponownie je pobrać z API
unitCheckbox.addEventListener('change', () => {
    currentUnit = unitCheckbox.checked ? 'imperial' : 'metric';
    const currentCity = document.getElementById('city-name').innerText;
    getWeatherData(currentCity);
});

//obsługa dodawania miast do ulubionych
favBtn.addEventListener('click', () => {
    const cityName = document.getElementById('city-name').innerText;
    let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

    if (favorites.includes(cityName)) {
        favorites = favorites.filter(fav => fav !== cityName);
    } else {
        favorites.push(cityName);
    }

    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    updateFavIcon(cityName); //Zmiana koloru serduszka po dodaniu miasta do listy ulubionych
    renderFavorites();
});

const moodButtons = document.querySelectorAll('.mood-btn');
//Obsługa przycisków z nastrojem, zapis do lacalStorage
moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const today = new Date().toLocaleDateString();
        let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
        const alreadySubmitted = history.find(entry => entry.date === today);

        if (alreadySubmitted) {
            alert("Nastrój już został dziś wprowadzony.");
            return; //Blokada duplikatów, nie da się wprowadzić humoru więcej, niż raz dziennie
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

//Załadowanie okna 
window.onload = () => {
    getWeatherData('Warszawa'); //Domyślne miasto
    initMoodChart();
    disableMoodButtons(); 
    renderFavorites();
    }
   