var artistName;
var songList = {};

search2 = function() {
	 songList = {};
	 artistName = document.getElementById("artist").value;
	 //var tracks = 13;
	 var pageToCheck = 1;
	 var finalSongCount = 9;
	 
	 var setlist_apikey = "e84e5963-545c-4637-adb7-ed108e5caf3f";
	 //var lastfm_apikey = "1410c46a332507dc096a677ecd424b7d";
	 var mbid;
	 var numtracks = 0;
	 var songs = new Object(); 
	 
	 var artist;
	 var selectedID;
	 
	 console.log("Searching");
	 
	 $.getJSON("https://api.setlist.fm/rest/0.1/search/artists.json?artistName=" + artistName + "&callback=blah",function(response){
		 
		$("#artistOptions").empty();
		
		if (response.artists["@total"] == 1) {
			artist = response.artists.artist["@name"];
			selectedID = response.artists.artist["@mbid"];
			//console.log(response.artists.artist["@mbid"]);
			$("#artistOptions").append('<li><a href="javascript:setlistSearch(&#39;' + selectedID + '&#39;)">' + artist + '</a></li>');
		}
		else {
			for (var i in response.artists.artist) {
				if (response.artists.artist[i]["@disambiguation"] == "") {
					artist = response.artists.artist[i]["@name"];
				}
				else {
					artist = response.artists.artist[i]["@name"] + "(" + response.artists.artist[i]["@disambiguation"] + ")";
				}
				selectedID = response.artists.artist[i]["@mbid"];
				$("#artistOptions").append('<li><a href="javascript:setlistSearch(&#39;' + selectedID + '&#39;)">' + artist + '</a></li>');
			}
		}
		
	 });
 }
 
 function setlistSearch(mbid) {
	console.log(mbid);
	

	$.getJSON("https://api.setlist.fm/rest/0.1/artist/" + mbid + "/setlists.json", function(getSetlist) {
		//console.log(getSetlist.setlists["@total"]);
		for (setNum in getSetlist.setlists.setlist) {
			//console.log(getSetlist.setlists.setlist[setNum].sets);
			if (getSetlist.setlists.setlist[setNum].sets == "") {
				console.log("skip");
				continue;
			}
			
			if (getSetlist.setlists.setlist[setNum].sets.set.song == undefined) {
				
				for (setNumber in getSetlist.setlists.setlist[setNum].sets.set) {
					if (getSetlist.setlists.setlist[setNum].sets.set[setNumber].song["@name"] != undefined) {
						
						if (songList[getSetlist.setlists.setlist[setNum].sets.set[setNumber].song["@name"].toLowerCase()] == undefined) {
							//console.log(getSetlist.setlists.setlist[setNum].sets.set[setNumber].song["@name"]);
							songList[getSetlist.setlists.setlist[setNum].sets.set[setNumber].song["@name"].toLowerCase()] = 1;
						}
						else {
							songList[getSetlist.setlists.setlist[setNum].sets.set[setNumber].song["@name"].toLowerCase()]++;
						}
					}
					else {					
						for (songNum in getSetlist.setlists.setlist[setNum].sets.set[setNumber].song) {
							
							if (songList[getSetlist.setlists.setlist[setNum].sets.set[setNumber].song[songNum]["@name"].toLowerCase()] == undefined) {
								//console.log(getSetlist.setlists.setlist[setNum].sets.set[setNumber].song[songNum]["@name"]);
								songList[getSetlist.setlists.setlist[setNum].sets.set[setNumber].song[songNum]["@name"].toLowerCase()] = 1;
							}
							else {
								songList[getSetlist.setlists.setlist[setNum].sets.set[setNumber].song[songNum]["@name"].toLowerCase()]++;
							}
						}
					}
				}
			}
			else {
				if (getSetlist.setlists.setlist[setNum].sets.set.song["@name"] != undefined) {
					
					if (songList[getSetlist.setlists.setlist[setNum].sets.set.song["@name"].toLowerCase()] == undefined) {
					
						songList[getSetlist.setlists.setlist[setNum].sets.set.song["@name"].toLowerCase()] = 1;
					}
					else {
						songList[getSetlist.setlists.setlist[setNum].sets.set.song["@name"].toLowerCase()]++;
					}
				}
				else {					
					for (songNum in getSetlist.setlists.setlist[setNum].sets.set.song) {
						
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
		
		console.log("Sorting");
		songList = sortPlaylist(songList);
		songList = arrayToJSON(songList);
		
		var playlist = [];
		
		for (key in songList) {
			console.log(key);
			playlist.push(getTrack(key));
		}

		var playlistString = "";
		
		$.when.apply($, playlist).done(function(){
			console.log("DONE")
			for (var i = 0; i < playlist.length; i++) {
				//console.log(playlist[i].responseJSON.tracks.items);
				if (playlist[i].responseJSON.tracks.items.length > 0) {
					//console.log(playlist[i].responseJSON.tracks.items[0].id);
					playlistString = playlistString + playlist[i].responseJSON.tracks.items[0].id + ",";
				}
			}
			playlistString = playlistString.substring(0,playlistString.length - 1);
			//console.log(playlistString);
			
			$("#songs").append('<iframe src="https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:' + playlistString +'" frameborder="0" width="250" height="300" allowtransparency="true"></iframe>');
		});
	});
 }

 function getTrack(key) {
	console.log(key + " request");
	// Strip special characters
	key = key.replace(/[^\w\s]/gi, '')
	return $.getJSON("https://api.spotify.com/v1/search?q=" + key + " " + artistName + "&type=track");
 }

 function sortPlaylist(songList) {
	 var sortedPlaylist = [];
	 
	 for (var song in songList) {
		sortedPlaylist.push([song, songList[song]]);
		
		sortedPlaylist.sort(function(a,b) {
			return b[1] - a[1];
		})
	 }
	 return sortedPlaylist;
 }
 
 function arrayToJSON(songArray) {
	var songJSON = {};
	for (var i = 0; i < songArray.length; i++) {
		songJSON[songArray[i][0]] = songArray[i][1];
	}
	return songJSON;
 }
