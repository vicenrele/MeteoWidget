$(window).on('load', function(){

	WeatherWidget.init();

});



var WeatherWidget = (function() {

	var exports = {};

	/* Parámetros de comfiguración del método "getCurrentPosition" de geolocalización
	 *
	 */
	var options = {
	    enableHighAccuracy: true,
	    timeout: 5000,
	    maximumAge: 0
	};


	exports.init = function(){
		
		//Primeramente la caja de info meteorológica no está visible para que no muestre los
		//títulos sin rellenar hasta que se hagan las peticiones pertinentes
		View.weatherBoxHidden();
		navigator.geolocation.getCurrentPosition(this.success, this.error, options);
	};



	/* Callback satisfactorio del método "getCurrentPosition" de geolocalización
	 *
	 */
	exports.success = function (pos) {	
	    var crd = pos.coords;
	    WeatherApi.getCityAndCountry(crd.latitude, crd.longitude);
	};



	/* Callback de error del método "getCurrentPosition" de geolocalización, si no hay conexión, salta este error
	 * y la info meteorológica se recoge de localStorage
	 *
	 */
	exports.error = function (err) {
	    console.warn('ERROR(' + err.code + '): ' + err.message);
	    View.renderWeatherBoxFromLocalStorage();
	};	


	return exports;

})();	



var WeatherApi = (function() {

	/* Constantes
	 *
	 */
	var ENDPOINT = 'http://api.wunderground.com/api/8056d793049f14ea/'; 


	var exports = {};


	/* Función que obtiene, a partir de la latitud y longitud, el nombre de la ciudad y el código del país
	 *
	 * @param latitude latitud 
	 * @idCountry longitude longitud
	 */
	exports.getCityAndCountry = function (latitude, longitude){		
		var self = this;
		$.ajax({
			type: 'GET',
			url: ENDPOINT + 'geolookup/q/'+ latitude +','+ longitude +'.json',
			success: function(coords){			
	     	 	self.getWeatherData(coords.location.city, coords.location.country_iso3166);				
			}
		});	 
	};


	/* Función que hace una petición a la API de wunderground.com para obtener los datos meteorológicos.
	 * También almacena los datos en localStorage por si no hay conexión a Internet 
	 *
	 * @param city ciudad 
	 * @idCountry identificador del país
	 */
	exports.getWeatherData = function(city, idCountry){
		$.ajax({
			type: 'GET',
			url: ENDPOINT + 'conditions/q/'+ idCountry +'/'+ city +'.json',
			success: function(responseObj){
	     	 	var d = new Date(),
	     	 	weatherObj = {
	     	 		'date' : d.toLocaleString(),
	     	 		'city' : responseObj.current_observation.display_location.full,
	     	 		'lat' : responseObj.current_observation.observation_location.latitude,
	     	 		'lon' : responseObj.current_observation.observation_location.longitude,
	     	 		'image' : responseObj.current_observation.icon_url,
	     	 		'temperature' : responseObj.current_observation.temp_c.toString()+ ' ºC',
	     	 		'humidity' : responseObj.current_observation.relative_humidity,
	     	 		'wind' : responseObj.current_observation.wind_kph.toString()+ ' Km/h'
	     	 	};

	     	 	localStorage.setItem('weatherObj', JSON.stringify(weatherObj));

	     	 	View.renderWeatherBox(weatherObj);			
			}
		});
	};

	return exports;

})();		


var View = (function() {

	var exports = {};

	/* Función que oculta la caja del widget
	 *
	 */
	exports.weatherBoxHidden = function(){
		$('#weatherBox').css('visibility', 'hidden');
	};


	/* Función que renderiza la caja de información meteorológica a partir de los datos que se le pasan
	 *
	 * @param weatherObj objeto con todos los datos meteorológicos necesarios
	 */
	exports.renderWeatherBox = function(weatherObj){
		$('#date').html(weatherObj.date);
		$('#city').html(weatherObj.city);
		$('#lat').html(weatherObj.lat);
		$('#lon').html(weatherObj.lon);
		$('#image').attr('src', weatherObj.image);
		$('#temperature').html(weatherObj.temperature);
		$('#humidity').html(weatherObj.humidity);
		$('#wind').html(weatherObj.wind);

		$('#weatherBox').css('visibility', 'visible');
	};

	/* Función que renderiza la caja de información meteorológica a partir de los datos de localStorage
	 *
	 */
	exports.renderWeatherBoxFromLocalStorage = function(){
		this.renderWeatherBox(JSON.parse(localStorage.getItem('weatherObj')));
	};	

	return exports;

})();			