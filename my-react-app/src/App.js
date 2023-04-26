import logo from './logo.svg';
// import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const bmc = (<a href="https://www.buymeacoffee.com/rrustvold" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style={{height: "40px", width: "145px"}} /></a>)

const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

async function extractWeatherFromLocation(place) {
    var name;
    if (place === "velodrome") {
        var lat = "47.665724";
        var lon = "-122.112615";
        var days = [1, 3, 4, 5];
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
                result[dayName] = matchDay(day, data);
                result[dayName].name = name;
            }
        })

        .catch(error => console.error(error));
    return result

}


function matchDay(dayOfWeek, myData){

    const options = {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        hour12: true
    }
    const options2 = {
        weekday: 'short',
        month: 'long',
        day: 'numeric'
    }

    for (let i in myData.hourly) {
        let hour = myData.hourly[i];
        let time = new Date(hour.dt * 1000);
        if (time.getDay() !== dayOfWeek) {
            continue;
        }

        if (time.getHours() >= 18) {
            return {
                time: time.toLocaleString('en-US', options),
                temp: hour.temp,
                windSpeed: hour.wind_speed,
                windDirection: hour.wind_deg,
                pop: hour.pop,
                weather: hour.weather,
                clouds: hour.clouds,
                evening: false,
                rain: hour.rain ? hour.rain["1h"] / (1000*.0254) : 0,
                rainUnits: "in/hr"
            };
        }
    }
    for (let i in myData.daily) {

        let day = myData.daily[i];

        let time = new Date(day.dt * 1000);

        if (time.getDay() === dayOfWeek){
            return {
                time: time.toLocaleString('en-US', options2),
                temp: day.temp.eve,
                windSpeed: day.wind_speed,
                windDirection: day.wind_deg,
                pop: day.pop,
                weather: day.weather,
                clouds: day.clouds,
                evening: true,
                rain: day.rain ? day.rain / (1000*.0254) : 0,
                rainUnits: "in/day"
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
            // thunderstorn
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
        let rain_accum = `${props.data.rain.toFixed(2)} ${props.data.rainUnits}`;
        if (props.data.rain) {
            rain_accum = `${props.data.rain.toFixed(2)} ${props.data.rainUnits}`;
        }
        return (
            <div className="card mb-2">
                <div className="card-header" style={
                    {
                        backgroundColor: "#3f5c17",
                        color: "white",
                    }
                }>
                    <h4>{props.name} <i className={bi}></i></h4>
                </div>
                <div className="card-body">
                    <ul className="list-group">
                        <li className="list-group-item">
                            <p className="p m-0"><b>Temperature</b></p>
                            {props.data.temp.toFixed(0)} &deg;F {evening}
                        </li>
                        <li className="list-group-item">
                            <p className="p m-0"><b>Wind</b></p>
                            <i className={wind_warning} style={{color: "red"}}></i> {props.data.windSpeed.toFixed(0)} mph <i className={arrow}></i>
                        </li>
                        <li className="list-group-item" style={{backgroundColor: clouds}}>
                            <p className="p m-0"><b>Cloud Cover</b></p>
                            {props.data.clouds.toFixed(0)}%
                        </li>
                        <li className="list-group-item" style={{backgroundColor: rain}}>
                            <p className="p m-0"><b>Rain</b></p>
                            {(props.data.pop * 100).toFixed(0)}% - {rain_accum}
                        </li>
                    </ul>

                </div>
            </div>
        )
    }
}


function RaceDay(props) {
    let time;
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

    return (
        <div className="col-sm">
            <h3 style={{textAlign: "center"}}>{time}</h3>
            <Venue data={props.custom} name={props.custom ? props.custom.name : ""} />
            <Venue data={props.velodrome} name="Velodrome"/>
            <Venue data={props.pr} name="Pacific Raceways" />
            <Venue data={props.seward} name="Seward Park" />
            <Venue data={props.seatac} name="Sea Tac MTB" />
            <Venue data={props.mi} name="Mercer Island Hot Laps" />
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
                        <h1 className="offcanvas-title">raceweather.bike</h1>
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
                        <h1>raceweather.bike <button className="btn btn-primary" type="button"
                                data-bs-toggle="offcanvas" data-bs-target="#demo">
                            What is this?
                        </button></h1>

                        <hr></hr>
                    </div>
                </div>
                <div className="row">
                    {
                        next7Days.map(dayName =>
                            velodrome[dayName] || pr[dayName] || seward[dayName] || seatac[dayName] || mi[dayName] || custom[dayName]
                            ?
                            <RaceDay
                                velodrome={velodrome[dayName]}
                                pr={pr[dayName]}
                                seward={seward[dayName]}
                                seatac={seatac[dayName]}
                                mi={mi[dayName]}
                                custom={custom[dayName]}
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
