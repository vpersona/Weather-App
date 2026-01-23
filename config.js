//Konfiguracja i zmienne globalne
const API_KEY = '25ec1e50addf6cf00e0e1dffe1b3b192'; //Klucz dostępu do api
let currentUnit = 'metric'; //Domyślna jednostka miar (°C)
let tempChart, moodChart;

const cityInput = document.getElementById('city-input'); 
const searchBtn = document.getElementById('search-btn'); 
const geoBtn = document.getElementById('geo-btn'); //Przycisk wczytujący naszą lokalizację
const unitCheckbox = document.getElementById('unit-checkbox'); //Przełącznik między °C a °F
const favBtn = document.getElementById('fav-btn');





