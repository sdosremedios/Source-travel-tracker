/*
	display a count from a date-time

	Steven dosRemedios	-	02 Jan 2018
*/

var _beg = new Date('07/11/1966 2:00 PM');
var _timer = setInterval(showRemaining, 1000);

function showRemaining() {
	var now = new Date();
	var distance = now - _beg;
	if (distance < 0) {
		clearInterval(_timer);
		jQuery('.countup').text('is in the future!');
		return;
	}
	var days = Math.floor(distance / 86400000);
	var hours = Math.floor((distance % 86400000) / 3600000);
	var minutes = Math.floor((distance % 3600000) / 60000);
    var seconds = Math.floor((distance % 60000) / 1000);
    var years = Math.floor(days / 365.25);
	var text;
	
	if (days < 1) {
		text = days + ' days ' + f2(hours) + ':' + f2(minutes) + ':' + f2(seconds);
	} else if (days < 2) {
		text = days + ' days ' + f2(hours) + ':' + f2(minutes);
	} else if (days < 8) {
		text = days + ' days ' + f2(hours) + ' hours';
	} else if (days > 366) {
		text = days + ' days ' + f2(hours) + ' hours';
	} else {
		text = days + ' days';
	}

/*	text = days + ' days ' + f2(hours) + ':' + f2(minutes) + ':' + f2(seconds);	*/

	jQuery('.countup').text('was ' + text + ' ago');
}
function lPad(text,n) {
	var x = '0'.repeat(n) + text;
	return x.slice(-n);
}
function f2(text) {
	return lPad(text,2);
//	return text;
}
showRemaining(); 
