<?php	
	session_start();
	error_reporting(E_ALL ^ E_DEPRECATED ^ E_WARNING);
	
	$_SESSION['debug'] = 'false';
	
	$dbname   = 'sgsslweb';
	$dbname   = isset($_POST["dbname"])   ? $_POST["dbname"]   : $dbname;
	$dbname   = isset($_GET["dbname"])    ? $_GET["dbname"]    : $dbname;
	$_SESSION["dbname"] = $dbname;
	
	include('../includes/var.php');
	$debugmessage = 0;
	//WFSetDebug(true);
			
	WFSendLOG("Optimizer:","START");
	
	//formvlaues truncate
	echo( 'formvlaues truncate'. BRCRLF);
	$sql = "TRUNCATE " . $ExtJSDevDB . "formvalues ";
	$conn->Execute($sql);
	
	//temp truncate
	echo( 'temp truncate'. BRCRLF);
	$sql = "TRUNCATE " . $ExtJSDevDB . "temp ";
	$conn->Execute($sql);
	
	//formvlaues appoggio
	echo( 'appoggio truncate'. BRCRLF);
	$sql = "TRUNCATE appoggio ";
	$conn->Execute($sql);
	
	//logs truncate
	echo( 'logs truncate'. BRCRLF);
	$sql = "TRUNCATE " . $ExtJSDevDB . "logs ";
	$conn->Execute($sql);
	
	//document optimizer
	echo( 'document optimizer'. BRCRLF);
	$sql = "SELECT CT_TABLE
			FROM " . $ExtJSDevDB . "documents 
			GROUP BY CT_TABLE
			ORDER BY CT_TABLE";
	$rs = $conn->Execute($sql);
	if ($rs !== false) {
		if ($rs->RecordCount() > 0) {
			while (!$rs->EOF) {
				$CT_TABLE = $rs->fields["CT_TABLE"];
				$sql = "UPDATE " . $CT_TABLE . " 
							INNER JOIN " . $ExtJSDevDB . "documents ON " . $ExtJSDevDB . "documents.CT_ID = " . $CT_TABLE . ".ID 
							SET " . $CT_TABLE . ".SD = 1 
							WHERE " . $ExtJSDevDB . "documents.CT_TABLE = '" . $CT_TABLE . "'";
				$conn->Execute($sql);
				$rs->Movenext();
			}
		}
		$rs->close();
	}
		
?>