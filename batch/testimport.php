<?php	 
include('../includes/var.php');	
$output = array();
ini_set('memory_limit', '-1'); set_time_limit(0); 
// ini_set("output_buffering", 0);  // off 
ini_set("zlib.output_compression", 0);  // off
ini_set("implicit_flush", 1);  // on   

global $_SESSION;
session_write_close();
ini_set('memory_limit', '-1');
ini_set('max_execution_time', '-1'); 

//error_reporting(E_ALL);
ini_set('display_errors', 1);
$CollectObjList = array();


//include('../includes/simple_html_dom.php');

$conn = ADONewConnection('mysqli');
$conn->debug = 0;
$conn->PConnect("127.0.0.1",'root','xW6hy6V1u9','bettsist');
$conn->EXECUTE("SET NAMES 'utf8'");
$conn->EXECUTE("SET CHARACTER SET 'utf8'");
$conn->EXECUTE("SET lc_time_names = 'it_IT'");
$conn->SetFetchMode(ADODB_FETCH_ASSOC);

		
$sql = "SELECT *
		FROM bt_prodotti
		WHERE lingua = 0";
		//WHERE ID = 15560
$Rs = $conn->Execute($sql);

while (!$Rs->EOF) {
	$TableField = getFieldNames('convertiti', $conn);
	$tFieldName = array();
	$html = $Rs->fields['ehtml_cod'];
	$DOM = new DOMDocument;
	$DOM->loadHTML($html);
	$items = $DOM->getElementsByTagName('tr');
	foreach ($items as $node) {
		if (!$tFieldName) {
			//GET COLUMNS NAME
			$tFieldName = tdrows($node->childNodes);
			//CHECK FIELD TABLE DB
			foreach ($tFieldName as &$FieldName) {
				$FieldName = strtoupper(StringAZ09($FieldName,'_'));
				$FieldName = str_replace(' ', '_', $FieldName);
				$FieldName = str_replace('-', '_', $FieldName);
				$FieldName = str_replace('__', '', $FieldName);
				$FieldName = str_replace('MM', '', $FieldName);
				$FieldName = ltrim($FieldName,'_');
				$FieldName = rtrim($FieldName,'_');
				$FieldName = trim($FieldName);
				$FieldName = left($FieldName,30);
				if ($FieldName == 'KEY') $FieldName = 'CHIAVE';
				if ($FieldName == 'AND') $FieldName = 'AAND';
				if ($FieldName == 'USE') $FieldName = 'AUSE';
				if ($FieldName == 'THREAD') $FieldName = 'ATHREAD';
				if (($FieldName!= '') && ($FieldName!= '_')){
					if (!in_array($FieldName, $TableField)) {
						$TableField[] = $FieldName;
						$sqlC = "ALTER TABLE convertiti ADD " . $FieldName . " VARCHAR(30);";
						//var_dump($TableField);
						//echo($sqlC . '<BR>');
						$conn->Execute($sqlC);
					}
				}
			}
		}else{
			$i = 0;
			$appo = array();
			$appo['CODICE'] = $Rs->fields['codice'];
			$appo['IMMAGINE'] = $Rs->fields['immagine'];
			$appo['DESCRIZIONE'] = $Rs->fields['descrizione'];
			$ArrayFieldValue = tdrows($node->childNodes);
			foreach ($ArrayFieldValue as $FieldValue) {
				$appo[$tFieldName[$i]] = trim($FieldValue);
				$i = $i +1;
			}
			
			//var_dump($appo);
			
			//WRITE DATA TO TABLE
			try{
				$conn->AutoExecute("convertiti", $appo, 'INSERT');
			} catch (exception $e){
				echo('Errore' . '<BR>');
			}
			
		}
	}
	
	$Rs->MoveNext();
}


function getFieldNames($strTable, $cn) {
    $aRet = array();
    $lngCountFields = 0;
    $strSQL = "SELECT * FROM $strTable LIMIT 1;";
    $rs = $cn->Execute($strSQL)
            or die("Error in query: \n$strSQL\n"  . $cn->ErrorMsg());
	for ($i = 0; $i < $rs->FieldCount(); $i++) {
		$fld = $rs->FetchField($i);
		$aRet[$lngCountFields] = $fld->name;
		$lngCountFields++;
		
	}
    $rs->Close();
    $rs = null;
    return $aRet;
}

function tdrows($elements){
    $str = array();
    foreach ($elements as $element) {
        $str[] = $element->nodeValue;
    }
    return $str;
}

