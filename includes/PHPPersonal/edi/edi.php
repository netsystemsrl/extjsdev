<?php

function GetStringFromRecord($ArrayField,  $TipoRecord, $Library = 'EURITMO', $document ='ORDERS', $Separator = '\r\n'){
	global $ExtJSDevWWW;
	$messageArray = array();
	$message = '';
	/* DEF FILE*/
	$handle = fopen($ExtJSDevWWW .'includes/PHPPersonal/edi/' . $Library . '/' . $document . '/' . $TipoRecord . ".fld", "r");
	if ($handle) {
		//head of file
		$line = fgets($handle);
		//definition
		while (($line = fgets($handle)) !== false) {
			$value = '';

			if ($line != ''){
				$col = explode(',', $line);
				$fieldname = trim($col[0]);
				
				//get value
				if (array_key_exists($fieldname, $ArrayField)) {
					$value = $ArrayField[$fieldname];
				}
				else{
					//default
					$value = $col[4];
				}
				//cleanup value
				$value = $value . '';
				$unwanted_array = array(    'Š'=>'S', 'š'=>'s', 'Ž'=>'Z', 'ž'=>'z', 'À'=>'A', 'Á'=>'A', 'Â'=>'A', 'Ã'=>'A', 'Ä'=>'A', 'Å'=>'A', 'Æ'=>'A', 'Ç'=>'C', 'È'=>'E', 'É'=>'E',
											'Ê'=>'E', 'Ë'=>'E', 'Ì'=>'I', 'Í'=>'I', 'Î'=>'I', 'Ï'=>'I', 'Ñ'=>'N', 'Ò'=>'O', 'Ó'=>'O', 'Ô'=>'O', 'Õ'=>'O', 'Ö'=>'O', 'Ø'=>'O', 'Ù'=>'U',
											'Ú'=>'U', 'Û'=>'U', 'Ü'=>'U', 'Ý'=>'Y', 'Þ'=>'B', 'ß'=>'Ss', 'à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a', 'å'=>'a', 'æ'=>'a', 'ç'=>'c',
											'è'=>'e', 'é'=>'e', 'ê'=>'e', 'ë'=>'e', 'ì'=>'i', 'í'=>'i', 'î'=>'i', 'ï'=>'i', 'ð'=>'o', 'ñ'=>'n', 'ò'=>'o', 'ó'=>'o', 'ô'=>'o', 'õ'=>'o',
											'ö'=>'o', 'ø'=>'o', 'ù'=>'u', 'ú'=>'u', 'û'=>'u', 'ý'=>'y', 'þ'=>'b', 'ÿ'=>'y' );
				$value = strtr( $value, $unwanted_array );
				$value = trim($value);
				
				//required test
				$required = trim($col[3]);
				if (($required == 'Y') && ($value == '')){
					return null;
				}
				
				//truncate and pad
				$fieldlen = (int)($col[1]);
				$fieldalign = trim($col[2]);
				$value = substr($value, 0, $fieldlen);
				if ($fieldalign == 'L0') { $value = str_pad($value,$fieldlen,'0',STR_PAD_RIGHT); }
				elseif ($fieldalign == 'L') {$value = str_pad($value,$fieldlen,' ',STR_PAD_RIGHT); }
				elseif ($fieldalign == 'R0') { $value = str_pad($value,$fieldlen,'0',STR_PAD_LEFT); }
				elseif ($fieldalign == 'R') { $value = str_pad($value,$fieldlen,' ',STR_PAD_LEFT); }
				
				$message = $message . trim($value) . $Separator;
			}
		}
		fclose($handle);
	} else {
		return null;
	} 	
	return $message 
}
function GetRecordFromString($StringField, $TipoRecord, $Library = 'EURITMO', $document ='ORDERS', $Separator = ''){
	global $ExtJSDevWWW;
	$messageArray = array();
	$i = 0;
	$start = 0;
	/* DEF FILE */
	$handle = fopen($ExtJSDevWWW .'includes/PHPPersonal/edi/' . $Library . '/' . $document . '/' . $TipoRecord . ".fld", "r");
	if ($handle) {
		while (($line = fgets($handle)) !== false) {
			$value = '';
			if ($i != 0) {
				$col = explode(',', $line);
				$chrlen = (int)$col[1];
				if (trim($col[0]) != ''){
					$fieldValue = trim(substr($StringField, $start, $chrlen));
					$messageArray[trim($col[0])] = $fieldValue;
				}
				$start = $start + $chrlen;
			}
			$i = $i + 1;
		}
		fclose($handle);
	} 
	else {
		//echo('ERRORE');
		return null;
	} 	
	return $messageArray;
}

function GetRecordFromStringDelim($StringField, $TipoRecord, $Library = 'EURITMO', $document ='ORDERS'){
	global $ExtJSDevWWW;
	$messageArray = array();
	$ArrayField = multiexplode(array("+",":"), $StringField);
	//var_dump($ArrayField);
	$i = 0;
	$k = 0;
	/* DEF FILE*/
	$handle = fopen($ExtJSDevWWW .'includes/PHPPersonal/edi/' . $Library . '/' . $document . '/' . $TipoRecord . ".fld", "r");
	if ($handle) {
		while (($line = fgets($handle)) !== false) {
			$value = '';
			if ($i != 0) {
				$col = explode(',', $line);
				$column = trim($col[0]);
				$chrlen = (int)$col[1];
				//SEPARATED VALUE
				if ( ($column != '') && ($column != 'DELIM')  && ($column != 'END') ) {
					if ($k < count($ArrayField)){
						$fieldValue = trim($ArrayField[$k]);
					}else{
						$fieldValue = 'ERR' . $k;
					}
					$messageArray[$column] = $fieldValue;
					$k = $k +1;
				}
			}
			$i = $i + 1;
		}
		fclose($handle);
	} 
	else {
		//echo('ERRORE');
		return null;
	} 	
	return $messageArray;
}
function multiexplode ($delimiters,$string) {

    $ready = str_replace($delimiters, $delimiters[0], $string);
    $launch = explode($delimiters[0], $ready);
    return  $launch;
}
function GetXLSValueFromString($StringField, $TipoRecord, $Library = 'EURITMO', $document ='ORDERS'){
	global $ExtJSDevWWW;
	$messageArray = array();
	$i = 0;
	$start = 0;
	/* DEF FILE*/
	$handle = fopen($ExtJSDevWWW .'includes/PHPPersonal/edi/' . $Library . '/' . $document . '/' . $TipoRecord . ".fld", "r");
	if ($handle) {
		while (($line = fgets($handle)) !== false) {
			$value = '';
			if ($i != 0) {
				$col = explode(',', $line);
				$chrlen = (int)$col[1];
				if (trim($col[0]) != ''){
					$fieldValue = trim(substr($StringField, $start, $chrlen));
					$messageArray[trim($col[0])] = $fieldValue;
				}
				$start = $start + $chrlen;
			}
			$i = $i + 1;
		}
		fclose($handle);
	} else {
		return null;
	} 	
	return $messageArray;
}

function TrovaArticolo($AnagraficaID, $CodiceExt){
	$CodiceExt = trim($CodiceExt);
	$Articolo = '';
	//cerca nei listini
	$ArticoloListino = WFVALUEDLOOKUP('ID, CT_ARTICOLI','articolilistini',"CT_ANAGRAFICHE = " . $AnagraficaID . 
									  									" AND CODICEALTERNATIVO = '" . $CodiceExt . "'");
	if ($ArticoloListino == ''){
		$ArticoloListino = WFVALUEDLOOKUP('ID, CT_ARTICOLI','articolilistini',"CT_ANAGRAFICHE = " . $AnagraficaID . 
										  									" AND CODICEALTERNATIVO = '" . addslashes($CodiceExt) . "'");
	}
	if ($ArticoloListino == '' && (strlen(cint($CodiceExt)) > 5) ){
			$ArticoloListino = WFVALUEDLOOKUP('ID, CT_ARTICOLI','articolilistini',"CT_ANAGRAFICHE = " . $AnagraficaID . 
										  									" AND CAST(SUBSTRING_INDEX(CODICEALTERNATIVO, '-', -1) AS UNSIGNED) = '" . cint($CodiceExt)  . "'");
	}
	if ($ArticoloListino != ''){
		$Articolo = WFVALUEDLOOKUP('*','articoli',"ID = " . $ArticoloListino['CT_ARTICOLI']);
	}
	//cerca in anagrafica
	if ($Articolo == ''){
		$Articolo = WFVALUEDLOOKUP('*','articoli',"BARCODE = '" . addslashes($CodiceExt) . "'");
	}
	if ($Articolo == ''){
		$Articolo = WFVALUEDLOOKUP('*','articoli',"BARCODECRT = '" . addslashes($CodiceExt) . "'");
	}
	if ($Articolo == ''){
		$Articolo = WFVALUEDLOOKUP('*','articoli',"CODICE  = '" . $CodiceExt . "'");
	}
	return $Articolo;
}