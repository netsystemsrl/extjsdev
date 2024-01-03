<html>
	<head>
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
		<meta http-equiv="Cache-control" content="public">
		<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"> 
	</head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.2/jquery.min.js" integrity="sha512-tWHlutFnuG0C6nQRlpvrEhE4QpkG1nn2MOUMWmUeRePl4e3Aki0VB6W1v3oLjFtd0hVOtRQ9PHpSfN6u6/QXkQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<textarea id="zplcode" cols="40" rows="10">
^XA
^FX attivazione RFID
^FN1^RFR,H,0,12,2^FS^FH_^HV1,256^FS

^FX stp barcode
^BY5,2,270
^FO100,50^BC^FD12345678^FS

^FX stp testo
^CF0,190
^FO40,400^FDCA^FS
^XZ
</textarea>

<textarea id="output" cols="40" rows="10">
</textarea>
<input type="button" value="Print zpl" onclick="printZpl(document.getElementById('zplcode').value)" /><br/>

<script type="text/javascript">

function printZpl(zpl) {
	var ip_addr = '192.168.0.143';
	var output = document.getElementById("output");
	var zpl = zpl; 
	var url = "http://"+ip_addr+"/pstprnt";
	var method = "POST";
	
	const body = {
	  userId: 1,
	  title: "Fix my bugs",
	  completed: false
	};
	$.post(url, body, (data, status) => {
	  console.log(data);
	});


	request.open(method, url, async);
    //request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	//request.setRequestHeader("Content-Length", zpl.length);


	request.send(zpl);
	  
	
	//Custom.SendToWebSocket(JsonAppo.commandlocal,'192.168.0.143', 9100, 'direct');
}
</script>
</html>