const fs = require('fs');
const readline = require('readline');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


var tables = [];
var currentText = "";
var currentHeadline = "";
var foundHeadline = "";
function run(){
	const rl = readline.createInterface({
		input: fs.createReadStream('./docs/plugins.md'),
		crlfDelay: Infinity
	});
	rl.on('line', (line) => {
		if(line.indexOf('### ') > -1) {
			foundHeadline = line;
		} else if(line.indexOf('<table class="plugins">') > -1) {
			currentText = line;
			currentHeadline = foundHeadline;
		} else if(line.indexOf('</table>') > -1) {
			tables.push({
				title: currentHeadline,
				content: currentText
			});
			currentText = "";
		}
		currentText += line;
	});
	rl.on('close',()=>{
		startParsing();
	});
}

function startParsing(){
	var plugins = [];
	tables.forEach((table)=>{

		//console.log(table.title, table.content.length);
		const dom = new JSDOM(table.content);
		const TRs = dom.window.document.querySelectorAll("tr");
		TRs.forEach((tr, i)=>{
			if(tr.innerHTML === '<th>Plugin</th><th>Description</th><th>Maintainer</th>'){
				// Table header
				return;
			}
			var plugin = {
				category: categoryMapping[table.title],
				demo: ''
			};
			const TDs = tr.querySelectorAll("td");
			TDs.forEach((td, idx)=>{
				if(idx === 0){
					if(td.children[0].tagName === 'A'){
						plugin.link = td.children[0].href.trim();
						plugin.name = td.children[0].textContent.trim();
					} else{
						plugin.name = td.textContent.trim();
					}
					//console.log(plugin.name,td)
					plugin.filename = (plugin.name || 'noName').toLowerCase().replaceAll(' ','-')+'.md';
				} else if(idx === 1){
					plugin.content = td.innerHTML.trim();

					if(td.querySelectorAll('a').length > 0){
						td.querySelectorAll('a').forEach((tag)=>{
							if(tag.innerHTML.toLowerCase().indexOf('demo') > -1){
								plugin.demo = tag.href;
							}
						})
					}

				} else if(idx === 2){
					if(td.children[0].tagName === 'A'){
						plugin.authorLink = td.children[0].href.trim();
						plugin.author = td.children[0].textContent.trim();
					} else{
						plugin.author = td.textContent.trim();
					}
				}
			})
			if(!plugin.name) {
				console.log(tr.innerHTML)
				console.log(plugin.name, plugin, table, TRs.innerHTML)
			}
			plugins.push(plugin);
		})
	})

	var a = 0;
	for(var i = 0; i < plugins.length; i++){
		var plugin = plugins[i];
		var content = `---
name: ${plugin.name}
category: ${plugin.category}
repo: ${plugin.link}
author: ${plugin.author}
author-url: ${plugin.authorLink}
demo: ${plugin.demo}
compatible-v0: false
compatible-v1: true
---

${plugin.content}
`;
		fs.writeFile('./docs/_plugins/'+plugin.filename,content, (e)=>console.log(e));
	}
}

var categoryMapping = {
	'### Basemap providers': 'basemap-providers',
	'### Basemap formats': 'basemap-formats',
	'### Non-map base layers': 'non-map-base-layers',
	'### Tile/image display': 'tile/image-display',
	'### Tile Load': 'tile-load',
	'### Vector tiles': 'vector-tiles',
	'### Overlay data formats': 'overlay-data-formats',
	'### Dynamic/custom data loading': 'dynamic/custom-data-loading',
	'### Synthetic overlays': 'synthetic-overlays',
	'### Data providers': 'data-providers',
	'### Markers & renderers': 'markers-&-renderers',
	'### Overlay animations': 'overlay-animations',
	'### Clustering/Decluttering': 'clustering/decluttering',
	'### Heatmaps': 'heatmaps',
	'### DataViz': 'dataviz',
	'### Edit geometries': 'edit-geometries',
	'### Time & elevation': 'time-&-elevation',
	'### Search & popups': 'search-&-popups',
	'### Area/overlay selection': 'area/overlay-selection',
	'### Layer switching controls': 'layer-switching-controls',
	'### Interactive pan/zoom': 'interactive-pan/zoom',
	'### Bookmarked pan/zoom': 'bookmarked-pan/zoom',
	'### Fullscreen controls': 'fullscreen-controls',
	'### Minimaps & synced maps': 'minimaps-&-synced-maps',
	'### Measurement': 'measurement',
	'### Mouse coordinates': 'mouse-coordinates',
	'### Events': 'events',
	'### User interface': 'user-interface',
	'### Print/export': 'print/export',
	'### Geolocation': 'geolocation',
	'### Geoprocessing': 'geoprocessing',
	'### Routing': 'routing',
	'### Geocoding': 'geocoding',
	'### Plugin collections': 'plugin-collections',
	'### Frameworks & build systems': 'frameworks-&-build-systems',
	'### 3<sup>rd</sup> party integration': '3rd-party-integration',
};




run();
