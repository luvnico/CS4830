var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	mongoose = require('mongoose'),
	users = {};
	
server.listen(8080, function(){
	console.log('listening on *:8080');
});

mongoose.connect('mongodb://localhost/chat', function(err){
	if(err){
		console.log(err);
	} else{
		console.log('Connected to mongodb!');
	}
});

var chatSchema = mongoose.Schema({
	nick: String,
	msg: String,
	created: {type: Date, default: Date.now}
});

var Chat = mongoose.model('Message', chatSchema);

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	var query = Chat.find({});
	
	//display the latest 8 messages
	query.sort('-created').limit(8).exec(function(err, docs){
		if(err) throw err;
		socket.emit('load old msgs', docs);
	});
	
	socket.on('new user', function(data, callback){
		if (data in users){
			callback(false);
		} else{
			callback(true);
			socket.nickname = data;
			users[socket.nickname] = socket;
			
			updateNicknames();
			
		}
	});
	
	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(users));
		socket.emit('display current user', socket.nickname);
	}

	socket.on('send message', function(data, callback){
		//delete extra white space at the beginning of the message
		var msg = data.trim();
		if(msg === '')
			callback('Error! Please enter a message.');	
		else if(msg.substr(0,3) === '/w '){
			msg = msg.substr(3);
			var ind = msg.indexOf(' ');
			if(ind !== -1){
				//extract the username
				var name = msg.substring(0, ind);
				
				//extract the whisper message
				var msg = msg.substring(ind + 1);
				
				//if the user specified is currently online
				if(name in users){
					//prevent users from sending whisper to themselves
					if(name != socket.nickname){
						//only send whisper to the specified user and the sender
						users[name].emit('whisper', {msg: msg, nick: socket.nickname, receiver: name, sender: false});
						socket.emit('whisper', {msg: msg, nick: socket.nickname, receiver: name, sender: true});
					
						console.log('message sent is: ' + msg);
						console.log('A whisper is sent!');
					}else{
						callback('Sorry, you cannot send whisper to yourself.');
					}	
				} else{
					callback('Error! Please enter a valid user.');
				}
			} else{
				callback('Error! Please enter a message for your whisper.');
			}
		} else{
			var newMsg = new Chat({msg: msg, nick: socket.nickname});
			newMsg.save(function(err){
				if(err) throw err;
				io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
			});
		}
	});
	
	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname];
		updateNicknames();
	});
});