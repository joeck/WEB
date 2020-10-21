const fetch = require("node-fetch");

fetch(`http://wttr.in/${process.argv[2]}?format=j1`)
  .then((response) => {
    return response.json()
  })
  .then((data) => {
    console.log(data.current_condition[0].FeelsLikeC + "°")
  })
  .catch((err) => {
    console.log(err)
  })
