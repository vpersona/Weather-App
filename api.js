//Pobieranie pogodowego api z OpenWeatherMap
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

        //Jeśli istnieje wpisane przez nas miasto, to pobieramy UI, pogodę, wykres temperatur. 
        if (weatherRes.ok) {
            updateUI(weatherData);
            updateForecast(forecastData);
            initTempChart(forecastData);
            saveRecentSearch(weatherData.name); //zapisanie wyszukanego mista w historii
            predictMood(forecastData); 
        } else {
            alert("Nie znaleziono miasta!");
        }
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
    }
}
//  **Funkcja, która 'przewiduje' twój możliwy jutrzejszy nastrój**
//1. Aplikacja zagląda do LocalStorage i sprawdza, czy mam przynajmniej 3 dni w których  zapisaliśmy humor.
//   Jeśli ma, idzie dalej, jeśli nie to mówi, że potrzebuje więcej czasu aby zebrać więcej danych
//2. Z danych z API aplikacja sprawdza jaka będzie jutro temperatura i jakie będzie niebo (czy np. będą chmury)
//3. Aplikacja przeszukuje historię i szuka dni, w których pogoda była podobna do jutrzejszej. W obliczeniach aplikacja używa marginesu
//   3°C. Przykładowo, jeśli jutro ma być 20°c to aplikacja szuka wszystkich dni z przeszłości gdy było między 17°c a 23°C
//4. Wyciąganie wniosków
//   Opcja A: Aplikacja znalazła odpowiednie dni --> wyciąga średnią ocene z humoru w tych dniach
//  Opcja B: Aplikacja nie znalazła odpowiednich dni (np. Jutro ma być 20° a w historii mamy same zimowe dni) --> Aplikacja patrzy
//           na twój ogólny humor (srednia ze wszystkich dni) i patrzy na opady (jeśli są, to aplikacja zakłada gorsze samopoczucie)
function predictMood(forecastData) {
    const history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const predictionEl = document.querySelector('#mood-prediction span');
    
    if (history.length < 3) {
        predictionEl.innerText = "Potrzebuję więcej danych (min. 3 dni)";
        return;
    }

    const tomorrow = forecastData.list[8];
    const tomorrowTemp = forecastData.list[8].main.temp; 
    const tomorrowWeather = tomorrow.weather[0].main; 
    const similarDays = history.filter(h => Math.abs(h.temp - tomorrowTemp) < 3);
    
   if (similarDays.length > 0) {
        // Opcja A
        const avgMood = similarDays.reduce((acc, curr) => acc + curr.mood, 0) / similarDays.length;
        predictionEl.innerText = avgMood >= 3.5 ? "Zapowiada się super dzień! ✨" : "Możesz mieć mniej energii. ☕";
    } else {
        // Opcja B
        const totalAvgMood = history.reduce((acc, curr) => acc + curr.mood, 0) / history.length;
        
        if (tomorrowWeather === 'Rain' || tomorrowWeather === 'Thunderstorm') {
            predictionEl.innerText = "Będzie padać, co może nieco obniżyć Twój humor. ☔";
        } else {
            //Ogólna średnia nastroju ze wszytkich danych
            predictionEl.innerText = totalAvgMood >= 3 ? "Powinno być całkiem nieźle! 👍" : "Odpocznij jutro trochę więcej.";
        }
    }
}