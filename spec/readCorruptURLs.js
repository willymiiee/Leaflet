console.log("console.log output")

const fs = require('fs');


var links = [];
var success = []
var fail = []
var foundFiles = 0;
var readed = 0;

function run(){
	var idx = 0;
	readFiles('../docs/_plugins/', function(filename, content) {
		content.split('\n').forEach((line)=> {
			//console.log(`Line from file: ${line}`);
			parseLinkFromText(line).forEach((link) => {
				links.push(link);
			});
			idx++;
		})
	}, function(err) {
		throw err;
	});
}

function readFiles(dirname, onFileContent, onError) {
	fs.readdir(dirname, function(err, filenames) {
		if (err) {
			onError(err);
			return;
		}
		foundFiles = filenames.length -1;
		filenames.forEach(function(filename) {
			fs.readFile(dirname + filename, 'utf-8', function(err, content) {
				readed++;
				if (err) {
					onError(err);
				}else {
					onFileContent(filename, content);
				}
				if(readed === foundFiles){
					console.log(links)
					startFetch();
				}
			});
		});
	});
}

function parseLinkFromText(text){
	const links = [];
	var myRegexp = new RegExp("(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)", "g");
	match = myRegexp.exec(text);
	while (match != null) {
		const link = match[0];
		if(link && link.startsWith('http')){
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
};
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


var xi = 0;
function finalCheck(){
	if(false && links.length !== success.length + fail.length && xi < 20){
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
	var csv = "";

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

		csv += entry.link +";"+entry.status+";";

		var info = "";
		var notEndingWithSlash = !entry.link.endsWith('/');
		var http = entry.link.indexOf('http://') > -1;


		if(entry.link.indexOf('http://') > -1){
			info += "HTTP is used!<br>";
		}


		const redirectUrl = entry.redirectUrl || entry.header.Location;
		var csvRedirect = "";
		if(entry.status === 404){
			// do nothing
		} else if(redirectUrl) {
			info += "Redirect: <a target='_blank' href='" + redirectUrl + "'>" + redirectUrl + "</a><br>";
			csvRedirect = redirectUrl;
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
		csv +=csvRedirect +";\n";

		html += "<td>"+info+"</td>";


			html += "</tr>\n";
	});
	html += "</table>";
	fs.writeFile("corruptURLs.html", html, (e => console.log('Write File:',e)));
	fs.writeFile("corruptURLs.csv", csv, (e => console.log('Write File:',e)));
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


run();
