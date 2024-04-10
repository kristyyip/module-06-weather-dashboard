// grab references to the important DOM elements
const cityInput = $("#city");
const searchBtn = $("button");
const searchResults = $("#search-results");
const weather = $("section")

// retrieve cities from localStorage
let searchHistory = JSON.parse(localStorage.getItem("cities"));

const apiKey = "3c52839213dc657264686d60db3357ec";

// removes search results from screen
function removeSearchResults() {
    // validation to make sure that the previous element is h6 before we try removing it
    if (searchResults.prev()[0].tagName === "H6") {
        searchResults.prev().remove();
    }

    searchResults
        .removeClass("border-bottom border-2")
        .children().remove();
}

function selectCity(event) {
    // retrieve coordinates from data attribute of clicked city
    let lat = event.target.dataset.lat
    let lon = event.target.dataset.lon

    // create object of coordinates
    const coordinates = {
        lat: lat,
        lon: lon
    }

    // // if no cities (coordinates) were retrieved from localStorage, assign coordinates to a new empty array to push to later
    if (!searchHistory) {
        searchHistory = [];
    }

    // add coordinates to searchHistory array
    searchHistory.push(coordinates);

    // create key:value pair of search history array in localStorage
    localStorage.setItem('cities', JSON.stringify(searchHistory));

    // remove search results
    removeSearchResults();
}

function searchCity() {
    // use geocoding api to get coordinates by location name
    // src: https://openweathermap.org/api/geocoding-api#direct_name
    const requestURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInput.val()}&limit=5&appid=${apiKey}`
    
    
    fetch(requestURL)
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            removeSearchResults();

            // show error message if response returns empty array
            if (data.length === 0) {
                $("<h6>No results found. Please try again.</h6>")
                    .insertAfter("form")
                    .addClass("fw-bold mt-4")
            // otherwise show search results header
            } else {
                $("<h6>Search results (please select one):</h6>")
                    .insertAfter("form")
                    .addClass("fw-bold mt-4")
            }

            // create border underneath search results for styling
            searchResults.addClass("border-bottom border-2")

            // loops through data and creates a list group item of results to append and show on screen
            for (let i=0; i < data.length; i++) {
                const result = $("<li>")
                    .addClass('list-group-item list-group-item-action')
                    .html(`${data[i].name}, ${data[i].state}, ${data[i].country}`)
                    .attr("data-lat", data[i].lat)
                    .attr("data-lon", data[i].lon);
                $("#search-results").append(result);
            }

            // clear form input
            cityInput.val("");

            $(".list-group").on("click", ".list-group-item", selectCity);

        })
}

function createCurrentWeatherCard(data) {
    // use dayjs to grab and format date
    const date = dayjs().format("M/DD/YYYY");

    const card = $("<div>").addClass("card col-12");
    const cardHeader = $("<h2>")
        .addClass("card-header fw-bold")
        .html(`${data.name} (${date})`);
    const cardBody = $("<div>")
        .addClass("card-body");
    const temp = $("<p>")
        .addClass("card-text")
        .html(`Temp: ${data.main.temp}°F`);
    const wind = $("<p>")
        .addClass("card-text")
        .html(`Wind: ${data.wind.speed} MPH`);
    const humidity = $("<p>")
        .addClass("card-text")
        .html(`Humidity: ${data.main.humidity}%`);

    cardBody.append(temp, wind, humidity);
    card.append(cardHeader, cardBody);

    weather.prepend(card);
}

function createForecastCard(data, i) {
    // use dayjs to grab and format date
    const date = dayjs(data.list[i].dt_txt).format("M/DD/YYYY");

    // create cards using information from the fetch response
    const card = $("<div>").addClass("card col-lg-2 col-md-5 col-sm-12 text-white bg-dark my-1 me-3");
    const cardBody = $("<div>")
        .addClass("card-body");
    const cardTitle = $("<h5>")
    .addClass("card-title")
    .html(`${date}`);
    const temp = $("<p>")
        .addClass("card-text")
        .html(`Temp: ${data.list[i].main.temp}°F`);
    const wind = $("<p>")
        .addClass("card-text")
        .html(`Wind: ${data.list[i].wind.speed} MPH`);
    const humidity = $("<p>")
        .addClass("card-text")
        .html(`Humidity: ${data.list[i].main.humidity}%`);

    cardBody.append(cardTitle, temp, wind, humidity);
    card.append(cardBody);

    return card;
}

function renderForecast(data) {
    $("<h3>5 Day Forecast</h3>").addClass("my-4 fw-bold").insertBefore($("#forecast"));

    // loops through response
    for (let i=4; i <= data.cnt; i+=8) {
        $("#forecast").append(createForecastCard(data, i));
    }
}

function getWeather() {
    // get the coordinates of the last searched city
    let lat = searchHistory[searchHistory.length - 1].lat;
    let lon = searchHistory[searchHistory.length - 1].lon;

    const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    fetch(currentWeatherURL)
        .then(function(response) {
            return response.json()
        })
        .then(function(data) {
            createCurrentWeatherCard(data);
        })

    fetch(forecastURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);
            renderForecast(data);
        })
}

$(document).ready(function () {
    searchBtn.on("click", searchCity);

    if (searchHistory) {
        getWeather();
    }
})