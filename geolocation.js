var coordinatesString  = 'geocode=';
var latestId = '';
var latestUpdate = '';
var range = '';
var measurement = '';


$('document').ready(function(){
	if(navigator.geolocation){
		setupCoordinatesStringAndCallTwitter();
		setInterval("callTwitter()", 30000);
	} else {
		$('#twitterContainer').append('<p>Sorry! The geolocation API is not supported by your browser..no fun for you!</p>');
	}
});

setupCoordinatesStringAndCallTwitter = function(){
		navigator.geolocation.getCurrentPosition(function(position){
			setCoordinatesString(position);
			callTwitter();					
	});
}

setCoordinatesString = function(position){
	coordinatesString += position.coords.latitude + '%2c' + position.coords.longitude + '%2c';
}

callTwitter = function(){
	var stringVal = addRangeAndMeasurement();
	var twitterUrl = 'http://search.twitter.com/search.json?'+ stringVal +'&callback=?';
	$.getJSON(twitterUrl, null, function(tweets){
		var results = tweets.results;
		if(latestId == ''){
			updateLatestVariables(results[0]);
			$.each(results, function(){
				$('#twitterContainer').append(writeTextBlock(this));
			})
		} else {
			var currentTopElement = $('#twitterContainer > :first-child');
			$.each(results, function(){
				if(this.id != latestId && this.created_at > latestUpdate){
					currentTopElement.before(writeTextBlock(this));

					var element = currentTopElement.prev();
					element.css("backgroundColor", "rgb(255,255,204)" );	
					highlight(element);
				}
			})			
			updateLatestVariables(results[0]);		}
	});
}

addRangeAndMeasurement = function(){
	range = $('#range').val();
	measurement = $("input[@name='measurement']:checked").val();
	range = range || '50';
	measurement = measurement || 'km';
	return coordinatesString + range + measurement;
}

highlight = function(elementToUpdate){
	var backgroundColorString = elementToUpdate.css("backgroundColor");
	var blueValue = getBlueValue(backgroundColorString);
	if(blueValue < 255){
		blueValue += 1;
		updateString = "rgb(255,255," + blueValue + ")";
		elementToUpdate.css("backgroundColor", updateString);		
		setTimeout(function(){highlight(elementToUpdate)}, 75);
	}
}

getBlueValue = function(backgroundColor){
	var blue =jQuery.trim(backgroundColor.split(',')[2]);
	return new Number(blue.substring(0,3));
}

writeTextBlock = function(tweet){
	return '<div class="textBlock roundedBox whiteBackground"><img src="' + tweet.profile_image_url + '" class="image" /><div class="from"><a href="http://twitter.com/' + tweet.from_user + '">' + tweet.from_user + '</a></div><div class="created">' + tweet.created_at + '</div><div class="text">' + tweet.text + '</div></div>'
}

updateLatestVariables = function(latestTweet){
	latestId = latestTweet.id;
	latestUpdate = latestTweet.created_at;	
}

