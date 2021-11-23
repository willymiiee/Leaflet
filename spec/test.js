console.log("console.log output")

const fs = require('fs');
const readline = require('readline');


var links = [];
var success = []
var fail = []

function parseLinkFromText(text){
	const links = [];
	var myRegexp = new RegExp("href=\"(.+?)\"", "g");
	match = myRegexp.exec(text);
	while (match != null) {
		const link = match[1];
		if(!link.startsWith("#")){
			links.push(link);
		}
		match = myRegexp.exec(text);
	}
	return links;
}


var request = (function() {
	var url = require('url'),
		adapters = {
			'http:': require('http'),
			'https:': require('https'),
		};

	return function(inputUrl) {
		return adapters[new url.URL(inputUrl).protocol]
	}
}());

var options = {
	'method': 'GET',
	headers: {
		'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
		'Accept': '/',
		'Connection': 'keep-alive'
	}
}
function fetch(link){
	return new Promise(function(resolve, reject) {
		const error = (res)=>{
			if (res.statusCode === 429) {
				reject(link);
				return;
			}
			const obj = {
				link,
				res,
				status: res.statusCode,
				header: headerToKeyValue(res.rawHeaders)
			};
			fail.push(obj);
			resolve(obj);
		};

		const req = request(link).get(link, options, res => {
			//console.log(`statusCode: ${res.statusCode}`)
			if (res.statusCode === 200) {
				const obj = {
					link,
					res,
					status: res.statusCode,
					header: headerToKeyValue(res.rawHeaders)
				};
				success.push(obj);
				resolve(obj)
			} else {
				error(res)
			}

			// Create html file from response of a website
			/*
			var chunks = [];
			res.on("data", function (chunk) {
				chunks.push(chunk);
			});
			res.on("end", function (chunk) {
				var body = Buffer.concat(chunks);
				fs.writeFile("response.html", body.toString(), (err => console.error(err)));
			});
			 */
		}).on('error', res => {
			error(res)
		});

		req.end()
	})
}

var xi = 0;
function finalCheck(){
	if(links.length !== success.length + fail.length && xi < 20){
		console.log("Not done yet!");
		xi++;
		setTimeout(finalCheck,5000);
		return false;
	} else if(links.length === success.length){
		console.log("All links are working!");
		console.log(success.length + " of "+links.length+" working!");
	} else {
		console.log(fail.length + " of "+links.length+" failed!");
		//var filteredFail = fail.filter(x=>x.status === 404)
		fail.forEach((x)=>{
			console.log(x.link, x.status, x.redirectUrl)
		})

	}
	createTable();

	return true;
}

function run(){
	const rl = readline.createInterface({
		input: fs.createReadStream('./docs/plugins.md'),
		crlfDelay: Infinity
	});
	var idx = 0;
	rl.on('line', (line) => {
		if(line.indexOf('<a') > -1) {
			//console.log(`Line from file: ${line}`);
			parseLinkFromText(line).forEach((link)=>{
				links.push(link);

			});
			idx++;
		}
	});
	rl.on('close',()=>{
		startFetch();
	});
}

var sameIdx = {};
function startFetch(idx = 0){
	if(links.length <= idx) {
		finalCheck()
		console.log('Ende?')
	} else {
		var url = links[idx].trim();
		console.log('Fetch',url,(idx + 1)+ ' of '+links.length)
		fetch(url).then(response => {
			if(response.status === 301){
				const simpleRequest = (data, link) =>{
					return new Promise(function(_resolve, _reject) {
						try {
							request(link).get(link, options, res => {
								//console.log(`statusCode: ${res.statusCode}`)
								if (res.statusCode === 200) {
									data.redirectUrl = link;
									_resolve(data)
								} else if (res.statusCode === 301) {
									const header = headerToKeyValue(res.rawHeaders) || {};
									simpleRequest(data, header.Location).then(redirect => {
										_resolve(redirect)
									})
								} else {
									_resolve(data)
								}
							}).on('error', res => {
								_resolve(data);
							});
						}catch (e) {
							_resolve(data);
						}
					})
				};
				simpleRequest(response, response.header.Location).then((data)=>{
					startFetch(++idx);
				});
			}else{
				startFetch(++idx);
			}
		}).catch((e)=>{
			console.log('TEST')
			sameIdx[idx] = sameIdx[idx] ? sameIdx[idx] + 1 : 1;
			console.log('Error',idx, e, sameIdx[idx]);
			if(sameIdx[idx] < 20) {
				sleep(1000).then(()=>{
					console.log('Retry',idx,e);
					startFetch(idx);
				})
			}else{
				startFetch(++idx);
			}
		})
	}
}


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


links = [
	'http://esri.github.io/esri-leaflet',
	'https://earthdata.nasa.gov/gibs',
	'http://kartverket.no/Kart/Gratis-kartdata/Cache-tjenester/',
	'http://webmap.arcticconnect.org',
	'https://github.com/gmaclennan/leaflet-bing-layer',
	'https://msdn.microsoft.com/en-us/library/ff701721.aspx',
	'https://supermap.github.io/supermap-leaflet',
	'https://mierune.co.jp/tile.html',
	'https://github.com/mylen/leaflet.TileLayer.WMTS',
	'http://bellard.org/bpg/',
	'https://github.com/mapbox/TileJSON',
	'http://www.kartena.se/',
	'http://vizzuality.github.com/cartodb-leaflet/',
	'http://cartodb.com/',
	'http://vizzuality.com/',
	'http://iipimage.sourceforge.net/',
	'http://iiif.io/',
	'http://github.com/commenthol/gdal2tiles-leaflet',
	'http://commenthol.github.io/leaflet-rastercoords',
	'https://github.com/ScanEx/Leaflet.imageTransform',
	'http://www.digital-democracy.org',
	'https://consbio.github.io/Leaflet.UTFGrid/',
	'https://dayjournal.github.io/Leaflet.Control.Opacity',
	'http://www.outdooractive.com',
	'https://github.com/robertomlsoares/leaflet-offline',
	'https://robertomlsoares.github.io/leaflet-offline/',
	'http://spatialdev.com/',
	'https://github.com/devTristan/hoverboard',
	'http://tristan.io/hoverboard/',
	'http://tristan.io/',
	'https://github.com/IvanSanchez/Leaflet.VectorGrid',
	'https://github.com/IvanSanchez/Leaflet.VectorGrid#demos',
	'https://github.com/IvanSanchez/Leaflet.VectorGrid',
	'http://arthur-e.github.com/Wicket/',
	'http://qgis.org/',
	'http://www.opengeospatial.org/standards/wfs',
	'http://papaparse.com/',
	'https://dj0001.github.io/Leaflet.mytrack',
	'https://dj0001.github.io/Leaflet.Sun',
	'https://dj0001.github.io/Leaflet.timezones',
	'http://github.com/GEOF-OSGL/Leaflet.EdgeScaleBar',
	'http://geof-osgl.github.io/Leaflet.EdgeScaleBar/',
	'http://github.com/GEOF-OSGL',
	'https://github.com/barryhunter/Leaflet.GeographPhotos',
	'https://github.com/lvoogdt/Leaflet.awesome-markers',
	'http://www.lennardvoogdt.nl',
	'http://www.corysilva.com',
	'https://www.mapbox.com/maki/',
	'https://github.com/IvanSanchez/Leaflet.Icon.Glyph',
	'http://longitude.me',
	'http://heyman.info',
	'http://wiki.openstreetmap.org/wiki/Geojson_CSS',
	'http://osmbuildings.org/',
	'https://github.com/gismartwaredev/leaflet.orientedMarker',
	'https://github.com/gismartwaredev',
	'http://www.mapkeyicons.com',
	'http://timwis.com/leaflet-choropleth/examples/basic',
	'http://timwis.com',
	'http://blog.cartodb.com/stacking-chips-a-map-hack/',
	'https://w8r.github.io/leaflet-labeled-circle/demo/',
	'http://mikhail.io/demos/leaflet-corridor/',
	'https://github.com/triedeti/Leaflet.streetlabels',
	'https://triedeti.github.io/Leaflet.streetlabels/',
	'https://github.com/triedeti',
	'https://github.com/react-map/leaflet.magicMarker',
	'https://react-map.github.io/leaflet.magicMarker/',
	'https://github.com/react-map',
	'https://gitlab.com/u/IvanSanchez',
	'https://onaci.github.io/leaflet-point-animator',
	'https://onaci.github.io/leaflet-temporal-geojson',
	'http://mackerron.com',
	'https://github.com/yellowiscool',
	'http://www.patrick-wied.at/static/heatmapjs/example-heatmap-leaflet.html',
	'https://github.com/dpiccone/leaflet-div-heatmap',
	'http://www.geog.uni-heidelberg.de/gis/index_en.html',
	'http://d3js.org',
	'https://github.com/ecomfe/echarts',
	'https://github.com/react-map/leaflet.migrationLayer',
	'https://react-map.github.io/leaflet.migrationLayer',
	'https://github.com/react-map',
	'http://www.pixijs.com/',
	'https://github.com/danwild/leaflet-velocity',
	'https://danwild.github.io/leaflet-velocity',
	'http://www.kartena.se/',
	'https://github.com/yohanboniface/Leaflet.Editable',
	'http://yohanboniface.me/',
	'https://w8r.github.io/Leaflet.Path.Drag',
	'https://w8r.github.io/Leaflet.Path.Transform',
	'https://willfarrell.github.io/Leaflet.Clipper',
	'https://github.com/yellowiscool',
	'https://github.com/yohanboniface/Leaflet.Storage',
	'http://yohanboniface.me/',
	'https://github.com/manleyjster/Leaflet.Illustrate',
	'http://manleyjster.github.io/Leaflet.Illustrate/examples/0.0.2/simple/',
	'https://github.com/manleyjster',
	'http://apps.socib.es/Leaflet.TimeDimension/examples/index.html',
	'http://www.socib.eu',
	'http://d3js.org/',
	'http://www.naomap.fr',
	'http://labs.easyblog.it',
	'http://erictheise.github.com/rrose',
	'http://www.linkedin.com/in/erictheise',
	'http://yohanboniface.me',
	'http://github.com/perliedman',
	'http://heyman.info',
	'https://w8r.github.io/L.Control.LineStringSelect',
	'http://labs.easyblog.it/maps/leaflet-geojson-selector/',
	'http://labs.easyblog.it/stefano-cudini/',
	'http://pezzo.org',
	'https://mkong0216.github.io/leaflet-shades/examples',
	'http://zakjan.github.io/leaflet-lasso/',
	'https://github.com/ismyrnow/Leaflet.groupedlayercontrol',
	'http://robbie.io/',
	'http://labs.easyblog.it',
	'http://scanex.github.io/Leaflet-IconLayers/examples',
	'http://rawgit.com/bambrikii/leaflet-layer-tree-plugin/master/examples/basic-example.htm',
	'http://kartena.github.com/Leaflet.Pancontrol/',
	'http://www.kartena.se/',
	'http://kartena.github.com/Leaflet.zoomslider/',
	'http://www.kartena.se/',
	'https://github.com/yellowiscool',
	'https://consbio.github.io/Leaflet.ZoomBox',
	'https://developers.arcgis.com/javascript/jssamples/widget_home.html',
	'https://github.com/mapbox/Leaflet.fullscreen',
	'https://github.com/turban/Leaflet.Sync',
	'http://prominentedge.com/leaflet-measure-path/',
	'http://prominentedge.com/',
	'http://www.newlighttechnologies.com/',
	'http://mahmoodvcs.github.io/Leaflet.NACCoordinates/',
	'http://labs.easyblog.it/maps/leaflet-locationpicker/',
	'http://www.mapcode.com',
	'https://cliffcloud.github.io/Leaflet.Sleep',
	'http://prominentedge.com/',
	'https://cliffcloud.github.io/Leaflet.EasyButton',
	'https://github.com/nickpeihl/leaflet-sidebar-v2/',
	'http://yohanboniface.me',
	'https://github.com/manleyjster',
	'https://github.com/gregallensworth/L.Control.Credits',
	'http://fgnass.github.com/spin.js/',
	'http://www.motionintelligence.net/',
	'https://cliffcloud.github.io/Leaflet.LocationShare',
	'http://labs.easyblog.it/',
	'http://trac.osgeo.org/proj4js/',
	'http://www.kartena.se/',
	'https://github.com/tmcw/leaflet-pip',
	'https://github.com/mapzen/leaflet-spatial-prefix-tree',
	'http://mapzen.com/',
	'https://graphhopper.com/',
	'https://www.mapbox.com/developers/api/directions/',
	'http://www.motionintelligence.net/',
	'https://github.com/BKGiser/Leaflet.Routing.Amap',
	'http://www.amap.com/',
	'https://github.com/BKGiser',
	'http://skedgo.com/',
	'https://openrouteservice.org/documentation/#/reference/isochrones',
	'https://github.com/smeijer/L.GeoSearch',
	'https://github.com/lokku/leaflet-opencage-search',
	'https://consbio.github.io/Leaflet.Geonames',
	'https://facebook.github.io/react/',
	'http://yohanboniface.me',
	'https://leaflet-ng2.yagajs.org/latest/examples',
	'http://terrayazilim.com.tr',
	'https://bitbucket.org/terrayazilim',
	'http://emberjs.com/',
	'https://github.com/KoRiGaN/Vue2Leaflet',
	'https://github.com/KoRiGaN/Vue2Leaflet',
	'http://yohanboniface.me',
	'http://www.mapsmarker.com/',
	'http://www.harm.co.at/',
	'http://wordpress.org/plugins/leaflet-map/',
	'http://www.sparkgeo.com/',
	'http://drupal.org/project/leaflet',
	'http://marzeelabs.org',
	'http://drupal.org/project/leaflet',
	'https://www.joomla.org/',
	'https://extensions.joomla.org/extensions/extension/maps-a-weather/maps-a-locations/agosm/',
	'https://extensions.joomla.org/extensions/extension/maps-a-weather/maps-a-locations/aggpxtrack/',
	'https://extensions.joomla.org/extensions/extension/maps-a-weather/maps-a-locations/agosmmapwithmarker/'
]

links = [];
function runTest(){
	links = [];
	links.push('http://drupal.org/project/leaflet')
	startFetch();
}

run();
//runTest();


function headerToKeyValue(headerList){
	var header = {};

	if(headerList) {
		for (var i = 0; i < headerList.length; i += 2) {
			header[headerList[i]] = headerList[i + 1];
		}
	}

	return header;
}

function createTable(){
	fail.sort((a, b) => {
		const aHas = typeof a.status !== 'undefined';
		const bHas = typeof b.status !== 'undefined';
		return (bHas - aHas) || (aHas === true && a.status - b.status) || 0;
	});

	var html = "";

	html += "<style>"+getCSSTableStyle()+"</style>\n";


	html += "<div id='header'>";
	if(links.length === success.length){
		html += "<h2>"+success.length + " of "+links.length+" are working!</h2>";
	} else {
		html += "<h2>" + fail.length + " of " + links.length + " are failed!</h2>";
	}
	html += "</div>";

	html += "<table id='result-table'>\n";

	var oldStatus;
	fail.forEach((entry)=>{
		if(oldStatus != entry.status){
			// header
			html += "<tr><th>Status</th><th>Link</th><th>Information</th></tr>"
			oldStatus = entry.status;
		}

		html +="<tr><td><a target='_blank' href='https://httpstatuses.com/"+entry.status+"'>"+entry.status+"</a></td><td><a target='_blank' href='"+entry.link+"'>"+entry.link+"</a></td>";

		var info = "";
		var notEndingWithSlash = !entry.link.endsWith('/');
		var http = entry.link.indexOf('http://') > -1;


		if(entry.link.indexOf('http://') > -1){
			info += "HTTP is used!<br>";
		}

		const redirectUrl = entry.redirectUrl || entry.header.Location;
		if(entry.status === 404){
			// do nothing
		} else if(redirectUrl) {
			info += "Redirect: <a target='_blank' href='" + redirectUrl + "'>" + redirectUrl + "</a><br>";
		} else if(notEndingWithSlash || http){
			var link = entry.link;
			if(http){
				link = link.replaceAll('http:','https:');
			}
			if(notEndingWithSlash){
				link += "/";
			}
			info += "Suggestion: <a target='_blank' href='"+link+"'>"+link+"</a><br>";
		}


		html += "<td>"+info+"</td>";

		html += "</tr>\n";
	});
	html += "</table>";
	fs.writeFile("result.html", html, (e => console.log('Write File:',e)));
	console.log('DONE')
}

function getCSSTableStyle(){
	return `
html, body {
  font-family: Arial, Helvetica, sans-serif;
}

#header {
  text-align: center;
}

#result-table {
  border-collapse: collapse;
  width: 100%;
  max-width: 1200px;
  margin: auto;
}

#result-table td, #customers th {
  border: 1px solid #ddd;
  padding: 8px;
}

#result-table tr:nth-child(even){background-color: #f2f2f2;}

#result-table th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #7fbe43;
  color: white;
  padding-left: 5px;
}
`
}

/*
178 of 1184 failed!
http://esri.github.io/esri-leaflet 301
https://earthdata.nasa.gov/gibs 302
http://kartverket.no/Kart/Gratis-kartdata/Cache-tjenester/ 301
http://webmap.arcticconnect.org undefined
https://github.com/gmaclennan/leaflet-bing-layer 301
https://msdn.microsoft.com/en-us/library/ff701721.aspx 403
https://supermap.github.io/supermap-leaflet 301
https://mierune.co.jp/tile.html 302
https://github.com/mylen/leaflet.TileLayer.WMTS 301
http://bellard.org/bpg/ 301
https://github.com/mapbox/TileJSON 404
http://www.kartena.se/ 301
http://vizzuality.github.com/cartodb-leaflet/ 404
http://cartodb.com/ 301
http://vizzuality.com/ 301
http://iipimage.sourceforge.net/ 301
http://iiif.io/ 301
http://github.com/commenthol/gdal2tiles-leaflet 301
http://commenthol.github.io/leaflet-rastercoords 301
https://github.com/ScanEx/Leaflet.imageTransform 404
http://www.digital-democracy.org 301
https://consbio.github.io/Leaflet.UTFGrid/ 404
https://dayjournal.github.io/Leaflet.Control.Opacity 301
http://www.outdooractive.com 301
https://github.com/robertomlsoares/leaflet-offline 404
https://robertomlsoares.github.io/leaflet-offline/ 404
http://spatialdev.com/ 403
https://github.com/devTristan/hoverboard 301
http://tristan.io/hoverboard/ 301
http://tristan.io/ 301
https://github.com/IvanSanchez/Leaflet.VectorGrid 301
https://github.com/IvanSanchez/Leaflet.VectorGrid#demos 301
https://github.com/IvanSanchez/Leaflet.VectorGrid 301
http://arthur-e.github.com/Wicket/ 404
http://qgis.org/ 301
http://www.opengeospatial.org/standards/wfs 301
http://papaparse.com/ 301
https://dj0001.github.io/Leaflet.mytrack 301
https://dj0001.github.io/Leaflet.Sun 301
https://dj0001.github.io/Leaflet.timezones 301
http://github.com/GEOF-OSGL/Leaflet.EdgeScaleBar 301
http://geof-osgl.github.io/Leaflet.EdgeScaleBar/ 404
http://github.com/GEOF-OSGL 301
https://github.com/barryhunter/Leaflet.GeographPhotos 301
https://github.com/lvoogdt/Leaflet.awesome-markers 301
http://www.lennardvoogdt.nl 301
http://www.corysilva.com 301
https://www.mapbox.com/maki/ 301
https://github.com/IvanSanchez/Leaflet.Icon.Glyph 301
http://longitude.me 301
http://heyman.info 301
http://wiki.openstreetmap.org/wiki/Geojson_CSS 301
http://osmbuildings.org/ 301
https://github.com/gismartwaredev/leaflet.orientedMarker 404
https://github.com/gismartwaredev 404
http://www.mapkeyicons.com 403
http://timwis.com/leaflet-choropleth/examples/basic 301
http://timwis.com 301
http://blog.cartodb.com/stacking-chips-a-map-hack/ 301
https://w8r.github.io/leaflet-labeled-circle/demo/ 301
http://mikhail.io/demos/leaflet-corridor/ 301
https://github.com/triedeti/Leaflet.streetlabels 301
https://triedeti.github.io/Leaflet.streetlabels/ 404
https://github.com/triedeti 404
https://github.com/react-map/leaflet.magicMarker 301
https://react-map.github.io/leaflet.magicMarker/ 404
https://github.com/react-map 404
https://gitlab.com/u/IvanSanchez 302
https://onaci.github.io/leaflet-point-animator 301
https://onaci.github.io/leaflet-temporal-geojson 301
http://mackerron.com 302
https://github.com/yellowiscool 404
http://www.patrick-wied.at/static/heatmapjs/example-heatmap-leaflet.html 301
https://github.com/dpiccone/leaflet-div-heatmap 301
http://www.geog.uni-heidelberg.de/gis/index_en.html 301
http://d3js.org 301
https://github.com/ecomfe/echarts 301
https://github.com/react-map/leaflet.migrationLayer 301
https://react-map.github.io/leaflet.migrationLayer 404
https://github.com/react-map 404
http://www.pixijs.com/ 301
https://github.com/danwild/leaflet-velocity 301
https://danwild.github.io/leaflet-velocity 404
http://www.kartena.se/ 301
https://github.com/yohanboniface/Leaflet.Editable 301
http://yohanboniface.me/ 301
https://w8r.github.io/Leaflet.Path.Drag 301
https://w8r.github.io/Leaflet.Path.Transform 301
https://willfarrell.github.io/Leaflet.Clipper 301
https://github.com/yellowiscool 404
https://github.com/yohanboniface/Leaflet.Storage 301
http://yohanboniface.me/ 301
https://github.com/manleyjster/Leaflet.Illustrate 301
http://manleyjster.github.io/Leaflet.Illustrate/examples/0.0.2/simple/ 404
https://github.com/manleyjster 404
http://apps.socib.es/Leaflet.TimeDimension/examples/index.html 301
http://www.socib.eu 301
http://d3js.org/ 301
http://www.naomap.fr 301
http://labs.easyblog.it 301
http://erictheise.github.com/rrose 404
http://www.linkedin.com/in/erictheise 301
http://yohanboniface.me 301
http://github.com/perliedman 301
http://heyman.info 301
https://w8r.github.io/L.Control.LineStringSelect 301
http://labs.easyblog.it/maps/leaflet-geojson-selector/ 301
http://labs.easyblog.it/stefano-cudini/ 301
http://pezzo.org 301
https://mkong0216.github.io/leaflet-shades/examples 301
http://zakjan.github.io/leaflet-lasso/ 301
https://github.com/ismyrnow/Leaflet.groupedlayercontrol 301
http://robbie.io/ 301
http://labs.easyblog.it 301
http://scanex.github.io/Leaflet-IconLayers/examples 301
http://rawgit.com/bambrikii/leaflet-layer-tree-plugin/master/examples/basic-example.htm 301
http://kartena.github.com/Leaflet.Pancontrol/ 404
http://www.kartena.se/ 301
http://kartena.github.com/Leaflet.zoomslider/ 404
http://www.kartena.se/ 301
https://github.com/yellowiscool 404
https://consbio.github.io/Leaflet.ZoomBox 301
https://developers.arcgis.com/javascript/jssamples/widget_home.html 301
https://github.com/mapbox/Leaflet.fullscreen 301
https://github.com/turban/Leaflet.Sync 301
http://prominentedge.com/leaflet-measure-path/ 301
http://prominentedge.com/ 301
http://www.newlighttechnologies.com/ 301
http://mahmoodvcs.github.io/Leaflet.NACCoordinates/ 404
http://labs.easyblog.it/maps/leaflet-locationpicker/ 301
http://www.mapcode.com undefined
https://cliffcloud.github.io/Leaflet.Sleep 301
http://prominentedge.com/ 301
https://cliffcloud.github.io/Leaflet.EasyButton 301
https://github.com/nickpeihl/leaflet-sidebar-v2/ 301
http://yohanboniface.me 301
https://github.com/manleyjster 404
https://github.com/gregallensworth/L.Control.Credits 301
http://fgnass.github.com/spin.js/ 404
http://www.motionintelligence.net/ 301
https://cliffcloud.github.io/Leaflet.LocationShare 301
http://labs.easyblog.it/ 301
http://trac.osgeo.org/proj4js/ 301
http://www.kartena.se/ 301
https://github.com/tmcw/leaflet-pip 301
https://github.com/mapzen/leaflet-spatial-prefix-tree 301
http://mapzen.com/ 301
https://graphhopper.com/ 301
https://www.mapbox.com/developers/api/directions/ 301
http://www.motionintelligence.net/ 301
https://github.com/BKGiser/Leaflet.Routing.Amap 301
http://www.amap.com/ 301
https://github.com/BKGiser 404
http://skedgo.com/ 301
https://openrouteservice.org/documentation/#/reference/isochrones 301
https://github.com/smeijer/L.GeoSearch 301
https://github.com/lokku/leaflet-opencage-search 301
https://consbio.github.io/Leaflet.Geonames 301
https://facebook.github.io/react/ 301
http://yohanboniface.me 301
https://leaflet-ng2.yagajs.org/latest/examples undefined
http://terrayazilim.com.tr undefined
https://bitbucket.org/terrayazilim 301
http://emberjs.com/ 301
https://github.com/KoRiGaN/Vue2Leaflet 301
https://github.com/KoRiGaN/Vue2Leaflet 301
http://yohanboniface.me 301
http://www.mapsmarker.com/ 301
http://www.harm.co.at/ 301
http://wordpress.org/plugins/leaflet-map/ 301
http://www.sparkgeo.com/ 301
http://drupal.org/project/leaflet 301
http://marzeelabs.org 301
http://drupal.org/project/leaflet 301
https://www.joomla.org/ 416
https://extensions.joomla.org/extensions/extension/maps-a-weather/maps-a-locations/agosm/ 301
https://extensions.joomla.org/extensions/extension/maps-a-weather/maps-a-locations/aggpxtrack/ 301
https://extensions.joomla.org/extensions/extension/maps-a-weather/maps-a-locations/agosmmapwithmarker/ 301

 */

