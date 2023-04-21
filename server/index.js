const path = require("path");
const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();


// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../my-react-app/build')));

app.get("/api", (req, res) => {
  let lat = req.query.lat;
  let lon = req.query.lon;
  console.log(lat);
  console.log(lon);
  const key = "22f300929be3a712183119feaa903c1f";
  const fetchUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=` + lat + `&lon=` + lon + `&appid=` + key + `&units=imperial`;

  fetch(fetchUrl)
      .then(response => response.json())
      .then(data => res.json(data))
      .catch(error => console.error(error));


  // res.json({ message: "Hello from server!" });
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../my-react-app/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});