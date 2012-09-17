var net = require('net');

String.prototype.splitBetter = splitBetter;
String.prototype.splitNative = String.prototype.split;
String.prototype.splitSwitch = splitSwitch; // splitSwitch() should replace the native split(), but the Windows build I'm using craps out when I try to do that.

var buffer = '';

var socket = net.createConnection(6667,'jckf.no');
socket.setNoDelay(true);
socket.on('connect',evRegister);
socket.on('data',evBuffer);

function evRegister() {
	socket.write('USER NodeBot * * :Node Bot' + "\n");
	socket.write('NICK NodeBot' + "\n");
}
function evBuffer(data) {
	buffer += String(data);
	while (buffer.indexOf("\n") >= 0) {
		var toParse = buffer.substr(0,buffer.indexOf("\n") + 1);
		toParse = toParse.replace(/[\r\n]/g,'');
		parse(toParse);
		buffer = buffer.substr(buffer.indexOf("\n") + 1);
	}
}
function parse(data) {
	var segments = data.splitSwitch(/ :?/,4); // This could be using split() if the prototypes above worked.
	var command = segments[0].substr(0,1) != ':' ? segments[0] : segments[1];
	segments[0] = segments[0].substr(0,1) != ':' ? segments[0] : segments[0].substr(1);

	switch (command) {
		case 'PING':
			socket.write('PONG ' + data.split(' ',2)[1] + "\n");
			break;

		case '001':
			socket.write('JOIN #koding' + "\n");
			break;

		case 'PRIVMSG':
			console.log(segments[2] + ' ' + segments[0].split('!',2)[0] + ': ' + segments[3]);
			if (segments[3].substr(0,1) == '!') {
				var input = segments[3].substr(1).splitSwitch(' ',2);
				switch (input[0]) {
					case 'js':
						var result;
						try {
							 result = String(eval(input[1]))
						} catch (e) {
							result = 'Error: ' + e;
						}
						socket.write('PRIVMSG ' + segments[2] + ' :' + segments[0].split('!',2)[0] + ': ' + result.replace(/[\r\n]/,'') + "\n");
						break;
				}
			}
			break;

		default:
			console.log('Unknown command "' + command + '"!');
			break;
	}
}

function splitBetter(delimiter,limit) {
	var string = this;
	var segments = [];
	for (var i = 0; i < limit; i++) {
		segments.push(string.split(delimiter,2)[0]);
		string = string.substr(string.search(delimiter));
		if (i + 1 < limit) {
			string = string.replace(delimiter,'');
		}
	}
	segments[limit - 1] += string;
	return segments;
}
function splitSwitch(delimiter,limit) {
	if (this.split(delimiter).length > limit) {
		return this.splitBetter(delimiter,limit);
	} else {
		return this.splitNative(delimiter,limit);
	}
}
