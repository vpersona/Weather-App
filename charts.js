function initTempChart(forecastData) {
    const ctx = document.getElementById('tempChart').getContext('2d');
    if (tempChart) tempChart.destroy();

    const hours = forecastData.list.slice(0, 8).map(item => item.dt_txt.split(' ')[1].slice(0, 5));
    const temps = forecastData.list.slice(0, 8).map(item => item.main.temp);

    // Dynamiczna etykieta w zależności od jednostki
    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';

// Inicjalizuje i aktualizuje wykres liniowy temperatury. 
    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: `Temperatura (${unitSymbol})`, 
                data: temps,
                borderColor: '#fff',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }]
        },
        options: { 
            responsive: true, 
            scales: { 
                y: { 
                    display: false,
                    
                    beginAtZero: false 
                }, 
                x: { 
                    ticks: { color: '#fff' } 
                } 
            },
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#fff' },
                    onClick: (e) => e.stopPropagation() 
                }
            }
        }
    });
}
// Narysowanie słupkowego wykresu humoru na podstawie danych z localstorage (7 wpisów)
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

//Blokownie zapisania humoru jeśli w danym dniu humor już został zapisany 
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