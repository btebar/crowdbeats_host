const express = require('express');
// require('dotenv').config();
const fetch = require("node-fetch");
var cors = require('cors')
const bodyParser = require('body-parser');
const app = express();
app.set('port', process.env.PORT || 8888);
const port = process.env.PORT || 8888;
var SpotifyWebApi = require('spotify-web-api-node');
var accessToken;
var corsOptions = {
  origin: process.env.origin,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))

function handleErrors(response) {
  if (!response.ok) {
      response.json().then(res => console.dir(res));
      throw Error(response.statusText);
  }
  return response;
}

//app.use(express.bodyParser());

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));


const client_id = '68c8c31b05a34904a91f88aa5167e935'; // Your client id
const client_secret = 'ebddadd2800b45c18bbe9a903781d212'; // Your secret
const redirect_uri = 'http://localhost:8888/access'; // Your redirect uri
const scopes = ['user-read-private', 'user-read-email','playlist-modify-public', 'playlist-modify-private'];
const showDialog = false;

var spotifyApi = new SpotifyWebApi({
  clientId : client_id,
  clientSecret : client_secret,
  redirectUri : redirect_uri
});

// app.get('/', function(req, res) {
//   res.render('index.html', { user: req.user });
// });

app.get('/login', function(req, res) {
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, null, showDialog);
  res.redirect(authorizeURL);
});




app.get('/access', function(req, res, next) {
    const code = req.query.code;
    spotifyApi.authorizationCodeGrant(code)
    .then(function(data) {
      accessToken = data.body.access_token
      res.redirect('/profile');
    }, function(err) {
      console.log('Something went wrong when retrieving the access token!', err);
      next(err)
    })
}) 

app.get('/profile', function(req, res, next) {
  spotifyApi.setAccessToken(accessToken);
  spotifyApi.getMe()
  .then(function(data) {
    res.send(data.body);
  }, function(err) {
    console.error(err);
    next(err)
  });
}) 


app.listen(port, () => console.log(`CrowdBeats listening on port ${port}!`))