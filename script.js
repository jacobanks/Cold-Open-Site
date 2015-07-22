//Insert Parameters into url
function insertParam(key, value) 
{
  key = escape(key); value = escape(value);
  var kvp = document.location.search.substr(1).split('&');
  
  if (kvp !== '') {
      //For some reason with out this it likes to reload a bunch
      location.hash = "Shows";
      //Set the text for url params
      document.location.search = '?' + key + '=' + value;
  }
}

//Check if the page has already loaded once
if (!sessionStorage.done) {
  sessionStorage.done = 'yes';
  
  var showIds = [273181, 121361, 153021, 81189, 247897, 263365, 
                  262980, 95011, 250487, 279121, 80337, 264586, 
                  82283, 75805, 72173, 281593];
  
  //Find random number between 0 and 15 and use that to choose show id
  var random = Math.floor(Math.random() * 15) + 0;
  var randomShow = showIds[random];

  insertParam('ShowId', randomShow);
}

//Get the url parameters
function getUrlParams() 
{
  var paramMap = {};

  if (location.search.length === 0) {
    return paramMap;
  }

  var parts = location.search.substring(1).split("&");

  for (var i = 0; i < parts.length; i ++) {
    var component = parts[i].split("=");
    paramMap [decodeURIComponent(component[0])] = decodeURIComponent(component[1]);
  }

  return paramMap;
}

var params = getUrlParams();
var showId = params.ShowId;
var xml2json = new XMLtoJSON();

//Get List of banners from thetvdb.com
function getBannersWithID(theUrl)
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", theUrl, false );
  xmlHttp.send( null );
  
  var obj = xml2json.fromStr(xmlHttp.responseText);
  var banner = obj.Banners.Banner;
  var bannerPath;

  //Get response and sort through it to find banner with type fanart
  for (var key in banner) {
    if (banner[key].BannerType['#text'] === 'fanart') {
      bannerPath = banner[key].BannerPath['#text'];
    }
      break;
  }

  //Set background image to the banner
  $(document).ready(function () {

    var url = "http://thetvdb.com/banners/" + bannerPath;
    $('body').css('background-image', 'url(' + url + ')');
  });

  return xmlHttp.responseText;
}

//Get show information from show id
function getShowWithId(theUrl) 
{
  var xhr = new XMLHttpRequest();
  xhr.open( "GET", theUrl, false );
  xhr.send( null );

  //Get response and parse to JS object
  var obj = xml2json.fromStr(xhr.responseText);
  console.log(obj);
  //Find Series name, Genre and poster path in object
  var seriesStringName = JSON.stringify(obj.Data.Series.SeriesName['#text']);
  var seriesStringGenre = JSON.stringify(obj.Data.Series.Genre['#text']);
  var seriesPoster = obj.Data.Series.poster['#text'];

  //Get number of seasons
  var seasons = obj.Data.Episode[obj.Data.Episode.length - 2].Combined_season['#text'];

  $(document).ready(function () {
    //Set poster image
    var url = "http://thetvdb.com/banners/" + seriesPoster;
    $('#poster').attr('src',url);

    //Set series name to title
    var seriesName1 = seriesStringName.replace('"', '');
    var seriesName = seriesName1.replace('"', '');
    $('#title').text(seriesName);

    //Replace '|' in genre
    var seriesGenre1 = seriesStringGenre.replace('"|', '');
    var seriesGenre = seriesGenre1.replace('|"', '');
    //Get first genre in genre list
    var seriesGenreSplit = seriesGenre.split('|')[0].toUpperCase();

    //Set season to SEASONS or SEASON depending on # of seasons
    var seasonTitle;
    if (seasons > 1) {
      seasonTitle = ' SEASONS';
    } else {
      seasonTitle = ' SEASON';
    }

    //Set text of subtitle
    $('#subtitle').text(seriesGenreSplit + " | " + seasons + seasonTitle);

    //If mouse enters or leaves button are set the image
    $('#download').mouseenter(function() {
      $('#button').attr('src', 'openButtonHover.png');
    });
    $('#download').mouseleave(function() {
      $('#button').attr('src', 'openButton.png');
    });
  });

    return xhr.responseText;
}

//Call functions to get data from thetvdb.com
getBannersWithID("http://thetvdb.com/api/6824CB0011D4C3A6/series/" + showId +"/banners.xml");
getShowWithId("http://thetvdb.com/api/6824CB0011D4C3A6/series/" + showId + "/all/en.xml" );
