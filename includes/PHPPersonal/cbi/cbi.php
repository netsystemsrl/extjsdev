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
function my_bcmod( $x, $y ) { 
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

/************************************************************************************/
/*                   		  	  FUNC IMPORT  CBI								*/
/************************************************************************************/
function extText($string, $start, $end){
	$unit = substr($string, $start-1, ($end - $start + 1 ));
	// $unit = trim($unit);
	return $unit;
}

function CBI_ImportTXT($root = 'D:\\www\\cbiRAW\\') {
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	$date = new DateTime();
	
	$message = 'finding TXT CBI'. BRCRLF;
	$ListFile = array_slice(scandir($root), 2);
	$file = 0;
	foreach($ListFile as $in => $NameFile) {
		if (WFFileExt($NameFile) == 'txt'){
			if ($conn->debug==1) {echo (BRCRLF . "FILE:" . $NameFile . BRCRLF);}
			$file = $file +1;
			$linee = 0;
			$handle = fopen($root . $NameFile, "r");
			$message = $message . $NameFile;
			$FlussoTesta= array();
			$FlussoTesta['FILE'] = $NameFile;
			$FlussoTesta['IBAN'] = null;
			$AppoggioArray = array();
			if ($handle) {
				$line = fgets($handle);
				$TipoMessaggio = extText($line,2,3);
				//RH Rendicontazione saldi e movimenti di conti correnti
				if ($TipoMessaggio == 'RH' ){
					while (($line = fgets($handle)) !== false) {
						$TipoMessaggio = trim(substr($line,1,2));
						$AppoggioArray['FILE']	= $FlussoTesta['FILE'];
						$AppoggioArray['CONTO']	= $FlussoTesta['IBAN'];
						if ($conn->debug==1) {echo($TipoMessaggio . BRCRLF);}
						if ($TipoMessaggio == 'RH' ){
							// RH03069F4614280421100000000746                        F4614                                                            
							//trim(substr($line,0,1));	   //filler N blank
							$FlussoTesta['TM']  = trim(substr($line,1,2));       //RH      2-3 o an tipo record V "RH"
							$FlussoTesta['ABI'] = trim(substr($line,3,5));       //03069   4-8 o n mittente V codice ABI della Banca mittente degli estratticonto; è censita sul Directory;
							$FlussoTesta['SIA'] = trim(substr($line,8,5));	   //F4614   9-13 o an ricevente V codice SIA dell'Impresa destinataria della rendicontazione conti correnti contenuta nel supporto logico; è censita sul Directory;
							$FlussoTesta['DT']  = trim(substr($line,13,6));	   //280421  14-19 o n data creazione F data di creazione del 'flusso' da parte della Banca mittente nel formato GGMMAA
							$FlussoTesta['IDT'] = trim(substr($line,19,20));	   //100000000746          20-39 o an nome supporto V campo di libera composizione da parte della	Banca Mittente; deve essere univoco nell'ambito della data di creazione ed a parità di mittente e ricevente
							//trim(substr($line,39,76));	   //40-115 filler N blank
							//trim(substr($line,115,5));	   //116-120 Campo non disponibile N Campo non utilizzabile
						}
						elseif ($TipoMessaggio == '61'){
							//Saldo Iniziale      
							// 610000001                  930011000000746      34V0306953101100000000746EUR280421C000000000000,00IT34    F4614        
							//trim(substr($line,0,1));	   //filler N blank							
							$FlussoTesta['TM']  = trim(substr($line,1,2));       //61       2-3 o an tipo record V codice fisso "61"
							$FlussoTesta['IDR'] = trim(substr($line,3,7));       //0000001	 4-10 o n numero progressivo V numero della rendicontazione all'interno del flusso. Inizia con 1 ed è progressivo di 1. Il numero deve essere uguale per tutti i record della stessa rendicontazione
							//trim(substr($line,11,13));       	  //	     11-23 - - filler N blank
							$FlussoTesta['ABI'] = trim(substr($line,23,5));      //		24-28 f n codice ABI originario  Banca F da valorizzare con il codice della Banca assorbita (applicabile solo in caso di fusioni tra banche);
							$FlussoTesta['CAU'] = trim(substr($line,28,5));      //93001	29-33 o n causale V assume il valore fisso: "93001" nel caso di trasmissione ordinaria; "93011" nel caso di trasmissione di "recupero1
							$FlussoTesta['CC']  = trim(substr($line,33,27));     //1000000746     	34-49 f an descrizione F descrizione del rapporto di c/c
							$FlussoTesta['IDR'] = trim(substr($line,49,2));      //34		50-51 f an tipo conto F codice tipo conto assegnato dalla Banca (secondo la codifica proprietaria della Banca Mittente)
							$FlussoTesta['CIN'] = trim(substr($line,51,1));      //V		52-52 o an cin F carattere di controllo delle coordinate bancarie secondo lo standard ABI.
							$FlussoTesta['ABI'] = trim(substr($line,52,5));      //03069	53- 57 o n ABI banca V codice ABI banca mittente; deve coincidere con il mittente presente sul record di testa
							$FlussoTesta['CAB'] = trim(substr($line,57,5));      //53101 	58- 62 o n CAB banca F cab banca mittente;
							$FlussoTesta['CONTO']=trim(substr($line,62,12));     //100000000746	63-74 o an CONTO corrente F codice conto corrente (cfr. Standard BBAN)
							$FlussoTesta['DIV'] = trim(substr($line,74,3));      //EUR		75-77 o an codice divisa V Codice divisa (cfr. doc. CBI-STD-001: appendice D)
							$FlussoTesta['DTC'] = trim(substr($line,77,6));      //280421	78-83 o n data contabile V data contabile di riferimento del saldo; deve coincidere con la data contabile presente sul saldo finale (tipo record 64 pos. 14-19)
							$FlussoTesta['TIP'] = trim(substr($line,83,1));      //C		84-84- o an segno V assume i valori: D (Debito) - C (Credito)
							$FlussoTesta['VAL'] = trim(substr($line,84,16));     //000000000000,00 	85-99 o n saldo iniziale quadratura F Saldo iniziale di quadratura della rendicontazione; è ottenuto sottraendo al saldo contabile finale (rec. 64 pos. 21-35) gli  importi di tutti i movimenti contenuti nella rendicontazione ; (NB: il presente campo quindi non necessariamente coincide con il saldo contabile finale della rendicontazione del giorno precedente)
							$FlussoTesta['IBANNAZCK']= trim(substr($line,99,4));      //IT34 	100-103 Campi a disposizione per il completamento delle coordinate IBAN

							//$trim(substr($line,103,17));      //104- 120 - - filler N blank
							$FlussoTesta['IBAN'] = $FlussoTesta['IBANNAZCK']. $FlussoTesta['CIN'] . $FlussoTesta['ABI'] . $FlussoTesta['CAB'] . $FlussoTesta['CONTO'];
							
						}
						elseif ($TipoMessaggio == '62'){
							
							//INSERIMENTO TRANSAZIONE
							CBI_addFlusso($AppoggioArray);
							
							//Movimento    
							// 620000002001280421280421C000000001031,2448PX                1101211170370635         ACCR. BEU      
									
							$TM   = extText($line, 2, 3);		//tipo record
							$IDR  = extText($line, 4,10);		//numero progressivo
							$IDRR = extText($line,11,13);		//progressivo movimento
							$DTV  = extText($line,14,19);		//data valuta 
							$DTC  = extText($line,20,25);		//data registrazione
							
							$SEGNO=extText($line,26,26);		//D Debito - C Credito
							$VAL = extText($line,27,41);		//Importo del Movimento; 
							$TIPO= extText($line,42,43);		//causale CBI
							$CAUS= extText($line,44,45);		//attribuito dalla Banca
							$ASSE= extText($line,46,61);      	//ID ASSEGNO 
							$CRO = extText($line,62,77);      	//ID BONIFICO CRO
							$CRO = extText($line,78,86);      	//ID MITTENTE PAYORDREF NROSUPCBI
							$ORRS= extText($line,87,120);       //NOME
							
							
							$AppoggioArray['NOME'] 			= $ORRS;
							$AppoggioArray['TIPO'] 			= $TIPO; 
							$AppoggioArray['DATAVALUTA'] 	= 2000 + substr($DTV,4,2) . '-' . substr($DTV,2,2) . '-' . substr($DTV,0,2)   ;
							$AppoggioArray['DATA'] 			= 2000 + substr($DTC,4,2) . '-' . substr($DTC,2,2) . '-' . substr($DTC,0,2)   ;
							$AppoggioArray['VALORE']		= Cdec($VAL);
							$AppoggioArray['RECORDPROG']  	= $IDRR;
						}
						elseif ($TipoMessaggio == '63'){
							$TM   = extText($line, 2, 3);      //tipo record
							$IDR  = extText($line, 4,10);      //numero progressivo
							$IDRR = extText($line,11,13);      //progressivo movimento
								
							//Informazioni Movimento
							
							if (strpos($line, 'ABI-CAB' ) !== false){
								$inizio = strpos($line, 'ABI-CAB' );
								$ORRS = extText($line,14,$inizio);	//nominativo/ragione sociale e località dell’ordinante
								$inizio = $inizio +9;
								$ORABICAB = extText($line,$inizio,$inizio+11);
								$ORABICAB = str_replace("-", "", $ORABICAB);	//IBAN Ordinante
								$inizio = $inizio +12;
								$DESCRIZIONE = extText($line,$inizio,121);
								$ORRS = str_replace('BONIFICO o/c', '', $ORRS); 
								$ORRS = str_replace('BONIFICO ISTANTANEO o/c', '', $ORRS); 
								$ORRS = str_replace('ADDEBITO SDD', '', $ORRS); 
								$ORRS = str_replace('DISPOSIZIONE a favore di', '', $ORRS); 
								$ORRS = str_replace('RITIRO DISPOSIZIONE ELETTRONICA RIBA', '', $ORRS); 
								$AppoggioArray['NOME'] = $AppoggioArray['NOME']. $ORRS;
								$AppoggioArray['ABICAB'] = $ORABICAB;
								$AppoggioArray['DESCRIZIONE'] =  $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
							}
							elseif     (extText($line,14,16) == 'YYY'){
								$DTV = extText($line,17,24) ;      //data ordine GGMMAAAA
								$ORCF= extText($line,25,40);       //codifica fiscale ordinante N Codice fiscale/part. IVA dell’ordinante.
								$ORRS= extText($line,41,120);      //nominativo/ragione sociale e località dell’ordinante
								
								$AppoggioArray['DATAVALUTA'] =  2000 + substr($DTV,4,2) . '-' . substr($DTV,2,2) . '-' . substr($DTV,0,2)   ;
								$AppoggioArray['PIVA'] = $ORCF;
								$AppoggioArray['NOME'] = $AppoggioArray['NOME']. $ORRS;
							}
							elseif (extText($line,14,16) == 'YY2'){
								// 630000002004YY2
								$ORIN= trim(substr($line,17,66));     	//Via/piazza e numero civico di residenza
								$ORIBAN=trim(substr($line,67,100));     //IBAN Ordinante
								$AppoggioArray['IBAN'] = $ORIBAN;
								$AppoggioArray['INDIRIZZO'] = $AppoggioArray['INDIRIZZO'] . $ORIN;
							}
							elseif (extText($line,14,16) == 'ID1'){
								$DESCRIZIONE= extText($line,17,51); 			 //Identificativo univoco messaggio
								$DESCRIZIONE= $DESCRIZIONE. extText($line,52,86); 			 //Identificativo End To End
								$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
							}
							elseif (extText($line,14,16) == 'RI1'){
								$DESCRIZIONE= extText($line,17,120); 		//ordinante del pagamento N
								$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
								
							}
							elseif (extText($line,14,16) == 'RI2'){
								$DESCRIZIONE= extText($line,17,52); 		//ordinante del pagamento N
								$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
								
							}
							elseif (extText($line,14,16) == 'ZZ1'){
								// 630000002005ZZ1000000000061979,75EUR000000000061979,75EUR000000000061979,75EUR0000001000000000000000,000000000000,00238
								$VALO= extText($line,17,34);		// IMPORTO
								$DIVO= extText($line,35,37);		// DIVISA MONETA
								$VALN= extText($line,38,55);		// IMPORTO REGOLATO SWIFT
								$DIVR= extText($line,56,58);		// DIVISA MONETA REGOLATO SWIFT
								$VALC= extText($line,59,76);    	// IMPORTO NEGOZIATO
								$DIVC= extText($line,77,79);    	// DIVISA MONETA NEGOZIATO
								$CHG = extText($line,80,91)/1000;	// CAMBIO
								$COM = extText($line,92,104);		// COMMISSIONI
								$SPE = extText($line,105,117);		// SPESE
								$PUIC= extText($line,118,120);		// STATO PROV UIC
							}
							elseif (extText($line,14,16) == 'ZZ2'){
								// 630000002005ZZ2HORMANN MIDDLE EAST AND AFRICA FZE     
								$DESCRIZIONE= extText($line,17,120); 			//ordinante del pagamento N
								$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
							}
							elseif (extText($line,14,16) == 'ZZ3'){
								// 630000002005ZZ2HORMANN MIDDLE EAST AND AFRICA FZE    
								$DESCRIZIONE= extText($line,17,120); 			 //ordinante del pagamento N
								$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
							}
							elseif (extText($line,14,16) == 'ZZ4'){
								$DESCRIZIONE= extText($line,17,120); 			 //ordinante del pagamento N
								$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
							}
							elseif (extText($line,14,16) == 'KKK'){
								$DESCRIZIONE= extText($line,17,121); 			 //identificativo rapporto
								$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
							}
							elseif (extText($line,14,16) == '/NC/'){
								$DESCRIZIONE= extText($line,17,121);			 //identificativo rapporto
								$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
							}
							elseif (extText($line,14,16) == '/MP/'){
								$DESCRIZIONE= extText($line,17,121);			 //identificativo rapporto
								$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
							}
							elseif (extText($line,14,16) == '/RO/'){
								$DESCRIZIONE= extText($line,17,121); 			 //identificativo rapporto
								$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
							}
							else{
								$DESCRIZIONE= extText($line,17,121); 			 //identificativo rapporto
								$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
							}
						}
						elseif ($TipoMessaggio == '64'){
							//INSERIMENTO TRANSAZIONE
							CBI_addFlusso($AppoggioArray);
							//Saldo finale
							//  640000001EUR260421C000000000000,00C000000000000,00                                                      000000000000,00
						}
						elseif ($TipoMessaggio == '65'){
							//INSERIMENTO TRANSAZIONE
							CBI_addFlusso($AppoggioArray);
							//Liquidità future
						}					
						elseif ($TipoMessaggio == 'EF' ){
							//INSERIMENTO TRANSAZIONE
							CBI_addFlusso($AppoggioArray);
						}
					}
				}
				
				//EC Estratto Conto
				if ($TipoMessaggio == 'EC' ){
					while (($line = fgets($handle)) !== false) {
						$TipoMessaggio = trim(substr($line,1,2));
						if ($TipoMessaggio == 'EC' ){
							// EC03069AP9KJ04052104.05.20210053078001                                                             
							//trim(substr($line,0,1));	   //filler N blank
							$FlussoTesta['TM']  = trim(substr($line,1,2));       //EC      2-3 o an tipo record V "EC"
							$FlussoTesta['ABI'] = trim(substr($line,3,5));       //03069   4-8 o n mittente V codice ABI della Banca mittente degli estratticonto; è censita sul Directory;
							$FlussoTesta['SIA'] = trim(substr($line,8,5));	   //F4614   9-13 o an ricevente V codice SIA dell'Impresa destinataria della rendicontazione conti correnti contenuta nel supporto logico; è censita sul Directory;
							$FlussoTesta['DT']  = trim(substr($line,13,6));	   //280421  14-19 o n data creazione F data di creazione del 'flusso' da parte della Banca mittente nel formato GGMMAA
							$FlussoTesta['IDT'] = trim(substr($line,19,20));	   //100000000746          20-39 o an nome supporto V campo di libera composizione da parte della	Banca Mittente; deve essere univoco nell'ambito della data di creazione ed a parità di mittente e ricevente
							//trim(substr($line,39,76));	   //40-115 filler N blank
							//trim(substr($line,115,5));	   //116-120 Campo non disponibile N Campo non utilizzabile
						}
						elseif ($TipoMessaggio == '61'){
							//Saldo Iniziale      
							// 610000001                  930011000000746      34V0306953101100000000746EUR280421C000000000000,00IT34    F4614        
							//trim(substr($line,0,1));	   //filler N blank							
							$FlussoTesta['TM']  = trim(substr($line,1,2));       //61       2-3 o an tipo record V codice fisso "61"
							$FlussoTesta['IDR'] = trim(substr($line,3,7));       //0000001	 4-10 o n numero progressivo V numero della rendicontazione all'interno del flusso. Inizia con 1 ed è progressivo di 1. Il numero deve essere uguale per tutti i record della stessa rendicontazione
							//trim(substr($line,11,13));       	  //	     11-23 - - filler N blank
							$FlussoTesta['ABI'] = trim(substr($line,23,5));      //		24-28 f n codice ABI originario  Banca F da valorizzare con il codice della Banca assorbita (applicabile solo in caso di fusioni tra banche);
							$FlussoTesta['CAU'] = trim(substr($line,28,5));      //93001	29-33 o n causale V assume il valore fisso: "93001" nel caso di trasmissione ordinaria; "93011" nel caso di trasmissione di "recupero1
							$FlussoTesta['CC']  = trim(substr($line,33,27));     //1000000746     	34-49 f an descrizione F descrizione del rapporto di c/c
							$FlussoTesta['IDR'] = trim(substr($line,49,2));      //34		50-51 f an tipo conto F codice tipo conto assegnato dalla Banca (secondo la codifica proprietaria della Banca Mittente)
							$FlussoTesta['CIN'] = trim(substr($line,51,1));      //V		52-52 o an cin F carattere di controllo delle coordinate bancarie secondo lo standard ABI.
							$FlussoTesta['ABI'] = trim(substr($line,52,5));      //03069	53- 57 o n ABI banca V codice ABI banca mittente; deve coincidere con il mittente presente sul record di testa
							$FlussoTesta['CAB'] = trim(substr($line,57,5));      //53101 	58- 62 o n CAB banca F cab banca mittente;
							$FlussoTesta['CONTO']=trim(substr($line,62,12));     //100000000746	63-74 o an CONTO corrente F codice conto corrente (cfr. Standard BBAN)
							$FlussoTesta['DIV'] = trim(substr($line,74,3));      //EUR		75-77 o an codice divisa V Codice divisa (cfr. doc. CBI-STD-001: appendice D)
							$FlussoTesta['DTC'] = trim(substr($line,77,6));      //280421	78-83 o n data contabile V data contabile di riferimento del saldo; deve coincidere con la data contabile presente sul saldo finale (tipo record 64 pos. 14-19)
							$FlussoTesta['TIP'] = trim(substr($line,83,1));      //C		84-84- o an segno V assume i valori: D (Debito) - C (Credito)
							$FlussoTesta['VAL'] = trim(substr($line,84,16));     //000000000000,00 	85-99 o n saldo iniziale quadratura F Saldo iniziale di quadratura della rendicontazione; è ottenuto sottraendo al saldo contabile finale (rec. 64 pos. 21-35) gli  importi di tutti i movimenti contenuti nella rendicontazione ; (NB: il presente campo quindi non necessariamente coincide con il saldo contabile finale della rendicontazione del giorno precedente)
							$FlussoTesta['IBANNAZCK']= trim(substr($line,99,4));      //IT34 	100-103 Campi a disposizione per il completamento delle coordinate IBAN

							//$trim(substr($line,103,17));      //104- 120 - - filler N blank
							$FlussoTesta['IBAN'] = $FlussoTesta['IBANNAZCK']. $FlussoTesta['CIN'] . $FlussoTesta['ABI'] . $FlussoTesta['CAB'] . $FlussoTesta['CONTO'];
						}
						elseif ($TipoMessaggio == '62'){
							
							//INSERIMENTO TRANSAZIONE
							CBI_addFlusso($AppoggioArray);
							
							//Movimento    
							// 620000002001280421280421C000000001031,2448PX                1101211170370635         ACCR. BEU      
							//trim(substr($line,0,1));	   //filler N blank							
							$TM  = trim(substr($line,1,2));       //62       2-3 o an tipo record V codice fisso "61"
							$IDR = trim(substr($line,3,7));       //0000001	 4-10 o n numero progressivo V numero della rendicontazione all'interno del flusso. Inizia con 1 ed è progressivo di 1. Il numero deve essere uguale per tutti i record della stessa rendicontazione
							$IDRR= trim(substr($line,10,3));      //001		11-13 o n progressivo movimento V inizia da 001; al raggiungimento di 999 riinizia da 001
							$DTV = trim(substr($line,13,6));      //280421	14-19 o n data valuta F valuta del movimento
							$DTC = trim(substr($line,19,6));      //280421	20-25 o n data registrazione e/o contabile F data di registrazione/contabile del movimento
							$TIP = trim(substr($line,25,1));      //C		26- o an segno movimento V assume i valori: D (Debito) - C (Credito). Non è previsto il controllo tra la causale ed il segno definito nell’ambito dell’Appendice B “Tabella Causali CBI” del documento CBI-STD-001
							$VAL = trim(substr($line,26,15));     //000000001031,24 	27-41 o n importo movimento F Importo del Movimento; 
							$TIPO= trim(substr($line,41,2));      //48		42-43 o an causale CBI V causale CBI (cfr. Appendice B del documento CBI-STD-001)
							$IDR = trim(substr($line,43,2));      //PX		44-45 f an causale interna F causale secondo la codifica proprietaria della banca
							$IDR = trim(substr($line,45,16));     //                46-61 f an numero assegno V in corrispondenza del valore 13 (che equivale a “Vostro assegno bancario numero”) per la causale CBI (pos. 42-43) questo campo diventa obbligatorio e deve
							$CRO = trim(substr($line,61,16));     //1101211170370635	62-77 f an riferimento banca F numero di riferimento operazione attribuito dalla Banca. In caso di addebiti, ove possibile, o accrediti derivanti da bonifici, contiene il codice di riconoscimento dell’operazione (CRO o CRI) o altro riferimento della banca
							$IDR = trim(substr($line,77,9));      //         78-86 f an tipo riferimento cliente F riferimento attribuito dal cliente nel caso l’operazione sia d’iniziativa dello stesso;
							$DESCRIZIONE= trim(substr($line,86,33));     //ACCR. BEU      87-120 Riferimento cliente - descrizione movimento
							
							$AppoggioArray['DATAVALUTA'] =  2000 + substr($DTV,4,2) . '-' . substr($DTV,2,2) . '-' . substr($DTV,0,2)   ;
							$AppoggioArray['DATA'] =  		2000 + substr($DTC,4,2) . '-' . substr($DTC,2,2) . '-' . substr($DTC,0,2)   ;
							$AppoggioArray['VALORE'] = 		Cdec($VAL);
							$AppoggioArray['TIPO'] = 		$TIPO; 
							$AppoggioArray['DESCRIZIONE'] = trim($DESCRIZIONE); 
							$AppoggioArray['RECORDPROG']  = $IDRR;
						}
						elseif ($TipoMessaggio == '63'){
							//Informazioni Movimento
							if ($TIPO == '48'){   //TipoMessaggio 62
								if ($conn->debug==1) {echo ("TipoMessaggio:48" . BRCRLF);}
								if (trim(substr($line,13,3)) == 'YYY'){
								
									// 630000002004YYY26042021                N.W.T Solutions OU                      Keemia tn 4, Harjumaa, Tallinn, Kristiin
									//trim(substr($line,0,1));	   //filler N blank							
									$TM  = trim(substr($line,1,2));       //63       2-3 o an tipo record V codice fisso "63"
									$IDR = trim(substr($line,3,7));       //0000002	 4-10 o n numero progressivo V numero della rendicontazione all'interno del flusso. Inizia con 1 ed è progressivo di 1. Il numero deve essere uguale per tutti i record della stessa rendicontazione
									$IDRR= trim(substr($line,10,3));      //004		 11-13 o n progressivo movimento V inizia da 001; al raggiungimento di 999 riinizia da 001
									//trim(substr($line,12,3));      	  //YYY		 14-16 o n progressivo movimento  YYY”
									$DTV = trim(substr($line,13,8));      //26042021 17-24 o n data ordine N data ordine del cliente ordinante nel formato GGMMAAAA (nel caso di messaggio interbancario va rilevata dall’IDC D28)
									$ORCF= trim(substr($line,24,16));      //         25-40 f an codifica fiscale ordinante N Codice fiscale/part. IVA dell’ordinante.
									$ORRS= trim(substr($line,40,40));     //N.W.T .. 41-80 o an Cliente ordinante ragione sociale dell’ordinante
									$ORIN= trim(substr($line,80,40));     //Keemi .. 81-120 o an Località di residenza del cliente ordinante
									
									$AppoggioArray['DATAVALUTA'] =  2000 + substr($DTV,4,2) . '-' . substr($DTV,2,2) . '-' . substr($DTV,0,2)   ;
									$AppoggioArray['PIVA'] = $ORCF;
									if (array_key_exists('NOME', $AppoggioArray)) 		{ $AppoggioArray['NOME'] = $AppoggioArray['NOME'] . $ORRS; 		 } else{ $AppoggioArray['NOME'] =  $ORRS; }
									if (array_key_exists('INDIRIZZO', $AppoggioArray))  { $AppoggioArray['INDIRIZZO'] = $AppoggioArray['INDIRIZZO'] . $ORIN;} else{ $AppoggioArray['INDIRIZZO'] = $ORIN;}
								}
								elseif (trim(substr($line,12,3)) == 'YY2'){
									// 630000002004YY2
									//trim(substr($line,0,1));	   //filler N blank							
									$TM  = trim(substr($line,1,2));       //63       2-3 o an tipo record V codice fisso "63"
									$IDR = trim(substr($line,3,7));       //0000002	 4-10 o n numero progressivo V numero della rendicontazione all'interno del flusso. Inizia con 1 ed è progressivo di 1. Il numero deve essere uguale per tutti i record della stessa rendicontazione
									$IDRR= trim(substr($line,10,3));      //004		 11-13 o n progressivo movimento V inizia da 001; al raggiungimento di 999 riinizia da 001
									//trim(substr($line,13,3));      	  //YYY		 14-16 o n progressivo movimento  YY2”
									$ORIN= trim(substr($line,16,50));     //26042021 17-66 o n Via/piazza e numero civico di residenza
									$ORIBAN=trim(substr($line,66,34));     //67-100 o an IBAN Ordinante
									
									$AppoggioArray['IBAN'] = $ORIBAN;
									if (array_key_exists('INDIRIZZO', $AppoggioArray))  { $AppoggioArray['INDIRIZZO'] = $AppoggioArray['INDIRIZZO'] . $ORIN;} else{ $AppoggioArray['INDIRIZZO'] = $ORIN;}
								}
								elseif (trim(substr($line,12,3)) == 'ZZ1'){
									// 630000002005ZZ1000000000061979,75EUR000000000061979,75EUR000000000061979,75EUR0000001000000000000000,000000000000,00238
									//trim(substr($line,0,1));	   //filler N blank							
									$TM  = trim(substr($line,1,2));       //63       2-3 o an tipo record V codice fisso "63"
									$IDR = trim(substr($line,3,7));       //0000002	 4-10 o n numero progressivo V numero della rendicontazione all'interno del flusso. Inizia con 1 ed è progressivo di 1. Il numero deve essere uguale per tutti i record della stessa rendicontazione
									$IDRR= trim(substr($line,10,3));      //004		 11-13 o n progressivo movimento V inizia da 001; al raggiungimento di 999 riinizia da 001
									//$TME = trim(substr($line,13,3));      //004		 14-16 o an flag struttura N assume il valore fisso ZZ1
									$VALO= trim(substr($line,16,18));     //         17-34 f n importo originario pagamento N importo disposto dall’ordinante al lordo delle commissioni; se tale informazione è stata ricevuta dalla Banca mittente della rendicontazione tale importo diventa obbligatorio 
									$DIVO= trim(substr($line,34,3));      //         35-37 f an codice divisa importo originario N codice divisa (cfr. doc. CBI-STD-001: appendice D) dell’importo precedente; diventa obbligatorio se il campo precedente è valorizzato
									$VALN= trim(substr($line,37,4));      //         38-55 o n importo regolato N importo regolato tra banche (è l’importo presente nel campo 032 dei messaggi SWIFT o nell’ IDC 034 dei messaggi domestici)
									$DIVR= trim(substr($line,55,3));      //         56-58 o an codice divisa regolamento N codice divisa (cfr. doc. CBI-STD-001: appendice D) dell’importo precedente 
									$VALC= trim(substr($line,58,18));     //         59-76 f n importo negoziato N rappresenta il controvalore in divisa dell’importo contabilizzato
									$DIVC= trim(substr($line,76,4));      //         77-79 f an codice divisa importo negoziato N codice divisa (cfr. doc. CBI-STD-001: appendice D) dell’importo precedente; diventa obbligatorio se il campo precedente è valorizzato
									$CHG = trim(substr($line,79,12));     //         80-91 f n cambio applicato N tasso di cambio applicato; gli ultimi 5 caratteri sono decimali (virgola implicita)
									$COM = trim(substr($line,91,13));     //         92-104 f n importo commissioni. N da indicare se non contabilizzate separatamente dall’importo del pagamento 
									$SPE= trim(substr($line,104,13));     //         105-117 f n importo spese N da indicare se non contabilizzate separatamente dall’importo del pagamento
									//trim(substr($line,117,3));          //         118-120 - - filler N blank
									$PUIC= trim(substr($line,117,3));     //         118-120 o n Codice Paese N Cod. Paese di provenienza o di destinazione dei fondi, secondo la codifica UIC
									
								}
								elseif (trim(substr($line,12,3)) == 'ZZ2'){
									// 630000002005ZZ2HORMANN MIDDLE EAST AND AFRICA FZE     
									//trim(substr($line,0,1));	   //filler N blank				                                                                 
									$TM  = trim(substr($line,1,2));       //63       2-3 o an tipo record V codice fisso "63"
									$IDR = trim(substr($line,3,7));       //0000002	 4-10 o n numero progressivo V numero della rendicontazione all'interno del flusso. Inizia con 1 ed è progressivo di 1. Il numero deve essere uguale per tutti i record della stessa rendicontazione
									$IDRR= trim(substr($line,10,3));      //004		 11-13 o n progressivo movimento V inizia da 001; al raggiungimento di 999 riinizia da 001
									//$TME = trim(substr($line,13,3));    //004		 14-16 o an flag struttura N assume il valore fisso ZZ2
									$DESCRIZIONE= trim(substr($line,16,104));    //  		 17-120 o an ordinante del pagamento N
									
									if (array_key_exists('NOME', $AppoggioArray)) { $AppoggioArray['NOME'] = $AppoggioArray['NOME'] . $DESCRIZIONE; 	} else{ $AppoggioArray['NOME'] =  $DESCRIZIONE; }
								}
								elseif (trim(substr($line,12,3)) == 'ZZ3'){
									// 630000002005ZZ3PILOMAT S.R.L.                                    HORMANN INV V1 01289, V1 01264                        
									//trim(substr($line,0,1));	   //filler N blank				
									$TM  = trim(substr($line,1,2));       //63       2-3 o an tipo record V codice fisso "63"
									$IDR = trim(substr($line,3,7));       //0000002	 4-10 o n numero progressivo V numero della rendicontazione all'interno del flusso. Inizia con 1 ed è progressivo di 1. Il numero deve essere uguale per tutti i record della stessa rendicontazione
									$IDRR= trim(substr($line,10,3));      //004		 11-13 o n progressivo movimento V inizia da 001; al raggiungimento di 999 riinizia da 001
									//$TME = trim(substr($line,13,3));    //004		 14-16 o an flag struttura N assume il valore fisso ZZ3
									$IDRR= trim(substr($line,16,48));     //004		 17-66 o an beneficiario N beneficiario del pagamento
									$DESCRIZIONE= trim(substr($line,66,54));     //004		 67-120 o an motivazione del pagamento 
									
									$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
								}
								else{
									$DESCRIZIONE= trim(substr($line,14,150)); 
									$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
								}
								if ($conn->debug==1) {var_dump ($AppoggioArray);}
							}
							else{
								if ($conn->debug==1) {echo ("TipoMessaggio:NN" . BRCRLF);}
								// 630000002001/NC/205032104222AEI-F53CENQARXVH       /MP/Customer: 0602 01817 Invoice V1-00018/BB/PILOMAT S.R.L./RO/AH003
								//trim(substr($line,0,1));	   //filler N blank							
								$TM  = trim(substr($line,1,2));       //63       2-3 o an tipo record V codice fisso "63"
								$IDR = trim(substr($line,3,7));       //0000002	 4-10 o n numero progressivo V numero della rendicontazione all'interno del flusso. Inizia con 1 ed è progressivo di 1. Il numero deve essere uguale per tutti i record della stessa rendicontazione
								$IDRR= trim(substr($line,10,3));      //001		11-13 o n progressivo movimento V inizia da 001; al raggiungimento di 999 riinizia da 001
								//trim(substr($line,13,3));      	  ///NC		14-16 o n progressivo movimento  KKK”
								$IDR = trim(substr($line,13,23));     //17-39 o an identificativo rapporto N per le operazioni di cash pooling
								$DESCRIZIONE = trim(substr($line,39,81));    //40-120 - - filler N blank
								
								$AppoggioArray['DESCRIZIONE'] = $AppoggioArray['DESCRIZIONE'] . ' ' . trim($DESCRIZIONE);
								
								if ($conn->debug==1) {var_dump ($AppoggioArray);}
							}
						}
						elseif ($TipoMessaggio == '64'){
							//Saldo finale
							//INSERIMENTO TRANSAZIONE
							CBI_addFlusso($AppoggioArray);
						}
						elseif ($TipoMessaggio == 'EF' ){
							//FINE
							CBI_addFlusso($AppoggioArray);
						}
					}
				}
				
				
				//RA   Rendicontazione conti anticipi
				if ($TipoMessaggio == 'RA' ){
					while (($line = fgets($handle)) !== false) {
						$TipoMessaggio = trim(substr($line,1,2));
						if ($TipoMessaggio == 'RA' ){
						
						}
						elseif ($TipoMessaggio == '61'){
							//Saldo Iniziale
						}
						elseif ($TipoMessaggio == '62'){
							//Movimento
						}
						elseif ($TipoMessaggio == '63'){
							//Informazioni Movimento
						}
						elseif ($TipoMessaggio == '64'){
								//Saldo finale
								}
						elseif ($TipoMessaggio == 'EF' ){
								//FINE
						}
					}
				}
				
				
				//DT   Rendicontazione Dossier Titoli
				if ($TipoMessaggio == 'DT' ){
					while (($line = fgets($handle)) !== false) {
						$TipoMessaggio = trim(substr($line,1,2));
						if ($TipoMessaggio == 'DT' ){
						
						}
						elseif ($TipoMessaggio == '10'){
							//Saldo Titolo
						}
						elseif ($TipoMessaggio == '20'){
							//Movimento
						}
						elseif ($TipoMessaggio == 'EF' ){
								//FINE
						}
					}
				}
				
				
				//RP   Rendicontazione Portafoglio
				if ($TipoMessaggio == 'RP' ){
					while (($line = fgets($handle)) !== false) {
						$TipoMessaggio = trim(substr($line,1,2));
						if ($TipoMessaggio == 'RP' ){
						
						}
						elseif ($TipoMessaggio == '61'){
							//Saldo Iniziale
						}
						elseif ($TipoMessaggio == '62'){
							//Movimento
						}
						elseif ($TipoMessaggio == '63'){
							//Informazioni Movimento
						}
						elseif ($TipoMessaggio == '64'){
								//Saldo finale
								}
						elseif ($TipoMessaggio == 'EF' ){
								//FINE
								}
					}
				}
				
					
				fclose($handle);
				rename($root . $NameFile, $root . "old/" . $NameFile);
				$message = $message . "(" . $linee . ")" . BRCRLF;
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
				$linee = 0;
				
				$line = fgets($handle);
				while (($line = fgets($handle)) !== false) {
					//ContoIBAN;DataOp;DataValuta;Desc;AvereAccrediti;DAREAddebiti;Causale
					$AppoggioArray = array();
					$AppoggioArray['FILE'] = $val;
					$AppoggioArray = CSV2Array($line, ";");
					$AppoggioArray['CONTO'] = $AppoggioArray[0];
					$AppoggioArray['DATA'] = WFSTRTODATE($AppoggioArray[1]);
					$AppoggioArray['VALORE'] = Cdec(ABS($AppoggioArray[4]));
					if ($AppoggioArray['VALORE'] == 0) $AppoggioArray['VALORE'] = Cdec(ABS($AppoggioArray[5]));
					$AppoggioArray['DESCRIZIONE'] = left(str_replace("'","\\'",$AppoggioArray[3]),255);
					$AppoggioArray['TIPO'] = $AppoggioArray[6];
					$AppoggioArray['NOME'] = null;
					$AppoggioArray['INDIRIZZO'] = null;
					$AppoggioArray['IBAN'] = null;
					$AppoggioArray['PIVA'] = null;
					CBI_addFlusso($AppoggioArray);
				}
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


function CBI_addFlusso(&$Record){
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	
	if ($Record['DATA'] == null) {
		
	}
	else{
		$date = new DateTime();
		$Record['SI'] = $date->getTimestamp();
		if ($conn->debug==1) var_dump($Record);
		
		if (array_key_exists('VALORE', $Record)){
			$Record['NOME'] = str_replace('BONIFICO o/c', '', $Record['NOME']); 
			$Record['NOME'] = str_replace('BONIFICO ISTANTANEO o/c', '', $Record['NOME']); 
			$Record['NOME'] = str_replace('ADDEBITO SDD', '', $Record['NOME']); 
			$Record['NOME'] = str_replace('DISPOSIZIONE a favore di', '', $Record['NOME']); 
			$Record['NOME'] = str_replace('RITIRO DISPOSIZIONE ELETTRONICA RIBA', '', $Record['NOME']); 
			$Record['NOME'] = str_replace("SOCIETA' A RESPONSABILITA' LIMITATA", '', $Record['NOME']); 
			$Record['NOME'] = str_replace("SEMPLIFICATA", '', $Record['NOME']); 
			$Record['NOME'] = str_replace("S.R.L.", ' S.R.L.', $Record['NOME']); 
			$Record['NOME'] = str_replace("  ", ' ', $Record['NOME']); 
			$Record['NOME'] = str_replace("  ", ' ', $Record['NOME']); 
			$Record['NOME'] = trim($Record['NOME']);
			
			
			$sql = "SELECT * 
					FROM cg_flussibanca 
					WHERE DESCRIZIONE = '" .  addslashes($Record['DESCRIZIONE']) . "'
						AND CONTO = '" . $Record['CONTO'] . "'
						AND DATA = " . WFSQLTODATE($Record['DATA']) . "
						AND VALORE = " . $Record['VALORE'] . "
						AND RECORDPROG = '" . $Record['RECORDPROG'] . "'";
			$RsCBI = $conn->Execute($sql);		
			$RCount = $RsCBI->RecordCount();
			$sqlC =  "";
			if($RCount == 0)	{ $sqlC = $conn->getInsertSql($RsCBI,$Record);}
			if ($sqlC != '') { 
				if ($conn->debug==1) {var_dump($sqlC);}
				try {   
					$conn->Execute($sqlC); 
				} catch (exception $e){
				
				}
			}
		}
	}
							
	$Record = array();
	$Record['FILE']			= $FlussoTesta['FILE'];
	$Record['CONTO']		= $FlussoTesta['IBAN'];
	$Record['NOME']			= null;
	$Record['TIPO']			= null;
	$Record['DATA']			= null;
	$Record['RECORDPROG']  	= null;
	$Record['VALORE']		= null;
	$Record['DESCRIZIONE']	= null;
	$Record['INDIRIZZO']	= null;
	$Record['IBAN']    		= null;
	$Record['ABICAB']		= null;
	$Record['NOTE']			= null;
	$Record['SI']			= null;
}

function CBI_CollegaFlussi(){
	global $output;
	global $conn;
	global $ExtJSDevDB;
	global $ExtJSDB;
	global $RegistrationId;
	
	/**********************************/
	//AVVISI TIPOLOGIE
	$sql = "UPDATE IGNORE cg_flussibanca 
			SET cg_flussibanca.TIPO = 'AV', CG_CT_FLUSSITIPO = NULL
			WHERE cg_flussibanca.TIPOFILE = 'AV' AND cg_flussibanca.TIPO <> 'AV'
				AND cg_flussibanca.ESCLUDI = 0";
	WFSQL($sql);
	
	//collega tipologia flussi
	$sql = "UPDATE IGNORE cg_flussibanca
			SET cg_flussibanca.TIPO = REPLACE(cg_flussibanca.TIPO,'\r','')
				WHERE cg_flussibanca.ESCLUDI = 0";
	WFSQL($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca
			SET cg_flussibanca.TIPO = REPLACE(cg_flussibanca.TIPO,'\n','')
				WHERE cg_flussibanca.ESCLUDI = 0";
	WFSQL($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca
			SET cg_flussibanca.TIPO = trim(cg_flussibanca.TIPO)
				WHERE cg_flussibanca.ESCLUDI = 0";
	WFSQL($sql);

	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN cg_flussitipo on cg_flussitipo.sigla = cg_flussibanca.TIPO 
			SET CG_CT_FLUSSITIPO = cg_flussitipo.id
			WHERE  CG_CT_FLUSSITIPO is null
				AND cg_flussibanca.ESCLUDI = 0";
	WFSQL($sql);


	//ATTRIBUZIONE STIPENDI
	$sql = "UPDATE IGNORE cg_flussibanca
				SET TIPO = 39, CG_CT_FLUSSITIPO = 32
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null 
				AND DESCRIZIONE LIKE '%stipendi%'
				AND cg_flussibanca.ESCLUDI = 0";
	WFSQL($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca
				SET TIPO = 39, CG_CT_FLUSSITIPO = 32
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null 
				AND DESCRIZIONE LIKE '%Rimborso Spese%'
				AND cg_flussibanca.ESCLUDI = 0";
	WFSQL($sql);
	
	
	/**********************************/
	/*    ABBINAMENTO anagrafica      */
	/**********************************/
	
	//IBAN
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on anagrafiche.IBAN = cg_flussibanca.IBAN
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE LENGTH(cg_flussibanca.IBAN) = 27 
				AND LENGTH(anagrafiche.IBAN) = 27 
				AND cg_flussibanca.CT_ANAGRAFICHE is null
				AND anagrafiche.CT_ANAGRAFICATIPO = 1 AND anagrafiche.DISATTIVATO = 0
				AND cg_flussibanca.ESCLUDI = 0
				AND anagrafiche.ID <> " . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'). "
					AND cg_flussibanca.TIPO IN (26,31,50,48)";
	WFSQL($sql);
	
	//PIVA CF
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on anagrafiche.PIVA = cg_flussibanca.PIVA
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE 
				LENGTH(cg_flussibanca.PIVA) > 10 AND LENGTH(anagrafiche.PIVA) > 10
				AND cg_flussibanca.CT_ANAGRAFICHE is null 
				AND anagrafiche.CT_ANAGRAFICATIPO = 1 AND anagrafiche.DISATTIVATO = 0
				AND cg_flussibanca.ESCLUDI = 0
				AND anagrafiche.ID <> " . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'). "
					AND cg_flussibanca.TIPO IN (26,31,50,48)";
	WFSQL($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on anagrafiche.CF = cg_flussibanca.PIVA
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE LENGTH(cg_flussibanca.PIVA) > 10 
				AND LENGTH(anagrafiche.CF) > 10 
				AND cg_flussibanca.CT_ANAGRAFICHE is null
				AND anagrafiche.CT_ANAGRAFICATIPO = 1 AND anagrafiche.DISATTIVATO = 0
				AND cg_flussibanca.ESCLUDI = 0
				AND anagrafiche.ID <> " . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'). "
					AND TIPO IN (26,31,50,48)";
	WFSQL($sql);
	
	//BANCACBI
	$sql = "UPDATE IGNORE anagrafiche set anagrafiche.BANCACBI = REPLACE(anagrafiche.BANCACBI, '  ', ' ');";
	WFSQL($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca set cg_flussibanca.NOME = TRIM(REPLACE(cg_flussibanca.NOME, '  ', ' '))";
	WFSQL($sql);
	$sql = "UPDATE IGNORE cg_flussibanca set cg_flussibanca.NOME = TRIM(REPLACE(cg_flussibanca.NOME, ':', ''))";
	WFSQL($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca set cg_flussibanca.DESCRIZIONE = TRIM(REPLACE(cg_flussibanca.DESCRIZIONE, '  ', ' '));";
	WFSQL($sql);
	$sql = "UPDATE IGNORE cg_flussibanca set cg_flussibanca.DESCRIZIONE = TRIM(REPLACE(cg_flussibanca.DESCRIZIONE, ':', ''))";
	WFSQL($sql);

	//BANCACBI
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on cg_flussibanca.NOME LIKE CONCAT('%',anagrafiche.BANCACBI, '%')
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null
				AND anagrafiche.CT_ANAGRAFICATIPO = 1 AND anagrafiche.DISATTIVATO = 0
				AND length(anagrafiche.BANCACBI) > 3 
				AND anagrafiche.BANCACBI is not null 
				AND cg_flussibanca.ESCLUDI = 0
				AND anagrafiche.ID <> " . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'). "
					AND TIPO IN (26,31,50,48)";
	WFSQL($sql);
	
	//DESCRIZIONE
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on REPLACE(cg_flussibanca.NOME, '.', '')  LIKE CONCAT('%', REPLACE(anagrafiche.DESCRIZIONE, '.', '') , '%')
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null 
				AND anagrafiche.CT_ANAGRAFICATIPO = 1 AND anagrafiche.DISATTIVATO = 0
				AND cg_flussibanca.ESCLUDI = 0
				AND anagrafiche.ID <> " . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'). "
					AND TIPO IN (26,31,50,48)";
	WFSQL($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN anagrafiche on  REPLACE(anagrafiche.DESCRIZIONE, '.', '')  LIKE CONCAT('', REPLACE(cg_flussibanca.NOME, '.', '') , '%')
			SET CT_ANAGRAFICHE = anagrafiche.ID
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null 
				AND anagrafiche.CT_ANAGRAFICATIPO = 1 AND anagrafiche.DISATTIVATO = 0
				AND cg_flussibanca.NOME is not null AND length(cg_flussibanca.NOME) > 3 
				AND cg_flussibanca.ESCLUDI = 0
				AND anagrafiche.ID <> " . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA') . "
					AND TIPO IN (26,31,50,48)";
	WFSQL($sql);
	
	//FULLTEXT
	$StrSQL = "SELECT ID, NOME
				FROM cg_flussibanca 
				WHERE cg_flussibanca.CT_ANAGRAFICHE is null
					AND TIPO IN (26,31,50,48)"; 
	$rsFlussi = $conn->Execute($StrSQL);
	while (!$rsFlussi->EOF) {
		$Name = $rsFlussi->fields['NOME'];
		$Name = str_replace('.','',$Name);
		$Name = str_replace('-',' ',$Name);
		$Name = str_replace('+',' ',$Name);
		$Name = str_replace('&',' ',$Name);
		$StrSQL = "SELECT ID, DESCRIZIONE, match(DESCRIZIONE) against('" . addslashes($Name) . "' IN BOOLEAN MODE) AS SCORE
					FROM anagrafiche
					WHERE anagrafiche.CT_ANAGRAFICATIPO = 1 AND anagrafiche.DISATTIVATO = 0
					ORDER BY SCORE DESC
					LIMIT 5" ; 
		$rsAnagra = $conn->Execute($StrSQL);
		if ($rsAnagra){
			if ($rsAnagra->fields['SCORE'] > 7.5){ 
				$sql = "UPDATE IGNORE cg_flussibanca
						SET CT_ANAGRAFICHE = " . $rsAnagra->fields['ID'] . "
						WHERE ID = "  . $rsFlussi->fields['ID'] ;
				WFSQL($sql);
			}
		}
		$rsFlussi->MoveNext();
	}
	$rsFlussi->Close();

	$StrSQL = "SELECT ID, NOME
				FROM cg_flussibanca 
				WHERE cg_flussibanca.CT_ANAGRAFICHE is null
					AND TIPO IN (26,31,50,48)"; 
	$rsFlussi = $conn->Execute($StrSQL);
	while (!$rsFlussi->EOF) {
		$Name = $rsFlussi->fields['NOME'];
		$Name = str_replace('.','',$Name);
		$Name = str_replace('-',' ',$Name);
		$Name = str_replace('+',' ',$Name);
		$Name = str_replace('&',' ',$Name);
		$StrSQL = "SELECT ID, DESCRIZIONE, match(DESCRIZIONE) against('" . addslashes($Name) . "' IN BOOLEAN MODE) AS SCORE
					FROM anagrafiche
					WHERE anagrafiche.CT_ANAGRAFICATIPO = 1 AND anagrafiche.DISATTIVATO = 1
					ORDER BY SCORE DESC
					LIMIT 5" ; 
		$rsAnagra = $conn->Execute($StrSQL);
		if ($rsAnagra){
			if ($rsAnagra->fields['SCORE'] > 7.5){ 
				$sql = "UPDATE IGNORE cg_flussibanca
						SET CT_ANAGRAFICHE = " . $rsAnagra->fields['ID'] . "
						WHERE ID = "  . $rsFlussi->fields['ID'] ;
				WFSQL($sql);
			}
		}
		$rsFlussi->MoveNext();
	}
	$rsFlussi->Close();

	
	$StrSQL = "SELECT ID, DESCRIZIONE
				FROM anagrafiche 
				WHERE CT_ANAGRAFICATIPO = 1 
					AND anagrafiche.ID <> " . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'). "
					AND DISATTIVATO = 0"; 
	$rsAnagra = $conn->Execute($StrSQL);
	while (!$rsAnagra->EOF) {
		$Name = $rsAnagra->fields['DESCRIZIONE'];
		$Name = str_replace('.','',$Name);
		$Name = str_replace('-',' ',$Name);
		$Name = str_replace('+',' ',$Name);
		$Name = str_replace('&',' ',$Name);
		$StrSQL = "SELECT ID, NOME, match(NOME) against('" . addslashes($Name) . "' IN BOOLEAN MODE) AS SCORE
					FROM cg_flussibanca
					WHERE cg_flussibanca.CT_ANAGRAFICHE is null
						AND TIPO IN (26,31,50,48)
					ORDER BY SCORE DESC
					LIMIT 5" ; 
		$rsFlussi = $conn->Execute($StrSQL);
		if ($rsFlussi){
			if ($rsFlussi->fields['SCORE'] > 7.5){ 
				$sql = "UPDATE IGNORE cg_flussibanca
						SET CT_ANAGRAFICHE = " . $rsFlussi->fields['ID'] . "
						WHERE ID = "  . $rsAnagra->fields['ID'] ;
				WFSQL($sql);
			}
		}
		$rsAnagra->MoveNext();
	}
	
	$rsAnagra->MoveFirst();
	while (!$rsAnagra->EOF) {
		$Name = $rsAnagra->fields['DESCRIZIONE'];
		$Name = str_replace('.','',$Name);
		$Name = str_replace('-',' ',$Name);
		$Name = str_replace('+',' ',$Name);
		$Name = str_replace('&',' ',$Name);
		$StrSQL = "SELECT ID, NOME, match(NOME) against('" . addslashes($Name) . "' IN BOOLEAN MODE) AS SCORE
					FROM cg_flussibanca
					WHERE cg_flussibanca.CT_ANAGRAFICHE is null
						AND TIPO IN (26,31,50,48)
					ORDER BY SCORE DESC
					LIMIT 5" ; 
		$rsFlussi = $conn->Execute($StrSQL);
		if ($rsFlussi){
			if ($rsFlussi->fields['SCORE'] > 7.5){ 
				$sql = "UPDATE IGNORE cg_flussibanca
						SET CT_ANAGRAFICHE = " . $rsFlussi->fields['ID'] . "
						WHERE ID = "  . $rsAnagra->fields['ID'] ;
				WFSQL($sql);
			}
		}
		$rsAnagra->MoveNext();
	}
	$rsAnagra->Close();
	

	//ABBINA PER VALORE
	$sql = "UPDATE IGNORE cg_flussibanca 
			INNER JOIN (
				SELECT cg_flussibanca.*
				   ,cg_pianoconti.CT_ANAGRAFICHE as NEW_CT_ANAGRAFICHE,cg_contabilescadenzario.ID as NEW_CG_CT_CONTABILESCADENZARIO 
					FROM cg_flussibanca 
					INNER JOIN cg_contabilescadenzario ON cg_contabilescadenzario.VALORE = cg_flussibanca.VALORE
									AND ABS(DATEDIFF(cg_contabilescadenzario.DATA, cg_flussibanca.DATA)) < 90
					INNER JOIN cg_contabileprimanota ON cg_contabileprimanota.CG_CT_CONTABILE = cg_contabilescadenzario.CG_CT_CONTABILE
					INNER JOIN cg_pianoconti ON cg_pianoconti.ID= cg_contabileprimanota.CG_CT_PIANOCONTI 
				WHERE cg_contabilescadenzario.CG_CT_CONTABILEPRIMANOTA is null AND CHIUSA = 0
					AND cg_flussibanca.CG_CT_CONTABILESCADENZARIO  IS NULL 
					AND cg_flussibanca.CT_ANAGRAFICHE IS NULL
					AND cg_pianoconti.CT_ANAGRAFICHE IS NOT NULL
				group by cg_flussibanca.VALORE
				HAVING COUNT(cg_contabilescadenzario.ID) <= 1
				)as unici ON unici.ID = cg_flussibanca.ID
			SET cg_flussibanca.CG_CT_CONTABILESCADENZARIO = unici.NEW_CG_CT_CONTABILESCADENZARIO ,
				cg_flussibanca.CT_ANAGRAFICHE = unici.NEW_CT_ANAGRAFICHE
			WHERE cg_flussibanca.CG_CT_CONTABILESCADENZARIO IS NULL 
				AND cg_flussibanca.CT_ANAGRAFICHE IS NULL
				AND cg_flussibanca.TIPO IN (26,31,50,48)";
	WFSQL($sql);
			
												  
	/**********************************/
	//SPESE
	/**********************************/
	
	//collega anagrafica SPESE (uso il PARENT banca->conto nel conto non ce anagrafica e nel conto padre )
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN cg_flussitipo ON cg_flussitipo.ID = cg_flussibanca.CG_CT_FLUSSITIPO
				INNER JOIN cg_pianoconti ON cg_pianoconti.ID = cg_flussibanca.CG_CT_PIANOCONTI
				INNER JOIN cg_pianoconti AS pianocontiparent ON pianocontiparent.ID = cg_pianoconti.ID_PARENT
			SET cg_flussibanca.CT_ANAGRAFICHE = pianocontiparent.CT_ANAGRAFICHE 
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null 
				AND pianocontiparent.CT_ANAGRAFICHE IS NOT NULL 
				AND cg_flussitipo.CT_PAGAMENTITIPO = 7
				AND cg_flussibanca.ESCLUDI = 0";
	WFSQL($sql);
	
	//collega anagrafica ACCREDITO RIBA (uso il PARENT banca->conto nel conto non ce anagrafica e nel conto padre )
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN cg_flussitipo ON cg_flussitipo.ID = cg_flussibanca.CG_CT_FLUSSITIPO
				INNER JOIN cg_pianoconti ON cg_pianoconti.ID = cg_flussibanca.CG_CT_PIANOCONTI
				INNER JOIN cg_pianoconti AS pianocontiparent ON pianocontiparent.ID = cg_pianoconti.ID_PARENT
			SET cg_flussibanca.CT_ANAGRAFICHE = pianocontiparent.CT_ANAGRAFICHE 
			WHERE cg_flussibanca.CT_ANAGRAFICHE is null 
				AND pianocontiparent.CT_ANAGRAFICHE IS NOT NULL 
				AND cg_flussitipo.ID = 39
				AND cg_flussibanca.ESCLUDI = 0";
	WFSQL($sql);
	
	//CONTO
	//collega PIANOCONTI A CONTO
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN cg_pianoconti ON cg_pianoconti.IBAN = cg_flussibanca.CONTO
			SET CG_CT_PIANOCONTI = cg_pianoconti.ID
				WHERE cg_flussibanca.ESCLUDI = 0";
	WFSQL($sql);
	
	
	
	/**********************************/
	//ESCLUDI
	/**********************************/
	
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
			SET ESCLUDI = 1 
			WHERE cg_flussibanca.ESCLUDI = 0";
	WFSQL($sql);

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
			SET ESCLUDI = 1 
			WHERE cg_flussibanca.ESCLUDI = 0";
	WFSQL($sql);
	
	
	/**********************************/
	//ABBINA SCADENZARIO A FLUSSI BANCA
	/**********************************/

	$sql = "UPDATE IGNORE  cg_flussibanca 
				INNER JOIN cg_pianoconti ON cg_pianoconti.CT_ANAGRAFICHE = cg_flussibanca.CT_ANAGRAFICHE 
				INNER JOIN cg_contabileprimanota ON cg_contabileprimanota.CG_CT_PIANOCONTI = cg_pianoconti.ID
				INNER JOIN cg_contabilescadenzario ON cg_contabilescadenzario.CG_CT_CONTABILE = cg_contabileprimanota.CG_CT_CONTABILE 
												  AND cg_contabilescadenzario.VALORE = cg_contabileprimanota.VALORE
												  AND cg_contabilescadenzario.DATA = cg_flussibanca.DATA
			SET CG_CT_CONTABILESCADENZARIO = cg_contabilescadenzario.ID 
			WHERE CG_CT_CONTABILESCADENZARIO IS NULL";
	WFSQL($sql);


	$sql = "UPDATE IGNORE  cg_flussibanca 
				INNER JOIN cg_pianoconti ON cg_pianoconti.CT_ANAGRAFICHE = cg_flussibanca.CT_ANAGRAFICHE 
				INNER JOIN cg_contabileprimanota ON cg_contabileprimanota.CG_CT_PIANOCONTI = cg_pianoconti.ID
				INNER JOIN cg_contabilescadenzario ON cg_contabilescadenzario.CG_CT_CONTABILE = cg_contabileprimanota.CG_CT_CONTABILE 
												  AND cg_contabilescadenzario.VALORE = cg_contabileprimanota.VALORE
												  AND ABS(DATEDIFF(cg_contabilescadenzario.DATA, cg_flussibanca.DATA))  <  30
			SET CG_CT_CONTABILESCADENZARIO = cg_contabilescadenzario.ID 
			WHERE CG_CT_CONTABILESCADENZARIO IS NULL";
	WFSQL($sql);

	$sql = "UPDATE IGNORE  cg_flussibanca 
				INNER JOIN cg_pianoconti ON cg_pianoconti.CT_ANAGRAFICHE = cg_flussibanca.CT_ANAGRAFICHE 
				INNER JOIN cg_contabileprimanota ON cg_contabileprimanota.CG_CT_PIANOCONTI = cg_pianoconti.ID
				INNER JOIN cg_contabilescadenzario ON cg_contabilescadenzario.CG_CT_CONTABILE = cg_contabileprimanota.CG_CT_CONTABILE 
												  AND cg_contabilescadenzario.VALORE = cg_contabileprimanota.VALORE
												  AND ABS(DATEDIFF(cg_contabilescadenzario.DATA, cg_flussibanca.DATA))  <  60
			SET CG_CT_CONTABILESCADENZARIO = cg_contabilescadenzario.ID 
			WHERE CG_CT_CONTABILESCADENZARIO IS NULL";
	WFSQL($sql);
	
	$sql = "UPDATE IGNORE  cg_flussibanca 
				INNER JOIN cg_pianoconti ON cg_pianoconti.CT_ANAGRAFICHE = cg_flussibanca.CT_ANAGRAFICHE 
				INNER JOIN cg_contabileprimanota ON cg_contabileprimanota.CG_CT_PIANOCONTI = cg_pianoconti.ID
				INNER JOIN cg_contabilescadenzario ON cg_contabilescadenzario.CG_CT_CONTABILE = cg_contabileprimanota.CG_CT_CONTABILE 
												  AND cg_contabilescadenzario.VALORE = cg_contabileprimanota.VALORE
												  AND ABS(DATEDIFF(cg_contabilescadenzario.DATA, cg_flussibanca.DATA))  <  90
			SET CG_CT_CONTABILESCADENZARIO = cg_contabilescadenzario.ID 
			WHERE CG_CT_CONTABILESCADENZARIO IS NULL";
	WFSQL($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca 
				INNER JOIN cg_pianoconti ON cg_pianoconti.CT_ANAGRAFICHE = cg_flussibanca.CT_ANAGRAFICHE 
				INNER JOIN cg_contabileprimanota ON cg_contabileprimanota.CG_CT_PIANOCONTI = cg_pianoconti.ID
				INNER JOIN cg_contabilescadenzario ON cg_contabilescadenzario.CG_CT_CONTABILE = cg_contabileprimanota.CG_CT_CONTABILE 
												  AND cg_contabilescadenzario.VALORE = cg_contabileprimanota.VALORE
												  AND ABS(DATEDIFF(cg_contabilescadenzario.DATA, cg_flussibanca.DATA))  <  120
			SET CG_CT_CONTABILESCADENZARIO = cg_contabilescadenzario.ID 
			WHERE CG_CT_CONTABILESCADENZARIO IS NULL";
	WFSQL($sql);
	
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN cg_pianoconti ON cg_pianoconti.CT_ANAGRAFICHE = cg_flussibanca.CT_ANAGRAFICHE 
				INNER JOIN cg_contabileprimanota ON cg_contabileprimanota.CG_CT_PIANOCONTI = cg_pianoconti.ID
				INNER JOIN cg_contabilescadenzario ON cg_contabilescadenzario.CG_CT_CONTABILE = cg_contabileprimanota.CG_CT_CONTABILE 
												  AND cg_contabilescadenzario.VALORE = cg_contabileprimanota.VALORE
												  AND ABS(DATEDIFF(cg_contabilescadenzario.DATA, cg_flussibanca.DATA))  <  180
			SET CG_CT_CONTABILESCADENZARIO = cg_contabilescadenzario.ID 
			WHERE CG_CT_CONTABILESCADENZARIO IS NULL";
	WFSQL($sql);
	
	
	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN fat ON cg_flussibanca.DESCRIZIONE LIKE CONCAT('% ', fat.DOCNUM , ' %')
			SET CT_FAT = fat.ID
			WHERE fat.SEGNO < 0 
				AND cg_flussibanca.CG_CT_CONTABILESCADENZARIO is null
				AND cg_flussibanca.TIPO IN (26,31,50,48)";
	WFSQL($sql);

	$sql = "UPDATE IGNORE cg_flussibanca
				INNER JOIN cg_pianoconti ON cg_pianoconti.CT_ANAGRAFICHE = cg_flussibanca.CT_ANAGRAFICHE 
				INNER JOIN cg_contabileprimanota ON cg_contabileprimanota.CG_CT_PIANOCONTI = cg_pianoconti.ID
				INNER JOIN cg_contabile ON cg_contabileprimanota.CG_CT_CONTABILE = cg_contabile.ID
				INNER JOIN cg_contabilescadenzario ON cg_contabilescadenzario.ID = cg_flussibanca.CG_CT_CONTABILESCADENZARIO 
			SET cg_flussibanca.CT_FAT = cg_contabile.CT_FAT 
			WHERE cg_flussibanca.CT_FAT IS NULL";
	WFSQL($sql);

	$sql = "UPDATE IGNORE  cg_flussibanca
				INNER JOIN fat ON cg_flussibanca.CT_FAT = fat.ID 
			SET cg_flussibanca.CT_ANAGRAFICHE = fat.CT_FATTURAZIONE";
	WFSQL($sql);

	$sql = "UPDATE IGNORE  cg_flussibanca
				INNER JOIN cg_contabile ON cg_flussibanca.CT_FAT = cg_contabile.CT_FAT 
				INNER JOIN cg_contabilescadenzario ON cg_contabilescadenzario.CG_CT_CONTABILE = cg_contabile.ID 
			SET cg_flussibanca.CG_CT_CONTABILESCADENZARIO = cg_contabilescadenzario.ID 
			WHERE cg_flussibanca.CG_CT_CONTABILESCADENZARIO IS NULL";
	WFSQL($sql);
	
	
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
	$date = new DateTime();
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
				$AppoRecord['SI'] = $date->getTimestamp();
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
				$AppoRecord['SI'] = $date->getTimestamp();
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
				$RsCBI = WFSQL($sql);
				$RCount = $RsCBI->RecordCount();
				if($RCount == 1){ $sqlC = $conn->getUPDATESql($RsCBI,$AppoRecord);}
				elseif($RCount == 0){ $sqlC = $conn->getInsertSql($RsCBI,$AppoRecord);}
				else{$message = $message . 'ERRORE ' . $AppoRecord['NOME'] . BRCRLF;}
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
		$output["messagedebug"] = $output["messagedebug"]  . "Manca abi_assuntrice" . BRCRLF;
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

class RidXML {
	var $progressivo = 0;
	var $assuntrice;
	var $code_sia = '';
	var $code_cuc = '';
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
								$writer->writeElement('Id',$intestazione['code_cuc']);
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

class SepaXML {
	var $progressivo = 0;
	var $assuntrice;
	var $code_sia = '';
	var $code_cuc = '';
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
		
		$writer->startElement('DEF:CBIBdyPaymentRequest');
		$writer->writeAttribute('xmlns', 'urn:CBI:xsd:CBIBdyPaymentRequest.00.04.00');
		$writer->writeAttribute('xmlns:DEF', 'urn:CBI:xsd:CBIBdyPaymentRequest.00.04.00');
		$writer->writeAttribute('xmlns:PMRQ', 'urn:CBI:xsd:CBIPaymentRequest.00.04.00');
		$writer->writeAttribute('xmlns:SGNT', 'urn:CBI:xsd:CBISgnInf.001.04');
			
		$writer->startElement('DEF:CBIEnvelPaymentRequest');
		$writer->startElement('DEF:CBIPaymentRequest');
			
			/***********************************************************************************/
			/* 1 GrpHdr */ {
			$writer->startElement('PMRQ:GrpHdr');
				$writer->writeElement('PMRQ:MsgId',3042); //PROGESSIVO
				$writer->writeElement('PMRQ:CreDtTm',date('Y-m-d\TH:i:s'));
				$writer->writeElement('PMRQ:NbOfTxs',$intestazione['totale_record']);
				$writer->writeElement('PMRQ:CtrlSum',$intestazione['totale_valore']/100);
				$writer->startElement('PMRQ:InitgPty');
					$writer->writeElement('PMRQ:Nm',$intestazione['ragione_soc']);
					$writer->startElement('PMRQ:Id');
						$writer->startElement('PMRQ:OrgId');
							$writer->startElement('PMRQ:Othr');
								$writer->writeElement('PMRQ:Id',$intestazione['code_cuc']);
								$writer->writeElement('PMRQ:Issr','CBI');
							$writer->endElement(); 
							$writer->startElement('PMRQ:Othr');
								$writer->writeElement('PMRQ:Id',$intestazione['codice_fiscale']);
								$writer->writeElement('PMRQ:Issr','ADE');
							$writer->endElement(); 
						$writer->endElement(); 
					$writer->endElement(); 
				$writer->endElement(); 
			$writer->endElement(); 
			}
			
			/***********************************************************************************/
			/* 2 PmtInf */ {
			$writer->startElement('PMRQ:PmtInf');
					
				$writer->writeElement('PMRQ:PmtInfId',3042);//PROGESSIVO
				$writer->writeElement('PMRQ:PmtMtd','TRA'); 
				
				/* PmtTpInf */{
				$writer->startElement('PMRQ:PmtTpInf');
					$writer->writeElement('PMRQ:InstrPrty','NORM');
					$writer->startElement('PMRQ:SvcLvl');
						$writer->writeElement('PMRQ:Cd','SEPA');
					$writer->endElement();
					$writer->startElement('PMRQ:LclInstrm');
						$writer->writeElement('PMRQ:Cd','PERI');
					$writer->endElement();
				$writer->endElement(); 
				}
				
				$writer->writeElement('PMRQ:ReqdExctnDt',WFVALUEDATELOCAL($value['scadenza'],'Y-m-d'));
				
				/* Dbtr */ {
				$writer->startElement('PMRQ:Dbtr');
				  $writer->writeElement('PMRQ:Nm',$intestazione['ragione_soc']);
				  $writer->startElement('PMRQ:PstlAdr');
					  $writer->writeElement('PMRQ:AdrLine',$intestazione['indirizzo']);
					  $writer->writeElement('PMRQ:AdrLine',$intestazione['cap'] . ' ' .$intestazione['citta'] . ' ' .$intestazione['provincia']);
				  $writer->endElement();
				$writer->endElement();}
			  
				/* DbtrAcct */ {
				$writer->startElement('PMRQ:DbtrAcct');
				  $writer->startElement('PMRQ:Id');
				  $writer->writeElement('PMRQ:IBAN',$intestazione['iban'] );
				  $writer->endElement();
				$writer->endElement();}
				
				/* DbtrAgt */ {
				$writer->startElement('PMRQ:DbtrAgt');
				  $writer->startElement('PMRQ:FinInstnId');
					$writer->startElement('PMRQ:ClrSysMmbId');
					  $writer->writeElement('PMRQ:MmbId',$intestazione['abi_assuntrice']);
					$writer->endElement();
				  $writer->endElement();
				$writer->endElement();}
				
				$writer->writeElement('PMRQ:ChrgBr','SLEV');
			  
				/* CdtTrfTxInf */ 
				foreach ($ricevute_bancarie as $value) {
				  $i = $i +1;
				  $writer->startElement('PMRQ:CdtTrfTxInf');
				  $writer->startElement('PMRQ:PmtId');{
					  $writer->writeElement('PMRQ:InstrId',$value['id']);
					  $writer->writeElement('PMRQ:EndToEndId',$intestazione['nome_supporto'] . '-' . $value['scadenzaid']);
				  $writer->endElement();}
				  
				  $writer->startElement('PMRQ:PmtTpInf');{
					  $writer->startElement('PMRQ:CtgyPurp');
						  $writer->writeElement('PMRQ:Cd','SUPP'); //TIPOPAGA  SUPP   SALA
					  $writer->endElement();
				  $writer->endElement();}
				  
				  $writer->startElement('PMRQ:Amt');{
					$writer->startElement('PMRQ:InstdAmt');
						$writer->writeAttribute('Ccy', 'EUR');
						$writer->text($value['importo'] / 100);
					$writer->endElement();
				  $writer->endElement();}
				  
				  $writer->startElement('PMRQ:Cdtr');{
					  $writer->writeElement('PMRQ:Nm', $value['nome_debitore']); //DESTINATARIO NOME
					  $writer->startElement('PMRQ:PstlAdr');
						  $writer->writeElement('PMRQ:AdrLine',$value['indirizzo_debitore']);
						  $writer->writeElement('PMRQ:AdrLine',$value['cap_debitore'] . ' ' .$value['comune_debitore'] . ' ' . $value['provincia_debitore']);
					  $writer->endElement();
					  $writer->startElement('PMRQ:Id');
						  $writer->startElement('PMRQ:PrvtId');
							  $writer->startElement('PMRQ:Othr');
								  $writer->writeElement('PMRQ:Id',$value['codice_fiscale_debitore']);
								  $writer->writeElement('PMRQ:Issr','ADE');
							  $writer->endElement();
						  $writer->endElement();
					  $writer->endElement();
				  $writer->endElement();}
				  
				  $writer->startElement('PMRQ:CdtrAcct');{
					  $writer->startElement('PMRQ:Id');
						  $writer->writeElement('PMRQ:IBAN', $value['iban']); //DESTINATARIO IBAN
					$writer->endElement();
				  $writer->endElement();}
				  
				  $writer->startElement('PMRQ:RmtInf');{
					  $writer->writeElement('PMRQ:Ustrd', $value['causale']); //causale
				  $writer->endElement();}
				  
				  $writer->endElement();
				}
	  
				$writer->endElement();
			  $writer->endElement(); 
			}
		
		$writer->endElement();
		$writer->endElement();
		$writer->endElement(); 	
		return $writer->flush(true);
	}
}
?>