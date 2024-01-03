<?php

/************************************************************************************/
/*                   		  	  FUNC 	BARCODE EAN128 GS1							*/
/************************************************************************************/
function barcodeDecode128($Barcode, $GroupChr = '*', $StartChr = '*') {
	$GSArray = array();
	#DEFINITION AI
	{
	$AI = array( 
		//case "0": // SSCC (Serial Shipping Container Code)
		array(	'code' => '00',		'um' => '',		'desc' => 'SSCC',				'fixed'=>true,	'type'=>'A', 'len' => 18),	 //<- UNIQUE ID OF PAL
		array(	'code' => '01',		'um' => '',		'desc' => 'GTIN',				'fixed'=>true,	'type'=>'A', 'len' => 14),	 //<- GTIN ITF-14
		array(	'code' => '02',		'um' => '',		'desc' => 'ProductCode',		'fixed'=>true,	'type'=>'A', 'len' => 14),   //<- EAN13 PRODUCT
		//case "1":  // Length or first dimension, metres DECIMAL  MT KG
		array(	'code' => '10',		'um' => '',		'desc' => 'Batch',				'fixed'=>false,	'type'=>'A', 'len' => 14),
		array(	'code' => '11',		'um' => '',		'desc' => 'ProductionDate',		'fixed'=>true,	'type'=>'D', 'len' => 6 ),
		array(	'code' => '13',		'um' => '',		'desc' => 'PackagingDate',		'fixed'=>true,	'type'=>'D', 'len' => 6 ),
		array(	'code' => '15',		'um' => '',		'desc' => 'BestDate',			'fixed'=>true,	'type'=>'D', 'len' => 6 ),
		array(	'code' => '17',		'um' => '',		'desc' => 'ExpirationDate',		'fixed'=>true,	'type'=>'D', 'len' => 6 ),
		//case "2":  // Width, diameter, or second dimension, metres DECIMAL  MT KG
		array(	'code' => '20',		'um' => '',		'desc' => 'ProductVariant',		'fixed'=>true,	'type'=>'A', 'len' => 2 ),
		array(	'code' => '21',		'um' => '',		'desc' => 'SerialNumber',		'fixed'=>false,	'type'=>'A', 'len' => 20),
		array(	'code' => '22',		'um' => '',		'desc' => 'Note',				'fixed'=>false,	'type'=>'A', 'len' => 29),
		array(	'code' => '23',		'um' => '',		'desc' => 'Lot',				'fixed'=>false,	'type'=>'A', 'len' => 19),
		array(	'code' => '240',	'um' => '',		'desc' => 'ProductAdditional',	'fixed'=>false,	'type'=>'A', 'len' => 30),
		array(	'code' => '241',	'um' => '',		'desc' => 'CustomerPartNum',	'fixed'=>false,	'type'=>'A', 'len' => 30),
		array(	'code' => '242',	'um' => '',		'desc' => 'VariationNumber',	'fixed'=>false,	'type'=>'A', 'len' => 6 ),
		array(	'code' => '243',	'um' => '',		'desc' => 'PackagingComponent',	'fixed'=>false,	'type'=>'A', 'len' => 6 ),
		array(	'code' => '250',	'um' => '',		'desc' => 'Secondary Serial',	'fixed'=>false,	'type'=>'A', 'len' => 30),
		array(	'code' => '251',	'um' => '',		'desc' => 'ReferenceSource',	'fixed'=>false,	'type'=>'A', 'len' => 30),
		array(	'code' => '253',	'um' => '',		'desc' => 'GDT Identifier',		'fixed'=>false,	'type'=>'A', 'len' => 30),
		array(	'code' => '254',	'um' => '',		'desc' => 'GLN Extension'	,	'fixed'=>false,	'type'=>'A', 'len' => 20),
		array(	'code' => '255',	'um' => '',		'desc' => 'GCN'	,				'fixed'=>false,	'type'=>'A', 'len' => 20),
		//case "3": // Depth, thickness, height, or third dimension DECIMAL  MT KG
		array(	'code' => '30',		'um' => '',		'desc' => 'QuantityEach',		'fixed'=>true,	'type'=>'N', 'len' => 2 ),
		//case "31": // NET  Depth, thickness, height, or third dimension DECIMAL MT KG
		array(	'code' => '310',	'um' => '1',	'desc' => 'Weight',				'fixed'=>true,	'type'=>'N', 'len' => 6 ),
		array(	'code' => '311',	'um' => '1',	'desc' => 'Length',				'fixed'=>true,	'type'=>'N', 'len' => 6 ),
		array(	'code' => '312',	'um' => '1',	'desc' => 'Width',				'fixed'=>true,	'type'=>'N', 'len' => 6 ),
		array(	'code' => '313',	'um' => '1',	'desc' => 'Height',				'fixed'=>true,	'type'=>'N', 'len' => 6 ),
		array(	'code' => '314',	'um' => '1',	'desc' => 'Area',				'fixed'=>true,	'type'=>'N', 'len' => 6 ),
		array(	'code' => '315',	'um' => '1',	'desc' => 'VolumeLt',			'fixed'=>true,	'type'=>'N', 'len' => 6 ),
		array(	'code' => '316',	'um' => '1',	'desc' => 'Volume',				'fixed'=>true,	'type'=>'N', 'len' => 6 ),
		//case "32": // NET  Depth, thickness, height, or third dimension IMPERIAL INCH LBR 
		array(	'code' => '330',	'um' => '1',	'desc' => 'Container Weight kg','fixed'=>true,	'type'=>'N', 'len' => 6 ),
		array(	'code' => '331',	'um' => '1',	'desc' => 'Container Length mt','fixed'=>true,	'type'=>'N', 'len' => 6 ),
		array(	'code' => '332',	'um' => '1',	'desc' => 'Container Width mt',	'fixed'=>true,	'type'=>'N', 'len' => 6 ),
		array(	'code' => '333',	'um' => '1',	'desc' => 'Container Depth mt',	'fixed'=>true,	'type'=>'N', 'len' => 6 ),
		array(	'code' => '334',	'um' => '1',	'desc' => 'Container Area mc',	'fixed'=>true,	'type'=>'N', 'len' => 6 ),
		array(	'code' => '335',	'um' => '1',	'desc' => 'Container Volume lt','fixed'=>true,	'type'=>'N', 'len' => 6 ),
		array(	'code' => '336',	'um' => '1',	'desc' => 'Container Volume mc','fixed'=>true,	'type'=>'N', 'len' => 6 ),
		array(	'code' => '337',	'um' => '1',	'desc' => 'Container Weight mc','fixed'=>true,	'type'=>'N', 'len' => 6 ),
		//case "33": // GROSS Depth, thickness, height, or third dimension DECIMAL MT KG 
		//case "34": // GROSS Depth, thickness, height, or third dimension IMPERIAL INCH LBR
		//case "35": // AREA  Depth, thickness, height, or third dimension IMPERIAL INK YDK
		//case "36": // VOLUME  Depth, thickness, height, or third dimension IMPERIAL GLL QT
		//case "37": // COUNT numeber of packages (02 GTIN CODE)
		array(	'code' => '37',		'um' => '',		'desc' => 'QuantityPck',		'fixed'=>true,	'type'=>'N', 'len' => 8 ),
		//case "38": // ND
		//case "39": // CURRENCY
		array(	'code' => '390',	'um' => '1',	'desc' => 'Price Ext Local',	'fixed'=>false,	'type'=>'N', 'len' => 18),
		array(	'code' => '391',	'um' => 'iso',	'desc' => 'Price Ext ISO',		'fixed'=>false,	'type'=>'N', 'len' => 18),
		array(	'code' => '392',	'um' => '1',	'desc' => 'Price Int Local ',	'fixed'=>false,	'type'=>'N', 'len' => 18),
		array(	'code' => '393',	'um' => 'iso',	'desc' => 'Price Int ISO',		'fixed'=>false,	'type'=>'N', 'len' => 18),
		//case "4":  // Area, square metres
		array(	'code' => '401',	'um' => '',		'desc' => 'Customer Order',		'fixed'=>false,	'type'=>'A', 'len' => 30),
		array(	'code' => '402',	'um' => '',		'desc' => 'Consignment ',		'fixed'=>true,	'type'=>'A', 'len' => 17),
		array(	'code' => '403',	'um' => '',		'desc' => 'Routing ',			'fixed'=>false,	'type'=>'A', 'len' => 30),
		array(	'code' => '410',	'um' => '',		'desc' => 'Ship To GLN',		'fixed'=>true,	'type'=>'A', 'len' => 13),
		array(	'code' => '411',	'um' => '',		'desc' => 'Bill To GLN',		'fixed'=>true,	'type'=>'A', 'len' => 13),
		array(	'code' => '412',	'um' => '',		'desc' => 'Purchase From GLN',	'fixed'=>true,	'type'=>'A', 'len' => 13),
		array(	'code' => '413',	'um' => '',		'desc' => 'Forward to GLN',		'fixed'=>true,	'type'=>'A', 'len' => 13),
		array(	'code' => '414',	'um' => '',		'desc' => 'Physical GLN',		'fixed'=>true,	'type'=>'A', 'len' => 13),
		array(	'code' => '421',	'um' => '',		'desc' => 'Ship To CAP'	,		'fixed'=>false,	'type'=>'A', 'len' => 12),
		//case "5": // Logistic volume, litres
		//case "6": // Logistic volume, cubic metres
		//case "7": // Kilograms per square metre, yes, the ISO code for this _is_ "28".
		array(	'code' => '8008',	'um' => '',		'desc' => 'Production DateTime','fixed'=>true,	'type'=>'A', 'len' => 12)
	);
	}
	
	if ($GroupChr == '*'){
		str_replace("#", "", $Barcode);
		$GroupChr == '';
	}
	
	//CERCA INIZIO STRINGA
	// ""]C101"
	$AIStr = "";
	$CODE128 = "";
	for($start = 0; $start <= strlen($Barcode); $start++) {
		$ParsChr = substr($Barcode, $start, 1);
		
		if (($StartChr == '*') && (('[' == $ParsChr ) || ('+' == $ParsChr ))){
			$CODETYPE = substr($Barcode, $start + 1, 2);
			$start = $start +2;
			$AIStr = substr($Barcode, $start + 1, 4);
			break;
		}elseif ($StartChr == $ParsChr ){
			$CODETYPE = substr($Barcode, $start + 1, 2);
			$start = $start +2;
			$AIStr = substr($Barcode, $start + 1, 4);
			break;
		}
	}
	
	rileggi:
	foreach($AI as $key => $value) {
		$AIGroup = substr($AIStr, 0, strlen($value['code']));
		
		if($value['code'] == $AIGroup){
			$Moltiplica = '';
			$CountryCode = '';
			$ValueDef = '';
			if ($value['fixed']==true){
				$start = $start + strlen($value['code']);
				if ($value['um'] == '1') {
					$Moltiplica =  extractText($Barcode, $start+1 , $start +1);
					$start = $start +1; 
				}
				$end = $start + $value['len'];
				$ValueDef = extractText($Barcode, $start +1 , $end);
				//cerca fine anticipata
				$endAnt = strpos($ValueDef, $GroupChr) ;
				if (($endAnt > 0) && ($endAnt < $value['len'])) {
					$end = $start + $endAnt;
					$ValueDef = extractText($Barcode, $start +1 , $end);
					$end = $end + 1;
				}
				$AIStr = substr($Barcode, $end+1, 4);
				$start =  $end;
			}else{
				$start =  $start + strlen($value['code']);
				if ($value['um'] == 'iso') {
					$Moltiplica =  extractText($Barcode, $start +1 , $start +1);
					$CountryCode =  extractText($Barcode, $start +2 , $start +5);
					$start = $start +4; 
				}elseif ($value['um'] == '1') {
					$Moltiplica =  extractText($Barcode, $start +1 , $start +1);
					$start = $start +1; 
				}
				$end = strpos($Barcode, $GroupChr, $start)-1 ;
				if ($end ==-1) $end = strlen($Barcode);
				$ValueDef = extractText($Barcode, $start +1 , $end);
				$end = $end + strlen($GroupChr);
				
				$AIStr = substr($Barcode, $end+1 , 4);
				$start =  $end;
			}
			$ValueDef = trim($ValueDef);
			
			if ($ValueDef != ''){
				if ($Moltiplica == 1) $Moltiplica = 10;
				if ($Moltiplica == 2) $Moltiplica = 100;
				if ($Moltiplica == 3) $Moltiplica = 1000;
				if ($Moltiplica == 4) $Moltiplica = 10000;
				if($value['type'] == 'N') {
					$ValueDef = floatval ($ValueDef);
					if ($Moltiplica != '') $ValueDef = $ValueDef / $Moltiplica;
				}
				if($value['type'] == 'D') $ValueDef =  substr($ValueDef,-2) . '-' . substr($ValueDef,2,2)  . '-' .  strval(2000 + intval(substr($ValueDef,0,2)));
				$ValueDef = ltrim($ValueDef, '0');
				$GSArray[$value['desc']] = $ValueDef;
				$GSArray[$value['code'] ] = $ValueDef;
				
				//builder list AI
				$CODE128 = $CODE128 . '(' . $value['code'] . ')' . $ValueDef . '';
			}
			
			goto rileggi;
		}
	}
		
	//builder producer
	if (array_key_exists('00', $GSArray)){
		//SSCC
		$GSArray['GTINPrefix'] = $ValueDef;
		$GSArray['90'] = $ValueDef;
	}
	elseif (array_key_exists('01', $GSArray)){
		//GTINPck
	}
	elseif (array_key_exists('02', $GSArray)){
		//GTIN
	}
	
	
	//builder list AI
	$GSArray['CODE128'] = $CODE128;
	
	return $GSArray;
}

function barcodeEncodeSSCC($PrefixChr = '3', $Manufacturer = '123456789', $SerialNumber = '1234567') {
	// 1 è scelta da chi assegna il codice e può assumere valori compresi tra 0 e 9.	
	// 9 è assegnato da GS1 all’azienda che assembla fisicamente l’unità logistica	è assegnato in maniera sequenziale a ciascuna unità logistica assemblata	
	// 7 è assegnato in maniera sequenziale a ciascuna unità logistica assemblata
	// 1 cifra chk
	
	$code = '(00)' . 
			$PrefixChr .
			WFFORMAT($Manufacturer,9,'0',STR_PAD_LEFT) . 
			WFFORMAT($SerialNumber,7,'0',STR_PAD_LEFT);
	$chdigit = barcodeCheckDigit($code);
	return $code . $chdigit;
}

function barcodeCheckDigit($upc_code){
    $odd_total  = 0;
    $even_total = 0;
 
    for($i=0; $i<11; $i++)    {
        if((($i+1)%2) == 0) {
            /* Sum even digits */
            $even_total += $upc_code[$i];
        } else {
            /* Sum odd digits */
            $odd_total += $upc_code[$i];
        }
    }
    $sum = (3 * $odd_total) + $even_total;
    /* Get the remainder MOD 10*/
    $check_digit = $sum % 10;
    /* If the result is not zero, subtract the result from ten. */
    return ($check_digit > 0) ? 10 - $check_digit : $check_digit;
}

?>