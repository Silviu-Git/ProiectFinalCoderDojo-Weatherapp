// 🔑 API KEY
const API_KEY = "API_KEY_TAU";

// 📌 SELECTORI
const elements = {
  cityInput: document.getElementById("cityInput"),
  searchBtn: document.getElementById("searchBtn"),
  locationBtn: document.getElementById("locationBtn"),

  cityName: document.getElementById("cityName"),
  temp: document.getElementById("temp"),
  desc: document.getElementById("desc"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  icon: document.getElementById("icon"),
  loader: document.getElementById("loader"),
  forecast: document.getElementById("forecast")
};


// 🔄 EVENT LISTENERS
elements.searchBtn.addEventListener("click", () => {
  const city = elements.cityInput.value.trim();
  if (city) getWeatherByCity(city);
});

elements.cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = elements.cityInput.value.trim();
    if (city) getWeatherByCity(city);
  }
});

elements.locationBtn.addEventListener("click", getWeatherByLocation);


// 🔄 LOADER
function toggleLoader(show) {
  elements.loader.style.display = show ? "block" : "none";
}


// 🌍 FETCH WEATHER BY CITY
async function getWeatherByCity(city) {
  try {
    toggleLoader(true);

    const data = await fetchData(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    updateCurrentWeather(data);
    getForecast(city);

  } catch (error) {
    alert("Orașul nu a fost găsit!");
  } finally {
    toggleLoader(false);
  }
}


// 📍 FETCH WEATHER BY LOCATION
function getWeatherByLocation() {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      toggleLoader(true);

      const { latitude, longitude } = pos.coords;

      const data = await fetchData(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      updateCurrentWeather(data);
      getForecast(data.name);

    } catch (error) {
      alert("Eroare locație!");
    } finally {
      toggleLoader(false);
    }
  });
}


// 🔌 FUNCȚIE GENERALĂ FETCH
async function fetchData(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Eroare API");
  }

  return await response.json();
}


// 🖥 UPDATE UI (CURRENT WEATHER)
function updateCurrentWeather(data) {
  elements.cityName.innerText = data.name;
  elements.temp.innerText = Math.round(data.main.temp) + "°C";
  elements.desc.innerText = data.weather[0].description;
  elements.humidity.innerText = data.main.humidity + "%";
  elements.wind.innerText = data.wind.speed + " km/h";

  const iconCode = data.weather[0].icon;
  elements.icon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  updateBackground(data.weather[0].main);
}


// 🎨 BACKGROUND DINAMIC
function updateBackground(condition) {
  const backgrounds = {
    Clear: "linear-gradient(to right, #fbc2eb, #a6c1ee)",
    Clouds: "linear-gradient(to right, #bdc3c7, #2c3e50)",
    Rain: "linear-gradient(to right, #4b79a1, #283e51)",
    Snow: "linear-gradient(to right, #e6dada, #274046)"
  };

  document.body.style.background =
    backgrounds[condition] || "linear-gradient(to right, #4facfe, #00f2fe)";
}


// 📅 FETCH FORECAST
async function getForecast(city) {
  try {
    const data = await fetchData(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );

    renderForecast(data.list);

  } catch (error) {
    console.error("Eroare forecast");
  }
}


// 📊 RENDER FORECAST (BEST METHOD)
function renderForecast(list) {
  elements.forecast.innerHTML = "";

  // luăm doar ora 12:00 pentru fiecare zi
  const dailyData = list.filter(item =>
    item.dt_txt.includes("12:00:00")
  );

  dailyData.forEach(day => {
    const date = new Date(day.dt_txt);

    const dayName = date.toLocaleDateString("ro-RO", {
      weekday: "short"
    });

    const temp = Math.round(day.main.temp);
    const iconCode = day.weather[0].icon;

    const card = document.createElement("div");
    card.className = "day-card";

    card.innerHTML = `
      <p>${dayName}</p>
      <img src="https://openweathermap.org/img/wn/${iconCode}.png">
      <p>${temp}°C</p>
    `;

    elements.forecast.appendChild(card);
  });
}