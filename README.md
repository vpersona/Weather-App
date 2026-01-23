#  Weather-APP & Mood Tracker

Aplikacja pogodowa zintegrowana z inteligentnym dziennikiem nastroju. System dostarcza aktualnych danych meteorologicznych oraz analizuje korelację między pogodą a Twoim samopoczuciem, oferując prognozę nastroju na nadchodzący dzień.

## Główne Funkcje

- **Prognoza Live:** Pobieranie danych z OpenWeatherMap API (aktualna pogoda + prognoza 5-dniowa).
- **Geolokalizacja:** Automatyczne wykrywanie lokalizacji użytkownika za pomocą GPS.
- **Inteligentny System Mood Prediction:** - Analizuje historię Twoich wpisów (min. 3 dni).
  - Szuka dni o podobnej temperaturze (margines ±3°C).
  - Przewiduje nastrój na podstawie danych historycznych lub prognozowanych opadów.
- **Interaktywne Wykresy (Chart.js):**
  - Wykres liniowy temperatury na najbliższe godziny.
  - Wykres słupkowy Twojego nastroju z ostatnich 7 dni.
- **Personalizacja:** Wybór jednostek (°C / °F) oraz dynamiczne tła (zależne od pogody i pory dnia).
- **Zarządzanie Danymi:** Historia ostatnich wyszukiwań oraz lista ulubionych miast zapisywana w `localStorage`.

## Technologia

* **Język:** JavaScript (ES6+)
* **API:** OpenWeatherMap
* **Biblioteki:** [Chart.js](https://www.chartjs.org/)
* **Pamięć:** LocalStorage 
* **Stylizacja:** CSS3 z wykorzystaniem Flexbox/Grid i dynamicznych klas motywów

## Instalacja i Uruchomienie

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/vpersona/Weather-App.git
2. Otwórz plik index.html w przeglądarce.