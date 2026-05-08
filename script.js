// -------------------- ELEMENTE --------------------
const cityInput = document.getElementById("cityInput");
const btnSearch = document.getElementById("cautare");
const btnLocation = document.getElementById("locatie");

const cityName = document.getElementById("nume-oras");
const temp = document.getElementById("temperatura");
const desc = document.getElementById("descriere");
const icon = document.getElementById("icon");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

const forecastContainer = document.getElementById("forecast");


const apiKey = "25e13912b9fe102b3419901915d1f38f";

// -------------------- VARIABILE FORECAST --------------------
let forecastData = [];
let startIndex = 0;
const visibleDays = 5;

// -------------------- SEARCH --------------------
btnSearch.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (!city) {
    alert("Introdu un oras!");
    return;
  }

  getWeatherByCity(city);
});

// -------------------- GEOLOCATION --------------------
btnLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation nu este suportat.");
    return;
  }

  navigator.geolocation.getCurrentPosition(success, error);
});

function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  getWeatherByCoords(lat, lon);
  getForecast(lat, lon);
}

function error() {
  alert("Nu am putut accesa locația.");
}

// -------------------- WEATHER BY CITY --------------------
async function getWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ro`;

  const res = await fetch(url);
  const data = await res.json();

  updateUI(data);

  getForecast(data.coord.lat, data.coord.lon);
}

// -------------------- WEATHER BY COORDS --------------------
async function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ro`;

  const res = await fetch(url);
  const data = await res.json();

  updateUI(data);
}

// -------------------- UPDATE UI --------------------
function updateUI(data) {
  cityName.textContent = data.name;
  temp.textContent = Math.round(data.main.temp) + "°C";
  desc.textContent = data.weather[0].description;
  humidity.textContent = data.main.humidity + "%";
  wind.textContent = data.wind.speed + " km/h";

  const iconCode = data.weather[0].icon;
  icon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  
}

// -------------------- FORECAST meteo --------------------
async function getForecast(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weathercode&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  renderForecast(data.daily);
}
function getWeatherIcon(code) {
  if (code === 0) return "☀️";        // senin
  if (code <= 3) return "⛅";        // partial
  if (code <= 48) return "🌫️";      // ceață
  if (code <= 67) return "🌧️";      // ploaie
  if (code <= 77) return "❄️";      // ninsoare
  if (code <= 82) return "🌦️";      // averse
  if (code <= 86) return "🌨️";      // ninsoare
  return "🌩️";                      // furtună
}


// -------------------- RENDER FORECAST --------------------

 function renderForecast(daily) {
  forecastContainer.innerHTML = "";

  for (let i = 0; i < daily.time.length; i++) {
    const date = new Date(daily.time[i]);

    const card = document.createElement("div");
    card.className = "day-card";

    const iconCode = convertCode(daily.weathercode[i]);

    card.innerHTML = `
      <div>${date.toLocaleDateString("ro-RO", { weekday: "short" })}</div>
      <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png">
      <div>${Math.round(daily.temperature_2m_max[i])}°C</div>
    `;

    forecastContainer.appendChild(card);
  }
}
function convertCode(code) {
  if (code === 0) return "01d";        // soare
  if (code <= 3) return "02d";         // partial
  if (code <= 48) return "03d";        // nori
  if (code <= 67) return "10d";        // ploaie
  if (code <= 77) return "13d";        // ninsoare
  if (code <= 82) return "09d";        // averse
  return "11d";                        // furtuna
}


// -------------------- DESENEAZĂ CARDURI --------------------
function drawForecast() {
  forecastContainer.innerHTML = "";

  const visible = forecastData.slice(startIndex, startIndex + visibleDays);

  visible.forEach((day, index) => {
    const date = new Date(day.dt * 1000);

    const card = document.createElement("div");
    card.className = "day-card";

    card.style.animationDelay = `${index * 80}ms`;

    card.innerHTML = `
      <div>${date.toLocaleDateString("ro-RO", { weekday: "short" })}</div>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
      <div>${Math.round(day.main.temp)}°C</div>
    `;

    forecastContainer.appendChild(card);
  });
}

// -------------------- BUTOANE CICLU --------------------
document.getElementById("nextBtn")?.addEventListener("click", () => {
  if (startIndex + visibleDays < forecastData.length) {
    startIndex++;
  } else {
    startIndex = 0;
  }
  drawForecast();
});

document.getElementById("prevBtn")?.addEventListener("click", () => {
  if (startIndex > 0) {
    startIndex--;
  } else {
    startIndex = forecastData.length - visibleDays;
  }
  drawForecast();
});

// -------------------- LOCAL STORAGE --------------------
window.addEventListener("load", () => {
  const savedCity = localStorage.getItem("lastCity");

  if (savedCity) {
    getWeatherByCity(savedCity);
  }
});