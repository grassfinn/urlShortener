require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
// Basic Configuration
const port = process.env.PORT || 3000;
const dns = require('node:dns');
const mySecret = process.env['db'];
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());

const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true, unique: true },
  short_url: { type: Number, required: true, unique: true },
  ip: { type: String },
});
const url = mongoose.model('url', urlSchema);

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let num = 0;

app.post('/api/shorturl', (req, res) => {
  const usersUrl = req.body.url;
  // validate url
  urlObj = new URL(usersUrl);
  // console.log(urlObj)
  // if domain exists, returns the address
  dns.lookup(urlObj.host, (err, address, family) => {
    // console.log(address)
    if (!address) {
      console.log(address);
      res.json({ error: 'invalid url' });
    } else {
      const original_url = urlObj.href;
      let short_url = 1;
      // get latest shorturl
      url
        .find({})
        .sort({ short_url: 'desc' })
        .limit(1)
        .then((latestUrl) => {
          console.log(latestUrl);
          if (latestUrl.length > 0) {
            short_url = latestUrl[0].short_url + 1;
          }
          // place in here
          const responseObj = { original_url, short_url };
          const newUrl = new url({
            original_url,
            short_url,
            ip: address,
          });
          newUrl.save();
          res.json(responseObj);
        });
    }
  });
});

// if error

// Your first API endpoint
app.get('/api/shorturl/:number', function (req, res) {
  const param = req.params.number;
  url.findOne({ short_url: param }).then((url) => {
    if (url) {
      const original_url = url.original_url;
      res.redirect(original_url);
    } else {
      res.json({ error: 'invalid url' });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
