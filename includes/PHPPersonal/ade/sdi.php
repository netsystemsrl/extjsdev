<?php		
//https://fex-app.com/servizi/verifica#block
function SDIEncodeFatturaXML($FatID, $SdiProgressivo, $FileName = '') {
	global $conn;
	global $ExtJSDevExportRAW;
	global $output;
	global $ExtJSDevDOC;
	
	$Fattura = WFVALUEDLOOKUP('*', 'fat', 'ID = ' . $FatID);

	/* Enumera righe  */ 
	$StrSQL = "SELECT *
				FROM fatmovimenti 
				WHERE fatmovimenti.CT_FAT = " . $Fattura['ID'] ."
				ORDER BY RIGA, ID "; 
	$rsFatMov = $conn->Execute($StrSQL);
	$i = 1;
	while (!$rsFatMov->EOF) {
		if (IsNullOrEmptyOrZeroString($rsFatMov->fields['RIGA'])){
			$AppoRecord = array();
			$AppoRecord['RIGA'] = $i;
			$conn->AutoExecute('fatmovimenti', $AppoRecord, 'UPDATE', 'ID = ' . $rsFatMov->fields['ID']);
		}else{
			$i  = $rsFatMov->fields['RIGA'];
		}
		$i  = $i +1;
		$rsFatMov->MoveNext();
	}
	$rsFatMov->Close();
	
	$SdiProgressivo = str_pad($SdiProgressivo,5,'0',STR_PAD_LEFT);
	
	if (IsNullOrEmptyOrZeroString($Fattura['SDI_TD'])){
		$output['message'] = $output['message'] . 'SDI_TD non inserito o non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	$SDITipoDoc = WFVALUEDLOOKUP('*', 'cg_sditipidoc', "ID = '" . $Fattura['SDI_TD'] ."'");
	
	$MeStessoAzienda = WFVALUEDLOOKUP('*','anagrafiche','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'));
	if ($MeStessoAzienda == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICAAZIENDA  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	$AnagraficaCLIFAT = WFVALUEDLOOKUP('*', 'anagrafiche', 'ID = ' . $Fattura['CT_FATTURAZIONE']);
	if ($AnagraficaCLIFAT == ''){
		$output['message'] = $output['message'] . 'Fattura ' . $FatID . 'Intestatario non definito';
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	$NazioneCLIFAT  = WFVALUEDLOOKUP('*','nazioni',"ID = '"  . $AnagraficaCLIFAT['NAZIONE'] . "'" );
	if ($NazioneCLIFAT == ''){
		$output['message'] = $output['message'] . 'Variabile Nazione non definito in INDIRIZZO'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	$NazioneCLIFAT  = WFVALUEDLOOKUP('*','nazioni',"ID = '"  . $AnagraficaCLIFAT['PIVANAZIONE'] . "'" );
	if ($NazioneCLIFAT == ''){
		$output['message'] = $output['message'] . 'Variabile Nazione non definito in PIVA'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	if( $NazioneCLIFAT['UE'] === true){
		if ($NazioneCLIFAT['ID'] == 'IT'){
			if(!IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['PIVA']) && (IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['CF'])) )  {
				$output['message'] = $output['message'] . 'Variabile PIVA O CF non definito, in caso di azienda italiana entrambi i campi CF e PIVA vanno valorizzati'.BRCRLF;
				$output['failure'] = true;
				$output['success'] = false;
				return;
			}
			if(IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['PIVA']) && (IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['CF'])) )  {
				$output['message'] = $output['message'] . 'Variabile PIVA E/O CF non definito'.BRCRLF;
				$output['failure'] = true;
				$output['success'] = false;
				return;
			}
			if(IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['PIVA']) && !(IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['CF'])) )  {
				//SONO IN UN PRIVATO
				if ($AnagraficaCLIFAT['FATSDINUM'] != '0000000') {
					$output['message'] = $output['message'] . 'In caso di PRIVATO imposta come codice SDI 0000000'.BRCRLF;
					$output['failure'] = true;
					$output['success'] = false;
					return;
				}
			}else{
				//SONO IN UNA AZIENDA
				if (IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['FATSDINUM'])) {
					$output['message'] = $output['message'] . 'In caso di AZIENDA imposta come codice SDI 0000000 per invio automatica, altrimenti contatta il tuo Cliente'.BRCRLF;
					$output['failure'] = true;
					$output['success'] = false;
					return;
				}
			}
		}else{
			if(IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['PIVA'])){
				$output['message'] = $output['message'] . 'Nazione cliente UE richiesta PIVA - VAT Number'.BRCRLF;
				$output['failure'] = true;
				$output['success'] = false;
				return;
			}
		}
	}
						
	if (($AnagraficaCLIFAT['PIVANAZIONE'] != 'IT') && ($AnagraficaCLIFAT['PIVANAZIONE'] != 'SM') && ($AnagraficaCLIFAT['FATSDINUM'] != 'XXXXXXX')){
		//SONO IN UNA AZIENDA ESTERA
		$output['message'] = $output['message'] . 'Anagrafica ' .  $AnagraficaCLIFAT['DESCRIZIONE'] . '  ESTERA NON IMPOSTATA A XXXXXXX !!'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	$BancaContoPC = '';
	$IVACLIFAT  = '';
	if ($AnagraficaCLIFAT['CT_ALIQUOTE']) {
		$IVACLIFAT  = WFVALUEDLOOKUP('*','aliquote','ID = '  . $AnagraficaCLIFAT['CT_ALIQUOTE'] );
		if ($IVACLIFAT == ''){
			$output['message'] = $output['message'] . 'IVA in anagrafica cliente non abbinata o non esistente'.BRCRLF;
			$output['failure'] = true;
			$output['success'] = false;
			return;
		}
	}else{
		$output['message'] = $output['message'] . 'IVA in anagrafica cliente non abbinata o non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	
	$AnagraficaCLISPE = '';
	if ($Fattura['CT_SPEDIZIONE']){
		$AnagraficaCLISPE = WFVALUEDLOOKUP('*', 'anagrafiche', 'ID = ' . $Fattura['CT_SPEDIZIONE']);
	}
	
	$Causale = WFVALUEDLOOKUP('*','causali','ID = '  . $Fattura['CT_CAUSALI'] );
	
	$BancaPC  = '';
	if (!IsNullOrEmptyOrZeroString($Fattura['CT_BANCA'])){
		$BancaContoPC  = WFVALUEDLOOKUP('*','cg_pianoconti','ID = '  . $Fattura['CT_BANCA'] );
		if ($BancaContoPC == ''){
			$output['message'] = $output['message'] . 'Banca in fattura non definita'.BRCRLF;
			$output['failure'] = true;
			$output['success'] = false;
			return;
		}
	}
	
	$Aspettobeni  = '';
	if ($Fattura['CT_ASPETTOBENI']){
		$Aspettobeni  = WFVALUEDLOOKUP('*','aspettobeni','ID = '  . $Fattura['CT_ASPETTOBENI'] );
	}
	
	$writer = new XMLWriter();  
	$writer->openMemory();
	$writer->startDocument('1.0','UTF-8');  
	$writer->setIndent(4); 

	$FormatoTrasmissione = 'FPR12'; // . strlen($AnagraficaCLIFAT['FATSDINUM']);
	if (strlen($AnagraficaCLIFAT['FATSDINUM']) == 6){//-> Stato
		$FormatoTrasmissione = 'FPA12';
	}
	
	
	/* START ALL*/
	$writer->startElementNs('p', 'FatturaElettronica',null);
	$writer->writeAttribute('versione',$FormatoTrasmissione); 
	$writer->writeAttributeNs('xml-stylesheet', 'type="text/xsl" href="fatturaordinaria_v1.2.1.xsl"' );
	
	$writer->writeAttributeNs('xmlns', 'ds', null, 'http://www.w3.org/2000/09/xmldsig#' );
	$writer->writeAttributeNs('xmlns', 'p', null, 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2'); 
	$writer->writeAttributeNs('xmlns', 'xsi', null, 'http://www.w3.org/2001/XMLSchema-instance'); 
	$writer->writeAttributeNs('xsi', 'schemaLocation', null, 'http://www.fatturapa.gov.it/docs/xsd/fatture/v1.2 fatturaordinaria_v1.2.xsd'); 


	/***********************************************************************************/
	/* 1 FatturaElettronicaHeader */{
	$writer->startElement('FatturaElettronicaHeader');

		/* DatiTrasmissione */ {
		$writer->startElement('DatiTrasmissione');
			$writer->startElement('IdTrasmittente');
				$writer->writeElement('IdPaese', $MeStessoAzienda['PIVANAZIONE']); 
				if (!IsNullOrEmptyOrZeroString($MeStessoAzienda['CF'])) {
					$writer->writeElement('IdCodice', $MeStessoAzienda['CF']); 
				}else{
					$writer->writeElement('IdCodice', $MeStessoAzienda['PIVA']); 
				}
			$writer->endElement();  
			$writer->writeElement('ProgressivoInvio',  $SdiProgressivo);
			
			$writer->writeElement('FormatoTrasmissione', $FormatoTrasmissione);
			
			
			if ($SDITipoDoc['REVERSE']) {
				if (!IsNullOrEmptyOrZeroString($MeStessoAzienda['FATSDINUM'])){
					if (!IsNullOrEmptyOrZeroString($MeStessoAzienda['FATSDINUM'])) {
						$writer->writeElement('CodiceDestinatario', $MeStessoAzienda['FATSDINUM']); 
					}else{
						$writer->writeElement('CodiceDestinatario', '0000000'); 
					}
				}else{
					$writer->writeElement('CodiceDestinatario', '0000000'); 
				}
				if (!IsNullOrEmptyOrZeroString($MeStessoAzienda['PEC'])) {
					$writer->writeElement('PECDestinatario', $MeStessoAzienda['PEC']);
				}
			}else{
				if (!IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['FATSDINUM'])){
					if (!IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['FATSDINUM'])) {
						$writer->writeElement('CodiceDestinatario', $AnagraficaCLIFAT['FATSDINUM']); 
					}else{
						$writer->writeElement('CodiceDestinatario', '0000000'); 
					}
				}else{
					$writer->writeElement('CodiceDestinatario', '0000000'); 
				}
				if (!IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['PEC'])) {
					$writer->writeElement('PECDestinatario', $AnagraficaCLIFAT['PEC']);
				}
			}
			/* ContattiTrasmittente 
			$writer->startElement('ContattiTrasmittente');
                if (!IsNullOrEmptyOrZeroString($MeStessoAzienda['TELEFONO'])) {
					$MeStessoAzienda['TELEFONO'] = str_replace(' ', '', $MeStessoAzienda['TELEFONO']);
					$writer->writeElement('Telefono', $MeStessoAzienda['TELEFONO']); 
				}																						  
                if (!IsNullOrEmptyOrZeroString($MeStessoAzienda['EMAIL'])) {
					$writer->writeElement('Email', $MeStessoAzienda['EMAIL']); 
				}
            $writer->endElement();
			*/
			
		$writer->endElement();  
		}
	
		$Cedente = $MeStessoAzienda;
		$Committente = $AnagraficaCLIFAT;
		if ($SDITipoDoc['REVERSE']) {
			$Cedente = $AnagraficaCLIFAT;
			$Committente = $MeStessoAzienda;
		}
		
		/* 1.2   <CedentePrestatore>	*/ {
		$writer->startElement('CedentePrestatore');
			$writer->startElement('DatiAnagrafici');
				if (!IsNullOrEmptyOrZeroString($Cedente['PIVA'])) {
					$writer->startElement('IdFiscaleIVA');
						$writer->writeElement('IdPaese',  $Cedente['PIVANAZIONE']); 
						$writer->writeElement('IdCodice', $Cedente['PIVA']); 
					$writer->endElement(); 
				}else{
					$writer->startElement('IdFiscaleIVA');
						$writer->writeElement('IdPaese',  $Cedente['PIVANAZIONE']); 
						$writer->writeElement('IdCodice', '0000000'); 
					$writer->endElement(); 
				}
				if (!IsNullOrEmptyOrZeroString($Cedente['CF'])) {
					$writer->writeElement('CodiceFiscale', $Cedente['CF']);  
				}
				$writer->startElement('Anagrafica');
					$writer->writeElement('Denominazione', $Cedente['DESCRIZIONE']);
				$writer->endElement();  
				if (!IsNullOrEmptyOrZeroString($Cedente['SDI_REGIME'])){
					$writer->writeElement('RegimeFiscale', $Cedente['SDI_REGIME']);
				}else{
					$writer->writeElement('RegimeFiscale', 'RF01');
				}
			$writer->endElement(); 
			$writer->startElement('Sede');
				$writer->writeElement('Indirizzo', sanitize($Cedente['INDIRIZZO'] . $Cedente['INDIRIZZO2'],"IsBasicLatin",60));
				if ($Cedente['NAZIONE'] == 'IT'){
					$writer->writeElement('CAP', str_pad($Cedente['CAP'], 5, "0", STR_PAD_LEFT)); 
					$writer->writeElement('Comune', $Cedente['CITTA']); 
					$writer->writeElement('Provincia', $Cedente['PROVINCIA']); 
				}else{
					$writer->writeElement('CAP', '99999');
					$writer->writeElement('Comune', $Cedente['CITTA']); 
				}
			$writer->writeElement('Nazione', $Cedente['NAZIONE']); 
			$writer->endElement(); 
			//IscrizioneREA
			if ($Cedente['NAZIONE'] == 'IT'){
				$writer->startElement('IscrizioneREA');
					$writer->writeElement('Ufficio', $Cedente['PROVINCIA']);
					$writer->writeElement('NumeroREA', $Cedente['PIVA']);
					if (!IsNullOrEmptyOrZeroString($Cedente['CAPSOC'])){
						$writer->writeElement('CapitaleSociale', $Cedente['CAPSOC']);
					}
					$writer->writeElement('SocioUnico', 'SM');
					$writer->writeElement('StatoLiquidazione', 'LN');
				$writer->endElement(); 
			}
			//Contatti
			$writer->startElement('Contatti');
				if (!IsNullOrEmptyOrZeroString($Cedente['TELEFONO'])){
					$writer->writeElement('Telefono', $Cedente['TELEFONO']);
				}
				if (!IsNullOrEmptyOrZeroString($Cedente['FAX'])){
					$writer->writeElement('Fax', $Cedente['FAX']);
				}
				if (!IsNullOrEmptyOrZeroString($Cedente['EMAIL'])){
					$writer->writeElement('Email', $Cedente['EMAIL']);
				}
			$writer->endElement(); 
		$writer->endElement();  
		}
		
		/* 1.3   <RappresentanteFiscale>	 */ {	
		}					

		/* 1.4   <CessionarioCommittente>	 */ {
		$writer->startElement('CessionarioCommittente');
			$writer->startElement('DatiAnagrafici');
				if($Committente['PIVANAZIONE'] == 'IT'){
					if (!IsNullOrEmptyOrZeroString($Committente['PIVA'])) {
						$writer->startElement('IdFiscaleIVA');
							$writer->writeElement('IdPaese', $Committente['PIVANAZIONE']);
							$writer->writeElement('IdCodice', $Committente['PIVA']);
						$writer->endElement(); 
					}
					if (!IsNullOrEmptyOrZeroString($Committente['CF'])) {
						$writer->writeElement('CodiceFiscale', $Committente['CF']); 
					}
				}else{					
					$writer->startElement('IdFiscaleIVA');
						if(( $NazioneCLIFAT['UE']) == true){
							$writer->writeElement('IdPaese', $Committente['PIVANAZIONE']);
							$writer->writeElement('IdCodice', $Committente['PIVA']);
						}else{
							//estero
							$writer->writeElement('IdPaese', IsNull($Committente['PIVANAZIONE'],'OO'));
							if (strlen($Committente['PIVA'])>28)  {$Committente['PIVA'] = '';}
							$writer->writeElement('IdCodice', IsNull($Committente['PIVA'],'99999999999'));
						}
					$writer->endElement(); 
				}
				
				$writer->startElement('Anagrafica');
					$writer->writeElement('Denominazione', $Committente['DESCRIZIONE']); 
				$writer->endElement(); 
			$writer->endElement();  
			
			$writer->startElement('Sede');
				$writer->writeElement('Indirizzo', sanitize($Committente['INDIRIZZO'] . $Committente['INDIRIZZO2'],"IsBasicLatin",60));
				if ($Committente['NAZIONE'] == 'IT'){
					$writer->writeElement('CAP', $Committente['CAP']); 
					$writer->writeElement('Comune', $Committente['CITTA']);  
					$writer->writeElement('Provincia', $Committente['PROVINCIA']); 
				}else{
					$writer->writeElement('CAP', '99999');
					$writer->writeElement('Comune', $Committente['CITTA']);  
				} 
				$writer->writeElement('Nazione', $Committente['NAZIONE']); 
			$writer->endElement();  
		$writer->endElement();  
		}
		
		/* 1.5   <TerzoIntermediarioOSoggettoEmittente>	 */ {
		$writer->startElement('TerzoIntermediarioOSoggettoEmittente');
			$writer->startElement('DatiAnagrafici');
				if (!IsNullOrEmptyOrZeroString($Cedente['PIVA'])) {
					$writer->startElement('IdFiscaleIVA');
						$writer->writeElement('IdPaese',  $Cedente['PIVANAZIONE']); 
						$writer->writeElement('IdCodice', $Cedente['PIVA']); 
					$writer->endElement(); 
				}
				if (!IsNullOrEmptyOrZeroString($Cedente['CF'])) {
					$writer->writeElement('CodiceFiscale', $Cedente['CF']);  
				}
				$writer->startElement('Anagrafica');
					$writer->writeElement('Denominazione', $Cedente['DESCRIZIONE']);
					//$writer->writeElement('Nome', $Cedente['DESCRIZIONE']);
					//$writer->writeElement('Cognome', $Cedente['DESCRIZIONE']);
					//$writer->writeElement('Titolo', $Cedente['DESCRIZIONE']);
					//$writer->writeElement('CodEORI', $Cedente['DESCRIZIONE']);
				$writer->endElement(); 
			$writer->endElement();  
		$writer->endElement();  
		}
		
		/* 1.6   <SoggettoEmittente> */
		
	$writer->endElement();
	}

	/***********************************************************************************/
	/* 2 FatturaElettronicaBody  */ {
	$writer->startElement('FatturaElettronicaBody');
	
		/* 2.1 DatiGenerali   */ {
		$writer->startElement('DatiGenerali');

			/* 2.1.1.2 DatiGeneraliDocumento  */ {
			$writer->startElement('DatiGeneraliDocumento');			
				/* 2.1.1.1   TipoDocumento */
				$writer->writeElement('TipoDocumento', $SDITipoDoc['ID']); 
				$writer->writeElement('Divisa', 'EUR'); 
				$writer->writeElement('Data', $Fattura['DOCDATA']); 
				$writer->writeElement('Numero', $Fattura['DOCNUM']);
			
				/* 2.1.1.5 DatiRitenuta */ 
				if (!IsNullOrEmptyOrZeroString($Fattura['RITENUTATIPO'])){
					$writer->startElement('DatiRitenuta');
						$writer->writeElement('TipoRitenuta', $Fattura['RITENUTATIPO']);
						$writer->writeElement('ImportoRitenuta', $Fattura['RITENUTAIMPORTO']);
						$writer->writeElement('AliquotaRitenuta', $Fattura['RITENUTAALIQUOTA']);
						$writer->writeElement('CausalePagamento', $Fattura['RITENUTACAUSALEPAGAMENTO']);
					$writer->endElement();  
				}

				/* 2.1.1.6 DatiBollo  */  
				if (!IsNullOrEmptyOrZeroString($Fattura['BOLLOVIRTUALE'])){
					$writer->startElement('DatiBollo');
						$writer->writeElement('BolloVirtuale', 'SI');
						$writer->writeElement('ImportoBollo', $Fattura['BOLLOIMPORTO']);
					$writer->endElement();  
				}
				
				/* 2.1.1.7 DatiCassaPrevidenziale */ 
				if (!IsNullOrEmptyOrZeroString($Fattura['CASSAPRETIPO'])){
					$writer->startElement('DatiCassaPrevidenziale');
						$writer->writeElement('TipoCassa', $Fattura['CASSAPRETIPO']);
						$writer->writeElement('AlCassa', $Fattura['CASSAPREAL']);
						$writer->writeElement('ImportoContributoCassa', $Fattura['CASSAPREIMPORTOCONTRIBUTO']);
						$writer->writeElement('ImponibileCassa', $Fattura['CASSAPREIMPONIBILE']);
						$writer->writeElement('AliquotaIVA', $Fattura['CASSAPREALIQUOTAIVA']);
						$writer->writeElement('Ritenuta', $Fattura['CASSAPRERITENUTA']);
						$writer->writeElement('Natura', $Fattura['CASSAPRENATURA']);
						$writer->writeElement('RiferimentoAmministrazione', '');
					$writer->endElement();
				}
				
				/* 2.1.1.8   <ScontoMaggiorazione> */ 
				if (!IsNullOrEmptyOrZeroString($Fattura['SCONTOMAGTOTALE'])){
					$writer->startElement('ScontoMaggiorazione');
					if($Fattura['SCONTOMAGTOTALE'] < 0){
						$writer->writeElement('Tipo','SC');
						$writer->writeElement('Importo', CdecSTD($Fattura['SCONTOMAGTOTALE']  * -1,2));
					}else{
						$writer->writeElement('Tipo','MG');
						$writer->writeElement('Importo', CdecSTD($Fattura['SCONTOMAGTOTALE'],2));
					}
					$writer->endElement(); 
				}
			
				
				/* 2.1.1.9   <ImportoTotaleDocumento>*/ 
				if ($SDITipoDoc['ID'] != 'TD04') {
					$writer->writeElement('ImportoTotaleDocumento', CdecSTD($Fattura['VALORETOTALE'],2));
				}else{
					$writer->writeElement('ImportoTotaleDocumento', CdecSTD($Fattura['VALORETOTALE'] * -1,2));
				}

				/* 2.1.1.11   <Causale>*/ 
				if (!IsNullOrEmptyOrZeroString($Fattura['CG_CT_CONTABILEPLAFOND'])){
					$Plafond = WFVALUEDLOOKUP('*', 'cg_contabileplafond', 'ID = ' . $Fattura['CG_CT_CONTABILEPLAFOND']);
					$writer->writeElement('Causale', 'Plafond : ' . $Plafond['DESCRIZIONE'] . ' ' . $Plafond['LETTERANUM']);
				}
				
				/* 2.1.1.12   <Art73> */
				// consente al cedente/prestatore l'emissione nello stesso anno  documenti aventi stesso numero
				
			$writer->endElement();  
			}
			
			/* 2.1.2   <DatiOrdineAcquisto> N Volte */{
				$OrdinePresente = false;
				
				// ordine da righe della fattura
				$StrSQL = "SELECT ord.ID as ORDID, ord.DOCNUM, ord.DOCDATA, ord.SDI_CUP, ord.SDI_CUP, ord.CT_CON,
								fatmovimenti.RIGA FATRIGA,  ordmovimenti.RIGA as ORDRIGA 
							FROM fatmovimenti  
								INNER JOIN fat ON fat.ID = fatmovimenti.CT_FAT 
								INNER JOIN ordmovimenti ON ordmovimenti.ID = fatmovimenti.CT_ORDMOVIMENTI 
								INNER JOIN ord ON ord.ID = ordmovimenti.CT_ORD 
							WHERE CT_ORDMOVIMENTI is not null 
								AND fatmovimenti.CT_FAT = " . $Fattura['ID'] ."
							GROUP BY ord.ID, fatmovimenti.ID
							ORDER BY ord.ID"; 
				$rsOrd = $conn->Execute($StrSQL);
				$i= 0;
				$OrdID = '';
				while (!$rsOrd->EOF) {
					$OrdinePresente = true;
					$writer->startElement('DatiOrdineAcquisto');
					
					/* 2.1.2.1   <RiferimentoNumeroLinea> */
					if (!IsNullOrEmptyOrZeroString($rsOrd->fields['FATRIGA'])){
						$AppoRiga =$rsOrd->fields['FATRIGA'];
						if(!IsNumeric($rsOrd->fields['FATRIGA'])){
							$AppoRiga =$rsOrd->fields['FATRIGA'];
							//$AppoRiga = str_replace('00', '', $AppoRiga); 
							$AppoRiga = str_replace(array('.', ''), '', $AppoRiga);
							if (IsNullOrEmptyOrZeroString($AppoRiga)){
								$AppoRiga = $i;
							}
						}else{
							$AppoRiga = $rsOrd->fields['FATRIGA'];
						}
						if ($AppoRiga < 9999) {
							$writer->writeElement('RiferimentoNumeroLinea', $AppoRiga);
						}
					}
					
					/* 2.1.2.2   <IdDocumento> */
					$writer->writeElement('IdDocumento', substr(StringAZ09Special($rsOrd->fields['DOCNUM']),0,19)); 
					$writer->writeElement('Data', $rsOrd->fields['DOCDATA']); 
					
					/* 2.1.2.4   <NumItem> */
					if (!IsNullOrEmptyOrZeroString($rsOrd->fields['ORDRIGA'])){
						$AppoRiga =$rsOrd->fields['ORDRIGA'];
						if(!IsNumeric($rsOrd->fields['ORDRIGA'])){
							$AppoRiga =$rsOrd->fields['ORDRIGA'];
							//$AppoRiga = str_replace('00', '', $AppoRiga); 
							$AppoRiga = str_replace(array('.', ''), '', $AppoRiga);
							if (IsNullOrEmptyOrZeroString($AppoRiga)){
								$AppoRiga = $i;
							}
						}else{
							$AppoRiga = $rsOrd->fields['ORDRIGA'];
						}
						if ($AppoRiga < 9999) {
							$writer->writeElement('NumItem', $AppoRiga);
						}
					}
					
					/* 2.1.2.5   <CodiceCommessaConvenzione> */
					if (!IsNullOrEmptyOrZeroString($rsOrd->fields['CT_CON'])){
						$Contratti = WFVALUEDLOOKUP('*', 'con', 'ID = ' . $rsOrd->fields['CT_CON']);
						if (!IsNullOrEmptyOrZeroString($Contratti['DOCNUM'])){
							$writer->writeElement('CodiceCommessaConvenzione', $Contratti['DOCNUM']);
						}
					}
					
					/* 2.1.2.6   <CodiceCUP>	 */		
					if (!IsNullOrEmptyOrZeroString($Fattura['SDI_CUP'])){
						$writer->writeElement('CodiceCUP', $Fattura['SDI_CUP']); 
					}						
					/* 2.1.2.7   <CodiceCIG>	 */	
					if (!IsNullOrEmptyOrZeroString($Fattura['SDI_CIG'])){
						$writer->writeElement('CodiceCIG', $Fattura['SDI_CIG']); 		
					}
					
					$writer->endElement(); 
					$rsOrd->MoveNext();
				}
				$rsOrd->Close();
				
				// ordine da testata della fattura
				if (!$OrdinePresente && $Fattura['CT_ORD']) {
					$OrdinePresente = true;
					$Ord = WFVALUEDLOOKUP('*', 'ord', 'ID = ' . $Fattura['CT_ORD']);
					if ($Ord == '') {
						$OrdinePresente = false;
						$output['message'] = $output['message'] . 'Ordine in testata Fattura '  . $Fattura['DOCNUM'] . ' inesistente '.BRCRLF;
						$output['failure'] = true;
						$output['success'] = false;
						return;
					}
					
					if ($OrdinePresente){
						$writer->startElement('DatiOrdineAcquisto');
						
						/* 2.1.2.2   <IdDocumento> */
						$writer->writeElement('IdDocumento', substr(StringAZ09Special($Ord['DOCNUM']),0,19)); 
						$writer->writeElement('Data', $Ord['DOCDATA']); 
						
						/* 2.1.2.5   <CodiceCommessaConvenzione> */
						if (!IsNullOrEmptyOrZeroString($Fattura['CT_CON'])){
							$Contratti = WFVALUEDLOOKUP('*', 'con', 'ID = ' . $Fattura['CT_CON']);
							if (!IsNullOrEmptyOrZeroString($Contratti['DOCNUM'])){
								$writer->writeElement('CodiceCommessaConvenzione', $Contratti['DOCNUM']);
							}
						}
						
						/* 2.1.2.6   <CodiceCUP>	 */		
						if (!IsNullOrEmptyOrZeroString($Fattura['SDI_CUP'])){
							$writer->writeElement('CodiceCUP', $Fattura['SDI_CUP']); 
						}
						
						/* 2.1.2.7   <CodiceCIG>	 */	
						if (!IsNullOrEmptyOrZeroString($Fattura['SDI_CIG'])){
							$writer->writeElement('CodiceCIG', $Fattura['SDI_CIG']); 		
						}
						
						
						$writer->endElement(); 
					}
				}
			}
			
			/* 2.1.3   <DatiContratto> */
			
			/* 2.1.4   <DatiConvenzione> */
			
			/* 2.1.5   <DatiRicezione> */
			
			/* 2.1.6   <DatiFattureCollegate> */
			if (!IsNullOrEmptyOrZeroString($Fattura['CT_FATGROUP'])){
				if ($Fattura['ID'] != $Fattura['CT_FATGROUP']){
					$StrSQL = "SELECT * FROM fat WHERE ID <> " . $Fattura['ID'] . " AND CT_FATGROUP = " . $Fattura['CT_FATGROUP']; 
					$rsFatCollegate = $conn->Execute($StrSQL);
					if ($rsFatCollegate->RecordCount() >0){
						$writer->startElement('DatiFattureCollegate');	
						while (!$rsFatCollegate->EOF) {
							if ($SDITipoDoc['REVERSE']) {
								if (!IsNullOrEmptyOrZeroString($rsFatCollegate->fields['SDI_ID'])){
									$writer->writeElement('IdDocumento', $rsFatCollegate->fields['SDI_ID']);
								}else{ 
									$writer->writeElement('IdDocumento', substr(StringAZ09Special($rsFatCollegate->fields['DOCNUM']),0,19));
								}
							}
							else{
								$writer->writeElement('IdDocumento', substr(StringAZ09Special($rsFatCollegate->fields['DOCNUM']),0,19));
							}
							$writer->writeElement('Data', $rsFatCollegate->fields['DOCDATA']);
							$rsFatCollegate->MoveNext();
						}
						$rsFatCollegate->Close();
						$writer->endElement();
					}							
				}
			}
			
			/* 2.1.7   <DatiSAL> */
			
			/* 2.1.8   <DatiDDT> */{
				$StrSQL = "SELECT fatmovimenti.ID, fatmovimenti.CT_DDTMOVIMENTI, fatmovimenti.RIGA, ddt.ID as ORDID, ddt.DOCNUM, ddt.DOCDATA
							FROM fatmovimenti  
								INNER JOIN ddtmovimenti ON ddtmovimenti.ID = fatmovimenti.CT_DDTMOVIMENTI 
								INNER JOIN ddt ON ddt.ID = ddtmovimenti.CT_DDT
							WHERE CT_DDTMOVIMENTI is not null 
								AND fatmovimenti.CT_FAT = " . $Fattura['ID'] ."
							ORDER BY CT_DDTMOVIMENTI "; 
				$rsFatMov = $conn->Execute($StrSQL);
				$i= 0;
				$OrdID = '';
				while (!$rsFatMov->EOF) {
					if ($rsFatMov->fields['ORDID'] != $OrdID){
						if ($OrdID != '') {$writer->endElement(); }
						$writer->startElement('DatiDDT');
							$writer->writeElement('NumeroDDT', $rsFatMov->fields['DOCNUM']); 
							$writer->writeElement('DataDDT', $rsFatMov->fields['DOCDATA']); 
						$OrdID = $rsFatMov->fields['ORDID'];
					}
					
					if(IsNumeric($rsFatMov->fields['RIGA']) != true){
						$AppoRiga =$rsFatMov->fields['RIGA'];
						$AppoRiga = str_replace('00', '', $AppoRiga); 
						$AppoRiga = str_replace(array('.', ''), '', $AppoRiga); 
					}else{
						$AppoRiga =$rsFatMov->fields['RIGA'];
					}
					if ($AppoRiga <9999){
						$writer->writeElement('RiferimentoNumeroLinea', $AppoRiga); 
					}
					$rsFatMov->MoveNext();
				}
				if ($OrdID != '') $writer->endElement(); 
			}
			
			/*2.1.9   <DatiTrasporto>*/
			//if ( ($Fattura['SDI_TD'] != 'TD24') || ($AnagraficaCLISPE != '') || (!IsNullOrEmptyOrZeroString($Fattura['RITIRODATAORA'])) ){
			if ($AnagraficaCLISPE != ''){
				$writer->startElement('DatiTrasporto');
					/* 2.1.9.1   <DatiAnagraficiVettore> */
					
					/* 2.1.9.2   <MezzoTrasporto>		 */		

					/* 2.1.9.3   <CausaleTrasporto>	*/	
					
					/* 2.1.9.4   <NumeroColli>		*/	
					
					/* 2.1.9.5   <Descrizione>		*/		

					/* 2.1.9.6   <UnitaMisuraPeso>	*/	
					if (!IsNullOrEmptyOrZeroString($Fattura['PESOLORDO'])){
						$writer->writeElement('UnitaMisuraPeso', 'KG'); 
					}
					/* 2.1.9.7   <PesoLordo> */
					if (!IsNullOrEmptyOrZeroString($Fattura['PESOLORDO'])  && ($Fattura['PESOLORDO'] < 9999) ){
						$writer->writeElement('PesoLordo', CdecSTD($Fattura['PESOLORDO'])); 
					}
					/* 2.1.9.8   <PesoNetto> */
					if (!IsNullOrEmptyOrZeroString($Fattura['PESONETTO'])  && ($Fattura['PESONETTO'] < 9999)){
						$writer->writeElement('PesoNetto', CdecSTD($Fattura['PESONETTO'])); 
					}
					/* 2.1.9.9   <DataOraRitiro>    */
					if (!IsNullOrEmptyOrZeroString($Fattura['RITIRODATAORA'])){
						$writer->writeElement('DataOraRitiro', $Fattura['RITIRODATAORA']); 
					}
					/* 2.1.9.10   <DataInizioTrasporto>	 */
					
					/* 2.1.9.11   <TipoResa>		INCOTERMS */
					if(!IsNullOrEmptyOrZeroString($Fattura['CT_PORTO'])){
						$porto = WFVALUEDLOOKUP('*', 'porto', 'ID = ' . $Fattura['CT_PORTO']);
						if (strlen($porto['CODICE'] == 3)){
							$writer->writeElement('TipoResa', $porto['CODICE']); 
						}
					}
					
					/* 2.1.9.12   <IndirizzoResa>			*/
					if($AnagraficaCLISPE != ''){
						$writer->startElement('IndirizzoResa');
							$writer->writeElement('Indirizzo', left(sanitize($AnagraficaCLISPE['INDIRIZZO'] . $AnagraficaCLISPE['INDIRIZZO2'],$opzioni['Type'] = "IsBasicLatin"),60)); 
							if ($AnagraficaCLISPE['NAZIONE'] == 'IT'){
								if (IsNullOrEmptyOrZeroString($AnagraficaCLISPE['CAP'])) {
									//CAP MANCANTE IN DESTINAZIONE
									$output['message'] = $output['message'] . 'Anagrafica Spedizione ' .  $AnagraficaCLISPE['DESCRIZIONE'] . ' CAP MANCANTE !!'.BRCRLF;
									$output['failure'] = true;
									$output['success'] = false;
									return;
								}
								$writer->writeElement('CAP', str_pad($AnagraficaCLISPE['CAP'], 5, "0", STR_PAD_LEFT));
								
								if (IsNullOrEmptyOrZeroString($AnagraficaCLISPE['CITTA'])) {
									//CITTA MANCANTE IN DESTINAZIONE
									$output['message'] = $output['message'] . 'Anagrafica Spedizione ' .  $AnagraficaCLISPE['DESCRIZIONE'] . ' CITTA MANCANTE !!'.BRCRLF;
									$output['failure'] = true;
									$output['success'] = false;
									return;
								}
								$writer->writeElement('Comune', $AnagraficaCLISPE['CITTA']);  
								
								if (IsNullOrEmptyOrZeroString($AnagraficaCLISPE['PROVINCIA'])) {
									//PROVINCIA MANCANTE IN DESTINAZIONE
									$output['message'] = $output['message'] . 'Anagrafica Spedizione ' .  $AnagraficaCLISPE['DESCRIZIONE'] . ' PROVINCIA MANCANTE !!'.BRCRLF;
									$output['failure'] = true;
									$output['success'] = false;
									return;
								}
								$writer->writeElement('Provincia', $AnagraficaCLISPE['PROVINCIA']); 
							}
							else{
								$writer->writeElement('CAP', '99999');
								$writer->writeElement('Comune', $AnagraficaCLISPE['CITTA']);  
							} 
							$writer->writeElement('Nazione', $AnagraficaCLISPE['NAZIONE']); 
						$writer->endElement();
					}

				$writer->endElement(); 
			}
			
			/*2.1.10   <FatturaPrincipale>*/
		
		$writer->endElement();  
		}
		
		
		
		/* 2.2 DatiBeniServizi*/ {
		$writer->startElement('DatiBeniServizi');
			
			/* 2.2.1 DettaglioLinee  */ {
			$StrSQL = "SELECT fatmovimenti.*,
								aliquote.DESCRIZIONE AS IVA_DESCRIZIONE, aliquote.VALORE AS IVA_VALORE, 
								aliquotenatura.CODICE AS IVA_NATURA
						FROM fatmovimenti 
							INNER JOIN aliquote ON fatmovimenti.CT_ALIQUOTE = aliquote.ID 
							LEFT JOIN aliquotenatura ON aliquote.CT_ALIQUOTENATURA = aliquotenatura.ID
						WHERE fatmovimenti.CT_FAT = " . $Fattura['ID'] ."
						ORDER BY ID "; 
			$rsFatMov = $conn->Execute($StrSQL);
			$i= 0;
			while (!$rsFatMov->EOF) {
				$i = $i +1;
				$Articolo = WFVALUEDLOOKUP('*', 'articoli', 'ID = ' . $rsFatMov->fields['CT_ARTICOLI']);
				
				$writer->startElement('DettaglioLinee');
				
					$writer->writeElement('NumeroLinea', $i);
					//$writer->writeElement('TipoCessionePrestazione', ''); //AC SpesaAccessoria //AB Abbuono
				
					/* 2.2.1.3 CodiceArticolo */ {
					if (strtoupper($Articolo['CODICE']) == 'CARTADELDOCENTE'){
						$writer->startElement('CodiceArticolo');
							$writer->writeElement('CodiceTipo', 'Carta del Docente');
							if (strlen($rsFatMov->fields['CODICE']) != 8){
								$output['message'] = $output['message'] . 'ERRORE : CODICE Carta del Docente non lunga 8 chr'.BRCRLF;
								$output['failure'] = true;
								$output['success'] = false;
								return;
							}
							$writer->writeElement('CodiceValore', StringAZ09Special($rsFatMov->fields['CODICE']));
						$writer->endElement();
					}else{
						if ($Articolo['MRP_GENERICO'] == 0){
							if (!IsNullOrEmptyOrZeroString($Articolo['CODICE'])){
								$writer->startElement('CodiceArticolo');
									$writer->writeElement('CodiceTipo', 'Codice Art. fornitore');
									$writer->writeElement('CodiceValore', substr(StringAZ09Special($Articolo['CODICE']),0,60));
								$writer->endElement();
							}
						}
						if (!IsNullOrEmptyOrZeroString($rsFatMov->fields['CODICE'])){
							$writer->startElement('CodiceArticolo');
								$writer->writeElement('CodiceTipo', 'Codice Art. cliente');
								$writer->writeElement('CodiceValore', substr(StringAZ09Special($rsFatMov->fields['CODICE']),0,60));
							$writer->endElement();
						}
						if (!IsNullOrEmptyOrZeroString($Articolo['BARCODE'])){
							$writer->startElement('CodiceArticolo');
								$writer->writeElement('CodiceTipo', 'EAN');
								$writer->writeElement('CodiceValore', substr(StringAZ09Special($Articolo['BARCODE']),0,60));
							$writer->endElement();
						}
						if (!IsNullOrEmptyOrZeroString($Articolo['BARCODECRT'])){
							$writer->startElement('CodiceArticolo');
								$writer->writeElement('CodiceTipo', 'SSC');
								$writer->writeElement('CodiceValore', $Articolo['BARCODECRT']);
							$writer->endElement();
						}
						if (!IsNullOrEmptyOrZeroString($rsFatMov->fields['CODICE'])){
							$writer->startElement('CodiceArticolo');
								$writer->writeElement('CodiceTipo', 'AswArtCli');
								$writer->writeElement('CodiceValore', substr(StringAZ09Special($rsFatMov->fields['CODICE']),0,60));
							$writer->endElement();
						}
						if (!IsNullOrEmptyOrZeroString($Articolo['CODICE'])){
							$writer->startElement('CodiceArticolo');
								$writer->writeElement('CodiceTipo', 'AswArtFor');
								$writer->writeElement('CodiceValore', substr(StringAZ09Special($Articolo['CODICE']),0,60));
							$writer->endElement();
						}
						if (!IsNullOrEmptyOrZeroString($Articolo['BARCODE'])){
							$writer->startElement('CodiceArticolo');
								$writer->writeElement('CodiceTipo', 'AswCodEan');
								$writer->writeElement('CodiceValore', substr(StringAZ09Special($Articolo['BARCODE']),0,60));
							$writer->endElement();
						}
					}
					
					}
				
					$writer->writeElement('Descrizione', substr(StringAZ09Special($rsFatMov->fields['DESCRIZIONE']),0,256));
					//FATT NORMALE
					if ($Fattura['SDI_TD'] != 'TD04') {
						$writer->writeElement('Quantita', CdecSTD(ABS($rsFatMov->fields['QTA']),4));
						$writer->writeElement('UnitaMisura', StringAZ09Special($rsFatMov->fields['QTAUM']));
						//$writer->writeElement('DataInizioPeriodo', '2012-01-01');
						//$writer->writeElement('DataFinePeriodo', '2012-03-31');
						if ($rsFatMov->fields['QTA']>0){
							//VENDITA NORMALE
							$writer->writeElement('PrezzoUnitario', CdecSTD($rsFatMov->fields['VALORELISTINO'],4));
						}elseif ($rsFatMov->fields['QTA']<0){
							//ACCONTO (reso)
							$writer->writeElement('PrezzoUnitario', CdecSTD($rsFatMov->fields['VALORELISTINO'] * -1,4)) ;
						}else{
							//OMAGGIO
							$writer->writeElement('PrezzoUnitario', CdecSTD($rsFatMov->fields['VALORELISTINO'],4)) ;
						}
					}
					//NC (inversione)
					else{
						$writer->writeElement('Quantita', CdecSTD(ABS($rsFatMov->fields['QTA']),4));
						$writer->writeElement('UnitaMisura', StringAZ09Special($rsFatMov->fields['QTAUM']));
						//$writer->writeElement('DataInizioPeriodo', '2012-01-01');
						//$writer->writeElement('DataFinePeriodo', '2012-03-31');
						
						if ($rsFatMov->fields['QTA']<0){
							//RESO VENDITA NORMALE
							$writer->writeElement('PrezzoUnitario', CdecSTD($rsFatMov->fields['VALORELISTINO'],4));
						}elseif ($rsFatMov->fields['QTA']>0){
							//RESO ACCONTO (reso)
							$writer->writeElement('PrezzoUnitario', CdecSTD($rsFatMov->fields['VALORELISTINO'] * -1,4)) ;
						}else{
							//RESO OMAGGIO
							$writer->writeElement('PrezzoUnitario', CdecSTD($rsFatMov->fields['VALORELISTINO'],4)) ;
						}
						/*
						if ($rsFatMov->fields['QTA'] < 0){
							//STORNO
							$writer->writeElement('PrezzoUnitario', CdecSTD($rsFatMov->fields['VALORELISTINO'] * -1,4)) ;
						}else{
							//VENDITA NORMALE
							$writer->writeElement('PrezzoUnitario', CdecSTD($rsFatMov->fields['VALORELISTINO'],4));
						}
						*/
					}
					
					/* 2.2.1.10 ScontoMaggiorazione */ {
						if ($rsFatMov->fields['SCONTOMAG0'] <> 0 ){
							$writer->startElement('ScontoMaggiorazione');
								if ($rsFatMov->fields['SCONTOMAG0'] < 0){
									$writer->writeElement('Tipo', 'SC');
								}else{
									$writer->writeElement('Tipo', 'MG');
								}
								$writer->writeElement('Percentuale', CdecSTD(abs(CdecSTD($rsFatMov->fields['SCONTOMAG0']))));
							$writer->endElement();
						}
						if ($rsFatMov->fields['SCONTOMAG1'] <> 0 ){
							$writer->startElement('ScontoMaggiorazione');
								if ($rsFatMov->fields['SCONTOMAG1'] < 0){
									$writer->writeElement('Tipo', 'SC');
								}else{
									$writer->writeElement('Tipo', 'MG');
								}
								$writer->writeElement('Percentuale', CdecSTD(abs(CdecSTD($rsFatMov->fields['SCONTOMAG1']))));
							$writer->endElement();
						}
						if ($rsFatMov->fields['SCONTOMAG2'] <> 0 ){
							$writer->startElement('ScontoMaggiorazione');
								if ($rsFatMov->fields['SCONTOMAG2'] < 0){
									$writer->writeElement('Tipo', 'SC');
								}else{
									$writer->writeElement('Tipo', 'MG');
								}
								$writer->writeElement('Percentuale', CdecSTD(abs(CdecSTD($rsFatMov->fields['SCONTOMAG2']))));
							$writer->endElement();
						}
						if ($rsFatMov->fields['SCONTOMAG3'] <> 0 ){
							$writer->startElement('ScontoMaggiorazione');
								if ($rsFatMov->fields['SCONTOMAG3'] < 0){
									$writer->writeElement('Tipo', 'SC');
								}else{
									$writer->writeElement('Tipo', 'MG');
								}
								$writer->writeElement('Percentuale', CdecSTD(abs(CdecSTD($rsFatMov->fields['SCONTOMAG3']))));
							$writer->endElement();
						}
						if ($rsFatMov->fields['SCONTOMAGEUR'] <> 0 ){
							$writer->startElement('ScontoMaggiorazione');
								if ($rsFatMov->fields['SCONTOMAGEUR'] < 0){
									$writer->writeElement('Tipo', 'SC');
								}else{
									$writer->writeElement('Tipo', 'MG');
								}
								$writer->writeElement('Importo', CdecSTD(abs(CdecSTD($rsFatMov->fields['SCONTOMAGEUR']))));
							$writer->endElement();
						}
					}
					/* 2.2.1.11 PrezzoTotale */ 
					
					if ($Fattura['SDI_TD'] != 'TD04') {
						//FATT NORMALE
						$writer->writeElement('PrezzoTotale', CdecSTD($rsFatMov->fields['VALORERIGA'] * $rsFatMov->fields['QTA'],4));
					}else{
						//NC (inversione)
						$writer->writeElement('PrezzoTotale', CdecSTD($rsFatMov->fields['VALORERIGA'] * $rsFatMov->fields['QTA'] * -1,4));
					}
					
					
					if (!IsNullOrEmptyOrZeroString($rsFatMov->fields['IVA_NATURA'])){
						$writer->writeElement('AliquotaIVA', CdecSTD(0));
						$writer->writeElement('Natura', $rsFatMov->fields['IVA_NATURA']);
						//$writer->writeElement('RiferimentoNormativo', $rsFatMov->fields['IVA_DESCRIZIONE']);
					}else{
						$writer->writeElement('AliquotaIVA', CdecSTD($rsFatMov->fields['IVA_VALORE']));
					}
					
					/* 2.2.1.15   <RiferimentoAmministrazione>	 */ 			
					// $writer->writeElement('RiferimentoAmministrazione', '012345');

					/*  2.2.1.16 AltriDatiGestionali */ {
						if (!IsNullOrEmptyOrZeroString($rsFatMov->fields['NOTERIGA'])){
							$writer->startElement('AltriDatiGestionali');
							$writer->writeElement('TipoDato', 'Note');
							$writer->writeElement('RiferimentoTesto', substr(StringAZ09Special($rsFatMov->fields['NOTERIGA']),0,60));
							//$writer->writeElement('RiferimentoNumero', substr(StringAZ09Special($rsFatMov->fields['NOTERIGA']),0,60));
							$writer->endElement(); 
						}
						
						// INTENTO  PLAFOND iva
						if ($rsFatMov->fields['IVA_NATURA'] == 'N3.5'){
							if (IsNullOrEmptyOrZeroString($Fattura['CG_CT_CONTABILEPLAFOND'])){
								$output['message'] = $output['message'] . 'Plafond non indicato'.BRCRLF;
									$output['failure'] = true;
									$output['success'] = false;
									return;
							}
							$Plafond = WFVALUEDLOOKUP('*', 'cg_contabileplafond', 'ID = ' . $Fattura['CG_CT_CONTABILEPLAFOND']);
							
							//SONO IN PLAFOND
							if (IsNullOrEmptyOrZeroString($Plafond['LETTERANUM']) || IsNullOrEmptyOrZeroString($Plafond['PROGRESSIONE']) || IsNullOrEmptyOrZeroString($Plafond['LETTERADATA'])) {
								$output['message'] = $output['message'] . 'Plafond rilevato, richiesto num lettera, progressivo e data dich intento'.BRCRLF;
								$output['failure'] = true;
								$output['success'] = false;
								return;
							}
							$writer->startElement('AltriDatiGestionali');
							$writer->writeElement('TipoDato', 'INTENTO');
							$writer->writeElement('RiferimentoTesto', $Plafond['LETTERANUM'] . '-' . $Plafond['PROGRESSIONE']);
							$writer->writeElement('RiferimentoData', $Plafond['LETTERADATA']);
							$writer->endElement(); 
						}
						
				
						if($AnagraficaCLI != ''){
							$WmsCLI = WFVALUEDLOOKUP('*','wms_consegne',		'CT_ANAGRAFICHE = ' . $AnagraficaCLIFAT['ID'] .
																			' AND CT_SPEDIZIONE = ' . $AnagraficaCLIFAT['ID'] .
																			" AND EDI_TYPE      = 'SDI'");
							if ($WmsCLI != ''){
								$writer->startElement('AltriDatiGestionali');
								$writer->writeElement('TipoDato', $WmsCLI['CODEXT']);
								$writer->writeElement('RiferimentoTesto', substr(StringAZ09Special($WmsCLI['EDI_ID']),0,60));
								$writer->endElement(); 
							}
						}
						
						if($AnagraficaCLISPE != ''){
							$WmsCLISPE = WFVALUEDLOOKUP('*','wms_consegne',		'CT_ANAGRAFICHE = ' . $AnagraficaCLIFAT['ID'] .
																			' AND CT_SPEDIZIONE = ' . $AnagraficaCLISPE['ID'] .
																			" AND EDI_TYPE      = 'SDI'");
							if ($WmsCLISPE != ''){
								$writer->startElement('AltriDatiGestionali');
								$writer->writeElement('TipoDato', $WmsCLISPE['CODEXT']);
								$writer->writeElement('RiferimentoTesto', substr(StringAZ09Special($WmsCLISPE['EDI_ID']),0,60));
								$writer->endElement(); 
							}
						}
					}
							
					
				$writer->endElement();  
				$rsFatMov->MoveNext();
			}
			$rsFatMov->Close();
			}
			
			/* 2.2.2 DatiRiepilogo IVA */ {
			$StrSQL = "SELECT  
							aliquote.ID, aliquote.DESCRIZIONE AS IVA_DESCRIZIONE, aliquote.VALORE AS IVA_VALORE, aliquote.SPLITPAY, aliquote.DIFFERITA, 
							aliquotenatura.CODICE AS IVA_NATURA, 
							fativa.IMPONIBILE, fativa.IMPOSTA
						FROM fativa 
							INNER JOIN aliquote ON fativa.CT_ALIQUOTE = aliquote.ID 
							LEFT JOIN aliquotenatura ON aliquote.CT_ALIQUOTENATURA = aliquotenatura.ID
						WHERE fativa.CT_FAT = " . $Fattura['ID'] . " 
						GROUP BY fativa.ID, aliquote.ID";
			$rsFatIve = $conn->Execute($StrSQL);
			while (!$rsFatIve->EOF) {
				$writer->startElement('DatiRiepilogo');
					if (!IsNullOrEmptyOrZeroString($rsFatIve->fields['IVA_NATURA'])){
						$writer->writeElement('AliquotaIVA', CdecSTD(0));
					}else{
						$writer->writeElement('AliquotaIVA', CdecSTD((CdecSTD($rsFatIve->fields['IVA_VALORE']))));
					}
					if (!IsNullOrEmptyOrZeroString($rsFatIve->fields['IVA_NATURA'])){
						//NON PAGO IVA
						//sono in esezione o non soggetto o inreverse change   N = ATTIVA
						$writer->writeElement('Natura', $rsFatIve->fields['IVA_NATURA']);
						
						if ($Fattura['SDI_TD'] != 'TD04') {
							//fatture normali
							$writer->writeElement('ImponibileImporto', CdecSTD((CdecSTD($rsFatIve->fields['IMPONIBILE']))));
							$writer->writeElement('Imposta', CdecSTD((CdecSTD($rsFatIve->fields['IMPOSTA']))));
						}else{
							//NC
							$writer->writeElement('ImponibileImporto', CdecSTD((CdecSTD($rsFatIve->fields['IMPONIBILE'] * -1))));
							$writer->writeElement('Imposta', CdecSTD((CdecSTD($rsFatIve->fields['IMPOSTA'] * -1))));
						}
						
					}else{
						//PAGO O PAGHERO IVA
						//I Immediata D Differita S SplitPay    N = null
						
						if ($Fattura['SDI_TD'] != 'TD04') {
							//fatture normali
							$writer->writeElement('ImponibileImporto', CdecSTD((CdecSTD($rsFatIve->fields['IMPONIBILE']))));
							$writer->writeElement('Imposta', CdecSTD((CdecSTD($rsFatIve->fields['IMPOSTA']))));
						}else{
							//NC
							$writer->writeElement('ImponibileImporto', CdecSTD((CdecSTD($rsFatIve->fields['IMPONIBILE'] * -1))));
							$writer->writeElement('Imposta', CdecSTD((CdecSTD($rsFatIve->fields['IMPOSTA'] * -1))));
						}
						
						if ($rsFatIve->fields['SPLITPAY'] == true){
							$writer->writeElement('EsigibilitaIVA','S');
						}elseif ($rsFatIve->fields['DIFFERITA'] == true){
							$writer->writeElement('EsigibilitaIVA','D');
						}else{
							$writer->writeElement('EsigibilitaIVA','I');
						}
					}
					//$writer->writeElement('SpeseAccessorie', CdecSTD($rsFatIve->fields['SPESE']));
					
					$writer->writeElement('RiferimentoNormativo', $rsFatIve->fields['IVA_DESCRIZIONE']);
				$writer->endElement();  
				$rsFatIve->MoveNext();
			}
			$rsFatIve->Close();
			}
		
		$writer->endElement();  
		}
		
		/* 2.3 DatiVeicoli    */ {
		}

		/* 2.4 DatiPagamento  */ {
		if (!IsNullOrEmptyOrZeroString($Fattura['CT_PAGAMENTI'])){
			$writer->startElement('DatiPagamento');
				$StrSQL = "SELECT fatscadenze.* , pagamentitipo.CODICESDI
							FROM fatscadenze
								INNER JOIN pagamentitipo ON pagamentitipo.ID = fatscadenze.CT_PAGAMENTITIPO 
							WHERE fatscadenze.CT_FAT = " . $Fattura['ID'] ;
				$rsPagamenti = $conn->Execute($StrSQL);
				$i = 0;
				    
				if ($rsPagamenti->RecordCount() == 1){
					if (($Fattura['SDI_TD'] == 'TD02') || ($Fattura['SDI_TD'] =='TD03')){
						// [TP03]: anticipo
						$writer->writeElement('CondizioniPagamento','TP03');
					}else{
						//[TP02]: pagamento completo
						$writer->writeElement('CondizioniPagamento','TP02');
					}
				}else{
					// [TP01]: pagamento a rate
					$writer->writeElement('CondizioniPagamento','TP01');
				}
				while (!$rsPagamenti->EOF) {
					$writer->startElement('DettaglioPagamento');
					
						$writer->writeElement('ModalitaPagamento',$rsPagamenti->fields['CODICESDI']);

						$writer->writeElement('DataScadenzaPagamento',$rsPagamenti->fields['DATA']);
						$writer->writeElement('ImportoPagamento',CdecSTD(ABS(CdecSTD($rsPagamenti->fields['VALORE']))));

						if ($BancaContoPC != ''){
							if ($BancaContoPC['DESCRIZIONE']) {$writer->writeElement('IstitutoFinanziario',$BancaContoPC['DESCRIZIONE']);}
							if ($BancaContoPC['IBAN']) {
								$writer->writeElement('IBAN',$BancaContoPC['IBAN']);
								$IbanSplit = IBANSplit($BancaContoPC['IBAN']);
								if ($IbanSplit['ABI']) {$writer->writeElement('ABI',$IbanSplit['ABI']);}
								if ($IbanSplit['CAB']) {$writer->writeElement('CAB',$IbanSplit['CAB']);}
							}
						}
		
					$writer->endElement();  
					$rsPagamenti->MoveNext();
				}
				$rsPagamenti->Close();
			$writer->endElement(); 
		}
		}
	
		/* 2.5 Allegati */ 
		if (WFVALUEGLOBAL('SDI_ALLEGATI')){
			$sqldoc = "SELECT aaadocuments.* 
						FROM aaadocuments 
						WHERE ((CT_TABLE = 'fat') AND (CT_ID  = " . $Fattura['ID'] . "))";
			$rsDoc = $conn->Execute($sqldoc);
			
			if ($rsDoc->RecordCount() > 0){
				$writer->startElement('Allegati');
				while (!$rsDoc->EOF) {
					$writer->writeElement('NomeAttachment',IsNull($rsDoc->fields['FILENAMEORIG'], $rsDoc->fields['FILENAME']));
					/*
					$handle = fopen($ExtJSDevDOC . $rsDoc->fields['FILENAME'], 'rb');
					$bufferSize = 4 * 256; // 4 bytes of base64 decodes to 3 bytes of ASCII
					while(!feof($handle)){
						$buffer = fread($handle, $bufferSize);
						$dbuffer = $dbuffer . base64_encode($buffer);
					}
					
					$bufferEntEnc = base64_encode($bufferEnt);
					fclose($handle);
					*/
					$data = file_get_contents($ExtJSDevDOC . $rsDoc->fields['FILENAME']);
					$bufferEntEnc = base64_encode($data);
					
					$writer->writeElement('Attachment',$bufferEntEnc);
					$rsDoc->MoveNext();
				}
				$writer->endElement();
			}
		}

	$writer->endElement();  
	}

	/* XML GENERATION END ALL */
	$writer->endElement();
	if ($FileName == '') $FileName = 'IT' . $MeStessoAzienda['PIVA'] . '_' . $SdiProgressivo . '.xml';
	file_put_contents($ExtJSDevExportRAW . 'sdi/' . $FileName, $writer->flush(true), LOCK_EX);
	
	
	return $ExtJSDevExportRAW . 'sdi/' . $FileName;
}

function SDIDecodeFatturaXML($FileName = '', $FatID = null) {
	global $conn;
	global $output;
	global $ExtJSDevImportRAW;
	global $ExtJSDevTMP;
	global $ExtJSDevDOC;
	$AppoFattura = array();
	
	$xml = simplexml_load_file($FileName);
	if (!$xml) {
		$output['message'] = $output['message'] . 'Fattura XML Errore NOXML ' . WFFileName($FileName) . BRCRLF ;
		$output['failure'] = true;
		$output['success'] = false;
		goto SDIDecodeFatturaXMLFine;
	}
	
	if (!property_exists ( $xml->children() , 'FatturaElettronicaHeader' )){
		$output['message'] = $output['message'] . 'Fattura Header Errore NO FatturaElettronica' .BRCRLF ;
		$output['failure'] = true;
		$output['success'] = false;
		goto SDIDecodeFatturaXMLFine;
	}
	
	$ArticoloDescrittivoID =  WFVALUEGLOBAL('CG_ARTICOLODESCRITTIVO');
	if ($ArticoloDescrittivoID  == '') {
		$output['message'] = $output['message'] . 'Fattura CG_ARTICOLODESCRITTIVO non definito' .BRCRLF ;
		$output['failure'] = true;
		$output['success'] = false;
		goto SDIDecodeFatturaXMLFine;
	}
				
	$FatturaElettronicaHeader = $xml->children()->FatturaElettronicaHeader;
	$DatiTrasmissione = $FatturaElettronicaHeader->children()->DatiTrasmissione;
	
	/* DEFINIZIONI SDI */
	$FATSDIProgressivo = $DatiTrasmissione->ProgressivoInvio->__toString();
	$CodiceDestinatario = $DatiTrasmissione->CodiceDestinatario->__toString();
	//if (!IsNullOrEmptyOrZeroString($DatiTrasmissione->FormatoTrasmissione->__toString())) 
	//if (!IsNullOrEmptyOrZeroString($DatiTrasmissione->CodiceDestinatario->__toString())) 
	//if (!IsNullOrEmptyOrZeroString($DatiTrasmissione->PECDestinatario->__toString())) 
	
	//DOCUMENTO FATTURA
	$FatturaElettronicaBody = $xml->children()->FatturaElettronicaBody;
	$DatiBeniServizi = $FatturaElettronicaBody->children()->DatiBeniServizi;
	$DatiPagamento = $FatturaElettronicaBody->children()->DatiPagamento;
	
	/***************************/
	/* 			TESTA		   */
	/***************************/
	$DatiGenerali = $FatturaElettronicaBody->children()->DatiGenerali;
	$DatiGeneraliDocumento = $DatiGenerali->children()->DatiGeneraliDocumento;
	
	$AppoFattura['NOTE'] = 1;
	$AppoFattura['DOCNUM'] = $DatiGeneraliDocumento->Numero->__toString();
	$AppoFattura['MONETA'] = $DatiGeneraliDocumento->Divisa->__toString();
	$AppoFattura['DOCDATA'] = $DatiGeneraliDocumento->Data->__toString();
	$AppoFattura['DOCDATA'] = substr($AppoFattura['DOCDATA'], 0, 10); 
	$AppoFattura['CESSIONEDATA'] = $AppoFattura['DOCDATA'];
	$AppoFattura['PDMORIGIN'] = 6; //SDI
	$AppoFattura['VALOREIMPONIBILE'] = 0;
	$AppoFattura['VALORETOTALEIVA'] =  0;
	$AppoFattura['VALORETOTALE'] =  0;
	$AppoFattura['TOTALIDEF'] = 0;
	$AppoFattura['CT_CAUSALI'] = null;
	
	//COMMITTENTE (ME STESSO)
	$MeStessoAzienda = WFVALUEDLOOKUP('*','anagrafiche','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'));
	if ($MeStessoAzienda == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICAAZIENDA  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	
	//CEDENTE Anagrafica (FORNITORE)
	$AnagraficaCLIFAT = '';
	$CedentePrestatore = $FatturaElettronicaHeader->children()->CedentePrestatore;
	$AnagraficaCLIFAT = SDICreaAggiornaAnagrafica($CedentePrestatore);
	
	//CESSIONARIO Anagrafica (CLIENTE)
	$AnagraficaFORFAT = '';
	$CessionarioCommittente = $FatturaElettronicaHeader->children()->CessionarioCommittente;
	$AnagraficaFORFAT = SDICreaAggiornaAnagrafica($CessionarioCommittente );
	$AppoFattura['FILENAMEXML'] = WFFileNameExt($FileName);
	$AppoFattura['SDI_TD'] = $DatiGeneraliDocumento->TipoDocumento->__toString();
	$SDITipoDoc = WFVALUEDLOOKUP('*', 'cg_sditipidoc', "ID = '" . $AppoFattura['SDI_TD'] ."'");
	
	//CAUSALE
	//CEDENTE Anagrafica (FORNITORE)
	$MRP_CAUSALEACQUISTO = WFVALUEGLOBAL('MRP_CAUSALEACQUISTO');
	if ($MRP_CAUSALEACQUISTO  == '') {
		$output['message'] = $output['message'] . 'Fattura MRP_CAUSALEACQUISTO non definito' .BRCRLF ;
		$output['failure'] = true;
		$output['success'] = false;
		goto SDIDecodeFatturaXMLFine;
	}
	//CESSIONARIO Anagrafica (CLIENTE)
	$MRP_CAUSALEVENDITA = WFVALUEGLOBAL('MRP_CAUSALEVENDITA');
	if ($MRP_CAUSALEVENDITA   == '') {
		$output['message'] = $output['message'] . 'Fattura MRP_CAUSALEVENDITA non definito' .BRCRLF ;
		$output['failure'] = true;
		$output['success'] = false;
		goto SDIDecodeFatturaXMLFine;
	}
	
	
	$conn->StartTrans(); 
	$notaCredito = false;
	if ($MeStessoAzienda['ID'] == $AnagraficaCLIFAT['ID']){
		//fattura di vendita
		$AppoFattura['CT_FATTURAZIONE'] = $AnagraficaFORFAT['ID'];
		$AppoFattura['IBAN'] = $AnagraficaFORFAT['IBAN'];
		$AppoFattura['CT_BANCA'] = $AnagraficaFORFAT['CT_BANCA'];
		$AppoFattura['SEGNO'] = -1;
		
		//SDICODE UPDATE
		$sqlC = "UPDATE anagrafiche 
				SET FATSDINUM = '" . $CodiceDestinatario . "' 
				WHERE 	FATSDINUM is null 
					AND ID = " . $AnagraficaFORFAT['ID'];
		$conn->Execute($sqlC);
		
		if (($AppoFattura['SDI_TD'] == 'TD04') || ($AppoFattura['SDI_TD'] == 'TD08')) {
			//nota di credito (negli altri casi e fattura totale o parziale o parcella)
			$AppoFattura['CT_CAUSALI'] = WFVALUEGLOBAL('SDI_CAUSALEATTIVANC');						
			if ($AppoFattura['CT_CAUSALI']  == '') {
				$output['message'] = $output['message'] . 'Fattura SDI_CAUSALEATTIVANC non definito' .BRCRLF ;
				$output['failure'] = true;
				$output['success'] = false;
				goto SDIDecodeFatturaXMLFine;
			}
			$notaCredito = true;		
		}
		elseif ($SDITipoDoc['REVERSE'] == true){
			//autofattura
			$conn->completeTrans(); 
			$FatID = WFVALUEDLOOKUP('ID','fat',"DOCNUM = '" . $AppoFattura['DOCNUM'] . "'" .
												" AND CT_FATTURAZIONE = " . $AppoFattura['CT_FATTURAZIONE'] .
												" AND DOCDATA = " .  WFSQLTODATE($AppoFattura['DOCDATA']) .
											"");
			$output['message'] = $output['message'] . 'autofattura vendita num:' . $AppoFattura['DOCNUM'] . 'data:' . $AppoFattura['DOCDATA'] . ' ID:' . $FatID . BRCRLF ;
			$AppoFattura['CT_CAUSALI'] = WFVALUEGLOBAL('SDI_CAUSALEATTIVANC');	
			if (!IsNullOrEmptyString($FatID)) return $FatID;		
		}
		else{
			$AppoFattura['CT_CAUSALI'] = WFVALUEGLOBAL('SDI_CAUSALEATTIVA');					
			if ($AppoFattura['CT_CAUSALI']  == '') {
				$output['message'] = $output['message'] . 'Fattura SDI_CAUSALEATTIVA non definito' .BRCRLF ;
				$output['failure'] = true;
				$output['success'] = false;
				goto SDIDecodeFatturaXMLFine;
			}
		}
	}
	else{
		//fattura di acquisto
		$AppoFattura['CT_FATTURAZIONE'] = $AnagraficaCLIFAT['ID'];
		$AppoFattura['IBAN'] = $AnagraficaCLIFAT['IBAN'];
		$AppoFattura['CT_BANCA'] = $AnagraficaCLIFAT['CT_BANCA'];
		$AppoFattura['SEGNO'] = 1;
		$AppoFattura['SDI_STATUS'] = 'OK';
		if (($AppoFattura['SDI_TD'] == 'TD04') || ($AppoFattura['SDI_TD'] == 'TD08')) {
			//nota di credito (negli altri casi e fattura totale o parziale o parcella)
			$AppoFattura['CT_CAUSALI'] = WFVALUEGLOBAL('SDI_CAUSALEPASSIVANC');						
			if ($AppoFattura['CT_CAUSALI']  == '') {
				$output['message'] = $output['message'] . 'Fattura SDI_CAUSALEPASSIVANC non definito' .BRCRLF ;
				$output['failure'] = true;
				$output['success'] = false;
				goto SDIDecodeFatturaXMLFine;
			}
			$notaCredito = true;		
		}
		else if ($SDITipoDoc['REVERSE'] == true){
			//autofattura
			$conn->completeTrans(); 
			$FatID = WFVALUEDLOOKUP('ID','fat',"DOCNUM = '" . $AppoFattura['DOCNUM'] . "'" .
												" AND CT_FATTURAZIONE = " . $AppoFattura['CT_FATTURAZIONE'] .
												" AND DOCDATA = " .  WFSQLTODATE($AppoFattura['DOCDATA']) .
											"");
			$output['message'] = $output['message'] . 'autofattura acquisto num:' . $AppoFattura['DOCNUM'] . 'data:' . $AppoFattura['DOCDATA'] . ' ID:' . $FatID .BRCRLF ;
			if (!IsNullOrEmptyString($FatID)) return $FatID;
			$AppoFattura['CT_CAUSALI'] = WFVALUEGLOBAL('SDI_CAUSALEPASSIVANC');
		}
		else{
			$AppoFattura['CT_CAUSALI'] = WFVALUEGLOBAL('SDI_CAUSALEPASSIVA');						
			if ($AppoFattura['CT_CAUSALI']  == '') {
				$output['message'] = $output['message'] . 'Fattura SDI_CAUSALEPASSIVA non definito' .BRCRLF ;
				$output['failure'] = true;
				$output['success'] = false;
				goto SDIDecodeFatturaXMLFine;
			}

}
	}
	
	$Causale = WFVALUEDLOOKUP('*','causali','ID = ' . $AppoFattura['CT_CAUSALI'] );
	
	/* IN CASO DI NC TEST PER SEGNO RIGHE */
	$notaCreditoSegno= false;
	if ($notaCredito){
		$DettaglioLinee = $DatiBeniServizi->children()->DettaglioLinee;
		foreach ($DettaglioLinee as $DettaglioLinea){
			if (property_exists ( $DettaglioLinea->children() , 'PrezzoTotale' )){
				if($DettaglioLinea->PrezzoTotale->__toString() < 0){
					$notaCreditoSegno = true;
				}
			}
			if (property_exists ( $DettaglioLinea->children() , 'PrezzoUnitario' )){
				if($DettaglioLinea->PrezzoUnitario->__toString() < 0){
					$notaCreditoSegno = true;
				}
			}
		}
	}
	
	$AppoFattura['CT_SEZIONALI'] = $Causale['CT_SEZIONALI'];
	$AppoFattura['CT_MAGAZZINI'] = 1;


	if (property_exists ( $DatiGeneraliDocumento->children() , 'ImportoTotaleDocumento' )){
		$AppoFattura['VALORETOTALE'] = $DatiGeneraliDocumento->ImportoTotaleDocumento->__toString();
	}else{
		$AppoFattura['VALORETOTALE'] = '';
	}
	
	/***************************/
	/*       BOLLO             */
	/***************************/
	if (property_exists ( $DatiGeneraliDocumento->children() , 'DatiBollo' )){
		$DatiBollo = $DatiGeneraliDocumento->children()->DatiBollo;
		$AppoFattura['BOLLOVIRTUALE'] = 1;
		$AppoFattura['BOLLOIMPORTO'] = $DatiBollo->ImportoBollo->__toString();
	}
	
	/***************************/
	/*       RITENUTA          */
	/***************************/
	if (property_exists ( $DatiGeneraliDocumento->children() , 'DatiRitenuta' )){
		$RitenutaDati = $DatiGeneraliDocumento->children()->DatiRitenuta;
		$AppoFattura['RITENUTATIPO'] = $RitenutaDati->TipoRitenuta;
		$AppoFattura['RITENUTAIMPORTO'] = $RitenutaDati->ImportoRitenuta;
		$AppoFattura['RITENUTAALIQUOTA'] = $RitenutaDati->AliquotaRitenuta;
		$AppoFattura['RITENUTACAUSALEPAGAMENTO'] = $RitenutaDati->CausalePagamento;
	}
	
	/***************************/
	/* DatiCassaPrevidenziale  */
	/***************************/
	if (property_exists ( $DatiGeneraliDocumento->children() , 'DatiCassaPrevidenziale' )){
		$CassaPrevidenzialeDati = $DatiGeneraliDocumento->children()->DatiCassaPrevidenziale;
		$AppoFattura['CASSAPRETIPO'] = $CassaPrevidenzialeDati->TipoCassa;
		$AppoFattura['CASSAPREAL'] = $CassaPrevidenzialeDati->AlCassa;
		$AppoFattura['CASSAPREIMPORTOCONTRIBUTO'] = $CassaPrevidenzialeDati->ImportoContributoCassa;
		$AppoFattura['CASSAPREIMPONIBILE'] = $CassaPrevidenzialeDati->ImponibileCassa;
		$AppoFattura['CASSAPREALIQUOTAIVA'] = $CassaPrevidenzialeDati->AliquotaIVA;
		$AppoFattura['CASSAPRERITENUTA'] = $CassaPrevidenzialeDati->Ritenuta;
		$AppoFattura['CASSAPRENATURA'] = $CassaPrevidenzialeDati->Natura;
	}
	
	/***************************/
	/* ScontoMaggiorazioneTOT  */
	/***************************/
	if (property_exists ( $DatiGeneraliDocumento->children() , 'ScontoMaggiorazione' )){
		$ScontoMaggiorazione = $DatiGeneraliDocumento->children()->ScontoMaggiorazione;
		if(property_exists ( $ScontoMaggiorazione , 'Importo' )){
			$AppoFattura['SCONTOMAGTOTALE'] = $ScontoMaggiorazione->Importo->__toString();
			if($ScontoMaggiorazione->Tipo->__toString() == 'SC'){
				$AppoFattura['SCONTOMAGTOTALE'] = $AppoFattura['SCONTOMAGTOTALE']  * -1;
			}
		}
		if(property_exists ( $ScontoMaggiorazione , 'Percentuale' )){
			$AppoFattura['SCONTOMAGTOTALE'] = $ScontoMaggiorazione->Percentuale->__toString();
			if($ScontoMaggiorazione->Tipo->__toString() == 'SC'){
				$AppoFattura['SCONTOMAGTOTALE'] = $AppoFattura['SCONTOMAGTOTALE']  * -1;
			}
		}
	}
	
	
	//$AppoFattura['SDI_PEC'] = 'sdi24@pec.fatturapa.it';
	$AppoFattura['SDI_DATA'] = $FATSDIProgressivo . '-' . WFVALUENOW();
	$AppoFattura['SDI_STAUS'] = 'OK';
	$AppoFattura['CT_OPERATORE'] = 1;
	$Esercizio  = WFVALUEDLOOKUP('*', 'cg_contabileesercizi', "" . WFSQLTODATE($AppoFattura['DOCDATA']) . " between DATAINIZIO and DATAFINE");
	$Anno = $Esercizio['ID'];
	$AppoFattura['CG_CT_CONTABILEESERCIZI'] = $Anno;
	if ($FatID == null){
		try {   
			$conn->AutoExecute("fat", $AppoFattura, 'INSERT');
		} catch (exception $e){
			// var_dump($e); 
			$conn->completeTrans(); 
			$output['message'] = $output['message'] . 'ERRORE Fattura' . $AppoFattura['CT_FATTURAZIONE'] . ' ' . $AppoFattura['DOCNUM'] . ' ' . $FileName . ' DUPLICATA ' .BRCRLF .
														$e .BRCRLF ;
			$output['failure'] = true;
			$output['success'] = false;
			$FatID = WFVALUEDLOOKUP('ID','fat',"DOCNUM = '" . $AppoFattura['DOCNUM'] . "'" .
												" AND CT_FATTURAZIONE = " . $AppoFattura['CT_FATTURAZIONE'] .
												" AND DOCDATA = " .  WFSQLTODATE($AppoFattura['DOCDATA']) .
											"");
			return $FatID;
		}
		$FatID = $conn->Insert_ID();
		$AppoFattura['ID'] = $FatID;
		$AppoFattura['CT_FATGROUP'] = $FatID;
	}
	else{
		$conn->AutoExecute("fat", $AppoFattura, 'UPDATE', 'ID =' . $FatID);
	}
	$AppoFattura['DOCBARCODE']  =  WFVALUEDOCIDEAN('fat', $FatID ) ;
	
	/***************************/
	/* 		TOTALI IVA	       */
	/***************************/
	$AppoFattura['VALOREIMPONIBILE']=0;
	$AppoFattura['VALORETOTALEIVA'] = 0;
	$AppoFattura['VALORETOTALE'] = 0;
	
	//cancella fativa vecchi
	$sqlC = "DELETE FROM fativa WHERE CT_FAT = " . $FatID;
	$conn->Execute($sqlC);
	
	if (property_exists ( $DatiBeniServizi->children() , 'DatiRiepilogo' )){
		$DatiRiepilogo = $DatiBeniServizi->children()->DatiRiepilogo;
		foreach ($DatiRiepilogo as $DatiRiepilogoLinea){
			//$DatiRiepilogo->AliquotaIVA->__toString();
			$AppoFatIva = array();
			$AppoFatIva['CT_FAT'] = $FatID;
			
			$AppoFatIva['IMPONIBILE'] = trim($DatiRiepilogoLinea->ImponibileImporto->__toString());
			$AppoFatIva['IMPOSTA']  = trim($DatiRiepilogoLinea->Imposta->__toString());
			$AppoFatIva['PERCENTUALE']  = trim($DatiRiepilogoLinea->AliquotaIVA->__toString());
			$AppoFatIva['DESCRIZIONE']  = '';
			if (property_exists ( $DatiRiepilogoLinea->children() , 'RiferimentoNormativo' )){
				$AppoFatIva['DESCRIZIONE']  = trim($DatiRiepilogoLinea->RiferimentoNormativo->__toString());
			}
			if (property_exists ( $DatiRiepilogoLinea->children() , 'Natura' )){
				$AppoFatIva['NATURA'] = $DatiRiepilogoLinea->Natura->__toString();
				$AliquotaNatura = WFVALUEDLOOKUP('*','aliquotenatura',"CODICE = '" . $DatiRiepilogoLinea->Natura->__toString() . "'");
				$Aliquota = WFVALUEDLOOKUP('*','aliquote','VALORE = ' . $DatiRiepilogoLinea->AliquotaIVA->__toString()  .
														 " AND SDIDECODE = 1 " .
														 " AND CT_ALIQUOTENATURA = " . $AliquotaNatura['ID'] );
			}else{
				$Aliquota = WFVALUEDLOOKUP('*','aliquote','VALORE = ' . $DatiRiepilogoLinea->AliquotaIVA->__toString() . 
														 " AND SDIDECODE = 1 " .
														 " AND CT_ALIQUOTENATURA is null " );
			}
			$AppoFattura['CT_ALIQUOTE'] = $Aliquota['ID'];
			
			if (IsNullOrEmptyOrZeroString($AppoFatIva['DESCRIZIONE'])){
				$AppoFatIva['DESCRIZIONE']  = $Aliquota['DESCRIZIONE'];
			}
			
			if ($notaCredito && ($AppoFatIva['IMPONIBILE']>0) && ($notaCreditoSegno == false)){
				
					$AppoFatIva['IMPONIBILE'] =   $AppoFatIva['IMPONIBILE'] * -1;
					$AppoFatIva['IMPOSTA'] = $AppoFatIva['IMPOSTA'] * -1;
				
			}
			if (($notaCredito) && ($notaCreditoSegno == true)){
				if($AppoFatIva['IMPONIBILE'] > 0 ){
					//essendo una nota di credito i valori dovrebbero essere negativi, quindi se trovo dei positi sono resi
					$AppoFatIva['IMPONIBILE'] =   abs($AppoFatIva['IMPONIBILE']) * -1;
					$AppoFatIva['IMPOSTA'] = abs($AppoFatIva['IMPOSTA']) * -1;
				}elseif($AppoFatIva['IMPONIBILE'] < 0 ){
					//essendo una nota di credito i valori dovrebbero essere negativi, quindi se trovo negativi sono vendite
					$AppoFatIva['IMPONIBILE'] =   abs($AppoFatIva['IMPONIBILE']);
					$AppoFatIva['IMPOSTA'] = abs($AppoFatIva['IMPOSTA']);
				}
				
			}
			$conn->AutoExecute("fativa", $AppoFatIva, 'INSERT');
		
			$AppoFattura['VALOREIMPONIBILE'] =  $AppoFattura['VALOREIMPONIBILE']  + $AppoFatIva['IMPONIBILE'] ;
			$AppoFattura['VALORETOTALEIVA']  = $AppoFattura['VALORETOTALEIVA'] + $AppoFatIva['IMPOSTA'] ;
			$AppoFattura['VALORETOTALE'] =  $AppoFattura['VALORETOTALE'] + $AppoFatIva['IMPOSTA'] + $AppoFatIva['IMPONIBILE'] ;
		}
	}
	try {   
		$conn->AutoExecute("fat", $AppoFattura, 'UPDATE', 'ID =' . $FatID);
	} catch (exception $e){
		$output['message'] = $output['message'] . 'Fattura IN UPDATE ' . $AppoFattura['DOCNUM'] . ' Errore ' .BRCRLF ;
		$output['failure'] = true;
		$output['success'] = false;
		goto SDIDecodeFatturaXMLFine;
	}
	
	/***************************/
	/* 	RIGHE VENDITA FT	  */
	/***************************/
	if (property_exists ( $DatiBeniServizi->children() , 'DettaglioLinee' )){
		$DettaglioLinee = $DatiBeniServizi->children()->DettaglioLinee;
		foreach ($DettaglioLinee as $DettaglioLinea){
			//FATMOVIMENTI
			$AppoFatMovimenti = array();
			$AppoFatMovimenti['CT_FAT'] = $FatID;
			$AppoFatMovimenti['RIGA'] = $DettaglioLinea->NumeroLinea->__toString();	
			$AppoFatMovimenti['CT_ARTICOLI'] = null;
			$AppoFatMovimenti['CODICE'] = null;
			$AppoFatMovimenti['DESCRIZIONE'] = left(trim($DettaglioLinea->Descrizione->__toString()),500);
			$AppoFatMovimenti['QTA'] = 1;
			$AppoFatMovimenti['QTARIGA'] = 1;
			$AppoFatMovimenti['QTAUM'] = 'NR';
			$AppoFatMovimenti['VALORELISTINO'] = $DettaglioLinea->PrezzoUnitario->__toString();
			$AppoFatMovimenti['SCONTOMAGEUR'] = 0;
			$AppoFatMovimenti['SCONTOMAG0'] = 0;
			$AppoFatMovimenti['SCONTOMAG1'] = 0;
			$AppoFatMovimenti['SCONTOMAG2'] = 0;
			$AppoFatMovimenti['SCONTOMAG3'] = 0;
			
			//QTA
			if (property_exists ( $DettaglioLinea->children() , 'Quantita' )){
				$AppoFatMovimenti['QTA'] = trim($DettaglioLinea->Quantita->__toString());
			}
			if (IsNullOrEmptyOrZeroString($AppoFatMovimenti['QTA']))   $AppoFatMovimenti['QTA'] = 1;
			
			//UM
			if (property_exists ( $DettaglioLinea , 'UnitaMisura' )){
				$AngUm  = $DettaglioLinea->UnitaMisura->__toString();
				$AngUm = str_replace("'", "", $AngUm);
				if (IsNullOrEmptyOrZeroString($AngUm)) { $AngUm = 'NR';}
				if ($AngUm == 'QTA') { $AngUm = 'NR';}
				if ($AngUm == 'PZ') { $AngUm = 'NR';}
				if ($AngUm == 'PCE') { $AngUm = 'NR';}
				$AngUm = WFVALUEDLOOKUP('*','angum',"ID = '" . $AngUm . "'");
				if (IsNullOrEmptyOrZeroString($AngUm)) { $AngUm = WFVALUEDLOOKUP('*','angum',"ID = 'NR'");}
				$AppoFatMovimenti['QTAUM'] = $AngUm['ID'];
			}
			
			//QTARIGA
			$AppoFatMovimenti['QTARIGA'] = $AppoFatMovimenti['QTA'];
			
			//IVA NATURA
			if (property_exists ( $DettaglioLinea->children() , 'Natura' )){
				$AliquotaNatura = WFVALUEDLOOKUP('*','aliquotenatura',"CODICE = '" . $DettaglioLinea->Natura->__toString() . "'");
				$Aliquota = WFVALUEDLOOKUP('*','aliquote','VALORE = ' . $DettaglioLinea->AliquotaIVA->__toString()  .
														 " AND SDIDECODE = 1 " .
														 " AND CT_ALIQUOTENATURA = " . $AliquotaNatura['ID'] );
			}else{
				$Aliquota = WFVALUEDLOOKUP('*','aliquote','VALORE = ' . $DettaglioLinea->AliquotaIVA->__toString() . 
														 " AND SDIDECODE = 1 " .
														 " AND CT_ALIQUOTENATURA is null " );
			}
			$AppoFatMovimenti['CT_ALIQUOTE'] = $Aliquota['ID'];
			
			//VALORE PREZZO
			if (property_exists ( $DettaglioLinea->children() , 'ScontoMaggiorazione' )){
				$ScontoMaggiorazioneLinee = $DettaglioLinea->children()->ScontoMaggiorazione;
				$ScontoProgNum = 0;
				$AppoFatMovimenti['SCONTOMAGEUR'] = 0;
				foreach ($ScontoMaggiorazioneLinee as $ScontoMaggiorazioneLinea){
			
					if(property_exists ( $ScontoMaggiorazioneLinea , 'Importo' )){
						$AppoSconto = $ScontoMaggiorazioneLinea->Importo->__toString();
						if($ScontoMaggiorazioneLinea->Tipo->__toString() == 'SC'){
							$AppoSconto = $AppoSconto  * -1;
						}
						$AppoFatMovimenti['SCONTOMAGEUR'] = $AppoFatMovimenti['SCONTOMAGEUR'] + $AppoSconto;
					}elseif(property_exists ( $ScontoMaggiorazioneLinea , 'Percentuale' )){
						$AppoSconto  = $ScontoMaggiorazioneLinea->Percentuale->__toString();
						if($ScontoMaggiorazioneLinea->Tipo->__toString() == 'SC'){
							$AppoSconto  = $AppoSconto * -1;
						}
						$AppoFatMovimenti['SCONTOMAG' . $ScontoProgNum] = $AppoSconto;
					}
					$ScontoProgNum  = $ScontoProgNum  + 1;
				}
			}
			$CalValoreRiga = ($AppoFatMovimenti['VALORELISTINO']  * ( 1 + $AppoFatMovimenti['SCONTOMAG0']  / 100 ) 
																  * ( 1 + $AppoFatMovimenti['SCONTOMAG1']  / 100 )
																  * ( 1 + $AppoFatMovimenti['SCONTOMAG2']  / 100 )
																  * ( 1 + $AppoFatMovimenti['SCONTOMAG3']  / 100 )
								)	+ $AppoFatMovimenti['SCONTOMAGEUR'] ;
					 
			$AppoFatMovimenti['VALORERIGA'] = $CalValoreRiga;  
			$AppoFatMovimenti['VALORERIGATOT'] = trim($DettaglioLinea->PrezzoTotale->__toString());
			if ($notaCredito) {
				if ($notaCreditoSegno) {
					if ($AppoFatMovimenti['VALORELISTINO']<0) {
						$AppoFatMovimenti['QTA'] =  abs($AppoFatMovimenti['QTA']) * -1;
						$AppoFatMovimenti['VALORELISTINO'] = abs($AppoFatMovimenti['VALORELISTINO']);
						$AppoFatMovimenti['VALORERIGA'] = abs($AppoFatMovimenti['VALORERIGA']);
					}elseif  ($AppoFatMovimenti['VALORELISTINO']>0) {
						if ($AppoFatMovimenti['VALORELISTINO'] == 2){
							//bollo
							$AppoFatMovimenti['QTA'] =  abs($AppoFatMovimenti['QTA']);
							$AppoFatMovimenti['VALORELISTINO'] = abs($AppoFatMovimenti['VALORELISTINO']);
							$AppoFatMovimenti['VALORERIGA'] = abs($AppoFatMovimenti['VALORERIGA']);
						}
					}
				}else{ 
					$AppoFatMovimenti['QTA'] =  abs($AppoFatMovimenti['QTA']) * -1;
					$AppoFatMovimenti['VALORELISTINO'] = abs($AppoFatMovimenti['VALORELISTINO']);
					$AppoFatMovimenti['VALORERIGA'] = abs($AppoFatMovimenti['VALORERIGA']);
				}
				$AppoFatMovimenti['VALORERIGATOT'] =  abs($AppoFatMovimenti['VALORERIGA']) * $AppoFatMovimenti['QTA'];
			}
			$AppoFatMovimenti['VALORERIGAINVALUTA'] = $AppoFatMovimenti['VALORERIGA'];
			//$AppoFatMovimenti['VALORERIGAIVA'] = round((($AppoFatMovimenti['VALORERIGA']* $AppoFatMovimenti['QTA']) / 100) * $Aliquota['VALORE'], 2);
			$AppoFatMovimenti['VALORERIGAIVA'] = round(($AppoFatMovimenti['VALORERIGA'] / 100 * $Aliquota['VALORE']), 2);
			if ($AppoFattura['TOTALIDEF'] == 0){
				//$AppoFattura['VALOREIMPONIBILE'] = $AppoFattura['VALOREIMPONIBILE'] + $AppoFatMovimenti['VALORERIGATOT'];
				//$AppoFattura['VALORETOTALEIVA'] =  $AppoFattura['VALORETOTALEIVA'] + ($AppoFatMovimenti['VALORERIGAIVA'] * $AppoFatMovimenti['QTA']);
			}
			
			//CODICE ARTICOLO 
			if (property_exists ( $DettaglioLinea->children() , 'CodiceArticolo' )){
				$CodiceArticoli = $DettaglioLinea->children()->CodiceArticolo;
				foreach ($CodiceArticoli as $CodiceArticolo){
					//$CodiceTipo = $CodiceArticolo->CodiceTipo->__toString();
					if (property_exists ( $CodiceArticolo , 'CodiceValore' )){
						$AppoFatMovimenti['CODICE'] = trim($CodiceArticolo->CodiceValore->__toString()) ;
						if ("****************" == $AppoFatMovimenti['CODICE']) {$AppoFatMovimenti['CODICE']= "";}
						
						$Articolo = "";
						$ArticoloListino ="";
						
						//cerca in anagrafica listini CODICE
						$ArticoloListino = WFVALUEDLOOKUP('*','articolilistini',"CT_ANAGRAFICHE = " . $AppoFattura['CT_FATTURAZIONE'] ." AND CODICEALTERNATIVO = '" . addslashes($AppoFatMovimenti['CODICE']) . "'");
						if ($ArticoloListino != ''){
							$Articolo = WFVALUEDLOOKUP('*','articoli',"ID = " . $ArticoloListino['CT_ARTICOLI']);
							$AppoFatMovimenti['CT_ARTICOLI'] = $Articolo['ID'];
						}
						
						//cerca in anagrafica articoli
						if ($ArticoloListino == ''){
							$Articolo = WFVALUEDLOOKUP('*','articoli',"CODICE = '" . addslashes($AppoFatMovimenti['CODICE']) . "'");
							if ($Articolo != ''){
								$AppoFatMovimenti['CT_ARTICOLI'] = $Articolo['ID'];
								$ArticoloListino = WFVALUEDLOOKUP('*','articolilistini',"CT_ANAGRAFICHE = " . $AppoFattura['CT_FATTURAZIONE'] ." AND CT_ARTICOLI = " . $Articolo['ID']);
							}
						}
						
						if (($Articolo != '') &&  (!IsNullOrEmptyOrZeroString($AppoFatMovimenti['VALORELISTINO'] ))) {
							$AppoFatMovimenti['CT_ARTICOLI'] = $Articolo['ID'];
							
							//nuovo listino
							if (($ArticoloListino == "") && ($AnagraficaCLIFAT['SDI_AUTOLISTINI'] == true)){					
								$ArticoloListino = array();
								$ArticoloListino['CT_ARTICOLI'] = $Articolo['ID'];
								$ArticoloListino['CODICEALTERNATIVO'] = $AppoFatMovimenti['CODICE'];
								$ArticoloListino['UM'] = $AppoFatMovimenti['QTAUM'];
								$ArticoloListino['DESCRIZIONEALTERNATIVO'] = $AppoFatMovimenti['DESCRIZIONE'];
								$ArticoloListino['CT_ANAGRAFICHE'] = $AppoFattura['CT_FATTURAZIONE'];
								$ArticoloListino['PDMORIGIN'] = '6';
								$ArticoloListino['VALORE'] = $AppoFatMovimenti['VALORELISTINO'];
								$ArticoloListino['SCONTOMAG0'] = $AppoFatMovimenti['SCONTOMAG0'];
								$ArticoloListino['SCONTOMAG1'] = $AppoFatMovimenti['SCONTOMAG1'];
								$ArticoloListino['SCONTOMAG2'] = $AppoFatMovimenti['SCONTOMAG2'];
								$ArticoloListino['SCONTOMAG3'] = $AppoFatMovimenti['SCONTOMAG3'];
								$conn->AutoExecute("articolilistini", $ArticoloListino, 'INSERT');
								$ArticoloListino['ID'] = $conn->Insert_ID();
							}
							elseif ($ArticoloListino != ""){
								if (IsNullOrEmptyOrZeroString($ArticoloListino['VALORE'] )){
									$ArticoloListinoUp = array();
									$ArticoloListinoUp['CODICEALTERNATIVO'] = $AppoFatMovimenti['CODICE'];
									$ArticoloListinoUp['UM'] = $AppoFatMovimenti['QTAUM'];
									$ArticoloListinoUp['DESCRIZIONEALTERNATIVO'] = $AppoFatMovimenti['DESCRIZIONE'];
									$ArticoloListinoUp['PDMORIGIN'] = '6';
									$ArticoloListinoUp['VALORE'] = $AppoFatMovimenti['VALORELISTINO'];
									$ArticoloListinoUp['SCONTOMAG0'] = $AppoFatMovimenti['SCONTOMAG0'];
									$ArticoloListinoUp['SCONTOMAG1'] = $AppoFatMovimenti['SCONTOMAG1'];
									$ArticoloListinoUp['SCONTOMAG2'] = $AppoFatMovimenti['SCONTOMAG2'];
									$ArticoloListinoUp['SCONTOMAG3'] = $AppoFatMovimenti['SCONTOMAG3'];
									$conn->AutoExecute("articolilistini", $ArticoloListinoUp, 'UPDATE', 'ID = ' . $ArticoloListino['ID']);
									$ArticoloListino = WFVALUEDLOOKUP('*','articolilistini','ID = ' . $ArticoloListino['ID']);
								}
								elseif (IsNullOrEmptyOrZeroString($ArticoloListino['CODICEALTERNATIVO'] )){
									$ArticoloListinoUp = array();
									$ArticoloListinoUp['CODICEALTERNATIVO'] = $AppoFatMovimenti['CODICE'];
									$ArticoloListinoUp['DESCRIZIONEALTERNATIVO'] = $AppoFatMovimenti['DESCRIZIONE'];
									$conn->AutoExecute("articolilistini", $ArticoloListinoUp, 'UPDATE', 'ID = ' . $ArticoloListino['ID']);
									$ArticoloListino = WFVALUEDLOOKUP('*','articolilistini','ID = ' . $ArticoloListino['ID']);
								}
							}
							break;
						}
					}
				}
			}else{
				//cerca in anagrafica listini DESC
				if ( ($ArticoloListino == '') && ($AppoFatMovimenti['CODICE'] == '') ){
					$ArticoloListino = WFVALUEDLOOKUP('*','articolilistini',"CT_ANAGRAFICHE = " . $AppoFattura['CT_FATTURAZIONE'] ." AND DESCRIZIONEALTERNATIVO = '" . addslashes($AppoFatMovimenti['DESCRIZIONE']) . "'");
					if ($ArticoloListino != ''){
						$Articolo = WFVALUEDLOOKUP('*','articoli',"ID = " . $ArticoloListino['CT_ARTICOLI']);
						$AppoFatMovimenti['CT_ARTICOLI'] = $Articolo['ID'];
					}
				}
			}
			
			if ($AppoFatMovimenti['CT_ARTICOLI'] == null){
				//genera articolo in anagrafica articoli
				if ( 	($AnagraficaCLIFAT['SDI_AUTOARTICOLI']) 
					&& 	(!IsNullOrEmptyOrZeroString($AppoFatMovimenti['CODICE'])) 
					&&  (!IsNullOrEmptyOrZeroString($AppoFatMovimenti['VALORELISTINO'] )) 
					){
					$Articolo = array();
					$Articolo['ID'] = null;
					$Articolo['CODICE'] = $AppoFatMovimenti['CODICE'];
					$Articolo['DESCRIZIONE'] = $AppoFatMovimenti['DESCRIZIONE'];
					$Articolo['CT_FORNITORE'] = $AnagraficaCLIFAT['ID'];
					$Articolo['UM0'] = $AppoFatMovimenti['QTAUM'];
					$Articolo['UMCONV'] = '1';
					$Articolo['UM1'] = $AppoFatMovimenti['QTAUM'];
					$Articolo['PDMORIGIN'] = '5';
					$conn->AutoExecute("articoli", $Articolo, 'INSERT');
					$Articolo['ID'] = $conn->Insert_ID();
					
					//nuovo listino
					if ($AnagraficaCLIFAT['SDI_AUTOLISTINI'] == true){	
						$ArticoloListino = array();
						$ArticoloListino['CT_ARTICOLI'] = $Articolo['ID'];
						$ArticoloListino['CODICEALTERNATIVO'] = $AppoFatMovimenti['CODICE'];
						$ArticoloListino['UM'] = $AppoFatMovimenti['QTAUM'];
						$ArticoloListino['DESCRIZIONEALTERNATIVO'] = $AppoFatMovimenti['DESCRIZIONE'];
						$ArticoloListino['CT_ANAGRAFICHE'] = $AnagraficaCLIFAT['ID'];
						$ArticoloListino['VALORE'] = $AppoFatMovimenti['VALORELISTINO'];
						$ArticoloListino['PDMORIGIN'] = '6';
						$ArticoloListino['SCONTOMAG0'] = $AppoFatMovimenti['SCONTOMAG0'];
						$ArticoloListino['SCONTOMAG1'] = $AppoFatMovimenti['SCONTOMAG1'];
						$ArticoloListino['SCONTOMAG2'] = $AppoFatMovimenti['SCONTOMAG2'];
						$ArticoloListino['SCONTOMAG3'] = $AppoFatMovimenti['SCONTOMAG3'];
						$conn->AutoExecute("articolilistini", $ArticoloListino, 'INSERT');
						$ArticoloListino['ID'] = $conn->Insert_ID();
					}
					$AppoFatMovimenti['CT_ARTICOLI'] = $Articolo['ID'];
				}else{
					//articolo generico
					$AppoFatMovimenti['CT_ARTICOLI'] = $ArticoloDescrittivoID;
				}
			}
			
			$AppoFatMovimenti['NOTERIGA'] = '';
			//2.2.1.7   <DataInizioPeriodo>	
			if (property_exists ( $DettaglioLinea->children() , 'DataInizioPeriodo' )){			
				$AppoFatMovimenti['NOTERIGA'] = $DettaglioLinea->DataInizioPeriodo->__toString() .
												$AppoFatMovimenti['NOTERIGA'] . ' -> ' . 
												$DettaglioLinea->DataFinePeriodo->__toString() . "   ";
			}
			
			//2.2.1.16   <AltriDatiGestionali>				
			if (property_exists ( $DettaglioLinea->children() , 'AltriDatiGestionali' )){
				$AltriDatiGestionali = $DettaglioLinea->children()->AltriDatiGestionali;
				foreach ($AltriDatiGestionali as $AltroDatoGestionali){
					if ($AltroDatoGestionali->TipoDato->__toString() == "INTENTO"){
						$PlafCodice = $AltroDatoGestionali->RiferimentoTesto->__toString();
						$PlafArray = explode("-",$PlafCodice);
						$PlafLettera = $PlafArray[0];
						$PlafProg = $PlafArray[1];
						$Plafond = WFVALUEDLOOKUP('*', 'cg_contabileplafond',        "LETTERANUM = '" . $PlafLettera . "' ".
																				" AND PROGRESSIONE = '" . $PlafProg . "'");
						if ($Plafond != ''){
							$AppoFattura['CG_CT_CONTABILEPLAFOND'] = $Plafond['ID'];
							$conn->AutoExecute("fat", $AppoFattura, 'UPDATE', 'ID =' . $FatID);
						}
					}
					$AppoFatMovimenti['NOTERIGA'] = $AppoFatMovimenti['NOTERIGA'] . 
													$AltroDatoGestionali->TipoDato->__toString() . 
													' : ' . 
													$AltroDatoGestionali->RiferimentoTesto->__toString() .  "   ";	
				}
			}
			
			
				
			$conn->AutoExecute("fatmovimenti", $AppoFatMovimenti, 'INSERT');
		}
	}
	else{
		//FATT SEMPLIFICATA
		$DettaglioLinea = $DatiBeniServizi->children();
		$AppoFatMovimenti = array();
		$AppoFatMovimenti['CT_FAT'] = $FatID;
		$AppoFatMovimenti['RIGA'] = $DettaglioLinea->NumeroLinea->__toString();	
		$AppoFatMovimenti['CT_ARTICOLI'] = $ArticoloDescrittivoID;
		$AppoFatMovimenti['DESCRIZIONE'] = left(trim($DettaglioLinea->Descrizione->__toString()),400);
		$AppoFatMovimenti['QTA'] = 1;
		$AppoFatMovimenti['QTAUM'] = 'NR';
		$AppoFatMovimenti['QTARIGA'] = $AppoFatMovimenti['QTA'];
		
		if (property_exists ( $DettaglioLinea , 'Natura' )){
			$AliquotaNatura = WFVALUEDLOOKUP('*','aliquotenatura',"CODICE = '" . $DettaglioLinea->Natura->__toString() . "'");
			$Aliquota = WFVALUEDLOOKUP('*','aliquote','VALORE = ' . $DettaglioLinea->DatiIVA->children()->AliquotaIVA->__toString()  .
													 " AND SDIDECODE = 1 " .
													 " AND CT_ALIQUOTENATURA = " . $AliquotaNatura['ID'] );
		}else{
			if (property_exists ( $DettaglioLinea , 'Aliquota' )){
				$Aliquota = WFVALUEDLOOKUP('*','aliquote','VALORE = ' . $DettaglioLinea->DatiIVA->children()->AliquotaIVA->__toString() . 
														 " AND SDIDECODE = 1 " .
														 " AND CT_ALIQUOTENATURA is null " );
			}
		}
		$AppoFatMovimenti['CT_ALIQUOTE'] = $Aliquota['ID'];
		$AppoFatMovimenti['VALORELISTINO'] = $DettaglioLinea->Importo->__toString();
		$AppoFatMovimenti['VALORERIGAIVA'] = $DettaglioLinea->DatiIVA->children()->Imposta->__toString();
		$AppoFatMovimenti['VALORELISTINO'] = $AppoFatMovimenti['VALORELISTINO']  - $AppoFatMovimenti['VALORERIGAIVA'];
		$AppoFatMovimenti['SCONTOMAGEUR'] = 0;
		$AppoFatMovimenti['SCONTOMAG0'] = 0;
		$AppoFatMovimenti['SCONTOMAG1'] = 0;
		$AppoFatMovimenti['SCONTOMAG2'] = 0;
		$AppoFatMovimenti['SCONTOMAG3'] = 0;
		$AppoFatMovimenti['VALORERIGA'] = $AppoFatMovimenti['VALORELISTINO'];
		$AppoFatMovimenti['VALORERIGATOT'] = $AppoFatMovimenti['VALORERIGA'];
		if ($notaCredito) {
			if ($notaCreditoSegno) {
				if ( ($AppoFatMovimenti['VALORELISTINO']<0) || ($AppoFatMovimenti['VALORERIGA']<0) ){
					$AppoFatMovimenti['QTA'] =  abs($AppoFatMovimenti['QTA']) * -1;
					$AppoFatMovimenti['VALORELISTINO'] = abs($AppoFatMovimenti['VALORELISTINO']);
					$AppoFatMovimenti['VALORERIGA'] = abs($AppoFatMovimenti['VALORERIGA']);
				}
			}else{ 
				$AppoFatMovimenti['QTA'] =  abs($AppoFatMovimenti['QTA']) * -1;
				$AppoFatMovimenti['VALORELISTINO'] = abs($AppoFatMovimenti['VALORELISTINO']);
				$AppoFatMovimenti['VALORERIGA'] = abs($AppoFatMovimenti['VALORERIGA']);
			}
			$AppoFatMovimenti['VALORERIGATOT'] =  abs($AppoFatMovimenti['VALORERIGA']) * $AppoFatMovimenti['QTA'];
		}
		$AppoFatMovimenti['VALORERIGAINVALUTA'] = $AppoFatMovimenti['VALORERIGA'];
		$conn->AutoExecute("fatmovimenti", $AppoFatMovimenti, 'INSERT');
		
		$AppoFatIva = array();
		$AppoFatIva['CT_FAT'] = $FatID;
		$AppoFatIva['IMPONIBILE'] = $AppoFatMovimenti['VALORELISTINO'];
		$AppoFatIva['IMPOSTA']  = $AppoFatMovimenti['VALORERIGAIVA'];
		$AppoFatIva['PERCENTUALE']  = $AppoFatMovimenti['CT_ALIQUOTE'];
		$AppoFatIva['DESCRIZIONE']  = $AppoFatMovimenti['DESCRIZIONE'];
		if ($notaCredito && ($AppoFatIva['IMPONIBILE']>0) && ($notaCreditoSegno == false)){
			$AppoFatIva['IMPONIBILE'] =   $AppoFatIva['IMPONIBILE'] * -1;
			$AppoFatIva['IMPOSTA'] = $AppoFatIva['IMPOSTA'] * -1;
		}
		$conn->AutoExecute("fativa", $AppoFatIva, 'INSERT');
			
		$AppoFattura['VALOREIMPONIBILE'] = $AppoFattura['VALOREIMPONIBILE'] + $AppoFatMovimenti['VALORERIGATOT'];
		$AppoFattura['VALORETOTALEIVA'] = $AppoFatMovimenti['VALORERIGAIVA'] * $AppoFatMovimenti['QTA'];
		$AppoFattura['VALORETOTALE'] =  $AppoFatIva['IMPOSTA'] + $AppoFatIva['IMPONIBILE'] ;
		$conn->AutoExecute("fat", $AppoFattura, 'UPDATE', 'ID =' . $FatID);
	}
	
	/***************************/
	/* 		RIGHE ORDINE	  */
	/***************************/
	/* 2.1.2   <DatiOrdineAcquisto> */
	$OrdiniArray = array();
	if (property_exists ( $DatiGenerali , 'DatiOrdineAcquisto' )){
		$DatiOrdineAcquisto = $DatiGenerali->children()->DatiOrdineAcquisto;
		foreach ($DatiOrdineAcquisto as $DatiOrdineAcquistoRiga){
			
			if ($MeStessoAzienda['ID'] == $AnagraficaCLIFAT['ID']){
				//fattura di vendita							
				$intestazione = $AnagraficaFORFAT['ID'];	
				$Causale = WFVALUEDLOOKUP('*','causali','ID = ' . $MRP_CAUSALEVENDITA );
				$segno = '< 0';
			}else{
				//fattura di acquisto
				$intestazione = $AnagraficaCLIFAT['ID'];
				$Causale = WFVALUEDLOOKUP('*','causali','ID = ' . $MRP_CAUSALEACQUISTO );
				$segno = '> 0';
			}
			
							
			$RiferimentoNumeroLinea = $DatiOrdineAcquistoRiga->children()->RiferimentoNumeroLinea;
			if (!property_exists ( $DatiOrdineAcquistoRiga->children(), 'RiferimentoNumeroLinea' )){
				//Mancano i riferimenti a quali righe della fattura
				if ($DatiOrdineAcquistoRiga->Data->__toString() != ''){
					$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $intestazione . 
														" AND DOCNUM = '" . addslashes($DatiOrdineAcquistoRiga->IdDocumento->__toString()) . "'" .
														" AND DOCDATA = '" . $DatiOrdineAcquistoRiga->Data->__toString() . "'" .
														" AND SEGNO = " . $Causale['SEGNO']);
				}
				if ($Ord == ''){
					$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $intestazione . 
														" AND DOCNUM = '" . addslashes($DatiOrdineAcquistoRiga->IdDocumento->__toString()) . "'" .
														" AND SEGNO = " . $Causale['SEGNO']);
				}
				if ($Ord == ''){
					$OrdNumEpure = preg_replace("/[^A-Za-z0-9]/", '', $DatiOrdineAcquistoRiga->IdDocumento->__toString());
					if ($DatiOrdineAcquistoRiga->Data->__toString() != ''){
						$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $intestazione . 
														" AND REGEXP_REPLACE(DOCNUM,'[^A-Za-z0-9]','', 1, 3) = '" . $OrdNumEpure . "'" .
														" AND DOCDATA = '" . $DatiOrdineAcquistoRiga->Data->__toString() . "'" .
														" AND SEGNO = " . $Causale['SEGNO']);
					}
					if ($Ord == ''){
						$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $intestazione . 
														" AND REGEXP_REPLACE(DOCNUM,'[^A-Za-z0-9]','', 1, 3) = '" . $OrdNumEpure . "'" .
														" AND SEGNO = " . $Causale['SEGNO']);
					}
				}
				if ($Ord == ''){
					if ($DatiOrdineAcquistoRiga->Data->__toString() != ''){
						$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $intestazione . 
															" AND DOCDATA = '" . $DatiOrdineAcquistoRiga->Data->__toString() . "'" .
															" AND SEGNO = " . $Causale['SEGNO']);
					}
				}
				if ($Ord != ''){
					$StrSQL = "UPDATE fat
									SET CT_ORD = " . $Ord['ID'] . " 
								WHERE ID = " . $FatID ;
					$conn->Execute ($StrSQL);
				}
			}
			else{
				//Con riferimenti di riga
				$RiferimentoNumeroLinea = $DatiOrdineAcquistoRiga->children()->RiferimentoNumeroLinea;
				foreach ($RiferimentoNumeroLinea as $RiferimentoNumeroLineaRiga){
					if ($DatiOrdineAcquistoRiga->Data->__toString() != ''){
						$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $intestazione . 
															" AND DOCNUM = '" . addslashes($DatiOrdineAcquistoRiga->IdDocumento->__toString()) . "'" .
															" AND DOCDATA = '" . $DatiOrdineAcquistoRiga->Data->__toString() . "'" .
															" AND SEGNO = " . $Causale['SEGNO']);
					}
					if ($Ord == ''){
						$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $intestazione . 
															" AND DOCNUM = '" . addslashes($DatiOrdineAcquistoRiga->IdDocumento->__toString()) . "'" .
															" AND SEGNO = " . $Causale['SEGNO']);
					}
					if ($Ord == ''){
						$OrdNumEpure = preg_replace("/[^A-Za-z0-9]/", '', $DatiOrdineAcquistoRiga->IdDocumento->__toString());
						if ($DatiOrdineAcquistoRiga->Data->__toString() != ''){
							$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $intestazione . 
															" AND REGEXP_REPLACE(DOCNUM,'[^A-Za-z0-9]','', 1, 3) = '" . $OrdNumEpure . "'" .
															" AND DOCDATA = '" . $DatiOrdineAcquistoRiga->Data->__toString() . "'" .
															" AND SEGNO = " . $Causale['SEGNO']);
						}
						if ($Ord == ''){
							$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $intestazione . 
															" AND REGEXP_REPLACE(DOCNUM,'[^A-Za-z0-9]','', 1, 3) = '" . $OrdNumEpure . "'" .
															" AND SEGNO = " . $Causale['SEGNO']);
						}
					}
					if ($Ord == ''){
						if ($DatiOrdineAcquistoRiga->Data->__toString() != ''){
							$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $intestazione . 
																" AND DOCDATA = '" . $DatiOrdineAcquistoRiga->Data->__toString() . "'" .
																" AND SEGNO = " . $Causale['SEGNO']);
						}
					}
					if ($Ord != ''){
						$StrSQL = "UPDATE fat
										SET CT_ORD = " . $Ord['ID'] . " 
									WHERE ID = " . $FatID ;
						$conn->Execute ($StrSQL);
					}
							
					$FatMovimento = WFVALUEDLOOKUP('*','fatmovimenti',"CT_FAT = " . $FatID . " AND RIGA = '" . $RiferimentoNumeroLineaRiga->__toString() . "'" );							
					$OrdMovimenti ='';
					if ($FatMovimento != ''){
						if (($Ord == '') && ($AnagraficaCLIFAT['SDI_AUTOORD'] == true)){
							$Ord = array();
							$Ord['ID'] = null;		
							$Ord['CT_FATTURAZIONE'] = $intestazione;
							$Ord['CT_CAUSALI'] = $Causale['ID'];
							$Ord['DOCNUM'] = $DatiOrdineAcquistoRiga->IdDocumento->__toString();
							$Ord['SEGNO'] = $Causale['SEGNO'];
							$Ord['STATO'] = 'E';
							$Ord['PDMORIGIN'] = 6; //SDI
							$Ord['CG_CT_CONTABILEESERCIZI'] = WFVALUEYEAR();
							$Ord['DOCDATA'] = WFVALUEDAY();
							if ($DatiOrdineAcquistoRiga->Data->__toString() != ''){
								$Ord['DOCDATA'] = $DatiOrdineAcquistoRiga->Data->__toString();
								$Ord['CG_CT_CONTABILEESERCIZI'] = WFVALUEDLOOKUP('ID', 'cg_contabileesercizi', "DATAFINE >= " . WFSQLTODATE($Ord['DOCDATA']) . " AND DATAINIZIO <= " . WFSQLTODATE($Ord['DOCDATA']));
							}
							$Ord['PDMORIGIN'] = 6; //SDI
							//WFVALUEDOCIDEAN($Chiave, $TestaCorrente['ID'] );
							$conn->AutoExecute("ord", $Ord, 'INSERT');
							$Ord['ID'] = $conn->Insert_ID();
						}
							
						if ($Ord != '') { 
							if (property_exists ( $DatiOrdineAcquistoRiga , 'NumItem' )){				
								$OrdMovimenti = WFVALUEDLOOKUP('*','ordmovimenti',"CT_ORD = " . $Ord['ID'] ." AND RIGA = '" . $DatiOrdineAcquistoRiga->NumItem->__toString() . "'");
							}
							
							if ($OrdMovimenti == ''){
								$OrdMovimenti = WFVALUEDLOOKUP('*','ordmovimenti',"CT_ORD = " . $Ord['ID'] .  " AND CT_ARTICOLI = " . $FatMovimento['CT_ARTICOLI'] );
							}
							
							if (($OrdMovimenti == '') && ($AnagraficaCLIFAT['SDI_AUTOORD'] == true)){
								$OrdMovimenti = array();
								$OrdMovimenti['CT_ARTICOLI'] = $ArticoloDescrittivoID;
								$OrdMovimenti = WFRECORDCLONE($FatMovimento) ;
								$OrdMovimenti['ID'] = null;
								$OrdMovimenti['CT_ORD'] = $Ord['ID'];
								$OrdMovimenti['CT_FAT'] = $FatID;
								$conn->AutoExecute("ordmovimenti", $OrdMovimenti, 'INSERT');
								$OrdMovimenti['ID'] = $conn->Insert_ID();
							}
							
							if ($OrdMovimenti != '') {
								//riferimento ordine trovato in fattura
								$StrSQL = "UPDATE fatmovimenti 
												SET CT_ORDMOVIMENTI = " . $OrdMovimenti['ID'] . " 
											WHERE ID = " . $FatMovimento['ID'] ;
								$conn->Execute ($StrSQL);
								
								$OrdiniArray[$RiferimentoNumeroLineaRiga->__toString()]['FATRIGA'] = $RiferimentoNumeroLineaRiga->__toString();
								$OrdiniArray[$RiferimentoNumeroLineaRiga->__toString()]['CT_FATMOVIMENTI'] = $FatMovimento['ID'];
								$OrdiniArray[$RiferimentoNumeroLineaRiga->__toString()]['CT_ORD'] = $OrdMovimenti['CT_ORD'];
								$OrdiniArray[$RiferimentoNumeroLineaRiga->__toString()]['CT_ORDMOVIMENTI'] = $OrdMovimenti['ID'];
							}
							else{				
								//riferimento ordine non trovati ma presenti in fattura
								$StrSQL = "UPDATE fatmovimenti 
												SET RIF = concat(COALESCE(RIF,'') ,'Ord:" . addslashes($DatiOrdineAcquistoRiga->IdDocumento->__toString()) . 
																				" Del:" . $DatiOrdineAcquistoRiga->Data->__toString() . 
																				" Riga:" . $RiferimentoNumeroLineaRiga->__toString() . "')" .
										" WHERE ID = " . $FatMovimento['ID'] ;
								$conn->Execute ($StrSQL);
							}
						}
						else{
							//riferimento ordine non trovati ma presenti in fattura
							$StrSQL = "UPDATE fatmovimenti 
											SET RIF = concat(COALESCE(RIF,'') ,'Ord:" . addslashes($DatiOrdineAcquistoRiga->IdDocumento->__toString()) . 
																				" Del:" . $DatiOrdineAcquistoRiga->Data->__toString() . 
																				" Riga:" . $RiferimentoNumeroLineaRiga->__toString() . "')" .
										" WHERE ID = " . $FatMovimento['ID'] ;
							$conn->Execute ($StrSQL);
						}
					}
				}
			}
		}
	}
	

	/***************************/
	/* 		FAT	 COLLEGATE	   */
	/***************************/
	/* 2.1.6   <DatiFattureCollegate> */
	if (property_exists ( $DatiGenerali , 'DatiFattureCollegate' )){
		$DatiFattureCollegate = $DatiGenerali->children()->DatiFattureCollegate;
			foreach ($DatiFattureCollegate as $DatiFattura){
				//$DatiFattureCollegate->IdDocumento->__toString();
				//$DatiFattureCollegate->Data->__toString();
			}
	}
	
	/***************************/
	/* 		RIGHE DDT	 	   */
	/***************************/
	/* 2.1.8   <DatiDDT> */
	if (property_exists ( $DatiGenerali , 'DatiDDT' )){
		$r= 0;
		$DatiDDT = $DatiGenerali->children()->DatiDDT;
		foreach ($DatiDDT as $DatiDDTRiga){
			$r=$r+1;
			if ($MeStessoAzienda['ID'] == $AnagraficaCLIFAT['ID']){
				//fattura di vendita							
				$intestazione = $AnagraficaFORFAT['ID'];	
				$Causale = WFVALUEDLOOKUP('*','causali','ID = ' . $MRP_CAUSALEVENDITA );
				$segno = '< 0';
			}else{
				//fattura di acquisto
				$intestazione = $AnagraficaCLIFAT['ID'];
				$Causale = WFVALUEDLOOKUP('*','causali','ID = ' . $MRP_CAUSALEACQUISTO );
				$segno = '> 0';
			}
							
			$Ddt = WFVALUEDLOOKUP('*','ddt',"CT_FATTURAZIONE = " . $intestazione . 
												" AND DOCNUM = '" . $DatiDDTRiga->NumeroDDT->__toString() . "'" .
												" AND DOCDATA = '" . $DatiDDTRiga->DataDDT->__toString() . "'" .
												" AND SEGNO = " . $Causale['SEGNO']);
			if ($Ddt == ''){
				$Ddt = WFVALUEDLOOKUP('*','ddt',"CT_FATTURAZIONE = " . $intestazione . 
												" AND cast(REGEXP_REPLACE(DOCNUM, '[^0-9]', '') as UNSIGNED) = '" . preg_replace("/[^0-9]/", '', $DatiDDTRiga->NumeroDDT->__toString()) . "'" .
												" AND DOCDATA = '" . $DatiDDTRiga->DataDDT->__toString() . "'" .
												" AND SEGNO = " . $Causale['SEGNO']);
			}
			if ($Ddt == ''){
				$Ddt = WFVALUEDLOOKUP('*','ddt',"CT_FATTURAZIONE = " . $intestazione . 
												" AND cast(REGEXP_REPLACE(DOCNUM, '[^0-9]', '') as UNSIGNED) = '" . preg_replace("/[^0-9]/", '', $DatiDDTRiga->NumeroDDT->__toString()) . "'" .
												" AND YEAR(DOCDATA) = " . WFVALUEYEAR($DatiDDTRiga->DataDDT->__toString()) . "".
												" AND STATO = 'I'" .
												" AND SEGNO = " . $Causale['SEGNO']);
			}
			if ($Ddt == ''){
				$Ddt = WFVALUEDLOOKUP('*','ddt',"CT_FATTURAZIONE = " . $intestazione . 
												" AND cast(REGEXP_REPLACE(DOCNUM, '[^0-9]', '') as UNSIGNED) = '" . preg_replace("/[^0-9]/", '', $DatiDDTRiga->NumeroDDT->__toString()) . "'" .
												" AND STATO = 'I'" .
												" AND SEGNO = " . $Causale['SEGNO']);
			}
			if ($Ddt == ''){
				$Ddt = WFVALUEDLOOKUP('*','ddt',"CT_FATTURAZIONE = " . $intestazione . 
												" AND RIGHT(DOCNUM,4) = '" . substr(trim($DatiDDTRiga->NumeroDDT->__toString()),-4) . "'" .
												" AND YEAR(DOCDATA) = " . WFVALUEYEAR($DatiDDTRiga->DataDDT->__toString()) . "".
												" AND MONTH(DOCDATA) = " . WFVALUEMONTH($DatiDDTRiga->DataDDT->__toString()) . "" .
												" AND STATO = 'I'" .
												" AND SEGNO = " . $Causale['SEGNO']);
			}
			if ($Ddt == ''){
				$Ddt = WFVALUEDLOOKUP('*','ddt',"CT_FATTURAZIONE = " . $intestazione. 
												" AND DOCDATA = '" . $DatiDDTRiga->DataDDT->__toString() . "'" .
												" AND STATO = 'I'" .
												" AND SEGNO = " . $Causale['SEGNO']);
			}
			//crea testata o aggiorna legame fattura
			if ($Ddt != '') {
				//riferimento ddt trovato in fattura
				$StrSQL = "UPDATE ddt SET CT_FAT = " . $FatID . " WHERE ID = " . $Ddt['ID'] ;
				$conn->Execute ($StrSQL);
			}
			
			if (($Ddt == '') && ($AnagraficaCLIFAT['SDI_AUTODDT'] == true)){
				$Ddt = array();
				$Ddt['ID'] = null;
				$Ddt['CT_FATTURAZIONE'] = $intestazione;
				$Ord['CT_CAUSALI'] = $Causale['ID'];
				$Ddt['DOCNUM'] = $DatiDDTRiga->NumeroDDT->__toString();
				$Ddt['DOCDATA'] = $DatiDDTRiga->DataDDT->__toString();
				$Ddt['PDMORIGIN'] = 6; //SDI
				$Ddt['SEGNO'] = $Causale['SEGNO'];
				$Ddt['CG_CT_CONTABILEESERCIZI'] = WFVALUEDLOOKUP('ID', 'cg_contabileesercizi', "DATAFINE >= " . WFSQLTODATE($Ddt['DOCDATA']) . " AND DATAINIZIO <= " . WFSQLTODATE($Ddt['DOCDATA']));
				//WFVALUEDOCIDEAN($Chiave, $TestaCorrente['ID'] );
				$Ddt['CT_FAT'] = $FatID;
				$Ddt['PDMORIGIN'] = 6; //SDI
				
				$AppoDdt = WFVALUEDLOOKUP('*', 'ddt', "DOCNUM = '" . $Ddt['DOCNUM'] . "' " .
														" AND DOCDATA = " . WFSQLTODATE($Ddt['DOCDATA']) . 
														" AND CT_FATTURAZIONE = " . $Ddt['CT_FATTURAZIONE'] . 
														" AND CG_CT_CONTABILEESERCIZI = " . $Ddt['CG_CT_CONTABILEESERCIZI']);
				if ($AppoDdt == ''){
						$AppoDdt  = WFVALUEDLOOKUP('ID', 'ddt', "DOCNUM = '" . $Ddt['DOCNUM'] . "' " .
															" AND CT_FATTURAZIONE = " . $Ddt['CT_FATTURAZIONE'] . 
															" AND CG_CT_CONTABILEESERCIZI = " . $Ddt['CG_CT_CONTABILEESERCIZI']);
				}
				if ($AppoDdt == ''){
					try{
						$conn->AutoExecute("ddt", $Ddt, 'INSERT');
						$Ddt['ID'] = $conn->Insert_ID();
					} catch (exception $e){
						$output['message'] = $output['message'] . 'Generazione DDT in Errore ' . $AppoFattura['DOCNUM'] . ' Errore :' . $e .BRCRLF ;
						$output['failure'] = true;
						$output['success'] = false;
						goto SDIDecodeFatturaXMLFine;
					}
				}else{
					$Ddt = $AppoDdt;
				}
			}
			
			//dettaglio righe
			$i = 0;
			if ((!property_exists ( $DatiDDTRiga->children() , 'RiferimentoNumeroLinea' )) && ($Ddt != '') ){
				
				//riferimento ddt trovato in fattura
				$StrSQL = "UPDATE ddt SET CT_FAT = " . $FatID . " WHERE ID = " . $Ddt['ID'] ;
				$conn->Execute ($StrSQL);
				
				$StrSQL = "SELECT * FROM fatmovimenti WHERE CT_FAT = " . $FatID;
				$FatMovimento = $conn->Execute($StrSQL);
				while (!$FatMovimento->EOF) {
					$DdtMovimenti = WFVALUEDLOOKUP('*','ddtmovimenti',"CT_DDT = " . $Ddt['ID'] .  " AND CT_ARTICOLI = " . $FatMovimento->fields['CT_ARTICOLI'] );
					
					if (($DdtMovimenti == '') && ($AnagraficaCLIFAT['SDI_AUTODDT'] == true)){
						$DdtMovimenti = array();
						$DdtMovimenti['CT_ARTICOLI'] = $ArticoloDescrittivoID;
						$DdtMovimenti = WFRECORDCLONE($FatMovimento->fields) ;
						$DdtMovimenti['ID'] = null;
						$DdtMovimenti['CT_DDT'] = $Ddt['ID'];
						$conn->AutoExecute("ddtmovimenti", $DdtMovimenti, 'INSERT');
						$DdtMovimenti['ID'] = $conn->Insert_ID();
					}
					
					if ($DdtMovimenti != '') {
						$StrSQL = "UPDATE fatmovimenti SET CT_DDTMOVIMENTI = " . $DdtMovimenti['ID'] . " WHERE ID = " . $FatMovimento->fields['ID'] ;
						$conn->Execute ($StrSQL);
						/*
						if(
							(IsNullOrEmptyOrZeroString($DdtMovimenti['CT_ORDMOVIMENTI'])) && 
							(!IsNullOrEmptyOrZeroString($OrdiniArray[$RiferimentoNumeroLinea]['CT_ORDMOVIMENTI']))
						){
							$StrSQL = "UPDATE ddtmovimenti SET CT_ORDMOVIMENTI = " . $OrdiniArray[$RiferimentoNumeroLinea]['CT_ORDMOVIMENTI'] . " WHERE ID = " . $DdtMovimenti['ID'] ;
							$conn->Execute ($StrSQL);
						}
						*/
					}else{				
						//riferimento ordine non trovati ma presenti in fattura
						$StrSQL = "UPDATE fatmovimenti 
										SET RIF = concat(COALESCE(RIF,'') ,'Ddt:" . addslashes($DatiDDTRiga->NumeroDDT->__toString()) . 
																			" Del:" . $DatiDDTRiga->Data->__toString() . "')" .
									" WHERE ID = " . $FatMovimento->fields['ID'] ;
						$conn->Execute ($StrSQL);
					}
					$FatMovimento->MoveNext();
				}
			}
			else{
				$RiferimentoNumeroLinea = $DatiDDTRiga->children()->RiferimentoNumeroLinea;
				$i = 0;
				foreach ($RiferimentoNumeroLinea as $RiferimentoNumeroLineaRiga){
					$DdtMovimenti ='';
					$i = $i +1;
					$FatMovimento = WFVALUEDLOOKUP('*','fatmovimenti',"CT_FAT = " . $FatID . " AND RIGA = '" . $RiferimentoNumeroLineaRiga->__toString() . "'" );
					if ($FatMovimento != ''){
						if (($Ddt == '') && ($AnagraficaCLIFAT['SDI_AUTODDT'] == true)){
							$Ddt = array();
							$Ddt['ID'] = null;
							
							if ($MeStessoAzienda['ID'] == $AnagraficaCLIFAT['ID']){
								//fattura di vendita							
								$Ddt['CT_FATTURAZIONE'] = $AnagraficaFORFAT['ID'];
								$Ddt['CT_CAUSALI'] = $MRP_CAUSALEVENDITA;
							}else{
								//fattura di acquisto
								$Ddt['CT_FATTURAZIONE'] = $AnagraficaCLIFAT['ID'];
								$Ddt['CT_CAUSALI'] = $MRP_CAUSALEACQUISTO;
							}
							$Ddt['DOCNUM'] = $DatiDDTRiga->NumeroDDT->__toString();
							$Ddt['DOCDATA'] = $DatiDDTRiga->DataDDT->__toString();
							$Ddt['PDMORIGIN'] = 6; //SDI
							$Causale = WFVALUEDLOOKUP('*','causali','ID = ' . $Ddt['CT_CAUSALI'] );
							$Ddt['SEGNO'] = $Causale['SEGNO'];
							$Ddt['CG_CT_CONTABILEESERCIZI'] = WFVALUEDLOOKUP('ID', 'cg_contabileesercizi', "DATAFINE >= " . WFSQLTODATE($Ddt['DOCDATA']) . " AND DATAINIZIO <= " . WFSQLTODATE($Ddt['DOCDATA']));
							//WFVALUEDOCIDEAN($Chiave, $TestaCorrente['ID'] );
							$Ddt['CT_FAT'] = $FatID;
							$conn->AutoExecute("ddt", $Ddt, 'INSERT');
							$Ddt['ID'] = $conn->Insert_ID();
						}
							
						if ($Ddt != '') {
							//riferimento ddt trovato in fattura
							$StrSQL = "UPDATE ddt SET CT_FAT = " . $FatID . " WHERE ID = " . $Ddt['ID'] ;
							$conn->Execute ($StrSQL);
							
							if (property_exists ( $DatiDDTRiga , 'NumItem' )){
								$DdtMovimenti = WFVALUEDLOOKUP('*','ddtmovimenti',"CT_DDT = " . $Ddt['ID'] ." AND RIGA = '" . $DatiDDTRiga->NumItem->__toString() . "'");
							}
							
							if ($DdtMovimenti == ''){
								$DdtMovimenti = WFVALUEDLOOKUP('*','ddtmovimenti',"CT_DDT = " . $Ddt['ID'] .  " AND CT_ARTICOLI = " . $FatMovimento['CT_ARTICOLI'] );
							}
							
							if (($DdtMovimenti == '') && ($AnagraficaCLIFAT['SDI_AUTODDT'] == true)){
								$DdtMovimenti = array();
								$DdtMovimenti['CT_ARTICOLI'] = $ArticoloDescrittivoID;
								$DdtMovimenti = WFRECORDCLONE($FatMovimento) ;
								$DdtMovimenti['ID'] = null;
								$DdtMovimenti['CT_DDT'] = $Ddt['ID'];
								$conn->AutoExecute("ddtmovimenti", $DdtMovimenti, 'INSERT');
								$DdtMovimenti['ID'] = $conn->Insert_ID();
							}
							
							if ($DdtMovimenti != '') {
								
								$StrSQL = "UPDATE fatmovimenti SET CT_DDTMOVIMENTI = " . $DdtMovimenti['ID'] . " WHERE ID = " . $FatMovimento['ID'] ;
								$conn->Execute ($StrSQL);
								
								$StrSQL = "UPDATE ddtmovimenti SET VALORERIGA = " . $FatMovimento['VALORERIGA'] . " WHERE ID = " . $DdtMovimenti['ID'] ;
								$conn->Execute ($StrSQL);
								
								$StrSQL = "UPDATE ddtmovimenti SET VALORERIGATOT = " . $FatMovimento['VALORERIGATOT'] . " WHERE ID = " . $DdtMovimenti['ID'] ;
								$conn->Execute ($StrSQL);
																
								if( (IsNullOrEmptyOrZeroString($DdtMovimenti['CT_ORDMOVIMENTI'])) && 
									(!IsNullOrEmptyOrZeroString($OrdiniArray[$RiferimentoNumeroLineaRiga->__toString()]['CT_ORDMOVIMENTI']))  ){
									$StrSQL = "UPDATE ddtmovimenti SET CT_ORDMOVIMENTI = " . $OrdiniArray[$RiferimentoNumeroLineaRiga->__toString()]['CT_ORDMOVIMENTI'] . " WHERE ID = " . $DdtMovimenti['ID'] ;
									$conn->Execute ($StrSQL);
								}
							}else{				
								//riferimento ordine non trovati ma presenti in fattura
								$StrSQL = "UPDATE fatmovimenti 
											SET RIF = concat(COALESCE(RIF,'') ,'Ddt:" . addslashes($DatiDDTRiga->IdDocumento->__toString()) . 
																				" Del:" . $DatiDDTRiga->Data->__toString() . 
																				" Riga:" . $RiferimentoNumeroLineaRiga->__toString() . "')" .
											" WHERE ID = " . $FatMovimento['ID'] ;
								$conn->Execute ($StrSQL);
							}
						}else{
							//riferimento ordine non trovati ma presenti in fattura
							$StrSQL = "UPDATE fatmovimenti 
										SET RIF = concat(COALESCE(RIF,'') , 'Ddt:" . addslashes($DatiDDTRiga->IdDocumento->__toString()) . 
																			" Del:" . $DatiDDTRiga->Data->__toString() . 
																			" Riga:" . $RiferimentoNumeroLineaRiga->__toString() . "')" .
										" WHERE ID = " . $FatMovimento['ID'] ;
							$conn->Execute ($StrSQL);
						}
					}
					if ($i>100) break;
				}
			}
			
			if ($r>100) break;
		}
	
	}
	
	
	/***************************/
	/* 	FATT ACCOMPAGNATORIE   */
	/***************************/
	//fatture accompagnatorie
	if ($Ddt == ''){
		$Ddt = WFVALUEDLOOKUP('*','ddt',"CT_FATTURAZIONE = " . $AppoFattura['CT_FATTURAZIONE'] . 
												" AND DOCNUM = '" . $AppoFattura['DOCNUM'] . "'" .
												" AND DOCDATA = '" . $AppoFattura['DOCDATA'] . "'" .
												" AND SEGNO = " . $Causale['SEGNO']);
		if ($Ddt == '') {										
			$Ddt = WFVALUEDLOOKUP('*','ddt',"CT_FATTURAZIONE = " . $AppoFattura['CT_FATTURAZIONE'] . 
											" AND DOCDATA = '" . $AppoFattura['DOCDATA'] . "'" .
											" AND STATO = 'I'" .
											" AND SEGNO = " . $Causale['SEGNO']);
		}
		//crea testata o aggiorna legame fattura
		if ($Ddt != '') {
			//riferimento ddt trovato in fattura
			$StrSQL = "UPDATE ddt SET CT_FAT = " . $FatID . " WHERE ID = " . $Ddt['ID'] ;
			$conn->Execute ($StrSQL);
		}
	}
	
	
	
	/***************************/
	/* 		RIGHE PAGAMENTO	  */
	/***************************/
	$strSQL = 'DELETE FROM fatscadenze WHERE CT_FAT = ' . $FatID;
	$conn->Execute($strSQL);
	
	if (property_exists ( $DatiPagamento , 'DettaglioPagamento' )){
		$DettaglioPagamento = $DatiPagamento->children()->DettaglioPagamento;
		foreach ($DettaglioPagamento as $DettaglioPagamentoRiga){
			$AppoFatScadenze = array();
			$AppoFatScadenze['CT_FAT'] = $FatID;
			
			$TipoPagamentoSDI = $DettaglioPagamentoRiga->ModalitaPagamento->__toString();
			$TipoPagamento = WFVALUEDLOOKUP('*', 'pagamentitipo', "CODICESDI = '" . $TipoPagamentoSDI . "'");
			$AppoFatScadenze['CT_PAGAMENTITIPO'] = $TipoPagamento['ID'];
			
			if (property_exists ( $DettaglioPagamentoRiga , 'IBAN' )){
				$AppoFatturaIban = array();
				$AppoFatturaIban['IBAN'] = left(trim($DettaglioPagamentoRiga->IBAN->__toString()),27);
				$conn->AutoExecute("fat", $AppoFatturaIban, 'UPDATE', 'ID =' . $FatID);
				
				if ($AppoFattura['SEGNO'] == 1){
					//FT ACQUISTO
					if (IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['IBAN'])){
						$AppoAnagrafica = array();
						$AppoAnagrafica['IBAN'] = left(trim($DettaglioPagamentoRiga->IBAN->__toString()),27);
						$conn->AutoExecute('anagrafiche', $AppoAnagrafica, 'UPDATE', 'ID = ' . $AnagraficaCLIFAT['ID']);
					}
				}
			}
			
			if (property_exists ( $DettaglioPagamentoRiga , 'DataScadenzaPagamento' )){
				$AppoFatScadenze['DATA'] = $DettaglioPagamentoRiga->DataScadenzaPagamento->__toString();
			}elseif (property_exists ( $DettaglioPagamentoRiga , 'GiorniTerminiPagamento' )){
				$RataData = new DateTime($DettaglioPagamentoRiga->DataRiferimentoTerminiPagamento->__toString());
				$RataData = date_add($RataData, date_interval_create_from_date_string($DettaglioPagamentoRiga->GiorniTerminiPagamento->__toString() . ' days'));
				$AppoFatScadenze['DATA'] = $RataData;
			}else{
				$AppoFatScadenze['DATA'] = $AppoFattura['DOCDATA'];
			}
			
			$AppoFatScadenze['VALORE'] = $DettaglioPagamentoRiga->ImportoPagamento->__toString();
			$AppoFatScadenze['VALOREINVALUTA'] = $DettaglioPagamentoRiga->ImportoPagamento->__toString();
			try{
				$conn->AutoExecute("fatscadenze", $AppoFatScadenze, 'INSERT');
			} catch (exception $e){
				$output['message'] = $output['message'] . 'Fattura Errore Scadenze '  . WFFileName($FileName) . ' ' . $AppoFattura['DOCNUM'] .BRCRLF . $e->getMessage().BRCRLF;
			}
		}
	}
	
	
	/***************************/
	/*	TOT SE NON DICHIARATI  */
	/***************************/
	if ($AppoFattura['TOTALIDEF'] == 0){
		//$conn->AutoExecute("fat", $AppoFattura, 'UPDATE', "ID = " .  $FatID);
	}
	
	
	/***************************/
	/*	      ALLEGATI         */
	/***************************/
	if (property_exists ( $FatturaElettronicaBody , 'Allegati' )){
		$Allegati = $FatturaElettronicaBody->children()->Allegati;
		foreach ($Allegati as $Allegato){
			$NomeAttachment = $Allegato->NomeAttachment->__toString();
			$file_parts = pathinfo($NomeAttachment);
			if ($file_parts['extension'] == ''){
				$NomeAttachment = $NomeAttachment . '.' . $Allegato->FormatoAttachment->__toString();
			}
			
			$Attachment = $Allegato->Attachment->__toString();
			
			$filebuffer = base64_decode($Attachment);
			
			$FileNameNew = WFFileName($FileName) . '.' . WFFileExt($NomeAttachment);
			
			$outHandle = fopen($ExtJSDevDOC . $FileNameNew , 'wb');
			fwrite($outHandle, $filebuffer);
			fclose($outHandle);
				
			$output['message'] = $output['message'] . 'Fattura Allegato ' . $NomeAttachment .BRCRLF ;
			
			$AppoDocument = array();
			$AppoDocument['CT_TABLE'] = 'fat';
			$AppoDocument['CT_ID'] = $FatID;
			$AppoDocument['DESCNAME'] = 'Allegato Fatt XML'; 
			$AppoDocument['FILENAMEORIG'] = $NomeAttachment; 
			$AppoDocument['FILENAME'] = $FileNameNew; 	 
			$AppoDocument['FILEEXT'] = WFFileExt($NomeAttachment);
			$conn->AutoExecute("aaadocuments", $AppoDocument, 'INSERT');
		}
	}
	if ($conn->HasFailedTrans()) {
		$output['message'] = $output['message'] . 'Fattura Errore filename:'  . WFFileName($FileName) . ' docnum:' . $AppoFattura['DOCNUM'] .BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		$conn->completeTrans(); 
		return null;
	}else{
		$output['message'] = $output['message'] . 'Fattura Registrata docnum:' . $AppoFattura['DOCNUM'] .BRCRLF;
		$output['failure'] = false;
		$output['success'] = true;
		$conn->completeTrans(); 
		return $FatID;
	}
	
	SDIDecodeFatturaXMLFine:
		$output['message'] = $output['message'] . 'Fattura Errore filename:' . $FileName . ' id:' . $FatID . BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		$conn->completeTrans(); 
}

function SDIDecodeMessageXML($FileName = '') {
	global $conn;
	global $output;
	global $ExtJSDevImportRAW;
	global $ExtJSDevTMP;
	
	
	$Riposta = array();
	$Riposta['Messaggio'] = '';
	$Riposta['Status'] = '';
	$Riposta['Errori'] = '';
	$Riposta['ProgressivoInvio'] = '';
	
	$xml = simplexml_load_file($FileName);
	if (!$xml) {
		$output['message'] = $output['message'] .  $FileName .' Fattura XML Errore ' . BRCRLF ;
		$output['failure'] = true;
		$output['success'] = false;
		return $Riposta;
	}
	
	$NomeFile = $xml->children()->NomeFile;
	if (property_exists ( $xml->children() , 'IdentificativoSdI' )){
		$Riposta['NomeFile'] = $NomeFile;
		$Riposta['ProgressivoInvio'] = explode('_',explode('.',$NomeFile)[0])[1];
		$Riposta['Messaggio'] = 'Trasmissione: ' . $NomeFile. CRLF;
		
		if (property_exists ( $xml->children() , 'EsitoCommittente' )){
			$EsitoCommittente = $xml->children()->EsitoCommittente;
			if ($EsitoCommittente->Esito->__toString() ==  'EC01'){
				$Riposta['Status'] = 'OK Accettato Ufficio';
			}else{
				$Riposta['Messaggio'] = $Riposta['Messaggio'] . $EsitoCommittente->Descrizione->__toString() . CRLF;	
				$Riposta['Errori'] = $Riposta['Errori'] . $EsitoCommittente->Descrizione->__toString() . CRLF;
				$Riposta['Status'] = 'KO - ' . $EsitoCommittente->Descrizione->__toString();
				$replace_str = array('"', "'", ",");
				$Riposta['Status'] = str_replace($replace_str, "", $Riposta['Status']);
			}
		}elseif (property_exists ( $xml->children() , 'ListaErrori' )){
			$DataOraRicezione = $xml->children()->DataOraRicezione;
			$Riposta['DataOra'] = $DataOraRicezione;
			$Riposta['Messaggio'] = $Riposta['Messaggio'] . 'KO ' . $DataOraRicezione;
			$ListaErrori = $xml->children()->ListaErrori;
			foreach ($ListaErrori as $Errore){	
				$Riposta['Messaggio'] = $Riposta['Messaggio'] . $Errore->Errore->children()->Descrizione->__toString() . CRLF;	
				$Riposta['Errori'] = $Riposta['Errori'] . $Errore->Errore->children()->Descrizione->__toString() . CRLF;
				$Riposta['Status'] = 'KO - ' . $Errore->Errore->children()->Descrizione->__toString();
				$replace_str = array('"', "'", ",");
				$Riposta['Status'] = str_replace($replace_str, "", $Riposta['Status']);
			}
			if (strrpos($Riposta['Errori'], "duplicata") !== false) {
				$Riposta['Status'] = 'OK';
			}
		}else{	
			$DataOraConsegna = $xml->children()->DataOraConsegna;
			$Riposta['DataOra'] = $DataOraConsegna;
			$Riposta['Messaggio'] = $Riposta['Messaggio'] . 'OK ' . $DataOraConsegna;
			$Riposta['Status'] = 'OK';
		
		}
	}
	return $Riposta;
	
}

function SDIDecodeCorrispettiviXML($FileName = '') {
	global $conn;
	global $output;
	global $ExtJSDevImportRAW;
	global $ExtJSDevTMP;
	
	
	$Riposta['Messaggio'] = '';
	$Riposta['Status'] = '';
	$Riposta['Errori'] = '';
	$Riposta['ProgressivoInvio'] = '';
	
	$xml = simplexml_load_file($FileName);
	if (!$xml) {
		$output['message'] = $output['message'] .  $FileName .' Fattura XML Errore ' . BRCRLF ;
		$output['failure'] = true;
		$output['success'] = false;
		return null;
	}
	
	if (property_exists ( $xml->children() , 'Trasmissione' )){
		$Trasmissione = $xml->children()->Trasmissione;
		$AppoCorrispettivi['PROGRESSIVO'] = $Trasmissione->Progressivo->__toString();
		$AppoCorrispettivi['ECR'] = $Trasmissione->Dispositivo->IdDispositivo->__toString(); 
		$AppoCorrispettivi['DATAORA'] = $xml->DataOraRilevazione->__toString(); 
		$AppoCorrispettivi['FILENAMEXML'] = WFFileNameExt($FileName);
		try {
			$conn->AutoExecute("cg_corrispettivi", $AppoCorrispettivi, 'INSERT');
		} catch (exception $e){
			$CorrispettiviID = WFVALUEDLOOKUP('ID','cg_corrispettivi',"PROGRESSIVO = '" . $AppoCorrispettivi['PROGRESSIVO'] . "'" .
																		 " AND ECR = '" . $AppoCorrispettivi['ECR'] . "'");
			return $CorrispettiviID;
		}
		$CorrispettiviID = $conn->Insert_ID();
		$AppoCorrispettivi['ID'] = $CorrispettiviID;
		$AppoCorrispettivi['TOTALE'] = 0;
		
		if (property_exists ( $xml->children() , 'DatiRT' )){
			$DatiRT = $xml->children()->DatiRT;
			foreach ($DatiRT as $DatiRTIVA){	
				$Riepilogo = $DatiRTIVA->Riepilogo->children();
				$AppoCorrispettiviIva = array();
				$AppoCorrispettiviIva['CG_CT_CORRISPETTIVI'] = $AppoCorrispettivi['ID'];
				$AppoCorrispettiviIva['IMPONIBILE'] = $Riepilogo->Ammontare->__toString();
				if (property_exists ( $Riepilogo , 'Natura' )){
					$AppoCorrispettiviIva['IMPOSTA'] = 0;
					$AliquotaNatura = WFVALUEDLOOKUP('*','aliquotenatura',"CODICE = '" . $Riepilogo->Natura->__toString() . "'");
					$Aliquota = WFVALUEDLOOKUP('*','aliquote'," SDIDECODE = 1 " .
														  " AND CT_ALIQUOTENATURA = " . $AliquotaNatura['ID'] );															 
					$AppoCorrispettiviIva['CT_ALIQUOTE'] = $Aliquota['ID'];
				}
				if (property_exists ( $Riepilogo , 'IVA' )){
					$Iva = $Riepilogo->IVA->children();
					$AppoCorrispettiviIva['IMPOSTA'] = $Iva->Imposta->__toString();
					$Aliquota = WFVALUEDLOOKUP('*','aliquote','VALORE = ' . $Iva->AliquotaIVA->__toString() . 
															 " AND SDIDECODE = 1 " .
															 " AND CT_ALIQUOTENATURA is null " );
					$AppoCorrispettiviIva['CT_ALIQUOTE'] = $Aliquota['ID'];
				}
				$AppoCorrispettivi['TOTALE'] =  $AppoCorrispettivi['TOTALE'] + 
												$AppoCorrispettiviIva['IMPONIBILE'] + $AppoCorrispettiviIva['IMPOSTA'];
				$conn->AutoExecute("cg_corrispettiviiva", $AppoCorrispettiviIva, 'INSERT');
			}
		}
		$conn->AutoExecute("cg_corrispettivi", $AppoCorrispettivi, 'UPDATE', 'ID = ' . $AppoCorrispettivi['ID']);
		return $CorrispettiviID;
	}
	return null;
}
	


function SDISignXML($FileName = '') {
	global $conn;
	global $ExtJSDevExportRAW;
	global $output;
	global $ExtJSDevDOC;
	
	/* XML SIGN */

	require("../chilkat.php");
	$glob = new CkGlobal();
	$success = $glob->UnlockBundle('NETSYS.CB1012020_L9byDuyLoM6E');
	if ($success != true) {
		$output['message'] = $output['message'] . "Error chilkat glob ". $glob->lastErrorText() . BRCRLF;
		exit;
	}
	$status = $glob->get_UnlockStatus();
	if ($status != 2) {
		$output['message'] = $output['message'] . "Error chilkat license". BRCRLF;
		exit;
	}

	$crypt = new CkCrypt2();
	// Use a digital certificate and private key from a PFX file (.pfx or .p12).
	$pfxPath = $ExtJSDevExportRAW . 'sdi/pfx/localhost.pfx';
	$pfxPassword = 'dQ4532RxxH9y';

	$cert = new CkCert();
	$success = $cert->LoadPfxFile($pfxPath,$pfxPassword);
	if ($success != true) {
		echo "Error chilkat cert ". $cert->lastErrorText() . BRCRLF;
		$output['message'] = $output['message'] . "Error chilkat cert ". $cert->lastErrorText() . BRCRLF;
		exit;
	}
	// Provide the signing cert (with associated private key).
	$success = $crypt->SetSigningCert($cert);
	if ($success != true) {
		echo "Error chilkat crypt ". $crypt->lastErrorText() . BRCRLF;
		$output['message'] = $output['message'] . "Error chilkat crypt ". $crypt->lastErrorText() . BRCRLF;
		exit;
	}
	// Indicate that SHA-256 should be used.
	$crypt->put_HashAlgorithm('sha256');

	// Specify the signed attributes to be included.
	// (This is what makes it CAdES-BES compliant.)
	$jsonSignedAttrs = new CkJsonObject();
	$jsonSignedAttrs->UpdateInt('contentType',1);
	$jsonSignedAttrs->UpdateInt('signingTime',1);
	$jsonSignedAttrs->UpdateInt('messageDigest',1);
	$jsonSignedAttrs->UpdateInt('signingCertificateV2',1);
	$crypt->put_SigningAttributes($jsonSignedAttrs->emit());

	$inFile  = $FileName;
	$sigFile = $FileName . '.p7m';

	// Create the CAdES-BES signature, which contains the original data.
	$success = $crypt->CreateP7M($inFile,$sigFile);
	if ($success == false) {
		echo "Error chilkat crypt ". $crypt->lastErrorText() . BRCRLF;
		$output['message'] = $output['message'] . "Error chilkat crypt ". $crypt->lastErrorText() . BRCRLF;
		exit;
	}
	// Now we'll encrypt what was signed using FatturaPA's certificate (from a PEM file)
	$encryptCert = new CkCert();
	$success = $encryptCert->LoadFromFile($ExtJSDevExportRAW . 'sdi/certs/fatturapa_cert.pem');
	if ($success != true) {
		echo("Error chilkat crypt ". $encryptCert->lastErrorText() );
		$output['message'] = $output['message'] . "Error chilkat crypt ". $encryptCert->lastErrorText() . BRCRLF;
		exit;
	}
	$crypt->put_CryptAlgorithm('pki');
	$success = $crypt->SetEncryptCert($encryptCert);
	if ($success != true) {
		echo "Error chilkat crypt ". $crypt->lastErrorText() . BRCRLF;
		$output['message'] = $output['message'] . "Error chilkat crypt ". $crypt->lastErrorText() . BRCRLF;
		exit;
	}
	// Indicate the underlying bulk encryption algorithm to be used:
	$crypt->put_Pkcs7CryptAlg('aes');
	$crypt->put_KeyLength(128);

	// There's one last option that could be set.  If is the RSA encryption encryption/padding scheme. 
	// By default, RSAES_PKCS1-V1_5 is used.  If desired, the OaepPadding property could be set to true to
	// use RSAES_OAEP.  (We'll leave it set at the default value of false)
	$crypt->put_OaepPadding(false);

	// Everything is specified.  Encrypt the .p7m to create a new .p7m (which adds a layer of encryption around the opaque signature).
	// The output is PKCS7 in binary DER format.
	$success = $crypt->CkEncryptFile($sigFile,$ExtJSDevExportRAW . 'sdi/signed_and_encrypted.p7m');
	if ($success != true) {
		echo  "Error chilkat ". $gen->lastErrorText() . BRCRLF;
		$output['message'] = $output['message'] . "Error chilkat ". $gen->lastErrorText() . BRCRLF;
		exit;
	}

	return $sigFile;
}

function SDICreaAggiornaAnagrafica($CedenteCessionario ){
	global $conn;
	global $output;
	global $ExtJSDevImportRAW;
	global $ExtJSDevTMP;
	
	$AnagraficaCLIFAT = '';
	$IdFiscaleIVA = '';
	$IdFiscaleCF = '';
	$AppoRecord = array();
	$DatiAnagrafici = '';
	$DatiAnagraficiIva = '';
	
	$MeStessoAzienda = WFVALUEDLOOKUP('*','anagrafiche','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'));
	
	//SEDE $Sede $DatiAnagrafici
	if (property_exists ($CedenteCessionario->children(),'IdFiscaleIVA')){
		$DatiAnagrafici = $CedenteCessionario->children();
		$DatiAnagraficiIva = $CedenteCessionario->children()->IdFiscaleIVA;
		$Sede = $CedenteCessionario->children()->Sede->children();
	}
	elseif (property_exists ($CedenteCessionario->children(), 'DatiAnagrafici')){
		$DatiAnagrafici = $CedenteCessionario->children()->DatiAnagrafici;
		$DatiAnagraficiIva = $DatiAnagrafici->children()->IdFiscaleIVA;
		$Sede = $CedenteCessionario->children()->Sede->children();
	}
	elseif (property_exists ($CedenteCessionario->children(), 'IdentificativiFiscali')){
		$DatiAnagrafici = $CedenteCessionario->children()->IdentificativiFiscali;
		$DatiAnagraficiIva = $DatiAnagrafici->children()->IdFiscaleIVA;
		$Sede = $CedenteCessionario->children()->AltriDatiIdentificativi->children()->Sede->children();
	}
	else{
		$DatiAnagrafici = $CedenteCessionario->children();
		$DatiAnagraficiIva = $DatiAnagrafici->children()->IdFiscaleIVA;
		$Sede = $CedenteCessionario->children()->Sede->children();
	}
	$AppoRecord['NAZIONE'] = 'IT';
	if (property_exists ($Sede, 'Nazione')){
		$AppoRecord['NAZIONE'] = $Sede->Nazione->__toString();
	}
	
	if (property_exists ($CedenteCessionario , 'Denominazione' )){
		$AppoRecord['DESCRIZIONE'] = $CedenteCessionario->Denominazione->__toString();
	}else{
		$Anagrafica = $DatiAnagrafici->children()->Anagrafica;
		if (property_exists ($Anagrafica , 'Denominazione' )){
			$AppoRecord['DESCRIZIONE'] = $Anagrafica->Denominazione->__toString();
		}else{
			$AppoRecord['DESCRIZIONE'] = '';
			if (property_exists ($Anagrafica , 'Nome' )){
				$AppoRecord['DESCRIZIONE'] = $Anagrafica->Nome->__toString() ;
			}
			if (property_exists ($Anagrafica , 'Cognome' )){
				$AppoRecord['DESCRIZIONE'] = $AppoRecord['DESCRIZIONE'] . ' ' . $Anagrafica->Cognome->__toString();
			}
		}
	}
	$AppoRecord['INDIRIZZO'] = strtoupper($Sede->Indirizzo->__toString() . ' ' . $Sede->NumeroCivico->__toString());
	$AppoRecord['CAP'] = strtoupper($Sede->CAP->__toString());
	$AppoRecord['CITTA'] = strtoupper($Sede->Comune->__toString());  
	$AppoRecord['PROVINCIA'] = strtoupper($Sede->Provincia->__toString()); 
	$AppoRecord['NAZIONE'] = strtoupper($Sede->Nazione->__toString());
	$AppoRecord['LINGUA'] = strtoupper($Sede->Nazione->__toString());
	
	//STANDARD DEFAULT
	if (!IsNullOrEmptyOrZeroString($AppoRecord['CG_CT_CONTROPARTITAATTIVA'])){
		if (WFVALUEGLOBAL('CG_CONTOVENDITE')>1){
			$AppoRecord['CG_CT_CONTROPARTITAATTIVA'] =  WFVALUEGLOBAL('CG_CONTOVENDITE');
		}
	}
	
	if (!IsNullOrEmptyOrZeroString($AppoRecord['CG_CT_CONTABILEMODELLIATTIVA'])){
		if (WFVALUEGLOBAL('CG_MODELLIATTIVO')>1){
			$AppoRecord['CG_CT_CONTABILEMODELLIATTIVA'] =  WFVALUEGLOBAL('CG_MODELLIATTIVO');
		}
	}
	
	if (!IsNullOrEmptyOrZeroString($AppoRecord['CG_CT_CONTROPARTITAPASSIVA'])){
		if (WFVALUEGLOBAL('CG_CONTOACQUISTI')>1){
			$AppoRecord['CG_CT_CONTROPARTITAPASSIVA'] =  WFVALUEGLOBAL('CG_CONTOACQUISTI');
		}
	}
	
	if (!IsNullOrEmptyOrZeroString($AppoRecord['CG_CT_CONTABILEMODELLIPASSIVA'])){
		if (WFVALUEGLOBAL('CG_MODELLIPASSIVO')>1){
			$AppoRecord['CG_CT_CONTABILEMODELLIPASSIVA'] =  WFVALUEGLOBAL('CG_MODELLIPASSIVO');
		}
	}
	
	if (property_exists ( $CedenteCessionario->children() , 'Contatti' )){
		$Contatti = $CedenteCessionario->children()->Contatti;
		if (property_exists ($Contatti , 'Telefono' )){
			$AppoRecord['TELEFONO'] = $Contatti->Telefono->__toString(); 
		}
		if (property_exists ($Contatti , 'Fax' )){
			$AppoRecord['FAX'] = $Contatti->Fax->__toString();
		}
	}
	
	//PIVA $IdFiscaleIVA
	if (property_exists ($DatiAnagraficiIva , 'IdCodice' )){
		$IdFiscaleIVA = $DatiAnagraficiIva->IdCodice->__toString(); 
		$AppoRecord['PIVANAZIONE'] = $DatiAnagraficiIva->IdPaese->__toString(); 
		$AppoRecord['PIVA'] = trim($IdFiscaleIVA);
	}
	
	if ($AppoRecord['PIVA'] == "00000000000"){ $AppoRecord['PIVA'] = null;}
	
	//CF $IdFiscaleCF
	if (property_exists ($DatiAnagrafici , 'CodiceFiscale' )){
		$IdFiscaleCF = $DatiAnagrafici->CodiceFiscale->__toString(); 
		$AppoRecord['CF'] = $IdFiscaleCF;
	}
	
	//se stessi
	if ($IdFiscaleIVA == $MeStessoAzienda['PIVA']){
		return $MeStessoAzienda;
	}
	if ($IdFiscaleCF == $IdFiscaleIVA){
		$IdFiscaleCF = '';
	}
	if ($IdFiscaleIVA == "00000000000") {
		$IdFiscaleIVA = '';
		$Anagrafica = $DatiAnagrafici->children()->Anagrafica;
		$AppoRecord['DESCRIZIONE'] = $Anagrafica->Nome->__toString() . ' ' . $Anagrafica->Cognome->__toString();
		$AnagraficaCLIFAT = WFVALUEDLOOKUP('*', 'anagrafiche', "DESCRIZIONE = '"  . $AppoRecord['DESCRIZIONE'] . "'");
	}
	if ( ($AnagraficaCLIFAT == '' )
		&&  (!IsNullOrEmptyOrZeroString ($IdFiscaleIVA)) 
		&&  (IsNullOrEmptyOrZeroString ($IdFiscaleCF)) 
		  ){
		$AnagraficaCLIFAT = WFVALUEDLOOKUP('*', 'anagrafiche', "PIVA = '"  . $IdFiscaleIVA . "'");
	}
	if ( ($AnagraficaCLIFAT == '' )
		&&  (IsNullOrEmptyOrZeroString ($IdFiscaleIVA)) 
		&&  (!IsNullOrEmptyOrZeroString ($IdFiscaleCF)) 
		  ){
		$AnagraficaCLIFAT = WFVALUEDLOOKUP('*', 'anagrafiche', "CF = '"  . $IdFiscaleCF . "'");
	}
	if (($AnagraficaCLIFAT == '' ) 
		&&  (!IsNullOrEmptyOrZeroString ($IdFiscaleIVA)) 
		&&  (!IsNullOrEmptyOrZeroString ($IdFiscaleCF)) 
		){
		$AnagraficaCLIFAT = WFVALUEDLOOKUP('*', 'anagrafiche', "PIVA = '"  . $IdFiscaleIVA . "' AND CF = '"  . $IdFiscaleCF . "'");
		if ( ($AnagraficaCLIFAT == '' ) && (strlen($IdFiscaleCF) == 16)){
			$AnagraficaCLIFAT = WFVALUEDLOOKUP('*', 'anagrafiche', "PIVA = '"  . $IdFiscaleIVA . "'");
		}
	}
	
	if ($AnagraficaCLIFAT == '') {
		//INSERT
		if (IsNullOrEmptyOrZeroString($IdFiscaleCF) && IsNullOrEmptyOrZeroString($IdFiscaleIVA)){
			//ERRORE
			return;
		}
		$AppoRecord = WFARRAYEPURE($AppoRecord);
		$conn->AutoExecute('anagrafiche', $AppoRecord, 'INSERT');
		$AnagraficaCLIFAT = WFVALUEDLOOKUP('*', 'anagrafiche', "ID = "  . $conn->Insert_ID());
	}
	else{
		//UPDATE ESCLUSO SE STESSO
		if ($AppoRecord['PIVA'] != $MeStessoAzienda['PIVA']){
			$AppoRecord = WFARRAYEPURE($AppoRecord);
			$conn->AutoExecute('anagrafiche', $AppoRecord, 'UPDATE', 'ID = ' . $AnagraficaCLIFAT['ID']);
		}
	}
	
	return $AnagraficaCLIFAT;
}

function SDIEncodeIVAXML($DataIniziale, $SdiProgressivo, $FileName = '') {
	global $conn;
	global $ExtJSDevExportRAW;
	global $output;
	
	$MeStessoAzienda = WFVALUEDLOOKUP('*','anagrafiche','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'));
	if ($MeStessoAzienda == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICAAZIENDA  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return false;
	}
	$AnagraficaIntermediario = WFVALUEDLOOKUP('*','anagrafiche','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAINTERMEDIARIO'));
	if ($AnagraficaIntermediario == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICAINTERMEDIARIO  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return false;
	}
	$AnagraficaDichiarante = WFVALUEDLOOKUP('*','anagrafiche','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICADICHIARANTE'));
	if ($AnagraficaDichiarante == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICADICHIARANTE  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return false;
	}
	if (WFVALUEGLOBAL('CG_CARICAINTERMEDIARIO') == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_CARICAINTERMEDIARIO  non definito '.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return false;
	}
	if (WFVALUEGLOBAL("CG_LIQUIDAZIONEMENSILE") == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_LIQUIDAZIONEMENSILE  non definito'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return false;
	}
	
	$StrSQL = "SELECT * 
				FROM cg_liquidazioniiva 
				WHERE CONCAT( YEAR(ANNOMESE), '-', QUARTER(ANNOMESE) ) = '" . $DataIniziale .  "'"; 
	$rsLiquidazioni = $conn->Execute($StrSQL);
	
	$recordEsercizio  = WFVALUEDLOOKUP('*', 'cg_contabileesercizi', "DATAFINE >= " . WFSQLTODATE($DataIniziale. '-01') . 
																" AND DATAINIZIO <= " . WFSQLTODATE($DataIniziale. '-01') );
	$FatturatoAttivita = 0;
	$FatturatoPassivita = 0;
	$IvaAttivita = 0;
	$IvaPassiva = 0;
	$IvaDetratta = 0;
	$IvaTotale = 0;
	$Interessi = 0;
	$IvaMese = 0;
	$IvaMesePrec = 0;
	$Compensato =0;
	$IvaMesePrec = $rsLiquidazioni->fields['TOTALEMESEPREC'];
	
	$writer = new XMLWriter();  
	$writer->openMemory();
	$writer->startDocument('1.0','UTF-8');  
	$writer->setIndent(4); 
	
	$writer->startElement('iv:Fornitura'); 
		$writer->writeAttribute('xmlns:cm','urn:www.agenziaentrate.gov.it:specificheTecniche:sco:common');
		$writer->writeAttribute('xmlns:sc','urn:www.agenziaentrate.gov.it:specificheTecniche:sco:common');
		$writer->writeAttribute('xmlns:iv','urn:www.agenziaentrate.gov.it:specificheTecniche:sco:ivp');
		
		/* 	INTESTAZIONE DATI ANAGRAFICI AZIENDA  */
		$writer->startElement('iv:Intestazione');
			$writer->writeElement('iv:CodiceFornitura', 'IVP18'); 
			if ($AnagraficaDichiarante['ID'] != $MeStessoAzienda['ID']){
				$writer->writeElement('iv:CodiceFiscaleDichiarante', $AnagraficaDichiarante['CF']); 
				$writer->writeElement('iv:CodiceCarica', WFVALUEGLOBAL('CG_CARICAINTERMEDIARIO'));//1 legalerapp 8 liquidatore
			}
		$writer->endElement();  
		
		/* 	Comunicazione iva  */
		$writer->startElement('iv:Comunicazione');
			$writer->writeAttribute('identificativo', '00001'); 

			$writer->startElement('iv:Frontespizio');
				$writer->writeElement('iv:CodiceFiscale', $MeStessoAzienda['CF']); 
				$writer->writeElement('iv:AnnoImposta', WFVALUEYEAR($DataIniziale )); 
				$writer->writeElement('iv:PartitaIVA', $MeStessoAzienda['PIVA']); 
				//$writer->writeElement('iv:LiquidazioneGruppo', 0);
				
				if ($AnagraficaDichiarante['ID'] != $MeStessoAzienda['ID']){
					$writer->writeElement('iv:CFDichiarante', $AnagraficaDichiarante['CF']);
					$writer->writeElement('iv:CodiceCaricaDichiarante', WFVALUEGLOBAL('CG_CARICAINTERMEDIARIO')); //1 legalerapp 8 liquidatore
					if (!IsNullOrEmptyOrZeroString($MeStessoAzienda['CF'])){
						$writer->writeElement('iv:CodiceFiscaleSocieta', $MeStessoAzienda['CF']);	
					}
				}		
				
				$writer->writeElement('iv:FirmaDichiarazione', 1);  
				$writer->writeElement('iv:CFIntermediario', $AnagraficaIntermediario['CF']);
				if ($AnagraficaIntermediario['ID'] == $MeStessoAzienda['ID']){
					$writer->writeElement('iv:ImpegnoPresentazione', 1);  // azienda 
				}else{
					$writer->writeElement('iv:ImpegnoPresentazione', 2);  // commercialista
				}
				$writer->writeElement('iv:DataImpegno', WFVALUENOW('dmY'));
				$writer->writeElement('iv:FirmaIntermediario', 1); 
			$writer->endElement();  
			
			$writer->startElement('iv:DatiContabili');
			$mese = 0;
			$ModuloI = 1;
			while (!$rsLiquidazioni->EOF) {
				$mese = $mese +1;
				$FatturatoAttivita =  $rsLiquidazioni->fields['FATTURATOATTIVITA'];
				$FatturatoPassivita = $rsLiquidazioni->fields['FATTURATOPASSIVITA'];
				$IvaAttivita = $rsLiquidazioni->fields['TOTALEATTIVA'];
				$IvaPassivita = 0+$rsLiquidazioni->fields['TOTALEPASSIVITA'];
				
				
				if (!IsNullOrEmptyString($recordEsercizio['PRORATA'])){
					if (IsNullOrEmptyOrZeroString($rsLiquidazioni->fields['TOTALEPASSIVITAPRORATA'])){
						$IvaDetratta = 0 + $rsLiquidazioni->fields['TOTALEPASSIVITAPRORATA'];
					}else{
						$IvaDetratta = 0 + abs($IvaPassivita);
					}
				}else{
					$IvaDetratta = 0 + abs($IvaPassivita);
				} 
				$IvaTotale =  $rsLiquidazioni->fields['TOTALEIVA'];
				$Interessi = $rsLiquidazioni->fields['INTERESSI'];
				$IvaMese = $IvaMese + $rsLiquidazioni->fields['TOTALEMESE'];
				$Compensato = $rsLiquidazioni->fields['COMPENSATO'];
				$Versato = $rsLiquidazioni->fields['VERSATO'];
				$AnnoMese = $rsLiquidazioni->fields['ANNOMESE'];
				$Saldo = $rsLiquidazioni->fields['SALDO'];
				$IvaMesePrec = $rsLiquidazioni->fields['TOTALEMESEPREC'];
				$IvaAnnoPrec = $rsLiquidazioni->fields['CREDITOANNOPREC'];
				$IvaAcconto = $rsLiquidazioni->fields['ACCONTO'];
				
				$writer->startElement('iv:Modulo');
					$writer->writeElement('iv:NumeroModulo', $ModuloI); 
					if (WFVALUEGLOBAL("CG_LIQUIDAZIONEMENSILE") == 1){
						$writer->writeElement('iv:Mese', CdecSTD(WFVALUEMONTH($AnnoMese),0)); 
					}elseif (WFVALUEGLOBAL("CG_LIQUIDAZIONEMENSILE") == 3){
						$Appo = WFVALUETRIMESTRE($AnnoMese);
						
						$datetime = new DateTime();
						if ($AnnoMese != "") {
							if ($AnnoMese instanceof DateTime) {
								$datetime = $AnnoMese;
							} else {
								$datetime = new DateTime($AnnoMese);
							}
						}
						$mese = $datetime->format('n');
						if($mese==1||$mese==2||$mese==3){
						  $writer->writeElement('iv:Trimestre', 1);
						}elseif($mese==4||$mese==5||$mese==6){
						  $writer->writeElement('iv:Trimestre', 2);
						}elseif($mese==7||$mese==8||$mese==9){
						  $writer->writeElement('iv:Trimestre', 3);
						}elseif($mese==10||$mese==11||$mese==12){
							//if ($Appo == 4 ) $Appo = 5;
						  $writer->writeElement('iv:Trimestre', 5);
						}
					}
					//$writer->writeElement('iv:Subfornitura', 0); 
					$writer->writeElement('iv:TotaleOperazioniAttive', CdecSTD($FatturatoAttivita,2,true)); 
					$writer->writeElement('iv:TotaleOperazioniPassive', CdecSTD($FatturatoPassivita,2,true)); 
					$writer->writeElement('iv:IvaEsigibile', CdecSTD(abs($IvaAttivita),2,true)); 
					$writer->writeElement('iv:IvaDetratta', CdecSTD(abs($IvaDetratta),2,true)); 
					if ($IvaTotale < 0){
						$writer->writeElement('iv:IvaCredito', CdecSTD(abs($IvaTotale),2,true)); 
					}else{
						$writer->writeElement('iv:IvaDovuta', CdecSTD(abs($IvaTotale),2,true));
					}
					if ($Interessi != 0){
						$writer->writeElement('iv:InteressiDovuti', CdecSTD($Interessi,2,true)); 
					}
					if ($IvaMesePrec != 0){
						$writer->writeElement('iv:CreditoPeriodoPrecedente', CdecSTD(abs($IvaMesePrec),2,true)); 
					}
					if ($IvaAnnoPrec != 0){
						$writer->writeElement('iv:CreditoAnnoPrecedente', CdecSTD(abs($IvaAnnoPrec),2,true)); 
					}
					if ($IvaAcconto != 0){
						// “1” storico; “2” previsionale; “3” analitico - effettivo;  “4”  soggetti operanti nei settori delle telecomunicazioni, somministrazione di acqua, energia elettrica, raccolta e smaltimento rifiuti, eccetera.
						$writer->writeElement('iv:Metodo', 2);
						$writer->writeElement('iv:Acconto', CdecSTD(abs($IvaAcconto),2,true)); 
					}
					if ($Saldo < 0){
						$writer->writeElement('iv:ImportoACredito', CdecSTD(abs($Saldo),2,true)); 
					}else{
						if (IsNullOrEmptyOrZeroString($Versato)){
							$writer->writeElement('iv:ImportoDaVersare', CdecSTD(abs($Saldo),2,true));
						}else{
							$writer->writeElement('iv:ImportoDaVersare', CdecSTD(abs($Versato),2,true)); 
						};
					}
						
				$writer->endElement(); 
				$ModuloI = $ModuloI +1;
				$rsLiquidazioni->MoveNext();
			}
			$rsLiquidazioni->Close();				
			$writer->endElement();  

		$writer->endElement(); 
	$writer->endDocument(); 
	
	$SdiProgressivo = str_pad($SdiProgressivo,5,'0',STR_PAD_LEFT);
	if ($FileName == '') $FileName = 'IT' . $MeStessoAzienda['PIVA'] . '_LI_' . $SdiProgressivo . '.xml';
	file_put_contents($ExtJSDevExportRAW . 'sdi/' . $FileName, $writer->flush(true), LOCK_EX);
	
	return $ExtJSDevExportRAW . 'sdi/' . $FileName;
}



function SDIEncodeEsterometroEmessiXML($DataIniziale, $Mesi = 1, $SdiProgressivo, $FileName = '') {
	global $conn;
	global $ExtJSDevExportRAW;
	global $output;
	
	
	$MeStessoAzienda = WFVALUEDLOOKUP('*','anagrafiche','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'));
	if ($MeStessoAzienda == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICAAZIENDA  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	
	$AnagraficaDichiarante = WFVALUEDLOOKUP('*','anagrafiche','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICADICHIARANTE'));
	if ($AnagraficaDichiarante == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICADICHIARANTE  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	
	$writer = new XMLWriter();  
	$writer->openMemory();
	$writer->startDocument('1.0','UTF-8');  
	$writer->setIndent(4); 

	$FormatoTrasmissione = 'DAT20';
	$Tipo = 'E';$TipoDocumento ='TD01';
			
	/* START ALL*/
	
	$writer->startElement('ns2:DatiFattura'); 
	$writer->writeAttribute('xmlns:ns2','http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v2.0');
	$writer->writeAttribute('xmlns:ds','http://www.w3.org/2000/09/xmldsig#');
	$writer->writeAttribute('versione',$FormatoTrasmissione); 
		
		/***********************************************************************************/
		/* 1 DatiFatturaHeader */
		$writer->startElement('DatiFatturaHeader');
			/* Dichiarante */
			$writer->startElement('Dichiarante');
				$writer->writeElement('CodiceFiscale', $AnagraficaDichiarante['CF']);
				$writer->writeElement('Carica',1);
			$writer->endElement();  
			
		$writer->endElement();	
	
	
		$writer->startElement('DTE');
		
			/* CedentePrestatoreDTE */
			$writer->startElement('CedentePrestatoreDTE');
				$writer->startElement('IdentificativiFiscali');
					if (!IsNullOrEmptyOrZeroString($MeStessoAzienda['PIVA'])) {
						$writer->startElement('IdFiscaleIVA');
							$writer->writeElement('IdPaese',  $MeStessoAzienda['NAZIONE']); 
							$writer->writeElement('IdCodice', $MeStessoAzienda['PIVA']); 
						$writer->endElement(); 
					}
					if (!IsNullOrEmptyOrZeroString($MeStessoAzienda['CF'])) {
						$writer->writeElement('CodiceFiscale', $MeStessoAzienda['CF']);  
					}
				$writer->endElement();
				
				$writer->startElement('AltriDatiIdentificativi');
					$writer->writeElement('Denominazione', $MeStessoAzienda['DESCRIZIONE']);
					$writer->startElement('Sede');
						$writer->writeElement('Indirizzo', $MeStessoAzienda['INDIRIZZO'] . $MeStessoAzienda['INDIRIZZO2']);
						if ($MeStessoAzienda['NAZIONE'] == 'IT'){
							$writer->writeElement('CAP', $MeStessoAzienda['CAP']); 
						}else{
							$writer->writeElement('CAP', '99999');
						}
						$writer->writeElement('Comune', $MeStessoAzienda['CITTA']); 
						$writer->writeElement('Provincia', $MeStessoAzienda['PROVINCIA']); 
						$writer->writeElement('Nazione', $MeStessoAzienda['NAZIONE']); 
					$writer->endElement(); 
					$writer->startElement('RappresentanteFiscale');
						$writer->startElement('IdFiscaleIVA');
							$writer->writeElement('IdPaese', 'IT');
							$writer->writeElement('IdCodice', $MeStessoAzienda['PIVA']);
						$writer->endElement();
						$writer->writeElement('Denominazione', $MeStessoAzienda['DESCRIZIONE']);
					$writer->endElement(); 
				$writer->endElement();
			$writer->endElement(); 
			
			
			
			/* CessionarioCommittenteDTE CICLO FATTURE ANAGRAFICHE */
			
			
		/* Enumera righe  */ 
		$StrSQL = "SELECT 
						cg_contabile.IVADATA,	
						cg_contabile.CT_ANAGRAFICHE,
						cg_contabile.ANAGRAFICHE_DESCRIZIONE, 
						cg_contabile.ANAGRAFICHE_INDIRIZZO, cg_contabile.ANAGRAFICHE_INDIRIZZO2, cg_contabile.ANAGRAFICHE_CITTA,cg_contabile.ANAGRAFICHE_CAP,cg_contabile.ANAGRAFICHE_PROVINCIA,
						cg_contabile.ANAGRAFICHE_PIVA,cg_contabile.ANAGRAFICHE_CF,
						cg_contabile.DOCDATA, cg_contabile.DOCNUM, 
						cg_contabileiva.CG_CT_CONTABILE, 
						cg_contabileiva.IMPONIBILE, cg_contabileiva.IMPOSTATOT,
						aliquote.VALORE, 
						aliquotenatura.CODICE
					FROM cg_contabile      
						LEFT JOIN cg_contabileiva ON cg_contabileiva.CG_CT_CONTABILE = cg_contabile.ID      
						LEFT JOIN aliquote ON cg_contabileiva.CT_ALIQUOTE = aliquote.ID      
						LEFT JOIN aliquotenatura ON aliquote.CT_ALIQUOTENATURA = aliquotenatura.ID      
						INNER JOIN anagrafiche ON cg_contabile.CT_ANAGRAFICHE = anagrafiche.ID      
						INNER JOIN sezionali on sezionali.ID = cg_contabile.CT_SEZIONALI   
					WHERE cg_contabile.SEGNO = -1 
						AND cg_contabile.ESTEROMETRO = 1 
						AND cg_contabile.IVADATA >= '" . $DataIniziale .  "'
						AND cg_contabile.IVADATA < DATE_ADD('" . $DataIniziale .  "', INTERVAL " . $Mesi . " MONTH) 
						AND anagrafiche.PIVANAZIONE <> 'IT'
					ORDER BY cg_contabile.CT_ANAGRAFICHE "; 
		$rsFatMov = $conn->Execute($StrSQL);
		$i = 0;
		while (!$rsFatMov->EOF) {
			$i = $i + 1;
			$AnagraficaID = $rsFatMov->fields['CT_ANAGRAFICHE'];
			$ContabileID = $rsFatMov->fields['CG_CT_CONTABILE'];
							 
			$AnagraficaCLIFAT = WFVALUEDLOOKUP('*','anagrafiche','ID = ' . $rsFatMov->fields['CT_ANAGRAFICHE']);
			$writer->startElement('CessionarioCommittenteDTE');
				$writer->startElement('IdentificativiFiscali');
					$writer->startElement('IdFiscaleIVA');
						$writer->writeElement('IdPaese',  $AnagraficaCLIFAT['NAZIONE']); 
						if (!IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['PIVA'])) {
							$writer->writeElement('IdCodice', $AnagraficaCLIFAT['PIVA']); 
						}else{
							$writer->writeElement('IdCodice', 'XXXXXXX'); 
						}
					$writer->endElement(); 
					if (!IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['CF'])) {
						$writer->writeElement('CodiceFiscale', $AnagraficaCLIFAT['CF']);  
					}
				$writer->endElement();
				
				/* DatiFatturaBodyDTE  CICLO FATTURE */
				while (1 == 1){
				$AnagraficaID = $rsFatMov->fields['CT_ANAGRAFICHE'];
				$ContabileID = $rsFatMov->fields['CG_CT_CONTABILE'];
				
				$writer->startElement('DatiFatturaBodyDTE');
					$writer->startElement('DatiGenerali');
						$writer->writeElement('TipoDocumento', $TipoDocumento);
						$writer->writeElement('Data', $rsFatMov->fields['DOCDATA']);
						$writer->writeElement('Numero', $rsFatMov->fields['DOCNUM']);
						
						if ($rsFatMov->fields['DOCNUM'] == ''){
							$output['message'] = $output['message'] . 'DOCNUM della fattura non abbinato'.BRCRLF;
							$output['failure'] = true;
							$output['success'] = false;
							return;
						}
						if ($rsFatMov->fields['DOCDATA'] == ''){
							$output['message'] = $output['message'] . 'DOCDATA della fattura non abbinato'.BRCRLF;
							$output['failure'] = true;
							$output['success'] = false;
							return;
						}
					$writer->endElement();
					
					while (1 == 1){
						$AnagraficaID = $rsFatMov->fields['CT_ANAGRAFICHE'];
						$ContabileID = $rsFatMov->fields['CG_CT_CONTABILE'];
						//CICLO N IVE
						$writer->startElement('DatiRiepilogo');
							$writer->writeElement('ImponibileImporto', $rsFatMov->fields['IMPONIBILE']);
							$writer->startElement('DatiIVA');
							if (IsNullOrEmptyOrZeroString($rsFatMov->fields['CODICE'])){
								$writer->writeElement('Imposta', $rsFatMov->fields['IMPOSTATOT']);
								$writer->writeElement('Aliquota', $rsFatMov->fields['VALORE']);
							}else{
								$writer->writeElement('Imposta', '0.00');
								$writer->writeElement('Aliquota', '0.00');
							}
							$writer->endElement();
							if (!IsNullOrEmptyOrZeroString($rsFatMov->fields['CODICE'])){
								$writer->writeElement('Natura', $rsFatMov->fields['CODICE']);
							}
						$writer->endElement();
						$rsFatMov->MoveNext();
						if ( ($rsFatMov->fields['CT_ANAGRAFICHE'] != $AnagraficaID ) || 
							 ($rsFatMov->fields['CG_CT_CONTABILE'] != $ContabileID )
							){
								break;
						}
					}
					
					$writer->endElement();
					$rsFatMov->MoveNext();
					if ( ($rsFatMov->fields['CT_ANAGRAFICHE'] != $AnagraficaID ) || 
						 ($rsFatMov->fields['CG_CT_CONTABILE'] != $ContabileID )
						){
							break;
					}
				}
				$writer->endElement();
			$rsFatMov->MoveNext();
		}
		$rsFatMov->Close();	
		$writer->endElement();	
	$writer->endElement();
	
	
	$SdiProgressivo = str_pad($SdiProgressivo,4,'0',STR_PAD_LEFT);
	if ($FileName == '') $FileName = 'IT' . $MeStessoAzienda['PIVA'] . '_DF_' . $SdiProgressivo . $Tipo . '.xml';
	if ($i > 0) {
		file_put_contents($ExtJSDevExportRAW . 'sdi/' . $FileName, $writer->flush(true), LOCK_EX);
		return $ExtJSDevExportRAW . 'sdi/' . $FileName;
	}else{
		return null;
	}
}

function SDIEncodeEsterometroRicevutiXML($DataIniziale, $Mesi = 1, $SdiProgressivo, $FileName = '') {
	global $conn;
	global $ExtJSDevExportRAW;
	global $output;
	
	
	$MeStessoAzienda = WFVALUEDLOOKUP('*','anagrafiche','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'));
	if ($MeStessoAzienda == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICAAZIENDA  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	
	$AnagraficaDichiarante = WFVALUEDLOOKUP('*','anagrafiche','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICADICHIARANTE'));
	if ($AnagraficaDichiarante == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICADICHIARANTE  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	
	$writer = new XMLWriter();  
	$writer->openMemory();
	$writer->startDocument('1.0','UTF-8');  
	$writer->setIndent(4); 

	$FormatoTrasmissione = 'DAT20';
	$Tipo = 'R'; $TipoDocumento ='TD11';
			
	/* START ALL*/
	$writer->startElement('ns2:DatiFattura'); 
	$writer->writeAttribute('xmlns:ns2','http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v2.0');
	$writer->writeAttribute('xmlns:ds','http://www.w3.org/2000/09/xmldsig#');
	$writer->writeAttribute('versione',$FormatoTrasmissione); 
		
		/***********************************************************************************/
		/* 1 DatiFatturaHeader */
		$writer->startElement('DatiFatturaHeader');
			/* Dichiarante */
			$writer->startElement('Dichiarante');
				$writer->writeElement('CodiceFiscale', $AnagraficaDichiarante['CF']);
				$writer->writeElement('Carica',1);
			$writer->endElement();  
			
		$writer->endElement();	
	
	
		$writer->startElement('DTR');
		
			/* CessionarioCommittenteDTR */
			$writer->startElement('CessionarioCommittenteDTR');
				$writer->startElement('IdentificativiFiscali');
					if (!IsNullOrEmptyOrZeroString($MeStessoAzienda['PIVA'])) {
						$writer->startElement('IdFiscaleIVA');
							$writer->writeElement('IdPaese',  $MeStessoAzienda['NAZIONE']); 
							$writer->writeElement('IdCodice', $MeStessoAzienda['PIVA']); 
						$writer->endElement(); 
					}
					if (!IsNullOrEmptyOrZeroString($MeStessoAzienda['CF'])) {
						$writer->writeElement('CodiceFiscale', $MeStessoAzienda['CF']);  
					}
				$writer->endElement();
				
				$writer->startElement('AltriDatiIdentificativi');
					$writer->writeElement('Denominazione', $MeStessoAzienda['DESCRIZIONE']);
					$writer->startElement('Sede');
						$writer->writeElement('Indirizzo', $MeStessoAzienda['INDIRIZZO'] . $MeStessoAzienda['INDIRIZZO2']);
						if ($MeStessoAzienda['NAZIONE'] == 'IT'){
							$writer->writeElement('CAP', $MeStessoAzienda['CAP']); 
						}else{
							$writer->writeElement('CAP', '99999');
						}
						$writer->writeElement('Comune', $MeStessoAzienda['CITTA']); 
						$writer->writeElement('Provincia', $MeStessoAzienda['PROVINCIA']); 
						$writer->writeElement('Nazione', $MeStessoAzienda['NAZIONE']); 
					$writer->endElement(); 
					$writer->startElement('RappresentanteFiscale');
						$writer->startElement('IdFiscaleIVA');
							$writer->writeElement('IdPaese', 'IT');
							$writer->writeElement('IdCodice', $MeStessoAzienda['PIVA']);
						$writer->endElement();
						$writer->writeElement('Denominazione', $MeStessoAzienda['DESCRIZIONE']);
					$writer->endElement(); 
				$writer->endElement();
			$writer->endElement(); 
			
			
			
			/* CessionarioCommittenteDTE CICLO FATTURE ANAGRAFICHE */
			
			
		/* Enumera righe  */ 
		$StrSQL = "SELECT DISTINCT	
						cg_contabile.CT_ANAGRAFICHE,
						cg_contabile.ANAGRAFICHE_DESCRIZIONE, 
						cg_contabile.ANAGRAFICHE_INDIRIZZO, cg_contabile.ANAGRAFICHE_INDIRIZZO2, cg_contabile.ANAGRAFICHE_CITTA,cg_contabile.ANAGRAFICHE_CAP,cg_contabile.ANAGRAFICHE_PROVINCIA,
						cg_contabile.ANAGRAFICHE_PIVA,cg_contabile.ANAGRAFICHE_CF
					FROM cg_contabile      
						LEFT JOIN cg_contabileiva ON cg_contabileiva.CG_CT_CONTABILE = cg_contabile.ID      
						LEFT JOIN aliquote ON cg_contabileiva.CT_ALIQUOTE = aliquote.ID      
						LEFT JOIN aliquotenatura ON aliquote.CT_ALIQUOTENATURA = aliquotenatura.ID      
						INNER JOIN anagrafiche ON cg_contabile.CT_ANAGRAFICHE = anagrafiche.ID      
						INNER JOIN sezionali on sezionali.ID = cg_contabile.CT_SEZIONALI   
					WHERE cg_contabile.SEGNO = 1 
						AND cg_contabile.ESTEROMETRO = 1 
						AND cg_contabile.IVADATA  >= '" . $DataIniziale .  "'
						AND cg_contabile.IVADATA  < DATE_ADD('" . $DataIniziale .  "', INTERVAL " . $Mesi . " MONTH) 
					ORDER BY cg_contabile.CT_ANAGRAFICHE "; 
		$rsTESTE = $conn->Execute($StrSQL);
		$i = 0;
		while (!$rsTESTE->EOF) {
			$i = $i +1;
			$AnagraficaID = $rsTESTE->fields['CT_ANAGRAFICHE'];
							 
			$AnagraficaCLIFAT = WFVALUEDLOOKUP('*','anagrafiche','ID = ' . $rsTESTE->fields['CT_ANAGRAFICHE']);
			$writer->startElement('CedentePrestatoreDTR');
				$writer->startElement('IdentificativiFiscali');
					$writer->startElement('IdFiscaleIVA');
						$writer->writeElement('IdPaese',  $AnagraficaCLIFAT['NAZIONE']); 
						if (!IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['PIVA'])) {
							$writer->writeElement('IdCodice', $AnagraficaCLIFAT['PIVA']); 
						}else{
							$writer->writeElement('IdCodice', 'XXXXXXX'); 
						}
					$writer->endElement(); 
					if (!IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['CF'])) {
						$writer->writeElement('CodiceFiscale', $AnagraficaCLIFAT['CF']);  
					}
				$writer->endElement();
				
				/* DatiFatturaBodyDTR  CICLO FATTURE */
				$StrSQL = "SELECT 
						cg_contabile.IVADATA,	
						cg_contabile.DOCDATA, cg_contabile.DOCNUM, 
						cg_contabileiva.CG_CT_CONTABILE, 
						cg_contabileiva.IMPONIBILE, cg_contabileiva.IMPOSTATOT
					FROM cg_contabile
						INNER JOIN cg_contabileiva ON cg_contabileiva.CG_CT_CONTABILE = cg_contabile.ID
						INNER JOIN aliquote ON cg_contabileiva.CT_ALIQUOTE = aliquote.ID 
						INNER JOIN anagrafiche ON cg_contabile.CT_ANAGRAFICHE = anagrafiche.ID
					WHERE cg_contabile.SEGNO = 1 
						AND cg_contabile.CT_ANAGRAFICHE = " . $AnagraficaID .  "
						AND cg_contabile.ESTEROMETRO = 1 
						AND cg_contabile.IVADATA >= '" . $DataIniziale .  "'
						AND cg_contabile.IVADATA < DATE_ADD('" . $DataIniziale .  "', INTERVAL " . $Mesi . " MONTH) 
					ORDER BY cg_contabile.CT_ANAGRAFICHE "; 
				$rsFatMov = $conn->Execute($StrSQL);
				
				while (!$rsFatMov->EOF) {
					$ContabileID = $rsFatMov->fields['CG_CT_CONTABILE'];
					
					$writer->startElement('DatiFatturaBodyDTR');
						$writer->startElement('DatiGenerali');
							$writer->writeElement('TipoDocumento', $TipoDocumento);
							$writer->writeElement('Data', $rsFatMov->fields['DOCDATA']);
							$writer->writeElement('Numero', $rsFatMov->fields['DOCNUM']);
							$writer->writeElement('DataRegistrazione', $rsFatMov->fields['IVADATA']);
						$writer->endElement();
						
					
					$StrSQL = "SELECT 
						cg_contabileiva.IMPONIBILE, cg_contabileiva.IMPOSTATOT,
						aliquote.VALORE, 
						aliquotenatura.CODICE
					FROM  cg_contabile
						INNER JOIN cg_contabileiva ON cg_contabileiva.CG_CT_CONTABILE = cg_contabile.ID
						INNER JOIN aliquote ON cg_contabileiva.CT_ALIQUOTE = aliquote.ID
						LEFT JOIN aliquotenatura ON aliquote.CT_ALIQUOTENATURA = aliquotenatura.ID
					WHERE cg_contabile.ESTEROMETRO = 1 
						AND cg_contabileiva.CG_CT_CONTABILE = " . $ContabileID ; 
					$rsFatMovIVA = $conn->Execute($StrSQL);
					while (!$rsFatMovIVA->EOF) {
						$ContabileID = $rsFatMovIVA->fields['CG_CT_CONTABILE'];
						//CICLO N IVE
						$writer->startElement('DatiRiepilogo');
							$writer->writeElement('ImponibileImporto', $rsFatMovIVA->fields['IMPONIBILE']);
							$writer->startElement('DatiIVA');
								//if (IsNullOrEmptyOrZeroString($rsFatMovIVA->fields['CODICE'])){
									$writer->writeElement('Imposta', $rsFatMovIVA->fields['IMPOSTATOT']);
									$writer->writeElement('Aliquota', $rsFatMovIVA->fields['VALORE']);
								//}else{
								//	$writer->writeElement('Imposta', '0.00');
								//	$writer->writeElement('Aliquota', '0.00');
								//}
							$writer->endElement();
							if (!IsNullOrEmptyOrZeroString($rsFatMovIVA->fields['CODICE'])){
								$writer->writeElement('Natura', $rsFatMovIVA->fields['CODICE']);
							}
							if (IsNullOrEmptyOrZeroString($rsFatMovIVA->fields['CODICE'])){
								$writer->writeElement('Detraibile' , '0.00');
								$writer->writeElement('EsigibilitaIVA','I');
							}
						$writer->endElement();
						$rsFatMovIVA->MoveNext();
					}
					
					$writer->endElement();
					$rsFatMov->MoveNext();
				}
			$rsFatMov->Close();
			$writer->endElement();
			$rsTESTE->MoveNext();
		}
		$rsTESTE->Close();
		$writer->endElement();
	$writer->endElement();
	 
	$SdiProgressivo = str_pad($SdiProgressivo,4,'0',STR_PAD_LEFT);
	if ($FileName == '') $FileName = 'IT' . $MeStessoAzienda['PIVA'] . '_DF_' . $SdiProgressivo . $Tipo . '.xml';
	if ($i > 0) {
		file_put_contents($ExtJSDevExportRAW . 'sdi/' . $FileName, $writer->flush(true), LOCK_EX);
		return $ExtJSDevExportRAW . 'sdi/' . $FileName;
	}else{
		return null;
	}
}



class CodiceFiscale {
 
 private $codiceValido = null;
 private $sesso = null;
 private $comuneNascita = null;
 private $ggNascita = null;
 private $mmNascita = null;
 private $aaNascita = null;
 private $errore = null;
 private $TabDecOmocodia = null;
 private $TabSostOmocodia = null;
 private $TabCaratteriPari = null;
 private $TabCaratteriDispari = null;
 private $TabCodiceControllo = null;
 private $TabDecMesi = null;
 private $TabErrori = null;
 
 public function __construct() {
  // Tabella sostituzioni per omocodia
  $this->TabDecOmocodia = array("A" => "!", "B" => "!", "C" => "!", "D" => "!", "E" => "!", "F" => "!", "G" => "!", "H" => "!", "I" => "!", "J" => "!", "K" => "!", "L" => "0", "M" => "1", "N" => "2", "O" => "!", "P" => "3", "Q" => "4", "R" => "5", "S" => "6", "T" => "7", "U" => "8", "V" => "9", "W" => "!", "X" => "!", "Y" => "!", "Z" => "!", );
 
  // Posizioni caratteri interessati ad 
  // alterazione di codifica in caso di omocodia
  $this->TabSostOmocodia = array(6,7,9,10,12,13,14);
 
  // Tabella peso caratteri PARI
  $this->TabCaratteriPari = array("0" => 0 , "1" => 1 , "2" => 2 , "3" => 3 , "4" => 4 , "5" => 5 , "6" => 6 , "7" => 7 , "8" => 8 , "9" => 9 , "A" => 0 , "B" => 1 , "C" => 2 , "D" => 3 , "E" => 4 , "F" => 5 , "G" => 6 , "H" => 7 , "I" => 8 , "J" => 9, "K" => 10, "L" => 11, "M" => 12, "N" => 13, "O" => 14, "P" => 15, "Q" => 16, "R" => 17, "S" => 18, "T" => 19, "U" => 20, "V" => 21, "W" => 22, "X" => 23, "Y" => 24, "Z" => 25);
 
  // Tabella peso caratteri DISPARI
  $this->TabCaratteriDispari = array("0" => 1 , "1" => 0 , "2" => 5 , "3" => 7 , "4" => 9 , "5" => 13, "6" => 15, "7" => 17, "8" => 19, "9" => 21, "A" => 1 , "B" => 0 , "C" => 5 , "D" => 7 , "E" => 9 , "F" => 13, "G" => 15, "H" => 17, "I" => 19, "J" => 21, "K" => 2 , "L" => 4 , "M" => 18, "N" => 20, "O" => 11, "P" => 3 , "Q" => 6 , "R" => 8 , "S" => 12, "T" => 14, "U" => 16, "V" => 10, "W" => 22, "X" => 25, "Y" => 24, "Z" => 23  );
 
  // Tabella calcolo codice CONTOLLO (carattere 16)
  $this->TabCodiceControllo = array( 0 => "A",  1 => "B",  2 => "C",  3 => "D",  4 => "E",  5 => "F",  6 => "G",  7 => "H",  8 => "I",  9 => "J", 10 => "K", 11 => "L", 12 => "M", 13 => "N", 14 => "O", 15 => "P", 16 => "Q", 17 => "R", 18 => "S", 19 => "T", 20 => "U", 21 => "V", 22 => "W", 23 => "X", 24 => "Y", 25 => "Z");
 
  // Array per il calcolo del mese
  $this->TabDecMesi = array("A" => "01", "B" => "02", "C" => "03", "D" => "04", "E" => "05", "H" => "06", "L" => "07", "M" => "08", "P" => "09", "R" => "10", "S" => "11", "T" => "12");
 
  // Tabella messaggi di errore
  $this->TabErrori = array(0 => "Codice da analizzare assente", 1 => "Lunghezza codice da analizzare non corretta", 2 => "Il codice da analizzare contiene caratteri non corretti", 3 => "Carattere non valido in decodifica omocodia", 4 => "Codice fiscale non corretto");
 }
 
 public function SetCF($cf) {
  // Azzero le property
  $this->codiceValido = null;
  $this->sesso = null;
  $this->comuneNascita = null;
  $this->ggNascita = null;
  $this->mmNascita = null;
  $this->aaNascita = null;
  $this->errore = null;
 
  // Verifica esistenza codice passato
  if ($cf==="") {
   $this->codiceValido = false;
   $this->errore = $this->TabErrori[0];
   return false;
  }
 
  // Verifica lunghezza codice passato: 
  // 16 caratteri per CF standard 
  // (non gestisco i CF provvisori da 11 caratteri...)
  if (strlen($cf) !== 16) {
   $this->codiceValido = false;
   $this->errore = $this->TabErrori[1];
   return false;
  }
 
  // Converto in maiuscolo
  $cf = strtoupper($cf); 
 
  // Verifica presenza di caratteri non validi
  // nel codice passato
  // if( ! ereg("^[A-Z0-9]+$", $cf) ) {
  // ******* Funzione deprecata e, come 
  // ******* suggerito da Gabriele,
  // ******* sostituita con preg_match
  if( ! preg_match("/^[A-Z0-9]+$/", $cf) ) {
   $this->codiceValido = false;
   $this->errore = $this->TabErrori[2];
   return false;
  }
 
  // Converto la stringa in array
  $cfArray = str_split($cf);
 
  // Verifica correttezza alterazioni per omocodia
  // (al posto dei numeri sono accettabili solo le
  // lettere da "L" a "V", "O" esclusa, che
  // sostituiscono i numeri da 0 a 9)
  for ($i = 0; $i < count($this->TabSostOmocodia); $i++) 
   if (!is_numeric($cfArray[$this->TabSostOmocodia[$i]])) 
    if ($this->TabDecOmocodia[$cfArray[$this->TabSostOmocodia[$i]]]==="!") {
     $this->codiceValido = false;
     $this->errore = $this->TabErrori[3];
     return false;
    }
 
  // Tutti i controlli formali sono superati.
  // Inizio la fase di verifica vera e propria del CF
  $pari = 0;
  $dispari = $this->TabCaratteriDispari[$cfArray[14]];  // Calcolo subito l'ultima cifra dispari (pos. 15) per comodita'...
 
  // Loop sui primi 14 elementi
  // a passo di due caratteri alla volta
  for ($i = 0; $i < 13; $i+=2)     
  {
   $dispari = $dispari + $this->TabCaratteriDispari[$cfArray[$i]];
   $pari = $pari + $this->TabCaratteriPari[$cfArray[$i+1]];
  }
 
  // Verifica congruenza dei valori calcolati
  // sui primi 15 caratteri con il codice di
  // controllo (carattere 16)
  if (!($this->TabCodiceControllo[($pari+$dispari) % 26]===$cfArray[15])) {
   $this->codiceValido = false;
   $this->errore = $this->TabErrori[4];
   return false;
  }
  else {
   // Opero la sostituzione se necessario
   // utilizzando la tabella $this->TabDecOmocodia
   // (per risolvere eventuali omocodie)
   for ($i = 0; $i < count($this->TabSostOmocodia); $i++) 
    if (!is_numeric($cfArray[$this->TabSostOmocodia[$i]])) 
     $cfArray[$this->TabSostOmocodia[$i]] = $this->TabDecOmocodia[$cfArray[$this->TabSostOmocodia[$i]]];
 
   // Converto l'array di nuovo in stringa
   $CodiceFiscaleAdattato = implode($cfArray);
 
   // Comunico che il codice è valido...
   $this ->codiceValido = true;
   $this ->errore = "";
 
   // ...ed estraggo i dati dal codice verificato
   $this ->sesso = (substr($CodiceFiscaleAdattato,9,2) > "40" ? "F" : "M");
   $this ->comuneNascita = substr($CodiceFiscaleAdattato, 11,4);
   $anno = substr($CodiceFiscaleAdattato,6,2);
   if ($anno > 30) $this ->aaNascita = "19" . substr($CodiceFiscaleAdattato,6,2); else $this ->aaNascita = "20" . substr($CodiceFiscaleAdattato,6,2);
   $this ->mmNascita = $this->TabDecMesi[substr($CodiceFiscaleAdattato,8,1)];
 
   // 2014-01-13 Modifica per corretto recupero giorno di nascita se sesso=F
   $this ->ggNascita = substr($CodiceFiscaleAdattato,9,2);
   if($this->sesso === "F") {
      $this ->ggNascita = $this ->ggNascita - 40;
      if (strlen($this ->ggNascita)===1)
         $this ->ggNascita = "0".$this ->ggNascita; 
   }
  }
 }
 
 public function GetCodiceValido() {
  return $this->codiceValido;
 }
 
 public function GetErrore() {
  return $this->errore;
 }
 
 public function GetSesso() {
  return $this->sesso;
 }
 
 public function GetComuneNascita() {
  return $this->comuneNascita;
 }
 
 public function GetAANascita() {
  return $this->aaNascita;
 }
 
 public function GetMMNascita() {
  return $this->mmNascita;
 }
 
 public function GetGGNascita() {
  return $this->ggNascita;
 }
}

function controllaPartitaIVA($pi){
  if ($pi === '') return '';
  elseif (strlen($pi) != 11) return 'La Partita IVA deve essere composta da 11 caratteri';
  elseif (preg_match("/^[0-9]+\$/D", $pi) != 1) return 'La Partita IVA deve contenere solo numeri';
  else {
    $s = $c = 0;
    for($i=0; $i<=9; $i+=2) {
      $s += ord($pi[$i]) - ord('0');
    }
    for ($i=1; $i<=9; $i+=2) {
      $c = 2*(ord($pi[$i]) - ord('0'));
      if ($c > 9) $c = $c - 9;
      $s += $c;
    }
    $controllo = (10 - $s%10)%10;
    if ($controllo != (ord($pi[10]) - ord('0'))) {
      return false;
    }else{
      return true;
    }  
  }
}

function controllaCodiceFiscale($cf){
	if($cf=='') return false;

	if(strlen($cf)!= 16) return false;

	$cf=strtoupper($cf);
	if(!preg_match("/[A-Z0-9]+$/", $cf))
		return false;
	$s = 0;
    for($i=1; $i<=13; $i+=2){
		$c=$cf[$i];
		if('0'<=$c and $c<='9')
			$s+=ord($c)-ord('0');
		else
			$s+=ord($c)-ord('A');
	}

	for($i=0; $i<=14; $i+=2){
		$c=$cf[$i];
		switch($c){
			case '0':  $s += 1;  break;
			case '1':  $s += 0;  break;
			case '2':  $s += 5;  break;
			case '3':  $s += 7;  break;
			case '4':  $s += 9;  break;
			case '5':  $s += 13;  break;
			case '6':  $s += 15;  break;
			case '7':  $s += 17;  break;
			case '8':  $s += 19;  break;
			case '9':  $s += 21;  break;
			case 'A':  $s += 1;  break;
			case 'B':  $s += 0;  break;
			case 'C':  $s += 5;  break;
			case 'D':  $s += 7;  break;
			case 'E':  $s += 9;  break;
			case 'F':  $s += 13;  break;
			case 'G':  $s += 15;  break;
			case 'H':  $s += 17;  break;
			case 'I':  $s += 19;  break;
			case 'J':  $s += 21;  break;
			case 'K':  $s += 2;  break;
			case 'L':  $s += 4;  break;
			case 'M':  $s += 18;  break;
			case 'N':  $s += 20;  break;
			case 'O':  $s += 11;  break;
			case 'P':  $s += 3;  break;
			case 'Q':  $s += 6;  break;
			case 'R':  $s += 8;  break;
			case 'S':  $s += 12;  break;
			case 'T':  $s += 14;  break;
			case 'U':  $s += 16;  break;
			case 'V':  $s += 10;  break;
			case 'W':  $s += 22;  break;
			case 'X':  $s += 25;  break;
			case 'Y':  $s += 24;  break;
			case 'Z':  $s += 23;  break;
		}
    }

    if( chr($s%26+ord('A'))!=$cf[15] )
		return false;
	else
		return true;
}

function SDIGetIPA($cf, $authID = 'MCLCHCQT') {
	$postdata = http_build_query(
		array(
			'AUTH_ID' => $authID,
			'CF' => $cf
		)
	);
	
	$opts = array('http' => array(
					'method'  => 'POST',
					'header'  => 'Content-type: application/x-www-form-urlencoded',
					'content' => $postdata
				),
				'ssl'=>array(
					"verify_peer"=>false,
					"verify_peer_name"=>false,
				)
	);
	
	$context  = stream_context_create($opts);
	$result = file_get_contents('https://www.indicepa.gov.it/public-ws/WS01_SFE_CF.php', false, $context);
	
    $resultjson = json_decode($result, true);
	
	return $resultjson["data"][0];
}
	