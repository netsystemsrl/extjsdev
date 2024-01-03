var fs = require('fs');
var util = require('util');
const querystring = require('querystring');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.logfile = function(d) { 
	log_file.write(util.format(d) + '\n');
	//log_stdout.write(util.format(d) + '\n');
};

console.logfile('start')

var fs = require('fs');
var http = require('http');
var path = require('path');
//var request = require('ajax-request');
// Import the jsreports server package
var jsreports = require('./jsreports-server.js');
var server = new jsreports.Server();

var layoutId = '30108';
var registrationId = '0';
var dataWhere = '';
var dataURL = 'http://localhost';
var reportJson = '';
var userlogin = '';
var userpassword = '';
var userdbname = '';
var filename = 'out-' + (new Date()).getTime() + '.pdf';

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/* RIGA DI COMANDO PARSING VARIABLE */
//console.log(querystring.parse(process.argv));
console.logfile('PARAMS');
process.argv.forEach(function (val, index, array) {
	var arrayvar = val.split("+");
	if (arrayvar.length == 2){
		if (arrayvar[0] == 'layoutid') layoutId = arrayvar[1];
		else if (arrayvar[0] == 'registrationid') registrationId = arrayvar[1];
		else if (arrayvar[0] == 'datawhere') dataWhere = arrayvar[1];
		else if (arrayvar[0] == 'userlogin') userlogin = arrayvar[1];
		else if (arrayvar[0] == 'userpassword') userpassword = arrayvar[1];
		else if (arrayvar[0] == 'userdbname') userdbname = arrayvar[1];
		else if (arrayvar[0] == 'dataurl') dataURL = 'http://' + arrayvar[1];
		else if (arrayvar[0] == 'filename') filename = arrayvar[1] + '.pdf';
		else console.logfile('PARAM non previsto:' + arrayvar[0])
	}
});

console.logfile('PARAM layoutid:'+layoutId);
console.logfile('PARAM registrationid:'+registrationId);
console.logfile('PARAM datawhere:'+dataWhere);
console.logfile('PARAM userlogin:'+userlogin);
console.logfile('PARAM userpassword:'+userpassword);
console.logfile('PARAM userdbname:'+userdbname);
console.logfile('PARAM dataurl:'+dataURL);
console.logfile('PARAM filename:'+filename);

/* quando passeremo con un url da linea di comando
var uri = 'http://your.domain/product.aspx?category=4&product_id=2140&query=lcd+tv';
var queryString = {};
uri.replace(
    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function($0, $1, $2, $3) { queryString[$1] = $3; }
);
console.log('ID: ' + queryString['product_id']);     // ID: 2140
*/


var LayoutURL = dataURL + '/includes/io/LayoutReadRunExt.php?layoutid=' + layoutId + 
															"&registrationid=" + registrationId  +
															"&username=" + userlogin +
															"&password=" + userpassword +
															"&dbname=" + userdbname;

console.logfile('load dataSources:');															
var dataSources = [];
var dataSourcesI = 0;
dataSources[dataSourcesI] =	{
		"id": "defaultds",
		"name": "defaultds",
		"url": dataURL + "/includes/io/DataReadExt.php?layoutid=" + layoutId + 
														"&onlydata=true" +
														"&limit=-1" +
														"&datawhere=" + dataWhere + 
														"&registrationid=" + registrationId +
														"&username=" + userlogin +
														"&password=" + userpassword +
														"&dbname=" + userdbname ,
		"schema_url": dataURL + "/includes/io/DataReadExt.php?layoutid=" + layoutId + 
															"&modeldef=true" + 
															"&limit=-1" +
															"&datawhere=" + dataWhere + 
															"&registrationid=" + registrationId +
															"&username=" + userlogin +
															"&password=" + userpassword +
															"&dbname=" + userdbname ,
		"timeout" : 5000,
		"dataSourceTimeout" : 5000
	};
console.logfile('data_source Name:' + dataSources[dataSourcesI]['name']);
console.logfile('URL:' + dataSources[dataSourcesI]['url']);
dataSourcesI = dataSourcesI +1;

function iterateDataSources(obj) {
	for (var property in obj) {
		if (obj.hasOwnProperty(property)) {
			if (typeof obj[property] == "object")
				iterateDataSources(obj[property]);
			else
				//data_source
				if ((property == 'data_source') && (obj[property] != "__parentgroup")) {
					console.logfile('URL:__parentgroup');
					where = '';
					if ((obj.hasOwnProperty("type")) &&  (obj["type"] == "table")) {
						console.logfile('URL:table');
						where = dataWhere;
					}
					dataSources[dataSourcesI] = {
						"id" : obj['data_source'],
						"name" : obj['data_source'],
						"url" :  dataURL + "/includes/io/DataReadExt.php?layoutid=" + layoutId +
																		"&onlydata=true" + 
																		"&limit=-1" +
																		"&objid=" + obj['data_source'] +
																		"&datawhere=" + where +
																		"&registrationid=" + registrationId +
																		"&username=" + userlogin +
																		"&password=" + userpassword +
																		"&dbname=" + userdbname ,
						"schema_url" : dataURL + "/includes/io/DataReadExt.php?layoutid=" + layoutId +
																			"&modeldef=true" +
																			"&limit=-1" +
																			"&objid=" + obj['data_source'] +
																			"&datawhere=" + where +
																			"&registrationid=" + registrationId +
																			"&username=" + userlogin +
																			"&password=" + userpassword +
																			"&dbname=" + userdbname ,
						"timeout" : 5000,
						"dataSourceTimeout" : 5000
					};
					console.logfile('data_source Name:' + dataSources[dataSourcesI]['name']);
					console.logfile('URL:' + dataSources[dataSourcesI]['url']);
					dataSourcesI = dataSourcesI +1;
					
				}
		}
	}
}

//var reportJson = require('./reportdev.json');
console.logfile('REQUEST START');

http.get(LayoutURL , (res) => {
	const statusCode = res.statusCode;
	const contentType = res.headers['content-type'];

	console.logfile('REQUEST LAYOUT');
	let error;
	if (statusCode !== 200) {
		if (statusCode == 401){
			error = new Error(`Request Login Failed.\n` + `Status Code: ${statusCode}`);
		}else{
			error = new Error(`RepoDEF Request Failed.\n` + `Status Code: ${statusCode}`);
		}
	} else if (!/^application\/json/.test(contentType)) {
		error = new Error(`RepoDEF Invalid content-type.\n` + `Expected application/json but received ${contentType}`);
	}
	if (error) {
		//console.log('REQUEST ' + LayoutURL);
		console.logfile('REQUEST ' + error.message);
		// consume response data to free up memory
		res.resume();
		return;
	}

	res.setEncoding('utf8');
	let rawData = '';
	res.on('data', (chunk) => rawData += chunk);
	
	res.on('end', () => {
		console.logfile('REQUEST END');
		try {
			let parsedData = JSON.parse(rawData);
			reportJson = parsedData.data[0].layoutjson;
			reportJsonObj = JSON.parse(reportJson);
			
			console.logfile('layout');
			//console.log(reportJson);
			iterateDataSources(reportJsonObj);
			server.logLevel =  'debug';
			
			server.export({
				format: 'pdf',
				report_def: reportJson,
				datasets: dataSources,
				imageUrlPrefix: dataURL,
				//imageUrlPrefix: 'file:///var/www/html/' ,
				showPageHeaderAndFooter: true,
				scaleFonts: true
			}, function(err, pdfStream) {
				if (err) {
					console.logfile('ERROR');
					console.logfile(err);
					return console.error(err);
				}
				// Got the output stream - write PDF to file
				var outPath = path.resolve(__dirname, filename);
				var outStream = fs.createWriteStream(outPath, 'utf8');
				outPath = outPath.replace(/\\/g, '/');
				pdfStream.on('end', function() { 
					var output = {
						success: true,
						message: outPath
					};
					console.logfile(JSON.stringify(output));
					console.log(JSON.stringify(output));
					server.stop();
				});
				pdfStream.pipe(outStream);
			});
		} catch (e) {		
			var output = {
				success: false,
				failure: true,
				message: e.message
			};
			console.logfile(JSON.stringify(output));
			console.log(JSON.stringify(output));
		}
	});
}).on('error', (e) => {
	console.logfile('REQUEST ' + LayoutURL);
	console.logfile('RepoDEF Got error:' +e.message);
});