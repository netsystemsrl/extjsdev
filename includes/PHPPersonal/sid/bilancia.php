<?php
function BilanciaImportTXT($root = '/var/www/html/archive/fornocervi/importRAW/bilancia') {
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	
	$message = 'finding TXT'. BRCRLF;
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
				while (($line = fgets($handle)) !== false) {
					$TipoMessaggio = trim(substr($line,0,2));	
					
					if ($TipoMessaggio == '00'){
						/*
000544772019201911020100001V   		
*/				
						$NumDOC = substr($line,1,7);
						$Anno = trim(substr($line,8,4));
						$Data = trim(substr($line,12,8));
						$Cliente = trim(substr($line,20,7));
						$TestaUnica = false;
						
						if ($conn->debug==1) {var_dump($Cliente); var_dump($Anno); var_dump($Data); var_dump($NumDOC);  echo(BRCRLF);}
						if ($Cliente != ''){
							$Ddt = WFVALUEDLOOKUP('*','ddt'," DOCNUM = '" . $NumDOC . "'" .
															" AND CG_CT_CONTABILEESERCIZI = " . $Anno . "");
							if ($Ddt == ''){
								$Ddt = array();
								$Ddt['DOCNUM'] = $NumDOC;
								$Ddt['DOCDATA'] = $Data;
								$Ddt['CT_FATTURAZIONE'] = WFVALUEDLOOKUP('ID','anagrafiche',"CODICE = '" . $Cliente . "'" );
								$Ddt['CT_CAUSALI'] = WFVALUEGLOBAL('MRP_CAUSALEVENDITA');
								$Causale = WFVALUEDLOOKUP('*','causali','ID = ' . $Ddt['CT_CAUSALI'] );
								$Ddt['SEGNO'] = $Causale['SEGNO'];
								$Ddt['CG_CT_CONTABILEESERCIZI'] = $Anno;
								$conn->AutoExecute("ddt", $Ddt, 'INSERT');
								$Ddt['ID'] = $conn->Insert_ID();
								$TestaUnica = true;
							}
						}
					}else{
/*
13              PZ00000000100000                00000000000150000    10                 LINGUA DI SUOCERA
*/
						$Codice = trim(substr($line,0,16));
						$um = trim(substr($line,16,2));
						$qta = trim(substr($line,18,14))/10000;
						$prezzo = trim(substr($line,48,17))/100000;
						$iva = trim(substr($line,69,2));
						$Descrizione = trim(substr($line,88,100));
						
						if ($TestaUnica){
							if ($conn->debug==1) {var_dump($Codice); var_dump($um); var_dump($qta); var_dump($prezzo);  var_dump($iva); var_dump($Descrizione); echo(BRCRLF);}
						
							$DdtMovimenti = array();
							$DdtMovimenti['CT_DDT'] = $Ddt['ID'];
							$DdtMovimenti['CT_ARTICOLI'] = WFVALUEDLOOKUP('ID','articoli',"CODICE = '" . $Codice . "'" );
							if ($DdtMovimenti['CT_ARTICOLI'] = '') $DdtMovimenti['CT_ARTICOLI'] = WFVALUEGLOBAL('CG_ARTICOLODESCRITTIVO');
							$DdtMovimenti['DESCRIZIONE'] = $Descrizione;
							$DdtMovimenti['UM'] = $um;
							$DdtMovimenti['QTA'] = $qta;
							$DdtMovimenti['CT_ALIQUOTE'] = $iva;
							$DdtMovimenti['PREZZORIGA'] = $prezzo;
							$conn->AutoExecute("ddtmovimenti", $DdtMovimenti, 'INSERT');
							$DdtMovimenti['ID'] = $conn->Insert_ID();
						}
						
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

?>