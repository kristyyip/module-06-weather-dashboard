// grab references to the important DOM elements
const cityInput = $("#city");
const searchBtn = $("button");
const searchResults = $("#search-results");
const recentlyViewed = $("#recently-viewed")
const weather = $("section")

// api key for open weather map
const apiKey = "3c52839213dc657264686d60db3357ec";

// retrieve cities from localStorage
let searchHistory = JSON.parse(localStorage.getItem("cities"));

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

// removes weather information from dashboard
function removeCards() {
    $(".card").remove();
    $("h3").remove();
}

// show up to the last 10 recently viewed cities
function addRecentlyViewed() {
    recentlyViewed.children().remove();

    // loops through data and creates a list group item of results to append and show on screen
    for (let i= searchHistory.length - 1; i > searchHistory.length - 11  && i >= 0; i--) {
        const recentlyViewedListItem = $("<li>")
            .addClass('list-group-item list-group-item-action')
            .html(searchHistory[i].name)
            .attr("data-name", searchHistory[i].name)
            .attr("data-lat", searchHistory[i].lat)
            .attr("data-lon", searchHistory[i].lon);
        recentlyViewed.append(recentlyViewedListItem);
    }
}

// create the big card that contains today's weather
function createCurrentWeatherCard(data) {
    // use dayjs to grab and format today's date
    const date = dayjs().format("M/DD/YYYY");

    // url for weather icon
    const weatherIconURL = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`
    
    // create card elements using information from fetch response
    const card = $("<div>").addClass("card col-12");
    const cardHeader = $("<h2>")
        .addClass("card-header fw-bold")
        .html(`${data.name} (${date})`);
    const weatherIcon = $("<img>").attr("src", weatherIconURL)
    const cardBody = $("<div>").addClass("card-body");
    const temp = $("<p>")
        .addClass("card-text")
        .html(`Temp: ${data.main.temp}°F`);
    const wind = $("<p>")
        .addClass("card-text")
        .html(`Wind: ${data.wind.speed} MPH`);
    const humidity = $("<p>")
        .addClass("card-text")
        .html(`Humidity: ${data.main.humidity}%`);

    // append card elements to appropriate parent
    cardBody.append(temp, wind, humidity);
    cardHeader.append(weatherIcon)
    card.append(cardHeader, cardBody);

    // insert card as first child element of weather section
    weather.prepend(card);
}

// create teh small card used for the 5 day forecast
function createForecastCard(data, i) {
    // use dayjs to grab and format date
    const date = dayjs(data.list[i].dt_txt).format("M/DD/YYYY");
    const weatherIconURL = `http://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png`

    // create card elements using information from the fetch response
    const card = $("<div>").addClass("card col-lg-2 col-md-5 col-sm-12 text-white bg-dark my-1 me-3");
    const cardBody = $("<div>").addClass("card-body");
    const cardTitle = $("<h5>")
        .addClass("card-title")
        .html(`${date}`);
    const weatherIcon = $("<img>")
        .addClass("card-text")
        .attr("src", weatherIconURL);
    const temp = $("<p>")
        .addClass("card-text")
        .html(`Temp: ${data.list[i].main.temp}°F`);
    const wind = $("<p>")
        .addClass("card-text")
        .html(`Wind: ${data.list[i].wind.speed} MPH`);
    const humidity = $("<p>")
        .addClass("card-text")
        .html(`Humidity: ${data.list[i].main.humidity}%`);

    // append card elements to appropriate parent
    cardBody.append(cardTitle, weatherIcon, temp, wind, humidity);
    card.append(cardBody);

    return card;
}

// render the forecast cards and append them to the div inside the weather section
function renderForecast(data) {
    $("<h3>5 Day Forecast</h3>").addClass("my-4 fw-bold").insertBefore($("#forecast"));

    // loops through fetch response
    // starting at 4 to get mid-day temperature, i+=8 because 8*3hours gets me the next day
    for (let i=4; i <= data.cnt; i+=8) {
        $("#forecast").append(createForecastCard(data, i));
    }
}

// displays weather information for selected city through fetch response
function getWeather() {
    // get the coordinates of the last searched city
    let lat = searchHistory[searchHistory.length - 1].lat;
    let lon = searchHistory[searchHistory.length - 1].lon;

    // openweathermap apis for current weather and 5-day forecast
    const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    // removes any existing weather information
    removeCards();

    // fetch current weather api
    fetch(currentWeatherURL)
        .then(function(response) {
            return response.json()
        })
        .then(function(data) {
            createCurrentWeatherCard(data);
        })

    // fetch 5-day forecast api
    fetch(forecastURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            renderForecast(data);
        })
}

// select city from search results or recently viewed and push coordinates to searchHistory array + save to local storage
function selectCity(event) {
    // retrieve name and coordinates from data attribute of clicked city
    let name = event.target.dataset.name
    let lat = event.target.dataset.lat
    let lon = event.target.dataset.lon

    // create object of city
    const cityObj = {
        name: name,
        lat: lat,
        lon: lon
    }

    // // if no cities were retrieved from localStorage, assign cities to a new empty array to push to later
    if (!searchHistory) {
        searchHistory = [];
    }

    // check if city object already exists in searchHistory array
    // if so, remove that object to prevent duplicates + ensures the order of the last viewed city
    for (let i=0; i < searchHistory.length; i++) {
        if (JSON.stringify(searchHistory[i]) === JSON.stringify(cityObj)) {
            searchHistory.splice(i, 1);
        }
    }

    // add city to searchHistory array
    searchHistory.push(cityObj);

    // create key:value pair of search history array in localStorage
    localStorage.setItem('cities', JSON.stringify(searchHistory));

    // remove search results
    removeSearchResults();

    // add cities to recently viewed section
    addRecentlyViewed();

    // show weather information for selected city
    getWeather();
}

// grabs user input and fetches coordinates of searched city to add as a data atrribute
// will append search results so user can choose correct city
function searchCity() {
    // use geocoding api to get coordinates by location name
    // src: https://openweathermap.org/api/geocoding-api#direct_name
    const requestURL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInput.val()}&limit=5&appid=${apiKey}`
    
    
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
                    .attr("data-name", data[i].name)
                    .attr("data-lat", data[i].lat)
                    .attr("data-lon", data[i].lon);
                searchResults.append(result);
            }

            // clear form input
            cityInput.val("");

        })
}

// when the page loads, render weather information and recently viewed if they exists + add event listeners to search and select cities
$(document).ready(function () {
    // search for city and display results on click
    // don't allow a user to submit an empty input
    if (cityInput.val() !== "") {
        searchBtn.on("click", searchCity);
    }

    // when city is clicked in either search results or recently viewed, show weather information for that city
    $(".list-group").on("click", ".list-group-item", selectCity);

    // if there's persistent data, display last searched city's weather and recently viewed list
    if (searchHistory) {
        getWeather();
        addRecentlyViewed();
    }
})