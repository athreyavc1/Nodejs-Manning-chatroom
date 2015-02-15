//To display untrusted texts entered by the users through converting special character
function divEscapedContentElement(message) {
	return $('<div></div>').text(message);
}

//To display the trusted text added by the system.
function divSystemContentElement(message) {
	return $('<div></div>').html('<i>' + message + '</i>');
}