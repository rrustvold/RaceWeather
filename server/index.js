const path = require("path");
const express = require("express");
const http = require('http');

const PORT = process.env.PORT || 3001;

const app = express();


setInterval(() => {
  // Used to keep heroku eco dyno running
  console.log("Pinging...");
  http.get("http://weather.leaderboard.bike");
}, 28 * 60 * 1000); // every 28 minutes

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../my-react-app/build')));

app.get("/api", (req, res) => {
  let lat = req.query.lat;
  let lon = req.query.lon;
  const key = process.env.OPEN_WEATHER_KEY;
  const fetchUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=` + lat + `&lon=` + lon + `&appid=` + key + `&units=imperial`;

  /// USE FOR LOCAL TESTING
  // fs.readFile("./dummy.json", "utf8", (err, jsonString) => {
  //   if (err) {
  //     console.log(err);
  //
  //   } else {
  //     res.json(JSON.parse(jsonString));
  //   }
  // })

  /// USE FOR PROD
  fetch(fetchUrl)
      .then(response => response.json())
      .then(data => res.json(data))
      .catch(error => console.error(error));

});

app.get("/air", (req, res) => {
  let lat = req.query.lat;
  let lon = req.query.lon;
  const key = process.env.OPEN_WEATHER_KEY;
  const fetchUrl = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${key}`;

  fetch(fetchUrl)
      .then(response => response.json())
      .then(data => res.json(data))
      .catch(error => console.error(error));
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../my-react-app/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});