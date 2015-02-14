var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server) {
	io = socketio.listen(server); //Starts the socket io server and allows to piggyback on exisiting HTTP server
	io.set('log level',1);

	io.sockets.on('connection',function(socket){
	guestNumber = assignGuestName(socket, guestNumber, nickNames,namesUsed); //Assigning the user a guest name
	joinRoom(socket, 'Lobby');

	handleMessageBroadcasting(socket, nickNames);
	handleNameChangeAttempts(socket, nickNames, namesUsed);

	handleRoomJoining(socket);

	socket.on('rooms', function() {
		socket.emit('rooms', io.sockets.manager.rooms);
	});

	handleClientDisconnection(socket, nickNames, namesUsed);

	});

}

function assignGuestName(socket, guestNumber, nickNames,namesUsed){
	var name = 'Guest' + guestNumber; //Generate new guest name
	nickNames[socketio.id] = name; //Associate the guest name with the client connection ID

	//Let user know their geust name through emitters over web socket
	socket.emit('nameResult',{
		success:true,
		name: name
	})

	namesUsed.push(name);
	nameResult guestNumber + 1;

}

function joinRoom(socket, room){
	socket.join(room); //Making the user join the room
	currentRoom[socket.id] = room; //Taking a note that the user is in this room now
	socket.emit('joinResult',{room:room}); //Let user know which room they joined to
	//Broadcast to all user that the a new joinee has joined the room
	socket.broadcast.to(room).emit('message', 
		{text: nickNames[socket.id] + ' has joined' + room + '.'});

	//give a summary to the new joinee about who is in the room
	var usersInRoom = io.sockets.clients(room);
	if(usersInRoom.length > 1) {
		var usersInRoomSummary = 'Users currently in ' + room + ': ';
		for(var index in usersInRoom){
			var userSocketId = usersInRoom[index].id;
			if(index > 0){
				usersInRoomSummary += ', '
			}
			usersInRoomSummary += nickNames[userSocketId];
		}
	}
	usersInRoomSummary += '.';
	socket.emit('message',{text: usersInRoomSummary});
}


function handleMessageBroadcasting(socket) {
	socket.on('message', function (message) {
		socket.broadcast.to(message.room).emit('message', 
			{ text: nickNames[socket.id] + ': ' + message.text
		}); 
	});
}

function handleNameChangeAttempts(socket, nickNames, namesUsed){
	socket.on('nameAttempt',function(name){
		if(name.indexOf('Guest') === 0){
			socket.emit('nameResult',
			 {success:false, message: 'Names cannot begin with "Guest"'});
		} else {
			if(namesUsed,indexOf(name) === -1){ //If name is not used by other users then
				var previousName = nickNames[socket.id];
				var previousNameIndex = namesUsed.indexOf(previousName);
				namesUsed.push(name);
				delete namesUsed[previousName];

				//Let user know about the result of the name change
				socket.emit('nameResult', {success:true, name: name});
				//Let other users know about the activity of the user on changing name
				socket.broadcast.to(currentRoom[socket.id]).emit('message', {
					text: previousName + ' is known as ' + name + '.';
				});
			} else {
				//Let user know that the name is taken
				socket.emit('nameResult', {success:false, message: 'That name is already in use'});
			}
		}
	})
}

function handleRoomJoining(socket){
	socket.on('join', function(room){
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket, room,newRoom)
	});
}

function handleClientDisconnection(socket){
	socket.on('disconnect', function(){
		var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
		delete namesUsed[nameIndex];
		delete nickNames[socket.id];
	});
}
