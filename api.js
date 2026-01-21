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