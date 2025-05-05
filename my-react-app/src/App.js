import logo from './logo.svg';
// import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const bmc = (<a href="https://www.buymeacoffee.com/rrustvold" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style={{height: "40px", width: "145px"}} /></a>)

const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

const schedule = [
    {
        name: "Paper Town",
        lat: 46.17616,
        lon: -123.091199,
        date: "2024-04-21Z00:00:00-7",
        day: 0,
        timeOfDay: "day"
    },
    {
        name: "TdB - Joe Miller Road Race",
        lat: 47.39179,
        lon: -120.29303,
        date: "2024-05-02Z00:00:00-7",
        day: 4,
        timeOfDay: "day"
    },
    {
        name: "TdB - Waterville Road Race",
        lat: 47.651873,
        lon: -120.071415,
        date: "2024-05-03Z00:00:00-7",
        day: 5,
        timeOfDay: "day"
    },
    {
        name: "TdB - Palisades Time Trial",
        lat: 47.298147,
        lon: -120.060586,
        date: "2024-05-04Z00:00:00-7",
        day: 6,
        timeOfDay: "day"
    },
    {
        name: "TdB - Criterium",
        lat: 47.426305,
        lon: -120.311416,
        date: "2024-05-04Z00:00:00-7",
        day: 6,
        timeOfDay: "eve"
    },
    {
        name: "TdB - Plain Road Race",
        lat: 47.764376,
        lon: -120.656424,
        date: "2024-05-05Z00:00:00-7",
        day: 0,
        timeOfDay: "morn"
    },
    {
        name: "Volunteer Park",
        lat: 47.630036,
        lon: -122.314935,
        date: "2024-06-15Z16:00:00-7",
        day:6,
        timeOfDay: "day"
    }

];

async function getAllOneDays(){
    let results = [];
    let now = new Date();
    now.setHours(0, 0, 0, 0);
    let compareDate = new Date().setDate(now.getDate() + 6);
    for (let i in schedule) {
        let race = schedule[i];
        let raceDate = new Date(race.date);
        if (now <= raceDate && raceDate < compareDate) {
            results.push(
                {
                    "name": race.name,
                    "results": await extractWeatherFromLocation(i)
                }
            );
        }
    }
    return results
}
async function extractWeatherFromLocation(place) {
    var name;
    var timeOfDay;
    if (place === "velodrome") {
        var lat = "47.665724";
        var lon = "-122.112615";
        var days = [0, 1, 2, 3, 4, 5, 6];
    } else if (place === "seward") {
        var lat = "47.551464";
        var lon = "-122.253915";
        var days = [4];
    } else if (place === "pr") {
        var lat = "47.320750";
        var lon = "-122.144828";
        var days = [2];
    } else if (place === "seatac") {
        var lat = "47.479137";
        var lon = "-122.308527";
        var days = [3];
    } else if (place === "mi"){
        var lat = "47.590201";
        var lon = "-122.247918";
        var days = [2];
    } else if (place === "custom"){
        const params = new Proxy(new URLSearchParams(window.location.search), {
          get: (searchParams, prop) => searchParams.get(prop),
        });
        // Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
        var lat = params.lat; // "some_value"
        var lon = params.lon;
        // javascript is a garbage language
        var days = params.days.split(",").map(numStr => parseInt(numStr));
        name = params.name;
    } else if (place !== null){
        let race = schedule[place];
        var lat = race.lat;
        var lon = race.lon;
        var days = [race.day];
        name = race.name;
        timeOfDay = race.timeOfDay;
    }

    var result = {
        sunday: null,
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null
    }

    const fetchUrl = `/api?lat=` + lat + `&lon=` + lon;
    await fetch(fetchUrl)
        .then(response => response.json())
        .then(data => {
            for (let i in days){
                let day = days[i];
                let dayName = daysOfWeek[day];
                result[dayName] = matchDay(day, data, timeOfDay);
                result[dayName].name = name;
            }
        })

        .catch(error => console.error(error));

    const fetchAirUrl = `/air?lat=${lat}&lon=${lon}`;
    await fetch(fetchAirUrl)
        .then(response => response.json())
        .then(data => {
            for (let i in days) {
                let day = days[i];
                let dayName = daysOfWeek[day];
                result[dayName]["air"] = matchDayForPollution(day, data);
            }
        })
        .catch(error => console.error(error));
    return result

}


function calculateAQI(c){
    c = c.toFixed(2);
    let c_lo;
    let c_high;
    let bp_lo;
    let bp_high;
    if (c <= 12){
        c_lo = 0;
        c_high = 12;
        bp_lo = 0;
        bp_high = 50;
    } else if (c <= 35.4) {
        c_lo = 12.1;
        c_high = 35.4;
        bp_lo = 51;
        bp_high = 100;
    } else if (c <= 55.4) {
        c_lo = 35.4;
        c_high = 55.4;
        bp_lo = 101;
        bp_high = 150;
    } else if (c <=150.4) {
        c_lo = 55.4;
        c_high = 150.4;
        bp_lo = 151;
        bp_high = 200;
    } else if (c <= 250.4) {
        c_lo = 150.4;
        c_high = 250.4;
        bp_lo = 201;
        bp_high = 300;
    } else if (c <= 350.4) {
        c_lo = 250.4;
        c_high = 350.4;
        bp_lo = 301;
        bp_high = 400;
    } else if (c <= 500.4) {
        c_lo = 350.4;
        c_high = 500.4;
        bp_lo = 401;
        bp_high = 500;
    }
    return ((bp_high - bp_lo)/(c_high - c_lo) * (c - c_lo) + bp_lo).toFixed(0);
}


function matchDayForPollution(dayOfWeek, myData){
    for (let i in myData.list) {
        let hour = myData.list[i];
        let time = new Date(hour.dt * 1000);
        if (time.getDay() !== dayOfWeek) {
            continue;
        }

        if (time.getHours() >= 18) {
            return {
                pm2_5: calculateAQI(hour.components.pm2_5)
            };
        }
    }
    return {
        pm2_5: null
    }
}


function matchDay(dayOfWeek, myData, timeOfDay){

    const options = {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        hour12: true
    }
    const options2 = {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric'
    }

    let timeOfDayMatch = 18;
    if (!timeOfDay) {
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            timeOfDay = "day";
        } else {
            timeOfDay = "eve";
        }
    }
    if (timeOfDay === "morn"){
        timeOfDayMatch = 9;
    }
    else if (timeOfDay === "day"){
        timeOfDayMatch = 13;
    }

    let sunrise = new Date(myData.daily[0].sunrise * 1000);
    sunrise = sunrise.toLocaleTimeString("en-US");
    let sunset = new Date(myData.daily[0].sunset * 1000);
    sunset = sunset.toLocaleTimeString("en-US");

    for (let i in myData.hourly) {
        let hour = myData.hourly[i];
        let time = new Date(hour.dt * 1000);
        if (time.getDay() !== dayOfWeek) {
            continue;
        }

        if (time.getHours() >= timeOfDayMatch) {
            return {
                time: time.toLocaleString('en-US', options),
                temp: hour.temp,
                windSpeed: hour.wind_speed,
                windGust: hour.wind_gust,
                windDirection: hour.wind_deg,
                pop: hour.pop,
                weather: hour.weather,
                clouds: hour.clouds,
                evening: false,
                timeOfDay: timeOfDay,
                rain: hour.rain ? hour.rain["1h"] / (1000*.0254) : 0,
                rainUnits: "in/hr",
                sunrise: sunrise,
                sunset: sunset,
                uvi: hour.uvi,

            };
        }
    }
    for (let i in myData.daily) {

        let day = myData.daily[i];

        let time = new Date(day.dt * 1000);

        if (time.getDay() === dayOfWeek){
            return {
                time: time.toLocaleString('en-US', options2),
                temp: day.temp[timeOfDay],
                windSpeed: day.wind_speed,
                windGust: day.wind_gust,
                windDirection: day.wind_deg,
                pop: day.pop,
                weather: day.weather,
                clouds: day.clouds,
                evening: true,
                timeOfDay: timeOfDay,
                rain: day.rain ? day.rain / (1000*.0254) : 0,
                rainUnits: "in/day",
                sunrise: sunrise,
                sunset: sunset,
                uvi: day.uvi
            };
        }
    }

}


function Venue(props) {
    if (props && props.data) {

        let dir = props.data.windDirection;
        let arrow;
        if (dir <= 22.5 || dir >= 360 - 22.5) {
            arrow = "bi bi-arrow-down";
        } else if (dir > 45 - 22.5 && dir <= 45 + 22.5) {
            arrow = "bi bi-arrow-down-left";
        } else if (dir > 90 - 22.5 && dir <= 90 + 22.5) {
            arrow = "bi bi-arrow-left";
        } else if (dir > 135 - 22.5 && dir <= 135 + 22.5) {
            arrow = "bi bi-arrow-up-left";
        } else if (dir > 180 - 22.5 && dir <= 180 + 22.5) {
            arrow = "bi bi-arrow-up";
        } else if (dir > 225 - 22.5 && dir <= 225 + 22.5) {
            arrow = "bi bi-arrow-up-right";
        } else if (dir > 270 - 22.5 && dir <= 270 + 22.5) {
            arrow = "bi bi-arrow-right";
        } else if (dir > 315 - 22.5 && dir <= 315 + 22.5) {
            arrow = "bi bi-arrow-down-right";
        }

        let wind_warning = "";
        if (props.data.windSpeed >= 15) {
            wind_warning = "bi bi-exclamation-triangle-fill";
        }

        let icon = props.data.weather[0].icon;
        let bi;
        if (icon === "11d") {
            // thunderstorm
            bi = "bi bi-cloud-lightning-rain-fill";
        } else if (icon === "09d") {
            // drizzle
            bi = "bi bi-cloud-drizzle-fill";
        } else if (icon === "10d") {
            // rain
            bi = "bi bi-cloud-rain-fill";
        } else if (icon === "13d") {
            // snow
            bi = "bi bi-cloud-snow-fill";
        } else if (icon === "50d") {
            // haze
            bi = "bi bi-cloud-haze-fill";
        } else if (icon === "01d") {
            // clear
            bi = "bi bi-sun-fill";
        } else if (icon === "02d") {
            //partly cloudy
            bi = "bi bi-cloud-sun-fill";
        } else if (icon === "03d" || icon === "04d") {
            //cloudy
            bi = "bi bi-clouds-fill";
        } else {
            console.log("icon not found");
            console.log(icon);
        }

        let clouds = "rgba(108, 111, 120, " + props.data.clouds/100 + ")";
        let rain = "rgba(25, 83, 112, " + props.data.pop + ")";

        let src = "https://openweathermap.org/img/wn/" + props.data.weather[0].icon + ".png";
        let evening = "";
        if (props.data.evening) {
            evening = "(evening)";
        }
        let timeOfDay = "";
        if (props.data.timeOfDay){
            timeOfDay = `(${props.data.timeOfDay})`;
        }
        let rain_accum = `${props.data.rain.toFixed(2)} ${props.data.rainUnits}`;
        if (props.data.rain) {
            rain_accum = `${props.data.rain.toFixed(2)} ${props.data.rainUnits}`;
        }

        let pm2_5 = props.data.air.pm2_5;
        let aqi;
        let severity;
        if (pm2_5 === null){
            severity = null;
            aqi = "Not Available";
        }
        else if (pm2_5 <= 50){
            severity = "#5b9f49";
            aqi = " - Good";
        } else if (pm2_5 <= 100) {
            severity = "#ffb92f";
            aqi = " - Moderate";
        } else if (pm2_5 <= 150) {
            severity = "#ff8833";
            aqi = " - Unhealthy for Sensitive Groups";
        } else if (pm2_5 <= 200) {
            severity = "#d5202a";
            aqi = " - Unhealthy";
        } else if (pm2_5 <= 300) {
            severity = "#802674";
            aqi = " - Very Unhealthy";
        } else if (pm2_5 > 300){
            severity = "#990008";
            aqi = " - Hazardous";
        } else {
            severity = null;
            aqi = "Not Available";
        }

        let uvi = props.data.uvi;
        let uvi_color;
        let uvi_severity;
        if (uvi === null){
            uvi_color = null;
            uvi_severity = "Not Available";
        }
        else if (uvi <= 2){
            uvi_color = "#5b9f49";
            uvi_severity = " - Low";
        } else if (uvi <= 5) {
            uvi_color = "#ffb92f";
            uvi_severity = " - Moderate";
        } else if (uvi <= 7) {
            uvi_color = "#ff8833";
            uvi_severity = " - High";
        } else if (uvi <= 11) {
            uvi_color = "#d5202a";
            uvi_severity = " - Very High";
        } else if (uvi > 11) {
            uvi_color = "#802674";
            uvi_severity = " - Extreme";
        } else {
            uvi_color = null;
            uvi_severity = "Not Available";
        }

        return (
            <div className="card mb-4">
                <div className="card-header" style={
                    {
                        backgroundColor: "#3f5c17",
                        color: "white",

                    }
                }>
                    <h4>{props.name} <i className={bi}></i></h4>
                </div>
                <div className="card-body m-0 p-0">
                    <ul className="list-group">
                        <li className="list-group-item">
                            <p className="p m-0 p-0"><b>Temperature</b></p>
                            {props.data.temp.toFixed(0)} &deg;F {timeOfDay}
                        </li>
                        <li className="list-group-item">
                            <p className="p m-0"><b>Wind</b></p>
                            <i className={wind_warning}
                               style={{color: "red"}}></i> {props.data.windSpeed.toFixed(0)} - {props.data.windGust.toFixed(0)} mph <i
                            className={arrow}></i>
                        </li>
                        {
                            severity ?
                                <li className="list-group-item"
                                    style={{backgroundColor: severity}}>
                                    <p className="p m-0"><b>Air Quality (pm 2.5)</b></p>
                                    {props.data.air.pm2_5}{aqi}
                                </li>
                                : null}
                        <li className="list-group-item"
                            style={{backgroundColor: clouds}}>
                            <p className="p m-0"><b>Cloud Cover</b></p>
                            {props.data.clouds.toFixed(0)}%
                        </li>
                        <li className="list-group-item" style={{
                            backgroundColor: rain,
                            color: props.data.pop > .75 ? "#EEEEEE" : "black"
                        }}>
                            <p className="p m-0"><b>Rain</b></p>
                            {(props.data.pop * 100).toFixed(0)}% - {rain_accum}
                        </li>
                        <li className="list-group-item"
                            style={{backgroundColor: uvi_color}}>
                            <p className="p m-0"><b>UV Index</b></p>
                            {props.data.uvi.toFixed(0)} {uvi_severity}
                        </li>
                    </ul>

                </div>
            </div>
        )
    }
}


function RaceDay(props) {
    let time;
    let name;
    let specialRaces = [];

    if (props.velodrome){
        time = props.velodrome.time;
    } else if (props.pr){
        time = props.pr.time;
    } else if (props.seward){
        time = props.seward.time;
    } else if (props.seatac){
        time = props.seatac.time;
    } else if (props.mi){
        time = props.mi.time;
    } else if (props.custom){
        time = props.custom.time;
    }
    if (props.oneDay){
        for (let i in props.oneDay){
            let venue = props.oneDay[i];
            let data = venue.results[props.dayName];
            if (data) {
                if (!time) {
                    time = data.time;
                }
                specialRaces.push(
                <Venue data={data} name={venue.name} />
            );
            }

        }
    }

    return (
        <div className="col-sm">
            <h4 style={{textAlign: "center"}}>{time}</h4>
            <Venue data={props.custom} name={props.custom ? props.custom.name : ""} />
            <Venue data={props.velodrome} name="Velodrome"/>
            <Venue data={props.pr} name="Pacific Raceways" />
            <Venue data={props.seward} name="Seward Park" />
            <Venue data={props.seatac} name="Sea Tac MTB" />
            <Venue data={props.mi} name="Mercer Island Hot Laps" />
            {specialRaces}
        </div>
    );
}



function RaceWeek() {
    const [velodrome, setVelodrome] = useState([]);
    const [seward, setSeward] = useState([]);
    const [pr, setPr] = useState([]);
    const [seatac, setSeatac] = useState([]);
    const [mi, setMi] = useState([]);

    const [custom, setCustom] = useState([]);
    const [oneDay, setOneDay] = useState([]);

    useEffect(() => {
        async function fetchDataAsync() {
            const json = await extractWeatherFromLocation("velodrome");
            setVelodrome(json);
        }
        fetchDataAsync();
    }, []);

    useEffect(() => {
        async function fetchDataAsync() {
            const json2 = await extractWeatherFromLocation("seward");
            setSeward(json2);
        }
        fetchDataAsync();
    }, []);

    useEffect(() => {
        async function fetchDataAsync() {
            const json3 = await extractWeatherFromLocation("pr");
            setPr(json3);
        }
        fetchDataAsync();
    }, []);

    useEffect(() => {
        async function fetchDataAsync() {
            const json4 = await extractWeatherFromLocation("seatac");
            setSeatac(json4);
        }
        fetchDataAsync();
    }, []);

    useEffect(() => {
        async function fetchDataAsync() {
            const json5 = await extractWeatherFromLocation("mi");
            setMi(json5);
        }
        fetchDataAsync();
    }, []);

    useEffect(() => {
        async function fetchDataAsync() {
            const json6 = await extractWeatherFromLocation("custom");
            setCustom(json6);
        }
        fetchDataAsync();
    }, []);

    useEffect(() => {
        async function fetchDataAsync() {
            const json6 = await getAllOneDays();
            setOneDay(json6);
        }
        fetchDataAsync();
    }, []);

    const [count, setCount] = useState(0);
    function handleClick() {
        async function fetchDataAsync() {
            const json6 = await extractWeatherFromLocation("custom");
            setCustom(json6);
        }
        fetchDataAsync();
      }

    if (velodrome.monday) {
        let now = new Date();
        let nowDay = now.getDay();
        let next7Days = [];
        for (let i=0; i<7; i++) {
            let dayName = daysOfWeek[nowDay + i];
            next7Days.push(dayName);
        }
        return (
            <div className="container-fluid">
                <div className="offcanvas offcanvas-start" id="demo">
                    <div className="offcanvas-header">
                        <h1 className="offcanvas-title">weather.leaderboard.bike</h1>
                        <button type="button" className="btn-close text-reset"
                                data-bs-dismiss="offcanvas"></button>
                    </div>
                    <div className="offcanvas-body">
                        <p>
                            This site shows the forecast for all  the Seattle bike racing venues, at the times when races occur.
                        </p>
                        <p>
                            The forecast data is specific to each location and time, so you can plan
                            your race week without having to check a bunch of different micro-climates
                            with your usual weather app.
                        </p>
                        <p>
                            All data is obtained from the <a href="https://openweathermap.org/" target="_blank">Open Weather API</a>.
                        </p>
                        <p>
                            You can add one custom location below. Just add your GPS coords (you can get them from google maps)
                            and give it a name. Then bookmark the page for future use.
                        </p>
                        <p>
                            If I'm missing something here, feel free to drop me a line rrustvold@gmail.com
                        </p>
                        <SearchForm callback={handleClick}/>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <h1>weather.leaderboard.bike <button className="btn btn-primary" type="button"
                                data-bs-toggle="offcanvas" data-bs-target="#demo">
                            What is this?
                        </button>

                        </h1>
                        ☀️{velodrome.monday.sunrise} - {velodrome.monday.sunset} 🌙
                        <hr></hr>
                    </div>
                </div>
                <div className="row">
                    {
                        next7Days.map(dayName =>
                            velodrome[dayName] || pr[dayName] || seward[dayName] || seatac[dayName] || mi[dayName] || custom[dayName] || oneDay.length > 0
                            ?
                            <RaceDay
                                velodrome={velodrome[dayName]}
                                pr={pr[dayName]}
                                seward={seward[dayName]}
                                seatac={seatac[dayName]}
                                mi={mi[dayName]}
                                custom={custom[dayName]}
                                oneDay={oneDay}
                                dayName={dayName}
                            />
                                : null
                        )
                    }
                </div>
                <div className="container-float m-5 pb-3">
                    <p className="text-center text-muted fw-lighter">
                        copyright 2023, rrustvold@gmail.com {bmc}
                    </p>
                </div>
            </div>
        )
    }
}

function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      error => {
        reject(error);
      }
    );
  });
}

function SearchForm(props) {
    const params = new Proxy(new URLSearchParams(window.location.search), {
          get: (searchParams, prop) => searchParams.get(prop),
        });
  const [customName, setCustomName] = useState(params.name);
  const [customLat, setCustomLat] = useState(params.lat);
  const [customLon, setCustomLon] = useState(params.lon);

  const navigate = useNavigate();


  const handleSubmit = (event) => {
    event.preventDefault();

    // update the URL with the search term and page
    navigate(`/?lat=${customLat}&lon=${customLon}&name=${customName}&days=0,1,2,3,4,5,6`);
    props.callback();
  };

  function gps() {
      navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCustomLat(latitude);
        setCustomLon(longitude);
      },
      error => {
        console.log(error);
      }
    );
  }

  return (
      <div>
      <h5>Add a Custom Location</h5>
    <form onSubmit={handleSubmit}>
      <label className="form-label">
        Name
        <input
          type="text"
          value={customName}
          className="form-control"
          onChange={(event) => setCustomName(event.target.value)}
        />
      </label>
      <label className="form-label">
        Latitude
        <input
            className="form-control"
          type="text"
          value={customLat}
          onChange={(event) => setCustomLat(event.target.value)}
        />
      </label>
        <label className="form-label">
        Longitude
        <input
            class="form-control"
          type="text"
          value={customLon}
          onChange={(event) => setCustomLon(event.target.value)}
        />
      </label>
        {/*<p><button className="btn btn-secondary" onClick={gps}>Fill with GPS <i*/}
        {/*    className="bi bi-geo-alt"></i></button> </p>*/}
        <p><button type="submit" className="btn btn-primary">Enter</button></p>
    </form>
      </div>
  );
}

export default RaceWeek;
