const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessButton = document.querySelector("[data-grantAccess]");
const searchInput = document.querySelector("[data-searchInput]");
const errorContainer = document.querySelector("[data-errorContainer]");

let currentTab = userTab;
let API_KEY = "19c69bd5f58d84f7dff638d8e40660ca";
currentTab.classList.add("current-tab");

getFromSessionStorage();

function switchTab(clickedTab) {
    if (currentTab != clickedTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        // if clicked on search tab and search-form-container is invisible then make it visible
        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        // if clicked on user tab and user-info-container is invisible then make it visible
        else {
            searchForm.classList.remove("active");
            errorContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // now we are on your weather tab, So let's check session storage for coordinates
            getFromSessionStorage();
        }

    }
}

// check if local coordinates are already present in session storage or not
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    // localCoordinates are not present then show grant access window
    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
    }
    // localCoordinates are present then fetch weather data from API
    else {
        // convert JSON string to JSON object
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;

    // make grant location window invisible
    grantAccessContainer.classList.remove("active");
    // make loader visible
    loadingScreen.classList.add("active");

    // API call
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        loadingScreen.classList.remove("active");
        alert("Something went wrong!!!")
    }
}

function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // render data on UI
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country?.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

userTab.addEventListener('click', () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
})

searchTab.addEventListener('click', () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
})

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userCoordinates = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            }

            // now set session storage with co-ordinates value
            sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));

            fetchUserWeatherInfo(userCoordinates);
        })
    } else {
        alert("Sorry you don't have location access");
    }
}

grantAccessButton.addEventListener('click', getLocation);

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        loadingScreen.classList.remove("active");

        if (data?.cod === 200) {
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        } else {
            errorContainer.classList.add("active");
        }



    } catch (error) {
        alert("Something went wrong!!!")
        loadingScreen.classList.remove("active");
    }
}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let cityName = searchInput.value;

    if (cityName === "") {
        return;
    } else {
        fetchSearchWeatherInfo(cityName);
        errorContainer.classList.remove("active");
        searchInput.value = "";
    }
})

