<?php	

/************************************************************************************/
/*                   		  	  FUNC CHECK  									*/
/************************************************************************************/
function IBANSplit($iban){
	global $output;
	//STATO	CHK	CIN	ABI		CAB		conto corrente
	//IT	02	L	12345	12345	123456789012
	$iban = trim($iban);
	$iban = strtoupper($iban);
	if (IBANcheck($iban)){
		if ( (strlen($iban) == 27) && (substr($iban, 0, 2) == 'IT') ){
			return array(
						"IBAN" => $iban,
						"STATO" => substr($iban, 0, 2),
						"CHK" => substr($iban, 3, 2),
						"CIN" => substr($iban, 5, 1),
						"ABI" => substr($iban, 5, 5),
						"CAB" => substr($iban, 10, 5),
						"CONTO" => substr($iban, 15, 12)
					);
		}else{
			return array(
						"IBAN" => $iban,
						"STATO" => substr($iban, 0, 2),
						"CHK" => substr($iban, 3, 2)
					);
		}		
	}else{
		$output["messagedebug"] = $output["messagedebug"]  . "IBAN NOT VALID " . BRCRLF;
		return '';
	}
}

function IBANcheck($iban){
    $iban = strtolower(str_replace(' ','',$iban));
    $Countries = array('al'=>28,'ad'=>24,'at'=>20,'az'=>28,'bh'=>22,'be'=>16,'ba'=>20,'br'=>29,'bg'=>22,'cr'=>21,'hr'=>21,'cy'=>28,'cz'=>24,'dk'=>18,'do'=>28,'ee'=>20,'fo'=>18,'fi'=>18,'fr'=>27,'ge'=>22,'de'=>22,'gi'=>23,'gr'=>27,'gl'=>18,'gt'=>28,'hu'=>28,'is'=>26,'ie'=>22,'il'=>23,'it'=>27,'jo'=>30,'kz'=>20,'kw'=>30,'lv'=>21,'lb'=>28,'li'=>21,'lt'=>20,'lu'=>20,'mk'=>19,'mt'=>31,'mr'=>27,'mu'=>30,'mc'=>27,'md'=>24,'me'=>22,'nl'=>18,'no'=>15,'pk'=>24,'ps'=>29,'pl'=>28,'pt'=>25,'qa'=>29,'ro'=>24,'sm'=>27,'sa'=>24,'rs'=>22,'sk'=>24,'si'=>19,'es'=>24,'se'=>24,'ch'=>21,'tn'=>24,'tr'=>26,'ae'=>23,'gb'=>22,'vg'=>24);
    $Chars = array('a'=>10,'b'=>11,'c'=>12,'d'=>13,'e'=>14,'f'=>15,'g'=>16,'h'=>17,'i'=>18,'j'=>19,'k'=>20,'l'=>21,'m'=>22,'n'=>23,'o'=>24,'p'=>25,'q'=>26,'r'=>27,'s'=>28,'t'=>29,'u'=>30,'v'=>31,'w'=>32,'x'=>33,'y'=>34,'z'=>35);

    if(strlen($iban) == $Countries[substr($iban,0,2)]){
        $MovedChar = substr($iban, 4).substr($iban,0,4);
        $MovedCharArray = str_split($MovedChar);
        $NewString = "";
        foreach($MovedCharArray AS $key => $value){
            if(!is_numeric($MovedCharArray[$key])){
                $MovedCharArray[$key] = $Chars[$MovedCharArray[$key]];
            }
            $NewString .= $MovedCharArray[$key];
        }
        if(my_bcmod($NewString, '97') == 1)
        {
            return TRUE;
        }else{
            return FALSE;
        }
    }else{
        return false;
    }   
}
function my_bcmod( $x, $y ) 
{ 
    // how many numbers to take at once? carefull not to exceed (int) 
    $take = 5;     
    $mod = ''; 

    do 
    { 
        $a = (int)$mod.substr( $x, 0, $take ); 
        $x = substr( $x, $take ); 
        $mod = $a % $y;    
    } 
    while ( strlen($x) ); 

    return (int)$mod; 
} 

function BCA_changeRate($from = 'USD',$to = 'EUR', $amount  = 1 ){
    $data = file_get_contents("https://finance.google.com/finance/converter?a=$amount&from=$from&to=$to");
    preg_match("/<span class=bld>(.*)<\/span>/",$data, $converted);
    $converted = preg_replace("/[^0-9.]/", "", $converted[1][0]);
    return number_format(round($converted, 3),2);
}

/************************************************************************************/
/*                   		  	  FUNC IMPORT  CBI								*/
/************************************************************************************/
function CBI_ImportTXT($root = 'D:\\www\\cbiRAW\\') {
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	
	$message = 'finding TXT CBI'. BRCRLF;
	$ListFile = array_slice(scandir($root), 2);
	$file = 0;
	
	foreach($ListFile as $in => $val) {
		if (WFFileExt($val) == 'txt'){
			if ($conn->debug==1) {echo (BRCRLF . "FILE" . $val . BRCRLF);}
			$file = $file +1;
			$linee = 0;
			$handle = fopen($root . $val, "r");
			$message = $message . $val;
			if ($handle) {
				$AppoRecord = array();
				$AppoRecord['DESCRIZIONE'] = '';
				$AppoggioArray = array();
				$AppoggioArray['DESCRIZIONE'] = '';
				$AppoRecordRighe = array();
				$AppoRecord['FILE'] = $val;
				$oldRiga = "";
				$line = fgets($handle);
				$AppoRecord['TIPOFILE'] = trim(substr($line,1,2));
				
				//if ($AppoRecord['TIPOFILE'] == 'EC' ) goto salta;   //ESTRATTO CONTO
				if ($AppoRecord['TIPOFILE'] == 'RP' ) goto salta;	//RENDICONTAZIONI PORTAFOGLIO
				if ($AppoRecord['TIPOFILE'] == 'SL' ) goto salta;	//STRUTTURA LIBERA
				if ($AppoRecord['TIPOFILE'] == 'HR' ) goto salta;	//STRUTTURA LIBERA
				
				while (($line = fgets($handle)) !== false) {
					$TipoMessaggio = trim(substr($line,1,1));	
					
					if ($TipoMessaggio == '6'){
						
						// 610000001                  93003C/C ITALIA      10F0303266390010000006975EUR010218C000000015881,68IT93        
						$TipoRecord = substr($line,2,8);
						$Riga = trim(substr($line,10,3));
						$TipoInformazione = substr($line,13,3);
						if ($conn->debug==1) {var_dump($line); var_dump($TipoRecord); var_dump($oldRiga); var_dump($Riga); var_dump($TipoInformazione); echo(BRCRLF);}
						
						if ((!IsNullOrEmptyOrZeroString($oldRiga)) && ($oldRiga != $Riga)){
						//if (($oldRiga != $Riga)){
							for($i=0; $i < count($AppoRecordRighe); $i++)  {
								$AppoRecord['DATA'] = $AppoRecordRighe[$i]['DATA'];
								$AppoRecord['VALORE'] = $AppoRecordRighe[$i]['VALORE'];
								$AppoRecord['TIPO'] = $AppoRecordRighe[$i]['TIPO'];
								$AppoRecord['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . $AppoRecordRighe[$i]['DESCRIZIONE'];
								$AppoRecord['DESCRIZIONE'] = str_replace("'","\\'",$AppoRecord['DESCRIZIONE']);
								if ($conn->debug==1) {var_dump($AppoRecordRighe[$i]);}
								
								$sql = "SELECT * 
										FROM cg_flussibanca 
										WHERE DESCRIZIONE = '" . $AppoRecord['DESCRIZIONE'] . "'
											AND CONTO = '" . $AppoRecord['CONTO'] . "'
											AND DATA = " . WFSQLTODATE($AppoRecord['DATA']) . "
											AND VALORE = " . $AppoRecord['VALORE'];
								$RsCBI = $conn->Execute($sql);
								$RCount = $RsCBI->RecordCount();
								if($RCount == 1){ $sqlC = $conn->getUPDATESql($RsCBI,$AppoRecord);}
								elseif($RCount == 0){ $sqlC = $conn->getInsertSql($RsCBI,$AppoRecord);}
								else{$message = $message . 'ERRORE RecordPresenti:' . $RCount . ' ';}
								if ($conn->debug==1) {var_dump($sqlC);}
								if ($sqlC != '') { $conn->Execute($sqlC);}
								$linee = $linee +1;
							}
							$AppoRecord['NOME'] = "";
							$AppoRecord['INDIRIZZO'] = "";
							$AppoRecord['IBAN'] = "";
							$AppoRecord['PIVA'] =  "";
							$AppoRecord['VALORE'] = "";
							$AppoRecord['DATA'] = "";
							$AppoRecord['DESCRIZIONE'] = "";
							$AppoRecordRighe = array();
						}
						
						//messaggio di trasmissione movimento di contocorrente
						if ($TipoRecord == '10000001') { $AppoStr = str_replace(" ","0",substr($line,99,4)) . 
																	str_replace(" ","0",substr($line,51,23)); 
														$AppoRecord['CONTO'] =$AppoStr;
														goto dopo;}
						if ($TipoRecord == '20000001') { 
														$AppoggioArray = array();
														$AppoStr = substr($line,13,6); 
														$AppoggioArray['DATAVALUTA'] =  2000 + substr($AppoStr,4,2) . '-' . substr($AppoStr,2,2) . '-' . substr($AppoStr,0,2)   ;
														$AppoStr = substr($line,19,6); 
														$AppoggioArray['DATA'] =  2000 + substr($AppoStr,4,2) . '-' . substr($AppoStr,2,2) . '-' . substr($AppoStr,0,2)   ;
														$AppoStr = substr($line,27,14); 
														$AppoggioArray['VALORE'] = Cdec($AppoStr);
														$AppoggioArray['TIPO'] = trim(substr($line,41,2)); 
														$AppoggioArray['DESCRIZIONE'] = trim(substr($line,86,27)); 
														$AppoRecordRighe[] = $AppoggioArray;
														goto dopo;}
						if (($TipoRecord == '30000001') && ($TipoInformazione == 'YYY')) { 
														$AppoRecord['NOME'] = substr($line,40,27);  }
						if (($TipoRecord == '30000001') && ($TipoInformazione == 'YY2')) { 
														$AppoRecord['INDIRIZZO'] = trim(substr($line,16,24));
														$AppoRecord['IBAN'] = trim(substr($line,66,27)); 
														goto dopo;}
						if (($TipoRecord == '30000001') && ($TipoInformazione == 'ID1')) {  
														goto dopo;}
						if (($TipoRecord == '30000001') ) {  
														$AppoggioArray['DESCRIZIONE'] = trim(substr($line,13,90)); 
													}
						dopo:
						$oldRiga = $Riga;
					}
				
					if ($TipoMessaggio == '1'){
						// 100000002      050218280218330000000000674723+0303266390                                  24N92                       E
						$AppoStr = substr($line,22,6);    //DATA VALUTA
						//$AppoStr = substr($line,16,6); //DATA ORDINE
						$AppoRecord['DATA'] =  2000 + substr($AppoStr ,4,2) . '-' . substr($AppoStr ,2,2) . '-' . substr($AppoStr ,0,2)   ;						
						$AppoRecord['VALORE'] = substr($line,31,15); 
						$AppoRecord['VALORE'] = Cdec($AppoRecord['VALORE']);
						$AppoRecord['ABICAB'] = trim(substr($line ,47,5) . substr($line ,52,5));
						$AppoRecord['TIPO'] = 31;  //tipo er file
					}
					if ($TipoMessaggio == '3'){
						// 300000002L'INFORMATICA SAS DI    SACILOTTO CARLO & C     VIA ISOLABELLA 5 B      24060BAGNATICA                
						$AppoRecord['NOME'] = trim(substr($line,10,90)); 
					}
					if ($TipoMessaggio == '5'){
						// 500000002FT. 0    101-281217       -                                                               02020880171
						$AppoRecord['PIVA'] = trim(substr($line,100,16)); 
						$AppoRecord['DESCRIZIONE'] = trim(substr($line,10,90));
					}     
					if ($TipoMessaggio == '7'){
						$AppoRecord['VALORE'] = $AppoRecord['VALORE'] /100;
						$AppoRecord['VALORE'] = Cdec($AppoRecord['VALORE']);
						$sql = "SELECT * 
								FROM cg_flussibanca 
								WHERE DESCRIZIONE = '" . $AppoRecord['DESCRIZIONE'] . "'
									AND CONTO = '" . $AppoRecord['CONTO'] . "'
									AND DATA = " . WFSQLTODATE($AppoRecord['DATA']) . "
									AND VALORE = " . $AppoRecord['VALORE'];	
						//$sql = "SELECT * 
						//		FROM cg_flussibanca 
						//		WHERE FILE = '" . $AppoRecord['FILE'] . "'
						//				AND DESCRIZIONE = '" .  str_replace("'","\\'",$AppoRecord['DESCRIZIONE']) . "'";
						
						$RsCBI = $conn->Execute($sql);		
						$RCount = $RsCBI->RecordCount();
						if($RCount == 1){ $sqlC = $conn->getUPDATESql($RsCBI,$AppoRecord);}
						elseif($RCount == 0){ $sqlC = $conn->getInsertSql($RsCBI,$AppoRecord);}
						else{echo('ERRORE');};
						if ($conn->debug==1) {var_dump($sqlC);}
						if ($sqlC != '') { $conn->Execute($sqlC); }
						$AppoRecord['NOME'] = "";
						$AppoRecord['INDIRIZZO'] = "";
						$AppoRecord['IBAN'] = "";
						$AppoRecord['PIVA'] =  "";
						$AppoRecord['VALORE'] = "";
						$AppoRecord['DATA'] = "";
						$AppoRecord['DESCRIZIONE'] = "";
					}   
				}
				salta:
				fclose($handle);
				rename($root . $val, $root . "old/" . $val);
				$message = $message . "(" . $linee . ")" . BRCRLF;
				//if ($file > 100 ) break;
			} else {
				// error opening the file.
			} 
		}
	}
	return $message;
}

function CBI_ImportCSV($root = 'D:\\www\\cbiRAW\\') {
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	$message = 'finding CSV CBI'. BRCRLF;
	$ListFile = array_slice(scandir($root), 2);
	$file = 0;
	$aggiornati = 0;
	$inseriti = 0;

	foreach($ListFile as $in => $val) {
		if (WFFileExt($val) == 'csv'){
			if ($conn->debug==1) {echo (BRCRLF . "FILE" . $val . BRCRLF);}
			$file = $file +1;
			$handle = fopen($root . $val, "r");
			$message = $message . $val;
			if ($handle) {
				$AppoRecord = array();
				$AppoggioArray = array();
				$AppoRecordRighe = array();
				$AppoRecord['FILE'] = $val;
				$linee = 0;
				
				$line = fgets($handle);
				while (($line = fgets($handle)) !== false) {
					//ContoIBAN;DataOp;DataValuta;Desc;AvereAccrediti;DAREAddebiti;Causale
					$AppoRecordRighe = CSV2Array($line, ";");
					//if (IsNumeric($AppoRecordRighe[4])) {
						
						$AppoRecord['CONTO'] = $AppoRecordRighe[0];
						$AppoRecord['DATA'] = WFSTRTODATE($AppoRecordRighe[1]);
						$AppoRecord['VALORE'] = Cdec($AppoRecordRighe[4]);
						if ($AppoRecord['VALORE'] == 0) $AppoRecord['VALORE'] = Cdec($AppoRecordRighe[5]);
						$AppoRecord['DESCRIZIONE'] = left(str_replace("'","\\'",$AppoRecordRighe[3]),255);
						$AppoRecord['TIPO'] = $AppoRecordRighe[6];
						$AppoRecord['NOME'] = null;
						$AppoRecord['INDIRIZZO'] = null;
						$AppoRecord['IBAN'] = null;
						$AppoRecord['PIVA'] = null;
						
						
						if ($conn->debug==1) {var_dump($AppoRecord);}
						
						$sql = "SELECT * 
								FROM cg_flussibanca 
								WHERE FILE = '" . $AppoRecord['FILE'] . "'
										AND DESCRIZIONE = '" . $AppoRecord['DESCRIZIONE'] . "'
										AND CONTO = '" . $AppoRecord['CONTO'] . "'
										AND DATA = " . WFSQLTODATE($AppoRecord['DATA']) . "
										AND VALORE = " . $AppoRecord['VALORE'];
						$RsCBI = $conn->Execute($sql);
						$RCount = $RsCBI->RecordCount();
						if($RCount == 1){ $aggiornati++; $sqlC = $conn->getUPDATESql($RsCBI,$AppoRecord);}
						elseif($RCount == 0){ $inseriti++; $sqlC = $conn->getInsertSql($RsCBI,$AppoRecord);}
						else{$message = $message . 'ERRORE ' . $sql . BRCRLF ;};
						if ($conn->debug==1) {var_dump($sqlC);}
						if ($sqlC != '') { $conn->Execute($sqlC); $linee = $linee +1;}
					}
				// }
				fclose($handle);
				rename($root . $val, $root . "old/" . $val);
				$message = $message . $val . "(" . $linee . ") agg" . $aggiornati . " ins" . $inseriti. BRCRLF;
			} else {
				// error opening the file.
				$message = $message . "error opening the file". BRCRLF;
			} 
		}
	}
	return $message;
}


function CBI_CollegaFlussi(){
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	
	//AVVISI
	$sql = "UPDATE IGNORE cg_flussibanca 
			SET cg_flussibanca.TIPO = 'AV', CG_CT_FLUSSITIPO = NULL
			WHERE cg_flussibanca.TIPOFILE = 'AV' AND cg_flussibanca.TIPO <> 'AV'";
	$conn->Execute($sql);
	
	//collega tipologia flussi
	$sql = "UPDATE IGNORE cg_flussibanca
			SET cg_flussibanca.TIPO = REPLACE(cg_flussibanca.TIPO,'\r','');";
	$conn->Execute($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca
			SET cg_flussibanca.TIPO = REPLACE(cg_flussibanca.TIPO,'\n','');";
	$conn->Execute($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca
			SET cg_flussibanca.TIPO = trim(cg_flussibanca.TIPO);";
	$conn->Execute($sql);

	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN cg_flussitipo on cg_flussitipo.sigla = cg_flussibanca.TIPO 
			SET CG_CT_FLUSSITIPO = cg_flussitipo.id
			WHERE  CG_CT_FLUSSITIPO is null";
	$conn->Execute($sql);

	//collega anagrafica
	
	//IBAN
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on anagrafiche.IBAN = cg_flussibanca.IBAN
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE LENGTH(cg_flussibanca.IBAN) = 27 
				AND LENGTH(anagrafiche.IBAN) = 27 
				AND cg_flussibanca.CT_ANAGRAFICHE is null
				AND anagrafiche.CT_ANAGRAFICATIPO = 1";
	$conn->Execute($sql);
	
	//PIVA CF
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on anagrafiche.PIVA = cg_flussibanca.PIVA
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE 
				LENGTH(cg_flussibanca.PIVA) > 10 AND LENGTH(anagrafiche.PIVA) > 10
				AND cg_flussibanca.CT_ANAGRAFICHE is null 
				AND anagrafiche.CT_ANAGRAFICATIPO = 1";
	$conn->Execute($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on anagrafiche.CF = cg_flussibanca.PIVA
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE LENGTH(cg_flussibanca.PIVA) > 10 
				AND LENGTH(anagrafiche.CF) > 10 
				AND cg_flussibanca.CT_ANAGRAFICHE is null
				AND anagrafiche.CT_ANAGRAFICATIPO = 1";
	$conn->Execute($sql);
	
	//BANCACBI
	$sql = "UPDATE  anagrafiche 
				INNER JOIN cg_flussibanca on cg_flussibanca.CT_ANAGRAFICHE = anagrafiche.ID 
			SET BANCACBI = cg_flussibanca.NOME
			WHERE cg_flussibanca.NOME is not null
				AND anagrafiche.CT_ANAGRAFICATIPO = 1
				AND anagrafiche.BANCACBI is null;";
	$conn->Execute($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on REPLACE(cg_flussibanca.NOME, '.', '')  LIKE CONCAT(REPLACE(anagrafiche.BANCACBI, '.', ''))
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null
				AND anagrafiche.CT_ANAGRAFICATIPO = 1
				AND length(anagrafiche.BANCACBI) > 3 
				AND anagrafiche.BANCACBI is not null ";
	$conn->Execute($sql);
	
	
	
	//DESCRIZIONE
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on REPLACE(cg_flussibanca.NOME, '.', '')  LIKE CONCAT('', REPLACE(anagrafiche.DESCRIZIONE, '.', '') , ' %')
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null 
				AND anagrafiche.CT_ANAGRAFICATIPO = 1";
	$conn->Execute($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on  REPLACE(anagrafiche.DESCRIZIONE, '.', '')  LIKE CONCAT('', REPLACE(cg_flussibanca.NOME, '.', '') , ' %')
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null 
				AND anagrafiche.CT_ANAGRAFICATIPO = 1
				AND cg_flussibanca.NOME is not null AND length(cg_flussibanca.NOME) > 3 ";
	$conn->Execute($sql);
			
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on REPLACE(cg_flussibanca.DESCRIZIONE, '.', '')  LIKE CONCAT('', REPLACE(anagrafiche.DESCRIZIONE, '.', '') , ' %')
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null
				AND anagrafiche.CT_ANAGRAFICATIPO = 1 ";
	$conn->Execute($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on  REPLACE(anagrafiche.DESCRIZIONE, '.', '')  LIKE CONCAT('% ', REPLACE(cg_flussibanca.NOME, '.', '') , ' %')
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null 
				AND anagrafiche.CT_ANAGRAFICATIPO = 1
				AND cg_flussibanca.NOME is not null AND length(cg_flussibanca.NOME) > 3 ";
	$conn->Execute($sql);
			
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on REPLACE(cg_flussibanca.DESCRIZIONE, '.', '')  LIKE CONCAT('% ', REPLACE(anagrafiche.DESCRIZIONE, '.', '') , ' %')
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null 
				AND anagrafiche.CT_ANAGRAFICATIPO = 1";
	$conn->Execute($sql);
	
	
	
	//collega anagrafica SPESE (uso il PARENT banca->conto nel conto non ce anagrafica e nel conto padre )
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN cg_flussitipo ON cg_flussitipo.ID = cg_flussibanca.CG_CT_FLUSSITIPO
				INNER JOIN cg_pianoconti ON cg_pianoconti.ID = cg_flussibanca.CG_CT_PIANOCONTI
				INNER JOIN cg_pianoconti AS pianocontiparent ON pianocontiparent.ID = cg_pianoconti.ID_PARENT
			SET cg_flussibanca.CT_ANAGRAFICHE = pianocontiparent.CT_ANAGRAFICHE 
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null 
				AND pianocontiparent.CT_ANAGRAFICHE IS NOT NULL 
				AND cg_flussitipo.CT_PAGAMENTITIPO = 7";
	$conn->Execute($sql);
	
	//collega anagrafica ACCREDITO RIBA (uso il PARENT banca->conto nel conto non ce anagrafica e nel conto padre )
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN cg_flussitipo ON cg_flussitipo.ID = cg_flussibanca.CG_CT_FLUSSITIPO
				INNER JOIN cg_pianoconti ON cg_pianoconti.ID = cg_flussibanca.CG_CT_PIANOCONTI
				INNER JOIN cg_pianoconti AS pianocontiparent ON pianocontiparent.ID = cg_pianoconti.ID_PARENT
			SET cg_flussibanca.CT_ANAGRAFICHE = pianocontiparent.CT_ANAGRAFICHE 
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null 
				AND pianocontiparent.CT_ANAGRAFICHE IS NOT NULL 
				AND cg_flussitipo.ID = 39";
	$conn->Execute($sql);
	
	//collega anagrafica INSOLUTI
	$sql = "UPDATE IGNORE cg_flussibanca 
				INNER JOIN cg_contabilescadenzario ON cg_flussibanca.VALORE = cg_contabilescadenzario.VALORE
				INNER JOIN cg_contabile ON cg_contabilescadenzario.CG_CT_CONTABILE = cg_contabile.ID 
				INNER JOIN pagamentitipo ON cg_contabilescadenzario.CT_PAGAMENTITIPO = pagamentitipo.ID 
			SET cg_flussibanca.CT_ANAGRAFICHE = cg_contabile.CT_ANAGRAFICHE
			WHERE  (cg_flussibanca.CT_ANAGRAFICHE Is Null) 
				AND (pagamentitipo.GENERAEFFETTI = 1) 
				AND (cg_contabilescadenzario.CHIUSA = 0) ";
	$conn->Execute($sql);
	
	//collega ABICAB A CONTO
	$sql = "UPDATE IGNORE cg_flussibanca 
			INNER JOIN cg_pianoconti ON cg_pianoconti.IBAN LIKE concat('%',cg_flussibanca.ABICAB,'%')
				SET cg_flussibanca.CONTO = cg_pianoconti.IBAN
			WHERE cg_flussibanca.CONTO IS NULL AND cg_pianoconti.IBAN IS NOT NULL";
	$conn->Execute($sql);

	//collega PIANOCONTI A CONTO
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN cg_pianoconti ON cg_pianoconti.IBAN = cg_flussibanca.CONTO
			SET CG_CT_PIANOCONTI = cg_pianoconti.ID";
	$conn->Execute($sql);
	
	//escludi
	
	//escludi AVVISI di cui sono presenti le RIBA
	$sql = "UPDATE IGNORE cg_flussibanca 
			   INNER JOIN (
					 SELECT AVVISI.ID 
					 FROM (
						   SELECT cg_flussibanca.* 
						   FROM  cg_flussibanca 
						   WHERE cg_flussibanca.TIPO = 'AV' 
					  ) AS AVVISI 
					 INNER JOIN (
						   SELECT cg_flussibanca.* 
						   FROM   cg_flussibanca 
						   WHERE  cg_flussibanca.TIPO = '31' 
					  ) AS RIBA 
					  ON AVVISI.CONTO = RIBA.CONTO 
						   AND AVVISI.CT_ANAGRAFICHE = RIBA.CT_ANAGRAFICHE 
						   AND AVVISI.VALORE = RIBA.VALORE 
				  ) AS DOPPI 
				  ON DOPPI.ID = cg_flussibanca.ID
			SET ESCLUDI = 1 ";
	$conn->Execute($sql);

	//escludi pagamenti già registrati CT_ANAGRAFICHE DOCDATA VALORE
	$sql = "UPDATE IGNORE cg_flussibanca 
				INNER JOIN (
					SELECT FLUSSIAPERTI.ID
					FROM (
						SELECT cg_flussibanca.* 
						FROM  cg_flussibanca 
						WHERE cg_flussibanca.ESCLUDI = 0
					) AS FLUSSIAPERTI
					INNER JOIN (
						SELECT cg_contabile.* 
						FROM   cg_contabile
						WHERE  cg_contabile.CG_CT_CONTABILEMODELLI in(11,28)
					) AS CONTABILIPAGAMENTI
					ON FLUSSIAPERTI.CT_ANAGRAFICHE = CONTABILIPAGAMENTI.CT_ANAGRAFICHE 
						AND ABS(DATEDIFF(FLUSSIAPERTI.DATA,CONTABILIPAGAMENTI.DOCDATA)) < 3
						AND ABS(FLUSSIAPERTI.VALORE - CONTABILIPAGAMENTI.VALORE) < 1
				) AS DOPPI ON DOPPI.ID = cg_flussibanca.ID
			SET ESCLUDI = 1 ";
	$conn->Execute($sql);
	
	//collega CG esclusa
	$sql = "INSERT INTO cg_flussibancacontabile  (`CG_CT_FLUSSIBANCA`, `CG_CT_CONTABILE`)
				SELECT cg_flussibanca.ID, cg_contabile.ID
				FROM cg_flussibanca
					INNER JOIN cg_contabile on cg_contabile.CT_ANAGRAFICHE = cg_flussibanca.CT_ANAGRAFICHE
							AND cg_contabile.VALORE = cg_flussibanca.VALORE
					LEFT JOIN cg_flussibancacontabile  ON cg_flussibancacontabile.CG_CT_FLUSSIBANCA = cg_flussibanca.ID
				WHERE 1= 1
					 -- AND (cg_flussibanca.TIPO = 'OCRET' OR cg_flussibanca.TIPO = 'E' OR cg_flussibanca.TIPO = 'DIFTT' OR cg_flussibanca.TIPO = 'ERRIB') 
					AND cg_flussibancacontabile.ID is null";
	//$conn->Execute($sql);
	
}


/************************************************************************************/
/*                   		  	  FUNC IMPORT  XML								*/
/************************************************************************************/
function CBI_ImportXML($root = 'D:\\www\\cbiRAW\\') {
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	$message = 'finding XML CBI'. BRCRLF;
	$ListFile = array_slice(scandir($root), 2);
	$file = 0;
	foreach($ListFile as $in => $val) {
		if (WFFileExt($val) == 'xml'){
			if ($conn->debug==1) {echo (BRCRLF . "FILE: " . $val . BRCRLF);}
			$file = $file +1;
			$AppoRecord = array();
			$AppoRecord['FILE'] = $val;
			$xml = simplexml_load_file($root . $val);
			$xml = $xml->children('bdy', true)->CBIEnvelDbtrPmtStatusReport;
			if ($xml == null){ goto continua;}
			$xml = $xml->children('bdy', true)->CBIDbtrPmtStatusReport;
			if ($xml == null){ goto continua;}
			$xml = $xml->children()->OrgnlPmtInfAndSts;
			if ($xml == null){ goto continua;}
			$tratte = $xml->children()->TxInfAndSts;
			if ($xml == null){ goto continua;}
			
			//simplexml_dump($tratte);
			foreach ($tratte as $tratta){
				if ($conn->debug==1) {simplexml_dump($tratta);}
				if($tratta->OrgnlTxRef->PmtMtd->__toString() == 'TRF'){
					//id22 sigla26 bonifico attivo
					$AppoRecord['CG_CT_FLUSSITIPO'] = 40;
					$AppoRecord['TIPO'] = 48;
				}elseif($tratta->OrgnlTxRef->PmtMtd->__toString() == 'TRA'){
					//id40 sigla48 bonifico passivo
					$AppoRecord['CG_CT_FLUSSITIPO'] = 22;
					$AppoRecord['TIPO'] = 26;
				}
				$AppoRecord['TIPOFILE'] = 'XML';
				
				//valori a data
				$AppoRecord['VALORE'] = Cdec($tratta->OrgnlTxRef->Amt->__toString());
				$AppoRecord['DATA'] = $tratta->OrdValDt->__toString();
				$AppoRecord['DESCRIZIONE'] = $tratta->OrgnlTxRef->RmtInf->Ustrd->__toString();
				
				//mittente TRATTA
				$AppoRecord['CONTO'] = $tratta->OrgnlTxRef->DbtrAcct->Id->IBAN->__toString();				
				
				//DEstinatario TRATTA
				$AppoRecord['NOME'] = $tratta->OrgnlTxRef->Cdtr->Nm->__toString();
				if (property_exists($tratta->OrgnlTxRef->Cdtr,'PstlAdr')){
					$AppoRecord['INDIRIZZO'] = $tratta->OrgnlTxRef->Cdtr->PstlAdr->StrtNm->__toString() . " " . 
												$tratta->OrgnlTxRef->Cdtr->PstlAdr->PstCd->__toString() . " " . 
												$tratta->OrgnlTxRef->Cdtr->PstlAdr->TwnNm->__toString() . " " . 
												$tratta->OrgnlTxRef->Cdtr->PstlAdr->CtrySubDvsn->__toString() . " " . 
												$tratta->OrgnlTxRef->Cdtr->PstlAdr->Ctry->__toString() ;	
				}
				if (property_exists($tratta->OrgnlTxRef->Cdtr,'Id')){
					if (property_exists($tratta->OrgnlTxRef->Cdtr->Id,'OrgId')){
						$AppoRecord['PIVA'] =  $tratta->OrgnlTxRef->Cdtr->Id->OrgId->Othr->Id->__toString();
					}elseif (property_exists($tratta->OrgnlTxRef->Cdtr,'Id')){
						$AppoRecord['PIVA'] =  $tratta->OrgnlTxRef->Cdtr->Id->PrvtId->Othr->Id->__toString();
					}
					
				}
				
				//SCRIVI
				$sql = "SELECT * 
						FROM cg_flussibanca 
						WHERE FILE = '" . $AppoRecord['FILE'] . "'
								AND DESCRIZIONE = '" . str_replace("'","\\'",$AppoRecord['DESCRIZIONE']) . "'
								AND NOME = '" . str_replace("'","\\'",$AppoRecord['NOME']) . "'";
				$RsCBI = $conn->Execute($sql);
				$RCount = $RsCBI->RecordCount();
				if($RCount == 1){ $sqlC = $conn->getUPDATESql($RsCBI,$AppoRecord);}
				elseif($RCount == 0){ $sqlC = $conn->getInsertSql($RsCBI,$AppoRecord);}
				else{echo('ERRORE');};
				if ($conn->debug==1) {var_dump($sqlC);}
				if ($sqlC != '') { $conn->Execute($sqlC); }
			}
			continua:
			rename($root . $val, $root . "old/" . $val);
		}
	}
	return $message;
}


/************************************************************************************/
/*                   		  	  FUNC EXPORT  CBI RIBA							*/
/************************************************************************************/
/*
 Questa classe genera il file RiBa standard ABI-CBI passando alla funzione "creaFile" i due array di seguito specificati:
$intestazione = array monodimensionale con i seguenti index:
              [0] = abi_assuntrice variabile lunghezza 5 numerico
              [1] = cab_assuntrice variabile lunghezza 5 numerico
              [2] = conto variabile lunghezza 12 alfanumerico
              [3] = data_creazione variabile lunghezza 6 numerico formato GGMAA
              [4] = nome_supporto variabile lunghezza 20 alfanumerico
              [5] = codice_divisa variabile lunghezza 1 alfanumerico opzionale default "E"
              [6] = ragione_soc1_creditore variabile lunghezza 24 alfanumerico
              [7] = ragione_soc2_creditore variabile lunghezza 24 alfanumerico
              [8] = indirizzo_creditore variabile lunghezza 24 alfanumerico
              [9] = cap_citta_prov_creditore variabile lunghezza 24 alfanumerico
              [10] = codice_fiscale_creditore variabile lunghezza 16 alfanumerico opzionale default ""
$ricevute_bancarie = array bidimensionale con i seguenti index:
                   [0] = numero ricevuta lunghezza 10 numerico
                   [1] = scadenza lunghezza 6 numerico
                   [2] = importo in centesimi di euro lunghezza 13 numerico
                   [3] = nome debitore lunghezza 60 alfanumerico
                   [4] = codice fiscale/partita iva debitore lunghezza 16 alfanumerico
                   [5] = indirizzo debitore lunghezza 30 alfanumerico
                   [6] = cap debitore lunghezza 5 numerico
                   [7] = comune provincia debitore lunghezza 25 alfanumerico
                   [8] = abi banca domiciliataria lunghezza 5 numerico
                   [9] = cab banca domiciliataria lunghezza 5 numerico
                   [10] = descrizione banca domiciliataria lunghezza 50 alfanumerico
                   [11] = codice cliente attribuito dal creditore lunghezza 16 numerico
                   [12] = descrizione del debito lunghezza 40 alfanumerico
*/
class RibaAbiCbi {
	var $progressivo = 0;
	var $assuntrice;
	var $code_sia = '';
	var $data;
	var $valuta;
	var $supporto;
	var $totale;
	var $creditore;
	function RecordIB() { 
	  return " IB" .  $this->code_sia . $this->abi_assuntrice . $this->data . str_pad($this->supporto,4,' ',STR_PAD_LEFT) . str_repeat(" ",69) . str_repeat(" ",21) . $this->valuta;
	}
	function Record14($scadenza, $importo, $abi_domiciliataria, $cab_domiciliataria, $codice_cliente){
	  $this->totale += $importo;
	  $scadenzaSTR = WFVALUEDATELOCAL($scadenza,'dmy');
	  
	  return " 14" . str_pad($this->progressivo,7,'0',STR_PAD_LEFT). $this->data . str_repeat(" ",6) . 
					$scadenzaSTR . "300" . str_pad($importo,15,'0',STR_PAD_LEFT) .
					"-" . 
					$this->abi_assuntrice . $this->cab_assuntrice . $this->conto . 
					$abi_domiciliataria. $cab_domiciliataria . str_repeat(" ",12) . 
					$this->code_sia. 
					"4" . str_pad($codice_cliente,16) . str_repeat(" ",6) . $this->valuta;
	}
	function Record20() {
	  return " 20" . str_pad($this->progressivo,7,'0',STR_PAD_LEFT) . 
					$this->creditore . 
					$this->creditore_indirizzo . $this->creditore_citta . $this->creditore_cap . $this->creditore_provincia . 
					$this->creditore_codice_fiscale;
	}
	function Record30($nome_debitore,$codice_fiscale_debitore) {
	  return " 30". str_pad($this->progressivo,7,'0',STR_PAD_LEFT) . 
					substr(str_pad($nome_debitore,60),0,60) . 
					str_pad($codice_fiscale_debitore,16,' ') . 
					str_repeat(" ",34);
					str_repeat(" ",27);
	}
	function Record40($indirizzo_debitore,$cap_debitore,$comune_debitore,$provincia_debitore=""){
	  return " 40". str_pad($this->progressivo,7,'0',STR_PAD_LEFT).
					substr(str_pad($indirizzo_debitore,30),0,30) . str_pad(intval($cap_debitore),5,'0',STR_PAD_LEFT) . 
					substr(str_pad($comune_debitore,23),0,23) . substr(str_pad($provincia_debitore,52,' ',STR_PAD_RIGHT),0,52);
	}
	function Record50($fattnum, $descrizione_debito,$codice_fiscale_creditore) {
	  return " 50". str_pad($this->progressivo,7,'0',STR_PAD_LEFT).
					substr(str_pad($fattnum,40),0,40).
					substr(str_pad($descrizione_debito,40),0,40).
					str_repeat(" ",10).
					str_pad($codice_fiscale_creditore,16,' ').
					str_repeat(" ",4);
	}
	function Record51($numero_ricevuta_creditore){
	  return " 51". str_pad($this->progressivo,7,'0',STR_PAD_LEFT).
					str_pad($numero_ricevuta_creditore,10,'0',STR_PAD_LEFT) .
					$this->creditore .
					str_repeat(" ",11) .
					"0000000000000000" .
					str_repeat(" ",45);
																 
	}
	function Record70() {
	  return " 70". str_pad($this->progressivo,7,'0',STR_PAD_LEFT) .
					str_repeat(" ",90) .
					'000' .
					str_repeat(" ",17);
	}
	function RecordEF() {
	  //record di coda
	  return " EF" .  $this->code_sia . $this->abi_assuntrice . $this->data . str_pad($this->supporto,4,' ',STR_PAD_LEFT) . 
	  str_repeat(" ",21) .
	  str_pad($this->progressivo,8,'0',STR_PAD_LEFT) . 
	  str_pad($this->totale,15,'0',STR_PAD_LEFT) .
	  str_repeat("0",15) . 
	  str_pad($this->progressivo * 7 + 2,7,'0',STR_PAD_LEFT).str_repeat(" ",24) . 
	  $this->valuta.str_repeat(" ",6);
	}
	function creaFile($intestazione,$ricevute_bancarie) {
	  
	  //definizione emittente
	  $this->code_sia = str_pad($intestazione['code_sia'],5,' ',STR_PAD_LEFT);
	  $this->abi_assuntrice = str_pad($intestazione['abi_assuntrice'],5,'0',STR_PAD_LEFT);
	  $this->data = str_pad($intestazione['data_creazione'],6,'0');
	  $this->valuta = substr($intestazione['codice_divisa'],0,1);
	  $this->supporto = substr(str_pad($intestazione['nome_supporto'],4,' ',STR_PAD_LEFT),0,4);
	  $this->creditore = substr(str_pad($intestazione['ragione_soc'],24,' ',STR_PAD_RIGHT),0,24);
	  
	  $this->creditore_indirizzo = substr(str_pad($intestazione['indirizzo'],24,' ',STR_PAD_RIGHT),0,24);
	  $this->creditore_cap = substr(str_pad($intestazione['cap'],6,' ',STR_PAD_RIGHT),0,6);
	  $this->creditore_citta = substr(str_pad($intestazione['citta'],18,' ',STR_PAD_RIGHT),0,18);
	  $this->creditore_provincia = substr(str_pad($intestazione['provincia'],13,' ',STR_PAD_RIGHT),0,13);

	  $this->creditore_codice_fiscale = substr(str_pad($intestazione['codice_fiscale'],25,' ',STR_PAD_RIGHT),0,25);
	  
	  $this->abi_assuntrice = $intestazione['abi_assuntrice'];
	  $this->cab_assuntrice = $intestazione['cab_assuntrice'];
	  $this->conto = $intestazione['conto'];
	  
	  if ( IsNullOrEmptyOrZeroString($intestazione['abi_assuntrice']) || IsNullOrEmptyOrZeroString($intestazione['cab_assuntrice']) ){
		global $output;
		$output["messagedebug"] = $output["messagedebug"]  . "Manca abi_domiciliataria o cab_domiciliataria" . BRCRLF;
		return '';
	  }
	  
	  
	  $accumulatore = $this->RecordIB(). CRLF;
	  foreach ($ricevute_bancarie as $value) { //estraggo le ricevute dall'array
		  $this->progressivo ++;
		  if ( IsNullOrEmptyOrZeroString($value['abi_domiciliataria']) || IsNullOrEmptyOrZeroString($value['cab_domiciliataria']) ){
			global $output;
			$output["message"] = $output["message"] . "Manca abi_domiciliataria o cab_domiciliataria" . BRCRLF;
			$output["messagedebug"] = $output["messagedebug"]  . "Manca abi_domiciliataria o cab_domiciliataria" . BRCRLF;
			return;
		  }
		  $accumulatore .= $this->Record14($value['scadenza'],$value['importo'], $value['abi_domiciliataria'],$value['cab_domiciliataria'],$value['codice_cliente']). CRLF;
		  $accumulatore .= $this->Record20(). CRLF;
		  $accumulatore .= $this->Record30($value['nome_debitore'],$value['codice_fiscale_debitore']). CRLF;
		  $accumulatore .= $this->Record40($value['indirizzo_debitore'],$value['cap_debitore'],$value['comune_debitore'],$value['provincia_debitore']) . CRLF;
		  $accumulatore .= $this->Record50($value['fatturanum'], $value['descrizione_debito'],$intestazione['codice_fiscale']) . CRLF;
		  $accumulatore .= $this->Record51($value['numero_ricevuta_creditore']) . CRLF; 
		  $accumulatore .= $this->Record70(). CRLF;
	  }
	  $accumulatore .= $this->RecordEF();
	  return $accumulatore;
	}
}


class RibaAbiXML {
	var $progressivo = 0;
	var $assuntrice;
	var $code_sia = '';
	var $data;
	var $valuta;
	var $supporto;
	var $totale;
	var $creditore;
	
	function creaFile($intestazione,$ricevute_bancarie) {
		$writer = new XMLWriter();  
		$writer->openMemory();
		$writer->startDocument('1.0','UTF-8');  
		$writer->setIndent(4); 

		/* START ALL*/
		
		$writer->startElement('CBISDDReqLogMsg');
			$writer->writeAttribute('xmlns', 'urn:CBI:xsd:CBISDDReqLogMsg.00.01.00');
			$writer->writeAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
			$writer->writeAttribute('xsi:schemaLocation', 'urn:CBI:xsd:CBISDDReqLogMsg.00.01.00 CBISDDReqLogMsg.00.01.00.xsd');
		
					
					/*
		$writer->startElement('CBISDDReqLogMsg');
		$writer->writeAttributeNs('xsi', 'schemaLocation', null, 'urn:CBI:xsd:CBISDDReqLogMsg.00.01.00 CBISDDReqLogMsg.00.01.00.xsd'); 

		$writer->writeAttributeNs('xmlns', 'xsi', 'urn:CBI:xsd:CBISDDReqLogMsg.00.01.00', 'http://www.w3.org/2001/XMLSchema-instance'); 
		*/
			/***********************************************************************************/
			/* 1 GrpHdr */ {
			$writer->startElement('GrpHdr');
				$writer->writeElement('MsgId',3042);
				$writer->writeElement('CreDtTm',date('Y-m-d\TH:i:s'));
				$writer->writeElement('NbOfTxs',$intestazione['totale_record']);
				$writer->writeElement('CtrlSum',$intestazione['totale_valore']/100);
				$writer->startElement('InitgPty');
					$writer->writeElement('Nm',$intestazione['ragione_soc']);
					$writer->startElement('Id');
						$writer->startElement('OrgId');
							$writer->startElement('Othr');
								$writer->writeElement('Id','0955369K');
								$writer->writeElement('Issr','CBI');
							$writer->endElement(); 
							$writer->startElement('Othr');
								$writer->writeElement('Id',$intestazione['codice_fiscale']);
								$writer->writeElement('Issr','ADE');
							$writer->endElement(); 
						$writer->endElement(); 
					$writer->endElement(); 
				$writer->endElement(); 
			$writer->endElement(); 
			}
			
			/***********************************************************************************/
			/* 2 PmtInf */ {
			$writer->startElement('PmtInf');
					
				$writer->writeElement('PmtInfId','1');
				$writer->writeElement('PmtMtd','DD');
				
				/* PmtTpInf */{
				$writer->startElement('PmtTpInf');
					$writer->startElement('SvcLvl');
						$writer->writeElement('Cd','SEPA');
					$writer->endElement();
					$writer->startElement('LclInstrm');
						$writer->writeElement('Cd','CORE');
					$writer->endElement();
					$writer->writeElement('SeqTp','FRST');
				$writer->endElement(); 
				}
				
				$writer->writeElement('ReqdColltnDt',WFVALUEDATELOCAL($value['scadenza'],'Y-m-d'));
				
				/* Cdtr */ {
				$writer->startElement('Cdtr');
					$writer->writeElement('Nm',$intestazione['ragione_soc']);
					$writer->startElement('PstlAdr');
						$writer->writeElement('AdrLine',$intestazione['indirizzo']);
						$writer->writeElement('AdrLine',$intestazione['cap'] . ' ' .$intestazione['citta'] . ' ' .$intestazione['provincia']);
					$writer->endElement();
					$writer->startElement('Id');
						$writer->startElement('OrgId');
							$writer->startElement('Othr');
								$writer->writeElement('Id','0955369K');
								$writer->writeElement('Issr','CBI');
							$writer->endElement();
						$writer->endElement();
					$writer->endElement();
				$writer->endElement();
				}
				
				/* CdtrAcct */ {
				$writer->startElement('CdtrAcct');
					$writer->startElement('Id');
						$writer->writeElement('IBAN',$intestazione['iban']);
					$writer->endElement();
				$writer->endElement();
				}
				
				/* CdtrAgt */ {
				$writer->startElement('CdtrAgt');
					$writer->startElement('FinInstnId');
						$writer->startElement('ClrSysMmbId');
							$writer->writeElement('MmbId','02008');
						$writer->endElement();
					$writer->endElement();
				$writer->endElement();
				}
				
				/* CdtrSchmeId */ {
				$writer->startElement('CdtrSchmeId');
					$writer->writeElement('Nm',$intestazione['ragione_soc']);
					$writer->startElement('Id');
						$writer->startElement('PrvtId');
							$writer->startElement('Othr');
								$writer->writeElement('Id',$intestazione['cid']);
								$writer->startElement('SchmeNm');
									$writer->writeElement('Prtry','SEPA');
								$writer->endElement();
							$writer->endElement();
						$writer->endElement();
					$writer->endElement();
				$writer->endElement();
				}
				
				/* DrctDbtTxInf */ 
				foreach ($ricevute_bancarie as $value) {
					$i = $i +1;
				$writer->startElement('DrctDbtTxInf');
					$writer->startElement('PmtId');
						$writer->writeElement('InstrId',$value['id']);
						$writer->writeElement('EndToEndId',$intestazione['nome_supporto'] . '-' . $value['scadenzaid']);
					$writer->endElement();
					$writer->startElement('InstdAmt');
						$writer->writeAttribute('Ccy', 'EUR');
						$writer->text($value['importo'] / 100);
					$writer->endElement();
					$writer->startElement('DrctDbtTx');
						$writer->startElement('MndtRltdInf');
							$writer->writeElement('MndtId',"Scadenza:" . $value['scadenzaid']);
							if (!IsNullOrEmptyOrZeroString($value['data_firma'])){
								$writer->writeElement('DtOfSgntr',WFVALUEDATELOCAL($value['data_firma'],'Y-m-d'));
							}
						$writer->endElement();
					$writer->endElement();
					$writer->startElement('Dbtr');
						$writer->writeElement('Nm',$value['nome_debitore']);
						$writer->startElement('PstlAdr');
							$writer->writeElement('AdrLine',$value['indirizzo_debitore']);
							$writer->writeElement('AdrLine',$value['cap_debitore'] . ' ' .$value['comune_debitore'] . ' ' . $value['provincia_debitore']);
						$writer->endElement();
						$writer->startElement('Id');
							$writer->startElement('PrvtId');
								$writer->startElement('Othr');
									$writer->writeElement('Id',$value['codice_fiscale_debitore']);
									$writer->writeElement('Issr','ADE');
								$writer->endElement();
							$writer->endElement();
						$writer->endElement();
					$writer->endElement();
					$writer->startElement('DbtrAcct');
						$writer->startElement('Id');
							$writer->writeElement('IBAN',$value['iban']);
						$writer->endElement();
					$writer->endElement();
					$writer->startElement('Purp');
						$writer->writeElement('Cd','PADD');
					$writer->endElement();
					$writer->startElement('RmtInf');
						$writer->writeElement('Ustrd', $value['causale']);
					$writer->endElement();
				$writer->endElement();
				}
		
		
			$writer->endElement(); 
			}
		
		$writer->endElement(); 	
		return $writer->flush(true);
	}
}

?>