import logo from './logo.svg';
// import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';

const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

async function extractWeatherFromLocation(place) {
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

    for (let i in myData.hourly) {
        let hour = myData.hourly[i];
        let time = new Date(hour.dt * 1000);
        if (time.getDay() !== dayOfWeek) {
            continue;
        }

        if (time.getHours() === 18) {
            return {
                time: time.toLocaleString('en-US', options),
                temp: hour.temp,
                windSpeed: hour.wind_speed,
                windDirection: hour.wind_deg,
                pop: hour.pop,
                weather: hour.weather,
                clouds: hour.clouds
            };
        }
    }
    for (let i in myData.daily) {

        let day = myData.daily[i];

        let time = new Date(day.dt * 1000);

        if (time.getDay() === dayOfWeek){
            return {
                time: time.toLocaleString('en-US', options),
                temp: day.temp.eve,
                windSpeed: day.wind_speed,
                windDirection: day.wind_deg,
                pop: day.pop,
                weather: day.weather,
                clouds: day.clouds
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

        let src = "https://openweathermap.org/img/wn/" + props.data.weather[0].icon + ".png";
        return (
            <div className="card m-2">
                <div className="card-header" style={{backgroundColor: "#555933", color: "white"}}>
                    <h3>{props.name} <i className={bi}></i></h3>
                </div>
                <div className="card-body">
                    <p>
                        Temperature: {props.data.temp} &deg;F
                    </p>
                    <p>
                        Wind Speed: {props.data.windSpeed} mph <i className={arrow}></i>
                    </p>
                    <p>
                        Cloud Coverage: {props.data.clouds}%
                    </p>
                    <p>
                        Chance of Rain: {props.data.pop * 100}%
                    </p>
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
    }

    return (
        <div className="col-md">
            <h3 style={{textAlign: "center"}}>{time}</h3>
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

    console.log(velodrome);
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
                <div className="row">
                    {
                        next7Days.map(dayName =>
                            velodrome[dayName] || pr[dayName] || seward[dayName] || seatac[dayName] || mi[dayName]
                            ?
                            <RaceDay
                                velodrome={velodrome[dayName]}
                                pr={pr[dayName]}
                                seward={seward[dayName]}
                                seatac={seatac[dayName]}
                                mi={mi[dayName]}
                            />
                                : null
                        )
                    }
                </div>
                <div className="container-float m-5">
                    <p className="text-center text-muted fw-lighter">
                        copyright 2023, rrustvold@gmail.com
                    </p>
                </div>
            </div>
        )
    }
}

export default RaceWeek;
