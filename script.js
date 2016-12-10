search = function() {
	 var searchterm = "mac demarco";
	 searchterm = document.getElementById("artist").value;
	 //var tracks = 13;
	 var pageToCheck = 1;
	 var finalSongCount = 9;
	 
	 var setlist_apikey = "e84e5963-545c-4637-adb7-ed108e5caf3f";
	 var lastfm_apikey = "1410c46a332507dc096a677ecd424b7d";
	 var mbid;
	 var numtracks = 0;
	 var songs = new Object(); 
	 
	 $.getJSON("http://ws.audioscrobbler.com/2.0?method=artist.search&artist="+ searchterm + "&api_key=" + lastfm_apikey + "&format=json&callback=?", function(json){
		mbid = json.results.artistmatches.artist[0].mbid;
		console.log("http://api.setlist.fm/rest/0.1/artist/" + mbid + "/setlists.json");
		
		$.getJSON("http://api.setlist.fm/rest/0.1/artist/" + mbid + "/setlists.json?p=" + pageToCheck + "&callback=json1", function(json1){
			//json1 = json1.parse();
			var songCount = 0;
			var setNum = 0;
			var Set;
			
			// Collect x amount of songs
			for (var setNum = 0; setNum < json1.setlists.setlist.length; setNum++) {
				Set = json1.setlists.setlist[setNum];
				
				if (Set.sets == ""){ 
					console.log(Set.url);
					continue;
				}
				else if ($.isArray(Set.sets.set)){
					for (k = 0; k < Set.sets.set.length; k++){
						console.log("Set #" + k);
						songs = getSetSongs(songs,Set.sets.set[k]);
					}
				}
				else {
					songs = getSetSongs(songs,Set.sets.set);
				}
			}
			
			// Convert JSON object to array prior to sorting
			var finalSongs = new Array();
			for (song in songs){
				  finalSongs.push({name: song, count:songs[song]});
			};
			
			// Sort songs according to count
			finalSongs = finalSongs.sort(function(a,b){
				return (a.count > b.count)?-1:((a.count == b.count)?0:1);});
			
			// Print songs according to count
			document.getElementById("songs").innerHTML = "";
			for (i = 0; i < finalSongCount; i++) {
				console.log(finalSongs[i].name + " " + finalSongs[i].count);
				$("p").append(finalSongs[i].name + '<br>');
			}
		});
	 });
 };
 
 // Pull all songs in setlist to songs dictionary
 var getSetSongs = function(songs,setlist) {
	
	var setLength = setlist.song.length;
	//if (setLength == null) {setLength = 1;};
	console.log("Set Length: " + setLength);
	var song;
	
	for (var i = 0; i < setLength; i++){
		song = setlist.song[i]['@name'].toLowerCase();		
		console.log(song);
		if (song in songs) {
			songs[song]++;
		}
		else {
			songs[song] = 1;
		}
	}
	return songs;
 }
 /*
 var test = function(){
	 var searchterm = 
	 $.getJSON("http://api.genius.com/search?q=" + searchterm + "&access_token=Et0edLuuw1UqlTV1QlvgUg0WNPqmAgNnJ5UbbB6giV74xIZyJic2JxvNpzeXYGCa&callback=json", function(json){
				alert(json);
			});
 }*/
