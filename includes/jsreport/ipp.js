var ipp=require('ipp');
var fs = require('fs');

fs.readFile('d:\\test.pdf', function(err, data) { 
  if (err)
    throw err;

  var printer = ipp.Printer("http://192.168.0.136:631/printers/Zebra_TLP2844", {version:'2.0'});
  var msg = {
    "operation-attributes-tag": {
      "requesting-user-name": "William",
      "job-name": "My Test Job",
      "document-format": "application/pdf"
    },
    data: data
  };
  printer.execute("Print-Job", msg, function(err, res){
    if(err){
        console.log(err);
    }
    console.log(res);
  });
});
	
