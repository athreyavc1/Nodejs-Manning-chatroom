//To display untrusted texts entered by the users through converting special character
function divEscapedContentElement(message) {
	return $('<div></div>').text(message);
}

//To display the trusted text added by the system.
function divSystemContentElement(message) {
	return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket){
	var message = $('#send-message').val();
	var systemMessage;

	if(message.charAt(0) === '/'){
		systemMessage = chatApp.processCommand(message);
		if(systemMessage){
			$('#messages').append(divSystemContentElement(systemMessage));
		} else {
			chatApp.sendMessage($('#room').text(), message);
			$('#messages').append(divEscapedContentElement(message));
			$('#messages').scrollTop($('#messages').prop('scrollHeight'));
		}
		$('#send-message').val() = '';
	}
}