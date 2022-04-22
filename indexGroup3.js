let express = require('express');
let bodyParser = require('body-parser');
let routes = require("./routes");
let fs = require("fs");
let jsonFile = require(__dirname + "/fileFolder/dataBase.json");
const { v4: uuidv4 } = require('uuid');


let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(routes);
app.use(express.static('./fileFolder'));
app.use(express.static('./serverFiles'));

let http = require('http');
let dataBase=[];
let numPng=0;
let orderedDatabase=[];
let secToOrder = 1;
let password = "MDJ333"


fs.readdir(__dirname + '/fileFolder', function(err, files){
if (err)
  console.log(err);
  for (const i of files)
  {
    if(i.includes(".png"))
    {
    	numPng++;
    //fs.unlink will delete specified files
      //fs.unlink(__dirname + '/fileFolder/' + i, function(){});
    }
  }
  console.log(numPng);
});
//json file auto parses
dataBase = jsonFile;

/**
 * Create HTTP server.
 */
let server = http.createServer(app);
////////////////////////////////
// Socket.io server listens to our app
let io = require('socket.io').listen(server);

io.on('connection', function(socket) {
	console.log("user connection")
	//sends imageName + text on server(fileFolder)

	socket.emit('dataBase', dataBase);

	socket.on('deleteImg', function (imgName, pass){
		if(!pass || pass.toUpperCase() != password)
			return;
		for(var i = 0; i < dataBase.length; i++) {
    		if (dataBase[i].fileName == imgName) {
    			dataBase.splice(i, 1);
    			break;
    		}
		}
		saveDatabase();
		io.emit('deletedImg', imgName);
	});

	socket.on('deleteAllImg', function (pass){
		if(!pass || pass.toUpperCase() != password)
			return;
		fs.readdir(__dirname + '/fileFolder', function(err, files){
		if (err)
		  console.log(err);
		  for (const i of files)
		  {
		    if(i.includes(".png"))
		    {
		      fs.unlink(__dirname + '/fileFolder/' + i, function(){});
		    }
		  }
		});
		dataBase = [];
		saveDatabase();
		io.emit('deleteAllImgs', dataBase);
		});

	socket.on('like', function (imgName, likeVal)
	{
		for(var i = 0; i < dataBase.length; i++) {
    		if (dataBase[i].fileName == imgName) {
    			dataBase[i].likes+=Number(likeVal);
    			break;
    		}
		}
		saveDatabase();
	});

	socket.on('base64file', function (data1, name) {
	const buffer = Buffer.from(data1, 'base64');
	const uuid = uuidv4();
	//console.log(buffer);
	dataBase.push(new data('img'+uuid+'.png',name));
	//will create img each will be numerically named, img0, img1...
	fs.writeFile('./fileFolder/img'+uuid+'.png', buffer, function (err) {
	if (err) throw err;
	console.log('saved png');
	io.emit('newImg', dataBase[dataBase.length-1]);
	});
	//writing database to JSON file to save 
	saveDatabase();
	});
});

function saveDatabase() {
	const jsonContent = JSON.stringify(dataBase);
    fs.writeFile("./fileFolder/dataBase.json", jsonContent, 'utf8', function (err) {
    	if (err) 
    		{
        	return console.log(err);
        }
		
		});
}

function data(fileName, name) {
    this.fileName = fileName;
    this.name = name;
    this.likes = 0;
}

function orderDatabase() {
	//replicates database
	orderedDatabase = dataBase.slice(0);
	if(dataBase.length>0)
	{
		orderedDatabase = orderedDatabase.sort(function(a, b) { return b.likes - a.likes})
	}
	io.emit('updatedLikes', orderedDatabase);
    setTimeout(orderDatabase, secToOrder*1000);
}
orderDatabase();

let port = process.env.PORT || 3003;

server.listen(port);