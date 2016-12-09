var artistName;
var songList = {};

// Searches setlist.fm for specified artist and updates dropdown with list of artists
search = function() {
	artistName = document.getElementById("artist").value;
	 
	var artist;
	var selectedID;
	 
	// Clear dropdown menu/song list
	$("#artistOptions").empty();
	songList = {};
	 
	// Perform setlist.fm artist search
	$.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%27https%3A%2F%2Fapi.setlist.fm%2Frest%2F0.1%2Fsearch%2Fartists.json%3FartistName%3D" +  encodeURI(encodeURI(artistName)) + "%26callback%3Djson1%27%0A&format=json", function(response){
		
		// Parse YQL response for actual setlist.fm JSON response
		var response = JSON.parse(response.query.results.body);
		
		// Update dropdown list with found artists
		if (response.artists["@total"] == 1) {
			artist = response.artists.artist["@name"];
			selectedID = response.artists.artist["@mbid"];
			$("#artistOptions").append('<li><a href="javascript:setlistSearch(&#39;' + selectedID + '&#39;)">' + artist + '</a></li>');
		}
		else {
			for (var i in response.artists.artist) {
				artist = response.artists.artist[i]["@name"];
				if (response.artists.artist[i]["@disambiguation"] != "") {
					artist = artist + " (" + response.artists.artist[i]["@disambiguation"] + ")";
				}
				selectedID = response.artists.artist[i]["@mbid"];
				$("#artistOptions").append('<li><a href="javascript:setlistSearch(&#39;' + selectedID + '&#39;)">' + artist + '</a></li>');
			}
		}
	 }); 
 }
 
 // Search for an artist's setlists by mbid and generate embedded player
 function setlistSearch(mbid) { 
	$.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%27https%3A%2F%2Fapi.setlist.fm%2Frest%2F0.1%2Fartist%2F" + mbid + "%2Fsetlists.json%27%0A&format=json", function(response){
		
		var getSetlist = JSON.parse(response.query.results.body);
		
		// Go through setlists and add songs in each setlist to dictionary
		for (setNum in getSetlist.setlists.setlist) {
			// skip empty setlists
			if (getSetlist.setlists.setlist[setNum].sets == "") {
				continue;
			}
			
			// Multiple sets per setlist case
			if (getSetlist.setlists.setlist[setNum].sets.set.song == undefined) {
				// Go through sets in setlist
				for (setNumber in getSetlist.setlists.setlist[setNum].sets.set) {
					// Single song in set case
					if (getSetlist.setlists.setlist[setNum].sets.set[setNumber].song["@name"] != undefined) {
						// Add or increment song count to dictionary 
						if (songList[getSetlist.setlists.setlist[setNum].sets.set[setNumber].song["@name"].toLowerCase()] == undefined) {
							songList[getSetlist.setlists.setlist[setNum].sets.set[setNumber].song["@name"].toLowerCase()] = 1;
						}
						else {
							songList[getSetlist.setlists.setlist[setNum].sets.set[setNumber].song["@name"].toLowerCase()]++;
						}
					}
					// Multiple songs in set case
					else {					
						// Go through all songs in setlist
						for (songNum in getSetlist.setlists.setlist[setNum].sets.set[setNumber].song) {
							// Add or increment song count to dictionary 
							if (songList[getSetlist.setlists.setlist[setNum].sets.set[setNumber].song[songNum]["@name"].toLowerCase()] == undefined) {
								songList[getSetlist.setlists.setlist[setNum].sets.set[setNumber].song[songNum]["@name"].toLowerCase()] = 1;
							}
							else {
								songList[getSetlist.setlists.setlist[setNum].sets.set[setNumber].song[songNum]["@name"].toLowerCase()]++;
							}
						}
					}
				}
			}
			// Single set in setlist
			else {
				// Single song in set case
				if (getSetlist.setlists.setlist[setNum].sets.set.song["@name"] != undefined) {
					// Add or increment song count to dictionary 
					if (songList[getSetlist.setlists.setlist[setNum].sets.set.song["@name"].toLowerCase()] == undefined) {
					
						songList[getSetlist.setlists.setlist[setNum].sets.set.song["@name"].toLowerCase()] = 1;
					}
					else {
						songList[getSetlist.setlists.setlist[setNum].sets.set.song["@name"].toLowerCase()]++;
					}
				}
				// Multiple songs in set case
				else {	
					// Go through all songs in setlist
					for (songNum in getSetlist.setlists.setlist[setNum].sets.set.song) {
						// Add/increment song count to dictionary 
						if (songList[getSetlist.setlists.setlist[setNum].sets.set.song[songNum]["@name"].toLowerCase()] == undefined) {
			
							songList[getSetlist.setlists.setlist[setNum].sets.set.song[songNum]["@name"].toLowerCase()] = 1;
						}
						else {
							songList[getSetlist.setlists.setlist[setNum].sets.set.song[songNum]["@name"].toLowerCase()]++;
						}
					}
				}
			}
		}
		
		songList = sortPlaylist(songList);
		
		// Initialize array of promises
		var playlist = [];
		for (key in songList) {
			console.log(key);
			// Check for empty keys
			if (key != "") {
				playlist.push(getTrack(key));
			}
		}
		
		// Collect all spotify track ids into one string for embed player when all requests finished
		$.when.apply($, playlist).done(function(){
			var playlistString = "";
			for (var i = 0; i < playlist.length; i++) {
				if (playlist[i].responseJSON.tracks.items.length > 0) {
					playlistString = playlistString + playlist[i].responseJSON.tracks.items[0].id + ",";
				}
			}
			playlistString = playlistString.substring(0,playlistString.length - 1);
			$("#songs").append('<iframe src="https://embed.spotify.com/?uri=spotify:trackset:SETLIST:' + playlistString +'" frameborder="0" width="300" height="500" allowtransparency="true"></iframe>');
		});
	});
 }

 // Search for track in spotify and return promise
 function getTrack(key) {
	console.log(key + " request");
	// Strip special characters
	key = key.replace(/[^\w\s]/gi, '');
	return $.getJSON("https://api.spotify.com/v1/search?q=" + key + " " + artistName + "&type=track");
 }

 // Sort songList dictionary by song frequency
 function sortPlaylist(songList) {
	var sortedPlaylist = [];
	 
	for (var song in songList) {
		sortedPlaylist.push([song, songList[song]]);
		
		// custom sort by value
		sortedPlaylist.sort(function(a,b) {
			return b[1] - a[1];
		})
	}
	return arrayToJSON(sortedPlaylist);
 }
 
 // Converts from array of key-value pairs to JSON
 function arrayToJSON(songArray) {
	var songJSON = {};
	for (var i = 0; i < songArray.length; i++) {
		songJSON[songArray[i][0]] = songArray[i][1];
	}
	return songJSON;
 }
