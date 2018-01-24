// server.js
const express        = require('express');
const bodyParser     = require('body-parser');
const app            = express();
const pm2 			 = require('pm2');
const fs 			 = require("fs");
const multer		 = require('multer');
const port = 80;
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.json')
  }
});

var upload = multer({ storage: storage });
app.use(bodyParser.urlencoded({ storag: storage }))

// parse application/json
app.use(bodyParser.json());
app.post('/api/getBotInfo', (req, res) => {
	console.log(req);
	pm2.sendDataToProcessId(3, {
      type: 'process:msg',
      data: {
        cmd: 'getBotInfo',
      },
      topic: 'my topic'
    }, function(err, res) {
      if (err)
        throw err;
    });
    pm2.launchBus(function(err, bus) {
  bus.on('process:msg', function(packet) {
  	res.json(packet.data);
  		});
	});
	pm2.disconnect();
});

app.post('/api/createLobby',upload.single('json'), (req, res) => {
	//console.log();
	res.end('ok');
});
app.listen(port, () => {
  console.log('We are live on ' + port);
});
pm2.connect(function(err) {
  if (err) {
    console.error(err);
  }
  
 console.log("pm2 is works");
 app.get('/api', (req, res) => {
	//res.send("Method not found");

});

});
