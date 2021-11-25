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
function run(){
	readFiles('../docs/_plugins/',function(filename, content) {
		var regex = 'category: (.*)'

		var myRegexp = new RegExp(regex, "g");
		match = myRegexp.exec(content);
		const cate = match[1];
		console.log(cate);
		if (!fs.existsSync('../docs/_plugins/'+cate)){
			fs.mkdirSync('../docs/_plugins/'+cate);
		}
		fs.writeFile('../docs/_plugins/'+cate+'/'+filename, content, (e => console.log('Write File:',e)));
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

run()
