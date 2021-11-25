console.log("console.log output")

const fs = require('fs');
const readline = require('readline');


var links = [];
var success = []
var fail = []

var foundFiles = 0;
var readed = 0;
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

var entries = {};
function parseFile(content){
	var lines = content.split('\r\n');
	lines.forEach((line)=>{
		var datas = line.split(';')
		if(datas[2]) {
			entries[datas[0]] = datas[2];
		}
	})
	console.log(entries);

	readFiles('../docs/_plugins/',function(filename, content) {

		for(var key in entries) {
			content = content.replaceAll(key,entries[key]);
		}

		fs.writeFile('../docs/_plugins/'+filename, content, (e => console.log('Write File:',e)));
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
			});
		});
	});
}

function run(){
	fs.readFile('corruptURLs.csv', 'utf-8', function(err, content) {
		readed++;
		if (err) {
			throw err;
		}else {
			parseFile(content);
		}
	});
}

run()
