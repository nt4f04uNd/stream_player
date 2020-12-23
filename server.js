#!/usr/bin/env node
require(__dirname + '/static/js/constants')
const express = require('express');
const ws = require('ws');
const bodyParser = require('body-parser')

const videoPath = '/Runtime/Runtime 2020.12.13 - 23.50.29.02.mp4';
const password = 'e7fca264bc39d9a39a1b89e6ed819f9e28290be64c265c361df1967441462a4e';
let playing = false;
let position = 0.0;

// HTML
const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', function (req, res) {
   res.render('index.ejs', { videoPath });
});
app.post('/init', urlencodedParser, function (req, res) {
   res.send(JSON.stringify({
      host: req.body.password === password,
      playing: playing,
      position: position,
   }));
});


app.listen(80);
console.log('Server started');

/// SERVING FILES
app.use(express.static('D:/nvidia/videos'));
app.use('/static', express.static(__dirname + '/static'));

// SOCKETS
const clients = {};
const wsServer = new ws.Server({ port: 3000 });
wsServer.on('connection', function (ws) {
   var id = Math.random();
   clients[id] = ws;
   let host = false;
   ws.on('message', function (message) {
      const data = JSON.parse(message);
      if (data && data.password === password) {
         host = true;
         const buildMessage = (newData = {}) => {
            return JSON.stringify({ type: data.type, ...newData });
         };
         switch (data.type) {
            case MESSAGES.PLAY:
               playing = true;
               position = data.position;
               for (var key in clients) {
                  if (id != key) {
                     clients[key].send(buildMessage({ position: position }));
                  }
               }
               break;
            case MESSAGES.PAUSE:
               playing = false;
               for (var key in clients) {
                  if (id != key) {
                     clients[key].send(buildMessage());
                  }
               }
               break;
            case MESSAGES.SEEK:
               position = data.position;
               for (var key in clients) {
                  if (id != key) {
                     clients[key].send(buildMessage({ position: position }));
                  }
               }
               break;
            default:
               throw 'wrong message type';
         }
      }
   });

   ws.on('close', function () {
      if (host) position = 0.0;
      delete clients[id];
   });
});