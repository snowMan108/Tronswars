const { getFile, getMaterial } = require("./controllers/controller");

const express = require("express"),
  app = express(),
  cors = require("cors"),
  bodyParser = require('body-parser');

require("dotenv")
  .config();
//Connect to database
process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
});

app.use(cors({
  origin: ['http://localhost:3000', 'https://tronwars.ai/', 'https://tronwar.netlify.app']
}))
// parse requests of content-type - application/json

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

app.get("/", getFile)
app.post("/", getMaterial)

//setup server to listen on port 8080
app.listen(process.env.PORT || 8080, () => {
  console.log("Server is live on port 8080");
})