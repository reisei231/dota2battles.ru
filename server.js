// server.js
const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const app            = express();
const pm2 			 = require('pm2');
const port = 80;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', function(req, res, next) {  // GET 'http://www.example.com/admin/new'
  switch(req.method){
  	case 'GET':
  		switch(req.path){
  			case '/getBotInfo':
  				res.send('BOTINFO');
  				break;
  		}
  		break;
  	case 'POST':
  		break;
  	default:
  		res.send('Error');
  		break;

  }
  console.log(req.originalUrl); // '/admin/new'
  console.log(req.baseUrl); // '/admin'
  console.log(req.path);
  console.log(req.method); // '/new'
  next();
});
app.listen(port, () => {
  console.log('We are live on ' + port);
});
app.post('/api', (req, res) => {
	res.send("Method not found");

});
pm2.connect(function(err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }
  
 console.log("pm2 is works");
});
