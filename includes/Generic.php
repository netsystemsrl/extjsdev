<?php
//GEQO
//ViewTypeExt
	define('acForm','form');
	define('acGrid','grid');
	define('acTreeGrid','treegrid');
	define('acReport','report');
	define('acRaw','raw');
	define('acLabel','label');
	define('acPivot','pivot');
	define('acChart','chart');
	define('acFlow','flow');

//DataMode
	define('acNormal','edit');
	define('acFormEdit','edit');
	define('acFormAdd','add');
	define('acFormReadOnly','read');
	define('acFormFilter','filter');
	
//DataMode(report):	
	define('acSave','acSave');
	define('acPrint','acPrint');
	define('acPrintTo','acPrintTo');
	
//SaveMode(report):
	define('acPDF','pdf');
	define('acXLS','xls');
	define('acCSV','csv');

//WindowMode:
	define('acDialogModal', 'acDialogModal');
	define('acDialog', 'acDialog');
	define('acWindowNormal', 'acWindowNormal');

//MessageType:
	define('YesNoCancel', 3);
	define('YesNo', 2);
	define('Ok', 1);

//LayoutIdentficator
	define('acSelf',-1);

	define('CR',chr(13));
	define('LF',chr(10));
	define('CRLF',"\r\n") ;
	define('BRCRLF',"<BR>\r\n") ;

$CollectObjList = array();
$CollectObjField = array();
$CollectObjName = '';
$CollectObjValue = '';
$CollectObjValueFind = '';
$CollectEchoString = '';
$CollectArray = array();
$CollectProgId = 0;

$ErrorProg = 0;
$ErrorLabel = 0;
$NotifyRecord = array();
$ExtCurrentProcess = 0;

/************************************************************************************/
/*                   		  	  FUNC EXTJSDEV 									*/
/************************************************************************************/
function WFVALUE($varName, $ReqLayoutId = acSelf, $NullValue = ''){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	global $UserId;
	
	WFSendLOG("WFVALUE", "varName:" . $varName . "LayoutId:" . $ReqLayoutId);
	
	if ((acSelf == $ReqLayoutId ) || ('0' == $ReqLayoutId )){
		$ReqLayoutId  = $LayoutId;
	}else{
		if (is_numeric($ReqLayoutId) == false) {
			$sql = "SELECT * 
					FROM " . $ExtJSDevDB . "layout 
					WHERE DESCNAME = '" . $ReqLayoutId . "'";		
			$rs = $conn->Execute($sql);
			if ($rs) {
				$ReqLayoutId = $rs->fields['ID'];
				$rs->close();
			}
		}
	}
	
	$sql = "SELECT FIELDVALUE 
				FROM " . $ExtJSDevDB . "formvalues 
				WHERE FIELDNAME = '" . $varName . "' 
					AND NUMREG = " . $RegistrationId . "
					AND CT_AAAUSER = " . $UserId . "
					AND CT_AAALAYOUT = " . $ReqLayoutId. "
				ORDER BY ID DESC";
	$rs = $conn->Execute($sql);
	
	$NewChiave = $NullValue;
	if ($rs !== false) {
		if ($rs->RecordCount() > 0) $NewChiave = $rs->fields['FIELDVALUE'];
		$rs->close();
	}
	if ($conn->debug==1) echo("WFVALUE:" . $NewChiave. "<BR>\n");
	if (IsNullOrEmptyString($NewChiave)) $NewChiave = $NullValue;
	return ($NewChiave);
}
function WFVALUEIN($varName, $ReqLayoutId = acSelf, $NullValue = ''){
	$NewChiave = WFVALUE($varName, $ReqLayoutId, $NullValue);
	return ($NewChiave);
}
function WFVALUELAST($varName, $NullValue = ''){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	global $UserId;
	
	WFSendLOG("WFVALUELAST", "varName:" . $varName);
	
	$sql = "SELECT FIELDVALUE FROM " . $ExtJSDevDB . "formvalues 
				WHERE FIELDNAME = '" . $varName . "' 
					AND NUMREG = " . $RegistrationId . "
					AND CT_AAAUSER = " . $UserId . "
					ORDER BY ID DESC";
	$rs = $conn->SelectLimit($sql,1,-1);
	
	$NewChiave = $NullValue;
	if ($rs !== false) {
		if ($rs->RecordCount() > 0) $NewChiave = $rs->fields['FIELDVALUE'];
		$rs->close();
	}
	if ($conn->debug==1) echo("WFVALUELAST:" . $NewChiave. "<BR>\n"); 
	return ($NewChiave);
}
function WFVALUECOND($condition, $varName, $ReqLayoutId = acSelf){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	global $UserId;

	WFSendLOG("WFVALUECOND", "varName:" . $varName . "LayoutId:" . $ReqLayoutId);
	
	if ((acSelf == $ReqLayoutId ) || ('0' == $ReqLayoutId )){
		$ReqLayoutId  = $LayoutId;
	}else{
		if (is_numeric($ReqLayoutId) == false) {
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layout 
					WHERE DESCNAME = '" . $ReqLayoutId . "'";		
			$rs = $conn->Execute($sql);
			if ($rs) {
				$ReqLayoutId = $rs->fields['ID'];
				$rs->close();
			}
		}
	}
	
	$sql = "SELECT FIELDVALUE FROM " . $ExtJSDevDB . "formvalues 
				WHERE FIELDNAME = '" . $varName . "' 
					AND NUMREG = " . $RegistrationId . "
					AND CT_AAAUSER = " . $UserId . "
					AND CT_AAALAYOUT = " . $ReqLayoutId;
	$rs = $conn->Execute($sql);
	$NewChiave = '';
	if ($rs !== false) {
		if ($rs->RecordCount() > 0) $NewChiave = $rs->fields['FIELDVALUE'];
		$rs->close();
	}
	if ($conn->debug==1) echo("WFVALUECOND:" . $NewChiave. "<BR>\n"); 
	if (($NewChiave == '') || ($NewChiave == null)){
		return '(1=1)';
	}else{
		if (!is_numeric($NewChiave)){
			$NewChiave = "'" . $NewChiave . "'";
		}
			
		return '(' . $condition . $NewChiave . ')' ;
	}
}

function WFVALUECONDBETWEEN($conditionField, $varNameStart, $varNameEnd, $ReqLayoutId = acSelf){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	global $UserId;

	WFSendLOG("WFVALUECONDBETWEEN", "varNameStart:" . $varNameStart . " varNameEnd:" . $varNameEnd . " LayoutId:" . $ReqLayoutId);
	
	if ((acSelf == $ReqLayoutId ) || ('0' == $ReqLayoutId )){
		$ReqLayoutId  = $LayoutId;
	}else{
		if (is_numeric($ReqLayoutId) == false) {
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layout 
					WHERE DESCNAME = '" . $ReqLayoutId . "'";		
			$rs = $conn->Execute($sql);
			if ($rs) {
				$ReqLayoutId = $rs->fields['ID'];
				$rs->close();
			}
		}
	}
	
	$sql = "SELECT FIELDVALUE FROM " . $ExtJSDevDB . "formvalues 
				WHERE FIELDNAME = '" . $varNameStart . "' 
					AND NUMREG = " . $RegistrationId . "
					AND CT_AAAUSER = " . $UserId . "
					AND CT_AAALAYOUT = " . $ReqLayoutId;
	$rs = $conn->Execute($sql);
	$NewChiaveStart = '';
	if ($rs !== false) {
		if ($rs->RecordCount() > 0) $NewChiaveStart = $rs->fields['FIELDVALUE'];
		$rs->close();
	}
	$sql = "SELECT FIELDVALUE FROM " . $ExtJSDevDB . "formvalues 
				WHERE FIELDNAME = '" . $varNameEnd . "' 
					AND NUMREG = " . $RegistrationId . "
					AND CT_AAAUSER = " . $UserId . "
					AND CT_AAALAYOUT = " . $ReqLayoutId;
	$rs = $conn->Execute($sql);
	$NewChiaveEnd = '';
	if ($rs !== false) {
		if ($rs->RecordCount() > 0) $NewChiaveEnd = $rs->fields['FIELDVALUE'];
		$rs->close();
	}
	if ($conn->debug==1) echo("WFVALUECONDBETWEEN NewChiaveStart:" . $NewChiaveStart. " NewChiaveEnd:" . $NewChiaveEnd. "<BR>\n");
	WFSendLOG("WFVALUECONDBETWEEN", "NewChiaveStart:" . $NewChiaveStart. " NewChiaveEnd:" . $NewChiaveEnd);
	if (!empty($NewChiaveStart) AND !is_numeric($NewChiaveStart)){
		$NewChiaveStart = "'" . $NewChiaveStart . "'";
	}
	if (!empty($NewChiaveEnd) AND !is_numeric($NewChiaveEnd)){
		$NewChiaveEnd = "'" . $NewChiaveEnd . "'";
	}
	WFSendLOG("WFVALUECONDBETWEEN", "NewChiaveEnd:" . print_r(($NewChiaveEnd == '')? 'qui' : 'qua', true));
	if ((($NewChiaveStart == '') || ($NewChiaveStart == null)) AND (($NewChiaveEnd == '') || ($NewChiaveEnd == null))){
		return '(1=1)';
	}elseif (($NewChiaveStart == '') || ($NewChiaveStart == null) || ($NewChiaveStart == 'null')){
		return '(' . $conditionField . ' <= ' . $NewChiaveEnd . ')' ;
	}elseif (empty($NewChiaveEnd) || ($NewChiaveEnd == '') || ($NewChiaveEnd == null) || ($NewChiaveEnd == 'null')){
		return '(' . $conditionField . ' >= ' . $NewChiaveStart . ')' ;
	}else{
		return '(' . $conditionField . ' BETWEEN ' . $NewChiaveStart . ' AND '.$NewChiaveEnd.')' ;
	}
}
function WFVALUECHR($varName, $ReqLayoutId = acSelf, $varLenght){
	$NewChiave = WFVALUE($varName, $ReqLayoutId);
	$NewChiave = Left($NewChiave, $varLenght);
	return ($NewChiave);
}
function WFVALUENUMCHR($varName, $ReqLayoutId = acSelf, $varLenght ,$LeftRight = STR_PAD_LEFT, $Coeff = 1){
	$NewChiave = WFVALUE($varName, $ReqLayoutId);
	$NewChiave = str_replace(".","",$NewChiave);
	$NewChiave = str_replace(",","",$NewChiave);
	$NewChiave = str_replace("'","",$NewChiave);
	$NewChiave = intval($NewChiave) * $Coeff;
	$NewChiave =  str_pad($NewChiave, $varLenght, '0', $LeftRight);
	return ($NewChiave);
}
function WFVALUEROUND($varName, $ReqLayoutId = acSelf){
	$NewChiave = WFVALUE($varName, $ReqLayoutId);
	$NewChiave = str_replace(",",".",$NewChiave);
	$NewChiave = str_replace("'","",$NewChiave);
	$NewChiave = round($NewChiave);
	$NewChiave = $NewChiave . ".0";
	return ($NewChiave);
}
function WFVALUE128($varName, $ReqLayoutId = acSelf){
	$NewChiave = WFVALUE($varName, $ReqLayoutId);
	$charToInsert = '>6';
	if (strlen($NewChiave) >= 2) {
		$lastChar = substr($NewChiave, -1); // Get the last character
        $restOfString = substr($NewChiave, 0, -1); // Get the string without the last character
        $newString = $restOfString . ">6" . $lastChar; // Insert ">6" before the last character
	}
	return ($newString);
}
function WFVALUEMID($varName, $ReqLayoutId = acSelf, $varStart, $varLenght){
	$NewChiave = WFVALUE($varName, $ReqLayoutId);
	$NewChiave = Mid($NewChiave, $varStart, $varLenght);
	return ($NewChiave);
}

function WFVALUEFORMAT($varName, $ReqLayoutId = acSelf, $stringLength, $fillchar = '0', $filldirection =  STR_PAD_LEFT){
	$NewChiave = WFVALUE($varName, $ReqLayoutId);
	$NewChiave = str_pad($NewChiave, $stringLength , $fillchar, $filldirection);
	return ($NewChiave);
}
function WFVALUEFORM($ReqLayoutId = '0'){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $UserId;
	global $LayoutId;
	
	WFSendLOG("WFVALUEFORM", "ReqLayoutId:" . $ReqLayoutId);
	if ((acSelf == $ReqLayoutId ) || ('0' == $ReqLayoutId )){
		$ReqLayoutId  = $LayoutId;
	}else{
		if (is_numeric($ReqLayoutId) == false) {
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layout 
					WHERE DESCNAME = '" . $ReqLayoutId . "'";		
			$rs = $conn->Execute($sql);
			if ($rs) {
				$ReqLayoutId = $rs->fields['ID'];
				$rs->close();
			}
		}
	}
	
	$sql = "SELECT FIELDNAME, FIELDVALUE FROM " . $ExtJSDevDB . "formvalues 
				WHERE NUMREG = " . $RegistrationId . "
					AND CT_AAAUSER = " . $UserId . "
					AND CT_AAALAYOUT = " . $ReqLayoutId;
	$rs = $conn->Execute($sql);
			
	$record = [];
	$RecordCountResult = 0;
	while (!$rs->EOF) {
		if ($rs->fields['FIELDNAME'] == strtoupper($rs->fields['FIELDNAME'])){
			$record[$rs->fields['FIELDNAME']] = $rs->fields['FIELDVALUE'];
		}
		$RecordCountResult++;
		$rs->MoveNext();
	}
	$rs->close(); 
	if ($conn->debug==1) echo("WFVALUEFORM:" . $RecordCountResult. "<BR>\n"); 
	return $record;
}

function WFVALUECONFIG($varName){
	//Global Var inside function
	foreach($GLOBALS as $key => $value ) {
		if (($key == 'GLOBALS') || (substr($key,0,1) == '_')) { 
			continue; 
		} else {
			eval("global $" . $key . ";");
		}
	}
	$appo = '';
	eval('$appo = ' . $varName . ";");
	return($appo);
}
function WFVALUEUSER($varName = 'ID', $NullValue = ''){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $UserId;
	
	$NewChiave = $NullValue;
	WFSendLOG("WFVALUEUSER", "var:" . $varName);
	//VARIABILI
	$sql =  "SELECT " . $varName ." FROM " . $ExtJSDevDB . "user WHERE ID = " . $UserId;
	//echo($sql);
	try {   
		$rs = $conn->Execute($sql);	
	} catch (exception $e){
		$sql =  "SELECT * FROM " . $ExtJSDevDB . "userglobal WHERE CT_AAAUSER = " . $UserId  . " AND DESCNAME = '" . $varName ."'";
		
		try {   
			$rs = $conn->Execute($sql);	
			if ($rs) {
				if ($rs->RecordCount() == 1) {
					$NewChiave = $rs->fields['KEYVALUE'];
				}
				$rs->close();
			}
		} catch (exception $e){
			
		}
	}
	
	if ($rs) {
		if ($rs->RecordCount() == 1) {
			$NewChiave = $rs->fields[$varName];
		}
		$rs->close();
	}
	
	if (IsNullOrEmptyString($NewChiave)) $NewChiave = $NullValue;
	return ($NewChiave);
}

function WFVALUESET($varName, $varValue){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $LayoutId;
	global $RegistrationId;
	global $UserId;
	
	WFSendLOG("WFVALUESET", "value:" . $varName);
	$sql = "SELECT * FROM " . $ExtJSDevDB . "formvalues " .
			" WHERE 
				FIELDNAME = '" . $varName . "'
				AND NUMREG = " . $RegistrationId . "
				AND CT_AAAUSER = " . $UserId . "
			 ORDER BY ID DESC";
	$rs = $conn->Execute($sql);
	
	$record2 = array();
	$record2['CT_AAAUSER'] = $UserId; 
	$record2['NUMREG'] = $RegistrationId; 
	$record2['FIELDNAME'] = $varName; 
	$record2['FIELDVALUE'] = $varValue;
	
	if ($rs) {
		if ($rs->RecordCount() == 1) {
			$SqlC = $conn->GetUpdateSQL($rs, $record2);
			if ($SqlC != '') $appo = $conn->Execute($SqlC); 
		}
		elseif ($rs->RecordCount() == 0) {
			$SqlC = $conn->GetInsertSQL($rs, $record2);
			if ($SqlC != '') $appo = $conn->Execute($SqlC); 
			$valuefieldvalue = $conn->Insert_ID();
		}
		$rs->Close();
	}
}
function WFVALUEFORMSET($varName, $varValue, $ReqLayoutId = acSelf){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $LayoutId;
	global $RegistrationId;
	global $UserId;
	if ((acSelf == $ReqLayoutId ) || ('0' == $ReqLayoutId )){
		$ReqLayoutId  = $LayoutId;
	}else{
		if (is_numeric($ReqLayoutId) == false) {
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layout 
					WHERE DESCNAME = '" . $ReqLayoutId . "'";		
			$rs = $conn->Execute($sql);
			if ($rs) {
				$ReqLayoutId = $rs->fields['ID'];
				$rs->close();
			}
		}
	}
	
	WFSendLOG("WFVALUEFORMSET", "value:" . $varName);
	$sql = "SELECT * 
			FROM " . $ExtJSDevDB . "formvalues 
			WHERE 
				FIELDNAME = '" . $varName . "' 
				AND CT_AAAUSER = " . $UserId  . " 
				AND NUMREG = " . $RegistrationId . "
				AND CT_AAALAYOUT = " . $ReqLayoutId . "
				ORDER BY ID DESC";
	$rs = $conn->Execute($sql);
	
	$record2 = array();
	$record2['CT_AAAUSER'] = $UserId; 
	$record2['NUMREG'] = $RegistrationId; 
	$record2['CT_AAALAYOUT'] = $ReqLayoutId;
	$record2['FIELDNAME'] = $varName; 
	$record2['FIELDVALUE'] = $varValue;
	
	if ($rs) {
		if ($rs->RecordCount() == 1) {
			$SqlC = $conn->GetUpdateSQL($rs, $record2);
			if ($SqlC != '') $appo = $conn->Execute($SqlC); 
		}
		elseif ($rs->RecordCount() == 0) {
			$SqlC = $conn->GetInsertSQL($rs, $record2);
			if ($SqlC != '') $appo = $conn->Execute($SqlC); 
			$valuefieldvalue = $conn->Insert_ID();
		}
		$rs->Close();
	}
}
function WFVARRAYFORMSET($varNameValue, $ReqLayoutId = acSelf){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $LayoutId;
	global $RegistrationId;
	global $UserId;
	
	if ((acSelf == $ReqLayoutId ) || ('0' == $ReqLayoutId )){
		$ReqLayoutId  = $LayoutId;
	}else{
		if (is_numeric($ReqLayoutId) == false) {
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layout 
					WHERE DESCNAME = '" . $ReqLayoutId . "'";		
			$rs = $conn->Execute($sql);
			if ($rs) {
				$ReqLayoutId = $rs->fields['ID'];
				$rs->close();
			}
		}
	}
	
	foreach ($varNameValue as $key => $value) {
		$varName = $key;
		$varValue = $value;
		WFSendLOG("WFVARRAYFORMSET", "value:" . $varName);
		$sql = "SELECT * 
				FROM " . $ExtJSDevDB . "formvalues 
				WHERE 
					FIELDNAME = '" . $varName . "' 
					AND CT_AAAUSER = " . $UserId  . " 
					AND NUMREG = " . $RegistrationId . "
					AND CT_AAALAYOUT = " . $ReqLayoutId . "
					ORDER BY ID DESC";
		$rs = $conn->Execute($sql);
		
		$record2 = array();
		$record2['CT_AAAUSER'] = $UserId; 
		$record2['NUMREG'] = $RegistrationId; 
		$record2['CT_AAALAYOUT'] = $ReqLayoutId;
		$record2['FIELDNAME'] = $varName; 
		$record2['FIELDVALUE'] = $varValue;
		
		if ($rs) {
			if ($rs->RecordCount() == 1) {
				$SqlC = $conn->GetUpdateSQL($rs, $record2);
				if ($SqlC != '') $appo = $conn->Execute($SqlC); 
			}
			elseif ($rs->RecordCount() == 0) {
				$SqlC = $conn->GetInsertSQL($rs, $record2);
				if ($SqlC != '') $appo = $conn->Execute($SqlC); 
				$valuefieldvalue = $conn->Insert_ID();
			}
			$rs->Close();
		}
	}
}

function WFVALUESESSIONPRIV($varname){
	global $RegistrationId;
	global $_SESSION;
	$NewChiave = '';
	//WFSendLOG("WFSESSION", "value:" . $varname);
	
	if (isset($_SESSION[$varname])) {
		$NewChiave = $_SESSION[$varname];
	}
	
	return ($NewChiave);
}
function WFVALUESESSIONSETPRIV($varName, $varValue){
	global $RegistrationId;
	global $_SESSION;
	//WFSendLOG("WFVALUESESSIONSET", "value:" . $varName);
	if(!isset($_SESSION)) {
		ini_set('session.use_only_cookies', false);
		ini_set('session.use_cookies', false);
		ini_set('session.use_trans_sid', false);
		ini_set('session.cache_limiter', null);
		session_start(); // second session_start
	}
	$_SESSION[$varName] = $varValue;
}

function WFVALUEUSERVAR($varName = 'ID'){ 
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $UserId;
	$NewChiave = '';
	WFSendLOG("WFVALUEUSER", "var:" . $varName);
	//VARIABILI
	$sql =  "SELECT " . $varName ." FROM " . $ExtJSDevDB . "user WHERE ID = " . $UserId;
	//echo($sql);
	try {   
		$rs = $conn->Execute($sql);	
	} catch (exception $e){
		$sql =  "SELECT * FROM " . $ExtJSDevDB . "userglobal WHERE CT_AAAUSER = " . $UserId  . " AND DESCNAME = '" . $varName ."'";
		
		try {   
			$rs = $conn->Execute($sql);	
			if ($rs) {
				if ($rs->RecordCount() == 1) {
					$NewChiave = $rs->fields['KEYVALUE'];
				}
				$rs->close();
			}
		} catch (exception $e){
			
		}
	}
	
	if ($rs) {
		if ($rs->RecordCount() == 1) {
			$NewChiave = $rs->fields['KEYVALUE'];
		}
		$rs->close();
	}
	
	return ($NewChiave);
}
function WFVALUEUSERVARSET($varName, $varValue){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $UserId;
	
	WFSendLOG("WFVALUEUSERSET", "var:" . $varName . ' = '. $varValue);
	$sql =  "SELECT * FROM " . $ExtJSDevDB . "userglobal WHERE CT_AAAUSER = " . $UserId  . " AND DESCNAME = '" . $varName ."'";
	$rs = $conn->Execute($sql);
	
	$record = array();
	$record['CT_AAAUSER'] = $UserId;
	$record['DESCNAME'] = $varName;
	$record['KEYVALUE'] = $varValue; 
	
	if ($rs) {
		if ($rs->RecordCount() == 1) {
			$SqlC = $conn->GetUpdateSQL($rs, $record);
			if ($SqlC != '') $conn->Execute($SqlC); 
		}
		elseif ($rs->RecordCount() == 0) {
			$SqlC = $conn->GetInsertSQL($rs, $record);
			$conn->Execute($SqlC);
		}
		$rs->Close();
	}
}
function WFVALUEGLOBAL($varName){
	return WFGLOBAL($varName);
}
function WFGLOBAL($varName){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $ExtJSDevArchive;
	
	WFSendLOG("WFVALUEGLOBAL", "var:" . $varName);
	
	if ($varName == 'repository'){
		return $ExtJSDevArchive . 'repository' . '/';
	}else
	if ($varName == 'repositorycom'){
		return $ExtJSDevArchive . 'repositorycom' . '/';
	}
	
	
	$sql = "SELECT ID, DESCNAME, KEYVALUE FROM " . $ExtJSDevDB . "global WHERE DESCNAME = '" . $varName ."'";
	$rs = $conn->Execute($sql);
	
	$NewChiave = '';
	$record2 = array();
	$record2['DESCNAME'] = $varName;
	$record2['KEYVALUE'] = ''; 
	if ($rs) {
		if ($rs->RecordCount() == 1) {
			$NewChiave = $rs->fields['KEYVALUE'];
		}
		elseif ($rs->RecordCount() == 0) {
			$date = new DateTime();
			$record2['ID'] = $date->getTimestamp();
			$SqlC = $conn->GetInsertSQL($rs, $record2);
			$conn->Execute($SqlC); 
		}
		$rs->Close();
	}
	return ($NewChiave);
}
function WFVALUEGLOBALSET($varName, $varValue){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	WFSendLOG("WFVALUEGLOBALSET", "var:" . $varName . ' = '. $varValue);
	$sql = "SELECT * FROM " . $ExtJSDevDB . "global WHERE DESCNAME = '" . $varName ."'";
	$rs = $conn->Execute($sql);
	
	$record = array();
	$record['DESCNAME'] = $varName;
	$record['KEYVALUE'] = $varValue; 
	
	if ($rs) {
		if ($rs->RecordCount() == 1) {
			$SqlC = $conn->GetUpdateSQL($rs, $record);
			if ($SqlC != '') $conn->Execute($SqlC); 
		}
		elseif ($rs->RecordCount() == 0) {
			$SqlC = $conn->GetInsertSQL($rs, $record);
			$conn->Execute($SqlC);
		}
		$rs->Close();
	}
}

function WFVALUELAYOUT($ReqLayoutId = '', $NullValue = ''){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	global $UserId;
	
	WFSendLOG("WFVALUELAYOUT", "ReqLayoutId:" . $ReqLayoutId);
	$sqlSTD = "SELECT " . $ExtJSDevDB . "layout.*
				FROM " . $ExtJSDevDB . "layout " ;
														 
	$sqlOVER = "SELECT " . $ExtJSDevDB . "layoutoverride.*
				FROM " . $ExtJSDevDB . "layoutoverride ";
	if (is_numeric($ReqLayoutId) == true){
		$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "layout.ID = " . $ReqLayoutId;
		$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "layoutoverride.ID = " . $ReqLayoutId; 
	} else {
		$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "layout.DESCNAME = '" . $ReqLayoutId ."'";
		$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "layoutoverride.DESCNAME = '" . $ReqLayoutId ."'"; 
	}
	$sql = $sqlOVER  . " " . $sqlWhereOVER . " UNION " . $sqlSTD . " " . $sqlWhereSTD;
	
	$rs = $conn->Execute($sql);
	$NewChiave = $NullValue;
	if ($rs) {
		$NewChiave = $rs->fields['LAYOUTJSON'];
		$rs->close();
	}
	if (IsNullOrEmptyString($NewChiave)) $NewChiave = $NullValue;
	$NewChiaveFind = substr($NewChiave, 0, 10);
	$NewChiaveFindNew = str_replace('?>','  ', $NewChiaveFind);
	$NewChiave = str_replace($NewChiaveFind,$NewChiaveFindNew, $NewChiave);
	return ($NewChiave);
}

function WFVALUEEXEC($source = ''){
	//Global Var inside function
	foreach($GLOBALS as $key => $value ) {
		if (($key == 'GLOBALS') || (substr($key,0,1) == '_')) { 
			continue; 
		} else {
			eval("global $" . $key . ";");
		}
	}
	eval($source);
}

function WFVALUECLIENTIP(){
    $ipaddress = '';
    if (isset($_SERVER['HTTP_CLIENT_IP']))
        $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    else if(isset($_SERVER['HTTP_X_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    else if(isset($_SERVER['HTTP_X_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
    else if(isset($_SERVER['HTTP_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
    else if(isset($_SERVER['HTTP_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_FORWARDED'];
    else if(isset($_SERVER['REMOTE_ADDR']))
        $ipaddress = $_SERVER['REMOTE_ADDR'];
    else
        $ipaddress = 'UNKNOWN';
    return $ipaddress;
}
function WFVALUECLIENTIPCOUNTRY(){
	$PublicIP = WFVALUECLIENTIP(); 
	$json  = file_get_contents("https://freegeoip.net/json/$PublicIP");
	$json =  json_decode($json ,true);
	return $json['country_name'];
	//$region= $json['region_name'];
	//$city = $json['city'];
}
function WFVALUECLIENTIPLOCALIZE(){
	$PublicIP = WFVALUECLIENTIP(); 
	$json  = file_get_contents("https://freegeoip.net/json/$PublicIP");
	return json_decode($json ,true);
	//$country =  $json['country_name'];
	//$region= $json['region_name'];
	//$city = $json['city'];
}

function WFVALUEDOCIDEAN($docname, $id){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDevCodeSWEAN;
	global $RegistrationId;
	
	$keyvalue = '1';
	/*if (str_word_count($docname) > 1) {
		WFRaiseError(0, 'Errore di Definizione Indice Chiave:' . $docname  , 'WFVALUEDOCIDEAN', '');
		return;
	}*/
	
	if(IsNumeric($id) != true) {
		$id = WFVALUE($id);
	}
	$Source = '';
	$sql = "SELECT * 
			FROM " . $ExtJSDevDB . "sequence 
			WHERE (DESCNAME = '" . $docname . "')";
	$rs = $conn->Execute($sql);
	if ($rs !== false) {
		if ($rs->RecordCount()==1) {
			$precode = cint($rs->fields['BARCODEPRECODE']);
			//  2o3chr ExtJSDevCodeSWEAN
			//  2chr TipoSequence (identifica la tab in cui si trova l'id di seguito)
			//	7chr Id nella tabella
			$Source = zeroStr($ExtJSDevCodeSWEAN,3) . zeroStr($precode,2) . zeroStr($id,7);
			$Source = NumberToEAN13($Source);
			if ($conn->debug==1) echo("WFGETDOCIDEAN:" . $Source. "<BR>\n");
		}
		$rs->close();
	}
	return $Source;
}

function WFVALUENUMREG(){
	global $RegistrationId;
	return $RegistrationId;
}
function WFCLEANUP($tablename = 'appoggio'){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	
	$sql = "DELETE FROM  " . $tablename . " WHERE NUMREG = " . $RegistrationId;
	$conn->execute($sql);
	
	//$sql = "DELETE FROM " . $ExtJSDevDB . "formvalues WHERE NUMREG = " . $RegistrationId;
	//$rs = $conn->execute($sql);
}
function WFCLEANUPFORM($ReqLayoutId = '0'){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	global $UserId;
	
	if (acSelf == $ReqLayoutId ) $ReqLayoutId  = $LayoutId;
	
	if (($ReqLayoutId !='0') && ($ReqLayoutId != '')) { 
		$sqlLay = "SELECT * FROM " . $ExtJSDevDB . "layout WHERE ";
		if (is_numeric($ReqLayoutId) == true) {
			$sqlLay = $sqlLay . " ID = " . $ReqLayoutId;
		} else {
			$sqlLay = $sqlLay . " DESCNAME = '" . $ReqLayoutId . "'";
		}
		$rs = $conn->Execute($sqlLay);
		if ($rs !== false) {
			$ReqLayoutId = $rs->fields['ID'];
			$rs->close();
		}
	}
	
	$sql = "DELETE FROM " . $ExtJSDevDB . "formvalues 
			WHERE NUMREG = " . $RegistrationId  . "
				AND CT_AAAUSER = " . $UserId;
	if (($ReqLayoutId != '0') && ($ReqLayoutId != '')) $sql =  $sql . " AND CT_AAALAYOUT = " . $ReqLayoutId ;
	$rs = $conn->execute($sql);
}

function WFVALUESESSIONLIST(){
	global $RegistrationId;
	global $_SESSION;
	$NewChiave = '';
	foreach ($_SESSION as $key=>$val){
		if (strtoupper($key) == $key){
			$NewChiave= $NewChiave . " " . $key.">".$val;
		}
	}
	
	return ($NewChiave);
}
function WFVALUESESSION($varName){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $UserId;
	
	WFSendLOG("WFVALUESESSION", "varname:" . $varName);
	
	$sql = "SELECT FIELDVALUE 
				FROM " . $ExtJSDevDB . "usersession 
				WHERE FIELDNAME = '" . $varName . "' 
					AND NUMREG = " . $RegistrationId . "
					AND CT_AAAUSER = " . $UserId . "
				ORDER BY ID DESC";
	$rs = $conn->Execute($sql);
	
	$NewChiave = null;
	if ($rs !== false) {
		if ($rs->RecordCount() > 0) $NewChiave = $rs->fields['FIELDVALUE'];
		$rs->close();
	}
	return ($NewChiave);
}
function WFVALUESESSIONSET($varName, $varValue){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $UserId;
	
	WFSendLOG("WFVALUESESSIONSET", "varname:" . $varName);
	
	if (IsNullOrEmptyString($varName)){
		$sql = "SELECT * 
				FROM " . $ExtJSDevDB . "usersession 
				WHERE FIELDNAME is null 
					AND NUMREG = " . $RegistrationId . "
					AND CT_AAAUSER = " . $UserId . "
				ORDER BY ID DESC";

	}
	else{
		$sql = "SELECT * 
				FROM " . $ExtJSDevDB . "usersession 
				WHERE FIELDNAME = '" . $varName . "' 
					AND NUMREG = " . $RegistrationId . "
					AND CT_AAAUSER = " . $UserId . "
				ORDER BY ID DESC";
	}
	$rs = $conn->Execute($sql);
	
	$record = array();
	$record['FIELDNAME'] = $varName;
	$record['FIELDVALUE'] = $varValue; 
	$record['NUMREG'] = $RegistrationId; 
	$record['CT_AAAUSER'] = $UserId; 
	
	if ($rs) {
		if ($rs->RecordCount() == 1) {
			$SqlC = $conn->GetUpdateSQL($rs, $record);
			if ($SqlC != '') $conn->Execute($SqlC); 
		}
		elseif ($rs->RecordCount() == 0) {
			$SqlC = $conn->GetInsertSQL($rs, $record);
			$conn->Execute($SqlC);
		}
		$rs->Close();
	}
}

function WFVALUEDLOOKUP($fld, $tab, $whr, $FieldMode = ADODB_FETCH_BOTH, $order = ''){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	
	$start_time = microtime(true); 
	$tab = ExecFuncInStringSQL($tab);
	$varappo =  DLookup($conn, $fld, $tab, $whr, $FieldMode, $order);
	
	WFSendLOG("WFVALUEDLOOKUP", $fld . ',' . $tab . ',' . $whr. ',' . $order, microtime_diff($start_time));
	return $varappo;
}
function WFARRAYDLOOKUP($fld, $tab, $whr, $FieldMode = ADODB_FETCH_BOTH, $order = '', $limit = 0){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	$tab = ExecFuncInStringSQL($tab);
	
	WFSendLOG("WFARRAYDLOOKUP", $fld . ',' . $tab . ',' . $whr);
	return getRows($conn, $fld, $tab, $whr, $limit , $FieldMode, $order);
}
function WFTYPEDLOOKUP($fld, $tab){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;

	WFSendLOG("WFTYPEDLOOKUP", $fld . ',' . $tab);
	return TLookup($conn, $fld, $tab);
}

function WFSQLTOARRAY($sql){
	global $conn;
	$TotaliGGArray = array();
	$TotaliGGrs = $conn->execute($sql);
	$RecordCountResult = $TotaliGGrs->RecordCount();
	$ColumnCountResult = $TotaliGGrs->FieldCount();
	for ($i = 0; $i < $ColumnCountResult; $i++) {
		$fld = $TotaliGGrs->FetchField($i);
		$name = $fld->name;
		$header = $fld->name;
		$fldType = $TotaliGGrs->MetaType($fld->type);
		$fieldphptype = 'string';
		$lockedInGrid = false;
		$hiddenInGrid = false;
		$editableInGrid  = false;
		$renderInGridSummaryType = '';
		$editor = null;
		if     ($fldType == 'C') { $type = '';		$editortype = 'textfield';	$filtertype = 'string';	$formattype ='';	$formattypefilter = '';	$fieldtype = 'string';	$fieldphptype = 'string';	$width = 150;	$flex = 1;} //VCHR
		elseif ($fldType == 'X') { $type = '';		$editortype = 'textarea';	$filtertype = 'string';	$formattype ='';	$formattypefilter = '';	$fieldtype = 'string';	$fieldphptype = 'string';	$width = 600;	$flex = 2;} //CLOB
		elseif ($fldType == 'B') { $type = '';		$editortype = 'textarea';	$filtertype = 'string';	$formattype ='';	$formattypefilter = '';	$fieldtype = 'string';	$fieldphptype = 'string';	$width = 600;	$flex = 2;} //BLOB
		elseif ($fldType == 'I') { $type = 'numbercolumn';	$editortype = 'numberfield';$filtertype = 'number';	$formattype ='';	$formattypefilter = '';	$fieldtype = 'number';	$fieldphptype = 'int';	$width = 70;	$flex = 1;} //INT
		elseif ($fldType == 'N') { $type = 'numbercolumn';	$editortype = 'numberfield';$filtertype = 'number';	$formattype ='';	$formattypefilter = '';	$fieldtype = 'number';	$fieldphptype = 'float';	$width = 70;	$flex = 1;}	//NUM (DEC)
		//elseif ($fldType == 'D') { $type = 'datecolumn';	$editortype = 'datefield';	$filtertype = 'date';	$formattype ='Y-m-d';	$formattypefilter = 'Y-m-d';	$fieldtype = 'date';	$fieldphptype = 'string';	$width = 100;	$flex = 1;}	//DATE
		elseif ($fldType == 'D') { $type = 'datecolumn';	$editortype = 'datefield';	$filtertype = 'date';	$formattype ='d-m-Y';	$formattypefilter = 'Y-m-d';	$fieldtype = 'date';	$fieldphptype = 'string';	$width = 100;	$flex = 1;}	//DATE
		elseif ($fldType == 'L') { $type = 'checkcolumn';	$editortype = 'checkbox';	$filtertype = 'boolean';$formattype ='';	$formattypefilter = '';	$fieldtype = 'boolean';	$fieldphptype = 'string';	$width = 50;	$flex = 1;} //BIT
		elseif ($fldType == 'R') { $type = 'numbercolumn';	$editortype = 'numberfield';$filtertype = 'number';	$formattype ='';	$formattypefilter = '';	$fieldtype = 'number';	$fieldphptype = 'int';	$width = 70;	$flex = 1;} //COUNT
		elseif ($fldType == 'T') { $type = '';		$editortype = 'textfield';	$filtertype = 'string';	$formattype ='';	$fieldtype = 'string';	$fieldphptype = 'string';	$width = 120;	$flex = 1;} //TIMESTAMP
		else					 { $type = '';		$editortype = 'textfield';	$filtertype = 'string';	$formattype ='';	$fieldtype = 'string';	$fieldphptype = 'string';	$width = 150;	$flex = 1;} //VCHR
		//if ($max_length > 1000) { $type = '';$editortype = 'textarea';	$filtertype = 'string'; $formattype ='';	$width = 600;	$flex = 2;}  //CLOB

		$filter = array(
			"type" => $filtertype,  
			"dateFormat" => $formattypefilter,
			"record" => $RecordCountResult
		);
		
		$column = array(
			"dataIndex"=> $name,
			"xtype"=> $type,
			"header" => $header, 
			"hiddenInGrid" => $hiddenInGrid,
			"lock" => $lockedInGrid,
			"editableInGrid" => $editableInGrid,
			"summaryType" => $renderInGridSummaryType,
			"format" => $formattype,
			"editor" => $editor, 
			"filter" => $filter
		);

		$field = array(
			"name" => $name,
			"type"=>$fieldtype,
			"typephp"=>$fieldphptype,
			"dateFormat"=> $formattype,
			"xtype"=> $editortype 
		);

		$fields[] = $field;
		$columns[] = $column;
	}
	
	while (!$TotaliGGrs->EOF){
		$keys = array();
		for ($i=0; $i < $ColumnCountResult; $i++) {
			$camponome = $fields[$i]["name"];
			$keys[$camponome] = $TotaliGGrs->fields[$camponome];
			settype($keys[$camponome], $fields[$i]["typephp"]);
		}
		$TotaliGGArray[] = $keys;
		$TotaliGGrs->MoveNext();
		$RecordCountResult = $RecordCountResult + 1;
	}
	return $TotaliGGArray;
}

/************************************************************************************/
/*                   		  	  FUNC DATE TIME									*/
/************************************************************************************/
function WFVALUENOW($Params = 'Y-m-d H:i:s'){
	$tempvar = date($Params);
	return ($tempvar);
}
function WFVALUEYESTERDAY($Params = 'Y-m-d H:i:s'){
	$tempvar = date($Params ,strtotime("-1 days"));
	return ($tempvar);
}
function WFVALUETIMESTAMP(){
	$date = new DateTime();
	return ($date->getTimestamp());
}

function WFVALUEYEAR($DateDef = '', $Params = 'Y-m-d'){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		}
		elseif (IsNumeric($DateDef)){
			$datetime->modify($DateDef . " year");
		}
		else {
			$datetime = new DateTime($DateDef);
		}
	}
	return ($datetime->format('Y'));
}
function WFVALUEMONTH($DateDef = '', $Params = 'Y-m-d'){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	return ($datetime->format('m'));
}
function WFVALUEMONTHDAYEND($DateDef = '', $Params = 'Y-m-d'){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	return ($datetime->format('t'));
}
function WFVALUETRIMESTRE($DateDef = '', $Params = 'Y-m-d'){
	return WFVALUEQUATER($DateDef = '', $Params = 'Y-m-d');
}
function WFVALUEQUATER($DateDef = '', $Params = 'Y-m-d'){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	$mese = $datetime->format('n');
	if($mese==1||$mese==2||$mese==3){
	  return 1;
	}elseif($mese==4||$mese==5||$mese==6){
	  return 2;
	}elseif($mese==7||$mese==8||$mese==9){
	  return 3;
	}elseif($mese==10||$mese==11||$mese==12){
	  return 4;
	}
}
function WFVALUEDAY($DateDef = '', $Params = 'Y-m-d'){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	return ($datetime->format('d'));
}
function WFVALUEDAYOFYEAR($DateDef = '', $Params = 'Y-m-d'){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	$date2 = new DateTime(date($datetime->format('Y') . '-01-01'));
	$day = $date2->diff($datetime)->format('%a');
	$day = $day +1;
	$day = str_pad($day,3,'0',STR_PAD_LEFT);
	return "" . $day;
}
function WFVALUEWEEKDAY($DateDef = '', $Params = 'Y-m-d', $Localize = 'it'){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	return ($datetime->format('w'));
}
function WFVALUEWEEKDAYNAME($DateDef = '', $Params = 'Y-m-d', $Localize = 'it'){
	$datetime = new DateTime();
	//http://php.net/manual/en/function.date.php
	
	$lang_month['it'] = array( 'Gennaio','Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre','Dicembre');
	$lang_monthmin['it'] = array( 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov','Dic');
	$lang_weekday['it'] = array('domenica','lunedì','martedì','mercoledì', 'giovedì','venerdì','sabato');
	$lang_weekdaymin['it'] = array('Dom','Lun','Mar','Mer', 'Gio','Ven','Sab');
	
	$lang_month['en'] = array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November','December');
	$lang_monthmin['en'] = array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov','Dec');
	$lang_weekday['en'] = array('Sunday','Monday','Tuesday','Wednesday', 'Thursday','Friday','Saturday');
	$lang_weekdaymin['en'] = array('Sun','Mon','Tue','Wed', 'Thu','Fri','Sat');

	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	$DateStr = $datetime->format('D');
	$DateStr = str_replace($lang_weekdaymin['en'], $lang_weekdaymin['it'], $DateStr);
	return ($DateStr);
}
function WFVALUEWEEKNUM($DateDef = '', $Params = 'Y-m-d', $Localize = 'it'){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	return ($datetime->format('w'));
}
function WFVALUEWEEK($DateDef = '', $Params = 'Y-m-d'){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	return ($datetime->format('W'));
}

function WFVALUEDATELOCAL($DateDef, $Params = 'Y-m-d', $Localize = 'it'){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	$DateStr = $datetime->format($Params);
	//http://php.net/manual/en/function.date.php
	
	$lang_month['it'] = array( 'Gennaio','Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre','Dicembre');
	$lang_monthmin['it'] = array( 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov','Dic');
	$lang_weekday['it'] = array('domenica','lunedì','martedì','mercoledì', 'giovedì','venerdì','sabato');
	$lang_weekdaymin['it'] = array('Dom','Lun','Mar','Mer', 'Gio','Ven','Sab');
	
	$lang_month['en'] = array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November','December');
	$lang_monthmin['en'] = array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov','Dec');
	$lang_weekday['en'] = array('Sunday','Monday','Tuesday','Wednesday', 'Thursday','Friday','Saturday');
	$lang_weekdaymin['en'] = array('Sun','Mon','Tue','Wed', 'Thu','Fri','Sat');

	if ( strpos($DateStr, 'M') !== true){
		$DateStr = str_replace($lang_monthmin['en'], $lang_monthmin['it'], $DateStr);
	}
	if ( strpos($DateStr, 'F') !== true){
		$DateStr = str_replace($lang_month['en'], $lang_month['it'], $DateStr);
	}
	if ( strpos($DateStr, 'N') !== true){
		$DateStr = str_replace($lang_weekday['en'], $lang_weekday['it'], $DateStr);
	}	
	if ( strpos($DateStr, 'D') !== true){
		$DateStr = str_replace($lang_weekdaymin['en'], $lang_weekdaymin['it'], $DateStr);
	}
	
	return $DateStr;
}
function WFVALUEDATE($varName, $ReqLayoutId = acSelf, $Params = 'Y-m-d', $NullValue = ''){
	$NewChiave = WFVALUE($varName, $ReqLayoutId, $NullValue);
	//$tempvar = date($Params);
	$datetime = new DateTime();
	if ($NewChiave != "") {
		if ($NewChiave instanceof DateTime) {
			$datetime = $NewChiave;
		} else {
			$datetime = new DateTime($NewChiave);
		}
	}
	$DateStr = $datetime->format($Params);
	return ($DateStr);
}

function WFVALUEDATEBUSUB(&$startDateIN, $str_interval, $dayStart = '08:30', $dayEnd = '18:30', $weekDaysOnly = true) {
    //Break the working day start and end times into hours, minuets
    $dayStart = explode(':', $dayStart);
    $dayEnd = explode(':', $dayEnd);
    $str_interval = explode(':', $str_interval);
	
    //data di inizio
	$datetime = new DateTime();
	if ($startDateIN == "") {
	} else {
		if ($startDateIN instanceof DateTime) {
			$datetime = $startDateIN;
		} else {
			$datetime = new DateTime($startDateIN);
		}
	}
	
	//se inzio giornata è dopo ora di partenza ne tiene conto e inizia dallo start di gg es: 8 e 8.30
	$startofday = new DateTime( $datetime->format('Y-m-d') . ' ' . $dayStart[0] . ':' . $dayStart[1]);
	$hdec = (intval($datetime->format('h')) *60) + intval($datetime->format('i'));
	$hdecstart = (intval($startofday->format('h')) *60) + intval($startofday->format('i'));
	if ( $hdecstart - $hdec > 0) $datetime->setTime($dayStart[0], $dayStart[1]);

	//se inzio giornata è festivo ne tiene conto e va indietro fino al dal primo gg lavorativo
    while(true){
		if(in_array($datetime->format('l'), array('Sunday','Saturday')) && $weekDaysOnly){
			$datetime->sub(new DateInterval('PT24H'));
		}else{
			break;
		}
	}
	$startDateIN = clone($datetime);
	
	//calcola del primo fine giornata
	$endofday = new DateTime( $datetime->format('Y-m-d') . ' ' . $dayEnd[0] . ':' . $dayEnd[1]);
	$startofday = new DateTime( $datetime->format('Y-m-d') . ' ' . $dayStart[0] . ':' . $dayStart[1]);
	
	//calcola intervallo datatime da sottrarre
    $interval = 'PT' . $str_interval[0] . 'H' . $str_interval[1] . 'M';
		
    //Sub hours onto initial given date
    $datetime->sub(new DateInterval($interval));
	
    //if initial date + hours is after the end of working day
    if($datetime < $startofday){
        //get the difference between the initial date + interval and the end of working day in seconds
        $seconds =  $startofday->getTimestamp() - $datetime->getTimestamp();

        //Loop to prev day
        while(true){
            $endofday->sub(new DateInterval('PT24H'));//Loop to next day by sub 24hrs
            $nextDay = $endofday->setTime($dayStart[0], $dayStart[1]);//Set day to working day start time
            //If the next day is on a weekend and the week day only param is true continue to sub days
            if(in_array($nextDay->format('l'), array('Sunday','Saturday')) && $weekDaysOnly){
                continue;
            } else {
				//If not a weekend
                $tmpDate = clone $nextDay;
                $tmpDate->setTime($dayEnd[0], $dayEnd[1]);//clone the next day and set time to working day end time
                $nextDay->sub(new DateInterval('PT' . $seconds . 'S')); //sub the seconds onto the next day
                //if the next day time is later than the end of the working day continue loop
                if($nextDay > $tmpDate){
                    $seconds = $nextDay->getTimestamp() - $tmpDate->getTimestamp();
                    $endofday = clone $tmpDate;
                    $endofday->setTime($dayStart[0], $dayStart[1]);
                } else {
					break;
                }
            }
        }
    }
    return $endofday;
}
function WFVALUEDATEBUADD(&$startDateIN, $str_interval, $dayStart, $dayEnd, $weekDaysOnly) {
    //Break the working day start and end times into hours, minuets
    $dayStart = explode(':', $dayStart);
    $dayEnd = explode(':', $dayEnd);
    $str_interval = explode(':', $str_interval);
	
    //data di inizio
	$datetime = new DateTime();
	if ($startDateIN == "") {
	} else {
		if ($startDateIN instanceof DateTime) {
			$datetime = $startDateIN;
		} else {
			$datetime = new DateTime($startDateIN);
		}
	}
	
	//se inzio giornata è dopo ora di partenza ne tiene conto e inizia dallo start di gg es: 8 e 8.30
	$startofday = new DateTime( $datetime->format('Y-m-d') . ' ' . $dayStart[0] . ':' . $dayStart[1]);
	$hdec = (intval($datetime->format('h')) *60) + intval($datetime->format('i'));
	$hdecstart = (intval($startofday->format('h')) *60) + intval($startofday->format('i'));
	if ( $hdecstart - $hdec > 0) $datetime->setTime($dayStart[0], $dayStart[1]);

	//se inzio giornata è festivo ne tiene conto e va avanti fino al dal primo gg lavorativo
    while(true){
		if(in_array($datetime->format('l'), array('Sunday','Saturday')) && $weekDaysOnly){
			$datetime->sub(new DateInterval('PT24H'));
		}else{
			break;
		}
	}
	$startDateIN = clone($datetime);
	
	//calcola del primoo fine giornata
	$endofday = new DateTime( $datetime->format('Y-m-d') . ' ' . $dayEnd[0] . ':' . $dayEnd[1]);
	
	//calcola intervallo datatime da aggiungere
    $interval = 'PT' . $str_interval[0] . 'H' . $str_interval[1] . 'M';
		
    //add hours onto initial given date
    $datetime->add(new DateInterval($interval));
	
    //if initial date + hours is after the end of working day
    if($datetime > $endofday){
        //get the difference between the initial date + interval and the end of working day in seconds
        $seconds = $datetime->getTimestamp()- $endofday->getTimestamp();

        //Loop to next day
        while(true){
            $endofday->add(new DateInterval('PT24H'));//Loop to next day by adding 24hrs
            $nextDay = $endofday->setTime($dayStart[0], $dayStart[1]);//Set day to working day start time
            //If the next day is on a weekend and the week day only param is true continue to add days
            if(in_array($nextDay->format('l'), array('Sunday','Saturday')) && $weekDaysOnly){
                continue;
            } else {
				//If not a weekend
                $tmpDate = clone $nextDay;
                $tmpDate->setTime($dayEnd[0], $dayEnd[1]);//clone the next day and set time to working day end time
                $nextDay->add(new DateInterval('PT' . $seconds . 'S')); //add the seconds onto the next day
                //if the next day time is later than the end of the working day continue loop
                if($nextDay > $tmpDate){
                    $seconds = $nextDay->getTimestamp() - $tmpDate->getTimestamp();
                    $endofday = clone $tmpDate;
                    $endofday->setTime($dayStart[0], $dayStart[1]);
                } else {
					break;
                }
            }
        }
    }
    return $endofday;
}

function WFVALUEDATEADD($startDateIN, $str_interval,$str_type = 'd' ){
	$str_type = strtolower($str_type);
	if( is_string( $startDateIN)) $startDateIN = date_create( $startDateIN);
	if    ( ($str_type == 's') || ($str_type == 'sec') ) $str_type= 'second';
	elseif( ($str_type == 'n') || ($str_type == 'min') ) $str_type= 'minutes';
	elseif( ($str_type == 'h') || ($str_type == 'hrs') ) $str_type= 'hours';
	elseif( ($str_type == 'd') || ($str_type == 'g')   ) $str_type= 'days';
	elseif( $str_type == 'm')							 $str_type= 'months';
	elseif( $str_type == 'y') 							 $str_type= 'years';
	elseif( $str_type == 'a') 							 $str_type= 'years';
	return date_add($startDateIN, date_interval_create_from_date_string($str_interval . ' ' . $str_type));
}
function WFVALUEDATEDIF($startDateIN, $startDateOUT,$str_type = 'd', $relative = false ){
	if( is_string($startDateIN)) $startDateIN = date_create($startDateIN);
	if( is_string($startDateOUT)) $startDateOUT = date_create($startDateOUT);
	$total = 0;
	$diff = date_diff( $startDateIN, $startDateOUT, ! $relative);
   
	switch( $str_type){
		case "y": 
			$total = $diff->y + $diff->m / 12 + $diff->d / 365.25;
		break;
		case "m":
			$total= $diff->y * 12 + $diff->m + $diff->d/30 + $diff->h / 24;
		break;
		case "d":
			$total = $diff->days;
		break;
		case "h": 
			$total = ($diff->days) * 24 + $diff->h + $diff->i/60;
		break;
		case "i": 
		case "n": 
			$total = (($diff->days) * 24 + $diff->h) * 60 + $diff->i + $diff->s/60;
		break;
		case "s": 
			$total = ((($diff->days) * 24 + $diff->h) * 60 + $diff->i)*60 + $diff->s;
		break;
	}	
	if( $diff->invert){
		return -1 * $total;
	}	else   { 
		return $total;
	}
}

function WFVALUEDATECALENDARADD(&$startDateIN, $addTimeIN, $dayStartTimeIN, $dayEndTimeIN, $workingDayOnly) {
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	
    //data from -  datetimeIN
	$datetime = new DateTime();
	if ($startDateIN != "") {
		if ($startDateIN instanceof DateTime) {
			$datetime = $startDateIN;
		} else {
			$datetime = new DateTime($startDateIN);
		}
	}
	
    //data to add - addtime
	$addtime = new DateTime();
	if ($addTimeIN != "") {
		if ($addTimeIN instanceof DateTime) {
			$addtime = $addTimeIN;
		} else {
			$addtime = new DateTime($addTimeIN);
		}
	}
	
    //Time Start Day - dayStartTimeIN
	$dayStartTime = new DateTime();
	$dayStartTime->setTime(8,30,0);
	if ($dayStartTimeIN != "") { 
		if ($dayStartTimeIN instanceof DateTime) {
			$dayStartTime = $dayStartTimeIN;
		} else {
			$dayStartTime = new DateTime($dayStartTimeIN);
		}
	}
	
    //Time End Day - dayEndTimeIN
	$dayEndTime = new DateTime();
	$dayEndTime->setTime(17,30);
	if ($dayEndTimeIN != "") { 
		if ($dayEndTimeIN instanceof DateTime) {
			$dayEndTime = $dayEndTimeIN;
		} else {
			$dayEndTime = new DateTime($dayEndTimeIN);
		}
	}
	
	//se inzio giornata è dopo ora di partenza ne tiene conto e inizia dallo start di gg es: 8 e 8.30
	if ((intval($datetime->format('H')) == 0) && (intval($datetime->format('i')) == 0))  {
		//se viene passata data senza ora mette ora di inizio
		$datetime->setTime($dayStartTime->format('H'), $dayStartTime->format('i'));
	}else{
		//se viene passata data con ora controlla che sia almeno l ora di inizio
		$startofday = new DateTime( $datetime->format('Y-m-d') . ' ' . $dayStartTime->format('H') . ':' . $dayStartTime->format('i'));
		$hdec = (intval($datetime->format('H')) *60) + intval($datetime->format('i'));
		$hdecstart = (intval($startofday->format('H')) *60) + intval($startofday->format('i'));
		if ( $hdecstart - $hdec > 0) {
			$datetime->setTime($dayStartTime->format('H'), $dayStartTime->format('i'));
		}
	}
	
	//se inzio giornata è festivo ne tiene conto e va avanti fino al dal primo gg lavorativo
    while(true){
		if(in_array($datetime->format('l'), array('Sunday','Saturday')) && $workingDayOnly){
			$datetime->sub(new DateInterval('PT24H'));
		}else{
			break;
		}
	}
	$startDateIN = clone($datetime);
	
	//calcola del primoo fine giornata
	$endofday = new DateTime( $datetime->format('Y-m-d') . ' ' . $dayEndTime->format('H') . ':' . $dayEndTime->format('i'));
	
	//calcola intervallo datatime da aggiungere
    $interval = 'PT' . $addtime->format('H') . 'H' . $addtime->format('i') . 'M';
		
    //Add hours onto initial given date
    $datetime->add(new DateInterval($interval));
	
    //if initial date + hours is after the end of working day
    if($datetime > $endofday){
        //get the difference between the initial date + interval and the end of working day in seconds
        $seconds = $datetime->getTimestamp()- $endofday->getTimestamp();
		
        //Loop to next day
        while(true){
            $endofday->add(new DateInterval('PT24H'));//Loop to next day by adding 24hrs
            $nextDay = $endofday->setTime($dayStartTime->format('H') , $dayStartTime->format('i'));//Set day to working day start time
            //If the next day is on a weekend and the week day only param is true continue to add days
            if(in_array($nextDay->format('l'), array('Sunday','Saturday')) && $workingDayOnly){
                continue;
            } else {
				//If not a weekend
                $tmpDate = clone $nextDay;
                $tmpDate->setTime($dayEndTime->format('H') , $dayEndTime->format('i'));//clone the next day and set time to working day end time
                $nextDay->add(new DateInterval('PT' . $seconds . 'S')); //add the seconds onto the next day
                //if the next day time is later than the end of the working day continue loop
                if($nextDay > $tmpDate){
                    $seconds = $nextDay->getTimestamp() - $tmpDate->getTimestamp();
                    $endofday = clone $tmpDate;
                    $endofday->setTime($dayStartTime->format('H') , $dayStartTime->format('i'));
                } else {
					break;
                }
            }
        }
    }else{
		$endofday = clone $datetime;
	}
	
	return $endofday;
}

function WFHRSTODATE($Hours){
	$currentDayTime = new DateTime();
	$currentDayTime->setTime($Hours,0,0);
	return $currentDayTime;
}
function WFMINTODATE($Minutes){
	$hrs = floor($Minutes / 60);
	$min = $Minutes % 60;
	$currentDayTime = new DateTime();
	$currentDayTime->setTime($hrs,$Minutes,0);
	return $currentDayTime;
}
function WFSECTODATE($Seconds){
	$hrs = floor($Seconds / 60 / 60);
	$Seconds = $Seconds - ($hrs * 60 *60);
	
	$min = floor($Seconds / 60);
	$Seconds = $Seconds - ($min * 60);
	
	$sec = $Seconds;
	$currentDayTime = new DateTime();
	$currentDayTime->setTime($hrs,$min,$sec);
	return $currentDayTime;
}
function WFSTRTODATE($DateDef = '', $Localization = 'it', $Format = 'Y-m-d'){
	$lang_month['num'] = array( '/1/','/2/', '/3/', '/4/', '/5/', '/6/', '/7/', '/8/', '/9/', '/10/', '/11/','/12/');
	
	$lang_month['it'] = array( 'Gennaio','Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre','Dicembre');
	$lang_monthmin['it'] = array( 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov','Dic');
	
	$lang_month['en'] = array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November','December');
	$lang_monthmin['en'] = array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov','Dec');
	
	$DateDef = str_ireplace($lang_month['it'], $lang_month['num'], $DateDef);
	//$DateDef = str_ireplace($lang_month['en'], $lang_month['num'], $DateDef);
	
	$DateDef = str_ireplace($lang_monthmin['it'], $lang_month['num'], $DateDef);
	//$DateDef = str_ireplace($lang_monthmin['en'], $lang_month['num'], $DateDef);
	$DateDef = trim($DateDef);
	if (strlen($DateDef)>10){
	    $DateArray = explode(" ",$DateDef);
    	if (count($DateArray)==2) $DateDef =  $DateArray[0];
	}
	$DateDef = str_replace('/-', '-', $DateDef);
	$DateDef = str_replace('-/', '-', $DateDef);
	$DateDef = str_replace('--', '-', $DateDef);
	$DateDef = str_replace(' ', '', $DateDef);
	//The best way to compensate for this is by modifying your joining characters. 
	//(/) signifies American M/D/Y formatting, 
	//(-) signifies European D-M-Y 
	//(.) signifies ISO Y.M.D. 
	if (IsNullOrEmptyString ($DateDef)) return null;
	$DateDef = str_replace("/", "-", $DateDef);
	$DateDef = str_replace("\\", "-", $DateDef);
	$DateDef = str_replace(".", "-", $DateDef);
	
	if (!IsNumeric(substr($DateDef,0, 1))) return null;
	$DateArray = explode("-",$DateDef);
	if (count($DateArray)<3) return null;
	if ($DateArray[0] == '') return null;

	
	if ($DateArray[0] > 31){
		//data jappo
		$anno = $DateArray[0];
		$mese = $DateArray[1];
		$giorno = $DateArray[2];
	}else{
		//data eu + usa
		$anno =	$DateArray[2];
		if ($DateArray[1] > 12) $Localization = 'us';
		if (($Localization == 'it') || (($Localization == 'eu'))){				
			$anno = $DateArray[2];
			$mese = $DateArray[1];
			$giorno = $DateArray[0];
		}else{		
			$anno = $DateArray[2];
			$mese = $DateArray[0];
			$giorno = $DateArray[1];
		}
	}
	if (is_numeric($anno)) {
		if ($anno < 99) $anno = $anno + 2000;
		if ($anno > 2100) return null;
	}else{
		return null;
		//$datetime = new DateTime();
		//$anno = $datetime->format('Y');
	}
	
	if ($mese > 12) return null;
	if ($giorno > 31) return null;
	if ($anno > 3000) return null;
	
	if (DateTime::createFromFormat('Y-m-d', $anno . '-' . $mese  . '-' . $giorno) !== FALSE) {
		return DateTime::createFromFormat('Y-m-d', $anno . '-' . $mese  . '-' . $giorno)->format($Format);
	} else {
		return  null;
	}
}
function WFSTRTODATETIME($DateDef = '', $Localization = 'it', $Format = 'Y-m-d H:i:s') {
	$lang_month['num'] = array( '/1/','/2/', '/3/', '/4/', '/5/', '/6/', '/7/', '/8/', '/9/', '/10/', '/11/','/12/');
	
	$lang_month['it'] = array( 'Gennaio','Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre','Dicembre');
	$lang_monthmin['it'] = array( 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov','Dic');
	
	$lang_month['en'] = array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November','December');
	$lang_monthmin['en'] = array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov','Dec');
	
	$DateDef = str_ireplace($lang_month['it'], $lang_month['num'], $DateDef);
	//$DateDef = str_ireplace($lang_month['en'], $lang_month['num'], $DateDef);
	
	$DateDef = str_ireplace($lang_monthmin['it'], $lang_month['num'], $DateDef);
	//$DateDef = str_ireplace($lang_monthmin['en'], $lang_month['num'], $DateDef);
	
	$DateDef = str_replace('/-', '-', $DateDef);
	$DateDef = str_replace('-/', '-', $DateDef);
	$DateDef = str_replace('--', '-', $DateDef);
	$DateDef = trim($DateDef);
	//The best way to compensate for this is by modifying your joining characters. 
	//(/) signifies American M/D/Y formatting, 
	//(-) signifies European D-M-Y 
	//(.) signifies ISO Y.M.D. 
	if (IsNullOrEmptyString ($DateDef)) return null;
	$DateDef = str_replace("/", "-", $DateDef);
	$DateDef = str_replace("\\", "-", $DateDef);
	$DateDef = str_replace(".", "-", $DateDef);
	$DateDef = str_replace(":", "-", $DateDef);
	
	if (!IsNumeric(substr($DateDef,0, 1))) return null;
	$DateTimeArray = explode(" ",$DateDef);
	$DateArray = explode("-",$DateTimeArray[0]);
	if (count($DateArray)<3) return null;

	
	if ($DateArray[0] > 31){
		//data jappo
		$anno = $DateArray[0];
		$mese = $DateArray[1];
		$giorno = $DateArray[2];
	}else{
		//data eu + usa
		$anno =	$DateArray[2];
		if ($DateArray[1] > 12) $Localization = 'us';
		if (($Localization == 'it') || (($Localization == 'eu'))){				
			$anno = $DateArray[2];
			$mese = $DateArray[1];
			$giorno = $DateArray[0];
		}else{		
			$anno = $DateArray[2];
			$mese = $DateArray[0];
			$giorno = $DateArray[1];
		}
	}
	if (is_numeric($anno)) {
		if ($anno < 99) $anno = $anno + 2000;
		if ($anno > 2100) return null;
	}else{
		return null;
		//$datetime = new DateTime();
		//$anno = $datetime->format('Y');
	}
	
	
	if (count($DateTimeArray)==2){
    	$ore = 0;
    	$minuti = 0;
    	$secondi = 0;
		$TimeArray = explode("-",$DateTimeArray[1]);
		if (count($TimeArray)==2){
			$ore = $TimeArray[0];
			$minuti =$TimeArray[1];
		}elseif (count($TimeArray)==3){
			$ore = $TimeArray[0];
			$minuti =$TimeArray[1];
			$secondi =$TimeArray[2];
		}
		$ore = str_pad($ore,2,"0",STR_PAD_LEFT);
		$minuti = str_pad($minuti,2,"0",STR_PAD_LEFT);
		$secondi = str_pad($secondi,2,"0",STR_PAD_LEFT);
		return DateTime::createFromFormat('Y-m-d H:i:s', $anno . '-' . $mese  . '-' . $giorno . ' ' . $ore . ':' . $minuti  . ':' . $secondi )->format($Format);
	}else{
	    return DateTime::createFromFormat('Y-m-d', $anno . '-' . $mese  . '-' . $giorno  )->format($Format);
    }
}


function WFSQLTODATE($datein = "") {
	$dateInternal = date('Y-m-d');
	if ($datein == "") {}
	else {
		if ($datein instanceof DateTime) {
			$dateInternal = $datein;
		} else {
			$dateInternal = strtotime($datein);
			$dateInternal = DateTime::createFromFormat('Y-m-d', $datein);
		}
	}
	$Params = 'Y-m-d';
	$MyVar =$dateInternal->format($Params);
	
	//$MyVar = date_format($dateInternal, $Params);

	return " CAST('".$MyVar."' AS DATE) ";
}
function WFSQLTODATETIME($datetimein = "") {
	$datetimeInternal = date('Y-m-d H:i:s');
	if ($datetimein == "") {}
	else {
		if ($datetimein instanceof DateTime) {
			$datetimeInternal = $datetimein;
		} else {
			$datetimeInternal = strtotime($datetimein);
			$datetimeInternal = DateTime::createFromFormat('Y-m-d H:i:s', $datetimein);
		}
	}
	$Params = 'Y-m-d H:i:s';
	$MyVar =$datetimeInternal->format($Params);
	
	//$MyVar = date_format($datetimeInternal, $Params);

	return " CAST('".$MyVar."' AS DATETIME) ";
}

function WFDATEHRS($DateDef, $Params = 'H:i:s'){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	$DateStr = $datetime->format($Params);
	return $datetime->format('H');
}
function WFDATETOMIN($DateDef, $Params = 'H:i:s'){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	$DateStr = $datetime->format($Params);
	
	return ($datetime->format('H') * 60) + $datetime->format('i');
}

function WFDATEROUNDUP($DateDef, $Params = 'H:i:s', $minutesup = 30){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	$DateStr = $datetime->format($Params);
	
	$Appo = '';
	if ($datetime->format('i') == 0) {
		$Appo =  ( $datetime->format('H') . ':' . '00');
	}else if ($datetime->format('i') > $minutesup) {
		$Appo =  ( $datetime->format('H')+1 . ':' . '00');
	}else{
		$Appo =  ( $datetime->format('H') . ':' . '30');
	}
	return ($Appo);
	//return strtotime($Appo);
}
function WFDATEROUNDDN($DateDef, $Params = 'H:i:s', $minutesdn = 30){
	$datetime = new DateTime();
	if ($DateDef != "") {
		if ($DateDef instanceof DateTime) {
			$datetime = $DateDef;
		} else {
			$datetime = new DateTime($DateDef);
		}
	}
	$DateStr = $datetime->format($Params);
	
	$Appo = '';
	if ($datetime->format('i') < $minutesdn) {
		$Appo =  ( $datetime->format('H') . ':' . '00');
	}else{
		$Appo =  ( $datetime->format('H') . ':' . $minutesdn);
	}
	return ($Appo);
	//return strtotime($Appo);
}


/************************************************************************************/
/*                   		  	  MANAGE  LANGUAGE 										*/
/************************************************************************************/
function WFVALUELANGUAGETO($SourceLanguage, $DestinationLanguage, $Text){
    $output = file_get_contents('https://translate.google.com/translate_t?langpair=' . urlencode( $SourceLanguage) . '|' . urlencode($DestinationLanguage) . '&text=' . urlencode($Text));
    
    if ($output == false){
        trigger_error("Http request failed", E_USER_WARNING);
        return false;
    }
    
    if (preg_match('#<span id="?result_box"? class="(short|long)_text">(.*?)</span></div></div>#',$output, $matches) == 0) {
        trigger_error("Failed to get translated text", E_USER_WARNING);
        return false;
    }
    
    return strip_tags(str_replace(array('<br>','<br/>','<br />'), "\r\n", $matches[2]));
}
function WFLANGUAGELAYOUTTO($Layout,$ObJName,$Language){
	// SELECT FROM aaalanguagelayout WHERE CT_AAALANGUAGE = '" . $Language . "'"
	//return LANGCONVERT
	global $conn;
	return DLookup($conn,'LANGCONVERT', 'aaalanguagelayout', "CT_AAALANGUAGE = '" . $Language . "'");
}
function WFLANGUAGETABLETO($Table,$Ct_ID,$Field,$Language){
	// SELECT FROM aaalanguagetable WHERE CT_AAALANGUAGE = '" . $Language . "'"
	//return LANGCONVERT;
	global $conn;
	return DLookup($conn,'LANGCONVERT', 'aaalanguagetable', "CT_AAALANGUAGE = '" . $Language . "'");
}

/************************************************************************************/
/*                   		  	  MANAGE  USER 										*/
/************************************************************************************/
function WFUSER(){
	global $UserId;
	return $UserId;
}
function WFGENERATEPWD(){
    $alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    $pass = array(); //remember to declare $pass as an array
    $alphaLength = strlen($alphabet) - 1; //put the length -1 in cache
    for ($i = 0; $i < 8; $i++) {
        $n = rand(0, $alphaLength);
        $pass[] = $alphabet[$n];
    }
    return implode($pass); //turn the array into a string
}

/************************************************************************************/
/*                   		  	  MANAGE  TREE 										*/
/************************************************************************************/
//https://mysqlserverteam.com/mysql-8-0-labs-recursive-common-table-expressions-in-mysql-ctes-part-three-hierarchies/

function TreeGetParents($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $value, $level = 0, $optimizeMem = true){
	global $conn;
	global $CollectObjList;
	global $CollectArray;
	global $CollectObjField;
	
	if (($optimizeMem == true) && ($CollectObjList == null)) {
		$sql = "SELECT * FROM (" . $table . ") a";
		$conn->SetFetchMode(ADODB_FETCH_DEFAULT);
		$CollectArray = $conn->getArray($sql);
		
		/*
		$rs = $conn->Execute( $sql);
		if ($rs) {
			if (!$CollectObjField){
				$ColumnCountResult = $rs->FieldCount();
				for ($i = 0; $i < $ColumnCountResult; $i++) {
					$fld = $rs->FetchField($i);
					$name = $fld->name;
					$fldType = $rs->MetaType($fld->type);
					$fieldphptype = 'string';
					if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
					elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
					elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
					elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
					elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
					elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
					elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
					elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
					elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
					else					 { $fieldphptype = 'string';} //VCHR
					$CollectObjField[$name] = $fieldphptype;
				}
			}
			while (!$rs->EOF) {
				$keys = array();
				for ($i = 0; $i < $rs->FieldCount(); $i++) {
					$fld = $rs->FetchField($i);
					$nomecampo = $fld->name;
					$keys[$nomecampo] = $rs->fields[$nomecampo];
					settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
				}
				$keys['id'] = $keys[$fieldId];
				$keys["LEVEL"] = $level;
				
				$CollectArray[] = $keys;
				$precId  = $keys[$fieldParent];
			
				$rs->MoveNext();
			}
			$rs->Close();
		}
	*/
	}
	
	$keys = array();
	//cerco il nodo
	foreach ($CollectArray as $key => $val) {
		if (($val[$fieldId] === $value) || ($val[$fieldId] == $value)) {
			$keys = $val;
			break;
		}
	}
	
	$level = $level +1;
   //nodo
	if (!empty($keys)) {
		$NewParent = $keys[$fieldParent];
		$keys['id'] = $keys[$fieldId];
		$keys["LEVEL"] = $level;
		$keys["data"] = array();
		
		//solo se figlio senza figli
		$keys['leaf'] = true;		
		foreach ($CollectArray as $key => $val) {
			if (($val[$fieldParent] === $keys[$fieldId]) || ($val[$fieldParent] == $keys[$fieldId])) {
				$keys['leaf'] = false;
				$keys['expanded'] = true;
				break;
			}
		}
		
		//ultima modifica
		//if (($NewParent == -1) || ($NewParent == 0) || ($NewParent == NULL)) {
		if (($NewParent == -1)  || ($NewParent == NULL)) {
			//ultima modifica
			if($CollectObjList == null){
				$keys['id'] = $keys[$fieldId];
				$keys["LEVEL"] = 0;
				$keys['leaf'] = true;
				$CollectObjList[] = $keys;
			}
			return;
		} else {
			$CollectObjList[] = $keys;
			return TreeGetParents($table, $fieldId, $fieldParent, $NewParent, $level, $optimizeMem);
		}
	}
}
function TreeGetChildrens($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $valueParent, $level = 0, $optimizeMem = true){
	global $conn;
	global $CollectObjList;
	global $CollectArray;
	global $CollectObjField;	
	
	if (($optimizeMem == true) && ($CollectObjList == null)) {
		$sql = "SELECT * FROM (" . $table . ") a";
		//$conn->SetFetchMode(ADODB_FETCH_DEFAULT);
		$CollectArray = $conn->getArray($sql);
		
		/*
		$rs = $conn->Execute( $sql);
		if ($rs) {
			if (!$CollectObjField){
				$ColumnCountResult = $rs->FieldCount();
				for ($i = 0; $i < $ColumnCountResult; $i++) {
					$fld = $rs->FetchField($i);
					$name = $fld->name;
					$fldType = $rs->MetaType($fld->type);
					$fieldphptype = 'string';
					if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
					elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
					elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
					elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
					elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
					elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
					elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
					elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
					elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
					else					 { $fieldphptype = 'string';} //VCHR
					$CollectObjField[$name] = $fieldphptype;
				}
			}
			while (!$rs->EOF) {
				$keys = array();
				for ($i = 0; $i < $rs->FieldCount(); $i++) {
					$fld = $rs->FetchField($i);
					$nomecampo = $fld->name;
					$keys[$nomecampo] = $rs->fields[$nomecampo];
					settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
				}
				$keys['id'] = $keys[$fieldId];
				$keys["LEVEL"] = $level;
				
				$CollectArray[] = $keys;
				$precId  = $keys[$fieldParent];
			
				$rs->MoveNext();
			}
			$rs->Close();
		}
		*/
	}
	 
	//cerco il nodo
	$level = $level +1;
	foreach ($CollectArray as $key => $val) {
		//echo($val[$fieldParent] . BRCRLF );
		if (($val[$fieldParent] === $valueParent) || ($val[$fieldParent] == $valueParent)) {
		
			$keys = $val;
			
			//nodo
			if (!empty($keys)) {
				$NewParent = $keys[$fieldId];
				$keys['id'] = $keys[$fieldId];
				$keys["LEVEL"] = $level;
				$keys["data"] = array();
				
				$keys["PARENTID"] = $keys[$fieldId];
				//$NewParentQta = $valueQta . ' * ' . $keys[$fieldQta];
				//$keys["PARENTQTA"] =  $NewParentQta;
				//eval('$keys["QTATOT"] = ' . $NewParentQta . ';');
				
				//solo se figlio senza figli
				$keys['leaf'] = true;		
				foreach ($CollectArray as $key => $val) {
					if (($val[$fieldParent] === $keys[$fieldId]) || ($val[$fieldParent] == $keys[$fieldId])) {
						$keys['leaf'] = false;
						$keys['expanded'] = true;
						break;
					}
				}
				
				if (($NewParent == -1) || ($NewParent == 0) || ($NewParent == NULL)) {
					$CollectObjList[] = $keys;
					return;
				} else {
					$CollectObjList[] = $keys;
					TreeGetChildrens($table, $fieldId, $fieldParent, $NewParent, $level, $optimizeMem = true);
				}
			}
		}
	}
}

function TreeGet($results, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $valueParent = 0, $level = 0){
    $open = array();
	global $CollectObjList;
	global $CollectArray;
	$NewParent = 0;
	$level = $level +1;
	$leafn = 0;
    foreach($results as $result){
        if($result[$fieldParent] == $valueParent){
			$leafn = $leafn +1;
			$result["LEVEL"] = $level;
            $CollectObjList[] = $result;
            $leafOfNode = TreeGet($results, $fieldId, $fieldParent, $result[$fieldId], $level);
        }
    }
	return $leafn;
}

function TreeGetQta($results, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $valueParent = 0, $level = 0){
    $open = array();
	global $CollectObjList;
	
	$NewParent = 0;
	$level = $level +1;
	$leafn = 0;
    foreach($results as $result){
        if($result[$fieldParent] == $valueParent){
			$result["LEVEL"] = $level;
			$leafn = $leafn +1;
			$result['PARENTQTA'] = $result[$fieldQta];
			$result['PARENTLEAFS'] = 0;
            $CollectObjList[] =  $result;
            TreeGetQta($results, $fieldId, $fieldParent, $fieldQta, $result[$fieldId], $level);
        }else{
			if($leafn > 0) { return;}
		}
    }
	return;
}

function TreeGetChildren($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $valueParent, $level = 0, $IconRule = ''){
	global $conn;
	global $CollectObjList;
	global $CollectArray;
	global $CollectObjField;
	
	if(TLookup($conn, $fieldParent, $table) == 'number'){
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = " . $valueParent . "";
	}else{
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $valueParent . "'";
	}
	
	$rs = $conn->Execute($sql);
	$NewParent = 0;
	$level = $level +1;
	if ($rs) {
		if (!$CollectObjField){
			$ColumnCountResult = $rs->FieldCount();
			for ($i = 0; $i < $ColumnCountResult; $i++) {
				$fld = $rs->FetchField($i);
				$name = $fld->name;
				$fldType = $rs->MetaType($fld->type);
				$fieldphptype = 'string';
				if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
				elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
				elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
				elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
				elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
				elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
				elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
				elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
				elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
				else					 { $fieldphptype = 'string';} //VCHR
				$CollectObjField[$name] = $fieldphptype;
			}
		}
		while (!$rs->EOF) {
			$keys = array();
			for ($i = 0; $i < $rs->FieldCount(); $i++) {
				$fld = $rs->FetchField($i);
				$nomecampo = $fld->name;
				$keys[$nomecampo] = $rs->fields[$nomecampo];
				settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
			}
			$keys['id'] = $keys[$fieldId];
			$keys["LEVEL"] = $level;
			
			//cambio icona
			$IconRule = "DESCRIZIONE LIKE '%FASE%'";
			if ($IconRule){
				if (array_key_exists( 'DESCRIZIONE', $keys)){
					if (preg_sql_like($keys['DESCRIZIONE'] ,'%FASE EST%')){
						$keys['iconCls'] = 'fa fa-truck';
					}
					elseif (preg_sql_like($keys['DESCRIZIONE'] ,'%FASE%')){
						$keys['iconCls'] = 'fa fa-gavel';
					}
					elseif (preg_sql_like($keys['DESCRIZIONE'] ,'%IMBA%')){
						$keys['iconCls'] = 'fa fa-dropbox';
					}
					elseif (preg_sql_like($keys['DESCRIZIONE'] ,'%ETICH%')){
						$keys['iconCls'] = 'fa fa-dropbox';
					}
					elseif (preg_sql_like($keys['DESCRIZIONE'] ,'%CARTO%')){
						$keys['iconCls'] = 'fa fa-dropbox';
					}
					elseif (preg_sql_like($keys['DESCRIZIONE'] ,'%FILM%')){
						$keys['iconCls'] = 'fa fa-dropbox';
					}
					elseif (preg_sql_like($keys['DESCRIZIONE'] ,'%VASC%')){
						$keys['iconCls'] = 'fa fa-dropbox';
					}
				}
				if (array_key_exists( 'CODICE', $keys)){
					if (preg_sql_like($keys['CODICE'] ,'%DESC%')){
						$keys['iconCls'] = 'fa fa-bullhorn';
					}
				}
			}
			
			//$keys["data"] = array();
			//solo se figlio senza figli
			$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $rs->fields[$fieldId] . "'";
			$rschild = $conn->Execute($sql);
			if ($rschild !== false) {
				if ($rschild->RecordCount() == 0) {
					$keys['leaf'] = true;
				}else{
					$keys['leaf'] = false;
					//$keys['expanded'] = false;
				}
				$rschild->close();
			}
			$CollectObjList[] = $keys;
			$rs->Movenext();
		}
		$rs->close();
	}
}
function TreeGetChildrenCond($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $CondWhere = '', $valueParent, $level = 0){
	global $conn;
	global $CollectObjList;
	global $CollectObjField;
	
	if(TLookup($conn, $fieldParent, $table) == 'number'){
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = " . $valueParent . "";
	}else{
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $valueParent . "'";
	}
	
	$rs = $conn->Execute($sql);
	$NewParent = 0;
	$level = $level +1;
	if ($rs) {
		if (!$CollectObjField){
			$ColumnCountResult = $rs->FieldCount();
			for ($i = 0; $i < $ColumnCountResult; $i++) {
				$fld = $rs->FetchField($i);
				$name = $fld->name;
				$fldType = $rs->MetaType($fld->type);
				$fieldphptype = 'string';
				if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
				elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
				elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
				elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
				elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
				elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
				elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
				elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
				elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
				else					 { $fieldphptype = 'string';} //VCHR
				$CollectObjField[$name] = $fieldphptype;
			}
		}
		while (!$rs->EOF) {
			$keys = array();
			for ($i = 0; $i < $rs->FieldCount(); $i++) {
				$fld = $rs->FetchField($i);
				$nomecampo = $fld->name;
				$keys[$nomecampo] = $rs->fields[$nomecampo];
				settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
			}
			$keys['id'] = $keys[$fieldId];
			$keys["LEVEL"] = $level;
			//$keys["data"] = array();
			//solo se figlio senza figli
			$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $rs->fields[$fieldId] . "'";
			$rschild = $conn->Execute($sql);
			if ($rschild !== false) {
				if ($rschild->RecordCount() == 0) {
					$keys['leaf'] = true;
				}else{
					//$keys['expanded'] = false;
				}
				$rschild->close();
			}
			$CollectObjList[] = $keys;
			$rs->Movenext();
		}
		$rs->close();
	}
}

function TreeGetChildrensQta($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $valueParent, $valueQta = 1, $ProgId = 0, $optimizeMem = true, $level = 0){
	global $conn;
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $CollectProgId;
	
	if ($ProgId == 0) $ProgId = $valueParent;
	//scarico in memoria l'intera table
	if (($optimizeMem == true) && ($CollectObjList == null) && ($CollectArray == null)) {
		$sql = "SELECT * FROM (" . $table . ") a";
		/*
		$conn->SetFetchMode(ADODB_FETCH_DEFAULT);
		$CollectArray = $conn->getArray($sql);
		*/
		$rs = $conn->Execute($sql);
		if ($rs) {
			if (!$CollectObjField){
				$ColumnCountResult = $rs->FieldCount();
				for ($i = 0; $i < $ColumnCountResult; $i++) {
					$fld = $rs->FetchField($i);
					$name = $fld->name;
					$fldType = $rs->MetaType($fld->type);
					$fieldphptype = 'string';
					if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
					elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
					elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
					elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
					elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
					elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
					elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
					elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
					elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
					else					 { $fieldphptype = 'string';} //VCHR
					$CollectObjField[$name] = $fieldphptype;
				}
			}
			while (!$rs->EOF) {
				$keys = array();
				for ($i = 0; $i < $rs->FieldCount(); $i++) {
					$fld = $rs->FetchField($i);
					$nomecampo = $fld->name;
					$keys[$nomecampo] = $rs->fields[$nomecampo];
					settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
				}
				$keys['id'] = $keys[$fieldId];
				$keys["LEVEL"] = $level;
				
				$CollectArray[] = $keys;
				$precId  = $keys[$fieldParent];
			
				$rs->MoveNext();
			}
			$rs->Close();
		}
	}
	 
	//cerco il nodo
	$level = $level +1;
	foreach ($CollectArray as $key => $val) {
		if (($val[$fieldParent] == $valueParent) || ($val[$fieldParent] === $valueParent)) {
			
			//è figlio del padre
			
					$CollectProgId = $CollectProgId +1;
			$keys = $val;
			
			//nodo
			if (!empty($keys)) {
				$NewParent = $keys[$fieldId];
				$keys['id'] = $keys[$fieldId];
				$keys["LEVEL"] = $level;
				$keys["data"] = array();
				$keys["IDGEN"] = $CollectProgId;
				$keys["PARENTIDGEN"] = $ProgId;
				$keys["PARENTID"] = $keys[$fieldId];
				
				$NewParentQta = $valueQta . ' * ' . $keys[$fieldQta];
				$keys["PARENTQTA"] =  $NewParentQta;
				eval('$keys["QTATOT"] = ' . $NewParentQta . ';');
				
				//solo se figlio senza figli
				$keys['leaf'] = true;		
				foreach ($CollectArray as $key => $val) {
					if (($val[$fieldParent] == $keys[$fieldId]) || ($val[$fieldParent] === $keys[$fieldId])){
						$keys['leaf'] = false;
						$keys['expanded'] = true;
						break;
					}
				}
				
				if (($NewParent == -1) || ($NewParent == 0) || ($NewParent == NULL)) {
					$CollectObjList[] = $keys;
					return;
				} else {
					$CollectObjList[] = $keys;
					TreeGetChildrensQta($table, $fieldId, $fieldParent,  $fieldQta, $NewParent,  $NewParentQta, $CollectProgId, false, $level);
				}
			}
		}
	}
}
function TreeGetChildrensQtaFix($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $fieldQtaFix = 'QTAFIX', $valueParent, $valueQta = 1, $ProgId = 0, $optimizeMem = true, $level = 0){
	global $conn;
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $CollectProgId;
	
	if ($ProgId == 0) $ProgId = $valueParent;
	//scarico in memoria l'intera table
	if (($optimizeMem == true) && ($CollectObjList == null) && ($CollectArray == null)) {
		$sql = "SELECT * FROM (" . $table . ") a";
		/*
		$conn->SetFetchMode(ADODB_FETCH_DEFAULT);
		$CollectArray = $conn->getArray($sql);
		*/
		$rs = $conn->Execute($sql);
		if ($rs) {
			if (!$CollectObjField){
				$ColumnCountResult = $rs->FieldCount();
				for ($i = 0; $i < $ColumnCountResult; $i++) {
					$fld = $rs->FetchField($i);
					$name = $fld->name;
					$fldType = $rs->MetaType($fld->type);
					$fieldphptype = 'string';
					if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
					elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
					elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
					elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
					elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
					elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
					elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
					elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
					elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
					else					 { $fieldphptype = 'string';} //VCHR
					$CollectObjField[$name] = $fieldphptype;
				}
			}
			while (!$rs->EOF) {
				$keys = array();
				for ($i = 0; $i < $rs->FieldCount(); $i++) {
					$fld = $rs->FetchField($i);
					$nomecampo = $fld->name;
					$keys[$nomecampo] = $rs->fields[$nomecampo];
					settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
				}
				$keys['id'] = $keys[$fieldId];
				$keys["LEVEL"] = $level;
				
				$CollectArray[] = $keys;
				$precId  = $keys[$fieldParent];
			
				$rs->MoveNext();
			}
			$rs->Close();
		}
	}
	 
	//cerco il nodo
	$level = $level +1;
	foreach ($CollectArray as $key => $val) {
		if (($val[$fieldParent] == $valueParent) || ($val[$fieldParent] === $valueParent)) {
			
			//è figlio del padre
			$CollectProgId = $CollectProgId +1;
			$keys = $val;
			
			//nodo
			if (!empty($keys)) {
				$NewParent = $keys[$fieldId];
				$keys['id'] = $keys[$fieldId];
				$keys["LEVEL"] = $level;
				$keys["data"] = array();
				$keys["IDGEN"] = $CollectProgId;
				$keys["PARENTIDGEN"] = $ProgId;
				$keys["PARENTID"] = $keys[$fieldId];
				
				if($keys[$fieldQtaFix]){
					$NewParentQta = $keys[$fieldQta];
				}else{
					$NewParentQta = $valueQta . ' * ' . $keys[$fieldQta];
				}
				$keys["PARENTQTA"] =  $NewParentQta;
				eval('$keys["QTATOT"] = ' . $NewParentQta . ';');
				//solo se figlio senza figli
				$keys['leaf'] = true;		
				foreach ($CollectArray as $key => $val) {
					if (($val[$fieldParent] == $keys[$fieldId]) || ($val[$fieldParent] === $keys[$fieldId])){
						$keys['leaf'] = false;
						$keys['expanded'] = true;
						break;
					}
				}
				
				if (($NewParent == -1) || ($NewParent == 0) || ($NewParent == NULL)) {
					$CollectObjList[] = $keys;
					return;
				} else {
					$CollectObjList[] = $keys;
					TreeGetChildrensQta($table, $fieldId, $fieldParent,  $fieldQta, $NewParent,  $NewParentQta, $CollectProgId, false, $level);
				}
			}
		}
	}
}

function TreeGetChildrensCondQta($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $CondWhere = '', $valueParent, $valueQta = "1", $level = 0, $optimizeMem = true){
	global $conn;
	global $CollectObjList;	
	global $CollectObjField;
	
	static $fieldParentType = '';
	if ($fieldParentType == '' ) $fieldParentType = TLookup($conn, $fieldParent, $table) ;
	if($fieldParentType == 'number'){
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = " . $valueParent ;
	}else{
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $valueParent ;
	}
	$rs = $conn->Execute($sql);
	
	$NewParentId = 0;
	$NewParentQta = ' ';
	$level = $level +1;
	if ($rs) {
		if (!$CollectObjField){
			$ColumnCountResult = $rs->FieldCount();
			for ($i = 0; $i < $ColumnCountResult; $i++) {
				$fld = $rs->FetchField($i);
				$name = $fld->name;
				$fldType = $rs->MetaType($fld->type);
				$fieldphptype = 'string';
				if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
				elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
				elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
				elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
				elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
				elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
				elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
				elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
				elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
				else					 { $fieldphptype = 'string';} //VCHR
				$CollectObjField[$name] = $fieldphptype;
			}
		}
		while (!$rs->EOF) {
			$keys = array();
			for ($i = 0; $i < $rs->FieldCount(); $i++) {
				$fld = $rs->FetchField($i);
				$nomecampo = $fld->name;
				$keys[$nomecampo] = $rs->fields[$nomecampo];
				settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
			}
			$NewParentQta = $valueQta . ' * ' . $rs->fields[$fieldQta];
			
			$keys["PARENTID"] =  $NewParentId;
			$keys["PARENTQTA"] =  $NewParentQta;
			eval('$keys["QTATOT"] = ' . $NewParentQta . ';');
			
			$keys["LEVEL"] = $level;
			$keys['id'] = $keys[$fieldId];
			
			//gestione del leaf-expanded
			$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $rs->fields[$fieldId] . "'";
			$rschild = $conn->Execute($sql);
			if ($rschild !== false) {
				if ($rschild->RecordCount() == 0) {
					$keys['leaf'] = true;
				}else{
					$keys['expanded'] = true;
				}
				$rschild->close();
			}
			
			$NewParentId = $rs->fields[$fieldId];
			if (($NewParentId == -1) || ($NewParentId == 0) || ($NewParentId == -1) || ($NewParentId == NULL)) {
				$CollectObjList[] = $keys;
				return;
			} else {
				$CollectObjList[] = $keys;
				//verifico condizione where
				$result = true;
				if ($CondWhere != ''){
					$result = false;
					$CondWherevarName = strpos($CondWhere, ' ');
					$appo = '$result = ($rs->fields['. "'" . substr($CondWhere, 0, $CondWherevarName) . "']" . substr($CondWhere, $CondWherevarName) . ")? true :false;";
					eval ($appo);
				}
				if ($result == true){
					TreeGetChildrensCondQta($table, $fieldId, $fieldParent,  $fieldQta, $CondWhere, $NewParentId,  $NewParentQta, $level);
				}
			}
			$rs->Movenext();
		}
		$rs->close();
	}
}
function TreeGetChildrensCondQtaFix($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $fieldQtaFix = 'QTAFIX', $CondWhere = '', $valueParent, $valueQta = "1", $level = 0, $optimizeMem = true){
	global $conn;
	global $CollectObjList;	
	global $CollectObjField;
	
	static $fieldParentType = '';
	if ($fieldParentType == '' ) $fieldParentType = TLookup($conn, $fieldParent, $table) ;
	if($fieldParentType == 'number'){
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = " . $valueParent ;
	}else{
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $valueParent ;
	}
	$rs = $conn->Execute($sql);
	
	$NewParentId = 0;
	$NewParentQta = ' ';
	$level = $level +1;
	if ($rs) {
		if (!$CollectObjField){
			$ColumnCountResult = $rs->FieldCount();
			for ($i = 0; $i < $ColumnCountResult; $i++) {
				$fld = $rs->FetchField($i);
				$name = $fld->name;
				$fldType = $rs->MetaType($fld->type);
				$fieldphptype = 'string';
				if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
				elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
				elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
				elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
				elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
				elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
				elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
				elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
				elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
				else					 { $fieldphptype = 'string';} //VCHR
				$CollectObjField[$name] = $fieldphptype;
			}
		}
		while (!$rs->EOF) {
			$keys = array();
			for ($i = 0; $i < $rs->FieldCount(); $i++) {
				$fld = $rs->FetchField($i);
				$nomecampo = $fld->name;
				$keys[$nomecampo] = $rs->fields[$nomecampo];
				settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
			}
			$NewParentQta = $valueQta . ' * ' . $rs->fields[$fieldQta];
			
			$keys["PARENTID"] =  $NewParentId;
			$keys["PARENTQTA"] =  $NewParentQta;
			
		
			if($keys[$fieldQtaFix]){
				$keys["QTATOT"] = $keys[$fieldQta];
			}else{
				eval('$keys["QTATOT"] = ' . $NewParentQta . ';');
			}
			
			
			$keys["LEVEL"] = $level;
			$keys['id'] = $keys[$fieldId];
			
			//gestione del leaf-expanded
			$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $rs->fields[$fieldId] . "'";
			$rschild = $conn->Execute($sql);
			if ($rschild !== false) {
				if ($rschild->RecordCount() == 0) {
					$keys['leaf'] = true;
				}else{
					$keys['expanded'] = true;
				}
				$rschild->close();
			}
			
			$NewParentId = $rs->fields[$fieldId];
			if (($NewParentId == -1) || ($NewParentId == 0) || ($NewParentId == -1) || ($NewParentId == NULL)) {
				$CollectObjList[] = $keys;
				return;
			} else {
				$CollectObjList[] = $keys;
				//verifico condizione where
				$result = true;
				if ($CondWhere != ''){
					$result = false;
					$CondWherevarName = strpos($CondWhere, ' ');
					$appo = '$result = ($rs->fields['. "'" . substr($CondWhere, 0, $CondWherevarName) . "']" . substr($CondWhere, $CondWherevarName) . ")? true :false;";
					eval ($appo);
				}
				if ($result == true){
					TreeGetChildrensCondQta($table, $fieldId, $fieldParent,  $fieldQta, $CondWhere, $NewParentId,  $NewParentQta, $level);
				}
			}
			$rs->Movenext();
		}
		$rs->close();
	}
}
function TreeGetChildrensCondQtaDiff($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $fieldDispon = 'DISPONIBILE', $CondWhere = '', $valueParent, $valueQta = "1", $level = 0, $optimizeMem = true){
	global $conn;
	global $CollectObjList;	
	global $CollectObjField;
	
	static $fieldParentType = '';
	if ($fieldParentType == '' ) $fieldParentType = TLookup($conn, $fieldParent, $table) ;
	if($fieldParentType == 'number'){
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = " . $valueParent ;
	}else{
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $valueParent ;
	}
	$rs = $conn->Execute($sql);
	
	$NewParentId = 0;
	$NewParentQta = ' ';
	$level = $level +1;
	if ($rs) {
		if (!$CollectObjField){
			$ColumnCountResult = $rs->FieldCount();
			for ($i = 0; $i < $ColumnCountResult; $i++) {
				$fld = $rs->FetchField($i);
				$name = $fld->name;
				$fldType = $rs->MetaType($fld->type);
				$fieldphptype = 'string';
				if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
				elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
				elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
				elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
				elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
				elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
				elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
				elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
				elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
				else					 { $fieldphptype = 'string';} //VCHR
				$CollectObjField[$name] = $fieldphptype;
			}
		}
		while (!$rs->EOF) {
			$keys = array();
			for ($i = 0; $i < $rs->FieldCount(); $i++) {
				$fld = $rs->FetchField($i);
				$nomecampo = $fld->name;
				$keys[$nomecampo] = $rs->fields[$nomecampo];
				settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
			}
			$NewParentQta = $valueQta . ' * ' . $rs->fields[$fieldQta];
			
			$keys["PARENTID"] =  $NewParentId;
			$keys["PARENTQTA"] =  $NewParentQta;
			eval('$keys["QTATOT"] = ' . $NewParentQta . ';');
			
			if ($keys["QTATOT"] < $keys[$fieldDispon]){
				$keys["QTATOTDISPO"] = $keys["QTATOT"] ;
			}
			
			$keys["LEVEL"] = $level;
			$keys['id'] = $keys[$fieldId];
			
			//gestione del leaf-expanded
			$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $rs->fields[$fieldId] . "'";
			$rschild = $conn->Execute($sql);
			if ($rschild !== false) {
				if ($rschild->RecordCount() == 0) {
					$keys['leaf'] = true;
				}else{
					$keys['expanded'] = true;
				}
				$rschild->close();
			}
			
			$NewParentId = $rs->fields[$fieldId];
			if (($NewParentId == -1) || ($NewParentId == 0) || ($NewParentId == -1) || ($NewParentId == NULL)) {
				$CollectObjList[] = $keys;
				return;
			} else {
				$CollectObjList[] = $keys;
				//verifico condizione where
				$result = true;
				if ($CondWhere != ''){
					$result = false;
					$CondWherevarName = strpos($CondWhere, ' ');
					$appo = '$result = ($rs->fields['. "'" . substr($CondWhere, 0, $CondWherevarName) . "']" . substr($CondWhere, $CondWherevarName) . ")? true :false;";
					eval ($appo);
				}
				if ($result == true){
					TreeGetChildrensCondQtaDiff($table, $fieldId, $fieldParent,  $fieldQta, $fieldDispon, $CondWhere, $NewParentId,  $NewParentQta, $level);
				}
			}
			$rs->Movenext();
		}
		$rs->close();
	}
}

function TreeGetChildrensNotCondChildQta($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $CondWhere = '', $valueParent, $valueQta = "1", $level = 0, $optimizeMem = true){
	global $conn;
	global $CollectObjList;	
	global $CollectObjField;
	
	static $fieldParentType = '';
	if ($fieldParentType == '' ) $fieldParentType = TLookup($conn, $fieldParent, $table) ;
	if($fieldParentType == 'number'){
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = " . $valueParent ;
		
	}else{
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $valueParent ;
	}
	$rs = $conn->Execute($sql);
	
	$NewParentId = 0;
	$NewParentQta = ' ';
	$level = $level +1;
	if ($rs) {
		if (!$CollectObjField){
			$ColumnCountResult = $rs->FieldCount();
			for ($i = 0; $i < $ColumnCountResult; $i++) {
				$fld = $rs->FetchField($i);
				$name = $fld->name;
				$fldType = $rs->MetaType($fld->type);
				$fieldphptype = 'string';
				if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
				elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
				elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
				elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
				elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
				elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
				elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
				elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
				elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
				else					 { $fieldphptype = 'string';} //VCHR
				$CollectObjField[$name] = $fieldphptype;
			}
		}
		while (!$rs->EOF) {
			$keys = array();
			for ($i = 0; $i < $rs->FieldCount(); $i++) {
				$fld = $rs->FetchField($i);
				$nomecampo = $fld->name;
				$keys[$nomecampo] = $rs->fields[$nomecampo];
				settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
			}
			$NewParentQta = $valueQta . ' * ' . $rs->fields[$fieldQta];
			
			$keys["PARENTID"] =  $NewParentId;
			$keys["PARENTQTA"] =  $NewParentQta;
			eval('$keys["QTATOT"] = ' . $NewParentQta . ';');
			
			$keys["LEVEL"] = $level;
			$keys['id'] = $keys[$fieldId];
			$keys['leaf'] = null;
			//gestione del leaf-expanded
			$sql = "SELECT * FROM (" . $table . ") c WHERE c." . $fieldParent . " = '" . $rs->fields[$fieldId] . "'";
			$rschild = $conn->Execute($sql);
			if ($rschild !== false) {
				if ($rschild->RecordCount() == 0) {
					$keys['leaf'] = true;
				}else{
					$keys['expanded'] = true;
				}
				$rschild->close();
			}
			
			$NewParentId = $rs->fields[$fieldId];
			if (($NewParentId == -1) || ($NewParentId == 0) || ($NewParentId == -1) || ($NewParentId == NULL)) {
				//foglia
				$CollectObjList[] = $keys;
				return;
			} else {
				//nodo
				//cerco se nei figli la cond si verifica
				if ($CondWhere != ''){
					if ($keys['leaf'] == true){
						//foglia doppia
						$CollectObjList[] = $keys;
					}else{
						if($fieldParentType == 'number'){
							$sql = "SELECT * FROM (" . $table . ") b WHERE b." . $fieldParent . " = " . $NewParentId . " AND " . $CondWhere;
						}else{
							$sql = "SELECT * FROM (" . $table . ") b WHERE b." . $fieldParent . " = '" . $NewParentId . "' AND " . $CondWhere;
						}
						$rsleaf = $conn->Execute($sql);
						if ($rsleaf->RecordCount() == 0){
							//non ha fasi e quindi continuo a scendere
							TreeGetChildrensNotCondChildQta($table, $fieldId, $fieldParent,  $fieldQta, $CondWhere, $NewParentId,  $NewParentQta, $level);
						}else{
							//foglia
							$CollectObjList[] = $keys;
						}
					}
				}else{
					$CollectObjList[] = $keys;
					TreeGetChildrensNotCondChildQta($table, $fieldId, $fieldParent,  $fieldQta, $CondWhere, $NewParentId,  $NewParentQta, $level);
				}
			}
			$rs->Movenext();
		}
		$rs->close();
	}
}
function TreeGetChildrensNotCondChildQtaFix($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $fieldQtaFix = 'QTAFIX', $CondWhere = '', $valueParent, $valueQta = "1", $level = 0, $optimizeMem = true){
	global $conn;
	global $CollectObjList;	
	global $CollectObjField;
	
	static $fieldParentType = '';
	if ($fieldParentType == '' ) $fieldParentType = TLookup($conn, $fieldParent, $table) ;
	if($fieldParentType == 'number'){
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = " . $valueParent ;
		
	}else{
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $valueParent ;
	}
	$rs = $conn->Execute($sql);
	
	$NewParentId = 0;
	$NewParentQta = ' ';
	$level = $level +1;
	if ($rs) {
		if (!$CollectObjField){
			$ColumnCountResult = $rs->FieldCount();
			for ($i = 0; $i < $ColumnCountResult; $i++) {
				$fld = $rs->FetchField($i);
				$name = $fld->name;
				$fldType = $rs->MetaType($fld->type);
				$fieldphptype = 'string';
				if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
				elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
				elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
				elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
				elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
				elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
				elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
				elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
				elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
				else					 { $fieldphptype = 'string';} //VCHR
				$CollectObjField[$name] = $fieldphptype;
			}
		}
		while (!$rs->EOF) {
			$keys = array();
			for ($i = 0; $i < $rs->FieldCount(); $i++) {
				$fld = $rs->FetchField($i);
				$nomecampo = $fld->name;
				$keys[$nomecampo] = $rs->fields[$nomecampo];
				settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
			}
			$NewParentQta = $valueQta . ' * ' . $rs->fields[$fieldQta];
			
			$keys["PARENTID"] =  $NewParentId;
			
			if($keys[$fieldQtaFix]){
				$NewParentQta = $keys[$fieldQta];
			}else{
				$NewParentQta = $valueQta . ' * ' . $keys[$fieldQta];
			}
			$keys["PARENTQTA"] =  $NewParentQta;
			eval('$keys["QTATOT"] = ' . $NewParentQta . ';');
			
			$keys["LEVEL"] = $level;
			$keys['id'] = $keys[$fieldId];
			$keys['leaf'] = null;
			//gestione del leaf-expanded
			$sql = "SELECT * FROM (" . $table . ") c WHERE c." . $fieldParent . " = '" . $rs->fields[$fieldId] . "'";
			$rschild = $conn->Execute($sql);
			if ($rschild !== false) {
				if ($rschild->RecordCount() == 0) {
					$keys['leaf'] = true;
				}else{
					$keys['expanded'] = true;
				}
				$rschild->close();
			}
			
			$NewParentId = $rs->fields[$fieldId];
			if (($NewParentId == -1) || ($NewParentId == 0) || ($NewParentId == -1) || ($NewParentId == NULL)) {
				//foglia
				$CollectObjList[] = $keys;
				return;
			} else {
				//nodo
				//cerco se nei figli la cond si verifica
				if ($CondWhere != ''){
					if ($keys['leaf'] == true){
						//foglia doppia
						$CollectObjList[] = $keys;
					}else{
						if($fieldParentType == 'number'){
							$sql = "SELECT * FROM (" . $table . ") b WHERE b." . $fieldParent . " = " . $NewParentId . " AND " . $CondWhere;
						}else{
							$sql = "SELECT * FROM (" . $table . ") b WHERE b." . $fieldParent . " = '" . $NewParentId . "' AND " . $CondWhere;
						}
						$rsleaf = $conn->Execute($sql);
						if ($rsleaf->RecordCount() == 0){
							//non ha fasi e quindi continuo a scendere
							TreeGetChildrensNotCondChildQta($table, $fieldId, $fieldParent,  $fieldQta, $CondWhere, $NewParentId,  $NewParentQta, $level);
						}else{
							//foglia
							$CollectObjList[] = $keys;
						}
					}
				}else{
					$CollectObjList[] = $keys;
					TreeGetChildrensNotCondChildQta($table, $fieldId, $fieldParent,  $fieldQta, $CondWhere, $NewParentId,  $NewParentQta, $level);
				}
			}
			$rs->Movenext();
		}
		$rs->close();
	}
}
function TreeGetChildrensNotCondChildCondParentQtaFix($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $fieldQtaFix = 'QTAFIX', $CondWhere = '', $CondParentWhere = '', $valueParent, $valueQta = "1", $level = 0, $optimizeMem = true){
	global $conn;
	global $CollectObjList;	
	global $CollectObjField;
	
	static $fieldParentType = '';
	if ($fieldParentType == '' ) $fieldParentType = TLookup($conn, $fieldParent, $table) ;
	if($fieldParentType == 'number'){
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = " . $valueParent ;
		
	}else{
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $valueParent ;
	}
	$rs = $conn->Execute($sql);
	
	$NewParentId = 0;
	$NewParentQta = ' ';
	$level = $level +1;
	if ($rs) {
		if (!$CollectObjField){
			$ColumnCountResult = $rs->FieldCount();
			for ($i = 0; $i < $ColumnCountResult; $i++) {
				$fld = $rs->FetchField($i);
				$name = $fld->name;
				$fldType = $rs->MetaType($fld->type);
				$fieldphptype = 'string';
				if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
				elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
				elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
				elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
				elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
				elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
				elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
				elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
				elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
				else					 { $fieldphptype = 'string';} //VCHR
				$CollectObjField[$name] = $fieldphptype;
			}
		}
		while (!$rs->EOF) {
			$keys = array();
			for ($i = 0; $i < $rs->FieldCount(); $i++) {
				$fld = $rs->FetchField($i);
				$nomecampo = $fld->name;
				$keys[$nomecampo] = $rs->fields[$nomecampo];
				settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
			}
			$NewParentQta = $valueQta . ' * ' . $rs->fields[$fieldQta];
			
			$keys["PARENTID"] =  $NewParentId;
			
			if($keys[$fieldQtaFix]){
				$NewParentQta = $keys[$fieldQta];
			}else{
				$NewParentQta = $valueQta . ' * ' . $keys[$fieldQta];
			}
			$keys["PARENTQTA"] =  $NewParentQta;
			eval('$keys["QTATOT"] = ' . $NewParentQta . ';');
			
			$keys["LEVEL"] = $level;
			$keys['id'] = $keys[$fieldId];
			$keys['leaf'] = null;
			//gestione del leaf-expanded
			$sql = "SELECT * FROM (" . $table . ") c WHERE c." . $fieldParent . " = '" . $rs->fields[$fieldId] . "'";
			$rschild = $conn->Execute($sql);
			if ($rschild !== false) {
				if ($rschild->RecordCount() == 0) {
					$keys['leaf'] = true;
				}else{
					$keys['expanded'] = true;
				}
				$rschild->close();
			}
			
			$NewParentId = $rs->fields[$fieldId];
			if (($NewParentId == -1) || ($NewParentId == 0) || ($NewParentId == -1) || ($NewParentId == NULL)) {
				//foglia
				$CollectObjList[] = $keys;
				return;
			} else {
				//nodo
				//cerco se nel padre la cond si verifica
				if ($CondParentWhere != ''){
					$CondParentWhereResult = false;
					if (strpos($CondParentWhere, '=')){
						$CondParentWhereArray = explode('=',$CondParentWhere);
						if ($keys[$CondParentWhereArray[0]] == $CondParentWhereArray[1]) $CondParentWhereResult = true;
					}
					elseif (strpos($CondParentWhere, '>')){
						$CondParentWhereArray = explode('=',$CondParentWhere);
						if ($keys[$CondParentWhereArray[0]] > $CondParentWhereArray[1]) $CondParentWhereResult = true;
					}
					elseif (strpos($CondParentWhere, '<')){
						$CondParentWhereArray = explode('=',$CondParentWhere);
						if ($keys[$CondParentWhereArray[0]] < $CondParentWhereArray[1]) $CondParentWhereResult = true;
					}
				}
				//se il risultato è valido allora non continuo a scendere
				if ($CondParentWhereResult){
					//foglia
					$CollectObjList[] = $keys;
				}
				else{
					//cerco se nei figli la cond si verifica
					if ($CondWhere != ''){
						if ($keys['leaf'] == true){
							//foglia doppia
							$CollectObjList[] = $keys;
						}else{
							if($fieldParentType == 'number'){
								$sql = "SELECT * FROM (" . $table . ") b WHERE b." . $fieldParent . " = " . $NewParentId . " AND " . $CondWhere;
							}else{
								$sql = "SELECT * FROM (" . $table . ") b WHERE b." . $fieldParent . " = '" . $NewParentId . "' AND " . $CondWhere;
							}
							$rsleaf = $conn->Execute($sql);
							if ($rsleaf->RecordCount() == 0){
								//non ha fasi e quindi continuo a scendere
								TreeGetChildrensNotCondChildCondParentQtaFix($table, $fieldId, $fieldParent,  $fieldQta, $CondWhere, $CondParentWhere, $NewParentId,  $NewParentQta, $level);
							}else{
								//foglia
								$CollectObjList[] = $keys;
							}
						}
					}else{
						$CollectObjList[] = $keys;
						TreeGetChildrensNotCondChildCondParentQtaFix($table, $fieldId, $fieldParent,  $fieldQta, $CondWhere, $CondParentWhere, $NewParentId,  $NewParentQta, $level);
					}
				}
			}
			$rs->Movenext();
		}
		$rs->close();
	}
}
function TreeGetChildrensCondChildQta($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $CondWhere = '', $valueParent, $valueQta = "1", $level = 0, $optimizeMem = true){
	global $conn;
	global $CollectObjList;	
	global $CollectObjField;
	
	static $fieldParentType = '';
	if ($fieldParentType == '' ) $fieldParentType = TLookup($conn, $fieldParent, $table) ;
	if($fieldParentType == 'number'){
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = " . $valueParent ;
		
	}else{
		$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $valueParent ;
	}
	$rs = $conn->Execute($sql);
	
	$NewParentId = 0;
	$NewParentQta = ' ';
	$level = $level +1;
	if ($rs) {
		if (!$CollectObjField){
			$ColumnCountResult = $rs->FieldCount();
			for ($i = 0; $i < $ColumnCountResult; $i++) {
				$fld = $rs->FetchField($i);
				$name = $fld->name;
				$fldType = $rs->MetaType($fld->type);
				$fieldphptype = 'string';
				if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
				elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
				elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
				elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
				elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
				elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
				elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
				elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
				elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
				else					 { $fieldphptype = 'string';} //VCHR
				$CollectObjField[$name] = $fieldphptype;
			}
		}
		while (!$rs->EOF) {
			$keys = array();
			for ($i = 0; $i < $rs->FieldCount(); $i++) {
				$fld = $rs->FetchField($i);
				$nomecampo = $fld->name;
				$keys[$nomecampo] = $rs->fields[$nomecampo];
				settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
			}
			$NewParentQta = $valueQta . ' * ' . $rs->fields[$fieldQta];
			
			$keys["PARENTID"] =  $NewParentId;
			$keys["PARENTQTA"] =  $NewParentQta;
			eval('$keys["QTATOT"] = ' . $NewParentQta . ';');
			
			$keys["LEVEL"] = $level;
			$keys['id'] = $keys[$fieldId];
			$keys['leaf'] = null;
			
			//gestione del leaf-expanded
			$sql = "SELECT * FROM (" . $table . ") c WHERE c." . $fieldParent . " = '" . $rs->fields[$fieldId] . "'";
			$rschild = $conn->Execute($sql);
			if ($rschild !== false) {
				if ($rschild->RecordCount() == 0) {
					$keys['leaf'] = true;
				}else{
					$keys['expanded'] = true;
				}
				$rschild->close();
			}
			
			$NewParentId = $rs->fields[$fieldId];
			if (($NewParentId == -1) || ($NewParentId == 0) || ($NewParentId == -1) || ($NewParentId == NULL)) {
				//foglia
				//$CollectObjList[] = $keys;
				return;
			} else {
				//nodo
				//cerco se nei figli la cond si verifica
				if ($CondWhere != ''){
					if ($keys['leaf'] == true){
						//foglia
						//$CollectObjList[] = $keys;
					}else{
						if($fieldParentType == 'number'){
							$sql = "SELECT * FROM (" . $table . ") b WHERE b." . $fieldParent . " = " . $NewParentId . " AND " . $CondWhere;
						}else{
							$sql = "SELECT * FROM (" . $table . ") b WHERE b." . $fieldParent . " = '" . $NewParentId . "' AND " . $CondWhere;
						}
						$rsleaf = $conn->Execute($sql);
						if ($rsleaf->RecordCount() != 0){
							$CollectObjList[] = $keys;
						}
						TreeGetChildrensCondChildQta($table, $fieldId, $fieldParent,  $fieldQta, $CondWhere, $NewParentId,  $NewParentQta, $level);
					}
				}else{
					$CollectObjList[] = $keys;
					TreeGetChildrensCondChildQta($table, $fieldId, $fieldParent,  $fieldQta, $CondWhere, $NewParentId,  $NewParentQta, $level);
				}
			}
			$rs->Movenext();
		}
		$rs->close();
	}
}

function TreeGetRoot($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT'){
	global $conn;
	global $CollectObjList;	
	global $CollectObjField;	
	
	$level = 0;
	$precId = '';
	//cerco i padri
	$sql = "SELECT a.*" .
			" FROM (" . $table .") a " .
			" LEFT JOIN  (" . $table .") b ON a." . $fieldParent . " = b." . $fieldId .
			" WHERE b." . $fieldId . " IS NULL " .
			" ORDER BY a." . $fieldParent ;
	$rs = $conn->Execute( $sql);
	if ($rs) {
		if (!$CollectObjField){
			$ColumnCountResult = $rs->FieldCount();
			for ($i = 0; $i < $ColumnCountResult; $i++) {
				$fld = $rs->FetchField($i);
				$name = $fld->name;
				$fldType = $rs->MetaType($fld->type);
				$fieldphptype = 'string';
				if     ($fldType == 'C') { $fieldphptype = 'string';} //VCHR
				elseif ($fldType == 'X') { $fieldphptype = 'string';} //CLOB
				elseif ($fldType == 'B') { $fieldphptype = 'string';} //BLOB
				elseif ($fldType == 'I') { $fieldphptype = 'int';} //INT
				elseif ($fldType == 'N') { $fieldphptype = 'float';}	//NUM (DEC)
				elseif ($fldType == 'D') { $fieldphptype = 'string';}	//DATE
				elseif ($fldType == 'L') { $fieldphptype = 'string';} //BIT
				elseif ($fldType == 'R') { $fieldphptype = 'int';} //COUNT
				elseif ($fldType == 'T') { $fieldphptype = 'string';} //TIMESTAMP
				else					 { $fieldphptype = 'string';} //VCHR
				$CollectObjField[$name] = $fieldphptype;
				
			}
		}
		while (!$rs->EOF) {
			$keys = array();
			for ($i = 0; $i < $rs->FieldCount(); $i++) {
				$fld = $rs->FetchField($i);
				$nomecampo = $fld->name;
				$keys[$nomecampo] = $rs->fields[$nomecampo];
				settype($keys[$nomecampo], $CollectObjField[$nomecampo]);
			}
			$keys['id'] = $keys[$fieldId];
			$keys["LEVEL"] = $level;
			
			//if ($precId != $keys[$fieldParent]){
				//solo se figlio senza figli
				$sql = "SELECT * FROM (" . $table . ") a WHERE a." . $fieldParent . " = '" . $rs->fields[$fieldId] . "'";
				$rschild = $conn->Execute($sql);
				if ($rschild !== false) {
					if ($rschild->RecordCount() == 0) {
						$keys['leaf'] = true;
					}else{
						//$keys['expanded'] = true;
					}
					$rschild->close();
				}
				$CollectObjList[] = $keys;
				$precId  = $keys[$fieldParent];
			//}
			$rs->MoveNext();
		}
		$rs->Close();
	}
}

/*
function WFVALUETREEGETALLPARENTS($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT'){
	global $CollectObjList;
	//DAFARE
	$CollectObjList = array();
	TreeGetParents($table, $fieldId, $fieldParent, $node);
	return $CollectObjList;
}
function WFVALUETREEGETALLCHILDRENS($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $node){
	global $CollectObjList;
	//DAFARE
	$CollectObjList = array();
	TreeGetChildrens($table, $fieldId, $fieldParent, $node);
	return $CollectObjList;
}
*/

function WFVALUETREEGETROOT($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT'){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	TreeGetRoot($table, $fieldId, $fieldParent);
	return $CollectObjList;
}		
function WFVALUETREEGETPARENTS($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $valueParent){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	TreeGetParents($table, $fieldId, $fieldParent, $valueParent);
	return $CollectObjList;
}
function WFVALUETREEGETCHILDRENS($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $valueParent){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	TreeGetChildrens($table, $fieldId, $fieldParent, $valueParent);
	return $CollectObjList;
}
function WFVALUETREEGETCHILDREN($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $valueParent,$IconRule = ''){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	WFSendLOG("WFVALUETREEGETCHILDREN", $table);
	
	TreeGetChildren($table, $fieldId, $fieldParent, $valueParent,0, $IconRule);
	return $CollectObjList;
}
function WFVALUETREEGETCHILDRENCOND($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $CondWhere = '', $valueParent){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	WFSendLOG("WFVALUETREEGETCHILDRENCOND", $table);
	TreeGetChildrenCond($table, $fieldId, $fieldParent, $valueParent);
	return $CollectObjList;
}
function WFVALUETREEGETCHILDRENSQTA($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $valueParent, $valueQta = 1, $ProgId = 0){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	WFSendLOG("WFVALUETREEGETCHILDRENSQTA", $table);
	
	TreeGetChildrensQta($table, $fieldId, $fieldParent, $fieldQta, $valueParent, $valueQta, $ProgId );
	return $CollectObjList;
}
function WFVALUETREEGETCHILDRENSQTAFIX($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $fieldQtaFix = 'QTAFIX', $valueParent, $valueQta = 1, $ProgId = 0){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	WFSendLOG("WFVALUETREEGETCHILDRENSQTA", $table);
	
	TreeGetChildrensQtaFix($table, $fieldId, $fieldParent, $fieldQta, $fieldQtaFix, $valueParent, $valueQta, $ProgId );
	return $CollectObjList;
}
function WFVALUETREEGETCHILDRENSCONDQTA($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $CondWhere = '', $valueParent, $valueQta=1){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	WFSendLOG("WFVALUETREEGETCHILDRENSCONDQTA", $table);
	TreeGetChildrensCondQta($table, $fieldId, $fieldParent, $fieldQta, $CondWhere, $valueParent, $valueQta);
	return $CollectObjList;
}
function WFVALUETREEGETCHILDRENSCONDQTAFIX($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $fieldQtaFix = 'QTAFIX', $CondWhere = '', $valueParent, $valueQta=1){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	WFSendLOG("WFVALUETREEGETCHILDRENSCONDQTAFIX", $table);
	TreeGetChildrensCondQtaFix($table, $fieldId, $fieldParent, $fieldQta, $fieldQtaFix, $CondWhere, $valueParent, $valueQta);
	return $CollectObjList;
}
function WFVALUETREEGETCHILDRENSCONDQTADIFF($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $fieldDispon = 'DISPONIBILE', $CondWhere = '', $valueParent, $valueQta=1){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	WFSendLOG("WFVALUETREEGETCHILDRENSCONDQTA", $table);
	TreeGetChildrensCondQtaDiff($table, $fieldId, $fieldParent, $fieldQta, $fieldDispon, $CondWhere, $valueParent, $valueQta);
	return $CollectObjList;
}
function WFVALUETREEGETCHILDRENSNOTCONDCHILDQTA($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $CondWhere = '', $valueParent, $valueQta=1){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	WFSendLOG("WFVALUETREEGETCHILDRENSNOTCONDCHILDQTA", $table);
	TreeGetChildrensNotCondChildQta($table, $fieldId, $fieldParent, $fieldQta, $CondWhere, $valueParent, $valueQta);
	return $CollectObjList;
}
function WFVALUETREEGETCHILDRENSNOTCONDCHILDQTAFIX($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $fieldQtaFix = 'QTAFIX', $CondWhere = '', $valueParent, $valueQta=1){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	WFSendLOG("WFVALUETREEGETCHILDRENSNOTCONDCHILDQTA", $table);
	TreeGetChildrensNotCondChildQtaFix($table, $fieldId, $fieldParent, $fieldQta, $fieldQtaFix, $CondWhere, $valueParent, $valueQta);
	return $CollectObjList;
}
function WFVALUETREEGETCHILDRENSNOTCONDCHILDCONPARENTQTAFIX($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $fieldQtaFix = 'QTAFIX', $CondWhere = '', $CondParentWhere= '', $valueParent, $valueQta=1){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	WFSendLOG("WFVALUETREEGETCHILDRENSNOTCONDCHILDQTA", $table);
	TreeGetChildrensNotCondChildCondParentQtaFix($table, $fieldId, $fieldParent, $fieldQta, $fieldQtaFix, $CondWhere, $CondParentWhere, $valueParent, $valueQta);
	return $CollectObjList;
}
function WFVALUETREEGETCHILDRENSCONDCHILDQTA($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $CondWhere = '', $valueParent, $valueQta=1){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	WFSendLOG("WFVALUETREEGETCHILDRENSCONDCHILDQTA", $table);
	TreeGetChildrensCondChildQta($table, $fieldId, $fieldParent, $fieldQta, $CondWhere, $valueParent, $valueQta);
	return $CollectObjList;
}
function WFVALUETREEGETALLFILTER($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $where){
	global $conn;
	global $CollectObjList;
	global $CollectObjField;
	$CollectObjList = array();
	$CollectObjField = array();
	$recordidfind = array();
	$recordfind = array();
	$Collector = array();
	
	//trovo nodi con il filtro
	$sql = 'SELECT * FROM  (' . $table . ') a WHERE ' . $where . ' ORDER BY ' . $fieldParent . ', ' . $fieldId ;
	$rs = $conn->Execute($sql);
	if ($rs !== false) {
		if ($rs->RecordCount() > 0) {
			while (!$rs->EOF) {
				$keys = array();
				for ($i = 0; $i < $rs->FieldCount(); $i++) {
					$fld = $rs->FetchField($i);
					$nomecampo = $fld->name;
					$keys[$nomecampo] = $rs->fields[$nomecampo];
				}
				if (is_array($keys) && array_key_exists ( $fieldId,$keys) == true) {
					$CollectObjList = array();
					TreeGetParents($table, $fieldId, $fieldParent, $rs->fields[$fieldId]);
					//ultima modifica
					if($CollectObjList == null){
						$keys['id'] = $keys[$fieldId];
						$keys["LEVEL"] = 0;
						$keys['leaf'] = true;
						$CollectObjList[] = $keys;
					}
					$Collector = object_merge_distinct($Collector,$CollectObjList);
				}
				$rs->Movenext();
			}
			$rs->Close();
		}
	}
	
	return $Collector;
}
function WFVALUETREEGETALL($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT'){
	global $CollectObjList;
	global $CollectObjField;
	global $CollectArray;
	global $LastID;
	global $conn;
	$CollectObjList = array();
	$CollectObjField = array();
	$CollectArray = array();
	$LastID = null;
	
	$CollectArray = $conn->getAll($table);
	TreeGet($CollectArray, $fieldId, $fieldParent);
	
	return $CollectObjList;
}
function WFVALUETREEGETALLQTA($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA'){
	global $conn;
	global $CollectObjList;
	global $CollectObjField;
	$CollectObjList = array();
	$CollectObjField = array();
	
	//RECUPERA TUTTI I RECORD E LI METTE IN ORDINE
	$CollectArray = $conn->getAll($table);
	
	TreeGetQta($CollectArray, $fieldId, $fieldParent, $fieldQta);

	$CollectArray = object_clone($CollectObjList);
	
	//LI METTO IN ORDINE DI PROFONDITA
	$level = array();
	$padre = array();
	foreach ($CollectArray as $key => $row) {
		$level[$key] = $row['LEVEL'];
		$padre[$key] = $row[$fieldParent];
	}
	array_multisort($level, SORT_DESC, $padre, SORT_ASC, $CollectArray);
	
	$oldParent = "";
	$GroupCounter = 0;
	$GroupSum = 0;
	foreach ($CollectArray as $key => &$row) {
		$GroupCounter = $GroupCounter + 1;
		if (!IsNullOrEmptyOrZeroString($row[$fieldQta])) 	$GroupSum = $GroupSum + $row[$fieldQta];
		
		if ($oldParent == "") $oldParent = $row[$fieldParent];
		
		if ($row[$fieldParent] != $oldParent){
			foreach($CollectArray as &$value){
				if($value[$fieldId] === $oldParent){
					$value['PARENTQTA'] = $GroupSum;
					$value['PARENTLEAFS'] = $GroupCounter;
				}
			}
			foreach($CollectObjList as &$value){
				if($value[$fieldId] === $oldParent){
					$value['PARENTQTA'] = $GroupSum;
					$value['PARENTLEAFS'] = $GroupCounter;
				}
			}
			$GroupCounter = 0;
			$GroupSum = 0;
			$oldParent = $row[$fieldParent];
		}
		
	}
	
	$CollectArray = object_clone($CollectObjList);
	TreeGetQta($CollectArray, $fieldId, $fieldParent, $fieldQta);
	
	return $CollectObjList;
}

function WFVALUETREEGETPARENTSDRAW($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $value, $chrseparator = ';', $displayfield = 'DESCRIZIONE'){
	global $CollectObjList;
	global $CollectObjField;
	$CollectObjList = array();
	$CollectObjField = array();
	$AppoStr = '';
	WFVALUETREEGETPARENTS($table, $fieldId, $fieldParent, $value);

	foreach ($CollectObjList as $AppoField) {
		$AppoStr = $AppoStr . $AppoField['ID'] . $chrseparator;
		$AppoIntStr = '';
		for ($i = 1; $i <= $AppoField['LEVEL']; $i++) {
			$AppoIntStr = $AppoIntStr . '-'; 
		}
		$AppoStr = $AppoStr . $AppoIntStr . $AppoField[$displayfield] . $chrseparator;
	}
	return $AppoStr;
}
function WFVALUETREEGETCHILDRENSDRAW($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $valueParent, $chrseparator = ';', $displayfield = 'DESCRIZIONE'){
	global $CollectObjList;
	global $CollectObjField;
	$CollectObjList = array();
	$CollectObjField = array();
	$AppoStr = '';
	TreeGetChildrens($table, $fieldId, $fieldParent, $valueParent);

	foreach ($CollectObjList as $AppoField) {
		$AppoStr = $AppoStr . $AppoField['ID'] . $chrseparator;
		$AppoIntStr = '';
		for ($i = 1; $i <= $AppoField['LEVEL']; $i++) {
			$AppoIntStr = $AppoIntStr . '-'; 
		}
		$AppoStr = $AppoStr . $AppoIntStr . $AppoField[$displayfield] . $chrseparator;
	}
	return $AppoStr;
}

function WFVALUETREEGETPARENTSSTRING($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $value, $chrseparator = ';', $displayfield = 'DESCRIZIONE'){
	global $CollectObjList;
	global $CollectObjField;
	$CollectObjList = array();
	$CollectObjField = array();
	$AppoStr = '';
	WFVALUETREEGETPARENTS($table, $fieldId, $fieldParent, $value);

	foreach ($CollectObjList as $AppoField) {
		$AppoStr = $AppoStr . $AppoField[$displayfield] . $chrseparator;
	}
	return $AppoStr;
}
function WFVALUETREEGETCHILDRENSSTRING($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $valueParent, $chrseparator = ';', $displayfield = 'DESCRIZIONE'){
	global $CollectObjList;
	global $CollectObjField;
	$CollectObjList = array();
	$CollectObjField = array();
	$AppoStr = '';
	TreeGetChildrens($table, $fieldId, $fieldParent, $valueParent);

	foreach ($CollectObjList as $AppoField) {
		$AppoStr = $AppoStr . $AppoField[$displayfield] . $chrseparator;
	}
	return $AppoStr;
}
function WFVALUETREEGETCHILDRENSQTASTRING($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $fieldQta = 'QTA', $valueParent, $valueQta=1, $chrseparator = ';', $displayfield = 'DESCRIZIONE'){
	global $CollectObjList;
	global $CollectObjField;
	$CollectObjList = array();
	$CollectObjField = array();
	$AppoStr = '';
	TreeGetChildrensQta($table, $fieldId, $fieldParent, $fieldQta, $valueParent, $valueQta);

	foreach ($CollectObjList as $AppoField) {
		$AppoStr = $AppoStr . $AppoField[$displayfield] . $chrseparator;
	}
	return $AppoStr;
}

function WFARRAYTOHIERARCHY($arrayfrom, $idField = 'ID', $parentIdField = 'ID_PARENT', $childrenField = 'data'){
	$hierarchy = array(); // -- Stores the final data
	$itemReferences = array(); // -- temporary array, storing references to all items in a single-dimention
	$parentId = 0;
	$id = 0;
	$padre = array();
	$figlio = array();
	//order flat tree
	foreach ($arrayfrom as $key => $row) {
		$padre[$key]  = $row[$parentIdField];
		$figlio[$key] = $row[$idField];
	}
	array_multisort($padre, SORT_DESC, $figlio, SORT_DESC, $arrayfrom);
	
	//hierachyize
	foreach ($arrayfrom as $item) {
		$id = $item[$idField];
		$parentId = $item[$parentIdField];
		if (isset($itemReferences[$parentId])) { // parent exists
			$itemReferences[$parentId][$childrenField][$id] = $item; // assign item to parent
			$itemReferences[$id] =& $itemReferences[$parentId][$childrenField][$id]; // reference parent's item in single-dimentional array
		} elseif (!$parentId || !isset($hierarchy[$parentId])) { // -- parent Id empty or does not exist. Add it to the root
			$hierarchy[$id] = $item;
			$itemReferences[$id] =& $hierarchy[$id];
		}
	}
	unset($arrayfrom, $item, $id, $parentId);
	
	// -- Run through the root one more time. If any child got added before it's parent, fix it.
	foreach ($hierarchy as $id => &$item) {
		$parentId = $item[$parentIdField];
		if (isset($itemReferences[$parentId])) { // -- parent DOES exist
			$itemReferences[$parentId][$childrenField][$id] = $item; // -- assign it to the parent's list of children
			unset($hierarchy[$id]); // -- remove it from the root of the hierarchy
		}
	}
	unset($itemReferences, $id, $item, $parentId);
	
	
	return fixit($hierarchy);
}
function WFARRAYTOCHILDREN(array &$elements, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $valueParent = 0) {
    $branch = array();
    foreach ($elements as &$element) {
        if ($element[$fieldParent] == $valueParent) {
            $children = WFARRAYTOCHILDREN($elements, $fieldId, $fieldParent, $element[$fieldId]);
            if ($children) {
                $element['children'] = $children;
            }
            $branch[$element[$fieldId]] = $element;
            unset($element);
        }
    }
    return $branch;
}
function WFARRAYTOCHILDRENSEQUENCE(array &$elements, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $valueParent = 0) {
    $branch = array();
    foreach ($elements as &$element) {
        if ($element[$fieldParent] == $valueParent) {
			unset($element['data']);
            $children = WFARRAYTOCHILDRENSEQUENCE($elements, $fieldId, $fieldParent, $element[$fieldId]);
            if ($children) {
                $element['children'] = $children;
            }
            $branch[] = $element;
            unset($element);
        }
    }
    return $branch;
}
function fixit($yourArray) {
    $myArray = array();
    foreach ($yourArray as $itemKey => $itemObj) {
        $item = array();
        foreach ($itemObj as $key => $value) {
            if (strtolower($key) == 'data') {
                $item[$key] = fixit($value);
            } else {
                $item[$key] = $value;
            }
        }
        $myArray[] = $item;
    }
    return $myArray;
}


/************************************************************************************/
/*                   		  	  MANAGE  SEQUENCE									*/
/************************************************************************************/
function WFGETSEQUENCE($docname, $arrayField){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	global $UserId;
	
	$keyvalue = '1';
	if (str_word_count($docname) > 1) {
		WFRaiseError(0, 'Errore di Definizione Indice Chiave:' . $docname  , 'WFGETSEQUENCE', '');
		return;
	}
	
	//TROVO DEFINIZIONE DI INDICE
	$sql = "SELECT * FROM " . $ExtJSDevDB . "sequence WHERE (DESCNAME = '" . $docname . "')";
	$rs = $conn->Execute($sql);
	$rsSequence = array();
	if ($rs) {
		if ($rs->RecordCount()==0){
			$rsSequence['DESCNAME'] = $docname;
			$rsSequence['SEEDLEN'] = 0;
			$rsSequence['SEEDA'] ='';
			$rsSequence['SEEDB'] ='';
			$rsSequence['SEEDC'] ='';
			$rsSequence['SEEDD'] ='';
			$rsSequence['PRECODE'] = '';
			$rsSequence['TABLENAME'] = '';
			$rsSequence['FORCEEAN'] = false;
			$SqlC = $conn->GetInsertSQL($rs, $rsSequence);
			if ($conn->debug==1) echo("WFGETSEQUENCE:sqlInsert" . $SqlC. "<BR>\n"); 
			$conn->Execute($SqlC); 
			$rsSequence['ID'] = $conn->Insert_ID();
		}else{
			$rsSequence['ID'] = $rs->fields['ID'];
			$rsSequence['SEEDLEN'] = $rs->fields['SEEDLEN'];
			$rsSequence['SEEDA'] = $rs->fields['SEEDA'];
			$rsSequence['SEEDB'] = $rs->fields['SEEDB'];
			$rsSequence['SEEDC'] = $rs->fields['SEEDC'];
			$rsSequence['SEEDD'] = $rs->fields['SEEDD'];
			$rsSequence['PRECODE'] = $rs->fields['PRECODE'];
			$rsSequence['TABLENAME'] = $rs->fields['TABLENAME'];
			$rsSequence['FORCEEAN'] = $rs->fields['FORCEEAN'];
		}
		$rs->close();
	}
	
	//TROVO INDICE COMPOSTO DALLE CHIAVI DELLA DEFINIZIONE
	$sql = "SELECT * 
			FROM " . $ExtJSDevDB . "sequencecom 
			WHERE (CT_AAASEQUENCE = " . $rsSequence['ID'] . ")";
	if ($rsSequence['SEEDA'] != '') {
		if (IsNullOrEmptyString($arrayField[$rsSequence['SEEDA']])){
			$sql = $sql . " AND SEEDA  is null";
		}else{
			$sql = $sql . " AND SEEDA = '" . $arrayField[$rsSequence['SEEDA']] . "'";
		}
	}
	if ($rsSequence['SEEDB'] != '') {
		if (IsNullOrEmptyString($arrayField[$rsSequence['SEEDA']])){
			$sql = $sql . " AND SEEDB  is null";
		}else{
			$sql = $sql . " AND SEEDB = '" . $arrayField[$rsSequence['SEEDB']] . "'";
		}
	}
	if ($rsSequence['SEEDC'] != '') {
		if (IsNullOrEmptyString($arrayField[$rsSequence['SEEDC']])){
			$sql = $sql . " AND SEEDC  is null";
		}else{
			$sql = $sql . " AND SEEDC = '" . $arrayField[$rsSequence['SEEDC']] . "'";
		}
	}
	if ($rsSequence['SEEDD'] != '') {
		if (IsNullOrEmptyString($arrayField[$rsSequence['SEEDD']])){
			$sql = $sql . " AND SEEDD  is null";
		}else{
			$sql = $sql . " AND SEEDD = '" . $arrayField[$rsSequence['SEEDD']] . "'";
		}
	}
	$rs = $conn->Execute($sql);
	$rsSequenceCom = array();
	if ($rs) {
		if ($rs->RecordCount()==0){
			$rsSequenceCom['CT_AAASEQUENCE'] = $rsSequence['ID'];
			$rsSequenceCom['KEYVALUE'] = 0;
			if ($rsSequence['SEEDA'] != '') $rsSequenceCom['SEEDA'] = $arrayField[$rsSequence['SEEDA']];
			if ($rsSequence['SEEDB'] != '') $rsSequenceCom['SEEDB'] = $arrayField[$rsSequence['SEEDB']];
			if ($rsSequence['SEEDC'] != '') $rsSequenceCom['SEEDC'] = $arrayField[$rsSequence['SEEDC']];
			if ($rsSequence['SEEDD'] != '') $rsSequenceCom['SEEDD'] = $arrayField[$rsSequence['SEEDD']];
			$SqlC = $conn->GetInsertSQL($rs, $rsSequenceCom);
			if ($conn->debug==1) echo("WFGETSEQUENCE:sqlInsert" . $SqlC. "<BR>\n"); 
			$conn->Execute($SqlC); 
			$rsSequenceCom['ID'] = $conn->Insert_ID();
		}else{
			$rsSequenceCom['KEYVALUE'] = $rs->fields['KEYVALUE'];
		}
		
		$rsSequenceCom['KEYVALUE'] = $rsSequenceCom['KEYVALUE'] + 1;
		$SqlC = $conn->GetUpdateSQL($rs, $rsSequenceCom);
		if ($conn->debug==1) echo("WFGETSEQUENCE:sqlUpdate" . $SqlC. "<BR>\n"); 
		$conn->Execute($SqlC); 
		//AVZ DI GRUPPO
		if (!IsNullOrEmptyOrZeroString($rs->fields['GROUPED'] )){
			$SqlC = "UPDATE " . $ExtJSDevDB . "sequencecom  
						SET KEYVALUE = " .$rsSequenceCom['KEYVALUE'] ."
						WHERE CT_AAASEQUENCE = " . $rsSequence['ID'] ."
							AND GROUPED = " . $rs->fields['GROUPED'];
			$conn->Execute($SqlC);
		}
		
	}
	$Appo = $rsSequenceCom['KEYVALUE'];
	
	if ($rsSequence['SEEDLEN'] >0){
		$Appo = str_pad($Appo,$rsSequence['SEEDLEN'],"0",STR_PAD_LEFT);
	}
	if (!IsNullOrEmptyOrZeroString($rsSequence['PRECODE'] )){
		if ($rsSequence['PRECODE'] == 'y'){
			$Appo = date('y') . '-' . $Appo;
		}
		elseif ($rsSequence['PRECODE'] == 'yy'){
			$Appo = date('yy') . '-' . $Appo;
		}
		elseif($rsSequence['PRECODE'] == 'SEEDA'){
			$table = DLookup($conn, "CT_TABLE", 'aaafieldef' , "FIELDNAME = '" . $rsSequence['SEEDA'] . "'");
			if (!IsNullOrEmptyOrZeroString( $rs->fields['SEEDA'])){
				$sigla = DLookup($conn, "*", $table , "ID = " . $rs->fields['SEEDA'] . "");
				if (array_key_exists('DOCSIGLA', $sigla)) {
					$Appo = str_pad($sigla["DOCSIGLA"],2,"0",STR_PAD_LEFT) . '-' . $Appo;
				}
			}
		}
		elseif($rsSequence['PRECODE'] == 'SEEDB'){
			$table = DLookup($conn, "CT_TABLE", 'aaafieldef' , "FIELDNAME = '" . $rsSequence['SEEDB'] . "'");
			if (!IsNullOrEmptyOrZeroString( $rs->fields['SEEDB'])){
				$sigla = DLookup($conn, "*", $table , "ID = " . $rs->fields['SEEDB'] . "");
				if (array_key_exists('DOCSIGLA', $sigla)) {
					$Appo = str_pad($sigla["DOCSIGLA"],2,"0",STR_PAD_LEFT) . '-' . $Appo;
				}
			}
		}
		elseif($rsSequence['PRECODE'] == 'SEEDC'){
			$table = DLookup($conn, "CT_TABLE", 'aaafieldef' , "FIELDNAME = '" . $rsSequence['SEEDC'] . "'");
			if (!IsNullOrEmptyOrZeroString( $rs->fields['SEEDC'])){
				$sigla = DLookup($conn, "*", $table , "ID = " . $rs->fields['SEEDC'] . "");
				if (array_key_exists('DOCSIGLA', $sigla)) {
					$Appo = str_pad($sigla["DOCSIGLA"],2,"0",STR_PAD_LEFT) . '-' . $Appo;
				}
			}
		}
		elseif($rsSequence['PRECODE'] != ''){
			$Appo = $rsSequence['PRECODE'] . $Appo;
		}
	}
	if ($rsSequence['FORCEEAN'] == true){
		$Appo = NumberToEAN13($Appo);
	}
	$rs->close();
	return $Appo;
}
function WFGETSEQUENCEPROTECTED($docname, $arrayField, $field = 'DOCNUM'){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	global $UserId;
	
	$keyvalue = '1';
	if (str_word_count($docname) > 1) {
		WFRaiseError(0, 'Errore di Definizione Indice Chiave:' . $docname  , 'WFGETSEQUENCE', '');
		return;
	}
	
	//TROVO DEFINIZIONE DI INDICE
	$sql = "SELECT * FROM " . $ExtJSDevDB . "sequence WHERE (DESCNAME = '" . $docname . "')";
	$rs = $conn->Execute($sql);
	$rsSequence = array();
	if ($rs) {
		if ($rs->RecordCount()==0){
			$rsSequence['DESCNAME'] = $docname;
			$rsSequence['SEEDLEN'] = 0;
			$rsSequence['SEEDA'] ='';
			$rsSequence['SEEDB'] ='';
			$rsSequence['SEEDC'] ='';
			$rsSequence['SEEDD'] ='';
			$rsSequence['PRECODE'] = '';
			$rsSequence['TABLENAME'] = '';
			$SqlC = $conn->GetInsertSQL($rs, $rsSequence);
			if ($conn->debug==1) echo("WFGETSEQUENCE:sqlInsert" . $SqlC. "<BR>\n"); 
			$conn->Execute($SqlC); 
			$rsSequence['ID'] = $conn->Insert_ID();
		}else{
			$rsSequence['ID'] = $rs->fields['ID'];
			$rsSequence['SEEDLEN'] = $rs->fields['SEEDLEN'];
			$rsSequence['SEEDA'] = $rs->fields['SEEDA'];
			$rsSequence['SEEDB'] = $rs->fields['SEEDB'];
			$rsSequence['SEEDC'] = $rs->fields['SEEDC'];
			$rsSequence['SEEDD'] = $rs->fields['SEEDD'];
			$rsSequence['PRECODE'] = $rs->fields['PRECODE'];
			$rsSequence['TABLENAME'] = $rs->fields['TABLENAME'];
		}
		$rs->close();
	}
	
	//TROVO INDICE COMPOSTO DALLE CHIAVI DELLA DEFINIZIONE
	$sql = "SELECT * 
			FROM " . $ExtJSDevDB . "sequencecom 
			WHERE (CT_AAASEQUENCE = " . $rsSequence['ID'] . ")";
	if ($rsSequence['SEEDA'] != '') {
		if (IsNullOrEmptyString($arrayField[$rsSequence['SEEDA']])){
			$sql = $sql . " AND SEEDA  is null";
		}else{
			$sql = $sql . " AND SEEDA = '" . $arrayField[$rsSequence['SEEDA']] . "'";
		}
	}
	if ($rsSequence['SEEDB'] != '') {
		if (IsNullOrEmptyString($arrayField[$rsSequence['SEEDA']])){
			$sql = $sql . " AND SEEDB  is null";
		}else{
			$sql = $sql . " AND SEEDB = '" . $arrayField[$rsSequence['SEEDB']] . "'";
		}
	}
	if ($rsSequence['SEEDC'] != '') {
		if (IsNullOrEmptyString($arrayField[$rsSequence['SEEDC']])){
			$sql = $sql . " AND SEEDC  is null";
		}else{
			$sql = $sql . " AND SEEDC = '" . $arrayField[$rsSequence['SEEDC']] . "'";
		}
	}
	if ($rsSequence['SEEDD'] != '') {
		if (IsNullOrEmptyString($arrayField[$rsSequence['SEEDD']])){
			$sql = $sql . " AND SEEDD  is null";
		}else{
			$sql = $sql . " AND SEEDD = '" . $arrayField[$rsSequence['SEEDD']] . "'";
		}
	}
	$rs = $conn->Execute($sql);
	$SEEDA = '';
	$SEEDB = '';
	$SEEDC = '';
	$SEEDD = '';
	if ($rs) {
		$SEEDA = $rs->fields['SEEDA'];
		$SEEDB = $rs->fields['SEEDB'];
		$SEEDC = $rs->fields['SEEDC'];
		$SEEDD = $rs->fields['SEEDD'];
		
		if (!IsNullOrEmptyOrZeroString($rs->fields['GROUPED'])){
			$sql = "SELECT * 
					FROM " . $ExtJSDevDB . "sequencecom 
					WHERE (CT_AAASEQUENCE = " . $rsSequence['ID'] . ")
						AND GROUPED = " . $rs->fields['GROUPED'];
			$rs = $conn->Execute($sql);
		};
	}
	
	//TROVO TUTTI I CASI PER GROUP
	$ChiaviA = '';
	$ChiaviB = '';
	$ChiaviC = '';
	while (!$rs->EOF) {
		if (!IsNullOrEmptyOrZeroString($rs->fields['SEEDA'])){
			$ChiaviA = $ChiaviA . $rs->fields['SEEDA'] . ",";
		}
		if (!IsNullOrEmptyOrZeroString($rs->fields['SEEDB'])){
			$ChiaviB = $ChiaviB . $rs->fields['SEEDB'] . ",";
		}
		if (!IsNullOrEmptyOrZeroString($rs->fields['SEEDC'])){
			$ChiaviC = $ChiaviC . $rs->fields['SEEDC'] . ",";
		}
		$rs->Movenext();
	}
	$rs->Close();
	
	$sql = "SELECT MAX(SUBSTR(" . $field . ",4,5)*1) as ULTIMO
			FROM " . $docname . "
			WHERE 1= 1";
	if ($ChiaviA != ''){
		$ChiaviA = $ChiaviA . "0";
		$sql = $sql . " AND " . $rsSequence['SEEDA'] . " IN (" . $ChiaviA . ")";
	}
	if ($ChiaviB != ''){
		$ChiaviB = $ChiaviB . "0";
		$sql = $sql . " AND " . $rsSequence['SEEDB'] . " IN (" . $ChiaviB . ")";
	}
	if ($ChiaviC != ''){
		$ChiaviC = $ChiaviC . "0";
		$sql = $sql . " AND " . $rsSequence['SEEDC'] . " IN (" . $ChiaviC . ")";
	}
	$sql = $sql . " AND CG_CT_CONTABILEESERCIZI = 2019";
	$rs = $conn->Execute($sql);
	$Appo = 0;
	if ($rs) {
		$Appo = $rs->fields['ULTIMO'];
	}
	
	if ($rsSequence['SEEDLEN'] >0){
		$Appo = str_pad($Appo,$rsSequence['SEEDLEN'],"0",STR_PAD_LEFT);
	}
	if (!IsNullOrEmptyOrZeroString($rsSequence['PRECODE'] )){
		if ($rsSequence['PRECODE'] == 'y'){
			$Appo = date('y') . '-' . $Appo;
		}elseif ($rsSequence['PRECODE'] == 'yy'){
			$Appo = date('yy') . '-' . $Appo;
		}elseif($rsSequence['PRECODE'] == 'SEEDA'){
			$table = DLookup($conn, "CT_TABLE", 'aaafieldef' , "FIELDNAME = '" . $rsSequence['SEEDA'] . "'");
			if (!IsNullOrEmptyOrZeroString( $SEEDA)){
				$sigla = DLookup($conn, "*", $table , "ID = " . $SEEDA . "");
				if (array_key_exists('DOCSIGLA', $sigla)) {
					$Appo = str_pad($sigla["DOCSIGLA"],2,"0",STR_PAD_LEFT) . '-' . $Appo;
				}
			}
		}elseif($rsSequence['PRECODE'] == 'SEEDB'){
			$table = DLookup($conn, "CT_TABLE", 'aaafieldef' , "FIELDNAME = '" . $rsSequence['SEEDB'] . "'");
			if (!IsNullOrEmptyOrZeroString( $SEEDB)){
				$sigla = DLookup($conn, "*", $table , "ID = " . $SEEDB . "");
				if (array_key_exists('DOCSIGLA', $sigla)) {
					$Appo = str_pad($sigla["DOCSIGLA"],2,"0",STR_PAD_LEFT) . '-' . $Appo;
				}
			}
		}
	}
	
	$rs->close();
	return $Appo;
}
function WFGETLASTSEQUENCE($docname, $arrayField){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	global $UserId;
	
	$keyvalue = '1';
	if (str_word_count($docname) > 1) {
		WFRaiseError(0, 'Errore di Definizione Indice Chiave:' . $docname  , 'WFGETSEQUENCE', '');
		return;
	}
	
	//TROVO DEFINIZIONE DI INDICE
	$sql = "SELECT * FROM " . $ExtJSDevDB . "sequence WHERE (DESCNAME = '" . $docname . "')";
	$rs = $conn->Execute($sql);
	$rsSequence = array();
	if ($rs) {
		if ($rs->RecordCount()==0){
			$rsSequence['DESCNAME'] = $docname;
			$rsSequence['SEEDLEN'] = 0;
			$rsSequence['SEEDA'] ='';
			$rsSequence['SEEDB'] ='';
			$rsSequence['SEEDC'] ='';
			$rsSequence['SEEDD'] ='';
			$rsSequence['PRECODE'] = '';
			$rsSequence['TABLENAME'] = '';
			$SqlC = $conn->GetInsertSQL($rs, $rsSequence);
			if ($conn->debug==1) echo("WFGETSEQUENCE:sqlInsert" . $SqlC. "<BR>\n"); 
			$conn->Execute($SqlC); 
			$rsSequence['ID'] = $conn->Insert_ID();
		}else{
			$rsSequence['ID'] = $rs->fields['ID'];
			$rsSequence['SEEDLEN'] = $rs->fields['SEEDLEN'];
			$rsSequence['SEEDA'] = $rs->fields['SEEDA'];
			$rsSequence['SEEDB'] = $rs->fields['SEEDB'];
			$rsSequence['SEEDC'] = $rs->fields['SEEDC'];
			$rsSequence['SEEDD'] = $rs->fields['SEEDD'];
			$rsSequence['PRECODE'] = $rs->fields['PRECODE'];
			$rsSequence['TABLENAME'] = $rs->fields['TABLENAME'];
		}
		$rs->close();
	}
	
	//TROVO INDICE COMPOSTO DALLE CHIAVI DELLA DEFINIZIONE
	$sql = "SELECT * 
			FROM " . $ExtJSDevDB . "sequencecom 
			WHERE (CT_AAASEQUENCE = " . $rsSequence['ID'] . ")";
	if ($rsSequence['SEEDA'] != '') {
		if (IsNullOrEmptyString($arrayField[$rsSequence['SEEDA']])){
			$sql = $sql . " AND SEEDA  is null";
		}else{
			$sql = $sql . " AND SEEDA = '" . $arrayField[$rsSequence['SEEDA']] . "'";
		}
	}
	if ($rsSequence['SEEDB'] != '') {
		if (IsNullOrEmptyString($arrayField[$rsSequence['SEEDA']])){
			$sql = $sql . " AND SEEDB  is null";
		}else{
			$sql = $sql . " AND SEEDB = '" . $arrayField[$rsSequence['SEEDB']] . "'";
		}
	}
	if ($rsSequence['SEEDC'] != '') {
		if (IsNullOrEmptyString($arrayField[$rsSequence['SEEDC']])){
			$sql = $sql . " AND SEEDC  is null";
		}else{
			$sql = $sql . " AND SEEDC = '" . $arrayField[$rsSequence['SEEDC']] . "'";
		}
	}
	if ($rsSequence['SEEDD'] != '') {
		if (IsNullOrEmptyString($arrayField[$rsSequence['SEEDD']])){
			$sql = $sql . " AND SEEDD  is null";
		}else{
			$sql = $sql . " AND SEEDD = '" . $arrayField[$rsSequence['SEEDD']] . "'";
		}
	}
	$rs = $conn->Execute($sql);
	$rsSequenceCom = array();
	if ($rs) {
		if ($rs->RecordCount()==0){
			$rsSequenceCom['CT_AAASEQUENCE'] = $rsSequence['ID'];
			$rsSequenceCom['KEYVALUE'] = 0;
			if ($rsSequence['SEEDA'] != '') $rsSequenceCom['SEEDA'] = $arrayField[$rsSequence['SEEDA']];
			if ($rsSequence['SEEDB'] != '') $rsSequenceCom['SEEDB'] = $arrayField[$rsSequence['SEEDB']];
			if ($rsSequence['SEEDC'] != '') $rsSequenceCom['SEEDC'] = $arrayField[$rsSequence['SEEDC']];
			if ($rsSequence['SEEDD'] != '') $rsSequenceCom['SEEDD'] = $arrayField[$rsSequence['SEEDD']];
			$SqlC = $conn->GetInsertSQL($rs, $rsSequenceCom);
			if ($conn->debug==1) echo("WFGETSEQUENCE:sqlInsert" . $SqlC. "<BR>\n"); 
			$conn->Execute($SqlC); 
			$rsSequenceCom['ID'] = $conn->Insert_ID();
		}else{
			$rsSequenceCom['KEYVALUE'] = $rs->fields['KEYVALUE'];
		}
		
		$rsSequenceCom['KEYVALUE'] = $rsSequenceCom['KEYVALUE'];
	}
	$Appo = $rsSequenceCom['KEYVALUE'];
	
	if ($rsSequence['SEEDLEN'] >0){
		$Appo = str_pad($Appo,$rsSequence['SEEDLEN'],"0",STR_PAD_LEFT);
	}
	if (!IsNullOrEmptyOrZeroString($rsSequence['PRECODE'] )){
		if ($rsSequence['PRECODE'] == 'y'){
			$Appo = date('y') . '-' . $Appo;
		}elseif ($rsSequence['PRECODE'] == 'yy'){
			$Appo = date('yy') . '-' . $Appo;
		}elseif($rsSequence['PRECODE'] == 'SEEDA'){
			$table = DLookup($conn, "CT_TABLE", 'aaafieldef' , "FIELDNAME = '" . $rsSequence['SEEDA'] . "'");
			if (!IsNullOrEmptyOrZeroString( $rs->fields['SEEDA'])){
				$sigla = DLookup($conn, "*", $table , "ID = " . $rs->fields['SEEDA'] . "");
				if (array_key_exists('DOCSIGLA', $sigla)) {
					$Appo = str_pad($sigla["DOCSIGLA"],2,"0",STR_PAD_LEFT) . '-' . $Appo;
				}
			}
		}elseif($rsSequence['PRECODE'] == 'SEEDB'){
			$Appo = str_pad($rsSequenceCom['SEEDB'],2,"0",STR_PAD_LEFT) . '-' . $Appo;
		}
	}
	
	$rs->close();
	return $Appo;
}
function WFGETNUMREG(){
	global $RegistrationId;
	return $RegistrationId;
}


/************************************************************************************/
/*                   		  	  MANAGE  RECORD TABLE								*/
/************************************************************************************/
function WFRECORDCLONE($obj){
	$appo = object_clone($obj);
	$appo['ID'] = null;
	return $appo;
}
function WFRECORDCLONEPRECODE($arrayorig , $precode ){

	$returnArray = array();
	foreach ($arrayorig as $key => $value){
		$returnArray[$precode . $key] =  $value;
	}
	$returnArray['ID'] = null;
	return $returnArray;
}
function WFRECORDUNION($arraya , $arrayb ){
	$returnArray = array();	
	foreach ($arraya as $key => $value){
		$returnArray[ $key] =  $value;
	}
	foreach ($arrayb as $key => $value){
		$returnArray[ $key] =  $value;
	}
	return $returnArray;
}

function WFTABLECOMPLETE($tableorig , $tabledest , $where = 'CT_TAB'){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $UserId;
	global $LayoutId;
	$record = array();
	
	if ($conn->debug==1) echo('<b>WFTABLECOMPLETE</b>:' . $tableorig . "->" . $tabledest . "<br>\r\n");
	
	if (strpos($where,'=')){ 		
		$sql = "SELECT " . $tableorig . ".* 
				FROM " . $tabledest . " 
				INNER JOIN " . $tableorig . " ON " . $where;
	}else{
		$sql = "SELECT " . $tableorig . ".* 
				FROM " . $tabledest . " 
				INNER JOIN " . $tableorig . " ON " . $tabledest . "." . $where . " = " . $tableorig . ".ID";
	}
	$rsOrig = $conn->Execute($sql);
	$ColumnCountResult = $rsOrig->FieldCount();
	
	while (!$rsOrig->EOF) {
		if (strpos($where,'=')){ 
			//appoggio.CT_ARTICOLI = ordmovimenti.CT_ARTICOLI AND appoggio.CT_ORD = ordmovimenti.CT_ORD;
			$ast = explode(" ",$where);
			$sql = "SELECT * 
					FROM " . $tabledest . " 
					WHERE ";
			$sqlWhere = '';
			for ($i = 0; $i < count($ast);$i=$i+4){
				$sqlFieldFrom = explode('.',$ast[$i])[1];
				$sqlFieldCond = $ast[$i+1];
				$sqlFieldTo = explode('.',$ast[$i])[1];
				$sqlWhere = $sqlWhere . $sqlFieldFrom . ' ' . $sqlFieldCond . ' ' . $rsOrig->fields[$sqlFieldTo];
				if (is_array($ast) &&  array_key_exists($i+3,$ast) == true) {
					$sqlWhere = $sqlWhere . " " . $ast[$i+3] . " ";
				}
			}
			$sql = $sql . $sqlWhere;
		}
		else{
			$sql = "SELECT * 
					FROM " . $tabledest . " 
					WHERE " . $where . "  = " . $rsOrig->fields['ID'] ;
		}
		$rsDest = $conn->Execute($sql);
		$record = array();
		
		for ($i = 0; $i < $ColumnCountResult; $i++) {
			$fld = $rsOrig->FetchField($i);
			$name = $fld->name;
			if (is_array($rsDest->fields) && array_key_exists ( $name, $rsDest->fields)){
				if (IsNullOrEmptyOrZeroString($rsDest->fields[$name]) && !IsNullOrEmptyOrZeroString($rsOrig->fields[$name])){
					$record[$name] = $rsOrig->fields[$name];
				}
			}
		}
		$name = strtoupper("CT_" . $tableorig);
		if (is_array($rsDest->fields) &&  array_key_exists ( $name, $rsDest->fields)){
			if (!IsNullOrEmptyString($rsOrig->fields['ID'])){
				$record[$name] = $rsOrig->fields['ID'];
			}
		}
		$SqlC = $conn->GetUpdateSQL($rsDest, $record);
		if ($SqlC != '') $conn->Execute($SqlC); 
		$rsDest->close();
		$rsOrig->MoveNext();
	}
	$rsOrig->close(); 
}

function WFQUERYTOTABLE($tableorig , $tabledest = 'appoggio'){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	
	if ($conn->debug==1) echo('<b>WFQUERYTOTABLE</b>:' . $tableorig . "->" . $tabledest . "<br>\r\n");
	
	$sql = "SELECT * FROM (" . $tableorig . ") a";
	$rsOrig = $conn->Execute($sql);
	$ColumnCountResult = $rsOrig->FieldCount();
	
	$sql = "SELECT * FROM " . $tabledest . " WHERE ID = -1";
	$rsDest = $conn->Execute($sql);
	
	while (!$rsOrig->EOF) {
		$record = array();
		$record['NUMREG'] = $RegistrationId;
		for ($i = 0; $i < $ColumnCountResult; $i++) {
			$fld = $rsOrig->FetchField($i);
			$name = $fld->name;
			if ($name != 'ID') {
				$record[$name] = $rsOrig->fields[$name];
			}
		}
		$SqlC = $conn->GetInsertSQL($rsDest, $record);
		if ($SqlC != '') $conn->Execute($SqlC); 
		$rsOrig->MoveNext();
	}
	$rsDest->close();
	$rsOrig->close(); 
}

function WFFIELDEXIST($rs, $FieldName, $NotExistValue = null){
	$ColumnCountResult = $rs->FieldCount();
	for ($i = 0; $i < $ColumnCountResult; $i++) {		
		$fld = $rs->FetchField($i);
		$name = $fld->name;
		if ($name == $FieldName) {
			return $rs->fields[$name];
			break;
		}
	}
	return $NotExistValue;
}

function WFFIELDTABLE($tab){
	global $conn;
	$record = array();
	$sql = "SELECT a.* FROM (" . $tab .") a WHERE 1 = -1";
	$rs = $conn->Execute( $sql);
	$ColumnCountResult = $rs->FieldCount();
	for ($i = 0; $i < $ColumnCountResult; $i++) {
		$fld = $rs->FetchField($i);
		$name = $fld->name;
		$type = $rs->MetaType($fld->type);
		if ($type == 'C') { $filtertype = 'string'; }  //VCHR
		if ($type == 'X') { $filtertype = 'string'; }  //CLOB
		if ($type == 'I') { $filtertype = 'number'; }  //INT
		if ($type == 'N') { $filtertype = 'string'; }  //NUM (DEC)
		if ($type == 'D') { $filtertype = 'date';   }  //DATE
		if ($type == 'L') { $filtertype = 'string'; }  //BIT
		if ($type == 'R') { $filtertype = 'number'; }  //COUNT
		if ($type == 'T') { $filtertype = 'string'; }  //TIMESTAMP
		$record[$name] = $filtertype;
	}
	$rs->Close();
	$rs = null;
	
	return $record;
}

function WFFIELDTABLECOMMON($TableOrig , $TableDest){
	$ArrayOrig = WFFIELDTABLE($TableOrig);
	$ArrayDest = WFFIELDTABLE($TableDest);
}


/************************************************************************************/
/*                   		  	  MANAGE  CONVERSION								*/
/************************************************************************************/
function WFARRAYTOTABLE($arrayfrom, $tableto = ''){
	global $conn;
	global $ExtJSDevDB;
	$record2 = array();
	
	//definizione manuale campi se in tabella di appoggio
	if (IsNullOrEmptyString($tableto)) {
		//cancello tabella di appoggio
		$sql = "DELETE  FROM " . $ExtJSDevDB . 'appoggio' . "";
		$rs = $conn->Execute($sql);
		$sql = "SELECT * FROM " . $ExtJSDevDB . 'appoggio' . " WHERE 1=2";
		$rs = $conn->Execute($sql);
		
		//copia il tutto nel array dest
		foreach ($arrayfrom as $row) {
			$fieldNumeric = 0;
			$fieldText = 0;
			$fieldDate = 0;
			foreach ($row as $key => $value) {
				if     (IsNumeric($value)) 	{$record2['NUMERO' . $fieldNumeric] = $value; 	$fieldNumeric = $fieldNumeric +1;}
				elseif (IsDate($value)) 	{$record2['DATA' . $fieldDate] = $value; 		$fieldDate = $fieldDate +1;}
				else   						{$record2['TESTO' . $fieldText] = $value; 		$fieldText = $fieldText +1;}
			}
			$SqlC = $conn->GetInsertSQL($rs, $record2);
			$appo = $conn->Execute($SqlC);
		}
	}else{
		$sql = "SELECT * FROM " . $tableto . " WHERE 1=2";
		$rs = $conn->Execute($sql);
		foreach ($arrayfrom as $row) {
			$SqlC = $conn->GetInsertSQL($rs, $row);
			$appo = $conn->Execute($SqlC);
		}
	}
}
function WFARRAYTOSTRING($arrayfrom, $sperateChr = ',', $field = ''){
	$StrAppo = '';
	foreach($arrayfrom as $obj){
		if ($field != '') {
			$StrAppo = $StrAppo  .  $obj[$field] . $sperateChr;
		}else{
			$StrAppo = $StrAppo  .  $obj . $sperateChr;
		}
	}
	$StrAppo = substr($StrAppo, 0, -1);
	return $StrAppo;
}
function WFARRAYEPURE($arrayfrom){
	array_walk_recursive($arrayfrom, function($v,$k) use (&$arrayfrom) {
		if($arrayfrom[$k] == null) {
			unset($arrayfrom[$k]);
		}
	});
	return($arrayfrom);
}
function WFFORMAT($stringtoconvert, $stringLength, $fillchar = '0', $filldirection =  STR_PAD_LEFT){
	$stringtoconvert = trim($stringtoconvert);
	$stringtoconvert = substr ($stringtoconvert , 0,$stringLength );
	return str_pad($stringtoconvert, $stringLength , $fillchar, $filldirection);
}


/************************************************************************************/
/*                   		  	  MANAGE ALIGN DB									*/
/************************************************************************************/
function WFSQLCONNECT($datasourcedbname){
	global $dbname;
	$appo = false;
	if ($GLOBALS['conn']->debug == 1) {$appo = true; echo("Richiesto cambio connection:" . $datasourcedbname . "<br>\r\n");}
	if ($dbname != $datasourcedbname) {
		if (!IsNullOrEmptyString($datasourcedbname)) {
			$GLOBALS['conn']->close();
			unset($GLOBALS['conn']);
			if ($appo == 1) {echo("Eseguo cambio connection<br>\r\n");}
			include('dbconnection/' . $datasourcedbname . '.php');
			$GLOBALS['conn'] = $conn;
			$dbname = $datasourcedbname;
			if ($appo == 1) {echo("Eseguito cambio connection<br>\r\n");}
		}
	}
	if ($appo == true) $GLOBALS['conn']->debug=1 ;
}

function WFSQLALIGNDB2SCHEMA($schemaFile = "dbshema", $tabprefix = ''){
	global $conn;
	global $output;
	global $ExtJSDevSCHEMA;
	global $ExtJSDevDB;
	
	// Save DB-ENTIRE-SOLUTION to file
	$schema = new adoSchema( $conn );
	$result = $schema->extractSchema();
	file_put_contents($ExtJSDevSCHEMA . $schemaFile . date("Ymdhn") . ".xml" , $result);
	file_put_contents($ExtJSDevSCHEMA . $schemaFile . ".xml" , $result);
	
	// Save DB-DEV-SOLUTION to file
	$result = $schema->extractSchema(true,' ',$ExtJSDevDB,false);
	file_put_contents($ExtJSDevSCHEMA . 'ExtJSDev' .date("Ymdhn") . ".xml"  , $result);
	file_put_contents($ExtJSDevSCHEMA . 'ExtJSDev' . ".xml" , $result);
	
	if($result == '') {
		WFRaiseError(0, 'ExecuteSchema Failure or Error', 'WFSQL', '');
	} else {
		$output["success"] = true; 
		$output["message"] = $output["message"] . 'ExecuteSchema Success' .BRCRLF;
	}
}
function WFSQLALIGNSCHEMA2DB($schemaFile = "dbshema.xml", $tabprefix = ''){
	global $conn;
	global $output;
	global $ExtJSDevSCHEMA;
	global $ExtJSDevLOG;
	global $ExtJSDevDB;
	
	$schema = new adoSchema( $conn );
	//$schema->setUpgradeMethod('BEST');
	//if ($tabprefix != '') $schema->setPrefix( $tabprefix );

	//$schema->ContinueOnError( TRUE );
	//$schema->ExecuteInline( TRUE );
	
	$sql = $schema->ParseSchema( $ExtJSDevSCHEMA . $schemaFile );
	if ($conn->debug==1){ echo('WFSQLALIGNSCHEMA2DB: '); var_dump($sql); } 
	$result = $schema->ExecuteSchema();
	
	// Fetch SQL as array
	$sql = $schema->printSQL();	
	$schema->saveSQL( 'schema.sql' );
	if ($conn->debug==1){	
		echo( $schema->printSQL( 'TEXT' )); // Display SQL as text
		echo( $schema->printSQL( 'HTML' )); // Display SQL as HTML
	}
	
	file_put_contents($ExtJSDevLOG . 'updateDbSchema.log', print_r(array(
		'sql'=> $sql,
		'result'=> $result
		), true));
	if($result == 0 || $result == 1) {
		WFRaiseError(0, 'ExecuteSchema Failure or Error', 'WFSQL', '');
	} else {
		$output["success"] = true; 
		$output["message"] = $output["message"] . 'ExecuteSchema Success' . BRCRLF;
}
}


/************************************************************************************/
/*                   		  	  MANAGE  SQL EXECUTE								*/
/************************************************************************************/
function WFSQLSETVAR($SourceName,$SourceValue){
	global $conn;
	//DAFARE
	$sqlsetaz =  "begin SetContextVar('" . $SourceName ."'," . $SourceValue . "); end;";
	$stmt = $conn->Prepare($sqlsetaz); 
	$conn->Execute($stmt);
}	
function WFSQL($Source){
	global $conn;
	global $output;
	$start_time = microtime(true); 
	if ($Source . '' == '') return;
	/* 	DAFARE:
	//Oracle:
	$Source = str_replace('IFNULL','NVL',$Source);
	//SQLSrv:
	$Source = str_replace('IFNULL','ISNULL',$Source);
	*/
	try {   
		$conn->Execute($Source);
	} catch (exception $e){
		WFRaiseError(0, 'ExecuteSQL' . $e->getMessage(), 'WFSQL', '');
	}
	$longTime = 0;
	WFSendLOG("WFSQL", $Source, microtime_diff($start_time),$longTime);
	if ($conn->debug==1) {
		echo ('WFSQL Timer' . microtime_diff($start_time) . ' Row:' .  $conn->Affected_Rows() . BRCRLF); 
	}
	$output["success"] = true; 
	if ($conn->debug==1){	echo('WFSQL righe aggiornate:' .  $conn->Affected_Rows() . BRCRLF); }
}
function WFSQLPROCEDUREMESSAGE($Source){
	global $conn;
	global $output;
	WFSendLOG("WFSQLPROCEDUREMESSAGE", $Source);
	/* ESEMPIO PROC
		$source = ":result := utilswfphp.getnextactivitytruefromact(id_act_from => :id_act_from);";
		$sql =  "begin " . $source . " end;";
		$result = "";
		$stmt = $conn->Prepare($sql); 
		$conn->InParameter($stmt,$ActivityFromId,'id_act_from');
		$conn->OutParameter($stmt,$result,'result',400000);		
		$conn->Execute($stmt);
	*/
	$sql =  "begin " . $Source . " end;";
	$result = "";
	$stmt = $conn->Prepare($sql); 
	$conn->OutParameter($stmt,$result,'result',400000);
	try {   
		$appo = $conn->Execute($stmt);
	} catch (exception $e){
		WFRaiseError(0, 'ExecuteProcSQLMSG ' . $e->getMessage(), 'WFSQLPROCEDUREMESSAGE',  'Source:' . $Source);
	}
	$resultjson = StringAZ09Special($result);

	if (isJson($resultjson)){
		$appo = array();

		$appo = json_decode($resultjson);
		if ($conn->debug==1) {echo('ProcSource'); var_dump($appo);}
		if (property_exists ($appo,'failure')) {$output["failure"] = $appo->{'failure'}; }
		if (property_exists ($appo,'success')) {$output["success"] = $appo->{'success'}; }
		if (property_exists ($appo,'message')) {$output["message"] = $appo->{'message'}; }
	} else {
		$output["message"] = $result;
		$output["success"] = true;
	}

	WFSendLOG("WFSQLPROCEDUREMESSAGE", $result);
}
function WFSQLPROCEDUREDATA($Source){
	global $conn;
	$output = array();
	WFSendLOG("WFSQLPROCEDUREDATA", $Source);
	/* ESEMPIO PROC
		$source = ":result := utilswfphp.getnextactivitytruefromact(id_act_from => :id_act_from);";
		$sql =  "begin " . $source . " end;";
		$result = "";
		$stmt = $conn->Prepare($sql); 
		$conn->InParameter($stmt,$ActivityFromId,'id_act_from');
		$conn->OutParameter($stmt,$result,'result',400000);		
		$conn->Execute($stmt);
	*/
	$sql =  "begin " . $Source . " end;";
	$result = "";
	$stmt = $conn->Prepare($sql); 
	$conn->OutParameter($stmt,$result,'result',400000);
	try {   
		$conn->Execute($stmt);
	} catch (exception $e){
		WFRaiseError(0, 'ExecuteProcSQLDATA ' . $e->getMessage(), 'WFSQLPROCEDUREDATA', 'Source:' . $Source);
	}
	
	//$result = StringAZ09Special($result);
	if ($conn->debug==1) {echo('ProcResult'); var_dump($result);}
	if (isJson($result)){
		$appo = array();
		$appo = json_decode($result);
		
		if ($conn->debug==1) {echo("<b>ProcSource</b>"); echo("<br />\n"); var_dump($appo); echo("<br />\n");}
		if (property_exists ($appo,'failure'))	{$output["failure"] = $appo->{'failure'}; }
		if (property_exists ($appo,'success'))	{$output["success"] = $appo->{'success'}; }
		if (property_exists ($appo,'message'))	{$output["message"] = $appo->{'message'}; }
		if (property_exists ($appo,'data')) 	{$output["data"] = object_clone($appo->{'data'});}
		if ($conn->debug==1) {echo('ProcSource'); var_dump($appo);}
	} else {
		$output["message"] = $result;
		$output["success"] = true;
	}
	WFSendLOG("WFSQLPROCEDUREDATA", $result);
	return $output;
}


/************************************************************************************/
/*                   		  	  MANAGE  LAYOUT									*/
/************************************************************************************/
function WFLAYOUT($Field , $ReqLayoutId = '0'){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	$NewChiave = '';
	WFSendLOG("WFLAYOUTOVERRIDE", "Field:" . $Field . " LayoutId:" . $ReqLayoutId);
	
	if (acSelf == $ReqLayoutId ) $ReqLayoutId  = $LayoutId;
	
	$sqlSTD = "SELECT " . $ExtJSDevDB . "layout.*
				FROM " . $ExtJSDevDB . "layout " ;
														 
	$sqlOVER = "SELECT " . $ExtJSDevDB . "layoutoverride.*
				FROM " . $ExtJSDevDB . "layoutoverride ";
	if (is_numeric($ReqLayoutId) == true){
		$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "layout.ID = " . $ReqLayoutId;
		$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "layoutoverride.ID = " . $ReqLayoutId; 
	} else {
		$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "layout.DESCNAME = '" . $ReqLayoutId ."'";
		$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "layoutoverride.DESCNAME = '" . $ReqLayoutId ."'"; 
	}
	$sql = $sqlOVER  . " " . $sqlWhereOVER . " UNION " . $sqlSTD . " " . $sqlWhereSTD;
	$rs = $conn->Execute($sql);
	if ($rs !== false) {
		$ReqLayoutId = $rs->fields['ID'];
		$NewChiave = $rs->fields[$Field];
		$rs->close();
	}
	return ($NewChiave);
}
function WFVALUETABLE($ReqLayoutId = '0'){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	global $parser;
	WFSendLOG("WFVALUETABLE", " LayoutId:" . $ReqLayoutId);
	
	if (acSelf == $ReqLayoutId ) $ReqLayoutId  = $LayoutId;
	WFSendLOG("WFVALUETABLE", " LayoutId:" . $ReqLayoutId);
	$datasource = WFLAYOUT('DATASOURCE', $ReqLayoutId);
	$dataref = WFLAYOUT('DATAREF', $ReqLayoutId);
	$datasourcetype = WFLAYOUT('DATASOURCETYPE', $ReqLayoutId);
	
	if (($datasource != '') && ($datasourcetype == 'TABLE') ){
		//var_dump($ast->parsed["FROM"][0]);
	}
	else if ($dataref != ''){
		$datasource = $dataref;
		$datasourcetype = 'TABLE';
	}
	else if (($datasource  != '') && ($datasourcetype == 'SELECT')){
		$parsed = $parser->parse($datasource);
		$datasource = $parsed["FROM"][0]["table"];
		$datasourcetype = 'TABLE';
	}
	else if (($datasource  != '') && ($datasourcetype == 'TREE') ){
		$parsed = $parser->parse($datasource);
		$datasource = $parsed["FROM"][0]["table"];
		$datasourcetype = 'TABLE';
	}
	return $datasource;
}


/************************************************************************************/
/*                   		  	  MANAGE PROCESS									*/
/************************************************************************************/
function WFPROCESS($ProcessIdExec){
	/*global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $ExtJSDevDOC;
	global $ExtJSDevWWW;
	global $output;*/
	//Global Var inside function
	
	$time_start_process = microtime(true);
	
	foreach($GLOBALS as $key => $value ) {
		if (($key == 'GLOBALS') || (substr($key,0,1) == '_')) { 
			continue; 
		} else {
			eval("global $" . $key . ";");
		}
	}
	 
	$Source = '';
	WFSendLOG("WFPROCESS", "START " . $ProcessIdExec);

	$sqlSTD = "SELECT " . $ExtJSDevDB  . "proc.ID, "         . $ExtJSDevDB . "proc.SOURCE
				FROM " . $ExtJSDevDB . "proc " ;
														 
	$sqlOVER = "SELECT " . $ExtJSDevDB . "procoverride.ID, " . $ExtJSDevDB . "procoverride.SOURCE
				FROM " . $ExtJSDevDB . "procoverride ";
	if (is_numeric($ProcessIdExec) == true){
		$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "proc.ID = " . $ProcessIdExec;
		$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "procoverride.ID = " . $ProcessIdExec; 
	} else {
		$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "proc.DESCNAME = '" . $ProcessIdExec ."'";
		$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "procoverride.DESCNAME = '" . $ProcessIdExec ."'"; 
	}
	$sql = $sqlOVER . " " . $sqlWhereOVER . " UNION " . $sqlSTD . " " . $sqlWhereSTD;
	$rs = $conn->Execute($sql);
	if ($rs !== false) {
		$Source = $rs->fields['SOURCE'];
		$ExtCurrentProcess = $rs->fields['ID'];
		$rs->close();
		
		//DEBUG VISUAL EXTJSDEV
		if ($conn->debug==1) {echo("<b>WFPROCESS</b>". BRCRLF); echo($ProcessIdExec); echo(BRCRLF);}
		if ((strpos($Source,'WFDEBUG(true)') == true) || (WFVALUESESSIONPRIV('ForceDebug') == 'true')){
			$Source = str_replace('/*',"echo('<b>",$Source);
			$Source = str_replace('*/',"</b>' . BRCRLF);",$Source);
			WFSetDebug(true);
		}
		
	
		try {
			eval($Source);
		} catch (Throwable $e) {
			WFRaiseError(0, 'ExecutePROC ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
		}catch(Exception $e){
			WFRaiseError(0, 'ExecutePROC ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
		}catch (ParseError $e) {
			WFRaiseError(0, 'ExecutePROC ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
		}catch (ArithmeticError $e) {
			WFRaiseError(0, 'ExecutePROC ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
		}catch (DivisionByZeroError $e) {
			WFRaiseError(0, 'ExecutePROC ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
		}catch (Error $e) {
			WFRaiseError(0, 'ExecutePROC ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
		}catch (TypeError $e) {
			WFRaiseError(0, 'ExecutePROC ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
		}
	}
	WFSendLOG("WFPROCESS","END " . $ProcessIdExec,microtime_diff($time_start_process) );
}
function WFPROCESSFILE($ProcessFile){
	/*global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $ExtJSDevDOC;
	global $ExtJSDevWWW;
	global $output;*/
	//Global Var inside function
	foreach($GLOBALS as $key => $value ) {
		if (($key == 'GLOBALS') || (substr($key,0,1) == '_')) { 
			continue; 
		} else {
			eval("global $" . $key . ";");
		}
	}
	 
	$Source = '';
	WFSendLOG("WFPROCESSFILE", $ProcessFile);
	
	$myfile = fopen($ProcessFile, "r");
	if ($myfile) {
		
		while (($RigaLetta = fgets($myfile)) !== false) {
			$Source = $Source . $RigaLetta;
		}
		fclose($myfile);
		
		if ($conn->debug==1) {echo("<b>WFPROCESSFILE</b>". BRCRLF); echo($Source); echo(BRCRLF);}
		if ((strpos($Source,'WFDEBUG(true)') == true) || (WFVALUESESSIONPRIV('ForceDebug') == 'true')){
			$Source = str_replace('/*',"echo('<b>",$Source);
			$Source = str_replace('*/',"</b>' . BRCRLF);",$Source);
			//$ErrorLabel =
		}
		
		try {
			eval($Source);
		}catch(Exception $e){
			$output["message"] = $output["message"] . '<BR> ERROR' . $e->getMessage() ;
			WFSendLOG("WFPROCESSFILE:","error:" . get_class($e) . ", " . $e->getMessage() . ".");
		}
	} 
}
function WFINCLUDE($LibFile){
	//Global Var inside function
	foreach($GLOBALS as $key => $value ) {
		if (($key == 'GLOBALS') || (substr($key,0,1) == '_')) { 
			continue; 
		} else {
			eval("global $" . $key . ";");
		}
	}
	 
	WFSendLOG("WFINCLUDE", $LibFile);
	if (strtoupper(substr($LibFile,-3)) != 'PHP'){
		$LibFile = $LibFile . '.php';
	}
	require_once $ExtJSDevWWW . 'includes/PHPPersonal/' . $LibFile;
	unset($LibFile);
	//eval(file_get_contents($ExtJSDevWWW . 'includes/PHPPersonal/' . $LibFile));
	//riporto variabili settate a globali
	$arr = get_defined_vars();
	foreach ($arr as $key => $value) {
		$GLOBALS[$key ] = $value;
	}
}
function WFFUNCTION($SourceFunction, $ForceType = ''){
	/*global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $ExtJSDevDOC;
	global $ExtJSDevWWW;
	global $output;*/
	//Global Var inside function
	foreach($GLOBALS as $key => $value ) {
		if (($key == 'GLOBALS') || (substr($key,0,1) == '_')) { 
			continue; 
		} else {
			eval("global $" . $key . ";");
		}
	}
	 
	WFSendLOG("WFFUNCTION", $SourceFunction);
	$myResult = '';
	if ($conn->debug==1) echo('<b>WFFUNCTION</b>:' . '$myResult = ' . $SourceFunction . ';' . "\r\n");
	eval('$myResult = ' . $SourceFunction . ';');
	if ($myResult === false) $myResult = 'false';
	if ($myResult === true) $myResult = 'true';
	if ($ForceType != '') $myResult = settype($myResult, $ForceType);
	if ($conn->debug==1) echo('<b>WFFUNCTION</b>:' . '$myResult = ' . $myResult . "<br><br>\r\n");
	return $myResult;
}
function WFECHO($obj){
	global $CollectEchoString;
	$CollectEchoString = $CollectEchoString . $obj;
}

function WFSCHEDULE($ReqScheduleId = '0'){
	global $conn;
	global $ExtJSDevDB;
	global $RegistrationId;
	global $LayoutId;
	$Appo = '';
	
	WFSendLOG("WFSCHEDULE", " ReqScheduleId:" . $ReqScheduleId);
	
	if ($ReqScheduleId !=0) { 
		$sqlLay = "SELECT * FROM " . $ExtJSDevDB . "schedule WHERE ";
		if (is_numeric($ReqScheduleId) == true) {
			$sqlLay = $sqlLay . " ID = " . $ReqScheduleId;
		} else {
			$sqlLay = $sqlLay . " DESCNAME = '" . $ReqScheduleId . "'";
		}
		$rs = $conn->Execute($sqlLay);
		if ($rs !== false) {
			$Appo = array();
			$Appo = object_clone($rs->fields);
			$rs->close();
		}
	}	
	return ($Appo);
}
function WFPROCESSFREE($ProcessIdExec = ''){
	global $output;
	$output['processfree'] = true;
	global $_SESSION;
	session_write_close();
	ini_set('memory_limit', '-1');
	ini_set('max_execution_time', '-1'); 
	ignore_user_abort(true);
	if ($ProcessIdExec != '') WFPROCESS($ProcessIdExec);
}


/************************************************************************************/
/*                   		  	  SPECIAL PROCESS COMMAND							*/
/************************************************************************************/
//DAFARE SPOSTARE QUESTA FUNZ NELLA DATAWRITE.PHP
function WFSAVE(){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $UserId;
	global $_POST;
	global $parser;
	global $UserId;
	global $LayoutId;
	
	$datasource = '';
	$datasourcefield = '';
	$datasourcetype = '';
	$datasourcedbname ='';
	$record = array();
	
	WFSendLOG("CallProcess:", "SAVE");
	
	if (is_numeric($LayoutId) == true){
		$sql = "SELECT * FROM " . $ExtJSDevDB . "layoutoverride WHERE ID = " . $LayoutId . " 
				union 
				SELECT * FROM " . $ExtJSDevDB . "layout WHERE ID = " . $LayoutId ;
	} else {
		$sql = "SELECT * FROM " . $ExtJSDevDB . "layoutoverride WHERE DESCNAME = '" . $LayoutId ."' 
				union 
				SELECT * FROM " . $ExtJSDevDB . "layout WHERE DESCNAME = '" . $LayoutId ."'";
	}
	$rs = $conn->Execute($sql);
	if ($rs !== false) {
		$LayoutId = $rs->fields['ID']; 
		$datasource = $rs->fields['DATASOURCE'];
		$datasourcefield = $rs->fields['DATASOURCEFIELD'];
		$datasourcetype = $rs->fields['DATASOURCETYPE'];
		$datasourcedbname = $rs->fields['DATASOURCEDBNAME'];
	}
	
	//RECUPERA DATA
	if (IsNumericID($LayoutId)){
		$sql = "SELECT * FROM " . $ExtJSDevDB . "formvalues 
				WHERE (
					(NUMREG = " . $RegistrationId . ") AND 
					(CT_AAALAYOUT = " . $LayoutId . ") AND 
					(CT_AAAUSER = " . $UserId .")
				)";
		$rs = $conn->Execute($sql);
		while (!$rs->EOF) {
			$record[$rs->fields['FIELDNAME']] = $rs->fields['FIELDVALUE'];
			$rs->MoveNext();
		}
		$rs->close(); 
	}
	
	//Cerca TABLE da aggiornare da SQL nel datasource nella POST
	if (($datasource != '') && ($datasourcetype == 'TABLE') && ($datasourcefield != '')){
		$datasourcetype = 'TABLE';
	}
	if (($datasource != '') && ($datasourcetype == 'SELECT') && ($datasourcefield != '')){
		$parsed = $parser->parse($datasource);
		$datasource = $parsed["FROM"][0]["table"];
		$datasourcetype = 'TABLE';
	}
	if (($datasource != '') && ($datasourcetype == 'TREE') && ($datasourcefield != '')){
		$parsed = $parser->parse($datasource);
		$datasource = $parsed["FROM"][0]["table"];
		$datasourcetype = 'TABLE';
	}
	$output["table"] = $datasource;
	
	if ($conn->debug==1) {echo ('DEFINIZIONI:' . ' datasource:' . $datasource . ' datasourcetype:' . $datasourcetype); echo("<BR>\n"); }
	
	//CONNECTION
	if (!IsNullOrEmptyString($datasourcedbname)) {
		WFSQLCONNECT($datasourcedbname);
	}
		
	//aggiorno table definita	
	if ($conn->debug==1) echo("Aggiorno Table<BR>\n");
	$sql = "SELECT * FROM ". $datasource;
	
	//where
	if (($datasourcefield != '')  && ($record[$datasourcefield] != '')) {
		if (is_numeric($record[$datasourcefield]) == true){
			$sql = $sql ." WHERE " . $datasourcefield . " = " . $record[$datasourcefield] . "";
		}else{
			$sql = $sql ." WHERE " . $datasourcefield . " = '" . $record[$datasourcefield] . "'";
		}
	}else{
		$sql = $sql ." WHERE 1 = 2";
	}
		
	//Leggo il record
	if ($conn->debug==1) {var_dump($record); echo("<BR>\n"); }
	$rs = $conn->Execute($sql);
	if ($rs) {
		if ($rs->RecordCount()==1)  {
			$output["message"] = $output["message"] . 'update' . BRCRLF;
			$output["messagedebug"] = $output["messagedebug"] . 'update' . BRCRLF;
			if ($conn->debug==1) {var_dump($output); var_dump($sql);}
			$SqlC = $conn->GetUpdateSQL($rs, $record);
			if ($conn->debug==1) var_dump($SqlC);
			WFSendLOG("DataWrite:","UPDATE:" . $SqlC );
			try {   
				if ($SqlC <> '') $appo = $conn->Execute($SqlC); else $appo = true;
			} catch (exception $e){
				WFRaiseError(0, 'update ' . $e->getMessage(), 'WFSAVE', '');
			}
			$valuefieldvalue = $record[$datasourcefield];			
		}
		if ($rs->RecordCount()==0) {
			$output["message"] = $output["message"] . 'insert' . BRCRLF;
			$output["messagedebug"] = $output["messagedebug"] . 'insert' . BRCRLF;
			if ($conn->debug==1) {var_dump($output); var_dump($sql);}
			$SqlC = $conn->GetInsertSQL($rs, $record);
			if ($conn->debug==1) var_dump($SqlC);
			WFSendLOG("DataWrite:","INSERT:" . $SqlC );
			try {   
				$appo = $conn->Execute($SqlC);
			} catch (exception $e){ 
				WFRaiseError(0, 'insert ' . $e->getMessage(), 'WFSAVE', '');
			}
			$valuefieldvalue = $conn->Insert_ID();
		}
		if ($rs->RecordCount()>1) {
			//errore
			$appo = false;
			WFSendLOG("DataWrite:","SQLN" . $SqlC );
			$output["message"] = $output["message"]  . "Chiave Non univoca!  " . $datasourcefield . " = " . $record[$datasourcefield] . "count:" . $rs->RecordCount() . " DUPLICATA! " . BRCRLF;
			if ($conn->debug==1) {var_dump($output); var_dump($sql);}
		}
		
		if ($appo == true) {
			$output['datasourcefield'] = $datasourcefield ;
			$output[$datasourcefield] = $valuefieldvalue;
			$output["success"] = true; 
		}elseif ($appo == ''){
			$output["message"] = $output["message"]  . ' - Errore';
			$output["success"] = true; 
			
		}else{ 		
			WFRaiseError(0, 'ExecuteSave ' . $conn->ErrorMsg(), 'WFSAVE', "<br>appo:" .$appo . "<br>datasourcefield:" . $datasourcefield . "<br>SQLSearch:"  . $sql . "<br>SQLCommand:". $SqlC );
		}
		$output["total"] = $conn->Affected_Rows();
	}else{
		WFRaiseError(0, 'ExecuteSave ' . $conn->ErrorMsg(), 'WFSAVE', "<br>appo:" .$appo . "<br>datasourcefield:" . $datasourcefield . "<br>SQLSearch:"  . $sql . "<br>SQLCommand:". $SqlC );		
	}
	
}

function WFDELETE($ReqLayoutId = acSelf){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $UserId;
	global $LayoutId;
	global $_POST;
	global $output;
	global $parser;
	
	WFSendLOG("CallProcess:", "WFDELETE");
	
	$datasource = '';
	$dataref = '';
	$datasourcefield = '';
	$datasourcetype = '';
	$datasourcedbname ='';
	$record = array();
		
	//FormDefinition	
	if ((acSelf == $ReqLayoutId ) || ('0' == $ReqLayoutId )){
		$sql = "SELECT * FROM " . $ExtJSDevDB . "layoutoverride WHERE ID = " . $LayoutId . " 
				union 
				SELECT * FROM " . $ExtJSDevDB . "layout WHERE ID = " . $LayoutId ;
	}else{
		if (is_numeric($ReqLayoutId) == false) {
				$sql = "SELECT * FROM " . $ExtJSDevDB . "layoutoverride WHERE DESCNAME = '" . $ReqLayoutId . "' 
				union 
				SELECT * FROM " . $ExtJSDevDB . "layout WHERE DESCNAME = '" . $ReqLayoutId . "'" ;	
		}else{
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layoutoverride WHERE ID = " . $LayoutId . " 
					union 
					SELECT * FROM " . $ExtJSDevDB . "layout WHERE ID = " . $LayoutId ;
		}
	}
	$rs = $conn->Execute($sql);
	if ($rs !== false) { 
		$ReqLayoutId = $rs->fields['ID'];
		$datasource = $rs->fields['DATASOURCE'];
		$dataref = $rs->fields['DATAREF'];
		$datasourcefield = $rs->fields['DATASOURCEFIELD'];
		$datasourcetype = $rs->fields['DATASOURCETYPE'];
		$datasourcedbname = $rs->fields['DATASOURCEDBNAME'];
	}
	if ($datasourcefield == '') {
		$output['message'] = 'ID NON DEFINITO, CANCELLAZIONE FALLITA';
		$output['failure'] = true;
		$output['success'] = false;
		return ;
	}
	
	//FormFieldValue
	$FormArray = WFVALUEFORM($ReqLayoutId);
	
	//CONNECTION
	if (!IsNullOrEmptyString($datasourcedbname)) {
		WFSQLCONNECT($datasourcedbname);
	}
	
	//SELECT TREE TO TABLE
	if (($datasource != '') && ($datasourcetype == 'SELECT')){
		$parsed = $parser->parse($datasource);
		$datasource = $parsed["FROM"][0]["table"];
		if ($dataref != '') $datasource = $dataref;
		$datasourcetype = 'TABLE';
	}elseif (($datasource != '') && ($datasourcetype == 'TREE')){
		$parsed = $parser->parse($datasource);
		$datasource = $parsed["FROM"][0]["table"];
		$datasourcetype = 'TABLE';
	}
	$output["table"] = $datasource;
	if ($conn->debug==1) {echo ('DEFINIZIONI:' . ' datasource:' . $datasource . ' datasourcetype:' . $datasourcetype  ); echo("<BR>\n"); }
	
	//cancello table definita	
	$sql = "DELETE FROM ". $datasource . " WHERE ";
	if(TLookup($conn, $datasourcefield, $datasource) == 'number'){
		$sql = $sql . $datasourcefield . " = " . $FormArray[$datasourcefield] . "";
	}else{
		$sql = $sql . $datasourcefield . " = '" . $FormArray[$datasourcefield] . "'";
	}
	if ($conn->debug==1) {echo('Canello sql:' . $sql);}
	try {
		$conn->Execute($sql);
	} catch (Exception $e) {
		// adodb_backtrace($e->gettrace()); 
		$output["success"] = false;
		$output["message"] = $output["message"] . 'ERRORE ' . $e . BRCRLF;	   
		$output["messagedebug"] = $output["messagedebug"] . 'ERRORE ' . $e . BRCRLF;
		WFRaiseError(0, 'ExecuteDelete ' . $e, 'WFDELETE', "<br>datasourcefield:" . $datasourcefield . "<br>SQLCommand:"  . $sql);		
		return;
	}
	
	//AAAUSERSLOGS
	WFNOTIFY ($UserId,$datasource,$FormArray[$datasourcefield],$sql,'DEL');
	WFLOGUSER($UserId,$datasource,$FormArray[$datasourcefield],$sql,'DEL');
	
	$output["total"] = $conn->Affected_Rows();
	$output["success"] = true;
	$output["message"] = 'DELETED';
	
}
function WFNEW(){
	global $_POST;
	WFSendLOG("CallProcess:", "NEW");
}


/************************************************************************************/
/*                   		  	  FUNC RAD										*/
/************************************************************************************/
function WFOpenForm($LayoutId, $DataWhereExt = '', $DataMode = acNormal, $WindowMode = acWindowNormal, $WindowTitle = '', $DataFilter = ''){
	return WFOpenObject($LayoutId, acForm, $DataWhereExt, $DataMode, $WindowMode, $WindowTitle, 1, $DataFilter);
}
function WFOpenRaw($LayoutId, $DataWhereExt = '', $DataMode = acNormal, $WindowMode = acWindowNormal, $WindowTitle = '', $copy = 1){
	return WFOpenObject($LayoutId, acRaw, $DataWhereExt, $DataMode, $WindowMode, $WindowTitle, $copy);
}
function WFOpenReport($LayoutId, $DataWhereExt = '', $DataMode = acNormal, $WindowMode = acWindowNormal, $WindowTitle = '', $copy = 1){
	return WFOpenObject($LayoutId, acReport, $DataWhereExt, $DataMode, $WindowMode, $WindowTitle, $copy);
}
function WFOpenLabel($LayoutId, $DataWhereExt = '', $DataMode = acNormal, $WindowMode = acWindowNormal, $WindowTitle = '', $DataFilter = ''){
	return WFOpenObject($LayoutId, acLabel, $DataWhereExt, $DataMode, $WindowMode, $WindowTitle, 1);
}
function WFOpenGrid($LayoutId, $DataWhereExt = '', $DataMode = acNormal, $WindowMode = acWindowNormal, $WindowTitle = '', $DataFilter = ''){
	return WFOpenObject($LayoutId, acGrid, $DataWhereExt, $DataMode, $WindowMode, $WindowTitle, 1, $DataFilter);
}
function WFOpenTreeGrid($LayoutId, $DataWhereExt = '', $DataMode = acNormal, $WindowMode = acWindowNormal, $WindowTitle = '', $DataFilter = ''){
	return WFOpenObject($LayoutId, acTreeGrid, $DataWhereExt, $DataMode, $WindowMode, $WindowTitle, 1, $DataFilter);
}
function WFOpenTable($LayoutId, $DataWhereExt = '', $DataMode = acNormal, $WindowMode = acWindowNormal, $WindowTitle = '', $DataFilter = ''){
	return WFOpenObject($LayoutId, acGrid, $DataWhereExt, $DataMode, $WindowMode, $WindowTitle, 1, $DataFilter);
}
function WFOpenPivot($LayoutId, $DataWhereExt = '', $DataMode = acNormal, $WindowMode = acWindowNormal, $WindowTitle = '', $DataFilter = ''){
	return WFOpenObject($LayoutId, acPivot, $DataWhereExt, $DataMode, $WindowMode, $WindowTitle, 1, $DataFilter);
}

function WFOpenObject($ReqLayoutId, $ViewTypeExt = '', $DataWhereExt = '', $DataMode = acNormal, $WindowMode = acWindowNormal, $WindowTitle = '', $copy = 1, $DataFilter = ''){
	global $output;
	global $conn;
	global $RegistrationId;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $ExtJSDevWWW;
	global $ExtJSDevLOG;
	global $ExtJSDevURLPage;
	global $dbname;
	global $UserId;
	global $LayoutId;
	
	$file = '';
	$result = null;
	WFVALUESESSIONSETPRIV('LayoutId',$LayoutId);
	WFVALUESESSIONSETPRIV('LayoutWhere',$DataWhereExt);
	
	WFSendLOG("WFOpenObject", $LayoutId);
	
	if ((acSelf == $ReqLayoutId ) || ('0' == $ReqLayoutId )){
		$ReqLayoutId  = $LayoutId;
	}
		
		
	if (is_numeric($ReqLayoutId) == true){
		$sql = "SELECT * FROM " . $ExtJSDevDB . "layoutoverride WHERE ID = " . $ReqLayoutId . " 
				union 
				SELECT * FROM " . $ExtJSDevDB . "layout WHERE ID = " . $ReqLayoutId ;
	} else {
		$sql = "SELECT * FROM " . $ExtJSDevDB . "layoutoverride WHERE DESCNAME = '" . $ReqLayoutId ."' 
				union 
				SELECT * FROM " . $ExtJSDevDB . "layout WHERE DESCNAME = '" . $ReqLayoutId ."'";
	}
	$rs = $conn->Execute($sql);
	if (($rs !== false) && (!$rs->EOF)) {
		$ReqLayoutId = $rs->fields['ID'];
		if ($ViewTypeExt == ''){ $ViewTypeExt = $rs->fields['VIEWTYPE'];}
		if ($ViewTypeExt == ''){ $ViewTypeExt == 'acForm';}
		if ($conn->debug==1) echo("Trovato:" . $rs->fields['DESCNAME']. "<BR>\n");
		
		$output["datawhere"] = $DataWhereExt;
		$output["viewtype"] = $ViewTypeExt;
		$output["datamode"] = $DataMode;
		$output["windowmode"] = $WindowMode;
		$output["windowtitle"] = $WindowTitle;
		$output["total"] = '1';
		$output["success"] = true;
		$output["type"] = 'layout';
		$output["ctid"] = $ReqLayoutId;
		
		if ($ViewTypeExt == acReport ){
			if ($conn->debug==1) echo("ViewTypeExt:" . acReport. "<BR>\n");
			if (($DataMode == acSave) || ($DataMode == acPrintTo)){
				//	includes\phanton
				//$DataWhereExt  = str_replace(" ", "", $DataWhereExt );
				//$DataWhereExt  = str_replace(" ", '--', $DataWhereExt );
				chdir($ExtJSDevWWW . 'includes/jsreport/');
				$User = DLookup($conn, 'LOGIN,PASSWORD', $ExtJSDevDB . "user","ID = " . $UserId );
				
				if (PHP_OS == 'Linux') {
					$Command = 'nodejs jsreportphp.js layoutid+' . $ReqLayoutId . 
												" registrationid+" . $RegistrationId . 
												" datawhere+" . '"' . $DataWhereExt . '"' . 
												" userlogin+" . $User['LOGIN'] .
												" userpassword+" . $User['PASSWORD'] .
												" userdbname+" . $dbname .
												" dataurl+" . $ExtJSDevURLPage .
												" filename+" . $WindowTitle .
												" 2>&1";
				}else{
					$Command = 'node jsreportphp.js layoutid+' . $ReqLayoutId . 
												" registrationid+" . $RegistrationId . 
												" datawhere+" . '"' . $DataWhereExt . '"' . 
												" userlogin+" . $User['LOGIN'] .
												" userpassword+" . $User['PASSWORD'] .
												" userdbname+" . $dbname .
												" dataurl+" . $ExtJSDevURLPage .
												" filename+" . $WindowTitle;
				}
				$output["messagedebug"] = $Command;
				WFSendLOG("Execute NODE PDF", $Command);
				$exeoutput = array();
				if ($conn->debug==1) echo("Execute:" . $Command. "<BR>\n");
				exec($Command, $exeoutput, $retval);
				if ($conn->debug==1){ echo("Echo:"); var_dump($exeoutput); echo("<BR>\n");}
				if (count($exeoutput) > 0){
					$Appo = '' . $exeoutput[0];
					if ($conn->debug==1){ echo("Generator PDF:"); var_dump($Appo); echo("<BR>\n");}
					WFSendLOG("Generator PDF", $Appo);
					$Appo = json_decode($Appo);
					
					$output["datawhere"] = '';
					$output["viewtype"] = '';
					$output["datamode"] = '';
					$output["windowmode"] = '';
					$output["windowtitle"] = '';
					$output["total"] = '';
					$output["type"] = '';
					$output["ctid"] = '';
					if (isset($Appo->{'success'})) {
						if ($Appo->{'success'}){
							$result = $Appo->{'message'};
							$file = $Appo->{'message'};
							$output["message"] = $Appo->{'message'};
						}
						else {
							$result = false;
							if (isset($Appo->{'message'})) $output["messagedebug"] = $output["messagedebug"] . $Appo->{'message'};
						}
					}
				}
				else{
					if ($conn->debug==1){ echo("Generator Error PDF:"); var_dump($Appo); echo("<BR>\n");}
					WFSendLOG("Generator Error PDF", '');
					$output["success"] = false;
					$output["failure"] = true;
					$result = false;
					$output["messagedebug"] = $output["messagedebug"] . 'Error Generator PDF' . BRCRLF;
					//WFRaiseError(0, 'Layout Not Exist ' . $conn->ErrorMsg(), 'WFOpenObject', "LayoutID" . $ReqLayoutId );	
				}
			}
			if ($DataMode == acPrintTo){
				//CONVERSIONE PDF
				WFPDF2PDF($file, $file);
			}
			if ($DataMode == acPrintTo){
				if ($WindowTitle!= '' ) 
					$PrinterID = $WindowTitle;
				else
					$PrinterID = WFPRINTERLAYOUT($ReqLayoutId);
				if ($PrinterID != '') {
					$Printer = WFPRINTER($PrinterID); 
					if ($conn->debug==1) {echo("Printer:"); var_dump($Printer); echo("<BR>\n");}
					if ($Printer['TYPE'] == 'IPP'){
						$Appo = WFPRINTFILETOIPP($file, $Printer['IP'], $Printer['NAME'], $copy);
					}
					else if ($Printer['TYPE'] == 'IP'){
						$Appo = WFPRINTFILETOIP($file, $Printer['IP'],  $Printer['NAME'], $copy);
					}
					else if ($Printer['TYPE'] == 'SMB'){
						$Appo = WFPRINTFILETOSMB($file, $Printer['IP'],  $Printer['NAME'], $copy);
					}
					else if ($Printer['TYPE'] == 'QUEUE'){
						$Appo = WFPRINTFILETOQUEUE($file, $Printer['IP'],  $Printer['NAME'], $copy);
					}
					else if ($Printer['TYPE'] == 'IPRX'){
						$Appo = WFPRINTFILETOFROMIP($file, $Printer['IP'],  $Printer['NAME'], $copy);
					}
					$output["datawhere"] = '';
					$output["viewtype"] = '';
					$output["datamode"] = '';
					$output["windowmode"] = '';
					$output["windowtitle"] = '';
					$output["total"] = '';
					$output["type"] = '';
					$output["ctid"] = '';
					if (isset($Appo["success"])) {
						if ($Appo["success"] == true){
					if (isset($Appo["message"])) {
								$result = true; //$Appo["message"]; 
							}else{
								$result = true;
							}
						}
						else {
							$result = false;
					if (isset($Appo["message"])) $output["messagedebug"] = $output["messagedebug"] . $Appo["message"];
				}
					}
				} 
				else {
					$output["failure"] = true;
					$result = false;
					$output["messagedebug"] = $output["messagedebug"] . 'Layout Not Exist' . BRCRLF;
					//WFRaiseError(0, 'Layout Not Exist ' . $conn->ErrorMsg(), 'WFOpenObject', "LayoutID" . $ReqLayoutId );
				}
			}
		}
		elseif ($ViewTypeExt == acLabel ){
			if ($DataMode == acPrintTo){
				if ($WindowTitle != '' ) { $PrinterID = $WindowTitle; }else{ $PrinterID = WFPRINTERLAYOUT($ReqLayoutId); }
				if ($PrinterID != '') {
					$Printer = WFPRINTER($PrinterID); 
					$stream = $rs->fields["LAYOUTJSON"];
					$streamDPI = $rs->fields["PRINTERNAME"];
					$stream = ExecFuncInStringLAYOUT($stream);
					$seq =  rand(10, 99);
					file_put_contents($ExtJSDevLOG . "label" . $Printer['IP'] . '-' . $seq . $Printer['TYPE']  .".log",$stream, LOCK_EX);
					if ($Printer['TYPE'] == 'IPP'){
						//if (substr_count( $stream, "\n" ) < 2){
						if(strlen($stream) < 100){
							$Appo = WFPRINTFILETOIPP($stream, $Printer['IP'], $Printer['NAME'], $copy, $seq);
						}
						else{
							$Appo = WFPRINTSTREAMTOIPP($stream, $Printer['IP'], $Printer['NAME'], $copy, $seq);
						}
					}
					else if ($Printer['TYPE'] == 'IP'){
						$Appo = WFPRINTSTREAMTOIP($stream, $Printer['IP'],  $Printer['NAME'], $copy, $seq);
					}
					else if ($Printer['TYPE'] == 'IPRX'){
						//if (substr_count( $stream, "\n" ) < 2){
						if(strlen($stream) < 100){
							$appo = WFPRINTFILETOFROMIP($stream, $Printer['IP'],  $Printer['NAME'], $copy, $seq);
						}else{
							$appo = WFPRINTSTREAMTOFROMIP($stream, $Printer['IP'],  $Printer['NAME'], $copy, $seq);
						}
					}
					else if ($Printer['TYPE'] == 'SMB'){
						//if (substr_count( $stream, "\n" ) < 2){
						if(strlen($stream) < 100){
							$Appo = WFPRINTFILETOSMB($stream, $Printer['IP'], $Printer['NAME'], $copy, $seq);
						}else{
							$Appo = WFPRINTSTREAMTOSMB($stream, $Printer['IP'], $Printer['NAME'], $copy, $seq);
						}
					}
					else if ($Printer['TYPE'] == 'QUEUE'){
						//if (substr_count( $stream, "\n" ) < 2){
						if(strlen($stream) < 100){
							$Appo = WFPRINTFILETOQUEUE($stream, $Printer['IP'], $Printer['NAME'], $copy, $seq);
						}else{
							$Appo = WFPRINTSTREAMTOQUEUE($stream, $Printer['IP'], $Printer['NAME'], $copy, $seq);
						}
					}
					$output["datawhere"] = '';
					$output["viewtype"] = '';
					$output["datamode"] = '';
					$output["windowmode"] = '';
					$output["windowtitle"] = '';
					$output["total"] = '';
					$output["type"] = '';
					$output["ctid"] = '';
					if (isset($Appo["success"])) {
						if ($Appo["success"] == true){
							if (isset($Appo["message"])) {
								$result = true ; //$Appo["message"]; 
							}else{
								$result = true;
							}
						}
						else {
							$result = false;
							if (isset($Appo["message"])) $output["messagedebug"] = $output["messagedebug"] . $Appo["message"];
						}
					}
				} else {
					$output["success"] = false;
					$output["failure"] = true;
					$result = false;
					$output["messagedebug"] = $output["messagedebug"] . 'Layout Not Exist' . BRCRLF;
					//WFRaiseError(0, 'Layout Not Exist ' . $conn->ErrorMsg(), 'WFOpenObject', "LayoutID" . $ReqLayoutId );
				}
			}
		}
		elseif ($ViewTypeExt == acRaw ){
		}
		$rs->close();
	}
	else{
		$output["success"] = false;
		$output["failure"] = true;
		WFRaiseError(0, 'Layout Not Exist ' . $conn->ErrorMsg(), 'WFOpenObject', "LayoutID" . $ReqLayoutId );		
	}
	WFSendLOG("WFOpenForm:", "output:" . json_encode($output));
	return $result;
}


function WFOpenLink($fileurl){
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;

	WFSendLOG("WFOpenLink", $fileurl);
	$output["viewtype"] = '';
	$output["datamode"] = '';
	$output["total"] = '1';
	$output["success"] = true;
	$output["type"] = 'link';
	$output["ctid"] = $fileurl;
	WFSendLOG("WFOpenLink:", "output:" . json_encode($output));
}
function WFLogout(){
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;

	WFSendLOG("WFLogout","");
	$output["viewtype"] = '';
	$output["datamode"] = '';
	$output["total"] = '1';
	$output["success"] = true;
	$output["type"] = 'logout';
	$output["ctid"] = '';
	WFSendLOG("WFLogout:", "output:" . json_encode($output));
}
function WFOpenFile($fileurl, $download = false){
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;

	WFSendLOG("WFOpenFile", $fileurl);
	$output["viewtype"] = '';
	$output["datamode"] = '';
	$output["total"] = '1';
	$output["success"] = true;
	$output["type"] = 'file';
	$output["filedownload"] = $download;
	$fileid = GenerateRandomString();	
	WFVALUESESSIONSETPRIV($fileid,$fileurl);
	$output["ctid"] = $fileid;
	if ($conn->debug==1) echo("WFOpenFile:" . $fileurl. "<BR>\n");
	WFSendLOG("WFOpenFile:", "output:" . json_encode($output));
}

function WFCloseObject($ReqLayoutId = acSelf){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $LayoutId;
	global $RegistrationId;
	global $UserId;
	global $output;
	global $LayoutId;
	
	if ((acSelf == $ReqLayoutId ) || ('0' == $ReqLayoutId )){
		$ReqLayoutId  = $LayoutId;
	}else{
		if (is_numeric($ReqLayoutId) == false) {
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layout 
					WHERE DESCNAME = '" . $ReqLayoutId . "'";		
			$rs = $conn->Execute($sql);
			if ($rs) {
				$ReqLayoutId = $rs->fields['ID'];
				$rs->close();
			}
		}
	}
	$output["closeid"] = $ReqLayoutId;
}

function WFRequeryObject($ReqLayoutId = acSelf){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $LayoutId;
	global $RegistrationId;
	global $UserId;
	global $output;
	global $LayoutId;
	
	if ((acSelf == $ReqLayoutId ) || ('0' == $ReqLayoutId )){
		$ReqLayoutId  = $LayoutId;
	}else{
		if (is_numeric($ReqLayoutId) == false) {
			$sql = "SELECT ID 
					FROM " . $ExtJSDevDB . "layout 
					WHERE DESCNAME = '" . $ReqLayoutId . "'";		
			$rs = $conn->Execute($sql);
			if ($rs) {
				$ReqLayoutId = $rs->fields['ID'];
				$rs->close();
			}
		}
	}
	if (is_array($output) && array_key_exists("requeryid",$output)){
		$output["requeryid"] = $output["requeryid"] . ';' . $ReqLayoutId ;
	}else{
		$output["requeryid"] = $ReqLayoutId ;
	}
}


/************************************************************************************/
/*                  	  FUNC PRINTER IPP	IP  SMB		 							*/
/************************************************************************************/
function WFStreamToPrinter($PrinterID , $stream, $copy = 1, $seq = 1){
	$Printer = WFPRINTER($PrinterID); 
	if ($Printer['TYPE'] == 'IPP'){
		$stream = ExecFuncInStringLAYOUT($stream);
		WFPRINTSTREAMTOIPP($stream, $Printer['IP'], $Printer['NAME'], $copy, $seq);
	}else if ($Printer['TYPE'] == 'IP'){
		$stream = ExecFuncInStringLAYOUT($stream);
		WFPRINTSTREAMTOIP($stream, $Printer['IP'],  $Printer['NAME'], $copy);
	}else if ($Printer['TYPE'] == 'SMB'){
		$stream = ExecFuncInStringLAYOUT($stream);
		WFPRINTSTREAMTOSMB($stream, $Printer['IP'], $Printer['NAME'], $copy);
	}else if ($Printer['TYPE'] == 'QUEUE'){
		$stream = ExecFuncInStringLAYOUT($stream);
		WFPRINTSTREAMTOQUEUE($stream, $Printer['IP'], $Printer['NAME'], $copy);
	}
}
function WFPRINTER($ReqPrinter){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	$NewChiave = '';
	
	WFSendLOG("WFPRINTER",  " PrinterId:" . $ReqPrinter);
	$sqlLay = "SELECT * FROM " . $ExtJSDevDB . "printer WHERE ";
	if (is_numeric($ReqPrinter) == true) {
		$sqlLay = $sqlLay . " ID = " . $ReqPrinter;
	} else {
		$sqlLay = $sqlLay . " DESCNAME = '" . $ReqPrinter . "'";
	}
	$rs = $conn->Execute($sqlLay);
	if ($rs !== false) {
		$ReqPrinter = $rs->fields['ID'];
		$NewChiave = $rs->fields;
		$rs->close();
	}
	return ($NewChiave);
}
function WFPRINTERLAYOUT($ReqLayoutId = '0'){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $UserId;
	global $LayoutId;
	$NewChiave = '';
	
	WFSendLOG("WFPRINTERLAYOUT", " LayoutId:" . $ReqLayoutId);
	
	if (acSelf == $ReqLayoutId ) $ReqLayoutId  = $LayoutId;
	if (is_numeric($ReqLayoutId) == true) {
		$ReqLayoutId = WFLAYOUT('ID', $ReqLayoutId);
	}
	
	$sqlLay = "SELECT CT_AAAPRINTER FROM " . $ExtJSDevDB . "printerlayout WHERE CT_AAALAYOUT = " . $ReqLayoutId . " AND CT_AAAUSER = " . $UserId;
	$rs = $conn->Execute($sqlLay);
	if ($rs->RecordCount() > 0) {
		$NewChiave = $rs->fields['CT_AAAPRINTER'];
		$rs->close();
	}else{
		$sqlLay = "SELECT CT_AAAPRINTER FROM " . $ExtJSDevDB . "printerlayout WHERE CT_AAALAYOUT = " . $ReqLayoutId;
		$rs = $conn->Execute($sqlLay);
		if ($rs->RecordCount() > 0) {
			$NewChiave = $rs->fields['CT_AAAPRINTER'];
			$rs->close();
		}else{
			$sqlLay = "SELECT CT_AAAPRINTER FROM " . $ExtJSDevDB . "printerlayout WHERE CT_AAAUSER = " . $UserId;
			$rs = $conn->Execute($sqlLay);
			if ($rs->RecordCount() > 0) {
				$NewChiave = $rs->fields['CT_AAAPRINTER'];
				$rs->close();
			}
		}
	}
	return ($NewChiave);
}

function WFPRINTFILETOIPP($File = "test.ext", $PrinterIP ="192.168.0.108", $PrinterURI ="/printers/Zebra_TLP2844", $copy = 1,$seq= 1){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDB;
	global $username;
	global $password;
	global $dbname;
	
	WFSendLOG("WFPRINTTOIPP", " File:" . $File . " PrinterIP:" . $PrinterIP . " PrinterURI:" . $PrinterURI);
	
	/*
	if (!isIpAlive( $PrinterIP)){
		$intoutput["success"] = false;
		$intoutput["message"] = $PrinterIP . ' Error NOT alive on port 80'.BRCRLF;
		return $intoutput;
	}
	*/
	require_once dirname(__FILE__) . '/PHPIpp/PrintIPP.php';

	$ipp = new PrintIPP();
	
	$ipp->setHost($PrinterIP);
	$ipp->setPrinterURI($PrinterURI);
	//$ipp->setAuthentication("test","test"); 
	$ipp->setJobName("JOB From:" . $username . " ExtJSDEV:" . $File ,true); 

	//$ipp->setAttribute('number-up',1); // 4 pages per sheet
	//$ipp->setAttribute('media','A7'); // very little pages
	//$ipp->setAttribute('requested-orientation','portrait'); 
	if (WFFileExt($File) == 'pdf'){
		$ipp->setMimeMediaType();
	}elseif (WFFileExt($File) == 'prn'){
		$ipp->setMimeMediaType("application/vnd.cups-raw");
	}elseif (WFFileExt($File) == 'raw'){
		$ipp->setMimeMediaType("application/vnd.cups-raw");
	}else{
		$ipp->setMimeMediaType();
	}
	
	$ipp->setData($File); // Path to file.
	for ($i = 1; $i <= $copy; $i++) {
		$ipp->printJob();
	}
}
function WFPRINTSTREAMTOIPP($Stream = "", $PrinterIP ="", $PrinterURI ="", $copy = 1,$seq = 1){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevTMP;
	global $ExtJSDevDOC;
	global $ExtJSDevLOG;
	global $ExtJSDevWWW;
	global $ExtJSDB;
	global $username;
	global $password;
	global $dbname;
	WFSendLOG("WFPRINTSTREAMTOIPP", " PrinterIP:" . $PrinterIP . " PrinterURI:" . $PrinterURI);
	/*
	if (!isIpAlive( $PrinterIP)){
		$intoutput["success"] = false;
		$intoutput["message"] = $PrinterIP . ' Error NOT alive on port 80'.BRCRLF;
		return $intoutput;
	}
	*/
	require_once dirname(__FILE__) . '/PHPIpp/PrintIPP.php';

	$ipp = new PrintIPP();
	$ipp->setLog($ExtJSDevLOG . "label" .  $PrinterIP . '-' . $seq . 'IPP' .  ".log");

	$ipp->setHost($PrinterIP);
	$ipp->setPrinterURI($PrinterURI);
	//$ipp->setAuthentication("test","test"); 
	$ipp->setJobName("JOB From:" . $username . " ExtJSDEV: Dump"  ,true); 

	//$ipp->setAttribute("printer-resolution","1440x720dpi");
	//$ipp->setAttribute("job-billing", "Thomas");
	//$ipp->setAttribute("print-quality", "high");
	//$ipp->setAttribute("scaling",100);
	//$ipp->setAttribute('number-up',1); // 4 pages per sheet
	//$ipp->setAttribute('media','A7'); // very little pages
	//$ipp->setAttribute('requested-orientation','portrait'); 
	$ipp->setMimeMediaType("application/vnd.cups-raw");
    
	$ipp->setData($Stream); // Path to file.
	
	$ipp->setCopies($copy);
	//for ($i = 1; $i <= $copy; $i++) {
		$ipp->printJob();
	//sleep(1);
	$job = $ipp->last_job;
	file_put_contents($ExtJSDevLOG . "label" . $PrinterIP  . '-' . $seq . 'IPPDResult' . ".log",$job, LOCK_EX);
	//$ipp->setLog($ExtJSDevLOG . "label" . "ipp" . $PrinterIP . '-' . rand(5, 15) . ".log");
	//}
}

function WFPRINTFILETOIP($File = "test.ext", $PrinterIP ="192.168.0.108", $PrinterURI ="", $copy = 1,$seq= 1){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevTMP;
	global $ExtJSDevDOC;
	global $ExtJSDevLOG;
	global $ExtJSDevWWW;
	global $ExtJSDB;
	global $username;
	global $password;
	global $dbname;
	$job = 'start';
	WFSendLOG("WFPRINTFILETOIP", " PrinterIP:" . $PrinterIP . " PrinterURI:" . $PrinterURI);

	if (!isIpAlive( $PrinterIP)){
		$intoutput["success"] = false;
		$intoutput["message"] = $PrinterIP . ' Error NOT alive on port 80'.BRCRLF;
		return $intoutput;
	}

	//send data to printer
	chdir($ExtJSDevTMP);
	if (WFFileExt($File) == 'pdf'){
		$job = 'pdf';
		for ($i = 1; $i <= $copy; $i++) {
			$exeoutput = array();
			$Command="lpr -S " . $PrinterIP . " -P  -d " . $File . ""; 
			exec($Command, $exeoutput);
			if ($conn->debug==1) echo("Execute:" . $Command. "<BR>\n");
			if (count($exeoutput) > 0){
				$Appo = '' . $exeoutput[0];
				WFSendLOG("Printer PDF", $Appo);
			}else{
				WFSendLOG("Printer PDF", '');
				$Appo = '' . $exeoutput[0];
				
				$output["success"] = false;
				$output["failure"] = true;
				$output["messagedebug"] = $output["messagedebug"] . 'Errore Stampa ' . $Appo . BRCRLF;
			}
		}
		$job = $exeoutput;
	}else{
		$job = 'raw';
		for ($i = 1; $i <= $copy; $i++) {
			exec("lpr -S " . $PrinterIP . " -P RAW " . $File . "", $exeoutput);
		}
		$job = $exeoutput;
	}
}
function WFPRINTSTREAMTOIP($Stream = "", $PrinterIP ="192.168.0.108", $PrinterURI ="", $copy = 1,$seq= 1){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevTMP;
	global $ExtJSDevDOC;
	global $ExtJSDevLOG;
	global $ExtJSDevWWW;
	global $ExtJSDB;
	global $username;
	global $password;
	global $dbname;
	$job = 'start';
	WFSendLOG("WFPRINTSTREAMTOIP", " PrinterIP:" . $PrinterIP . " PrinterURI:" . $PrinterURI);

	if (!isIpAlive( $PrinterIP)){
		$intoutput["success"] = false;
		$intoutput["message"] = $PrinterIP . ' Error NOT alive on port 80'.BRCRLF;
		return $intoutput;
	}
	
	//send data to printer
	chdir($ExtJSDevTMP);
	$fp=fopen('temp' . $seq .'.prn', 'w');
	fwrite($fp,$Stream);
	fclose($fp);
	
	if (PHP_OS == 'Linux') {
	$job = 'Linux LPR';
		for ($i = 1; $i <= $copy; $i++) {
			exec("lpr -S " . $PrinterIP . " -P RAW temp" . $seq .".prn", $exeoutput);
		}
		$job = $exeoutput;
	}else{
		$job = 'Windows LPR';
		for ($i = 1; $i <= $copy; $i++) {
			exec("lpr -S " . $PrinterIP . " -P RAW temp" . $seq .".prn", $exeoutput);
		}
	$job = $exeoutput;
	}
	$intoutput["success"] = true;
	return $intoutput;
	/*
	//send data to USB printer
	$fp=fopen('EASYLABEL.prn', 'r');
	fread($fp,$Stream);
	fclose($fp);

	//send data via TCP/IP port : the printer has tcp interface
	$port = "9100";
	$host = $PrinterIP;
	$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
	if ($socket === false) {
		echo "socket_create() failed: reason: " . socket_strerror(socket_last_error    ()) . "\n";
	} else {
		//echo "OK.\n";
	}
	$result = socket_connect($socket, $host, $port);
	if ($result === false) {
		echo "socket_connect() failed.\nReason: ($result) " . socket_strerror    (socket_last_error($socket)) . "\n";
	} else {
		//echo "OK.\n";
	}
	socket_write($socket, $Stream, strlen($string));
	socket_close($socket);
*/
}

function WFPRINTFILETOFROMIP($File = "test.ext", $PrinterIP ="192.168.0.108", $PrinterURI ="", $copy = 1,$seq= 1){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevTMP;
	global $ExtJSDevDOC;
	global $ExtJSDevLOG;
	global $ExtJSDevWWW;
	global $ExtJSDB;
	global $username;
	global $password;
	global $dbname;
	WFSendLOG("WFPRINTFILETOFROMIP", " PrinterIP:" . $PrinterIP . " PrinterURI:" . $PrinterURI);

	if (!isIpAlive( $PrinterIP)){
		$intoutput["success"] = false;
		$intoutput["message"] = $PrinterIP . ' Error NOT alive on port 80'.BRCRLF;
		return $intoutput;
	}

	//send data to printer
	chdir($ExtJSDevTMP);
	$fp = fopen($File, 'r', true);
	$Stream = stream_get_contents($fp);
	fclose($fp);

	$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
	if ($socket === false) {
		echo "socket_create() failed: reason: " . socket_strerror(socket_last_error    ()) . "\n";
		return null;
	}

	$result = socket_connect($socket, $PrinterIP, '9100');
	if ($result === false) {
		echo "socket_connect() failed.\nReason: ($result) " . socket_strerror    (socket_last_error($socket)) . "\n";
		return null;
	}
	
	socket_write($socket, $Stream, strlen($Stream));
	$read=socket_read($socket,1024);
	socket_close($socket);
	
	$intoutput["message"] = $read;
	$intoutput["success"] = true;
	return $intoutput;
}
function WFPRINTSTREAMTOFROMIP($Stream = "", $PrinterIP ="192.168.0.108", $PrinterURI ="", $copy = 1,$seq= 1){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevTMP;
	global $ExtJSDevDOC;
	global $ExtJSDevLOG;
	global $ExtJSDevWWW;
	global $ExtJSDB;
	global $username;
	global $password;
	global $dbname;
	WFSendLOG("WFPRINTSTREAMTOFROMIP", " PrinterIP:" . $PrinterIP . " PrinterURI:" . $PrinterURI);

	if (!isIpAlive( $PrinterIP)){
		$intoutput["success"] = false;
		$intoutput["message"] = $PrinterIP . ' Error NOT alive on port 80'.BRCRLF;
		return $intoutput;
	}

	$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
	if ($socket === false) {
		echo "socket_create() failed: reason: " . socket_strerror(socket_last_error    ()) . "\n";
		return null;
	}

	$result = socket_connect($socket, $PrinterIP, '9100');
	if ($result === false) {
		echo "socket_connect() failed.\nReason: ($result) " . socket_strerror    (socket_last_error($socket)) . "\n";
		return null;
	}
	
	socket_write($socket, $Stream, strlen($Stream));
	$read=socket_read($socket,1024);
	socket_close($socket);
	
	$intoutput["message"] = $read;
	$intoutput["success"] = true;
	return $intoutput;
}

function WFPRINTFILETOSMB($File = "test.ext", $PrinterIP ="192.168.0.108", $PrinterURI ="", $copy = 1,$seq= 1){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevTMP;
	global $ExtJSDevDOC;
	global $ExtJSDevLOG;
	global $ExtJSDevWWW;
	global $ExtJSDB;
	global $username;
	global $password;
	global $dbname;
	WFSendLOG("WFPRINTFILETOSMB", " PrinterIP:" . $PrinterIP . " PrinterURI:" . $PrinterURI);

	//send data to USB printer
	
	chdir($ExtJSDevTMP);
	if (PHP_OS == 'Linux') {
	}else{
		if (WFFileExt($File) == 'pdf'){
			for ($i = 1; $i <= $copy; $i++) {
				exec("PDFtoPrinter [" . $File . "] " . $PrinterIP  );
			}
		}else{
			for ($i = 1; $i <= $copy; $i++) {
				exec("lpr -S " . $PrinterIP . " -P RAW " . $File . "", $exeoutput);
			}
		}
	}
	$intoutput["success"] = true;
	return $intoutput;
}
function WFPRINTSTREAMTOSMB($Stream = "", $PrinterIP ="192.168.0.108", $PrinterURI ="", $copy = 1,$seq= 1){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevTMP;
	global $ExtJSDevDOC;
	global $ExtJSDevLOG;
	global $ExtJSDevWWW;
	global $ExtJSDB;
	global $username;
	global $password;
	global $dbname;
	WFSendLOG("WFPRINTSTREAMTOSMB", " PrinterIP:" . $PrinterIP . " PrinterURI:" . $PrinterURI);

	//send data to USB printer
	chdir($ExtJSDevTMP);
	$File = 'temp' . $seq .'.prn';
	$fp=fopen('temp' . $seq .'.prn', 'w');
	fwrite($fp,$Stream);
	fclose($fp);
	
	if (PHP_OS == 'Linux') {
	}
	else{
		if (WFFileExt($File) == 'pdf'){
			for ($i = 1; $i <= $copy; $i++) {
				exec("PDFtoPrinter [" . $File . "] " . $PrinterIP  );
			}
		}else{
			for ($i = 1; $i <= $copy; $i++) {
				exec("lpr -S " . $PrinterIP . " -P RAW " . $File . "", $exeoutput);
			}
		}
	}
	
	$intoutput["success"] = true;
	return $intoutput;
	/*
	//send data to USB printer
	$fp=fopen('EASYLABEL.prn', 'r');
	fread($fp,$Stream);
	fclose($fp);

	//send data via TCP/IP port : the printer has tcp interface
	$port = "9100";
	$host = $PrinterIP;
	$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
	if ($socket === false) {
		echo "socket_create() failed: reason: " . socket_strerror(socket_last_error    ()) . "\n";
	} else {
		//echo "OK.\n";
	}
	$result = socket_connect($socket, $host, $port);
	if ($result === false) {
		echo "socket_connect() failed.\nReason: ($result) " . socket_strerror    (socket_last_error($socket)) . "\n";
	} else {
		//echo "OK.\n";
	}
	socket_write($socket, $Stream, strlen($string));
	socket_close($socket);
*/
}

function WFPRINTFILETOQUEUE($File = "test.pdf", $PrinterIP ="localhost", $PrinterURI ="name", $copy = 1,$seq= 1){
	global $conn;
	global $output;
	global $ExtJSDevExportRAW;
	WFSendLOG("WFPRINTFILETOQUEUE", " PrinterIP:" . $PrinterIP . " PrinterURI:" . $PrinterURI);
	
	chdir($ExtJSDevExportRAW . "prt/" . $PrinterURI . "/");
	$filename = 'myfile_'. round(microtime(true) * 1000) .   ".". WFFileExt($File);
	
	copy($File, $filename);
	unlink($File);
	$intoutput["success"] = true;
	return $intoutput;
}
function WFPRINTSTREAMTOQUEUE($Stream = "", $PrinterIP ="localhost", $PrinterURI ="name", $copy = 1,$seq= 1){
	global $conn;
	global $output;
	global $ExtJSDevExportRAW;
	WFSendLOG("WFPRINTSTREAMTOQUEUE", " PrinterIP:" . $PrinterIP . " PrinterURI:" . $PrinterURI);
	
	chdir($ExtJSDevExportRAW . "prt/" . $PrinterURI . "/");
	$filename = $ExtJSDevExportRAW .  round(microtime(true) * 1000)  . ".pdf";
	$fp = fopen($filename, 'w');
	fwrite($fp,$Stream);
	fclose($fp);
	$intoutput["success"] = true;
	return $intoutput;
}

function WFPRINTINK($Stream = "", $PrinterIP ="192.168.0.108", $x = 0, $y = 0, $font = 10){
	global $conn;
	global $output;
	global $ExtJSDevExportRAW;
	WFSendLOG("WFPRINTINK", " PrinterIP:" . $PrinterIP . " PrinterURI:" . $Stream);
	if ($Stream == "start"){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "http://" . $PrinterIP . "/test?params=start");
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$result = curl_exec($ch);
		curl_close($ch);
	}elseif ($Stream == "end"){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "http://" . $PrinterIP . "/test?params=end");
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$result = curl_exec($ch);
		curl_close($ch);
	}else{
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "http://" . $PrinterIP . "/test?params=" . $x . "|" . $y . "|" . $font . "|" . $Stream . "");
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$result = curl_exec($ch);
		curl_close($ch);
	}
}

/************************************************************************************/
/*                   		  FUNC SEND MAIL SOCKET 								*/
/************************************************************************************/

function WFMailSend($To = '', $Cc = '', $Bcc = '', $Subject= '', $MessageText = '', 
					$FileToAttach = '', $FileDecodeName = false, $smtpFFrom = '', 
					$smtpFlogin = '', $smtpFpassword = '', $smtpFserver = '', $smtpFport = '', $smtpFsecure = '',
					$SaveToSent = false){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDevLOG;
	global $ExtJSDB;
	global $smtplogin;
	global $smtpsender;
	global $smtppassword;
	global $smtpserver;
	global $smtpport;
	global $smtpsecure;
	global $UserId;
	global $debugmessage;
	
	$result = 'true';
	WFSendLOG("WFMailSend", "From:" . $smtpFFrom . "to:" . $To . " msg:" . $MessageText . " attach:" . $FileToAttach);
	
	
	if ($smtpFlogin !='') {$smtplogin = $smtpFlogin; $smtpsender = $smtpFlogin;}
	if ($smtpFpassword !='') $smtppassword = $smtpFpassword;
	if ($smtpFserver !='') $smtpserver = $smtpFserver;
	if ($smtpFport != '') $smtpport = $smtpFport;
	if ($smtpFsecure !='') $smtpsecure = $smtpFsecure;
	if ($smtpsender == '')  $smtpsender = $smtplogin;
	
	require_once dirname(__FILE__) . '/PHPMailer/PHPMailerAutoload.php';
	//include_once('PHPMailer/class.phpmailer.php');
	
	/* new 6.0
		use PHPMailer\PHPMailer\PHPMailer;
		use PHPMailer\PHPMailer\Exception;

		require dirname(__FILE__) . '/PHPMailer/Exception.php';
		require dirname(__FILE__) . '/PHPMailer/PHPMailer.php';
		require dirname(__FILE__) . '/PHPMailer/SMTP.php';
	*/

	$mail = new PHPMailer(true); 
	$mail->IsSMTP();					// set mailer to use SMTP
	if ($conn->debug==1) {
		$mail->SMTPDebug = 3;           // Enable verbose debug output
		$mail->Debugoutput = 'html';
		file_put_contents($ExtJSDevLOG . 'smtp.log', gmdate('Y-m-d H:i:s'). "\t START \n", FILE_APPEND | LOCK_EX);
		$mail->Debugoutput = function($str, $level) {
			global $ExtJSDevLOG;
			echo ("debug level $level; message: $str". BRCRLF);
			file_put_contents($ExtJSDevLOG . 'smtp.log', gmdate('Y-m-d H:i:s'). "\t$level\t$str\n", FILE_APPEND | LOCK_EX);
		};
	}else{
		$mail->SMTPDebug = 0;           // Enable verbose debug output
	}
	$mail->Host = $smtpserver;			// specify main and backup server
	$mail->Mailer = 'smtp';				// specify main and backup server
	$mail->SMTPAuth = true;				// turn on SMTP authentication
	$mail->Port = $smtpport;
	$mail->CharSet = 'utf-8'; 
	$mail->AuthType = 'LOGIN';
	if ($smtpsecure == "") {
		$mail->SMTPSecure = false;
		$mail->SMTPAutoTLS = false;
	}else{
		$mail->SMTPSecure = $smtpsecure;
	}
	$mail->Username = $smtplogin;		// SMTP username
	$mail->Password = $smtppassword;	// SMTP password
	$mail->From = $smtpsender;
	$mail->FromName = $smtpsender;
	
	
	if ($smtpFFrom != ''){
		//$SaveToSent = true;
		$mail->From = $smtpFFrom;
		//$mail->AddReplyTo($From, $smtpFFrom);
	}else{
		if ($UserId != 0){
			$sql = "SELECT * FROM " . $ExtJSDevDB . "user WHERE ID = " . $UserId;
			$rs = $conn->Execute($sql);
			if ($rs !== false) {
				if (!IsNullOrEmptyOrZeroString($rs->fields['EMAILSMTP'])) {
					$mail->Host = $rs->fields['EMAILSMTP'];     // specify main and backup server
					$mail->Port = $rs->fields['EMAILSMTPPORT'];    
					if ($rs->fields['EMAILSMTPSECURE'] == "") {
						$mail->SMTPSecure = false;
						$mail->SMTPAutoTLS = false;
					}else{
						$mail->SMTPSecure = $rs->fields['EMAILSMTPSECURE'];
					}
					$mail->HostImap = $rs->fields['EMAILIMAP'];    
					$mail->Username = $rs->fields['EMAILUSER'];    // SMTP username
					$mail->Password = $rs->fields['EMAILPWD'];    // SMTP password
					//$SaveToSent = true;
				}
				if ($rs->fields['EMAIL'] . '' != '') {
					$mail->From = $rs->fields['EMAIL'];
				}
				$mail->FromName = $rs->fields['DESCNAME'];
				$rs->close();
			}
			if (WFVALUEUSER('EMAIL') != ''){
				$mail->AddReplyTo(WFVALUEUSER('EMAIL'), WFVALUEUSER('DESCNAME'));
			}else{
				$mail->AddReplyTo($smtplogin, $smtplogin);
			}
		}else{
			$mail->AddReplyTo($smtplogin, $smtplogin);
		}
	}
	
	if ($To != '') {
		if (strrpos($To, ";") === false){
			$mail->AddAddress($To);
		}else{
			$ToArray = explode(";", $To);
			foreach ($ToArray as $ToEmail) {
				$mail->AddAddress($ToEmail);
			}
		}
	}
	
	if ($Cc != '') {
		if (strrpos($Cc, ";") === false){
			$mail->addCC($Cc);
		}else{
			$ToArray = explode(";", $Cc);
			foreach ($ToArray as $ToEmail) {
				$mail->addCC($ToEmail);
			}
		}
	}
	
	if ($Bcc != '') {
		if (strrpos($Bcc, ";") === false){
			$mail->addBCC($Bcc);
		}else{
			$ToArray = explode(";", $Bcc);
			foreach ($ToArray as $ToEmail) {
				$mail->addBCC($ToEmail);
			}
		}
	}
	
	// add attachments
	$FileToAttachDebug = "";
	$FileToAttach = $FileToAttach . ',';
	$FileArray = explode(',',$FileToAttach);
	$FileArray = array_unique($FileArray);
	foreach($FileArray as $key) { 
		$key = trim($key);
		if ($key != ''){
			$name  = '';
			if ($FileDecodeName){
				//rename file with original name (if file was from repository)
				$document  = DLookup($conn, "*", $ExtJSDevDB . 'documents', "FILENAME = '" . $key . "'");
				if ($document != ''){
					if ($document['CT_TABLE']!= ''){
						$tablefield  = DLookup($conn, "*",  $ExtJSDevDB . 'fieldef', "CT_TABLE = '" . $document['CT_TABLE'] . "'");
						if ($tablefield['DISPLAYFIELD'] != ''){
							$name  = DLookup($conn, $tablefield['CODEFIELD'], $tablefield['DATASOURCE'], $tablefield['VALUEFIELD'] . " = " . $document['CT_ID'] . "");
							$name  = StringAZ09Special($name);
							$name = $name . "." . WFFileExt($key);
						}
					}
				}
				$key = WFFileAbsolute($key);
				if ($name  != ''){
					$FileToAttachDebug = $FileToAttachDebug .'$key' . $key . ' $name' . $name . BRCRLF;
					$mail->AddAttachment($key, $name);	
				}else{
					$mail->AddAttachment($key);	
				}
			}
			else{ 
				$key = WFFileAbsolute($key);
				if ($name  != ''){
					$FileToAttachDebug = $FileToAttachDebug .'$key' . $key . ' $name' . $name . BRCRLF;
					$mail->AddAttachment($key, $name);	
				}else{
					$mail->AddAttachment($key);	
				}
			}
		}
	}
	
	$mail->WordWrap = 50;
	$mail->IsHTML(true);
	$mail->Subject = $Subject;
	$mail->Body = $MessageText . " ";
	$mail->AltBody = $MessageText . " ";

	//$mail->SMTPDebug = 3;
				// set mailer to use SMTP
	if ($conn->debug==1) {
		echo("Host:" . $mail->Host . 
								" Port:" . $mail->Port . BRCRLF . 
								" Secure:" . $mail->SMTPSecure . BRCRLF . 
								" Username:" . $mail->Username .  BRCRLF .
								" Password:" . $mail->Password .  BRCRLF .
								" From:" . $mail->From .  BRCRLF .
								" FromName:" . $mail->FromName .  BRCRLF .
								" To:" . $To .  BRCRLF .
								" Msg:" . $MessageText .  BRCRLF .
								" Attach:" . $FileToAttach);
	}
							
	WFSendLOG("WFMailSend", "Host:" . $mail->Host . 
							" Port:" . $mail->Port . BRCRLF . 
							" Secure:" . $mail->SMTPSecure . BRCRLF . 
							" Username:" . $mail->Username .  BRCRLF .
							" Password:" . $mail->Password .  BRCRLF .
							" From:" . $mail->From .  BRCRLF .
							" FromName:" . $mail->FromName .  BRCRLF .
							" To:" . $To .  BRCRLF .
							" Msg:" . $MessageText .  BRCRLF .
							" Attach:" . $FileToAttach);
	
	try {
		$result = $mail->Send();
		$output["success"] = true;
	} catch (phpmailerException $e) {
		$output["success"] = false;
		$output["failure"] = true;
		$output["message"] = $output["message"] . "Errore invio email:" . $mail->ErrorInfo . ' ' .$e->getMessage() . ' ' . $To . CRLF ;
	} catch (Exception $e) {
		$output["success"] = false;
		$output["failure"] = true;
		$output["message"] = $output["message"] . "Errore invio email:" . $mail->ErrorInfo . ' ' .$e->getMessage() . ' ' . $To . CRLF ;
	}
	
	if ($SaveToSent && $result){
		//$mail->copyToFolder(); // Will save into inbox
		$mail->copyToFolder("Sent"); // Will save into Sent folder
	}
	return $output["success"];
}

function WFMailReceive($FolderLocal, $imaplogin = '', $imappassword = '', $imapserver = '', $imapfolder = 'INBOX', $imapport = '143', $imapsecure = '/imap/tls/novalidate-cert', 
						$emailSender = '', $emailObject = '', $attachFilter = '', $deleteReaded = false){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDevTMP;
	global $ExtJSDevWWW;
	global $ExtJSDB;
	global $debugmessage;
	
	WFSendLOG("WFMailReceive", "Local:" . $FolderLocal . " Remote:" . $imapfolder . " server:" . $imapserver . " port:"  . $imapport . ' login:' . $imaplogin . ' pwd:' . $imappassword . ' secure:' . $imapsecure);
	
	
	if (is_array($output) && !array_key_exists("message",$output)){ $output["message"] = '';}
	if (is_array($output) && !array_key_exists("messagedebug",$output)){ $output["messagedebug"] = '';}
	
	$result = 'true';
	$inserted = 0;
	$existed = 0;
	$deleted = 0;
	
	$olddir = getcwd();
	chdir($FolderLocal);
	
	//IMPORT FROM IMAP
	set_time_limit(3000); 
	
	require_once dirname(__FILE__) . '/PHPImap/Mailbox.php';
	require_once dirname(__FILE__) . '/PHPImap/IncomingMail.php';
	require_once dirname(__FILE__) . '/PHPImap/rfc822_addresses.php';
	require_once dirname(__FILE__) . '/PHPImap/mime_parser.php';
	//https://github.com/barbushin/php-imap
	try {
		$mailbox = new PhpImap\Mailbox('{'. $imapserver . ':' . $imapport  .$imapsecure .'}' . $imapfolder , $imaplogin, $imappassword, $FolderLocal);
		//imap_sort($imap, SORTDATE, 1);
		//$mailsIds = $mailbox->searchMailbox('ALL');
	} catch (exception $e){
		WFRaiseError(0, $e->getMessage(), 'WFMailReceive', '');
		goto WFMailReceiveFine;
	}
	//$mailbox = new PhpImap\Mailbox('{imap.gmail.com:993/imap/ssl}INBOX', 'some@gmail.com', '*********', __DIR__);
	//$mailbox->attachmentsDir(dirname(__FILE__) . '/PHPImap/tmp/');
	//$overallMessages = $mailbox->countMails();
	
	if ($emailSender != ''){
		$mailsIds = $mailbox->searchMailbox('FROM "' . $emailSender . '"', SE_UID);
	}
	if ($emailObject != ''){
		$mailsIds = $mailbox->searchMailbox('OBJECT "' . $emailObject . '"', SE_UID);
	}
	
		// Read all messaged into an array:
		if ($deleteReaded){
			$mailsIds = $mailbox->sortMails( SORTARRIVAL, true, 'ALL');
		}else{
			//ONLY NEW MESSAGE
			$mailsIds = $mailbox->sortMails( SORTARRIVAL, true, 'UNSEEN');
		}
	if($mailsIds) {
		//rsort($mailsIds);
		for ($i =0; $i < count($mailsIds); $i++) {
		
			$mail = $mailbox->getMail($mailsIds[$i]);
			$mailHeader = $mailbox->getMailHeader($mailsIds[$i]);
			$mailDateTime = $mailHeader->receiveddatetime;
			$mailSender = $mailHeader->fromAddress;
			$mailSubject = StringAZ09Special($mailHeader->subject);
			$allegatoPresente = false;
			if (isset($mailHeader->replyTo)){
				foreach ($mailHeader->replyTo as $key => $value){
					$mailSender = $key;
				}
			}
			if ($conn->debug==1) echo('mail' .$mailSender. ' ' .$mailHeader->messageId. BRCRLF);
				
			$trovato= false;
			$mailAttachs = $mail->getAttachments();
			foreach ($mailAttachs as $mailAttach) {
				$mailAttachExt = strtolower(WFFileExt($mailAttach->name));
				$mailAttachNameExt = WFFileNameExt($mailAttach->name);
				$mailAttachRoot = WFFileName($mailAttach->filePath) . '.' . $mailAttachExt;
				
				if ($conn->debug==1) echo('allegato' .$mailAttach->name . BRCRLF);
				
				if ($mailAttachExt == 'eml'){
					//email con allegato EML
					if ($conn->debug==1) echo('EML' .BRCRLF);
					$mime = new mime_parser_class;
					$mime->mbox = 0;
					$mime->decode_bodies = 1;
					$mime->ignore_syntax_errors = 1;
					$mime->track_lines = 1;
					$mime->use_part_file_names = 1;
					$mime->custom_mime_types = array(
														'application/vnd.openxmlformats-officedocument.wordprocessingml.document'=>array(
															'Type' => 'ms-word',
															'Description' => 'Word processing document in Microsoft Office OpenXML format'
														)
													);
					// Save the message body parts to a directory    
					$parameters = array(
											'File'=>$mailAttach->filePath,
											'SaveBody'=>$_SERVER['DOCUMENT_ROOT'] .'/temp',
											'SkipBody'=>1,
										);
					if($mime->Decode($parameters, $decoded)){
						for($message = 0; $message < count($decoded); $message++){
							if($mime->decode_bodies){
								if($mime->Analyze($decoded[$message], $results)){
									//ALLEGATI NORMALI
									for($attachnum = 0; $attachnum < count($results['Attachments']); $attachnum++){		
										//rinomino allegato con nome file univoco
										if (array_key_exists( 'FileName',$results['Attachments'][$attachnum])){		
											$NewFileName = $results['Attachments'][$attachnum]['DataFile'];
											$NewFilePosition = $results['Attachments'][$attachnum]['DataFile'];
											$NewFileName = substr($mailAttach->filePath,0, strripos ($mailAttach->filePath, "_")) ;
											$NewFileName = $NewFileName . "_" . $results['Attachments'][$attachnum]['FileName'] ;
											$mailAttachExt = strtolower(WFFileExt($NewFileNameNewFileName));
										}else{
											unlink( $results['Attachments'][$attachnum]['DataFile']);
										}
									}
									//ALLEGATO NEL BODY
									if (array_key_exists( 'FileName',$results)){unlink($results['FileName']);}
									
									//EML ORIGINALE
									unlink($mailAttach->filePath);
								}
								copy($NewFilePosition, $NewFileName);
								unlink($NewFilePosition);
							}
						}
					}
				}
				
				if ($mailAttachExt != WFFileExt($mailAttach->name)){
					//file con estensione in maiuscolo
					rename ( $mailAttach->filePath , $FolderLocal . WFFileNameExt($mailAttach->filePath)  );
				}
				
				if ($attachFilter != ''){
					if (preg_sql_like($mailAttachNameExt,$attachFilter)){
						$mail = $mailbox->deleteMail($mailsIds[$i]);
						$trovato = true;
					}else{  
						//DELETE 
						unlink($mailAttach->filePath);
					}
				}
			}
			
			//CANCELLO EMAIL
			if ($deleteReaded && $trovato){
				$mail = $mailbox->deleteMail($mailsIds[$i]);
			}
			
			$existed = $existed +1;
			if ($existed > 30){
				break;
			}
		}
	}
	WFMailReceiveFine:
	chdir($olddir);
	
}
function decodeContent($encoding, $message) {
    switch ($encoding) {
        case 0:
        case 1:
            $message = imap_8bit($message);
            break;
        case 2:
            $message = imap_binary($message);
            break;
        case 3:
            $message = imap_base64($message);
            break;
        case 4:
            $message = quoted_printable_decode($message);
            break;
    }
    return $message;
}
/*                   		  FUNC RECEIVE WITH DB	AAAEMAIL */
function WFMailAlign($imaplogin = '', $imappassword = '', $imapserver = '', $imapfolder = 'INBOX', $imapport = '143', $imapsecure = '/imap/tls/novalidate-cert', 
					$emailSender = '', $emailObject = '', $attachFilter = '', $deleteReaded = false, $table = 'fat'){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDevTMP;
	global $ExtJSDevWWW;
	global $ExtJSDB;
	global $debugmessage;
	
	$result = 'true';
	$inserted = 0;
	$existed = 0;
	$deleted = 0;
	WFSendLOG("WFMailAlign", "imaplogin:" . $imaplogin . " imapserver:" . $imapserver . " emailSender:" . $emailSender);
	
	$olddir = getcwd();
	chdir($ExtJSDevTMP);
	
	//IMPORT FROM IMAP
	set_time_limit(3000); 
	
	require_once dirname(__FILE__) . '/PHPImap/Mailbox.php';
	require_once dirname(__FILE__) . '/PHPImap/IncomingMailHeader.php';
	require_once dirname(__FILE__) . '/PHPImap/DataPartInfo.php';
	require_once dirname(__FILE__) . '/PHPImap/IncomingMailAttachment.php';
	require_once dirname(__FILE__) . '/PHPImap/IncomingMail.php';
	require_once dirname(__FILE__) . '/PHPImap/Imap.php';
	//https://github.com/barbushin/php-imap
	try {
		$mailbox = new PhpImap\Mailbox('{'. $imapserver . ':' . $imapport  .$imapsecure .'}' . $imapfolder , 
										$imaplogin, 
										$imappassword, 
										$ExtJSDevTMP,
										'UTF-8', // Server encoding (optional)
										true, // Trim leading/ending whitespaces of IMAP path (optional)
										true // Attachment filename mode (optional; false = random filename; true = original filename
									);
	} catch (exception $e){
		WFRaiseError(0, $e->getMessage(), 'WFAlignMail', '');
		goto EmailAlignFine;
	}
	//$mailbox = new PhpImap\Mailbox('{imap.gmail.com:993/imap/ssl}INBOX', 'some@gmail.com', '*********', __DIR__);
	//$mailbox->attachmentsDir(dirname(__FILE__) . '/PHPImap/tmp/');
	//$overallMessages = $mailbox->countMails();
	if ($emailSender != '')	$mailsIds = $mailbox->searchMailbox('FROM "' . $emailSender . '"', SE_UID);
	if ($emailObject != '')	$mailsIds = $mailbox->searchMailbox('OBJECT "' . $emailObject . '"', SE_UID);
	
	// Read all messaged into an array:
	$mailsIds = $mailbox->sortMails( SORTARRIVAL, true, 'ALL');
	//if ($deleteReaded){
	//	$mailsIds = $mailbox->sortMails( SORTARRIVAL, true, 'ALL');
	//}else{
		//ONLY NEW MESSAGE
	//	$mailsIds = $mailbox->sortMails( SORTARRIVAL, true, 'UNSEEN');
	//}
	if($mailsIds) {
		//rsort($mailsIds);
		for ($i =0; $i < count($mailsIds); $i++) {
			$mail = $mailbox->getMail($mailsIds[$i]);
			$mailHeader = $mailbox->getMailHeader($mailsIds[$i]);
			if ($conn->debug==1) echo('MAIL SENDER:' .$mailSender. ' ID:' .$mailHeader->messageId. BRCRLF);
			$mailDateTime = new DateTime($mailHeader->date);
			$mailSubject = StringAZ09Special($mailHeader->subject);
			$mailSender = $mailHeader->fromAddress;
			if (isset($mailHeader->replyTo)){
				foreach ($mailHeader->replyTo as $key => $value){
					$mailSender = $key;
				}
			}
			if (strrpos($mailSubject, "CONSEGNA:") !== false) continue;
			if (strrpos($mailSubject, "ACCETTAZIONE:") !== false) continue;
			
			$sqlLay = "SELECT * 
						FROM " . $ExtJSDevDB . "email 
						WHERE IMAPACCOUNT = '". $imaplogin . "' 
							AND IMAPSENDER = '".  $mailSender . "' 
							AND IMAPSUBJECT = '". $mailSubject . "' ";
			if ($mailDateTime != null) $sqlLay = $sqlLay . " AND IMAPDATETIME = ". WFSQLTODATETIME($mailDateTime->format('Y-m-d H:i:00'));
			if ($mailHeader->messageId != '') $sqlLay = $sqlLay . " AND IMAPUID = '" . $mailHeader->messageId . "'";
			$rs = $conn->Execute($sqlLay);
			if (($rs) && ($rs->RecordCount()==0)) {
				$mailAttachs = $mail->getAttachments();
				foreach ($mailAttachs as $mailAttach) {
					$mailAttachExt = strtolower(WFFileExt($mailAttach->name));
					$mailAttachFileName =   WFFileName($mailAttach->name) . '.' . $mailAttachExt;
					$mailAttachFileNameComplete = $ExtJSDevTMP . $mailAttachFileName;
					$mailAttach->setFilePath($mailAttachFileNameComplete);
					$mailAttach->saveToDisk();
					WFADDEmailFileDOC($imaplogin,$mailSender, $mailHeader->messageId, $mailDateTime, $mailSubject, substr($mail->textPlain, 0, 200),  $mailAttachFileNameComplete);
				}
				$rs->close();
			}
			else{
				//readed email just exist
				$mailAttachs = $mail->getAttachments();
				foreach ($mailAttachs as $mailAttach) {
					//DELETE 
					unlink($mailAttach->filePath);
				}
			}
			
			//CANCELLO EMAIL
			if ($deleteReaded){
				//$mail = $mailbox->deleteMail($mailsIds[$i]);
			}

			//max email just exist in db
			$existed = $existed +1;
			if ($existed > 20){
				break;
			}
		}
	}
	
	$output["message"] = $output["message"] . "Inserted: "  . $inserted . BRCRLF;
	$output["success"] = true;
	EmailAlignFine:
	chdir($olddir);
	
}
function WFADDEmailFileDOC($imaplogin = '',$mailSender = '', $mailID = '',$mailDateTime , $mailSubject = '', $mailBody= '',  $mailAttachFileNameComplete = ''){
	if ($conn->debug==1) echo(BRCRLF . '<b>WFADDEmailFileDOC:</b>:' .$file . BRCRLF);
	global $ExtJSDevTMP;
	global $ExtJSDevDB;
	global $conn;
	$mailAttachExt = strtolower(WFFileExt($mailAttachFileNameComplete));
	$mailAttachFileName =   WFFileName($mailAttachFileNameComplete) . '.' . $mailAttachExt;

	$AppoRecord = array();
	$AppoRecord['IMAPACCOUNT'] = $imaplogin;
	$AppoRecord['IMAPSENDER'] = $mailSender;
	$AppoRecord['IMAPUID'] = $mailID;
	$AppoRecord['IMAPDATE'] = $mailDateTime->format('Y-m-d');
	$AppoRecord['IMAPDATETIME'] = $mailDateTime->format('Y-m-d H:i:00');
	$AppoRecord['IMAPSUBJECT'] = $mailSubject;
	$AppoRecord['IMAPBODY'] = substr($mailBody, 0, 200);
	$AppoRecord['IMAPATTACH'] = null;
	$AppoRecord['IMAPATTACHNAME'] = null;
	$AppoRecord['IMAPATTACHEXT'] = null;
	$AppoRecord['ESCLUDI'] = 0;
	$AppoRecord['CT_TABLE'] = null;
	$AppoRecord['CT_ANAGRAFICHE'] = null;

	//converti ricorsiva con allegato EML
	if ($mailAttachExt == 'eml'){
		$mbox = imap_open($mailAttachFileName, '', '');
		$structure = imap_fetchstructure($mbox, 1);
		if(isset($structure->parts) && count($structure->parts)) {
			for($i = 0; $i < count($structure->parts); $i++) {
				$part = $structure->parts[$i];
				if ($part->ifdisposition && $part->disposition == "ATTACHMENT") {
					$message = imap_fetchbody($mbox, 1, $i + 1);
					$message = decodeContent($part->encoding, $message);
					$mailAttachExt = strtolower(WFFileExt($part->dparameters[0]->value));
					$$mailAttachFileName = WFFileName($part->dparameters[0]->value) . '.' . $mailAttachExt;
					$mailAttachFileNameComplete = $ExtJSDevTMP . $mailAttachFileName;
					file_put_contents($mailAttachFileNameComplete, $emlAttachment->getData());
					FADDEmailFileDOC($imaplogin,$mailSender , $mailID ,$mailDateTime , $mailSubject, $mailBody,  $mailAttachFileNameComplete);
				}
			}
		}
		imap_close($mbox);
		unlink($mailAttachFileName);
		return;
	}
	
	//converti allegato p7m
	if ($mailAttachExt == 'p7m'){
		if ($conn->debug==1) echo('P7M:'  . BRCRLF);
		
		try {	
			$result = WFFileNameExt(P7MExtractXML($mailAttachFileNameComplete));
			if ($result){
				if ($conn->debug==1) echo('p7m CONVERTITO' . $mailAttachFileName .BRCRLF);
				unlink($mailAttachFileNameComplete);			
				$mailAttachExt = strtolower(WFFileExt($result));
				$mailAttachFileName =   WFFileName($result) . '.' . $mailAttachExt;
				$mailAttachFileNameComplete = $ExtJSDevTMP . $mailAttachFileName;	
			}
			else{
				if ($conn->debug==1) echo('p7m ERRORE B CONVERSIONE' . $mailAttach->name .BRCRLF);
				$output["message"] = $output["message"] . "Errore Fail P7MDecoder: " . $mailAttach->filePath . '  ->  ' . $mailAttach->name . BRCRLF;
			}
		}catch (Exception $e) {
			$output["message"] = $output["message"] . 'ERROR ALIGNEMAIL P7M ' .  $e->getMessage();
		}
	}


	//email con allegato xml
	if ($mailAttachExt == 'xml'){
		if ($conn->debug==1) echo('XML:' .BRCRLF);
		$AppoRecord['ESCLUDI'] = 0;
		$AppoRecord['CT_TABLE'] = 'fat';
		if ($mailAttachFileName == 'daticert.xml') return;
	}
	//email con allegato pdf
	elseif ($mailAttachExt == 'pdf'){
		if ($conn->debug==1) echo('PDF:' .BRCRLF);
		$AppoRecord['ESCLUDI'] = 0;
		$AppoRecord['CT_TABLE'] = 'fat';
	}
	//email con allegato non riconosciuto
	else{
		if ($conn->debug==1) echo('DELETE:' .$mailAttachFileNameComplete .BRCRLF);
		if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'deleted :' .$mailAttachFileNameComplete . BRCRLF;
		unlink($mailAttachFileNameComplete);
		return;
	}

	//ADD NEW FILE
	try {	
		$AppoRecord['IMAPATTACH'] = $mailAttachFileName;
		$AppoRecord['IMAPATTACHNAME'] = $mailAttachFileName;
		$AppoRecord['IMAPATTACHEXT'] = $mailAttachExt;
		$conn->AutoExecute($ExtJSDevDB . "email", $AppoRecord, 'INSERT');
		$inserted = $inserted +1;
	}catch (Exception $e) {
		$output["message"] = $output["message"] . 'ERROR ALIGNEMAIL ' .  $e->getMessage()  . 'allegato xml';
		if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'ERRORE include ext:' .$mailAttachExt . " file:" . $AppoRecord['IMAPATTACHNAME'] . BRCRLF;
	}
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'include ext:' .$mailAttachExt . " file:" . $AppoRecord['IMAPATTACHNAME'] . BRCRLF;

}


function WFFolderAlign($folder, $table = 'fat'){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDevTMP;
	global $ExtJSDevWWW;
	global $ExtJSDB;
	
	if (is_array($output) && !array_key_exists("message",$output)){ $output["message"] = '';}
	if (is_array($output) && !array_key_exists("messagedebug",$output)){ $output["messagedebug"] = '';}
	
	$result = 'true';
	$inserted = 0;
	$existed = 0;
	$deleted = 0;
	WFSendLOG("WFFolderAlign", "folder:" . $folder );
	
	$olddir = getcwd();
	chdir($ExtJSDevTMP);
	
	if ($conn->debug==1) echo('ALIGN FILE WITHOUT RECORD  ' . BRCRLF); 
	chdir($folder);
	$dirIN = glob($folder . '*.*', GLOB_BRACE);
	$i = 0;
	if ($conn->debug==1){ echo('folder ' . $folder . BRCRLF); var_dump($dirIN);}
	
	foreach ($dirIN as $key => $FileINName){
		$i = $i +1;
		if ($conn->debug==1) echo('FILE ' . $FileINName . BRCRLF); 
		
		
		$AppoRecord = array();
		$AppoRecord['IMAPACCOUNT'] = 'folder';
		$AppoRecord['IMAPSENDER'] = 'folder';
		$AppoRecord['IMAPUID'] = 'folder';
		$date = new DateTime();
		$AppoRecord['IMAPDATE'] = $date->getTimestamp(); 
		$AppoRecord['IMAPDATETIME'] = $date->getTimestamp();
		$AppoRecord['IMAPATTACH'] = '';
		$AppoRecord['IMAPATTACHNAME'] = '';
		$AppoRecord['IMAPSUBJECT'] = 'folder';
		$AppoRecord['IMAPBODY'] = '';
		
		$mailAttachExt = strtolower(WFFileExt($FileINName));
		$AppoRecord['IMAPATTACHNAME'] = WFFileName($FileINName) . '.' . $mailAttachExt;
		$AppoRecord['IMAPATTACH'] = WFFileName($FileINName) . '.' . $mailAttachExt;
		$AppoRecord['IMAPATTACHEXT'] = $mailAttachExt;
		$AppoRecord['ESCLUDI'] = 0;
		$AppoRecord['CT_TABLE'] = $table;
		$AppoRecord['CT_ANAGRAFICHE'] = null;
		
		$mailAttachExt = strtolower(WFFileExt($FileINName));
		if ($conn->debug==1) echo('allegato' .$FileINName. BRCRLF);
		if ($AppoRecord['IMAPATTACHNAME']  == 'daticert.xml') $mailAttachExt = 'old';
		
		
		if ($mailAttachExt == 'p7m'){
			//conversione file in xml
			if ($conn->debug==1) echo('p7m ' . $FileINName .BRCRLF);
			$result = WFFileNameExt(P7MExtractXML($FileINName));
			if ($result ){
				$AppoRecord['IMAPATTACH'] = $result;
				if ($conn->debug==1) echo('p7m CONVERTITO' . $AppoRecord['IMAPATTACH'] .BRCRLF);
				$AppoRecord['IMAPATTACHNAME'] = substr($AppoRecord['IMAPATTACHNAME'],0,-4); 
				$AppoRecord['IMAPATTACHEXT'] = 'xml';
				unlink($FileINName);
			}
			else{
				if ($conn->debug==1) echo('p7m ERRORE A CONVERSIONE' . $FileINName .BRCRLF);
				$output["message"] = $output["message"] . 'Errore Fail P7MDecoder: ' . $FileINName . BRCRLF;
				
			}
				
			$FileINName = $AppoRecord['IMAPATTACH'];
			$mailAttachExt = strtolower(WFFileExt($FileINName));
			$AppoRecord['IMAPATTACHNAME'] = WFFileName($FileINName) . '.' . $mailAttachExt;
			$AppoRecord['IMAPATTACH'] = WFFileName($FileINName) . '.' . $mailAttachExt;
			$AppoRecord['IMAPATTACHEXT'] = $mailAttachExt;
			if ($conn->debug==1) echo('p7m CONVERTITO' . $AppoRecord['IMAPATTACH'] .BRCRLF);
			
			$output["messagedebug"] = $output["messagedebug"] . 'include ext:' .$mailAttachExt . " file:" . $AppoRecord['IMAPATTACHNAME'] . BRCRLF;
			
			//copia file nella cartella temporanea per l'import 
			//nn ce bisogno la decode p7m lo mette gia li
			
			//copia file nella cartella old
			copy($FileINName , 'old/' . WFFileNameExt($FileINName));
			
			try {
				$conn->AutoExecute($ExtJSDevDB . "email", $AppoRecord, 'INSERT');
			} catch (Exception $e) {
				// adodb_backtrace($e->gettrace()); 
				$output["messagedebug"] = $output["messagedebug"] . 'ERRORE ' . $e . ' include ext:' .$mailAttachExt . " file:" . $AppoRecord['IMAPATTACHNAME'] . BRCRLF;
			}
			$inserted = $inserted +1;
			
		

		}elseif (($mailAttachExt == 'xml') || ($mailAttachExt == 'csv')){
			//email con allegato normale
			if ($conn->debug==1) echo('xml' .BRCRLF);
			
			//file con estensione in maiuscolo
			if ($mailAttachExt != WFFileExt($FileINName)){
				rename ( $FileINName , $AppoRecord['IMAPATTACH']  );
				$FileINName = $AppoRecord['IMAPATTACH'];
			}
			$output["messagedebug"] = $output["messagedebug"] . 'include ext:' .$mailAttachExt . " file:" . $AppoRecord['IMAPATTACHNAME'] . BRCRLF;
			
			//copia file nella cartella temporanea per l'import 
			if (copy($FileINName , $ExtJSDevTMP . WFFileNameExt($FileINName))) {
				copy($FileINName , 'old/' . WFFileNameExt($FileINName));
				unlink($FileINName);
				
				try {
					$conn->AutoExecute($ExtJSDevDB . "email", $AppoRecord, 'INSERT');
				}catch (Exception $e) {
					$output["messagedebug"] = $output["messagedebug"] . 'ERRORE include ext:' .$mailAttachExt . " file:" . $AppoRecord['IMAPATTACHNAME'] . BRCRLF;
				}
				$inserted = $inserted +1;
			}else{
				$output["message"] = $output["message"] . ' orig' . $FileINName . ' dest' . $ExtJSDevTMP . $FileINName .BRCRLF ; 
			}
		}else{
			//email con allegato non riconosciuto
			if ($conn->debug==1) echo('ND ' . $mailAttachExt . BRCRLF);
			//DELETE 
			if ($conn->debug==1) echo('DELETE' .$mailAttachExt .BRCRLF);
			unlink($FileINName);
			$output["messagedebug"] = $output["messagedebug"] . 'exclude ext:' .$mailAttachExt . " file:" . $AppoRecord['IMAPATTACHNAME'] . BRCRLF;
		}
		
		
		WFMailAlignEsalta:
		
		$existed = $existed +1;
	}
	
	$output["message"] = $output["message"] . "Iserted: "  . $inserted . BRCRLF . $output["messagedebug"];
	$output["success"] = true;
	WFFolderAlignFine:
	chdir($olddir);
	
}

function WFFolderCleanUp($folder, $type = null){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDevTMP;
	global $ExtJSDevWWW;
	global $ExtJSDB;
	
	if (is_array($output) && !array_key_exists("message",$output)){ $output["message"] = '';}
	if (is_array($output) && !array_key_exists("messagedebug",$output)){ $output["messagedebug"] = '';}
	
	$result = 'true';
	$inserted = 0;
	$existed = 0;
	$deleted = 0;
	WFSendLOG("WFFolderCleanUp", "folder:" . $folder );
	
	$olddir = getcwd();
	chdir($ExtJSDevTMP);
	
	//CLEAN FILE FROM temp WITHOUT RECORD 
	if ($conn->debug==1) echo('CLEAN FILE FROM temp WITHOUT RECORD  ' . BRCRLF); 
	$dirIN = glob($ExtJSDevTMP . '*.*', GLOB_BRACE);
	$i = 0;
	foreach ($dirIN as $key => $FileINName){
		//DOCUMENTI BUONI
		$sql = "SELECT * 
				FROM " . $ExtJSDevDB . "email 
				WHERE IMAPATTACH = '" . WFFileName($FileINName) . '.' . strtolower(WFFileExt($FileINName))  . "' ";
		$RsEmail = $conn->Execute($sql);
		if ($RsEmail->RecordCount() == 0){
			unlink($FileINName);
			$deleted = $deleted + 1;
		}
		$RsEmail->close();
	}
	
		
	//CLEAN RECORD WITHOUT FILE IN TEMP
	if ($conn->debug==1) echo('CLEAN RECORD WITHOUT FILE IN TEMP ' . BRCRLF); 
	$sql = "SELECT * 
			FROM " . $ExtJSDevDB . "email ";
		//	WHERE (ESCLUDI = 0)";	
	$RsEmail = $conn->Execute($sql);
	while (!$RsEmail->EOF) {
		if (!file_exists($ExtJSDevTMP . $RsEmail->fields['IMAPATTACH'])){
			$sql = "DELETE FROM " . $ExtJSDevDB . "email 
					WHERE ID = '" . $RsEmail->fields['ID'] . "' 
						AND VARPOSA IS  NULL
						AND VARPOSB IS  NULL
						AND VARPOSC IS  NULL
						AND VARPOSD IS  NULL
						AND VARPOSA IS  NULL
						AND VARPOSDOCDATA IS  NULL
						AND CT_ID IS NULL
					";
			$conn->Execute($sql);
			$deleted = $deleted + 1;
		}
		$RsEmail->MoveNext();
	}
	$RsEmail->close();
	
	chdir($olddir);
}


/************************************************************************************/
/*                   		  FUNC FTP    		 									*/
/************************************************************************************/
function WFFTPSend   ($File = '',        $ftpFolderFile = '',       $ftpLogin = '', $ftpPassword = '', $ftpServer = '', $ftpPort = 21){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDB;
	global $UserId;
	$result = 'true';
	WFSendLOG("WFFTPSend", "File:" . $File . "  ftpFserver:" . $ftpServer . ":" . $ftpPort);
	
	if ($ftpPort != '21'){
		$myftpconn = ssh2_connect($ftpServer, $ftpPort);
		if (!$myftpconn){ 
			$output["success"] = false;
			$output["failure"] = true;
			$output["message"] = $output["message"] . "Connessione FTP SSL SERVER KO"  . BRCRLF ;
			WFSendLOG("WFFTPSend", "Error: Connessione FTP SSL SERVER KO" );
			return;
		} else{
			WFSendLOG("WFFTPSend", "Inform: Connessione FTP SERVER OK" );
		}
	}
	else{
		$myftpconn = ftp_connect($ftpServer, $ftpPort);
		if (!$myftpconn){ 
			$output["success"] = false;
			$output["failure"] = true;
			$output["message"] = $output["message"] . "Connessione FTP SERVER KO"  . BRCRLF ;
			WFSendLOG("WFFTPSend", "Error: Connessione FTP SERVER KO" );
			return;
		} else{
			WFSendLOG("WFFTPSend", "Inform: Connessione FTP SERVER OK" );
		}
	}
	//ftp_pasv($myftpconn, true);
	//ftp_chdir($myftpconn, $match[5]);
	// controlliamo se la connessione è OK...
	
	if ($ftpPort != '21'){
		echo( "Connessione FTP Login:" . $ftpLogin . ' Pwd:' . $ftpPassword . BRCRLF );
		ssh2_auth_password($myftpconn, $ftpLogin, $ftpPassword);
		$mylogin = ssh2_sftp($myftpconn);
	}
	else{
		$mylogin = ftp_login($myftpconn, $ftpLogin, $ftpPassword);
		
	}
	if (!$mylogin){ 
		WFSendLOG("WFFTPSend", "Error: Connessione FTP LOGIN KO:" . $ftpLogin);
		$output["message"] = $output["message"] . "Connessione FTP LOGIN KO Login:" . $ftpLogin . ' Pwd:' . $ftpPassword . BRCRLF ;
		$output["success"] = false;
		$output["failure"] = true;
		throw new Exception("Could not open remote file: $file");
		return;
	}
		
	if ($ftpPort != '21'){
		
	}
	else{
		ftp_set_option($myftpconn, FTP_TIMEOUT_SEC, 10);
		ftp_set_option($myftpconn, FTP_USEPASVADDRESS, false);
		ftp_pasv($myftpconn, true);
		WFSendLOG("WFFTPSend", "Connessione: FTP");
		ftp_chdir($myftpconn, $ftpFolderFile);
		WFSendLOG("WFFTPSend", "ChDir FTP" . $ftpFolderFile);
	}
	
	$FileToAttachDebug = "";
	$File = $File . ',';
	$FileArray = explode(',',$File);
	$FileArray = array_unique($FileArray);
	foreach($FileArray as $key) { 
		$key = trim($key);
		if ($key != ''){
			WFSendLOG("WFFTPSend", "Invio file FTP Start " . $key);
			$name  = WFFileNameExt($key);
			$FileToAttachDebug = $FileToAttachDebug .'key' . $key . '  name' . $name . BRCRLF;
			if ($ftpPort != '21'){
				$sftpStream = fopen('ssh2.sftp://' . intval($mylogin) . $ftpFolderFile . '/' .$name, 'w');
				if (!$sftpStream) {
					WFSendLOG("WFFTPSend", "Error: Could not open remote file" . $name);
					$output["success"] = true;
					$output["failure"] = false;
					throw new Exception("Could not open remote file: $name");
				}
				$data_to_send = @file_get_contents($key);
				if ($data_to_send === false) {
					WFSendLOG("WFFTPSend", "Error: Could not open local file" . $name);
					$output["success"] = true;
					$output["failure"] = false;
					throw new Exception("Error: Could not open local file: $name.");
				}
				if (@fwrite($sftpStream, $data_to_send) === false) {
					WFSendLOG("WFFTPSend", "Error:  Could not send data from file" . $name);
					$output["success"] = true;
					$output["failure"] = false;
					throw new Exception("Error: Could not send data from file: $name.");
				}
				else{
					WFSendLOG("WFFTPSend", "Inform: Invio file FTP" . $name);
					$output["success"] = true;
					$output["failure"] = false;
				}
			}
			else{
				$upload = ftp_put($myftpconn, $name, $name, FTP_BINARY);
				if (!$upload){ 
					$output["success"] = false;
					$output["failure"] = true;
					$output["message"] = $output["message"] . "Invio File fallito:" . $key  . ' in dir ' . $ftpFolderFile . BRCRLF ;
					WFSendLOG("WFFTPSend", "Error: Invio file FTP" . $File);
				}else{
					WFSendLOG("WFFTPSend", "Inform: Invio file FTP" . $File);
					$output["success"] = true;
					$output["failure"] = false;
				}
			}
		}
	}
	if ($ftpPort != '21'){
		fclose($sftpStream);
		WFSendLOG("WFFTPSend", "Inform: Close SSL file FTP" . $name);
	}
	else{
		ftp_quit($myftpconn); 
		WFSendLOG("WFFTPSend", "Inform: Close file FTP" . $name);
	}
	
	return $output["success"];
}
function WFFTPReceive($FolderLocal = '', $ftpFolderRemoteFile = '', $ftpLogin = '', $ftpPassword = '', $ftpServer = '', $ftpPort = 21){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDB;
	global $UserId;
	$result = 'true';
	WFSendLOG("WFFTPReceive", "Inform: FolderRemote Local:" . $FolderLocal . " Remote:" . $ftpFolderRemoteFile . " server:" . $ftpServer . ' login:' . $ftpLogin . ' pwd:' . $ftpPassword);
	
	if ($ftpPort != '21'){
		$myftpconn = ssh2_connect($ftpServer, $ftpPort);
		if (!$myftpconn){ 
			$output["success"] = false;
			$output["failure"] = true;
			$output["message"] = $output["message"] . "Connessione FTP SSL SERVER KO"  . BRCRLF ;
			WFSendLOG("WFFTPSend", "Error: Connessione FTP SSL SERVER KO" );
			return;
		} else{
			WFSendLOG("WFFTPSend", "Inform: Connessione FTP SERVER OK" );
		}
	}else{
		$myftpconn = ftp_connect($ftpServer, $ftpPort);
		if (!$myftpconn){ 
			$output["success"] = false;
			$output["failure"] = true;
			$output["message"] = $output["message"] . "Connessione FTP SERVER KO"  . BRCRLF ;
			WFSendLOG("WFFTPSend", "Error: Connessione FTP SERVER KO" );
			return;
		} else{
			WFSendLOG("WFFTPSend", "Inform: Connessione FTP SERVER OK" );
		}
	}
	//ftp_pasv($myftpconn, true);
	//ftp_chdir($myftpconn, $match[5]);
	// controlliamo se la connessione è OK...
	
	if ($ftpPort != '21'){
		if ($conn->debug==1) echo( "Connessione FTP SSL Login:" . $ftpLogin . ' Pwd:' . $ftpPassword . BRCRLF );
		ssh2_auth_password($myftpconn, $ftpLogin, $ftpPassword);
		$mylogin = ssh2_sftp($myftpconn);
	}else{
		if ($conn->debug==1) echo( "Connessione FTP Login:" . $ftpLogin . ' Pwd:' . $ftpPassword . BRCRLF );
		$mylogin = ftp_login($myftpconn, $ftpLogin, $ftpPassword);
		
	}
	if (!$mylogin){ 
		WFSendLOG("WFFTPSend", "Error: Connessione FTP LOGIN KO:" . $ftpLogin);
		$output["message"] = $output["message"] . "Connessione FTP LOGIN KO Login:" . $ftpLogin . ' Pwd:' . $ftpPassword . BRCRLF ;
		$output["success"] = false;
		$output["failure"] = true;
		throw new Exception("Could not open remote file: $file");
		return;
	}
		
	if ($ftpPort != '21'){
		
	}else{
		ftp_set_option($myftpconn, FTP_TIMEOUT_SEC, 10);
		ftp_set_option($myftpconn, FTP_USEPASVADDRESS, false);
		ftp_pasv($myftpconn, true);
	}
	
	//ftp_pasv($myftpconn, true);
	//ftp_chdir($myftpconn, $match[5]);
	// controlliamo se la connessione è OK...
	
	
	if ($ftpPort != '21'){
		$handle = opendir('ssh2.sftp://' . intval($mylogin) . '/'. $ftpFolderRemoteFile);
		while (false != ($file = readdir($handle))){
			
			if ($conn->debug==1) echo( "Read File" . $file  . BRCRLF );
			if (($file != '.') && ($file != '..')){
				if ($conn->debug==1) echo( "Download File" . $file  . BRCRLF );
				$sftpStream = fopen('ssh2.sftp://' . intval($mylogin) . '/'. $ftpFolderRemoteFile . '/'. $file, 'r');
				if (!$sftpStream) {
					WFSendLOG("WFFTPReceive", "Error: Could not open remote file" . $name);
					$output["success"] = true;
					$output["failure"] = false;
					throw new Exception("Could not open remote file: $name");
				}
				
				$local = fopen($FolderLocal . WFFileNameExt ($file), "w");
				if ($local === false) {
					WFSendLOG("WFFTPReceive", "Error: Could not open local file" . $name);
					$output["success"] = true;
					$output["failure"] = false;
					throw new Exception("Error: Could not open local file: $name.");
				}
				
				$read = 0; 
				$filesize = filesize('ssh2.sftp://' . intval($mylogin) . '/'. $ftpFolderRemoteFile . '/'. $file);
				if ($conn->debug==1) echo( "FileSize" . $filesize  . BRCRLF );
				if ($filesize === false) {
					WFSendLOG("WFFTPReceive", "Error:  Could not send data from file" . $name);
					$output["success"] = true;
					$output["failure"] = false;
					throw new Exception("Error: Could not filesize data from file: $name.");
				}
				while ($read < $filesize && ($buffer = fread($sftpStream, $filesize - $read))) {
					$read += strlen($buffer); 
					fwrite($local, $buffer); 
				} 
				fclose($local); 
				fclose($sftpStream);
				
				if(($filesize >0) && ($read >0)){
					ssh2_sftp_unlink($myftpconn, $file);
					WFSendLOG("WFFTPReceive", "Inform: cancello file SSL FTP " . $file);
				}
				
				WFSendLOG("WFFTPReceive", "Inform: Invio file FTP" . $name);
				$output["success"] = true;
				$output["failure"] = false;
			}
		}
				
	}else{
			
		$files = ftp_nlist($myftpconn, $ftpFolderRemoteFile);
		if (is_array($files) || is_object($files)){
			if ($conn->debug==1) echo( "Read File" . $file  . BRCRLF );
			WFSendLOG("WFFTPReceive", "Inform: Read Dir " . var_dumpToString($files));
			for ($i = 0; $i < count($files); $i++) {
				$file = $files[$i];
				if ($conn->debug==1) echo( "Download File" . $file  . BRCRLF );
				//$localFile = tempnam(sys_get_temp_dir(), 'ftp_in');
				if (!ftp_get($myftpconn, $FolderLocal . WFFileNameExt ($file), $file, FTP_BINARY)){
					$output["success"] = false;
					$output["failure"] = true;
					$output["message"] = $output["message"] . "Error: scarico file FTP " . $FolderLocal . WFFileNameExt ($file) . BRCRLF ;
					WFSendLOG("WFFTPReceive", "Error: scarico file FTP" . $file);
				}
				else{
					ftp_delete($myftpconn, $file);
					WFSendLOG("WFFTPReceive", "Inform: cancello file FTP " . $file);
				}
			}
		}else{
			// NO FILE
			WFSendLOG("WFFTPReceive", "Warning: NO file on FTP remotedir:" . $ftpFolderRemoteFile);
			WFSendLOG("WFFTPReceive", "Warning: debug:" . var_dumpToString($files));
			$output["message"] = $output["message"] . "Warning: No file FTP remotedir:" . $ftpFolderRemoteFile . BRCRLF ;
		}
	}
	
	
	if ($ftpPort != '21'){
		fclose($sftpStream);
	}else{
		ftp_quit($myftpconn); 
	}
}

/************************************************************************************/
/*                   		  FUNC URL    		 									*/
/************************************************************************************/
function WFURLCall($req_url, $fileDest = null){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDevTMP;
	global $ExtJSDevLOG;
	
	$result = file_get_contents($req_url);
	if($fileDest) {
		$olddir = getcwd();
		chdir($ExtJSDevTMP);
		if ($conn->debug==1)file_put_contents($ExtJSDevLOG . "URL.txt","START" . $fileDest . "\n", FILE_APPEND);
		
		$nomeEstratto = $ExtJSDevTMP . basename(substr($fileDest,0,-4));
		
		if(!file_put_contents( $nomeEstratto, result)) {
			echo "File downloading failed.";
		}
		
		chdir($olddir);
		return $nomeEstratto;
	} else {
		$output['message'] = $req_url.' -> '.$result;
		$output['success'] = true;
	}
}
function WFWEBVar(){
	global $conn;
	global $output;
	global $debugmessage;
	
	if ($conn->debug==1) echo('WFWEBVar'. BRCRLF);
	//POST 
	$record = array();
	foreach($_POST as $key => $value){	
		if ($value == 'true') $value = 1;
		if ($value == 'false') $value = 0;
		if ($value == 'on') $value = 1;
		if ($value == 'off') $value = 0;
		if ($value == 'vero') $value = 1;
		if ($value == 'falso') $value = 0;
		if ($value == 'si') $value = 1;
		if ($value == 'no') $value = 0;
		if ($key == 'data') $value ='';
		if (($key != 'id') && ($key != 'registrationid') && ($key != 'valueField')  && ($key != 'layoutid') && ($key != 'userid')) {
			$record[strtoupper($key)] = $value; 
			if ($record[strtoupper($key)] == '') $record[strtoupper($key)] = null;
		}
		WFSendLOG("DataWrite:","POST-" .$key . "=" . $value );
	}
	//GET
	foreach($_GET as $key => $value){
		if ($value == 'true') $value = 1;
		if ($value == 'false') $value = 0;
		if ($value == 'on') $value = 1;
		if ($value == 'off') $value = 0;
		if ($value == 'vero') $value = 1;
		if ($value == 'falso') $value = 0;
		if ($value == 'si') $value = 1;
		if ($value == 'no') $value = 0;
		if ($key == 'data') $value ='';
		if (($key != 'id') && ($key != 'registrationid') && ($key != 'valueField')  && ($key != 'layoutid') && ($key != 'userid')) {
			$record[strtoupper($key)] = $value; 
			if ($record[strtoupper($key)] == '') $record[strtoupper($key)] = null;
		}
		WFSendLOG("DataWrite:","GET-" .$key . "=" . $value );
	}
	//INPUT
	$queryString = file_get_contents('php://input');
	if($debugmessage) file_put_contents($ExtJSDevArchive . "log/logDataWrite.txt", $queryString, FILE_APPEND);
	$data = array();
	foreach($data as $key => $value){
		if ($value == 'true') $value = 1;
		if ($value == 'false') $value = 0;
		if ($value == 'on') $value = 1;
		if ($value == 'off') $value = 0;
		if ($value == 'vero') $value = 1;
		if ($value == 'falso') $value = 0;
		if ($value == 'si') $value = 1;
		if ($value == 'no') $value = 0;
		if ($key == 'data') $value ='';
		if (($key != 'id') && ($key != 'registrationid') && ($key != 'valueField')  && ($key != 'layoutid') && ($key != 'userid')) {
			//if (!array_key_exists($key, $record)){
				$record[strtoupper($key)] = $value; 
				if ($record[strtoupper($key)] == '') $record[strtoupper($key)] = null;
			//}
		}
		WFSendLOG("DataWrite:","GET-" .$key . "=" . $value );
	}
	//RAW
	$jsonstr = '';
	if (isset($HTTP_RAW_POST_DATA)) $jsonstr = $HTTP_RAW_POST_DATA;
	if (isJson($jsonstr)) {
		$json = array();
		$jsondata = array();
		$json = json_decode($jsonstr, true);
		$jsondata = $json['data'];
		foreach($jsondata as $key => $value){
			if ($value == 'true') $value = 1;
			if ($value == 'false') $value = 0;
			if ($value == 'on') $value = 1;
			if ($value == 'off') $value = 0;
			if ($value == 'vero') $value = 1;
			if ($value == 'falso') $value = 0;
			if ($value == 'si') $value = 1;
			if ($value == 'no') $value = 0;
			if ($key != $datasourcefield) {
				$record[strtoupper($key)] = $value; 
				if ($record[strtoupper($key)] == '') $record[strtoupper($key)] = null;
			}
			WFSendLOG("DataWrite:","RAW-" .$key . "=" . $value );
		}
	}
	//_FILES
	$output["debugfile"] =  "";
	foreach($_FILES as $key => $value){
		WFSendLOG("DataWrite:","FILES-" .$key  );
		if ($_FILES[$key]['error'] == UPLOAD_ERR_NO_FILE){
		
		}
		elseif ($_FILES[$key]['error'] == UPLOAD_ERR_OK) {
			//salva FILE in repository tmpfile
			$filename = $_FILES[$key]['name'];  
			$filenameext = WFFileExt($filename);
			/*
			if(!in_array($filenameext,$ExtJSDevDOCExt))	{ 
				$output["message"] = 'The uploaded file have incorrect extension !';
				$output["failure"] = true;
				$output["success"] = false;
			}
			*/
			/*
			if($_FILES[$key]["size"] > $ExtJSDevDOCMaxSize)	{ 
				$output["message"] = 'The uploaded file ' . $_FILES[$key]["size"] . 'exceeds max_filesize!';  
				$output["failure"] = true;
				$output["success"] = false;
			}
			*/
			move_uploaded_file($_FILES[$key]['tmp_name'], $ExtJSDevTMP . $filename);
			$record['UPLOADEDFILENAME'] = $filename; 
			$record['UPLOADEDFILETIMESTAMP'] = time();
			$record['UPLOADEDFILEEXT'] = strtolower($filenameext);
			$record['UPLOADEDFILESIZE'] = $_FILES[$key]["size"];
			$record['UPLOADEDFILEHASH'] = md5_file($ExtJSDevTMP . $filename);
			$output["debugfile"] = $filename;
			
			$date = new DateTime();
			$record['SI'] = $date->getTimestamp(); 
			$record['SR'] = $date->getTimestamp(); 
			$record['SC'] = $date->getTimestamp(); 
			$record['SA'] = $UserId; 
			WFSendLOG("DataWrite:","FILE-" . $filename );
		}
		elseif ($_FILES[$key ]['error'] == UPLOAD_ERR_INI_SIZE){
			WFSendLOG("DataWrite:","FILEErr" . $result_msg );
			$output["failure"] = true;
			$output["success"] = false;
			$output["message"] = 'The uploaded file ' . $_FILES[$key]["size"] . ' exceeds the upload_max_filesize directive in php.ini';
		}
		elseif ($_FILES[$key ]['error'] == UPLOAD_ERR_NO_TMP_DIR){
			WFSendLOG("DataWrite:","FILEErr" . $result_msg );
			$output["failure"] = true;
			$output["success"] = false;
			$output["message"] = 'Err Temporary folder, check disk space, restart apache';
		}
		else{
			WFSendLOG("DataWrite:","FILEErr" . $_FILES[$key ]['error'] );
			$output["failure"] = true;
			$output["success"] = false;
			$output["message"] = 'The uploaded file ' . $_FILES[$key ]['error'];
		}
	}
	return $record;
}

function getDataFromUrl($url, $method='', $vars='') {
	global $conn;
	global $output;
	if ($conn->debug==1) {
		echo('getDataFromUrl'. BRCRLF);
		echo('Url'. $url. BRCRLF);
		var_dump($vars);
	}
    $ch = curl_init();
    if ($method == 'post') {
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $vars);
    }
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookies/cookies.txt');
    curl_setopt($ch, CURLOPT_COOKIEFILE, 'cookies/cookies.txt');
    $buffer = curl_exec($ch);
    curl_close($ch);
    return $buffer;
}


/************************************************************************************/
/*                   		  FUNC SMB    		 									*/
/************************************************************************************/
function WFSMBSend($File = '', $smbFolderRemoteFile = '', $smbLogin = '', $smbPassword = '', $smbServer = ''){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDB;
	global $UserId;
	$result = 'true';
	WFSendLOG("WFSMBSend", "File:" . $File . "ftpFserver:" . $ftpServer );
	
	if (PHP_OS == 'Linux') {
		//ON LINUX 
		if ($conn->debug==1) echo('smbclient'. BRCRLF);
		require_once dirname(__FILE__) . '/smbclient.php';
		
		$smbc = new smbclient ('//' .$smbServer . '/' . $smbFolderRemoteFile, $smbLogin, $smbPassword);
	
		$FileToAttachDebug = "";
		$File = $File . ',';
		$FileArray = explode(',',$File);
		$FileArray = array_unique($FileArray);
		foreach($FileArray as $key) { 
			$key = trim($key);
			if ($key != ''){
				$name  = WFFileNameExt($key);
				$FileToAttachDebug = $FileToAttachDebug .'key' . $key . '  name' . $name . BRCRLF;
				$smbc->put($name, $name);
			}
		}
	}
	return $output["success"];
}

function WFSMBReceive($FolderLocal = '', $smbFolderRemoteDirFile = '', $smbLogin = '', $smbPassword = '', $smbServer = ''){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDB;
	global $UserId;
	WFSendLOG("WFSMBReceive", "ftpFolderRemote Local:" . $FolderLocal . " Remote:" . $smbFolderRemoteDirFile . " server:" . $smbServer . ' login:' . $smbLogin . ' pwd:' . $smbPassword);
	if (PHP_OS == 'Linux') {
		//ON LINUX 
		if ($conn->debug==1) echo('smbclient'. BRCRLF);
		require_once dirname(__FILE__) . '/smbclient.php';
		#apt-get install smbclient
		#/etc/samba/smb.conf    client min protocol = NT1
		$smbFolderRemoteDir  = WFFileDir($smbFolderRemoteDirFile);
		$smbFolderRemoteFile = WFFileNameExt($smbFolderRemoteDirFile);
		$smbc = new smbclient ('//' .$smbServer . '/' . $smbFolderRemoteDir, $smbLogin, $smbPassword);
		$files = $smbc->dir(null, $smbFolderRemoteFile);
		//copia il file nella cartella locale
		if (!empty($files)) {
			foreach ($files as $file){
				if (!$smbc->get ($file['filename'], $FolderLocal . $file['filename'])){
					$output["success"] = false;
					$output["failure"] = true;
					$output["message"] = $output["message"] . "Errore: scarico file FTP " . $FolderLocal . WFFileNameExt ($file) . BRCRLF ;
				}else{
					$smbc->del($file['filename']);
				}
			}
		}
	}else{
		//ON WINDOWS 
		if ($conn->debug==1) echo('smbclient'. BRCRLF);
		require_once dirname(__FILE__) . '/smbclient.php';
		#apt-get install smbclient
		#/etc/samba/smb.conf    client min protocol = NT1
		$smbFolderRemoteDir  = WFFileDir($smbFolderRemoteDirFile);
		$smbFolderRemoteFile = WFFileNameExt($smbFolderRemoteDirFile);
		$smbc = new smbclient ('//' .$smbServer . '/' . $smbFolderRemoteDir, $smbLogin, $smbPassword);
		$files = $smbc->dir(null, $smbFolderRemoteFile);
		//copia il file nella cartella locale
		if (!empty($files)) {
			foreach ($files as $file){
				if (!$smbc->get ($file['filename'], $FolderLocal . $file['filename'])){
					$output["success"] = false;
					$output["failure"] = true;
					$output["message"] = $output["message"] . "Errore: scarico file FTP " . $FolderLocal . WFFileNameExt ($file) . BRCRLF ;
				}else{
					$smbc->del($file['filename']);
				}
			}
		}
	}
}

/************************************************************************************/
/*                   		  FUNC SEND SMS SOCKET 									*/
/************************************************************************************/
function WFSMSSend($destinatari, $messaggio, $mittente, $tipo = 'L'){
	global $output;
	global $smslogin;
	global $smspassword;
	global $smsprovider;
	
	if ((substr($destinatari,2)=='39') && (strlen($destinatari) >= 9)) $destinatari = '+' .$destinatari;
		
	if ($smsprovider == 'SMSBIZ'){
		WFSendLOG("ExecWFSendSMSBIZ", "dest:" . $destinatari . 'msg:' . $messaggio);
		//N: SMS Normale con Notifica L: SMS MediaMArkenting LL: SMS Low Cost
		if ($tipo == 'N') {$tipo = 1; $status = 1; $flash = 0;}
		elseif ($tipo == 'L') {$tipo = 1; $status = 0; $flash = 0;}
		elseif ($tipo == 'LL') {$tipo = 1; $status = 0; $flash = 1;}
		//$destinatari = str_replace($destinatari, '+', ''); 
		// Se status = 1 vengono richieste le notifiche di ricezione
		// Se flash = 1 vengono spediti SMS in formato Flash
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "http://www.nsgateway.net/smsscript/sendsms.php");
		curl_setopt($ch, CURLOPT_POST, 1);
		if (substr($destinatari,1)=='+39') $destinatari = '+39' . $destinatari; //%2B39
		curl_setopt($ch, CURLOPT_POSTFIELDS, "login=$smslogin&password=$smspassword&dest=$destinatari&tipo=$tipo&mitt=$mittente&testo=$messaggio");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		WFSendLOG("ExecWFSendSMS", "login=$smslogin&password=$smspassword&dest=$destinatari&tipo=$tipo&mitt=$mittente&testo=$messaggio");
		$result = curl_exec($ch);
		curl_close($ch);
	}
	else if ($smsprovider == 'MOBYT'){
		//N: SMS Normale con Notifica L: SMS MediaMArkenting LL: SMS Low Cost
		WFSendLOG("ExecWFSendSMSMOBYT", "dest:" . $destinatari . 'msg:' . $messaggio);
		//$destinatari = str_replace($destinatari, '+', ''); 
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "https://app.mobyt.it/Mobyt/SENDSMS");
		curl_setopt($ch, CURLOPT_POST, 1);
		if (substr($destinatari,1)!='+') $destinatari = '+39' . $destinatari; //%2B39
		curl_setopt($ch, CURLOPT_POSTFIELDS, "login=$smslogin&password=$smspassword&message_type=$tipo&recipient=$destinatari&mitt=$mittente&message=$messaggio");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		WFSendLOG("ExecWFSendSMS", "login=$smslogin&password=$smspassword&message_type=$tipo&recipient=$destinatari&mitt=$mittente&message=$messaggio");
		$result = curl_exec($ch);
		curl_close($ch);
	}
	WFSendLOG("ExecWFSendSMS", "SentResult: " . $result);

	$output["message"] = $result;
	$output["success"] = true;
}
function WFSMSCredit(){
	global $output;
	global $smslogin;
	global $smspassword;
	global $smsprovider;
	
	
	if ($smsprovider == 'SMSBIZ'){
		$tipo = 2;
		$status = 0;
		$flash = 0;
		WFSendLOG("WFCreditSMS", "start");
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "http://www.nsgateway.net/smsscript/sendsms.php");
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, "login=$smslogin&password=$smspassword&tipo=$tipo");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$result = curl_exec($ch);
		curl_close($ch);
	}
	else if ($smsprovider == 'MOBYT'){
		$tipo = 2;
		$status = 0;
		$flash = 0;
		WFSendLOG("WFCreditSMS", "start");
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "https://app.mobyt.it/Mobyt/CREDITS");
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, "login=$smslogin&password=$smspassword");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$result = curl_exec($ch);
		curl_close($ch);
		//OK;L|IT|37;N|IT|37;LL|IT|37;L|ES|56;N|ES|56;LL|ES|100;EE||81
		//$statelist = split(";",$result);
		//$stateLIT = split("|",$statelist[0]);
		//$result = $stateLIT[2];
	}
	WFSendLOG("WFCreditSMS", "Result: " . $result);

	$output["message"] = "Credito Residuo:" . $result;
	$output["success"] = true;

}

function WFObjectSend($ObjectType, $ObjectName, $ObjectFormat, $To, $Cc, $Bcc, $Subject, $MessageText){
	//	$ObjectType    acSendTable, "Employees"
	//	$ObjectName    "Employees"
	//  $ObjectFormat  acFormatXLS,

	WFSendLOG('WFSendObject', "to:" . $To . "obj:" . $ObjectName);

	file_put_contents('temp.txt', "text", FILE_APPEND);
	WFMailSend('temp.txt', $To, $Cc, $Bcc, $Subject, $MessageText);
}

// FUNC MESSAGE
function WFInputBox($prompt, $pulsanti = YesNoCancel, $titolo = 'ExtJsDev'){
	global $output;
	$output["message"] = $prompt;
	$output["success"] = true;
}
function WFMsgBox($title = 'ExtJsDev', $prompt = '', $buttons = 'YesNoCancel',$ontrue,$onfalse ){
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	WFSendLOG("WFMsgBox", $title);

	//$output["icon"] = $icon;
	$output["title"] = $title;
	$output["prompt"] = $prompt;
	$output["buttons"] = $buttons;
	
	//processo su vero
	$sql = "SELECT * FROM " . $ExtJSDevDB . "proc WHERE ";
	if (is_numeric($ontrue) == true) {
		$sql = $sql . " ID = " . $ontrue;
	} else {
		$sql = $sql . " DESCNAME = '" . $ontrue . "'";
	}
	$rs = $conn->Execute($sql);
	if ($rs !== false) {
		$ontrue = $rs->fields['ID'];
		$rs->close();
	}
	$output["ontrue"] = $ontrue;
	
	//processo su falso
	$sql = "SELECT * FROM " . $ExtJSDevDB . "proc WHERE ";
	if (is_numeric($onfalse) == true) {
		$sql = $sql . " ID = " . $onfalse;
	} else {
		$sql = $sql . " DESCNAME = '" . $onfalse . "'";
	}
	$rs = $conn->Execute($sql);
	if ($rs !== false) {
		$onfalse = $rs->fields['ID'];
		$rs->close();
	}
	$output["onfalse"] = $onfalse;
	
	$output["type"] = 'msgbox';
	
	$output["success"] = true;
}

// FUNC SOCKET MANAGEMENT
function SocketReceiveMessage($ipServer, $portNumber, $nbSecondsIdle){
	$socket = stream_socket_server('tcp://' . $ipServer . ':' . $portNumber, $errno, $errstr);
	if (!$socket) {
		return "$errstr ($errno)<br />\n";
	} else {
		// while there is connection, i'll receive it... if I didn't receive a message within $nbSecondsIdle seconds, the following function will stop.
		while ($conn = @stream_socket_accept($socket, $nbSecondsIdle)) {
			$message = fread($conn, 1024);
			return $message;
			fclose($conn);
		}
		fclose($socket);
	}
}
function SocketSendMessage($ipServer, $portServer, $message){
	$fp = stream_socket_client("tcp://$ipServer:$portServer", $errno, $errstr);
	if (!$fp) {
		return "ERROR : $errno - $errstr";
	} else {
		fwrite($fp, "$message");
		return true;
	}
	fclose($fp);
}


/************************************************************************************/
/*                   		  FUNC TCP 												*/
/************************************************************************************/
function isIpAlive($ip, $port = 80, $timeout = 1) {
    $fp = @fsockopen($ip, $port, $errno, $errstr, $timeout);
    if ($fp) {
        fclose($fp);
        return true; // IP is reachable
    } else {
        return false; // IP is not reachable
    }
}
function ping($host, $timeout = 3){
	$port = 0;
	$datasize = 64;
	global $g_icmp_error;
	$g_icmp_error = "No Error";
	$ident = array(ord('J'), ord('C'));
	$seq   = array(rand(0, 255), rand(0, 255));

	$packet = '';
	$packet .= chr(8); // type = 8 : request
	$packet .= chr(0); // code = 0

	$packet .= chr(0); // checksum init
	$packet .= chr(0); // checksum init

	$packet .= chr($ident[0]); // identifier
	$packet .= chr($ident[1]); // identifier

	$packet .= chr($seq[0]); // seq
	$packet .= chr($seq[1]); // seq

	for ($i = 0; $i < $datasize; $i++)
		$packet .= chr(0);

	$chk = icmpChecksum($packet);

	$packet[2] = $chk[0]; // checksum init
	$packet[3] = $chk[1]; // checksum init

	$sock = socket_create(AF_INET, SOCK_RAW,  getprotobyname('icmp'));
	$time_start = microtime();
    socket_sendto($sock, $packet, strlen($packet), 0, $host, $port);

    $read   = array($sock);
	$write  = NULL;
	$except = NULL;

	$select = socket_select($read, $write, $except, 0, $timeout * 1000);
	if ($select === NULL){
		$g_icmp_error = "Select Error";
		socket_close($sock);
		return -1;
	}
	elseif ($select === 0){
		$g_icmp_error = "Timeout";
		socket_close($sock);
		return -1;
	}

    $recv = '';
    $time_stop = microtime();
    socket_recvfrom($sock, $recv, 65535, 0, $host, $port);
	$recv = unpack('C*', $recv);
	// ICMP proto = 1
	if ($recv[10] !== 1) {
		$g_icmp_error = "Not ICMP packet";
		socket_close($sock);
		return -1;
	}
	// ICMP response = 0
	if ($recv[21] !== 0) {
		$g_icmp_error = "Not ICMP response";
		socket_close($sock);
		return -1;
	}
	if ($ident[0] !== $recv[25] || $ident[1] !== $recv[26]){
		$g_icmp_error = "Bad identification number";
		socket_close($sock);
		return -1;
	}
	if ($seq[0] !== $recv[27] || $seq[1] !== $recv[28]){
		$g_icmp_error = "Bad sequence number";
		socket_close($sock);
		return -1;
	}
	$ms = ($time_stop - $time_start) * 1000;
	if ($ms < 0){
		$g_icmp_error = "Response too long";
		$ms = -1;
	}

	socket_close($sock);
	return $ms;
}
function icmpChecksum($data){
	$bit = unpack('n*', $data);
	$sum = array_sum($bit);

	if (strlen($data) % 2) {
			$temp = unpack('C*', $data[strlen($data) - 1]);
			$sum += $temp[1];
	}

	$sum = ($sum >> 16) + ($sum & 0xffff);
	$sum += ($sum >> 16);

	return pack('n*', ~$sum);
}
function getLastIcmpError(){
	global $g_icmp_error;
	return $g_icmp_error;
}
function pingsite($url) {
    $agent = "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8; pt-pt) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27";

    // initializes curl session
    $ch = curl_init();

    // sets the URL to fetch
    curl_setopt($ch, CURLOPT_URL, $url);

    // sets the content of the User-Agent header
    curl_setopt($ch, CURLOPT_USERAGENT, $agent);

    // make sure you only check the header - taken from the answer above
    curl_setopt($ch, CURLOPT_NOBODY, true);

    // follow "Location: " redirects
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

    // return the transfer as a string
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    // disable output verbose information
    curl_setopt($ch, CURLOPT_VERBOSE, false);

    // max number of seconds to allow cURL function to execute
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);

    // execute
    curl_exec($ch);

    // get HTTP response code
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($httpcode >= 200 && $httpcode < 300)
        return true;
    else
        return false;
}

/************************************************************************************/
/*                   		  FUNC P7M OPENSSL										*/
/************************************************************************************/
function P7MExtractXML($nomeFileP7M){
	global $ExtJSDevWWW;
	global $ExtJSDevTMP;
	global $ExtJSDevLOG;
	global $conn;
	
	$olddir = getcwd();
	chdir($ExtJSDevTMP);
	if ($conn->debug==1)echo("P7M STR START" . $nomeFileP7M . BRCRLF);
	
	$nomeEstratto = $ExtJSDevTMP . basename(substr($nomeFileP7M,0,-4));
	if ($conn->debug==1)echo("P7M STR ORGINAL NAME" . $nomeEstratto . BRCRLF);
	
	if (!file_exists($nomeFileP7M)){
		if ($conn->debug==1)echo("P7M STR file origine nn esiste"  . BRCRLF);
		if ($conn->debug==1)echo("P7M STR END" . $nomeFileP7M . BRCRLF);
		return;
	}
	else{
		if ($conn->debug==1)echo("P7M STR file origine esiste"  . BRCRLF);
	}
	
	//CONVERSIONE SMIME
	if (PHP_OS == 'Linux') {
		$Command = 'openssl smime -verify -noverify -in "' . $nomeFileP7M . '" -inform DER -out "' . $nomeEstratto . '"';
		if ($conn->debug==1)echo("P7M SMIME" . $Command. BRCRLF);
		$exeoutput = array();
		exec($Command, $exeoutput);
		$Appo = '';
		if (count($exeoutput) > 0){
			$Appo = '' . $exeoutput[0];
		}
		//rename ( basename(substr($nomeEstratto,0,-4)) , $nomeEstratto );
	}
	else{
		chdir($ExtJSDevWWW . "includes/PHPPersonal/ade/");
		$Command = 'openssl smime -verify -noverify -in "' . $nomeFileP7M . '" -inform DER -out "' . $nomeEstratto . '"';
		if ($conn->debug==1)echo("P7M SMIME" .$Command. BRCRLF);
		$exeoutput = array();
		exec($Command, $exeoutput);
		$Appo = '';
		if (count($exeoutput) > 0){
			$Appo = '' . $exeoutput[0];
		}
		//rename ( basename(substr($nomeEstratto,0,-4)) , $nomeEstratto );
	}
	if (file_exists($nomeEstratto)){
		if (filesize($nomeEstratto) < 1) {
			if ($conn->debug==1)echo("P7M SMIME ERRORE CANCELLO SMIME"  . filesize($nomeEstratto) .'bits'. BRCRLF);
			//file nn leggibile
			unlink($nomeEstratto);
		}
		else{
			goto esistentep7m;
		}
		if ($conn->debug==1)echo("P7M SMIME convertito"  . $Appo. BRCRLF);
	}else{
		if ($conn->debug==1)echo("P7M SMIME NON convertito"  . $Appo. BRCRLF);
	}
	
	//CONVERSIONE CMS
	if (!file_exists($nomeEstratto)){
		if (PHP_OS == 'Linux') {
			$Command = 'openssl cms -verify -noverify -in "' . $nomeFileP7M . '" -inform DER -out "' . $nomeEstratto . '"';
			if ($conn->debug==1)echo("P7M CMS " .$Command. BRCRLF);
			$exeoutput = array();
			exec($Command, $exeoutput);
			$Appo = '';
			if (count($exeoutput) > 0){
				$Appo = '' . $exeoutput[0];
			}
			//rename ( basename(substr($nomeEstratto,0,-4)) , $nomeEstratto );
		}
		else{
			chdir($ExtJSDevWWW . "includes/PHPPersonal/ade/");
			$Command = 'openssl cms -verify -noverify -in "' . $nomeFileP7M . '" -inform DER -out "' . basename(substr($nomeEstratto,0,-4)) . '"';
			if ($conn->debug==1)echo("P7M CMS "  . $Command. BRCRLF);
			$exeoutput = array();
			exec($Command, $exeoutput);
			$Appo = '';
			if (count($exeoutput) > 0){
				$Appo = '' . $exeoutput[0];
			}
			//rename ( basename(substr($nomeEstratto,0,-4)) , $nomeEstratto );
		}
		if ($conn->debug==1)echo("P7M CMS convertito"  . $Appo. BRCRLF);
	}
	if (file_exists($nomeEstratto)){
		if (filesize($nomeEstratto) < 1) {
			if ($conn->debug==1)echo("P7M CMS ERRORE CANCELLO CMS"  . filesize($nomeEstratto) .'bits'. BRCRLF);
			//file nn leggibile
			unlink($nomeEstratto);
		}
		else{
			goto esistentep7m;
		}
		if ($conn->debug==1)echo("P7M CMS convertito"  . $Appo. BRCRLF);
	}else{
		if ($conn->debug==1)echo("P7M CMS NON convertito"  . $Appo. BRCRLF);
	}
	
	//CONVERSIONE BASE  64
	if (!file_exists($nomeEstratto)){
		if ($conn->debug==1)echo("P7M B64 vuoto"  . BRCRLF);
		$nomeConvert32 = $ExtJSDevTMP . basename(substr($nomeFileP7M,0,-4).'.32b');
		//tobase32($nomeFileP7M,$nomeConvert32);
		
		if ($conn->debug==1)echo("P7M B64 decoded64"  . $nomeConvert32 . BRCRLF);
		if (PHP_OS == 'Linux') {
			$Command = 'base64 -d -i "' . $nomeFileP7M . '" > "' . $nomeConvert32 . '"';
		}else{
			$Command = $ExtJSDevWWW . 'includes\PHPPersonal\ade\certutil -decode "' . $nomeFileP7M . '" "' . $nomeConvert32 . '"';		
		}
		$exeoutput = array();
		exec($Command, $exeoutput);
		if (count($exeoutput) > 0){
			$Appo = '' . $exeoutput[0];
		}
		if ($conn->debug==1)echo("P7M B64 decoded64"  . BRCRLF);
		
		if (file_exists($nomeConvert32)){
			if (filesize($nomeConvert32) < 1) {
				if ($conn->debug==1)echo("P7M B64 CANCELLO B64"  . filesize($nomeConvert32) .'bits'. BRCRLF);
				unlink($nomeConvert32);
				goto esistentep7m;
			}else{
				if ($conn->debug==1)echo("P7M B64 FILE convertito"  . filesize($nomeConvert32) .'bits'. BRCRLF);
			}
		}
		else{
			if ($conn->debug==1)echo("P7M B64 FILE B64 NON ESISTENTE"  . filesize($nomeConvert32) .'bits'. BRCRLF);
			goto esistentep7m;
		}


		//SMIME
		if (PHP_OS == 'Linux') {
			$Command = 'openssl smime -verify -noverify -in "' . $nomeConvert32 . '" -inform DER -out "' . $nomeEstratto . '"';
		}else{
			$Command = $ExtJSDevWWW . 'includes\PHPPersonal\ade\openssl smime -verify -noverify -in "' . $nomeConvert32 . '" -inform DER -out "' . $nomeEstratto . '"';
		}
		$exeoutput = array();
		exec($Command, $exeoutput);
		$Appo = '';
		if (count($exeoutput) > 0){
			$Appo = '' . $exeoutput[0];
		}
		if ($conn->debug==1)echo("P7M B64 toxml" . BRCRLF);
		unlink($nomeConvert32);
		if (file_exists($nomeEstratto)){
			if (filesize($nomeEstratto) < 1) {
				if ($conn->debug==1)echo("P7M B64 SMIME ERRORE CANCELLO  XML"  . filesize($nomeEstratto) .'bits'. BRCRLF);
				//file nn leggibile
				unlink($nomeEstratto);
			}
			else{
				goto esistentep7m;
			}
			if ($conn->debug==1)echo("P7M B64 SMIME convertito"  . $Appo. BRCRLF);
		}else{
			if ($conn->debug==1)echo("P7M B64 SMIME NON convertito"  . $Appo. BRCRLF);
		}
	}
	
	esistentep7m:
	if (!file_exists($nomeEstratto)){
		if ($conn->debug==1)echo("P7M END FILE KO ERRORE  XML"  . $nomeEstratto. BRCRLF);
		$nomeEstratto  = null;
	}
	else{
		if (filesize($nomeEstratto) > 1) {
			if ($conn->debug==1)echo("P7M END FILE OK CONVERTITO:" . nomeEstratto . BRCRLF);
		}
		else{
			if ($conn->debug==1)echo("P7M END FILE KO ERRORE CANCELLO  XML"  . filesize($nomeEstratto) .'bits'. BRCRLF);
			//file nn leggibile
			unlink($nomeEstratto);
			$nomeEstratto  = null;
		}

	}
	if ($conn->debug==1)echo("P7M END END:" . $nomeFileP7M . BRCRLF);
	
	/*
	$string = file_get_contents($nomeFileP7M);
	
    // skip everything before the XML content
    $string = substr($string, strpos($string, '<?xml '));
 
    // skip everything after the XML content
    preg_match_all('/<\/.+?>/', $string, $matches, PREG_OFFSET_CAPTURE);
    $lastMatch = end($matches[0]);
 
	$string = substr($string, 0, $lastMatch[1]);
	
	$StrArr = str_split($string); $NewStr = '';
	foreach ($StrArr as $Char) {    
		$CharNo = ord($Char);
		if ($CharNo == 163) { $NewStr .= $Char; continue; } // keep £ 
		if ($CharNo > 31 && $CharNo < 127) {
			$NewStr .= $Char;    
		}
	}  
	file_put_contents($nomeEstratto,$NewStr);
	*/
    
	chdir($olddir);
	return $nomeEstratto;
}
function tobase64($Ifilename, $Efilename){
    $handle = fopen($Ifilename, 'rb');
    $outHandle = fopen($Efilename, 'wb');
    $bufferSize = 3 * 256;// 3 bytes of ASCII encodes to 4 bytes of base64
    while(!feof($handle)){
        $buffer = fread($handle, $bufferSize);
        $ebuffer = base64_encode($buffer);
        fwrite($outHandle, $ebuffer);
    }
    fclose($handle);
    fclose($outHandle);
}
function tobase32($Ifilename, $Efilename){
    $handle = fopen($Ifilename, 'rb');
    $outHandle = fopen($Efilename, 'wb');
    $bufferSize = 4 * 256; // 4 bytes of base64 decodes to 3 bytes of ASCII
    while(!feof($handle)){
        $buffer = fread($handle, $bufferSize);
        $dbuffer = base64_decode($buffer);
        fwrite($outHandle, $dbuffer);
    }
    fclose($handle);
    fclose($outHandle);
}


/************************************************************************************/
/*                   		  FUNC ZPL								 				*/
/************************************************************************************/
// https://gist.github.com/enovision/5c547d0d2be1bb4520f72a738d76aba7

class ZebraDPIConverter{
    private $baseDPI;
    private $targetDPI;

    private $sourceData;

    private $scaleFactor = 1;

    private static $cmds = ['FT', 'FO', 'A0', 'A@', 'LL', 'LH', 'GB', 'FB', 'BY', 'B3'];

    function __construct($baseDPI = 203, $targetDPI = 300, $source = null, $type = null) {
        $this->baseDPI = intval($baseDPI);
        $this->targetDPI = intval($targetDPI);
        $this->scaleFactor = $this->targetDPI / $this->baseDPI;
        if ($source !== null) {
            $this->setSource($source, $type);
        }
        return $this;
    }

    public function setSource($source, $type = 'string') {
        if (in_array(strtolower($type), ['string', 'text', 'data'])) {
            $this->sourceData = $source;
        } else if (in_array(strtolower($type), ['file', 'path'])) {
            $this->loadSourceFromPath($source);
        }
        return $this;
    }

    public function loadSourceFromPath($path) {
        if (file_exists($path)) {
            $this->sourceData = file_get_contents($path);
        } else {
            $this->sourceData = 'File not found in path : ' . $path;
        }

        return $this;
    }

    /* Scales text from a raw ZPL label from 203 DPI to 300 DPI  */
    function scale() {
        $sections = explode('^', $this->sourceData);
        foreach (self::$cmds as $cmd) {
            foreach ($sections as $idx => $section) {
                if (substr($section, 0, strlen($cmd)) === $cmd) {
                    $sections[$idx] = $this->scaleSection($cmd, $section);
                }
            }
        }

        return implode('^', $sections);
    }

    function scaleSection($cmd, $section) {
        $section = substr($section, strlen($cmd), strlen($section));
        $parts = explode(',', $section);
        foreach ($parts as $idx => $part) {
            if (is_numeric($part)) {
                $parts[$idx] = round($this->scaleFactor * intval($part));
            }
        }
        return $cmd . implode(',', $parts);
    }
}

function ZPLScaler($rawCommands, $originDPI = 300/203, $destDPI = 300/203) {
	$zplconverter = new ZebraDPIConverter($originDPI, $destDPI);
	$zplconverter->setSource($rawCommands, 'string'); 
	return $zplconverter->scale();
}
/************************************************************************************/
/*                   		  FUNC PDF								 				*/
/************************************************************************************/
function WFPDF2PDF($FileFromPDF, $FileToPDF, $Page = ''){
	global $conn;
	global $output;
	global $ExtJSDevWWW;
	global $ExtJSDevTMP;
	WFSendLOG("WFPDF2PDF", "FileFromPDF:" . $FileFromPDF);
	
	$olddir = getcwd();
	chdir($ExtJSDevWWW . 'includes/PDFConverter');
	//REDUCE IMAGE DISATTIVATA FA DANNI AI PDF
	$FileToPDF = str_replace(".pdf", "A.pdf", $FileFromPDF);

	if (PHP_OS == 'Linux') {
		$Command = "./mutool convert " . 
					" -O resolution=72 " .
					" -o " . $FileToPDF . 
					" " . $FileFromPDF . 
					" " . $Page;
	}else{
		$Command = "mutool.exe convert " . 
					" -O resolution=72 " .
					' -o "' . $FileToPDF . '"' .
					' "' . $FileFromPDF .  '"' .
					" " . $Page;
	}
	$exeoutput = array();
	if ($conn->debug==1) echo('<b>WFPDF2PDF:</b>->' . $Command . "<-" . BRCRLF);
	//exec($Command, $exeoutput);
	if (isset($FileToPDF) && isset($FileFromPDF)){
		//unlink($FileFromPDF);
		//rename($FileToPDF, $FileFromPDF);
	}
	else{
		if ($conn->debug==1) echo('<b>WFPDF2PDF:</b>->mutool NOT<-' . BRCRLF);
		return;
	}
	
	//REDUCE PDF
	$FileToPDF = str_replace(".pdf", "B.pdf", $FileFromPDF);
	if (PHP_OS == 'Linux') {
		$Command = "./cpdf -scale-to-fit usletterportrait " . 
					" " . $FileFromPDF . 
					" -o " . $FileToPDF ;
	}else{
		$Command = "cpdf -scale-to-fit usletterportrait " . 
					" " . $FileFromPDF . 
					" -o " . $FileToPDF ;
	}
	$exeoutput = array();
	if ($conn->debug==1) echo('<b>WFPDF2PDF:</b>->' . $Command . "<-" . BRCRLF);
	exec($Command, $exeoutput);
	
	if (isset($FileToPDF) && isset($FileFromPDF)){
		unlink($FileFromPDF);
		rename($FileToPDF, $FileFromPDF);
	}
	else{
		if ($conn->debug==1) echo('<b>WFPDF2PDF:</b>->CPDF NOT<-' . BRCRLF);
		return;
	}
	WFSendLOG("WFPDF2PDF", "FileToPDF:" . $FileToPDF);
	
	chdir($olddir);
	return $FileToPDF;
}

function WFPDF2PNG($FileFromPDF, $FileToPNG, $Page = 'N'){
	global $conn;
	global $output;
	global $ExtJSDevWWW;
	global $ExtJSDevTMP;
	WFSendLOG("WFPDF2PNG", "FileFromPDF:" . $FileFromPDF);
	
	$olddir = getcwd();
	chdir($ExtJSDevWWW . 'includes/PDFConverter');
	if (PHP_OS == 'Linux') {
		$Command = "./mutool convert " . 
					" -O resolution=72 " .
					" -o " . $FileToPNG . 
					" " . $FileFromPDF . 
					" " . $Page;
	}else{
		$Command = "mutool.exe convert " . 
					" -O resolution=72 " .
					" -o " . $FileToPNG . 
					" " . $FileFromPDF . 
					" " . $Page;
	}
	$exeoutput = array();
	exec($Command, $exeoutput);
	WFSendLOG("WFPDF2PNG", "FileToPNG:" . $FileToPNG);
	
	//DAFARE DIR CON ULTIMA PAGINA
	if ($Page == 'N'){ 
		$FileToPNGConv = substr($FileToPNG,0,-4) . '1.png';
	}elseif ($Page == 'N-1'){ 
		$FileToPNGConv = substr($FileToPNG,0,-4) . '1.png';
	}else{ 
		$FileToPNGConv = substr($FileToPNG,0,-4) . '1.png';
	}
	if (!copy($FileToPNGConv, $FileToPNG)) {
		$output['message'] = $output['message']  . "ERRORE CONVERSIONE PDF PNG " . $FileToPNGConv . BRCRLF .
													" Command: " . $Command . BRCRLF . 
													" Errore: " . implode(' ', $exeoutput). BRCRLF;
		return;
	}else{
		unlink($FileToPNGConv);
	}

	chdir($olddir);
	return $FileToPNG;
}
function WFPDF2JPG($FileFromPDF, $FileToJPG, $Page = '1'){
	global $conn;
	global $output;
	global $ExtJSDevWWW;
	global $ExtJSDevTMP;
	WFSendLOG("WFPDF2JPG", "FileFromPDF:" . $FileFromPDF);
	
	$olddir = getcwd();
	chdir($ExtJSDevWWW . 'includes/PDFConverter');
	if (PHP_OS == 'Linux') {
		$Command = "mutool convert " . 
					" -o " . $FileToJPG . 
					" " . $FileFromPDF .
					" " . $Page;
	}else{
		$Command = "mutool convert " . 
					" -o " . $FileToJPG . 
					" " . $FileFromPDF .
					" " . $Page;
	}
	$exeoutput = array();
	exec($Command, $exeoutput);
	echo($Command . BRCRLF);
	WFSendLOG("WFPDF2JPG", "FileToJPG:" . $FileToJPG);
	

	chdir($olddir);
	return $FileToJPG;
}
function WFPDFExtractArea($x1, $y1, $x2, $y2, $FilePDFToRead, $Page = 'N'){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDB;
	
	if ($conn->debug==1) echo('<b>FileName:</b>->' . $FilePDFToRead  . "<-" . BRCRLF);
	if (!file_exists($FilePDFToRead)) return false;
	
	// load the document
	require_once dirname(__FILE__) . '/PHPPdfExtractor/library/SetaPDF/Autoload.php';	
	try{
		$document = SetaPDF_Core_Document::loadByFilename($FilePDFToRead);
	} catch (exception $e){
		
		if ($conn->debug==1) echo('<b>WFPDFExtractArea:</b>->' . $e->getMessage()  . "<-" . BRCRLF);
		//WFRaiseError(0, $e->getMessage(), 'WFPDFExtractArea', '');
		return "";
	}
	// get access to its pages
	$pages = $document->getCatalog()->getPages();

	// the interresting part: initiate an extractor instance
	$extractor = new SetaPDF_Extractor($document);

	// create a word strategy instance
	$strategy = new SetaPDF_Extractor_Strategy_ExactPlain();
	// pass a rectangle filter to the strategy
	$strategy->setFilter(new SetaPDF_Extractor_Filter_Rectangle(
		new SetaPDF_Core_Geometry_Rectangle($x1, $y1, $x2, $y2),
		SetaPDF_Extractor_Filter_Rectangle::MODE_CONTACT
	));
	$extractor->setStrategy($strategy);

	if ($conn->debug==1) echo('<b>WFPDFExtractArea:</b>->ExtractByPage<-' . $Page . BRCRLF);
	// get the text of a page 1
	//$result = $extractor->getResultByPageNumber(1);
	//DAFARE DIR CON ULTIMA PAGINA
	if ($Page == 'N'){ 
		$result = $extractor->getResultByPageNumber($pages->count());
	}elseif ($Page == 'N-1'){ 
		$result = $extractor->getResultByPageNumber($pages->count());
		$result = $result -1;
	}else{ 
		$result = $extractor->getResultByPageNumber(1);
	}
	

	WFSendLOG("WFPDFExtractArea", "FilePDFToRead:" . $FilePDFToRead . " Readed:" . $result  );
	return $result;
}
function WFPDFExtractGroup($FilePDFToRead, $Page = 'N',$useDehyphen = true){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDB;
	
	require_once dirname(__FILE__) . '/PHPPdfExtractor/library/SetaPDF/Autoload.php';

	WFSendLOG("WFPDFExtractGroup", "FilePDFToRead:" . $FilePDFToRead . " start" );
	// load the document
	try{
		$document = SetaPDF_Core_Document::loadByFilename($FilePDFToRead);
	} catch (exception $e){
		//WFRaiseError(0, $e->getMessage(), 'WFPDFExtractGroup', '');
		return "";
	}
	// get access to its pages
	$pages = $document->getCatalog()->getPages();

	// the interresting part: initiate an extractor instance
	$extractor = new SetaPDF_Extractor($document);

	// create a word strategy instance
	$strategy = new SetaPDF_Extractor_Strategy_WordGroup();
	
	// set whether to use the dehyphen logic or not
	$strategy->setDehyphen($useDehyphen);
		
	// pass it to the extractor instance
	$extractor->setStrategy($strategy);

	// get the text of a page 1
	//$result = $extractor->getResultByPageNumber(1);
	//DAFARE DIR CON ULTIMA PAGINA
	if ($Page == 'N'){ 
		$result = $extractor->getResultByPageNumber($pages->count());
	}elseif ($Page == 'N-1'){ 
		$result = $extractor->getResultByPageNumber($pages->count());
		$result = $result -1;
	}else{ 
		$result = $extractor->getResultByPageNumber(1);
	}
	
	// iterate over all groups
	$groups = array();
	$i=0;
	foreach ($result as $group) {
		$i = $i +1;
		$currentGroup = array();
		// iterate over all words
		foreach ($group as $word) {
			$currentGroup[] = $word->getString();
		}
		$groups[] =  implode(' ', $currentGroup);
	}
	

	WFSendLOG("WFPDFExtractGroup", "FilePDFToRead:" . $FilePDFToRead . " Readed Element:" . $i);
	return $groups;
}
//https://github.com/convertio/convertio-php
//3e7313cc1274150a7fb45c24bcf81812
function WFPDF2PDFOCR($FileFromPDF, $FileToPDF){
	global $conn;
	global $output;
	global $ExtJSDevTMP;
	global $ExtJSDevWWW;
	WFSendLOG("WFPDF2PDFOCR", "FileFromPDF:" . $FileFromPDF);
	
	$olddir = getcwd();
	if (file_exists($FileToPDF)) return true;
	
	chdir($ExtJSDevTMP);
	if (!file_exists($FileFromPDF)) return false;
	
	chdir($ExtJSDevWWW . 'includes/PDFConverter');
	if (PHP_OS == 'Linux') {
		//offline 
		$Command = "ocrmypdf  " . 
					" --rotate-pages  " .
					" " . $FileFromPDF . 
					" " . $FileToPDF ;
		$exeoutput = array();
		exec($Command, $exeoutput);
	}
	
	//online
	if (!file_exists($FileToPDF)){
		$url = 'https://api.ocr.space/Parse/Image';
		$cFile = curl_file_create($FileFromPDF);
		$fields = array(
			'apikey' =>urlencode('8297100e5188957'),
			'language' => urlencode('ita'),
			'isOverlayRequired' => urlencode('false'),
			'iscreatesearchablepdf' => urlencode('true'),
			'detectOrientation' => urlencode('true'),
			'isTable' => urlencode('true'),
			'scale' => urlencode('true'),
			'file'=> $cFile
		);

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL,$url);
		curl_setopt($ch, CURLOPT_POST,1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); //data
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		
		$result = curl_exec ($ch);
		if (curl_errno($ch)) {
			print "Error: " . curl_error($ch);
		} else {
			curl_close($ch);
			$resultarray = json_decode($result);
			file_put_contents($FileToPDF, fopen($resultarray->SearchablePDFURL, 'r'));
			return true;
		}
	}
//	curl -H "apikey:helloworld" --form "file=@screenshot.jpg" --form "language=eng" -form "isOverlayRequired=true" https://api.ocr.space/Parse/Image
	
	chdir($olddir);
}
function WFPDF2BARCODERENAME($FileFromPDF){
}
function WFPDFModuleFill($FileFromPDF, $ArrayField, $FileToPDF){
	global $conn;
	global $output;
	global $ExtJSDevTMP;
	WFSendLOG("WFPDFModuleFill", "FileFromPDF:" . $FileFromPDF);
	
	chdir($ExtJSDevTMP);
	//if (!file_exists($FileFromPDF)) return false;
	//if (file_exists($FileToPDF)) return true;
	
	require_once dirname(__FILE__) . '/PHPPdfFiller/library/SetaPDF/Autoload.php';
	
	//$reader = new SetaPDF_Core_Reader_File($FileFromPDF);
	//$writer = new SetaPDF_Core_Writer_File($FileToPDF);
	//$document = SetaPDF_Core_Document::load($reader, $writer);
	
	$writer = new SetaPDF_Core_Writer_File($FileToPDF);
	//$writer = new SetaPDF_Core_Writer_Http('subscription_flatten.pdf', true);
	
	$document = SetaPDF_Core_Document::loadByFilename($FileFromPDF, $writer);
	$formFiller = new SetaPDF_FormFiller($document);
	$fields = $formFiller->getFields();
	
	foreach ($ArrayField as $key => $value) {
		$fields[$key]->setValue($value);
	}

	//$fields['Text#4']->getValue()

	$document->save()->finish();
}
function WFPDF2SVG($FileFromPDF, $FileToSVG){
	global $conn;
	global $output;
	global $ExtJSDevTMP;
	//apt-get install mupdf-tools
	WFSendLOG("WFPDF2SVG", "FileFromPdf:" . $FileFromPDF);
	
	$olddir = getcwd();
	chdir($ExtJSDevTMP);
	$FileToPDF = "";
	
	if (PHP_OS == 'Linux') {
		$Command = "mutool convert  -F svg -O text=text -o  " . $FileToSVG . "%d " . $FileFromPDF; 
	}else{
		$Command = "mutool convert  -F svg -O text=text -o  " . $FileToSVG . "%d " . $FileFromPDF; 
	}
	$exeoutput = array();
	if ($conn->debug==1) echo('<b>WFPDF2PDF:</b>->' . $Command . "<-" . BRCRLF);
	exec($Command, $exeoutput);
	$result = implode(' ', $exeoutput);
	
	rename($FileToSVG . '1', $FileToSVG);
	
	WFSendLOG("WFPDF2SVG", "fileconvertito:" . $FileToPDF);
	chdir($olddir);
	return $result;
}


/************************************************************************************/
/*                   		  FUNC BARCODE								 				*/
/************************************************************************************/
function WFBARCODEEXTRACT($FileFromJpeg){
	global $conn;
	global $output;
	global $ExtJSDevWWW;
	global $ExtJSDevTMP;
	WFSendLOG("WFBARCODEEXTRACT", "FileFromJpeg:" . $FileFromJpeg);
	
	$olddir = getcwd();
	chdir($ExtJSDevWWW . 'includes/PDFConverter');
	$FileToPDF = "";
	
	if (PHP_OS == 'Linux') {
		//1Cm22j8Xc4CN19UCWX0gMZ1qLH1Cm2LM
		$Command = "bardecode -t any -K 1Cm22j8Xc4CN19UCWX0gMZ1qLH1Cm2LM -f " . 
					" " . $FileFromJpeg; 
	}else{
		//VYNP2q9XTOUL0gshLLIVxcD107YVqQLM
		$Command = "bardecode -t any -K VYNP2q9XTOUL0gshLLIVxcD107YVqQLM -f " . 
					" " . $FileFromJpeg; 
	}
	$exeoutput = array();
	exec($Command, $exeoutput);
	$result = implode(' ', $exeoutput);
	
	WFSendLOG("WFBARCODEEXTRACT", "Barcode:" . $FileFromJpeg);

	chdir($olddir);
	return $FileToPDF;
}


/************************************************************************************/
/*                   		  	  FUNC 	BARCODE EAN13								*/
/************************************************************************************/
function NumberToEAN13($source){
	$ret = false;
	if (strlen($source) == 12){
		$digits = str_split($source);
		$even_sum = $digits[1] + $digits[3] + $digits[5] + $digits[7] + $digits[9] + $digits[11];
		$even_sum_three = $even_sum * 3;
		$odd_sum = $digits[0] + $digits[2] + $digits[4] + $digits[6] + $digits[8] + $digits[10];
		$total_sum = $even_sum_three + $odd_sum;
		$next_ten = (ceil($total_sum/10))*10;
		$check_digit = $next_ten - $total_sum;
		return $source . $check_digit;
	}else{
		return "ERROR";
	}
}
function IsEAN13($digits){
	$ret = false;
	if (strlen($digits) == 13){
		$digits = str_split($digits);
		$even_sum = $digits[1] + $digits[3] + $digits[5] + $digits[7] + $digits[9] + $digits[11];
		$even_sum_three = $even_sum * 3;
		$odd_sum = $digits[0] + $digits[2] + $digits[4] + $digits[6] + $digits[8] + $digits[10];
		$total_sum = $even_sum_three + $odd_sum;
		$next_ten = (ceil($total_sum/10))*10;
		$check_digit = $next_ten - $total_sum;
		if ($digits[12] == $check_digit) $ret = true;
	}
	return $ret;
}


/************************************************************************************/
/*                   		  FUNC IOT						 						*/
/************************************************************************************/
function WFIOT($ReqIOT = ''){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	$NewChiave = '';
	
	WFSendLOG("WFIOT",  " IotID:" . $ReqIOT);
		
	$sqlLay = "SELECT * FROM iot WHERE ";
	if (is_numeric($ReqIOT) == true) {
		$sqlLay = $sqlLay . " ID = " . $ReqIOT;
	}elseif (filter_var($ReqIOT, FILTER_VALIDATE_IP) == true) {
		$sqlLay = $sqlLay . " IP = '" . $ReqIOT . "'";
	} else {
		$sqlLay = $sqlLay . " DESCNAME = '" . $ReqIOT . "'";
	}
	$rs = $conn->Execute($sqlLay);
	if ($rs !== false) {
		$NewChiave = object_clone($rs->fields);
		$rs->close();
	}
	return ($NewChiave);
}
function WFIOTContact($ReqIOT = ''){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	global $LayoutId;
	$NewChiave = '';
	
	WFSendLOG("WFIOT",  " IotID:" . $ReqIOT);
		
	$sqlLay = "SELECT * FROM iot WHERE ";
	if (is_numeric($ReqIOT) == true) {
		$sqlLay = $sqlLay . " ID = " . $ReqIOT;
	}elseif (filter_var($ReqIOT, FILTER_VALIDATE_IP) == true) {
		$sqlLay = $sqlLay . " IP = '" . $ReqIOT . "'";
	} else {
		$sqlLay = $sqlLay . " DESCNAME = '" . $ReqIOT . "'";
	}
	$rs = $conn->Execute($sqlLay);
	if ($rs !== false) {
		$NewChiave = object_clone($rs->fields);
		$rs->close();
	}
	return ($NewChiave);
}
function WFSCALER($address = '192.168.0.100', $port = 23){
	global $conn;
	global $output;
	$peso = '';
	$socket = fsockopen($address, $port, $errno, $errstr,2); 
    if(!$socket) {
		$output['messagedebug'] = $output['messagedebug'] . 'WFSCALER: errore di connessione ' . $address . BRCRLF;
	}else{
		$buffer = ''; 
		$i = 0;
		while(true) { 
			$buffer = fgets($socket, 9); 
			if ($buffer != ''){
				if (substr($buffer, 0,1) == '$'){
					$pesoStabile = substr($buffer, 1,1); //0 stabile //1 non stabile //3non valido
					$peso = substr($buffer, 2,5);
					$peso = $peso / 10;
					break;
				}
			}
			$i = $i +1;
			if ($i > 50) break;
		}
		fclose($socket);
	}
	return $peso;
}


/************************************************************************************/
/*                   		  	  FUNC FILE 									*/
/************************************************************************************/
//file
function WFFileAbsolute($FileName){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevDOC;
	global $ExtJSDevWWW;
	global $ExtJSDB;
	
	if ($conn->debug==1) echo('<b>FileName:</b>->' . $FileName . "<-->" . substr($FileName,0,1) . "<-" . BRCRLF);
	//metto percorso documentale se non è definito link esterno
	
	if (PHP_OS == 'Linux') {
		//ON LINUX 
		if ((substr($FileName,0,2) == '//') || (substr($FileName,0,2) == '\\\\')){
			if ($conn->debug==1) echo('smbclient'. BRCRLF);
			WFSendLOG("WFFileAbsolute", "LINUX attach network:" . $FileName);
			//include_once ('smbclient.php');
			require_once dirname(__FILE__) . '/smbclient.php';
			$filenamesmb = pathinfo(str_replace('\\', '/', $FileName));
			$FileName = $ExtJSDevDOC . 'tmp/' . $filenamesmb['basename'];
			$smbc = new smbclient ($filenamesmb['dirname'], $smblogin, $smbpassword);
			//copia il file nella cartella tmp
			if (!$smbc->get ($filenamesmb['basename'], $FileName)){
				WFRaiseError(0, 'Failed to retrieve file ' . $smbc->get_last_stdout(), 'WFFileAbsolute', '');
			}
		}elseif (substr($FileName,1,1) == ':'){
			if ($conn->debug==1) echo('absolute disk'. BRCRLF);
			$FileName = $FileName;
			WFSendLOG("WFFileAbsolute", "WINDOWS attach direct:" . $FileName);
		}elseif (substr($FileName,0,1) == '/'){
			if ($conn->debug==1) echo('direct'. BRCRLF);
			//$FileName = $ExtJSDevWWW . $FileName;
			WFSendLOG("WFFileAbsolute", "LINUX attach direct:" . $FileName);
		}elseif (substr($FileName,0,1) == '\\'){
			if ($conn->debug==1) echo('direct'. BRCRLF);
			$FileName = $_SERVER['DOCUMENT_ROOT'] . $FileName;
			WFSendLOG("WFFileAbsolute", "LINUX attach direct:" . $FileName);
		}else{
			if ($conn->debug==1) echo('repository'. BRCRLF);
			$FileName = $ExtJSDevDOC . $FileName;
			WFSendLOG("WFFileAbsolute", "LINUX attach repository:" . $FileName);
		}
	}
	else{
		//ON WINDOWS
		if ((substr($FileName,0,2) == '//') || (substr($FileName,0,2) == '\\\\')){
			if ($conn->debug==1) echo('smbclient'. BRCRLF);
			$FileName = $FileName;
			WFSendLOG("WFFileAbsolute", "WINDOWS attach network:" . $FileName);
		}elseif (substr($FileName,1,1) == ':'){
			if ($conn->debug==1) echo('absolute disk'. BRCRLF);
			$FileName = $FileName;
			WFSendLOG("WFFileAbsolute", "WINDOWS attach direct:" . $FileName);
		}elseif (substr($FileName,0,1) == '/'){
			if ($conn->debug==1) echo('direct'. BRCRLF);
			$FileName = $FileName;
			WFSendLOG("WFFileAbsolute", "LINUX attach direct:" . $FileName);
		}elseif (substr($FileName,0,1) == '\\'){
			if ($conn->debug==1) echo('direct'. BRCRLF);
			$FileName = $_SERVER['DOCUMENT_ROOT'] . $FileName;
			WFSendLOG("WFFileAbsolute", "LINUX attach direct:" . $FileName);
		}else{
			if ($conn->debug==1) echo('repository'. BRCRLF);
			$FileName = $ExtJSDevDOC . $FileName;
			WFSendLOG("WFFileAbsolute", "WINDOWS attach repository:" . $FileName);
		}
	}
	
	return $FileName;
	if ($conn->debug==1) echo('<b>FileName</b>:' . $FileName . "<br>\r\n");
}
function WFFileNameExt($FileName){
	//miofile.txt
	$filenamesmb = pathinfo($FileName);
	return $filenamesmb['basename'];
}
function WFFileExt($FileName){
	//txt
	$filenamesmb = pathinfo($FileName);
	if ($filenamesmb){
		return $filenamesmb['extension'];
	}else{
		return '';
	}
}
function WFFileDir($FileName){
	// /dir/appo/
	$filenamesmb = pathinfo($FileName);
	return $filenamesmb['dirname'];
}
function WFFileName($FileName){
	// miofile
	$filenamesmb = pathinfo($FileName);
	return $filenamesmb['filename'];
}
function xcopy($source, $dest, $skipfiles = [], $skipfolders = [], $ifindest = false) {

    // ensure source and destination end in one directory separator
    $source = rtrim($source,DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
    $dest = rtrim($dest,DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;

    // normalise skip arrays and apply defaults
    $skipfolders = array_unique(array_merge(['.git','.ssh','editor'], array_map('rtrim', $skipfolders, array_fill(0, count($skipfolders), DIRECTORY_SEPARATOR))));
    $skipfiles = array_unique(array_merge(['.ds_store','.htaccess','thumbs.db','about.txt','readme.md'], array_map('strtolower', $skipfiles)));

    // examine folders and files using an iterator to avoid exposing functional recursion
    foreach ($iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($source, RecursiveDirectoryIterator::SKIP_DOTS), RecursiveIteratorIterator::SELF_FIRST) as $item) {
        $name = strtolower($iterator->getFilename());
        $path = $iterator->getSubPathName();
        $folders = explode(DIRECTORY_SEPARATOR, empty($iterator->getSubPath()) ? $iterator->getSubPathName() : $iterator->getSubPath()); // subpath is empty at source root folder
        $skip = count(array_intersect($folders,$skipfolders))>0;

        // skip this iteration due to a folder match?
        if ($skip) continue;

        // skip this iteration due to a file match?
        if ($item->isFile() && in_array($name, $skipfiles)) continue;

        if ($item->isDir()) {
            if (!file_exists("{$dest}{$path}")) {

                // create destination folder structure
                mkdir($dest.$path,0775,true);
            }
        } else {
            if ($ifindest) {
                if (!file_exists("{$dest}{$path}")) continue; // copy only if file exists in destination already
            }

            // finally we can copy the file
            copy($path,$dest.$path);
        }
    }
}
function WFFileCSVArray($FileName, $separator = ";"){
	$lines = file($FileName);
	$header = array_shift($lines);
	$records = array_map(function ($line) use ($header) {
		global $separator;
		$records = array_combine(
			str_getcsv($header,$separator),
			str_getcsv($line,$separator)
		);
		return $records;
	}, $lines);
	return $records;
}
//IMPORT EXPORT
function WFImportFile($FileName, $TableDest = 'appoggio', $ExpChr = ';'){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevCodeSWEAN;
	global $ExtJSDevDOC;
	global $ExtJSDB;
	
	//FILE 
	if ((strrpos($FileName,"/")) || (strrpos($FileName,'\\')) || (strrpos($FileName,':'))){
		$FileName = $FileName;
	}else{
		$FileName = $ExtJSDevDOC . $FileName;
	}

	//IMPORTO
	$myfile = fopen($FileName, "r");
	ini_set('max_execution_time', 60*10); 
	if ($myfile) {
		if ($conn->debug==1) echo('<b>WFImportFile</b>:' . $FileName . "<br>\r\n");
		
		//INTESTAZIONE
		$RigaLetta = fgets($myfile);
		$AppoNameCol = explode($ExpChr,$RigaLetta);
		$AppoNameColNum = count($AppoNameCol);
		$i = 1;
		$RegNum = WFVALUENUMREG();
		$OpNum = WFVALUESESSIONPRIV('OPERATORE');
			
		while (($RigaLetta = fgets($myfile)) !== false) {
			$RigaLetta = rtrim($RigaLetta, "\r\n");
			if ($conn->debug==1) echo('<b>RigaLetta</b>:' . $RigaLetta . "<br>\r\n");
			
			$AppoValueRow = explode($ExpChr,$RigaLetta);
			$AppoRecord = array();
			for ($j=0;$j < $AppoNameColNum; $j++){
				$AppoRecord[$AppoNameCol[$j]] = $AppoValueRow[$j];
			}
				
			//$AppoRecord['ID'] = $i;
			$AppoRecord['NUMREG'] = $RegNum;
			$AppoRecord['CT_OPERATORE'] = $OpNum;
			try {   
				$conn->AutoExecute($TableDest, $AppoRecord, 'INSERT');
			} catch (exception $e){
				WFRaiseError(0, $e->getMessage(), 'WFImportFile', '');
			}
			$i++;
		}
		fclose($myfile);
	}else{
		WFRaiseError(0, 'errore, file non esiste', 'WFImportFile', '');
	}
}
function WFExportFile($FileName, $TableOrig = 'appoggio', $ExpChr = ';'){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevCodeSWEAN;
	global $ExtJSDevDOC;
	global $ExtJSDB;
	
	//FILE 
	if ((strrpos($FileName,"/")) || (strrpos($FileName,'\\')) || (strrpos($FileName,':'))){
		$FileName = $FileName;
	}else{
		$FileName = $ExtJSDevDOC . $FileName;
	}


	//IMPORTO
	$myfile = fopen($FileName, "w");
	$explodechr = "\t";
	ini_set('max_execution_time', 60*10); 
	$sql = 'SELECT a.* FROM  (" . TableOrig .") a';	
	$rs = $conn->Execute($sql);
	$RecordCountResult = $rs->RecordCount();
			
	if ($myfile) {
		while (!$rs->EOF) {
			$RigaScritta = implode($ExpChr, $rs->fields);
			fwrite($myfile, $RigaScritta);
			$rs->MoveNext();
		}
		fclose($myfile);
	}else{
		WFRaiseError(0, 'errore, file non accessibile', 'WFExportFile', '');
	}
}

function WFImportXLS($FileName, $TableDest = 'appoggio', $KeyName = 'ID'){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevCodeSWEAN;
	global $ExtJSDevDOC;
	global $ExtJSDB;
	
	//FILE 
	if ((strrpos($FileName,"/")) || (strrpos($FileName,'\\')) || (strrpos($FileName,':'))){
		$FileName = $FileName;
	}else{
		$FileName = $ExtJSDevDOC . $FileName;
	}
	
	require_once dirname(__FILE__) . '/PHPExcel/PHPExcel.php';
	
	$defField = TLookup($conn, $KeyName, $TableDest);
	
	// Create new PHPExcel object
	$objPHPExcel = new PHPExcel();

	try {
		$inputFileType = PHPExcel_IOFactory::identify($FileName);
		$objReader = PHPExcel_IOFactory::createReader($inputFileType);
		$objPHPExcel = $objReader->load($FileName);
	} catch(Exception $e) {
		die('Error loading file "' . pathinfo($FileName,PATHINFO_BASENAME) . '": ' . $e->getMessage());
	}
	
	$AppoRecord = array();
	$AppoRecord['NUMREG'] = WFVALUENUMREG();
	$AppoRecord['CT_OPERATORE'] = WFVALUESESSIONPRIV('OPERATORE');
	
	foreach ($objPHPExcel->getWorksheetIterator() as $worksheet) {
		$worksheetTitle     = $worksheet->getTitle();
		$highestRow         = $worksheet->getHighestRow(); // e.g. 10
		$highestColumn      = $worksheet->getHighestColumn(); // e.g 'F'
		$highestColumnIndex = PHPExcel_Cell::columnIndexFromString($highestColumn);
		$HeaderRecord = array();
		$row = 1;
		for ($col = 0; $col < $highestColumnIndex; ++ $col) {
			$cell = $worksheet->getCellByColumnAndRow($col, $row);
			$val = $cell->getValue();
			$dataType = PHPExcel_Cell_DataType::dataTypeForValue($val);
			$HeaderRecord[$col] = $val;
		}
		for ($row = $row+1; $row <= $highestRow; ++ $row) {
			for ($col = 0; $col < $highestColumnIndex; ++ $col) {
				$cell = $worksheet->getCellByColumnAndRow($col, $row);
				$val = $cell->getValue();
				$AppoRecord[$HeaderRecord[$col]] = $val;
			}
			if($defField == 'number'){
				$sql = "SELECT * 
						FROM " . $TableDest . " 
						WHERE " . $KeyName . " = " . $AppoRecord[$KeyName];
			}else{
				$sql = "SELECT * 
						FROM " . $TableDest . " 
						WHERE " . $KeyName . " = '" . $AppoRecord[$KeyName] . "'";
			}
			$rs = $conn->Execute($sql);
			$RecordCountResult = $rs->RecordCount();
			if ($RecordCountResult == 0) {
				$SqlC = $conn->GetInsertSQL($rs, $AppoRecord);
			}else{
				$SqlC = $conn->GetUpdateSQL($rs, $AppoRecord);
			}
			try {   
				$conn->Execute($SqlC);
			} catch (exception $e){
				WFRaiseError(0, 'WFImportDAT ' . $e->getMessage(), 'WFSQL', '');
			}
		}
	}
}
function WFExportXLS($FileName, $ArrayJSON = array()){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevCodeSWEAN;
	global $ExtJSDevDOC;
	global $ExtJSDB;
	global $UserId;
	//FILE 
	if ((strrpos($FileName,"/")) || (strrpos($FileName,'\\')) || (strrpos($FileName,':'))){
		$FileName = $FileName;
	}else{
		$FileName = $ExtJSDevDOC . $FileName;
	}
	
	require_once dirname(__FILE__) . '/PHPExcel/PHPExcel.php';
	
	// Create new PHPExcel object
	$objPHPExcel = new PHPExcel();

	// Head prop
	$objPHPExcel->getProperties()->setCreator("ExtJSDEV");
	$objPHPExcel->getProperties()->setLastModifiedBy($UserId);
	$objPHPExcel->getProperties()->setTitle("");
	$objPHPExcel->getProperties()->setSubject("");
	$objPHPExcel->getProperties()->setDescription("");

	//Data
	$objPHPExcel->setActiveSheetIndex(0);
	$objPHPExcel->getActiveSheet()->setTitle('Export');

	$col = 0;
	foreach ($ArrayJSON["fields"] as $field){
		$objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow($col, 1, $field->name);
		$col++;
	}

	//data
	$row = 2;
	foreach($ArrayJSON["data"] as $data){
		$col = 0;
		foreach ($fields as $field){
			$objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow($col, $row, $data->$field);
			$col++;
		}
		$row++;
	}
	
	// Save 
	$objWriter = new PHPExcel_Writer_Excel2007($objPHPExcel);
	$objWriter->save(str_replace('.php', '.xlsx', __FILE__));
}
function WFImportDAT($FileName, $TableDest = 'appoggio', $KeyName = 'ID'){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDevCodeSWEAN;
	global $ExtJSDevDOC;
	global $ExtJSDB;
	
	$posizioneQTA = -1;
	$posizioneCODICE = -1;
	$posizioneDATAORA = -1;
	$posizioneOPERATORE = -1;
	
	$myfile = fopen($FileName, "r");
	$explodechr = "\t";
	ini_set('max_execution_time', 60*10); 
	
	if ($myfile) {
		if ($conn->debug==1) echo('<b>WFImportDAT</b>:' . $FileName . BRCRLF);
		$sql = "SELECT * FROM " . $TableDest . " WHERE ID = -1";
		$rsAppoggio = $conn->SelectLimit($sql,1);
		$AppoRecord = array();
		$AppoRecord['ID'] = null;
		$AppoRecord['NUMREG'] = WFVALUENUMREG();
		$AppoRecord['CT_OPERATORE'] = WFVALUESESSIONPRIV('OPERATORE');
		$AppoRecord['QTA'] = 1;
		$RigaLettaCount = -1;
		$DocRigaPKNum = '';
		$DocRigaPKKg = '';
		$DocRigaPKDim = '';
		$DocRigaPK = '';

		while (($RigaLetta = fgets($myfile)) !== false) {
			$DocRigaTipo = '';
			$DocRigaCodice = '';
			$DocRigaArticoloId = '';
			$DocRigaArticoloQta = 1;
			
			$RigaLetta = rtrim($RigaLetta, "\r\n");
			$RigaLetta = trim($RigaLetta);
			if ($RigaLetta == '') goto LeggiRiga;
			if ($conn->debug==1) echo('<b>RigaLetta</b>:' . $RigaLetta . BRCRLF);
			
			/* TROVO STRUTTURA RECORD */
			if ($RigaLettaCount == -1){
				//1012000628534,2016/12/30,10:30:56,031811,0	
				//559.0001;53;2019/01/04 09:38:19
				//trovo carattere di exploding
				$RigaLettaCount = 0; 
				if (strpos($RigaLetta,',') ){ $explodechr = ',';}
				else if (strpos($RigaLetta,';') ){ $explodechr = ';';}
				else if (strpos($RigaLetta,'\t') ){ $explodechr = '\t';}
				else if (strpos($RigaLetta,' ') ){ $explodechr = ' ';}
				if ($conn->debug==1) echo('<b>ExplodeCHR</b>:' . $explodechr . BRCRLF);
				$RecordLetto = explode($explodechr, $RigaLetta);
				//trovo num campi
				if ($explodechr != '' ){ $RigaLettaCount = count($RecordLetto); }
				if ($conn->debug==1) echo('<b>ExplodeNR</b>:' . $RigaLettaCount . BRCRLF);
				//trovo campi aggiuntivi
				if ($RigaLettaCount > 2){
					$posizioneCODICE = 0;
					for ($i = 0; $i < $RigaLettaCount; $i++) {
						if (strpos($RecordLetto[$i],'/')) {
							//data
							$posizioneDATAORA = $i;
						} else if (is_numeric($RecordLetto[$i])) {
							//qta
							$posizioneQTA = $i;
						} else if (strlen($RecordLetto[$i])==6) {
							//codiceterminale
							$posizioneOPERATORE = $i;
						}
					}
				}else{
					$posizioneCODICE = 0;
					$posizioneQTA = 1;
				}					
			}
			
			/* LEGGO I VALORI DAL RECORD */
			$AppoRecord['QTA'] = 1;
			if ($RigaLettaCount > 1 ){
				//esplodo la riga appena letta
				$RecordLetto = explode($explodechr, $RigaLetta);
				$DocRigaCodice = $RecordLetto[$posizioneCODICE];
				$AppoRecord['QTA'] = 1;
				if (strpos($RecordLetto[$posizioneQTA], '+') !== false){
					$AppoRecord['QTA'] = $RecordLetto[$posizioneQTA];
					$AppoRecord['QTA'] = $AppoRecord['QTA'] * -1;
				}else{
					if ($posizioneQTA > 0) $AppoRecord['QTA'] = $RecordLetto[$posizioneQTA];
				}
				if ($posizioneDATAORA > 0) $AppoRecord['DOCDATA' ] = $RecordLetto[$posizioneDATAORA];
			}else{
				$DocRigaCodice = $RigaLetta;
				$AppoRecord['QTA'] = 1;
			}
		
			/* TROVO DOCUMENTO COLLEGATO */
			if ((IsEAN13($DocRigaCodice)) || (strlen($DocRigaCodice) == 12)){
				if ($conn->debug==1) echo('<b>EAN13DEcodifica OK</b>:' . BRCRLF);
				
				//  2o3chr ExtJSDevCodeSWEAN
				//  2chr TipoSequence (identifica la tab in cui si trova l'id di seguito)
				//	7chr Id nella tabella
				
				if (strlen($DocRigaCodice) == 12) {$DocRigaCodice = '0' . $DocRigaCodice;}
				$SourceAZ = substr ($DocRigaCodice, 0 ,3);
				//if ($SourceAZ == $ExtJSDevCodeSWEAN) {
				$DocType = substr ($DocRigaCodice, 3 ,2);
				$DocId = substr($DocRigaCodice, 5,7); 
				$TableName = WFVALUEDLOOKUP('TABLENAME', $ExtJSDevDB . 'sequence', "BARCODEPRECODE = '" . $DocType. "'");
				if ($TableName != ''){
					if ($conn->debug==1) echo('<b>CT_' . $TableName . '</b>:' . $DocId . BRCRLF);
					if ($TableName == 'aaaproc'){
						//SE aaaproc la eseguo
						WFPROCESS($DocId);
						goto LeggiRiga;
					}else{
						$AppoRecord['CT_' . $TableName ] = $DocId;
						goto LeggiRiga;
					}
				}
			}else{
				if ($conn->debug==1) echo('<b>EAN13DEcodifica KO</b>:>' . $DocRigaCodice . '<' . BRCRLF);
			}
			
			/* TROVO LOCAZIONE */
			if((left($DocRigaCodice,1) == 'M') && (mid($DocRigaCodice,3,1) == '-') && (mid($DocRigaCodice,6,1) == '-')){
				//M01-0B-01-03
				if ($conn->debug==1) echo('<b>MAGAPOSIZIONE</b>:' . $DocRigaCodice . BRCRLF);
				$AppoRecord['MAGAPOSIZIONE' ] = $DocRigaCodice;
				goto LeggiRiga;
			}
			
			/* RAGGRUPPO X SCATOLA */
			else if(left($DocRigaCodice,5) == 'A0BOX'){
				$DocRigaPKNum = right($DocRigaCodice, 4);
				$AppoRecord['MAGAPOSIZIONE' ] = "N" . $DocRigaPKNum . "-D" . $DocRigaPKDim . "-K" . $DocRigaPKKg;
				goto LeggiRiga;
			} 
			else if (left($DocRigaCodice,5) == 'A0DIM') {
				$DocRigaPKDim = right($DocRigaCodice, 4);
				$AppoRecord['MAGAPOSIZIONE' ] = "N" . $DocRigaPKNum . "-D" . $DocRigaPKDim . "-K" . $DocRigaPKKg;
				goto LeggiRiga;
			}
			else if (left($DocRigaCodice,5) == 'A0PES'){
				$DocRigaPKKg = right($DocRigaCodice, 4);
				$AppoRecord['MAGAPOSIZIONE' ] = "N" . $DocRigaPKNum . "-D" . $DocRigaPKDim . "-K" . $DocRigaPKKg;
				goto LeggiRiga;
			}
			
			/* TROVO ARTICOLO */
			$AppoRecord['CODICE'] = $DocRigaCodice;
			$DocRigaArticolo = WFVALUEDLOOKUP('ID,CODICE,DESCRIZIONE', 'articoli', "CODICE = '" . $DocRigaCodice . "'");
			if ($DocRigaArticolo == ''){
				$DocRigaArticolo = WFVALUEDLOOKUP('ID,CODICE,DESCRIZIONE', 'articoli', "BARCODE = '" . $DocRigaCodice . "'");
			}
			if ($DocRigaArticolo == ''){
				$DocRigaArticolo = WFVALUEDLOOKUP('ID,CODICE,DESCRIZIONE', 'articoli', "BARCODECRT = '" . $DocRigaCodice . "'");
			}
			if ($DocRigaArticolo == ''){
				$DocRigaArticolo = WFVALUEDLOOKUP('ID,CODICE,DESCRIZIONE', 'articoli', "BARCODEPAL = '" . $DocRigaCodice . "'");
			}
			
			/* articolo non trovato CREO ARTICOLO
				$ArticoloRecord = array();
				$ArticoloRecord["CODICE"] = $DocRigaCodice;
				$ArticoloRecord["DESCRIZIONE"] = $DocRigaCodice;
				$conn->AutoExecute("articoli", $ArticoloRecord, 'INSERT');
				$DocRigaArticoloId = $conn->insert_Id();
				$AppoRecord['CT_ARTICOLI'] = $DocRigaArticoloId; */
			if ($DocRigaArticolo != ''){
				$AppoRecord['CT_ARTICOLI'] = $DocRigaArticolo['ID'];
				$AppoRecord['DESCRIZIONE'] = $DocRigaArticolo['DESCRIZIONE'];
			}
			
			/* CREA RIGA IN APPOGGIO */
			if ($conn->debug==1) echo('<b>ArticoloId</b>:' . $DocRigaCodice . BRCRLF);
			$SqlC = $conn->GetInsertSQL($rsAppoggio, $AppoRecord);
			try {   
				$conn->Execute($SqlC);
			} catch (exception $e){
				WFRaiseError(0, 'WFImportDAT ' . $e->getMessage(), 'WFSQL', '');
			}		
			LeggiRiga:
		}
		fclose($myfile);
	}else{
		WFRaiseError(0, 'WFImportDAT' . 'errore, file non esiste', 'WFImportDAT', '');
	}
}

//INI MANAGEMENT
function ReadINI($valuekey){
	global $dbname;
	$ini_array = parse_ini_file("dbconnection/" . $dbname . ".ini");
	$AppoStr = strtolower($ini_array[$valuekey]);
	switch ($AppoStr) {
		case 'true':
			return true;
			break;
		case 'false':
			return false;
			break;
		default :
			return false;
			//return($AppoStr);
			break;
	}
}
function WriteINI($valuekey){
	global $dbname;
	$ini_array = parse_ini_file("dbconnection/" . $dbname . ".ini");
	return ($ini_array[$valuekey]);
}

/************************************************************************************/
/*                   		  	  FUNC GENERIC	VB											*/
/************************************************************************************/
function Len($valuekey){
	return (strlen($valuekey));
}
function Left($str, $len){
	return substr($str, 0, $len);
}
function Right($str, $len){
	$len = $len * -1;
	return substr($str, $len);
}
function Mid($string, $start, $length){
	$unit = substr($string, $start, $length);
	$unit = trim($unit);
	return $unit;
}
function extractText($string, $start, $end){
	$unit = substr($string, $start, $end - $start + 1);
	$unit = trim($unit);
	return $unit;
}
function InStr($start, $string, $find){
	$find = strtolower($find);
	$string = strtolower($string);
	//$string = substr ( $string, $start, strlen($string) - $start);
	return (strpos($string, $find, $start));
}
function InstrRev($string, $find, $start){
	$find = strtolower($find);
	$string = strtolower($string);
	return strlpos($string, $find);
}
function strlpos($f_haystack,$f_needle) { 
	$rev_str = strrev($f_needle); 
	$rev_hay = strrev($f_haystack); 
	$hay_len = strlen($f_haystack); 
	$ned_pos = strpos($rev_hay,$rev_str); 
	$result  = $hay_len - $ned_pos - strlen($rev_str); 
	return $result; 
} 
function Ucase($String){
	return (strtoupper($String));
}
function Lcase($String){
	return (strtolower($String));
}
function zeroStr($String, $length){
	return str_pad($String, $length, '0', STR_PAD_LEFT);
}
function sortArrayByKey(&$array, $key, $string = false, $asc = true){
    if($string){
        usort($array,function ($a, $b) use(&$key,&$asc) {
			if (!array_key_exists($key,$a))
				return 0;
            elseif (!array_key_exists($key,$b))
				return 0;
            elseif($asc)
				return strcmp(strtolower($a[$key]), strtolower($b[$key]));
            else
				return strcmp(strtolower($b[$key]), strtolower($a[$key]));
        });
    }else{
        usort($array,function ($a, $b) use(&$key,&$asc) {
            if($a[$key] == $b[$key]){return 0;}
            if($asc) 
				return ($a[$key] < $b[$key]) ? -1 : 1;
            else     
				return ($a[$key] > $b[$key]) ? -1 : 1;

        });
    }
}
function extractDictionary($array, $key, $default_value = null) {
    return is_array($array) && array_key_exists($key, $array) ? $array[$key] : $default_value;
}
function dateToLocal($DateDef, $Params = 'Y-m-d', $Localize = 'it'){
	return WFVALUEDATELOCAL($DateDef, $Params, $Localize);
}
function nth_strpos($str, $substr, $n, $start) {
    $ct = 0;
    while ($ct < $n) {
		$start = strpos($str, $substr, $start);
		if ($start === false) break;
		$ct++;
        $start++;
    }
    return $start -1;
}

/************************************************************************************/
/*                   		  	  FUNC 	TESTING											*/
/************************************************************************************/
function IsNumeric($Value){
	if (Int($Value) == $Value) {
		return true;
	} else {
		return false;
	}
}
function IsNullOrEmptyOrZeroString($question){
    if (!isset($question)) return true;
	elseif (!is_array($question)){
		if (trim($question) == 'undefined')  return true;
		elseif (trim($question) == '') return true;
		elseif (trim($question) === 0 ) return true;
		elseif (trim($question) == '0')  return true;
	}
	else return false;
}
function IsNOTNullOrEmptyOrZeroString($question){
    return (!IsNullOrEmptyOrZeroString($question));
}
function NEWIsNullOrEmptyString($question){
    if (!isset($question)) return true;
	elseif (!is_array($question)){
		if (trim($question) == 'undefined')  return true;
		elseif (trim($question) == '') return true;
	}
	else return false;
}
function IsNullOrEmptyString($question){
	if  (is_array($question)){
		if (is_null($question)) return false;
	}
    if (!isset($question)) return 1;
	//php8 elseif (!is_string($question)) return 1; 
    elseif (trim($question) == 'undefined')  return 2;
    elseif (trim($question) == '') return 3;
	else {
		if (is_null($question)) return false;
	}
	return false;
}
function IsNOTNullOrEmptyString($question){
    return (!IsNullOrEmptyString($question));
}
function Nz($Field, $InCaseOfNullOrZero){
	if (($Field == NULL) || (trim($Field)==='') || (trim($Field)==0))
		return $InCaseOfNullOrZero;
	else
		return $Field;
}
function IsNumericID($Value){
	if ((Int($Value) == $Value) && ($Value != 0)) {
		return true;
	} else {
		return false;
	}
}
function IsDate($date, $format = 'Y-m-d H:i:s'){
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) == $date;
}
function IsNull($val, $replace){
    if( is_null($val) || $val == '' )  return $replace;
    else                                return $val;
}
function microtime_float(){
    list($usec, $sec) = explode(" ", microtime());
    return ((float)$usec + (float)$sec);
}
function preg_sql_like ($input, $pattern, $escape = '\\') {
	$pattern = str_replace("*", "%", $pattern);
    // Split the pattern into special sequences and the rest
    $expr = '/((?:'.preg_quote($escape, '/').')?(?:'.preg_quote($escape, '/').'|%|_))/';
    $parts = preg_split($expr, $pattern, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);

    // Loop the split parts and convert/escape as necessary to build regex
    $expr = '/^';
    $lastWasPercent = FALSE;
    foreach ($parts as $part) {
        switch ($part) {
            case $escape.$escape:
                $expr .= preg_quote($escape, '/');
                break;
            case $escape.'%':
                $expr .= '%';
                break;
            case $escape.'_':
                $expr .= '_';
                break;
            case '%':
                if (!$lastWasPercent) {
                    $expr .= '.*?';
                }
                break;
            case '_':
                $expr .= '.';
                break;
            default:
                $expr .= preg_quote($part, '/');
                break;
        }
        $lastWasPercent = $part == '%';
    }
    $expr .= '$/i';

    // Look for a match and return bool
    return (bool) preg_match($expr, $input);

}
if (!function_exists('str_contains')) {
    function str_contains(string $haystack, string $needle): bool {
        return '' === $needle || false !== strpos($haystack, $needle);
    }
}
function microtime_diff($startMicrotime){
    $endMicrotime = microtime(true);

    // Calculate the difference
    $elapsed = $endMicrotime - $startMicrotime;

    // Format the elapsed time
    $minutes = floor( ($elapsed / 60 ));
    $seconds = fmod($elapsed, 60); 

    // Return the formatted string
    return sprintf("%02d:%.4f",  $minutes, $seconds);
}


/************************************************************************************/
/*                   		  	  FUNC 	CONVERSION									*/
/************************************************************************************/
function Cint($Value){
	return (intval(strval($Value)));
}
function Int($Value){
	return ($a = preg_replace('/[^\-\d]*(\-?\d*).*/', '$1', $Value)) ? $a : '0';
}
function Cdec($Value){
    $Value = str_replace('€','', $Value);
    $Value = str_replace('EUR','', $Value);
    $Value = str_replace('E','', $Value);
	$Value = preg_replace('/[^0-9\-\.,]/', '', $Value);
	
	if ( (strpos( $Value, '.') == true) and ( strpos( $Value, ',') == true) ){
    	$Value = str_replace(".","",$Value);
	}
	
	$Value = str_replace(" ","",$Value);
	$Value = str_replace("'","",$Value);
	$Value = str_replace(",",".",$Value);
    $Value = preg_replace('/\.(?=.*\.)/', '', $Value);
	
    return floatval($Value);
}

function Now(){
	return date("Y-m-d H:i:s", time());
}
function num2time($inputSeconds){

	$secondsInAMinute = 60;
	$secondsInAnHour = 60 * $secondsInAMinute;
	$secondsInADay = 24 * $secondsInAnHour;

	// extract days
	$days = floor($inputSeconds / $secondsInADay);

	// extract hours
	$hourSeconds = $inputSeconds % $secondsInADay;
	$hours = floor($hourSeconds / $secondsInAnHour);

	// extract minutes
	$minuteSeconds = $hourSeconds % $secondsInAnHour;
	$minutes = floor($minuteSeconds / $secondsInAMinute);

	// extract the remaining seconds
	$remainingSeconds = $minuteSeconds % $secondsInAMinute;
	$seconds = ceil($remainingSeconds);

	// return the final array
	$obj = array(
		'd' => (int)$days,
		'h' => (int)$hours,
		'm' => (int)$minutes,
		's' => (int)$seconds,
	);
	return $obj;
}

function unixdate2date($str, $zone = 'Europe/Rome'){
	$dt = new DateTime();
	$dt->setTimezone(new DateTimeZone("UTC"));
	$dt->setTimestamp($str);
	return $dt;
}	
function date2unixtime($dobj){
	return $dobj->format('U'); 
}
function date2unixtimegmt($dobj, $gmt = false){
	return $gmt ? time() : $dobj->format('U') + (int) ( $dobj->format('P') * 3600 );
}

function string2datetime($str = null, $format = 'Y-m-d H:i:s', $zone = 'Europe/Rome'){
	$prog = new DateTime('now');
	$prog->setTimezone(new DateTimeZone($zone));
	if ($str){
		$CDatetTimeArray = explode(" ", $str);
		$CDate = $CDatetTimeArray[0];
		$CTime = $CDatetTimeArray[1];
		$CDateArray = explode("-", $CDate);
		$CTimeArray = explode(":", $CTime);
		$prog->setDate($CDateArray[0],$CDateArray[1],$CDateArray[2]);
		$prog->setTime($CTimeArray[0],$CTimeArray[1],$CTimeArray[2]);
	}
	return $prog;
}
function datetime2string($dobj){
	return ($dobj->format('Y-m-d H:i:s')); 
}

function getCoordinatesFromAddress($address) {
    $api_key = 'TUO_API_KEY'; // Sostituisci con la tua chiave API di Google Maps
    $address = urlencode($address);

    $url = "https://maps.googleapis.com/maps/api/geocode/json?address={$address}&key={$api_key}";

    // Esegui la richiesta HTTP
    $response = file_get_contents($url);

    // Decodifica la risposta JSON
    $data = json_decode($response);

    if ($data->status === "OK" && isset($data->results[0]->geometry->location)) {
        $lat = $data->results[0]->geometry->location->lat;
        $lng = $data->results[0]->geometry->location->lng;

        return array('lat' => $lat, 'lng' => $lng);
    } else {
        return false; // Indirizzo non trovato o errore nella richiesta
    }
}

/*function money_format($format, $number) 
{ 
 setlocale(LC_MONETARY, 'it_IT');
 $regex  = '/%((?:[\^!\-]|\+|\(|\=.)*)([0-9]+)?'. 
           '(?:#([0-9]+))?(?:\.([0-9]+))?([in%])/'; 
 if (setlocale(LC_MONETARY, 0) == 'C') { 
     setlocale(LC_MONETARY, ''); 
 } 
 $locale = localeconv(); 
 preg_match_all($regex, $format, $matches, PREG_SET_ORDER); 
 foreach ($matches as $fmatch) { 
     $value = floatval($number); 
     $flags = array( 
         'fillchar'  => preg_match('/\=(.)/', $fmatch[1], $match) ? 
                        $match[1] : ' ', 
         'nogroup'   => preg_match('/\^/', $fmatch[1]) > 0, 
         'usesignal' => preg_match('/\+|\(/', $fmatch[1], $match) ? 
                        $match[0] : '+', 
         'nosimbol'  => preg_match('/\!/', $fmatch[1]) > 0, 
         'isleft'    => preg_match('/\-/', $fmatch[1]) > 0 
     ); 
     $width      = trim($fmatch[2]) ? (int)$fmatch[2] : 0; 
     $left       = trim($fmatch[3]) ? (int)$fmatch[3] : 0; 
     $right      = trim($fmatch[4]) ? (int)$fmatch[4] : $locale['int_frac_digits']; 
     $conversion = $fmatch[5]; 

     $positive = true; 
     if ($value < 0) { 
         $positive = false; 
         $value  *= -1; 
     } 
     $letter = $positive ? 'p' : 'n'; 

     $prefix = $suffix = $cprefix = $csuffix = $signal = ''; 

     $signal = $positive ? $locale['positive_sign'] : $locale['negative_sign']; 
     switch (true) { 
         case $locale["{$letter}_sign_posn"] == 1 && $flags['usesignal'] == '+': 
             $prefix = $signal; 
             break; 
         case $locale["{$letter}_sign_posn"] == 2 && $flags['usesignal'] == '+': 
             $suffix = $signal; 
             break; 
         case $locale["{$letter}_sign_posn"] == 3 && $flags['usesignal'] == '+': 
             $cprefix = $signal; 
             break; 
         case $locale["{$letter}_sign_posn"] == 4 && $flags['usesignal'] == '+': 
             $csuffix = $signal; 
             break; 
         case $flags['usesignal'] == '(': 
         case $locale["{$letter}_sign_posn"] == 0: 
             $prefix = '('; 
             $suffix = ')'; 
             break; 
     } 
     if (!$flags['nosimbol']) { 
         $currency = $cprefix . 
                     ($conversion == 'i' ? $locale['int_curr_symbol'] : $locale['currency_symbol']) . 
                     $csuffix; 
     } else { 
         $currency = ''; 
     } 
     $space  = $locale["{$letter}_sep_by_space"] ? ' ' : ''; 

     $value = number_format($value, $right, $locale['mon_decimal_point'], 
              $flags['nogroup'] ? '' : $locale['mon_thousands_sep']); 
     $value = @explode($locale['mon_decimal_point'], $value); 

     $n = strlen($prefix) + strlen($currency) + strlen($value[0]); 
     if ($left > 0 && $left > $n) { 
         $value[0] = str_repeat($flags['fillchar'], $left - $n) . $value[0]; 
     } 

     $value = implode($locale['mon_decimal_point'], $value); 
     if ($locale["{$letter}_cs_precedes"]) { 
         $value = $prefix . $currency . $space . $value . $suffix; 
     } else { 
         $value = $prefix . $value . $space . $currency . $suffix; 
     } 
     if ($width > 0) { 
         $value = str_pad($value, $width, $flags['fillchar'], $flags['isleft'] ? 
                  STR_PAD_RIGHT : STR_PAD_LEFT); 
     } 

     $format = str_replace($fmatch[0], $value, $format); 
 } 
 return $format; 
} 
*/
function CdecSTD($Value, $Precision = 2, $Comma = false){
    $Value = str_replace('€','', $Value);
    $Value = str_replace('EUR','', $Value);
    $Value = str_replace('E','', $Value);
	$Value = preg_replace('/[^0-9\-\.,]/', '', $Value);
	
	if ( (strpos( $Value, '.') == true) and ( strpos( $Value, ',') == true) ){
    	$Value = str_replace(".","",$Value);
	}
	$Value = str_replace(" ","",$Value);
	$Value = str_replace("'","",$Value);
	$Value = str_replace(",",".",$Value);
    $Value = preg_replace('/\.(?=.*\.)/', '', $Value);
	$Value = floatval($Value);
	$Value = number_format($Value,$Precision);
	$Value = str_replace(",","",$Value);
	if ($Comma) $Value = str_replace(".",",",$Value);
	return  strval($Value);
}
function CurrencyChange( $value = 0, $currencyFrom = 'EUR', $currencyTO = 'USD', $date = 'latest') {
	global $_SESSION;
	global $CurrencyLastJSON;
	global $conn;
	$req_url = 'http://api.exchangeratesapi.io/v1/'. $date . '?access_key=' . '43bc9514d1053a34c8149665763b42bf';
	$CurrencyLastDate = WFVALUESESSIONPRIV('CURRENCYDATE');
	$buffered = false;
	$response_json = false;
	if ($conn->debug)  echo('CurrencyChange') . BRCRLF;
	if (IsNullOrEmptyString($CurrencyLastDate)){
		if ($conn->debug)  echo('CurrencyChange REQUEST') . BRCRLF;
		WFVALUESESSIONSETPRIV('CURRENCYDATE' , $date);
		WFVALUESESSIONSETPRIV('CURRENCYJSON' , "");
		$CurrencyLastDate = $date;
		$buffered = false;
		$response_json = file_get_contents($req_url);
		if ($conn->debug) echo($response_json) . BRCRLF;
		WFVALUESESSIONSETPRIV('CURRENCYJSON' , $response_json);
	}else{
		if ($CurrencyLastDate != $date){
			if ($conn->debug)  echo('CurrencyChange OLD REquery') . BRCRLF;
			$buffered = false;
			$response_json = file_get_contents($req_url);
			WFVALUESESSIONSETPRIV('CURRENCYJSON' , $response_json);
		}else{
			if ($conn->debug)  echo('CurrencyChange OLD OK') . BRCRLF;
			$buffered = true;
			$response_json = WFVALUESESSIONPRIV('CURRENCYJSON');
		}
		
	}
	if ($conn->debug)  echo('CurrencyChange:>' . $response_json . "<") . BRCRLF;
	if(false !== $response_json) {
		try {
			$response_object = json_decode($response_json);
			$rate = 0.0001;
			if ($conn->debug)  var_dump($currencyTO) . BRCRLF;
			if ($conn->debug)  var_dump($response_object->rates->{$currencyTO} ) . BRCRLF;
			$rate = $response_object->rates->{$currencyTO};
			if ($conn->debug)  echo('CurrencyChange: RATE: ' .$rate ) . BRCRLF;
			return round(($value / $rate), 2);
		}
		catch(Exception $e) {
			if ($conn->debug)  echo('CurrencyChange: FAIL JSON' ) . BRCRLF;
			return null;
		}
	}
}

function utf8ize($mixed){
	if (is_array($mixed)) {
		foreach ($mixed as $key => $value) {
			$mixed[$key] = utf8ize($value);
		}
	} else if (is_string($mixed)) {
		return iconv("ISO-8859-1", "UTF-8", $mixed);
	}
}
function StringAZ09($string){
	$string = str_replace("&nbsp;", '', $string);
	$string = preg_replace('/[^A-Za-z0-9\- ]/', '', $string); // Removes special chars.
	return preg_replace('/-+/', '-', $string); // Replaces multiple hyphens with single one.
}
function StringAZ09Special($string){
	$string = str_replace("&nbsp;", '', $string);
	$string = preg_replace('/[^A-Za-z0-9#:,{}.\ ]/', '', $string); // Removes special chars.
	return preg_replace('/-+/', '-', $string); // Replaces multiple hyphens with single one.
	return $string;
}
function sanitize($string, $Type = '',$LunghezzaMax = '') {

    $chr_map = array(
       // Windows codepage 1252
       "\xC2\x82" => "'", // U+0082⇒U+201A single low-9 quotation mark
       "\xC2\x84" => '"', // U+0084⇒U+201E double low-9 quotation mark
       "\xC2\x8B" => "'", // U+008B⇒U+2039 single left-pointing angle quotation mark
       "\xC2\x91" => "'", // U+0091⇒U+2018 left single quotation mark
       "\xC2\x92" => "'", // U+0092⇒U+2019 right single quotation mark
       "\xC2\x93" => '"', // U+0093⇒U+201C left double quotation mark
       "\xC2\x94" => '"', // U+0094⇒U+201D right double quotation mark
       "\xC2\x9B" => "'", // U+009B⇒U+203A single right-pointing angle quotation mark

       // Regular Unicode     // U+0022 quotation mark (")
                              // U+0027 apostrophe     (')
       "\xC2\xAB"     => '"', // U+00AB left-pointing double angle quotation mark
       "\xC2\xBB"     => '"', // U+00BB right-pointing double angle quotation mark
       "\xE2\x80\x98" => "'", // U+2018 left single quotation mark
       "\xE2\x80\x99" => "'", // U+2019 right single quotation mark
       "\xE2\x80\x9A" => "'", // U+201A single low-9 quotation mark
       "\xE2\x80\x9B" => "'", // U+201B single high-reversed-9 quotation mark
       "\xE2\x80\x9C" => '"', // U+201C left double quotation mark
       "\xE2\x80\x9D" => '"', // U+201D right double quotation mark
       "\xE2\x80\x9E" => '"', // U+201E double low-9 quotation mark
       "\xE2\x80\x9F" => '"', // U+201F double high-reversed-9 quotation mark
       "\xE2\x80\xB9" => "'", // U+2039 single left-pointing angle quotation mark
       "\xE2\x80\xBA" => "'", // U+203A single right-pointing angle quotation mark
    );

    if ( $Type == "IsBasicLatin" ) {

        $unwanted_array = array(    'Š'=>'S', 'š'=>'s', 'Ž'=>'Z', 'ž'=>'z', 'À'=>'A', 'Á'=>'A', 'Â'=>'A', 'Ã'=>'A', 'Ä'=>'A', 'Å'=>'A', 'Æ'=>'A', 'Ç'=>'C', 'È'=>'E', 'É'=>'E',
                            'Ê'=>'E', 'Ë'=>'E', 'Ì'=>'I', 'Í'=>'I', 'Î'=>'I', 'Ï'=>'I', 'Ñ'=>'N', 'Ò'=>'O', 'Ó'=>'O', 'Ô'=>'O', 'Õ'=>'O', 'Ö'=>'O', 'Ø'=>'O', 'Ù'=>'U',
                            'Ú'=>'U', 'Û'=>'U', 'Ü'=>'U', 'Ý'=>'Y', 'Þ'=>'B', 'ß'=>'Ss', 'à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a', 'å'=>'a', 'æ'=>'a', 'ç'=>'c',
                            'è'=>'e', 'é'=>'e', 'ê'=>'e', 'ë'=>'e', 'ì'=>'i', 'í'=>'i', 'î'=>'i', 'ï'=>'i', 'ð'=>'o', 'ñ'=>'n', 'ò'=>'o', 'ó'=>'o', 'ô'=>'o', 'õ'=>'o',
                            'ö'=>'o', 'ø'=>'o', 'ù'=>'u', 'ú'=>'u', 'û'=>'u', "ü" => "u", 'ý'=>'y', 'þ'=>'b', 'ÿ'=>'y' );

        $string = strtr( $string, $unwanted_array );

        $string = preg_replace('/[^\x{0020}-\x{007E}]+/u', '', $string);

    }
    elseif ( $Type == "IsLatin" ) {

        $unwanted_array = array(  'Š'=>'S', 'š'=>'s', 'Ž'=>'Z', 'ž'=>'z' );

        $string = strtr( $string, $unwanted_array );

        $string = preg_replace('/[^\x{0020}-\x{007E}\x{00A0}-\x{00FF}]+/u', '', $string);

    }

    //  CONVERTI GLI ACCENTI FUORI DAL RANGE IN APICI AMMESSI:

    $chr = array_keys  ($chr_map); // but: for efficiency you should

    $rpl = array_values($chr_map); // pre-calculate these two arrays

    $string = str_replace($chr, $rpl, html_entity_decode($string, ENT_QUOTES, "UTF-8"));




    $string = htmlspecialchars(str_replace(PHP_EOL, " ", $string));

    if ( $LunghezzaMax != "" ) {
        $string = substr($string, 0, $LunghezzaMax);
    }

    return $string;
}
/*function utf8_encode($string){
	return iconv("ISO-8859-1", "UTF-8", $string);
}
*/

function GenerateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}
function array_key_diff($ar1, $ar2) {  // , $ar3, $ar4, ... 
    // returns copy of array $ar1 with those entries removed 
    // whose keys appear as keys in any of the other function args 
    $aSubtrahends = array_slice(func_get_args(),1); 
    foreach ($ar1 as $key => $val) 
        foreach ($aSubtrahends as $aSubtrahend) 
            if (is_array($aSubtrahend) && array_key_exists($key, $aSubtrahend)) 
                unset ($ar1[$key]); 
    return $ar1; 
} 
function str_padtrim($input, $pad_length, $pad_string, $pad_type, $decimal = ''){
	if ($decimal != ''){
		$input = str_replace(".", $decimal, $input);
	}
	$input = trim($input);
	$input = substr($input, 0, $pad_length); 
	$input = trim($input);
	return str_pad($input,$pad_length,$pad_string,$pad_type);
}
function getBody($content) {
    preg_match("/<body[^>]*>(.*?)<\/body>/is", $content, $matches);
    return $matches[1];
}

function DMS2Decimal($degrees = 0, $minutes = 0, $seconds = 0, $direction = 'n') {
   //converts DMS coordinates to decimal
   //returns false on bad inputs, decimal on success
    $direction = strtolower($direction);
   //direction must be n, s, e or w, case-insensitive
   $d = strtolower($direction);
   $ok = array('n', 's', 'e', 'w');
    
   //degrees must be integer between 0 and 180
   if(!is_numeric($degrees) || $degrees < 0 || $degrees > 180) {
      $decimal = false;
   }
   //minutes must be integer or float between 0 and 59
   elseif(!is_numeric($minutes) || $minutes < 0 || $minutes > 59) {
      $decimal = false;
   }
   //seconds must be integer or float between 0 and 59
   elseif(!is_numeric($seconds) || $seconds < 0 || $seconds > 59) {
      $decimal = false;
   }
   elseif(!in_array($d, $ok)) {
      $decimal = false;
   }
   else {
      //inputs clean, calculate
      $decimal = $degrees + ($minutes / 60) + ($seconds / 3600);
       
      //reverse for south or west coordinates; north is assumed
      if($d == 's' || $d == 'w') {
         $decimal *= -1;
      }
   }
    
   return $decimal;
}
function DMSString2Decimal($stringa = '', $direction = 'n') {
    $ddeg = strpos($stringa, 'deg');
    $dmin = strpos($stringa, 'min');
    
    $degree = trim(substr($stringa, 0, $ddeg));
    $minutes = trim(substr($stringa, $ddeg +3,$dmin - ($ddeg +3)));
    return DMS2Decimal($degree,$minutes,0,$direction);
    
}
function GPSDistance($lat1, $lon1, $lat2, $lon2, $unit = 'KM') {
  if (($lat1 == $lat2) && ($lon1 == $lon2)) {
    return 0;
  }
  else {
    $theta = $lon1 - $lon2;
    $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
    $dist = acos($dist);
    $dist = rad2deg($dist);
    $miles = $dist * 60 * 1.1515;
    $unit = strtoupper($unit);

    if ($unit == "KM") {
		//km
      return ($miles * 1.609344);
    } else if ($unit == "N") {
		//nautical
      return ($miles * 0.8684);
    } else {
		//miles
      return $miles;
    }
  }
}


/************************************************************************************/
/*                   		  	  FIND TYPE FIELD IN DB								*/
/************************************************************************************/
function SessionPriv($varname){
	return WFVALUESESSIONPRIV($varname);
}
function SessionSetPriv($varName, $varValue){
	return WFVALUESESSIONSETPRIV($varName, $varValue);
}
function UserVar($varName = 'ID' ){
	return WFVALUEUSERVAR($varName);
}
function UserVarSet($varName, $varValue){
	return WFVALUEUSERVARSET($varName, $varValue);
}
function GlobalVar($varName){
	return WFVALUEGLOBAL($varName);
}
function GlobalVarSet($varName, $varValue){
	return WFVALUEGLOBALSET($varName, $varValue);
}

function DLookup($cn, $fld, $tab, $whr, $FieldMode = ADODB_FETCH_BOTH,$order = ''){
	global $output;
	global $debugmessage;
	//find data(value) in TABLE OR SELECT where condition
	if (strrpos(" " . strtoupper($tab),"SELECT") > 0){
		$incapsulated = false;
		if (strrpos($tab, 'ORDER') !== false) {
			$incapsulated = true;
			$tab = "SELECT * FROM (" . $tab .") a ";
		}
		if (strrpos($whr, '.') === false) {
			$incapsulated = true;
			$tab = "SELECT * FROM (" . $tab .") a ";
		}
		if ($incapsulated) {
			$sql = $tab . " WHERE " . $whr;
		}else{
			if (strrpos($tab, 'WHERE') !== false) {
				$sql = $tab . " AND " . $whr;
			} else {
				$sql = $tab . " WHERE " . $whr;
			}
		}
	} else {
		$sql = "SELECT " . $fld . " FROM " . $tab . " WHERE " . $whr;
	}
	if ($order != ''){
		$sql = $sql . ' ORDER BY ' . $order;
	}
	$Appo = "";
	//$cn->SetFetchMode(ADODB_FETCH_NUM);
	//$cn->SetFetchMode(ADODB_FETCH_BOTH);
	//$cn->SetFetchMode(ADODB_FETCH_DEFAULT);
	//$cn->SetFetchMode(ADODB_FETCH_ASSOC);
	//$FetchModeOriginal = $cn->getFetchMode(); 
	$cn->SetFetchMode($FieldMode);
	if ($cn->debug==1) {
		$start_time = microtime(true); 
		try {
			$rs = $cn->execute($sql);
		}catch(Exception $e){
			$output["failure"] = true; 
			$output["success"] = false;
			$output["message"] = 'dlookup ' . $e->getMessage();
			echo Array2JSON($output, $debugmessage);
			die();
			return $Appo;
		}
		echo 'Timer' . microtime_diff($start_time) . BRCRLF;
	}else{
		$rs = $cn->execute($sql);
	}
	if ($rs !== false) {
		if (!$rs->EOF)  {
			$ArrayField = false;
			if ($rs->FieldCount() > 1){
				if (strrpos($fld,",") > 0) {$ArrayField = true;}
				elseif ($fld == '*') {$ArrayField = true;}
				elseif (strrpos($fld,"(") > 0) {$ArrayField = true;}
				elseif (strrpos($fld," as ") > 0) {$ArrayField = true;}
				if ($ArrayField == true){
					$Appo = array();
					$Appo = object_clone($rs->fields);
				}else{
					if (is_array($rs->fields) && array_key_exists ($fld, $rs->fields)) {
						$Appo = $rs->fields[$fld];
					}
				}
			}else{
				$Appo = $rs->fields[0];
			}
			$rs->Close();
		}
	}else{
		$Appo = 'ERROR ' . $fld . ' DEFINITION NOT EXIST';
	}
	$rs = null;
	//$cn->SetFetchMode($FetchModeOriginal);
	return $Appo;
}
function TLookup($cn, $fld, $tab){
	global $output;
	global $debugmessage;
	//find field(DEFINITION) in table where condition
	$Appo = "";
	$filtertype = '';
	global $conn;
	global $dbname;
	if (strrpos(" " . strtoupper($tab),"SELECT") > 0){
		$sql = $tab ;
	}else{
		$sql = "SELECT " . $fld . " FROM " . $tab;
	}
	//LANCIO SQL
	$rs = $cn->SelectLimit($sql,1,-1);
	if ($rs){
		$Appo = $rs->fields[$fld];
		$fld = $rs->FetchField($fld);
		$type = $rs->MetaType($fld->type);
		if ($type == 'C') { $filtertype = 'string'; }  //VCHR
		if ($type == 'X') { $filtertype = 'string'; }  //CLOB
		if ($type == 'I') { $filtertype = 'number'; }  //INT
		if ($type == 'N') { $filtertype = 'string'; }  //NUM (DEC)
		if ($type == 'D') { $filtertype = 'date';   }  //DATE
		if ($type == 'L') { $filtertype = 'string'; }  //BIT
		if ($type == 'R') { $filtertype = 'number'; }  //COUNT
		if ($type == 'T') { $filtertype = 'string'; }  //TIMESTAMP
		$rs->Close();
	}
	
	$rs = null;
	return $filtertype;
}
function ALookup($fld = 0, $array, $arrayCol = 1, $whrfld = 0, $whr){
	//find data(value) in ARRAY where condition
	if ($arrayCol < 1) $arrayCol = 1;
	$arr_length = count($array); 
	for($i = 0; $i<$arr_length; $i = $i + $arrayCol){ 
		if (preg_sql_like($array[$i + $whrfld],$whr)){
			if ($i + $fld < $arr_length) {
				return $array[$i + $whrfld + $fld];
			}else{
				return '';
			}
		}
	}
	return  'ERROR ->' . $whr . '<- DEFINITION NOT EXIST IN' . implode(";",$array);
}
function getRows($cn, $fld, $tab, $whr = '1=1', $limit = 0, $FieldMode = ADODB_FETCH_BOTH, $order = '' ){
	//find data(value) in TABLE OR SELECT where condition
	if (strrpos(" " . strtoupper($tab),"SELECT") > 0){
		$incapsulated = false;
		if (strrpos($tab, 'ORDER') !== false) {
			$incapsulated = true;
			$tab = "SELECT * FROM (" . $tab .") a ";
		}
		if (strrpos($whr, '.') === false) {
			$incapsulated = true;
			$tab = "SELECT * FROM (" . $tab .") a ";
		}
		if ($incapsulated) {
			$sql = $tab . " WHERE " . $whr;
		}else{
			if (strrpos($tab, 'WHERE') !== false) {
				$sql = $tab . " AND " . $whr;
			} else {
				$sql = $tab . " WHERE " . $whr;
			}
		}
	} else {
		$sql = "SELECT " . $fld . " FROM " . $tab . " WHERE " . $whr;
	}
	if ($order != ''){
		$sql = $sql . ' ORDER BY ' . $order;
	}
	$Appo = "";
	$i = 1;
	$AppoRows = array();
	$cn->SetFetchMode($FieldMode);
	$rs = $cn->execute($sql);
	if ($rs !== false) {
		$ArrayField = false;
		if ($rs->FieldCount() > 1){
			if (strrpos($fld,",") > 0) {$ArrayField = true;}
			elseif ($fld == '*') {$ArrayField = true;}
		}
		while (!$rs->EOF) {		
			if ($ArrayField == true){
				$Appo = array();
				$Appo = object_clone($rs->fields);
			}else{
				$Appo = $rs->fields[$fld];
			}
			$AppoRows[] = $Appo;
			$i = $i +1;
			$rs->moveNext();
			if ( ($limit > 0 ) && ($i > $limit) ){ break;}
		}
		$rs->Close();
	}else{
		$AppoRows = 'ERROR ' . $fld . ' DEFINITION NOT EXIST';
	}
	$rs = null;
	return $AppoRows;
}

/************************************************************************************/
/*                   		  	  DEBUG 											*/
/************************************************************************************/
//FUNC DEBUG LOG ERROR
function WFDEBUG($Enable = true){
	WFSetDebug($Enable);
}
function WFMSGLOG($msg) {
	WFSendLOG('',$msg);
}
function WFVARLOG($var) {
	$msg = var_dumpToString($var);
	WFSendLOG('',$msg);
}
function WFSetDebug($Enable = true){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $ExtJSForceDebug;
	if ($Enable) {
		error_reporting(E_ALL);
		ini_set('display_errors', 1);
		$conn->debug = 1; 
		WFVALUESESSIONSETPRIV('debug','true');
		//$conn->execute("SET GLOBAL log_output = 'TABLE';");
		//$conn->execute("SET GLOBAL general_log = 'ON';");
		//$conn->execute("truncate mysql.general_log;");
	}else{
		//$conn->execute("SET GLOBAL log_output = 'TABLE';");
		//$conn->execute("SET GLOBAL general_log = 'OFF';");
	}
	//OVERRIDE TEST BUTTON
	if (WFVALUESESSIONPRIV('ForceDebug') == 'true' ) {
		error_reporting(E_ALL);
		ini_set('display_errors', 1);
		$conn->debug=1; 
		WFVALUESESSIONSETPRIV('debug','true');
	};
}
function WFSendLOG($program, $message, $timer = 0, $error = false){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $ExtJSDevLOG;
	global $ExtCurrentProcess;
	global $RegistrationId;
	global $LayoutId;
	
	if (($conn->debug) || ($error == true)) {
		$statusdebug = $conn->debug; 
		$conn->debug =0;
		$current_time = date("Y-m-d H:i:s");
		$log_file_descriptor = fopen($ExtJSDevLOG . "logs" . date("Ymd") . ".log", "a");
		fwrite($log_file_descriptor, $current_time . " - ".  $timer . " - ". $message . PHP_EOL);
		fclose($log_file_descriptor);
		
		$sql = "SELECT * FROM " . $ExtJSDevDB . "logs WHERE ID = -1";
		$rs = $conn->Execute($sql);
		$record2 = array();
		$record2['PROCESS'] = $ExtCurrentProcess;
		$record2['PROGRAM'] = $program;
		$record2['TIMER'] = $timer;
		$record2['CT_AAALAYOUT'] = $LayoutId;
		$record2['NUMREG'] = $RegistrationId;
		$record2['MESSAGE'] = $message;
		$SqlC = $conn->GetInsertSQL($rs, $record2);
		$conn->Execute($SqlC);
   		$conn->debug = $statusdebug; 
	}
}
function WFLOGUSER($UserId,$table,$ctid,$command,$type){
	global $conn;
	global $ExtJSDevDB;
	
	$statusdebug = $conn->debug; 
	$conn->debug =0;
	$date = new DateTime();
	$recordlog = array();
	$recordlog['CT_AAAUSER'] = $UserId;
	$recordlog['CT_TABLE'] = $table;
	$recordlog['CT_ID'] = $ctid;
	$recordlog['SQLCOMMAND'] = $command;
	$recordlog['TYPE'] = $type;
	$recordlog['SI'] = $date->getTimestamp();
	$conn->AutoExecute($ExtJSDevDB . "logsuser", $recordlog, 'INSERT');
	$recordlogId = $conn->Insert_ID();
	$appo = $conn->UpdateClob($ExtJSDevDB . "logsuser", 'SQLCOMMAND', $command,"ID = " . $recordlogId);
	$conn->debug = $statusdebug; 
}
function WFNOTIFY($UserId,$table,$ctid,$command,$type){
	global $conn;
	global $output;
	global $ExtJSDevDB;
	global $NotifyRecord;
	
	$output['notify'] = null;
	$output['notifyFind'] = null;
	$sql = "SELECT * 
			FROM " . $ExtJSDevDB . "notify 
			WHERE CT_TABLE = '" . $table . "' 
				AND CT_AAAPROC is not null ";
				if     ($type =='INS' ) $sql = $sql . " AND (EVENT_INSERT = 1)";
				elseif ($type =='DEL' ) $sql = $sql . " AND (EVENT_DELETE = 1)";
				elseif ($type =='UPD' ) $sql = $sql . " AND (EVENT_UPDATE = 1)";
	if ($conn->debug) echo($sql) . BRCRLF;
	$rsNotify = $conn->Execute($sql);
	if ($rsNotify) {
		while (!$rsNotify->EOF) {
			$ID  = $rsNotify->fields['ID'];
			$CT_AAAPROC  = $rsNotify->fields['CT_AAAPROC'];
			$output['notify'] = $output['notify']. ' Present tab ' . $table . BRCRLF;
			$sql = "SELECT * 
					FROM " . $table . " 
					WHERE ID = " . $ctid . " " ;
						if ($rsNotify->fields['SEEDAVALUE'] != '') { if (IsNumeric($rsNotify->fields['SEEDAVALUE'])) {$sql = $sql . " AND (" . $rsNotify->fields['SEEDA'] . " = " . $rsNotify->fields['SEEDAVALUE'] . ")";} else {$sql = $sql . " AND (" . $rsNotify->fields['SEEDA'] . " " . $rsNotify->fields['SEEDAVALUE'] . ")";}}
						if ($rsNotify->fields['SEEDBVALUE'] != '') { if (IsNumeric($rsNotify->fields['SEEDBVALUE'])) {$sql = $sql . " AND (" . $rsNotify->fields['SEEDB'] . " = " . $rsNotify->fields['SEEDBVALUE'] . ")";} else {$sql = $sql . " AND (" . $rsNotify->fields['SEEDB'] . " " . $rsNotify->fields['SEEDBVALUE'] . ")";}}
						if ($rsNotify->fields['SEEDCVALUE'] != '') { if (IsNumeric($rsNotify->fields['SEEDCVALUE'])) {$sql = $sql . " AND (" . $rsNotify->fields['SEEDC'] . " = " . $rsNotify->fields['SEEDCVALUE'] . ")";} else {$sql = $sql . " AND (" . $rsNotify->fields['SEEDC'] . " " . $rsNotify->fields['SEEDCVALUE'] . ")";}}
						if ($rsNotify->fields['SEEDDVALUE'] != '') { if (IsNumeric($rsNotify->fields['SEEDDVALUE'])) {$sql = $sql . " AND (" . $rsNotify->fields['SEEDD'] . " = " . $rsNotify->fields['SEEDDVALUE'] . ")";} else {$sql = $sql . " AND (" . $rsNotify->fields['SEEDD'] . " " . $rsNotify->fields['SEEDDVALUE'] . ")";}}
			if ($conn->debug) echo($sql) . BRCRLF;
			$output['notify'] = $output['notify'] .  'sql ' . $sql . BRCRLF;
			$rsTable = $conn->Execute($sql);
			if ($rsTable) {
				if ($rsTable->RecordCount() == 1){
					$NotifyRecord = WFRECORDCLONE($rsTable->fields);
					$NotifyRecord['NOTIFY_CT_TABLE'] = $rsNotify->fields['CT_TABLE'];
					$NotifyRecord['NOTIFY_CT_ID'] = $ctid;
					$NotifyRecord['NOTIFY_TYPE'] = $type;
					$NotifyRecord['NOTIFY_VARNAME0'] = $rsNotify->fields['VARNAME0'];
					$NotifyRecord['NOTIFY_VARNAME1'] = $rsNotify->fields['VARNAME1'];
					$output['notifyFind'] = $output['notifyFind'] . ' FIND:'.  $ID . ' CallProcess ' . $CT_AAAPROC . BRCRLF;
					$output['notify'] = $output['notify'] .  'CallProcess ' . $CT_AAAPROC . BRCRLF;
					if ($conn->debug) var_dump($NotifyRecord) . BRCRLF;
					WFPROCESS($rsNotify->fields['CT_AAAPROC']);
				}
				$rsTable->Close();
			}
			$rsNotify->MoveNext();
		}
		$rsNotify->Close();
	}
}
function WFRaiseError($errNumber, $errDescription, $errFunctionName, $errFunctionParam){
	global $output;
	global $conn;
	
	$output["failure"] = true; 
	$output["success"] = false; 
	$output["message"] = $output["message"] . "<b>Error:</b>" . 		$errDescription 	. BRCRLF .
						"<b>FuncName:</b>" . 	$errFunctionName 	. BRCRLF .
						"<b>Param</b>:" . 		$errFunctionParam;
	$output["messagedebug"] = 'FuncName:' . 	$errFunctionName . " Param" . $errFunctionParam;
	$conn->completeTrans(); 
	
	WFSendLOG($errFunctionName . " Error:", $errDescription . " Param" . $errFunctionParam,0,true);

	if ($conn->debug!=1) header('Content-Type: application/json');
	echo  Array2JSON($output);
	
	die();
}

function ADODB_Error_Handler($dbms, $fn, $errno, $errmsg, $p1, $p2, &$thisConnection){
	global $conn;
	global $output;
	if (error_reporting() == 0)
		return; // obey @ protocol

	$output['message'] = $errmsg;
	$output['errmsg'] = $errmsg;
}
function ignoreErrorHandler(){
	return true;
}
function WFGetComments($Source) {
	$result = "";
    if (preg_match('%/\*(.*?)\*/%g', $Source, $matches)) {
		var_dump($matches);
		foreach ($matches as &$value) {
			$result = $result . "\n " . trim($value);
		}
	} else {
		$result = "";
	}

    return $result ;
}

//Execution With debugging
function Shell($cond=''){
    $cond=trim($cond);
    if($cond=='')return 'Success (condition was empty).'; $result=false;
    $cond='$result = '.str_replace(array(CR,LF),' ',$cond).';';
    try {
        $success = eval($cond);
        if($success===false)return 'Error: could not run expression.';
        return 'Success (condition return '.($result?'true':'false').').';
    }catch(Exception $e){
        return 'Error: exception '.get_class($e).', '.$e->getMessage().'.';
    }
}
function var_dumpToString($var) {
    ob_start();
    var_dump($var);
    $result = ob_get_clean();
    return $result;
}
function php_syntax_error($code){
    $braces=0;
    $inString=0;
    foreach (token_get_all('<?php ' . $code) as $token) {
        if (is_array($token)) {
            switch ($token[0]) {
                case T_CURLY_OPEN:
                case T_DOLLAR_OPEN_CURLY_BRACES:
                case T_START_HEREDOC: ++$inString; break;
                case T_END_HEREDOC:   --$inString; break;
            }
        } else if ($inString & 1) {
            switch ($token) {
                case '`': case '\'':
                case '"': --$inString; break;
            }
        } else {
            switch ($token) {
                case '`': case '\'':
                case '"': ++$inString; break;
                case '{': ++$braces; break;
                case '}':
                    if ($inString) {
                        --$inString;
                    } else {
                        --$braces;
                        if ($braces < 0) break 2;
                    }
                    break;
            }
        }
    }
    $inString = @ini_set('log_errors', false);
    $token = @ini_set('display_errors', true);
    ob_start();
    $braces || $code = "if(0){{$code}\n}";
    if (eval($code) === false) {
        if ($braces) {
            $braces = PHP_INT_MAX;
        } else {
            false !== strpos($code,CR) && $code = strtr(str_replace(CRLF,LF,$code),CR,LF);
            $braces = substr_count($code,LF);
        }
        $code = ob_get_clean();
        $code = strip_tags($code);
        if (preg_match("'syntax error, (.+) in .+ on line (\d+)$'s", $code, $code)) {
            $code[2] = (int) $code[2];
            $code = $code[2] <= $braces
                ? array($code[1], $code[2])
                : array('unexpected $end' . substr($code[1], 14), $braces);
        } else $code = array('syntax error', 0);
    } else {
        ob_end_clean();
        $code = false;
    }
    @ini_set('display_errors', $token);
    @ini_set('log_errors', $inString);
    return $code;
}


/************************************************************************************/
/*                   		  	  FUNC FIND-CHANGE-REMOVE IN OBJECT					*/
/************************************************************************************/
function ChangeValueOnObjectPropertyNameValue($subObjItems, $name, $valuekey, $valueupdateto ){
	global $CollectObjName;
	global $CollectObjValueFind;
	global $CollectObjValue;
	
	$CollectObjName = $name;
	$CollectObjValueFind = $valuekey;
	$CollectObjValue = $valueupdateto;
	array_walk_recursive($subObjItems, 'ChangeValueOnObjectPropertyNameValuePriv');
}	
function ChangeValueOnObjectPropertyNameValuePriv(&$data, $key) {	
	global $CollectObjName;
	global $CollectObjValueFind;
	global $CollectObjValue;
	
	if($data->{$CollectObjName} == $CollectObjValueFind) {
		$data->{$CollectObjName} = $CollectObjValue;
	}
}
function ChangeValueOnObjectPropertyName($subObjItems, $name, $valueupdateto ){
	global $CollectObjName;
	global $CollectObjValueFind;
	global $CollectObjValue;
	
	$CollectObjName = $name;
	$CollectObjValue = $valueupdateto;
	array_walk_recursive($subObjItems, 'ChangeValueOnObjectPropertyNamePriv');
}
function ChangeValueOnObjectPropertyNamePriv(&$data, $key) {
	global $CollectObjName;
	global $CollectObjValueFind;
	global $CollectObjValue;
	
	if($key == $CollectObjName) {
		$data = $CollectObjValue;
	}
}

function CollectOnObjectPropertyExist($subObjItems, $name){
	global $CollectObjList;
	if ($subObjItems) {
		for ($i = 0; $i < count($subObjItems); $i++) {
			if (isset($subObjItems[$i][$name]) == true) {
				if ($name == 'emptyText') {
					$val = array("emptyText" => $subObjItems[$i]["emptyText"],
						"name" => $subObjItems[$i]["name"]
					);
				}else if ($name == 'regex') {
					$val = array("regex" => $subObjItems[$i]["regex"],
						"name" => $subObjItems[$i]["name"]
					);
				}else if ($name == 'hiddenInForm') {
					$val = array("hiddenInForm" => $subObjItems[$i]["hiddenInForm"],
						"name" => $subObjItems[$i]["name"]
					);
				}else if ($name == 'hiddenInGrid') {
					$val = array("hiddenInGrid" => $subObjItems[$i]["hiddenInGrid"],
						"name" => $subObjItems[$i]["name"]
					);
				} else if ($name == 'datasourcefield') {
					$val = array("datasourcefield" => $subObjItems[$i]["datasourcefield"],
						"name" => $subObjItems[$i]["name"]
					);
				} else if ($name == 'src') {
					$val = array("src" => $subObjItems[$i]["src"],
						"name" => $subObjItems[$i]["name"]
					);
				} else if ($name == 'value') {
					$val = array("value" => $subObjItems[$i]["value"],
						"name" => $subObjItems[$i]["name"]
					);
				} else if ($name == 'displayField') {
					$val = array("displayField" => $subObjItems[$i]["displayField"],
						"name" => $subObjItems[$i]["name"]
					);
				} else if ($name == 'fieldLabel') {
					$val = array("fieldLabel" => $subObjItems[$i]["fieldLabel"],
						"name" => $subObjItems[$i]["name"]
					);
				} else if ($name == 'renderInGridRowColor') {
					$val = array("renderInGridRowColor" => $subObjItems[$i]["renderInGridRowColor"],
						"name" => $subObjItems[$i]["name"]
					);
				} else {
					$val = array("name" => $subObjItems[$i]["name"]
					);
				}

				$CollectObjList[] = $val;
			}
			if (isset($subObjItems[$i]["items"]) == true) {
				$found = CollectOnObjectPropertyExist($subObjItems[$i]["items"], $name);
			}
		}
	}
}
function CollectOnObjectPropertyValue($subObjItems, $name, $valuekey){
	global $CollectObjList;
	if ($subObjItems) {
		for ($i = 0; $i < count($subObjItems); $i++) {
			if (isset($subObjItems[$i][$name]) == true) {
				if ($subObjItems[$i][$name] == $valuekey){
					$val = array($name => $subObjItems[$i][$name],
								"name" => $subObjItems[$i]["name"]
								);
					$CollectObjList[] = $val;
				}
			}
			if (isset($subObjItems[$i]["items"]) == true) {
				$found = CollectOnObjectPropertyValue($subObjItems[$i]["items"], $name, $valuekey);
			}
		}
	}
}
function CollectKeyForeign($tabletostart, $name){
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	
	global $CollectObjList;

	//RICERCA ROVESCIA
	$conn->setFetchMode(ADODB_FETCH_NUM);
	$sql = "SELECT 
			  TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME
			FROM
			  INFORMATION_SCHEMA.KEY_COLUMN_USAGE
			WHERE
			  REFERENCED_TABLE_SCHEMA = DATABASE() AND
			  REFERENCED_TABLE_NAME = '" . $tabletostart . "';";

	//$p = $conn->metaForeignKeys($tabletostart); (foreign proprie non connesse a quella tabella)
	//print_r($p);
	
	//$conn->setFetchMode(ADODB_FETCH_ASSOC);
	//$found = CollectKeyForeign($tablefound, $name);
}

function ExecuteOnObjectPropertyValue($subObjItems, $name, $valuekey, $namefunction){ 
	foreach($subObjItems as $key => $val) {
		//$new[$key] = object_to_array($val);
		if (is_array($val)) {
			//oggetto
			$found = ExecuteOnObjectPropertyValue($val, $name, $valuekey, $namefunction);
			if ($found) return $found;
		}else{
			//property
			if (($key == $name) && ($val == $valuekey)) {
				foreach($subObjItems as $key => $val) {
					if (!is_array($val)) {$Appo[$key] = $val;}
				}
				eval($namefunction . '($Appo);'); 
			}
		}
	}
}

function ReturnOnObjectPropertyExist(&$subObjItems, $name){ 
	foreach($subObjItems as $key => $val) {
		//$new[$key] = object_to_array($val);
		if (is_array($val)) {
			//oggetto
			$found = ReturnOnObjectPropertyExist($val, $name);
			if ($found) return $found;
		}else{
			//property
			if ($key == $name) {
				foreach($subObjItems as $key => $val) {
					if (!is_array($val)) {$Appo[$key] = $val;}
				}
				return $Appo;
			}
		}
	}
}
function ReturnOnObjectPropertyValue(&$subObjItems, $name, $valuekey){ 
	foreach($subObjItems as $key => $val) {
		//$new[$key] = object_to_array($val);
		if (is_array($val)) {
			//oggetto
			$found = ReturnOnObjectPropertyValue($val, $name, $valuekey);
			if ($found) return $found;
		}else{
			//property
			if (($key == $name) && ($val == $valuekey)) {
				//foreach($subObjItems as $key => $val) {
				//	if (!is_array($val)) {$Appo[$key] = $val;}
				// }
				//return $Appo;
				return $subObjItems;
			}
		}
	}
}

function &getSubItemFromName(&$subObjItems, $name){
	$found = null;
	if ($subObjItems) {
		for ($i = 0; $i < count($subObjItems); $i++) {
			if (array_key_exists ('name', $subObjItems[$i])){
				if ($subObjItems[$i]['name'] == $name) {
					return $subObjItems[$i];
				}
			}
			if (array_key_exists ('items', $subObjItems[$i])){
				if (isset($subObjItems[$i]["items"]) == true) {
					$found = & getSubItemFromName($subObjItems[$i]["items"], $name);
					if ($found) return $found;
				}
			}
		}
	}
	return $found;
}
function removeSubItemFromName (&$subObjItems, $name) {
	$found = null;
	if ($subObjItems) {
		for ($i = 0; $i < count($subObjItems); $i++) {
			if (isset($subObjItems[$i]["name"]) == true) {
				if ($subObjItems[$i]["name"] == $name){
					array_splice ($subObjItems, $i);
				}
				if (isset($subObjItems[$i]["items"]) == true) {
					removeSubItemFromName($subObjItems[$i]["items"], $name);
					return $found;
				}
			}
		}
	}
};

// CLONE MERGE
function array_clone($ArrayIn){
	return array_map(function ($element) {
		return ((is_array($element))
			? call_user_func(__FUNCTION__, $element)
			: ((is_object($element))
				? clone $element
				: $element
			)
		);
	}, $ArrayIn);
}
function object_clone($objecttoclone){	
	$JsonAppo = '';
	$JsonAppo = Array2JSON($objecttoclone);
	$JsonAppo = JSON2Array($JsonAppo,true);
	return $JsonAppo;
}
function object_merge() {
      $arg_list = func_get_args();
      foreach((array)$arg_list as $arg){
          foreach((array)$arg as $K => $V){
              $Zoo[$K]=$V;
          }
      }
    return $Zoo;
}
function object_merge_distinct ( array &$array1, array &$array2 ){
	return array_unique(array_merge($array1,$array2), SORT_REGULAR);
}

function getArrayElement($array, $indexs, $justvalsplease = false){
    $newarray = array();
    //verificamos el array
    if(is_array($array) && count($array)>0){
        
        //verify indexs and get # of indexs
        if(is_array($indexs) && count($indexs)>0) $ninds = count($indexs);
        else return false;
        
        //search for coincidences
        foreach(array_keys($array) as $key){

            //index value coincidence counter. 
            $count = 0;
            
            //for each index we search            
            foreach($indexs as $indx => $val){
                
                //if index value is equal then counts
                if($array[$key][$indx] == $val){ 
                    $count++;
                } 
            }
            //if indexes match, we get the array elements :)
            if($count == $ninds){
                
                //if you only need the vals of the first coincidence
                //witch was my case by the way...
                if($justvalsplease) return $array[$key];
                else $newarray[] = $array[$key];
            }
        } 
    } 
  return $newarray; 
}
function ArraySearchByObj($array, $member, $value) {
   $filtered = array();
   foreach($array as $k => $v) {
      if($v->$member != $value)
         $filtered[$k] = $v;
   }
   return $filtered;
}
function ArraySearchByEqual($array, $condition){
    $foundItems = array();
    foreach($array as $item){
        $find = TRUE;
        foreach($condition as $key => $value) {
            if(isset($item[$key])){
				if ($item[$key] == $value){
					$find = TRUE;
				} else {
					$find = FALSE;
				}
			} else {
				$find = FALSE;
			}	
        }
        if($find){
            array_push($foundItems, $item);
        }
    }
    return $foundItems;
}
function ArraySearchByLike($array, $condition){
    $foundItems = array();
    foreach($array as $item){
        $find = TRUE;
        foreach($condition as $key => $value) {
            if(isset($item[$key])){
				if (strpos($item[$key],$value) ){
					$find = TRUE;
				} else {
					$find = FALSE;
				}
			} else {
				$find = FALSE;
			}	
        }
        if($find){
            array_push($foundItems, $item);
        }
    }
    return $foundItems;
}
function ArraySearchByInner($array, $String){
    $foundItems = array();
    foreach($array as $item){
        $find = TRUE;
        foreach($item as $key => $value) {
			if (strpos($item[$key],$String) ){
				$find = TRUE;
			} else {
				$find = FALSE;
			}
		}
        if($find){
            array_push($foundItems, $item);
        }
    }
    return $foundItems;
}

/************************************************************************************/
/*                   		  	  FUNC RAD CONVERSION LAYOUT						*/
/************************************************************************************/
function ExecFuncInStringSQL($source){
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	$FindStartFunc = 0;
	$FindStartVal = 0;
	$FindEndVal = 0;
	$FindEndFunc = 0;
	$Result = "";
	$start_time = microtime(true); 

	while (true) {
		$FindStartFunc = stripos($source, 'WFVALUE');
		if ($FindStartFunc === false) break;
		
		$ParentesiStart    = stripos($source, '(', $FindStartFunc);
		$ParentesiEndFirst = stripos($source, ')', $ParentesiStart);
		
		$ParentesiCount    = substr_count(extractText($source, $FindStartFunc, $ParentesiEndFirst), '(');
		
		$FindEndFunc = nth_strpos($source, ')', $ParentesiCount, $ParentesiStart);
		$Chiave = extractText($source, $FindStartFunc, $FindEndFunc);
		$FunctionName = extractText($source, $FindStartFunc, $ParentesiStart-1);
		$IsEnclosure = false;
		$EnclosureChr = extractText($source, $FindStartFunc-1, $FindStartFunc-1);
		if ($conn->debug==1){ 
			echo ("Chiave:" . $Chiave . "<BR>\n");
			echo ("EnclosureChr:" . $EnclosureChr . "<BR>\n");
		}
		if (( $EnclosureChr == '"') || ($EnclosureChr == "'")) $IsEnclosure = true;
		$Result = "";
		if ($Chiave != '') {
			try {
				if ($conn->debug==1){ 
					echo ("EVAL:" . '$Result = ' . $Chiave . ';' . "<BR>\n");
				}
				eval('$Result = ' . $Chiave . ';');
			} catch (Exception $e) {
				$output["failure"] = true; 
				$output["success"] = false;
				$output["message"] = $output["message"] . 'ExecFuncInStringSQL ' . $e->getMessage() . BRCRLF;
				echo Array2JSON($output, $debugmessage);
				WFSendLOG("ExecFuncInStringSQL", "Error:" . get_class($e) . ', ' . $e->getMessage() . '.');
				die;
			}
			if ($IsEnclosure){
				$Result = $Result;
			}elseif (is_numeric($Result)) {
				$Result = $Result;
			}else {
				if ($Result != null) {
					if ($FunctionName == 'WFVALUEIN') {
						$Result = $Result;
					}elseif ($FunctionName == 'WFVALUECOND') {
						$Result = $Result;
					}elseif ($FunctionName == 'WFVALUECONDBETWEEN') {
						$Result = $Result;
					}elseif (stripos($Result, '"') === true) {
						$Result = "'" . $Result . "'";
					} elseif (stripos($Result, "'") === true) {
						$Result = '"' . $Result . '"';
					} elseif (stripos($Result, ",") === true) {
						$Result = $Result;
					} else {
						$Result = "'" . $Result . "'";
					}
				} else {
					$Result = null;
				}
			}
			
			if ($conn->debug==1){
				echo ("Source:" . $source . "<BR>\n");
				echo ("Result:" . $Result . "<BR>\n");
				echo ("IsEnclosure:" . $IsEnclosure . "<BR>\n");
			}
			$source = str_replace($Chiave, $Result, $source);
			if ($conn->debug==1){
				echo ("SourceAfter:" . $source . "<BR>\n");
			}
		}
	}

	WFSendLOG("ExecFuncInStringSQL", "OUT:" . $source, microtime_diff($start_time));
	return ($source);
}
function ExecFuncInStringLAYOUT($source, $OnlyWFValue = false){
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	$FindStartFunc = 0;
	$FindStartVal = 0;
	$FindEndVal = 0;
	$FindEndFunc = 0;
	$Result = "";

	if (!is_string($source)){
		return $Result;
	}
	WFSendLOG("ExecFuncInStringLAYOUT", "IN:" . $source);
	//execute SOURCE < ? ? >
	while (true && !$OnlyWFValue) {
		$FindStartFunc = stripos($source, '<?php');
		if ($FindStartFunc === false) {
			$FindStartFunc = stripos($source, '<?');
		}
		if ($FindStartFunc === false) break;
		$FindEndFunc = stripos($source, '?>', $FindStartFunc + 5);
		$Chiave = extractText($source, $FindStartFunc + 5, $FindEndFunc - 2);
		$Result = "";
		WFSendLOG("ExecFuncInStringLAYOUT", 'Eval ($Result = ' . $Chiave . ';);');
		if ($Chiave != '') {
			try {
				ob_start();
				eval($Chiave);
				$Result = ob_get_contents();
				ob_end_clean();
			} catch (Exception $e) {
				WFSendLOG("ExecFuncInStringLAYOUT", "Error:" . get_class($e) . ', ' . $e->getMessage() . '.');
			}
			
			WFSendLOG("ExecFuncInStringLAYOUT", "Result:" . $Result);
			$Chiave = extractText($source, $FindStartFunc, $FindEndFunc+1);
			if ($conn->debug==1){
					echo ("Source:" . $source . "<BR>\n");
					echo ("Result:" . $Result . "<BR>\n");
			}
			
			$source = str_replace($Chiave, $Result, $source);
			if ($conn->debug==1){
					echo ("SourceAfter:" . $source . "<BR>\n");
			}
		}
	}
	
	//EXECUTE WFVALUE
	while (true) {
		$FindStartFunc = stripos($source, 'WFVALUE');
		if ($FindStartFunc === false) break;
		$FindStartVal = stripos($source, '(', $FindStartFunc) + 1;
		$FindEndFunc = stripos($source, ')', $FindStartVal);
		$FindEndVal = $FindEndFunc - 1;
		$Chiave = extractText($source, $FindStartFunc, $FindEndFunc);
		$IsEnclosure = false;
		$EnclosureChr = extractText($source, $FindStartFunc-1, $FindStartFunc-1);
		if ($conn->debug==1){ 
			echo ("Chiave:" . $Chiave . "<BR>\n");
			echo ("EnclosureChr:" . $EnclosureChr . "<BR>\n");
		}
		if (( $EnclosureChr == '"') || ($EnclosureChr == "'")) $IsEnclosure = true;
		$Result = "";
		WFSendLOG("ExecFuncInStringLAYOUT", 'Eval ($Result = ' . $Chiave . ';);');
		if ($Chiave != '') {
			try {
				eval('$Result = ' . $Chiave . ';');
			} catch (Exception $e) {
				WFSendLOG("ExecFuncInStringLAYOUT", "Error:" . get_class($e) . ', ' . $e->getMessage() . '.');
			}
			if ($IsEnclosure){
				$Result = $Result;
			}elseif (is_numeric($Result)) {
				$Result = $Result;
			}else {
				if ($Result != null) {
					if (stripos($Result, '"') === true) {
						$Result = "'" . $Result . "'";
						if ($conn->debug==1)echo ("Source: Apice<BR>\n");
					} elseif (stripos($Result, "'") === true) {
						$Result = '"' . $Result . '"';
						if ($conn->debug==1)echo ("Source: DoppioApice<BR>\n");
					} elseif (stripos($Result, ",") === true) {
						$Result = $Result;
						if ($conn->debug==1)echo ("Source: virgola<BR>\n");
					} else {
						$Result = "" . $Result . "";
						if ($conn->debug==1)echo ("Source: nulla<BR>\n");
					}
				} else {
					$Result = null;
				}
			}
			WFSendLOG("ExecFuncInStringLAYOUT", "Result:" . $Result);
			if ($conn->debug==1){
					echo ("Source:" . $source . "<BR>\n");
					echo ("Result:" . $Result . "<BR>\n");
					echo ("IsEnclosure:" . $IsEnclosure . "<BR>\n");
			}
			$source = str_replace($Chiave, $Result, $source);
			if ($conn->debug==1){
					echo ("SourceAfter:" . $source . "<BR>\n");
			}
		}
	}
	WFSendLOG("ExecFuncInStringLAYOUT", "OUT:" . $source);
	
	//reexecute SOURCE < ?? >
	while (true && !$OnlyWFValue) {
		$FindStartFunc = stripos($source, '<?php');
		if ($FindStartFunc === false) {
			$FindStartFunc = stripos($source, '<?');
		}
		if ($FindStartFunc === false) break;
		$FindEndFunc = stripos($source, '?>', $FindStartFunc + 5);
		$Chiave = extractText($source, $FindStartFunc + 5, $FindEndFunc - 2);
		$Result = "";
		WFSendLOG("ExecFuncInStringLAYOUT", 'Eval ($Result = ' . $Chiave . ';);');
		if ($Chiave != '') {
			try {
				ob_start();
				eval($Chiave);
				$Result = ob_get_contents();
				ob_end_clean();
			} catch (Exception $e) {
				WFSendLOG("ExecFuncInStringLAYOUT", "Error:" . get_class($e) . ', ' . $e->getMessage() . '.');
			}
			
			WFSendLOG("ExecFuncInStringLAYOUT", "Result:" . $Result);
			$Chiave = extractText($source, $FindStartFunc, $FindEndFunc+1);
			if ($conn->debug==1){
					echo ("Source:" . $source . "<BR>\n");
					echo ("Result:" . $Result . "<BR>\n");
			}
			
			$source = str_replace($Chiave, $Result, $source);
			if ($conn->debug==1){
					echo ("SourceAfter:" . $source . "<BR>\n");
			}
		}
	}
	
	return ($source);
}
function SetExecFuncInString($obj){
	$obj = ExecFuncInStringSQL($obj['emptyText']);
}

/************************************************************************************/
/*                   		  	  FUNC TYPE CONVERSION							*/
/************************************************************************************/
function JSON2Array($value, $cond = ''){
	for ($i = 0; $i <= 31; ++$i) { 
		$value = str_replace(chr($i), "", $value); 
	}
	$value = str_replace(chr(127), "", $value);
	if (0 === strpos(bin2hex($value), 'efbbbf')) {
	   $value = substr($value, 3);
	}
	return json_decode($value,true);
}
function JSON2HTML($array){
    // start table
    $html = '<table>';
    // header row
    $html .= '<tr>';
    foreach($array[0] as $key=>$value){
            $html .= '<th>' . $key . '</th>';
        }
    $html .= '</tr>';

    // data rows
    foreach( $array as $key=>$value){
        $html .= '<tr>';
        foreach($value as $key2=>$value2){
            $html .= '<td>' . $value2 . '</td>';
        }
        $html .= '</tr>';
    }

    // finish table and return it

    $html .= '</table>';
    return $html;
}

function CSV2Array($string, $separator = ";"){
	$elements = explode($separator, $string);
	for ($i = 0; $i < count($elements); $i++) {
		$nquotes = substr_count($elements[$i], '"');
		if ($nquotes % 2 == 1) {
			for ($j = $i + 1; $j < count($elements); $j++) {
				if (substr_count($elements[$j], '"') % 2 == 1) { // Look for an odd-number of quotes
					// Put the quoted string's pieces back together again
					array_splice($elements, $i, $j - $i + 1,
						implode($separator, array_slice($elements, $i, $j - $i + 1)));
					break;
				}
			}
		}
		if ($nquotes > 0) {
			// Remove first and last quotes, then merge pairs of quotes
			$qstr =& $elements[$i];
			$qstr = substr_replace($qstr, '', strpos($qstr, '"'), 1);
			$qstr = substr_replace($qstr, '', strrpos($qstr, '"'), 1);
			$qstr = str_replace('""', '"', $qstr);
		}
	}
	return $elements;
}
function CSV2Json($csv){
	$json = CSV2Array($csv);
	return json_encode($json,TRUE);
}

function CSV2Table($tableName = 'cha_condominioattivita', $tableNameRemote = 'CHA_AttivitaInterventiVIEW', $dbnameRemote = 'suite_pasina', $Url = 'https://studiopasina.cedhousesuite.it/exportattivita.php' ){
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	$csvUrl = $Url . "?dbname=" . $dbnameRemote . "&table=" . $tableNameRemote;
	$csvData = file_get_contents($csvUrl);
	$rows = str_getcsv($csvData, "\n");
	$header = str_getcsv( substr(array_shift($rows), 0, -1), ";");
	$checkTable = $conn->execute("SHOW TABLES LIKE '" . $tableName . "'");
	if ($checkTable->recordCount() == 0) {
		$sqlC = "CREATE TABLE $tableName (" . implode(' VARCHAR(255), ', $header) . " VARCHAR(255))";
		$conn->execute($sqlC);
	}

	$sqlC = "TRUNCATE $tableName ";
	WFSQL($sqlC);
	$headercount = count($header);

	$bufstring = '';
	foreach ($rows as $row) {
		$row = str_replace(array("\r", "\n"), '', $row);
		$lastChar = substr($row, -1);
		$bufstring = $bufstring . $row;
		if ($lastChar== ';'){
			$bufstring = substr($bufstring, 0, -1);
			$rowData = str_getcsv($bufstring, ";");
			$rowDataField = array_map(function($value) {
				return $value === '' ? NULL :  trim($value) ;
			}, $rowData);
			try{
				if ($headercount == count($rowDataField)){
					$rowData = array_combine($header, $rowDataField); // Combine column names with data
					$conn->AutoExecute($tableName, $rowData, 'INSERT'); // Automatically construct and execute INSERT statement
					//$WFSQL("INSERT INTO " . $tableName . " (" . implode(',', $header) . ") VALUES (" . implode(',', $rowData)  . ")");
				}
			} catch (exception $e){
				//
			}
			$bufstring = '';
		}
	}
}

function XMLFile2Array($filename){
    $json = XMLFile2Json($filename);
    return json_decode($json,TRUE);
}
function XMLFile2Json($filename){
    $xml = simplexml_load_file($filename, "SimpleXMLElement", LIBXML_NOCDATA);
    $json = json_encode($xml);
    return $json;
}

function Array2HTML($array){
    // start table
    $html = '<table>';
    // header row
    $html .= '<tr>';
    foreach($array[0] as $key=>$value){
		$html .= '<th>' . $key . '</th>';
	}
    $html .= '</tr>';

    // data rows
    foreach( $array as $key=>$value){
        $html .= '<tr>';
        foreach($value as $key2=>$value2){
            $html .= '<td>' . $value2 . '</td>';
        }
        $html .= '</tr>';
    }

    // finish table and return it

    $html .= '</table>';
    return $html;
}
function Array2HTMLRotate($ArrayIn){
    $html = '<table>';	
	foreach($ArrayIn[0] as $key=>$value) {
		$html .=  "<tr>";
		$html .=  "<td>" . $key  . "</td>";
		$html .=  "<td>" . $value  . "</td>";
		$html .= "</tr>";
	}
    $html .= '</table>';
    return $html;
}
function Array2XML($ArrayIn, $obj = null ){
    foreach ($ArrayIn as $key => $value){
        if(is_numeric($key))
            $key = 'item' . $key;

        if (is_array($value)){
            $node = $obj->addChild($key);
            Array2XML($node, $value);
        } else {
            $obj->addChild($key, htmlspecialchars($value));
        }
    }
}
function Array2JSON($value, $PrettyPRINT = false){
	//array_walk_recursive($value, array($this, 'utf8_enc'));
	if ($PrettyPRINT) {
		$encoded = json_encode($value, JSON_PRETTY_PRINT);
	} else {
		//$encoded = json_encode($value,JSON_UNESCAPED_UNICODE);
		//$encoded = json_encode($value, JSON_NUMERIC_CHECK );
		$encoded = json_encode($value);
		//$encoded = json_encode($value, JSON_NUMERIC_CHECK  | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
	}
	$encoded = preg_replace("/[\r\n]+/", " ", $encoded);
	$encoded = iconv("ISO-8859-1", "UTF-8", $encoded);
	//$encoded = html_entity_decode($encoded);
	switch (json_last_error()) {
		case JSON_ERROR_NONE:
			return $encoded;
		case JSON_ERROR_DEPTH:
			return 'Maximum stack depth exceeded'; // or trigger_error() or throw new Exception()
		case JSON_ERROR_STATE_MISMATCH:
			return 'Underflow or the modes mismatch'; // or trigger_error() or throw new Exception()
		case JSON_ERROR_CTRL_CHAR:
			return 'Unexpected control character found';
		case JSON_ERROR_SYNTAX:
			return 'Syntax error, malformed JSON'; // or trigger_error() or throw new Exception()
		case JSON_ERROR_UTF8:
			$clean = utf8ize($value);
			return Array2JSON($clean);
		default:
			return 'Unknown error'; // or trigger_error() or throw new  Exception()
	}
}
function Array2CSV($array, $separator = ";", $delimitchr = '', $header = true ){
    $html = '';
	if ($header){
		foreach($array[0] as $key=>$value){
			$valore = $key;
			$valore = str_replace("\r","",$valore);
			$valore = str_replace("\n","",$valore);
			$valore = str_replace("\t","",$valore);
			$html .= trim($valore) . $separator;
		}
		$html .= CRLF;
	}
    // data rows
    foreach( $array as $key=>$value){
        foreach($value as $key2=>$value2){
			$valore = $value2;
			$valore = str_replace("\r","",$valore);
			$valore = str_replace("\n","",$valore);
			$valore = str_replace("\t","",$valore);
            $html .=  $delimitchr . $valore . $delimitchr . $separator ;
        }
        $html .= CRLF;
    }
    return $html;
}
function Array2XLS($array){
	global $UserId;
	require_once dirname(__FILE__) . '/PHPExcel/PHPExcel.php';
	
	// Create new PHPExcel object
	$objPHPExcel = new PHPExcel();

	// Head prop
	$objPHPExcel->getProperties()->setCreator("ExtJSDEV");
	$objPHPExcel->getProperties()->setLastModifiedBy($UserId);
	$objPHPExcel->getProperties()->setTitle("");
	$objPHPExcel->getProperties()->setSubject("");
	$objPHPExcel->getProperties()->setDescription("");

	//Data
	$objPHPExcel->setActiveSheetIndex(0);
	$objPHPExcel->getActiveSheet()->setTitle('Export');
	
	$col = 0;
	foreach($array[0] as $key=>$value){
		$objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow($col, 1, $key);
		$col++;
	}
	
	// data rows
	$row = 2;
    foreach( $array as $key=>$value){
		$col = 0;
        foreach($value as $key2=>$value2){
			if ($value2 != null){
				$objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow($col, $row, $value2 );
			}
			$col++;
        }
		$row++;
    }

	// Save 
	$objWriter = new PHPExcel_Writer_Excel2007($objPHPExcel);
	ob_start();
	$objWriter->save('php://output');
	
	$excelOutput = ob_get_clean();
	return $excelOutput;
}

function Array2ICS($array,$summaryField = 'summary', $descriptionField = 'description', $startField = 'start', $endField = 'end' , $url = 'url', $locationField = 'location'){
	require_once dirname(__FILE__) . '/PHPIcs/ics.php';
	$setup = array(
		"title"=>"Cal Esempio",
		"author"=>"portapipe",
		"description"=>"Il mio calendario di esempio",
		"filename"=>"ilMioCalendario"
	);
	$calendar = new Calendar($setup);

    $eventi = array();
    foreach ($array as &$Row) {
        $appo = array(
					//'uid' =>  '123', NON SERVE, E' AUTOMATICO MA E' PREDISPOSTO
					'summary' => $Row[$summaryField] ,
					'description' => $Row[$descriptionField],
					'start' => new DateTime($Row[$startField]),
					'end' => new DateTime($Row[$endField]),
					'url' => $Row[$url],
					'location' => $Row[$locationField]
				);
		$eventidebug[] = $appo;
		$eventi[] = new CalendarEvent( $appo );
    }
	$calendar->events = $eventi;
	return $calendar->generateDownload();
	
	//return var_dumpToString($eventidebug);
}

function isJson($string){
	json_decode($string);
	return (json_last_error() == JSON_ERROR_NONE);
}

/************************************************************************************/
/*                   		  	  FUNC PRETTIFY									*/
/************************************************************************************/
function JsonPrettyPrint($json){
	$result = '';
	$level = 0;
	$in_quotes = false;
	$in_escape = false;
	$ends_line_level = NULL;
	$json_length = strlen($json);

	for ($i = 0; $i < $json_length; $i++) {
		$char = $json[$i];
		$new_line_level = NULL;
		$post = "";
		if ($ends_line_level !== NULL) {
			$new_line_level = $ends_line_level;
			$ends_line_level = NULL;
		}
		if ($in_escape) {
			$in_escape = false;
		} else if ($char === '"') {
			$in_quotes = !$in_quotes;
		} else if (!$in_quotes) {
			switch ($char) {
				case '}':
				case ']':
					$level--;
					$ends_line_level = NULL;
					$new_line_level = $level;
					break;

				case '{':
				case '[':
					$level++;
				case ',':
					$ends_line_level = $level;
					break;

				case ':':
					$post = " ";
					break;

				case " ":
				case "\t":
				case "\n":
				case "\r":
					$char = "";
					$ends_line_level = $new_line_level;
					$new_line_level = NULL;
					break;
			}
		} else if ($char === '\\') {
			$in_escape = true;
		}
		if ($new_line_level !== NULL) {
			$result .= "\n" . str_repeat("\t", $new_line_level);
		}
		$result .= $char . $post;
	}

	return $result;
}
function jsonRemoveUnicodeSequences($struct){
	return preg_replace("/\\\\u([a-f0-9]{4})/e", "iconv('UCS-4LE','UTF-8',pack('V', hexdec('U$1')))", json_encode($struct));
}

function PHPPrettyPrint($php_raw){
	if( empty($php_raw) || !is_string($php_raw) ) {
		return false;
	}else{
		return $php_raw;
	}
}

function XMLPrettyPrint($xml_raw){
	if( empty($xml_raw) || !is_string($xml_raw) ) {
		return false;
	}else{
		return $xml_raw;
	}
}

function SQLPrettyPrint($sql_raw){
	if( empty($sql_raw) || !is_string($sql_raw) ) {
		return false;
	}

	$sql_reserved_all = array (
		'ACCESSIBLE', 'ACTION', 'ADD', 'AFTER', 'AGAINST', 'AGGREGATE', 'ALGORITHM', 'ALL', 'ALTER', 'ANALYSE', 'ANALYZE', 'AND', 'AS', 'ASC',
		'AUTOCOMMIT', 'AUTO_INCREMENT', 'AVG_ROW_LENGTH', 'BACKUP', 'BEGIN', 'BETWEEN', 'BINLOG', 'BOTH', 'BY', 'CASCADE', 'CASE', 'CHANGE', 'CHANGED',
		'CHARSET', 'CHECK', 'CHECKSUM', 'COLLATE', 'COLLATION', 'COLUMN', 'COLUMNS', 'COMMENT', 'COMMIT', 'COMMITTED', 'COMPRESSED', 'CONCURRENT', 
		'CONSTRAINT', 'CONTAINS', 'CONVERT', 'CREATE', 'CROSS', 'CURRENT_TIMESTAMP', 'DATABASE', 'DATABASES', 'DAY', 'DAY_HOUR', 'DAY_MINUTE', 
		'DAY_SECOND', 'DEFINER', 'DELAYED', 'DELAY_KEY_WRITE', 'DELETE', 'DESC', 'DESCRIBE', 'DETERMINISTIC', 'DISTINCT', 'DISTINCTROW', 'DIV',
		'DO', 'DROP', 'DUMPFILE', 'DUPLICATE', 'DYNAMIC', 'ELSE', 'ENCLOSED', 'END', 'ENGINE', 'ENGINES', 'ESCAPE', 'ESCAPED', 'EVENTS', 'EXECUTE',
		'EXISTS', 'EXPLAIN', 'EXTENDED', 'FAST', 'FIELDS', 'FILE', 'FIRST', 'FIXED', 'FLUSH', 'FOR', 'FORCE', 'FOREIGN', 'FROM', 'FULL', 'FULLTEXT',
		'FUNCTION', 'GEMINI', 'GEMINI_SPIN_RETRIES', 'GLOBAL', 'GRANT', 'GRANTS', 'GROUP', 'HAVING', 'HEAP', 'HIGH_PRIORITY', 'HOSTS', 'HOUR', 'HOUR_MINUTE',
		'HOUR_SECOND', 'IDENTIFIED', 'IF', 'IGNORE', 'IN', 'INDEX', 'INDEXES', 'INFILE', 'RIGHT', 'LEFT', 'JOIN', 'INNER', 'INSERT', 'INSERT_ID', 'INSERT_METHOD', 'INTERVAL',
		'INTO', 'INVOKER', 'IS', 'ISOLATION',  'KEY', 'KEYS', 'KILL', 'LAST_INSERT_ID', 'LEADING', 'LEVEL', 'LIKE', 'LIMIT', 'LINEAR',               
		'LINES', 'LOAD', 'LOCAL', 'LOCK', 'LOCKS', 'LOGS', 'LOW_PRIORITY', 'MARIA', 'MASTER', 'MASTER_CONNECT_RETRY', 'MASTER_HOST', 'MASTER_LOG_FILE',
		'MASTER_LOG_POS', 'MASTER_PASSWORD', 'MASTER_PORT', 'MASTER_USER', 'MATCH', 'MAX_CONNECTIONS_PER_HOUR', 'MAX_QUERIES_PER_HOUR',
		'MAX_ROWS', 'MAX_UPDATES_PER_HOUR', 'MAX_USER_CONNECTIONS', 'MEDIUM', 'MERGE', 'MINUTE', 'MINUTE_SECOND', 'MIN_ROWS', 'MODE', 'MODIFY',
		'MONTH', 'MRG_MYISAM', 'MYISAM', 'NAMES', 'NATURAL', 'NOT', 'NULL', 'OFFSET', 'ON', 'OPEN', 'OPTIMIZE', 'OPTION', 'OPTIONALLY', 'OR',
		'ORDER', 'OUTER', 'OUTFILE', 'PACK_KEYS', 'PAGE', 'PARTIAL', 'PARTITION', 'PARTITIONS', 'PASSWORD', 'PRIMARY', 'PRIVILEGES', 'PROCEDURE',
		'PROCESS', 'PROCESSLIST', 'PURGE', 'QUICK', 'RAID0', 'RAID_CHUNKS', 'RAID_CHUNKSIZE', 'RAID_TYPE', 'RANGE', 'READ', 'READ_ONLY',            
		'READ_WRITE', 'REFERENCES', 'REGEXP', 'RELOAD', 'RENAME', 'REPAIR', 'REPEATABLE', 'REPLACE', 'REPLICATION', 'RESET', 'RESTORE', 'RESTRICT',
		'RETURN', 'RETURNS', 'REVOKE', 'RLIKE', 'ROLLBACK', 'ROW', 'ROWS', 'ROW_FORMAT', 'SECOND', 'SECURITY', 'SELECT', 'SEPARATOR',
		'SERIALIZABLE', 'SESSION', 'SET', 'SHARE', 'SHOW', 'SHUTDOWN', 'SLAVE', 'SONAME', 'SOUNDS', 'SQL', 'SQL_AUTO_IS_NULL', 'SQL_BIG_RESULT',
		'SQL_BIG_SELECTS', 'SQL_BIG_TABLES', 'SQL_BUFFER_RESULT', 'SQL_CACHE', 'SQL_CALC_FOUND_ROWS', 'SQL_LOG_BIN', 'SQL_LOG_OFF',
		'SQL_LOG_UPDATE', 'SQL_LOW_PRIORITY_UPDATES', 'SQL_MAX_JOIN_SIZE', 'SQL_NO_CACHE', 'SQL_QUOTE_SHOW_CREATE', 'SQL_SAFE_UPDATES',
		'SQL_SELECT_LIMIT', 'SQL_SLAVE_SKIP_COUNTER', 'SQL_SMALL_RESULT', 'SQL_WARNINGS', 'START', 'STARTING', 'STATUS', 'STOP', 'STORAGE',
		'STRAIGHT_JOIN', 'STRING', 'STRIPED', 'SUPER', 'TABLE', 'TABLES', 'TEMPORARY', 'TERMINATED', 'THEN', 'TO', 'TRAILING', 'TRANSACTIONAL',    
		'TRUNCATE', 'TYPE', 'TYPES', 'UNCOMMITTED', 'UNION', 'UNIQUE', 'UNLOCK', 'UPDATE', 'USAGE', 'USE', 'USING', 'VALUES', 'VARIABLES',
		'VIEW', 'WHEN', 'WHERE', 'WITH', 'WORK', 'WRITE', 'XOR', 'YEAR_MONTH'
	);

	$sql_skip_reserved_words = array('AS', 'ON', 'USING');
	$sql_special_reserved_words = array('(', ')');
	$sql_raw = str_replace("\n", " ", $sql_raw);
	$sql_formatted = "";
	$prev_word = "";
	$word = "";

	for( $i=0, $j = strlen($sql_raw); $i < $j; $i++ ){
		$word .= $sql_raw[$i];
		$word_trimmed = trim($word);
		if($sql_raw[$i] == " " || in_array($sql_raw[$i], $sql_special_reserved_words)){
			$word_trimmed = trim($word);
			$trimmed_special = false;
			if( in_array($sql_raw[$i], $sql_special_reserved_words) ){
				$word_trimmed = substr($word_trimmed, 0, -1);
				$trimmed_special = true;
			}
			$word_trimmed = strtoupper($word_trimmed);
			if( in_array($word_trimmed, $sql_reserved_all) && !in_array($word_trimmed, $sql_skip_reserved_words) ){
				if(in_array($prev_word, $sql_reserved_all)){
					$sql_formatted .= strtoupper(trim($word)) . " ";
				} else {
					$sql_formatted .= strtoupper(trim($word)) . "\n";
				}
				$prev_word = $word_trimmed;
				$word = "";
			} else {
				$sql_formatted .= trim($word). " ";

				$prev_word = $word_trimmed;
				$word = "";
			}
		}
	}
	$sql_formatted .= trim($word);
	return $sql_formatted;
}

function get_defined_functions_in_file($file) {
    $source = file_get_contents($file);
    $tokens = token_get_all($source);

    $functions = array();
    $nextStringIsFunc = false;
    $inClass = false;
    $bracesCount = 0;

    foreach($tokens as $token) {
        switch($token[0]) {
            case T_CLASS:
                $inClass = true;
                break;
            case T_FUNCTION:
                if(!$inClass) $nextStringIsFunc = true;
                break;

            case T_STRING:
                if($nextStringIsFunc) {
                    $nextStringIsFunc = false;
                    $functions[] = $token[1];
                }
                break;

            // Anonymous functions
            case '(':
            case ';':
                $nextStringIsFunc = false;
                break;

            // Exclude Classes
            case '{':
                if($inClass) $bracesCount++;
                break;

            case '}':
                if($inClass) {
                    $bracesCount--;
                    if($bracesCount === 0) $inClass = false;
                }
                break;
        }
    }

    return $functions;
}

function libxml_display_error($error){
    $return = "<br/>\n";
    switch ($error->level) {
        case LIBXML_ERR_WARNING:
            $return .= "<b>Warning $error->code</b>: ";
            break;
        case LIBXML_ERR_ERROR:
            $return .= "<b>Error $error->code</b>: ";
            break;
        case LIBXML_ERR_FATAL:
            $return .= "<b>Fatal Error $error->code</b>: ";
            break;
    }
    $return .= trim($error->message);
    if ($error->file) {
        $return .=    " in <b>$error->file</b>";
    }
    $return .= " on line <b>$error->line</b>\n";

    return $return;
}
function libxml_display_errors() {
    $errors = libxml_get_errors();
    foreach ($errors as $error) {
        echo( libxml_display_error($error));
    }
    libxml_clear_errors();
}

/*
function utf8_encode($string){
	return iconv("ISO-8859-1", "UTF-8", $string);
}
*/
/************************************************************************************/
/*                   		  	  FUNC MIME POST								*/
/************************************************************************************/
function do_post_get($url){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	ob_start();
	include($url);
	$JsonAppo = ob_get_contents();
	ob_end_clean(); 
	return $JsonAppo;
}
function do_post_request($url, $fields = null, $optional_headers = null){
	// http_build_query is preferred but doesn't seem to work!
	// $fields_string = http_build_query($fields, '', '&', PHP_QUERY_RFC3986);
	$fields_string = '';
	$key = '';
	$value = '';
	$fields_string = '';

	// Create URL parameter string
	foreach ($fields as $key => $value) {
		$fields_string .= $key . '=' . $value . '&';
	}
	$fields_string = rtrim($fields_string, '&');

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_POST, count($fields));
	curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);

	curl_setopt($ch, CURLOPT_FRESH_CONNECT, 1); //no cache, reload
	curl_setopt($ch, CURLOPT_FORBID_REUSE, 1);  //no cache, no save
	curl_setopt($ch, CURLOPT_TIMEOUT, 60);  //timeout second
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); //data 

	$result = curl_exec($ch);

	if (curl_errno($ch)) {
		echo( "Error: " . curl_error($ch));
	} else {
		return $result;
	}
	curl_close($ch);
}
function get_post_request($url){
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	ob_start();
	include($url);
	$JsonAppo = ob_get_contents();
	ob_end_clean(); 
	return $JsonAppo;
}
function safe_content_disposition($file_name, $downloadable = false) {
	$agent = $_SERVER["HTTP_USER_AGENT"];
	if( is_int(strpos($agent, "MSIE")) ){
		$fn = preg_replace('/[:\\x5c\\/*?"<>|]/', '_', $file_name);
		return($downloadable ? "attachment;" : "" . "filename="	. rawurlencode($fn));
	} else if( is_int(strpos($agent, "Gecko")) ){
		# RFC 2231, 5987:
		return($downloadable ? "attachment;" : "" . "filename*=UTF-8''" . rawurlencode($file_name));
	} else if( is_int(strpos($agent, "Opera")) ) {
		$fn = preg_replace('/[:\\x5c\\/{?]/', '_', $file_name);
		# RFC 2231, 5987:
		return($downloadable ? "attachment;" : "" . "filename*=UTF-8''" . rawurlencode($fn));
	} else {
		# RFC 2616 ASCII-only encoding:
		$fn = mb_convert_encoding($file_name, "US-ASCII", "UTF-8");
		$fn = (string) str_replace("\\", "\\\\", $fn);
		$fn = (string) str_replace("\"", "\\\"", $fn);
		return($downloadable ? "attachment;" . "filename=\"$fn\"" : "" . "filename=\"$fn\"");
	}
}
function generateUpToDateMimeArray($url) {
    $mimeTypes = [];

    $content = file_get_contents($url);

    if ($content !== false) {
        $lines = explode("\n", $content);

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line && strpos($line, '#') !== 0) { // Ignore comments and empty lines
                $parts = preg_split('/\s+/', $line);
                if (count($parts) > 1) {
                    $mimeType = array_shift($parts);
                    foreach ($parts as $extension) {
                        $mimeTypes[$extension] = $mimeType;
                    }
                }
            }
        }
    }

    return $mimeTypes;
}
function safe_mime_content_type($filename) {
	$ext = WFFileExt($filename);
	if ($ext == '') return 'error/ext not defined';
	$ext = strtolower($ext);

	$mime_types = generateUpToDateMimeArray(APACHE_MIME_TYPES_URL);
	
	if (is_array($mime_types) && array_key_exists($ext, $mime_types) == true) {
		return $mime_types[$ext];
	} elseif (function_exists('finfo_open')) {
		$finfo = finfo_open(FILEINFO_MIME);
		$mimetype = finfo_file($finfo, $filename);
		finfo_close($finfo);
		return $mimetype;
	} else {
		return 'application/' . $ext ;
	}
}


/************************************************************************************/
/*                   		  FUNC SVG								 				*/
/************************************************************************************/
function WFSVGTO64($ImageOrigFileName){
	$ImageOrigPath = WFFileAbsolute($ImageOrigFileName);
	
	
	if (file_exists($ImageOrigPath)){

        $filetype = pathinfo($ImageOrigPath, PATHINFO_EXTENSION);

        if ($filetype==='svg'){
            $filetype .= '+xml';
        }

		$data = file_get_contents($ImageOrigPath);
        /*
		$data = preg_replace('/\v(?:[\v\h]+)/', ' ', $data);
        $data = str_replace('"', "'", $data);
        $data = rawurlencode($data);
        // re-decode a few characters understood by browsers to improve compression
        $data = str_replace('%20', ' ', $data);
        $data = str_replace('%3D', '=', $data);
        $data = str_replace('%3A', ':', $data);
        $data = str_replace('%2F', '/', $data);
		*/
        return $data;
		
        //$get_img = file_get_contents($ImageOrigPath);
       // return 'data:image/' . $filetype . ';base64,' . base64_encode($get_img );
    }else{
		return 'data:image/svg+xml;base64,';
	}
}

/************************************************************************************/
/*                   		  FUNC IMAGE								 				*/
/************************************************************************************/
function WFIMAGETO64($ImageOrigFileName){
	$ImageOrigPath = WFFileAbsolute($ImageOrigFileName);
	if (file_exists($ImageOrigPath)){
		$filename = basename($ImageOrigPath);
		$info = getimagesize($ImageOrigPath);
		$imageOrigFPointer = fopen($ImageOrigPath, 'r', true);
		//return 'data:image/' . right($filename,3) . ';base64,' . $ImageOrigPath;
		$imageOrigString = stream_get_contents($imageOrigFPointer);
		return 'data:image/' . right($filename,3) . ';base64,' .base64_encode($imageOrigString);
	}else{
		return 'data:image/JPG;base64,';
	}
}
function WFIMAGETO64REDUX($ImageOrigFileName, $percent = 100, $newWidth = 0, $newHeight = 0, $quality = 5){
	$ImageOrigPath = WFFileAbsolute($ImageOrigFileName);
	correctImageOrientation($ImageOrigPath);
	if (file_exists($ImageOrigPath)){
		$filename = basename($ImageOrigPath);
		$info = getimagesize($ImageOrigPath);
		if ($info['mime'] == 'image/jpeg') 
			$imageOrig = imagecreatefromjpeg($ImageOrigPath);
		elseif ($info['mime'] == 'image/gif') 
			$imageOrig = imagecreatefromgif($ImageOrigPath);
		elseif ($info['mime'] == 'image/png') 
			$imageOrig = imagecreatefrompng($ImageOrigPath);
			
		$imageOrigFPointer = fopen($ImageOrigPath, 'r', true);
		$imageOrigString = stream_get_contents($imageOrigFPointer);
		
		$width = imagesx($imageOrig);
		$height = imagesy($imageOrig);

		if ( ($percent != 100) || ( ($newWidth == 0) && ($newHeight == 0) ) ) {
			$newWidth = $width * ($percent /100);
			$newHeight = $height * ($percent /100);
		}
		else{
			if ( ($newWidth != 0) && ($newHeight == 0) ){
				$percent  =  ($newWidth * 100)/$width; 
				$newHeight = $height * ($percent /100);
			}
			if ( ($newHeight != 0) && ($newWidth == 0) ){
				$percent  =  ($newHeight * 100)/$height ; 
				$newWidth = $width * ($percent /100);
			}
		}
		$imageRedux = imagecreatetruecolor($newWidth, $newHeight);
		
		if ($info['mime'] == 'image/png') {
			$background = imagecolorallocate($imageRedux , 0, 0, 0);
			// removing the black from the placeholder
			imagecolortransparent($imageRedux, $background);

			// turning off alpha blending (to ensure alpha channel information
			// is preserved, rather than removed (blending with the rest of the
			// image in the form of black))
			imagealphablending($imageRedux, false);

			// turning on alpha channel information saving (to ensure the full range
			// of transparency is preserved)
			imagesavealpha($imageRedux, true);
		}
		elseif ($info['mime'] == 'image/gif'){
			// integer representation of the color black (rgb: 0,0,0)
			$background = imagecolorallocate($imageRedux,  255, 255, 255);
			// removing the black from the placeholder
			imagecolortransparent($imageRedux, $background);
		}
		
		imagecopyresized($imageRedux, $imageOrig, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

		$imageReduxString ="";
		$stream = fopen('php://memory','r+');
		if ($info['mime'] == 'image/jpeg') 
			imagejpeg($imageRedux, $stream, $quality);
		elseif ($info['mime'] == 'image/gif') 
			imagegif($imageRedux, $stream, $quality);
		elseif ($info['mime'] == 'image/png') 
			imagepng($imageRedux, $stream, $quality);
		rewind($stream);
		$imageReduxString = stream_get_contents($stream);
		return 'data:image/' . right($filename,3) . ';base64,' .base64_encode($imageReduxString);
	}else{
		return 'data:image/JPG;base64,';
	}
}
function correctImageOrientation($filename){
    $exif = exif_read_data($filename);
    if ($exif && isset($exif['Orientation'])) {
        $orientation = $exif['Orientation'];
        if ($orientation != 1) {
            $img = imagecreatefromjpeg($filename);
            $deg = 0;
            switch ($orientation) {
                case 3:
                    $deg = 180;
                    break;
                case 6:
                    $deg = 270;
                    break;
                case 8:
                    $deg = 90;
                    break;
            }
            if ($deg) {
                $img = imagerotate($img, $deg, 0);
            }
            imagejpeg($img, $filename, 95);
        }
    }
}
function compressImage($source, $destination, $quality) { 
    // Get image info 
    $imgInfo = getimagesize($source); 
    $mime = $imgInfo['mime']; 
     
    // Create a new image from file 
    switch($mime){ 
        case 'image/jpeg': 
            $image = imagecreatefromjpeg($source); 
           imagejpeg($image, $destination, $quality);
            break; 
        case 'image/png': 
            $image = imagecreatefrompng($source); 
            imagepng($image, $destination, $quality);
            break; 
        case 'image/gif': 
            $image = imagecreatefromgif($source); 
            imagegif($image, $destination, $quality);
            break; 
        default: 
            $image = imagecreatefromjpeg($source); 
           imagejpeg($image, $destination, $quality);
    } 
     
     
    // Return compressed image 
    return $destination; 
}
/**
 * Resize image given a height and width and return raw image data.
 *
 * Note : You can add more supported image formats adding more parameters to the switch statement.
 *
 * @param type $file filepath
 * @param type $w width in px
 * @param type $h height in px
 * @param type $crop Crop or not
 * @return type
 */
function resize_image($file, $w, $h, $crop=false) {
    list($width, $height) = getimagesize($file);
    $r = $width / $height;
    if ($crop) {
        if ($width > $height) {
            $width = ceil($width-($width*abs($r-$w/$h)));
        } else {
            $height = ceil($height-($height*abs($r-$w/$h)));
        }
        $newwidth = $w;
        $newheight = $h;
    } else {
        if ($w/$h > $r) {
            $newwidth = $h*$r;
            $newheight = $h;
        } else {
            $newheight = $w/$r;
            $newwidth = $w;
        }
    }
    
    //Get file extension
    $exploding = explode(".",$file);
    $ext = end($exploding);
    
    switch($ext){
        case "png":
            $src = imagecreatefrompng($file);
        break;
        case "jpeg":
        case "jpg":
            $src = imagecreatefromjpeg($file);
        break;
        case "gif":
            $src = imagecreatefromgif($file);
        break;
        default:
            $src = imagecreatefromjpeg($file);
        break;
    }
    
    $dst = imagecreatetruecolor($newwidth, $newheight);
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);

    return $dst;
}
/**
 * Decrease or increase the quality of an image without resize it.
 * 
 * @param type $source
 * @param type $destination
 * @param type $quality
 * @return type
 */
function compress($source, $destination, $quality) {
    $info = getimagesize($source);

    if ($info['mime'] == 'image/jpeg') 
        $image = imagecreatefromjpeg($source);

    elseif ($info['mime'] == 'image/gif') 
        $image = imagecreatefromgif($source);

    elseif ($info['mime'] == 'image/png') 
        $image = imagecreatefrompng($source);

    imagejpeg($image, $destination, $quality);

    return $destination;
}

