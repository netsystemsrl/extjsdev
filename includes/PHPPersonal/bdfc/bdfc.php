<?php
function BDFCgetUserByCf($username, $password, $idScuola, $cf, $timeout = 30) {
	$wsdlurl = 'http://ws.bancadatiformazionecostruzioni.it/server.php?wsdl';
	ini_set("soap.wsdl_cache_enabled", 0);
	header("Content-Type:text/xml;charset=UTF-8");
	$client = new SoapClient($wsdlurl);
	
	$input= array("search" => $cf,"username" => $username, "password" => $password, "idScuola" => $idScuola);	
	$risposta= $client->__soapCall("getUserByCf", $input);
	return $risposta;
	
}

function BDFCgetLibretto($username, $password, $idScuola, $cf, $timeout = 30) {
	$wsdlurl = 'http://ws.bancadatiformazionecostruzioni.it/server.php?wsdl';
	ini_set("soap.wsdl_cache_enabled", 0);
	header("Content-Type:text/xml;charset=UTF-8");
	$client = new SoapClient($wsdlurl);
	
	$input= array("search" => $cf,"username" => $username, "password" => $password, "idScuola" => $idScuola);	
	$risposta= $client->__soapCall("getLibretto", $input);
	return $risposta;
}

function BDFCEdizioneXML($EdizioneID){
	global $conn;
	global $ExtJSDevExportRAW;
	
	
	$writer = new XMLWriter();  
	$writer->openMemory();
	$writer->startDocument('1.0','UTF-8');  
	$writer->setIndent(4); 

	
	/* START ALL*/
	$writer->startElementNs('p', 'interscambio',null);
	$writer->writeAttribute('versione','10'); 
	$writer->writeAttributeNs('xmlns', 'ds', null, 'http://www.w3.org/2000/09/xmldsig#' );
	$writer->writeAttributeNs('xmlns', 'xsi', null, 'http://www.w3.org/2001/XMLSchema-instance'); 
	
	
	/***********************************************************************************/
	/* 1 FatturaElettronicaHeader */{
	$writer->startElement('FatturaElettronicaHeader');

		/* DatiTrasmissione */ {
		$writer->startElement('corso');
			$writer->writeElement('sys_scuola_id', 'SI1881BASE08'); 
			$writer->writeElement('scuola_id', '23'); 
			$writer->writeElement('tipo_corso',  '1030120');
			 //cpt="1"
			$writer->writeElement('FormatoTrasmissione', $FormatoTrasmissione);
			
			$writer->startElement('attributi_corso');
				$writer->writeElement('tirocinio',  '0');
				$writer->writeElement('processo_valutativo',  '1');
				$writer->writeElement('progetto_formedil',  '');
			$writer->endElement();
			
			$writer->writeElement('nome_corso',  'Formazione contrattuale per la sicurezza');
			$writer->writeElement('durata',  '16');
			$writer->writeElement('data_inizio',  '2018-09-06');
			$writer->writeElement('data_fine',  '2018-09-06');
			$writer->writeElement('m_formative',  '3');
			$writer->writeElement('sede',  'Sede di Reggio Emilia');
			$writer->writeElement('attestazione',  '1');
			
			$writer->startElement('finanziamento');
				$writer->writeElement('canale',  '4');
				//tipo="1">4
				$writer->writeElement('tipologia_fondo_interprof',  '');
			$writer->endElement();
			
			$writer->startElement('ud');
				$writer->writeElement('ud', '108');
			$writer->endElement();
			
			$writer->startElement('uc');
				$writer->writeElement('uc', '108');
			$writer->endElement();
			
			$writer->startElement('ad');
				$writer->writeElement('ad', '83');
			$writer->endElement();
			
			$writer->startElement('studenti');
				$writer->startElement('studente');
					$writer->writeElement('cf', 'LMTMMD98E20Z336Y');
					$writer->writeElement('cf_provvisorio', '0');
					$writer->writeElement('cognome', 'ELAMOUTY');
					$writer->writeElement('nome', 'MAHMOUD ELSAYED MAHMOUD');
					$writer->writeElement('cittadinanza', 'Z336');
					$writer->writeElement('sesso', 'M');
					$writer->startElement('nascita');
						$writer->writeElement('stato', 'Z336');
						$writer->writeElement('comune', 'Z336');
						$writer->writeElement('data', '1998-05-20');
					$writer->endElement();
					$writer->startElement('residenza');
					//domicilio="0"
						$writer->writeElement('indirizzo', '');
						$writer->writeElement('H223', '');
						$writer->writeElement('Z998', '');
						$writer->writeElement('cap', '');
					$writer->endElement();
					$writer->startElement('contatti');
						$writer->writeElement('telefono', '');
						$writer->writeElement('cellulare', '');
						$writer->writeElement('fax', '');
						$writer->writeElement('email', '');
					$writer->endElement();
					$writer->writeElement('status', '1');
					$writer->writeElement('qualifica', '1');
					$writer->startElement('impresa');
						$writer->writeElement('soggetto', '1');
						$writer->writeElement('denominazione', 'ISOTECH');
						$writer->writeElement('cassa', '11');
						$writer->writeElement('ccnl', '1');
						$writer->writeElement('tipologia_impresa', '1');
						$writer->writeElement('cf_impresa', '02533030355');
						$writer->writeElement('piva', '02533030355');
						$writer->writeElement('sede_legale operativa', '0');
							$writer->writeElement('indirizzo', 'VIA F-LLI MANFREDI 11');
							$writer->writeElement('comune', 'H223');
							$writer->writeElement('stato', 'Z998');
							$writer->writeElement('cap', '42121');
							$writer->writeElement('telefono', '0522-271322');
							$writer->writeElement('fax', '0522-503326');
							$writer->writeElement('email', 'isotechsrl@gmail.com');
						$writer->endElement();
						$writer->writeElement('tip_pa','');
						$writer->writeElement('registro_imprese', '02533030355');
						$writer->endElement();
					$writer->endElement();
					$writer->startElement('ud');
						$writer->writeElement('ud', 'SIC_GENERALE');
						$writer->writeElement('ud', 'SIC_SPECIFIC');
					$writer->endElement();
					$writer->startElement('uc');
					$writer->startElement('ad');
						$writer->writeElement('ad', '83');
					$writer->endElement();
						$writer->writeElement('frequenza', '2');
					$writer->writeElement('proc_valutativo', '1');
				$writer->endElement();
			$writer->endElement();
		$writer->endElement();  
		}

	/*END ALL*/
	$writer->endElement();
	if ($FileName == '') $FileName =  $EdizioneID .'.xml';
	file_put_contents($ExtJSDevExportRAW . 'bdfc/' . $FileName, $writer->flush(true), FILE_APPEND);
	
	return $ExtJSDevExportRAW . 'bdfc/' . $FileName;
}
	
function BDFCInviaEdizione($username, $password, $idScuola, $filexml, $timeout = 30) {
	$wsdlurl = 'http://ws.bancadatiformazionecostruzioni.it/server.php?wsdl';
	ini_set("soap.wsdl_cache_enabled", 0);
	header("Content-Type:text/xml;charset=UTF-8");
	$client = new SoapClient($wsdlurl);
	
	$input= array("xml" => $xmlstr, "idScuola" => $idScuola, "nomeFile" => $nomeFile, "username" => $username, "password" => $password);	
	$risposta= $client->__soapCall("setInterscambio", $input);
	return $risposta;
}
?>