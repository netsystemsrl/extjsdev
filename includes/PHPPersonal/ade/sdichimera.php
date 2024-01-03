<?php		

function SDIEncodeFatturaXML($FatID, $SdiProgressivo, $FileName = '') {
	global $conn;
	global $ExtJSDevExportRAW;
	global $output;
	
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
	
	$AnagraficaAzienda = WFVALUEDLOOKUP('*','angaziende','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'));
	if ($AnagraficaAzienda == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICAAZIENDA  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	$AnagraficaCLIFAT = WFVALUEDLOOKUP('*', 'angaziende', 'ID = ' . $Fattura['CT_FATTURAZIONE']);
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
						
	if (($AnagraficaCLIFAT['PIVANAZIONE'] != 'IT') && ($AnagraficaCLIFAT['FATSDINUM'] != 'XXXXXXX')){
		//SONO IN UNA AZIENDA ESTERA
		$output['message'] = $output['message'] . 'Anagrafica ' .  $AnagraficaCLIFAT['RAGSOCIALE'] . '  ESTERA NON IMPOSTATA A XXXXXXX !!'.BRCRLF;
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
	
	if ($Fattura['CT_SPEDIZIONE']){
		$AnagraficaCLISPE = WFVALUEDLOOKUP('*', 'angaziende', 'ID = ' . $Fattura['CT_SPEDIZIONE']);
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
				$writer->writeElement('IdPaese', 'IT'); 
				$writer->writeElement('IdCodice', $AnagraficaAzienda['PIVA']); 
			$writer->endElement();  
			$writer->writeElement('ProgressivoInvio',  $SdiProgressivo);
			
			$writer->writeElement('FormatoTrasmissione', $FormatoTrasmissione);
			
			
			if (!IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['FATSDINUM'])){
				$writer->writeElement('CodiceDestinatario', $AnagraficaCLIFAT['FATSDINUM']); 
			}else{
				$writer->writeElement('CodiceDestinatario', '0000000'); 
			}
			if (!IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['PEC']))  $writer->writeElement('PECDestinatario', $AnagraficaCLIFAT['PEC']);
			/*
			$writer->startElement('ContattiTrasmittente');
                if (!IsNullOrEmptyOrZeroString($AnagraficaAzienda['TELEFONO'])) {
					$AnagraficaAzienda['TELEFONO'] = str_replace(' ', '', $AnagraficaAzienda['TELEFONO']);
					$writer->writeElement('Telefono', $AnagraficaAzienda['TELEFONO']); 
				}
                if (!IsNullOrEmptyOrZeroString($AnagraficaAzienda['EMAIL'])) $writer->writeElement('Email', $AnagraficaAzienda['EMAIL']); 
            $writer->endElement();
			*/
			
		$writer->endElement();  
		}
		
		/* CedentePrestatore */ {
		$writer->startElement('CedentePrestatore');
			$writer->startElement('DatiAnagrafici');
				if (!IsNullOrEmptyOrZeroString($AnagraficaAzienda['PIVA'])) {
					$writer->startElement('IdFiscaleIVA');
						$writer->writeElement('IdPaese',  $AnagraficaAzienda['NAZIONE']); 
						$writer->writeElement('IdCodice', $AnagraficaAzienda['PIVA']); 
					$writer->endElement(); 
				}
				if (!IsNullOrEmptyOrZeroString($AnagraficaAzienda['CF'])) {
					$writer->writeElement('CodiceFiscale', $AnagraficaAzienda['CF']);  
				}
				$writer->startElement('Anagrafica');
					$writer->writeElement('Denominazione', $AnagraficaAzienda['RAGSOCIALE']);
				$writer->endElement();  
				$writer->writeElement('RegimeFiscale', 'RF01');
			$writer->endElement(); 
			$writer->startElement('Sede');
				$writer->writeElement('Indirizzo', $AnagraficaAzienda['INDIRIZZO']);
				if ($AnagraficaAzienda['NAZIONE'] == 'IT'){
					$writer->writeElement('CAP', $AnagraficaAzienda['CAP']); 
				}else{
					$writer->writeElement('CAP', '99999');
				}
				$writer->writeElement('Comune', $AnagraficaAzienda['CITTA']); 
				$writer->writeElement('Provincia', $AnagraficaAzienda['PROVINCIA']); 
				$writer->writeElement('Nazione', $AnagraficaAzienda['NAZIONE']); 
			$writer->endElement(); 
			$writer->startElement('IscrizioneREA');
				$writer->writeElement('Ufficio', $AnagraficaAzienda['PROVINCIA']);
				$writer->writeElement('NumeroREA', $AnagraficaAzienda['PIVA']);
				$writer->writeElement('SocioUnico', 'SM');
				$writer->writeElement('StatoLiquidazione', 'LN');
			$writer->endElement(); 
		$writer->endElement();  
		}
		
		/* CessionarioCommittente */ {
		$writer->startElement('CessionarioCommittente');
			$writer->startElement('DatiAnagrafici');
				if($AnagraficaCLIFAT['PIVANAZIONE'] == 'IT'){
					if (!IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['PIVA'])) {
						$writer->startElement('IdFiscaleIVA');
							$writer->writeElement('IdPaese', $AnagraficaCLIFAT['PIVANAZIONE']);
							$writer->writeElement('IdCodice', $AnagraficaCLIFAT['PIVA']);
						$writer->endElement(); 
					}
					if (!IsNullOrEmptyOrZeroString($AnagraficaCLIFAT['CF'])) {
						$writer->writeElement('CodiceFiscale', $AnagraficaCLIFAT['CF']); 
					}
				}else{					
					$writer->startElement('IdFiscaleIVA');
						if(( $NazioneCLIFAT['UE']) == true){
							$writer->writeElement('IdPaese', $AnagraficaCLIFAT['PIVANAZIONE']);
							$writer->writeElement('IdCodice', $AnagraficaCLIFAT['PIVA']);
						}else{
							//estero
							$writer->writeElement('IdPaese', IsNull($AnagraficaCLIFAT['PIVANAZIONE'],'OO'));
							if (strlen($AnagraficaCLIFAT['PIVA'])>28)  {$AnagraficaCLIFAT['PIVA'] = '';}
							$writer->writeElement('IdCodice', IsNull($AnagraficaCLIFAT['PIVA'],'99999999999'));
						}
					$writer->endElement(); 
				}
				
				$writer->startElement('Anagrafica');
					$writer->writeElement('Denominazione', $AnagraficaCLIFAT['RAGSOCIALE']); 
				$writer->endElement(); 
			$writer->endElement();  
			
			$writer->startElement('Sede');
				$writer->writeElement('Indirizzo', $AnagraficaCLIFAT['INDIRIZZO']); 
				if ($AnagraficaCLIFAT['NAZIONE'] == 'IT'){
					$writer->writeElement('CAP', $AnagraficaCLIFAT['CAP']); 
					$writer->writeElement('Comune', $AnagraficaCLIFAT['CITTA']);  
					$writer->writeElement('Provincia', $AnagraficaCLIFAT['PROVINCIA']); 
				}else{
					$writer->writeElement('CAP', '99999');
					$writer->writeElement('Comune', $AnagraficaCLIFAT['CITTA']);  
				} 
				$writer->writeElement('Nazione', $AnagraficaCLIFAT['NAZIONE']); 
			$writer->endElement();  
		$writer->endElement();  
		}
		
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
				if (IsNullOrEmptyOrZeroString($Fattura['SDI_TD'])){
					$Fattura['SDI_TD'] = 'TD01';
				}	
				$writer->writeElement('TipoDocumento', $Fattura['SDI_TD']); 
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
				
				/* 2.1.1.9   <ImportoTotaleDocumento>*/ 
				$writer->writeElement('ImportoTotaleDocumento', $Fattura['VALORETOTALE']);
				
				/* 2.1.1.11   <Causale>*/ 
				if (!IsNullOrEmptyOrZeroString($Fattura['CG_CT_CONTABILEPLAFOND'])){
					$Plafond = WFVALUEDLOOKUP('*', 'cg_contabileplafond', 'ID = ' . $Fattura['CG_CT_CONTABILEPLAFOND']);
					$writer->writeElement('Causale', 'Plafond su Lettera Intenti ' . $Plafond['DESCRIZIONE']);
				}
			$writer->endElement();  
			}
			
			/* 2.1.2   <DatiOrdineAcquisto> */{
				$StrSQL = "SELECT ord.ID as ORDID, ord.DOCNUM, ord.DOCDATA
							FROM fatmovimenti  
								INNER JOIN ordmovimenti ON ordmovimenti.ID = fatmovimenti.CT_ORDMOVIMENTI 
								INNER JOIN ord ON ord.ID = ordmovimenti.CT_ORD 
							WHERE CT_ORDMOVIMENTI is not null 
								AND fatmovimenti.CT_FAT = " . $Fattura['ID'] ."
							GROUP BY ord.ID, ord.DOCNUM, ord.DOCDATA
							ORDER BY ord.ID"; 
				$rsFatMov = $conn->Execute($StrSQL);
				$i= 0;
				$OrdID = '';
				while (!$rsFatMov->EOF) {
					$writer->startElement('DatiOrdineAcquisto');
					
					$StrSQL = "SELECT fatmovimenti.ID, fatmovimenti.CT_ORDMOVIMENTI, fatmovimenti.RIGA, ord.ID as ORDID, ord.DOCNUM, ord.DOCDATA
							FROM fatmovimenti  
								INNER JOIN ordmovimenti ON ordmovimenti.ID = fatmovimenti.CT_ORDMOVIMENTI 
								INNER JOIN ord ON ord.ID = ordmovimenti.CT_ORD 
							WHERE CT_ORDMOVIMENTI is not null 
								AND fatmovimenti.CT_FAT = " . $Fattura['ID'] ."
								AND ordmovimenti.CT_ORD = " . $rsFatMov->fields['ORDID'] ."
							ORDER BY CT_ORDMOVIMENTI "; 
					$rsOrdMov = $conn->Execute($StrSQL);
					while (!$rsOrdMov->EOF) {
						if(IsNumeric($rsFatMov->fields['RIGA']) != true){
							$AppoRiga =$rsOrdMov->fields['RIGA'];
							$AppoRiga = str_replace('00', '', $AppoRiga); 
							$AppoRiga = str_replace(array('.', ''), '', $AppoRiga); 
						}else{
							$AppoRiga = $rsOrdMov->fields['RIGA'];
						}
						if ($AppoRiga < 9999) {
							$writer->writeElement('RiferimentoNumeroLinea', $AppoRiga);
						}
						$rsOrdMov->MoveNext();
					}
					$rsOrdMov->Close();
					
					$writer->writeElement('IdDocumento', $rsFatMov->fields['DOCNUM']); 
					$writer->writeElement('Data', $rsFatMov->fields['DOCDATA']); 
					$writer->endElement(); 
					$rsFatMov->MoveNext();
				}
				if ($OrdID != '') $writer->endElement(); 
			}
			
			
			
			/*2.1.9   <DatiTrasporto>*/{
			$writer->startElement('DatiTrasporto');
				/* 2.1.9.1   <DatiAnagraficiVettore>*/
				if (!IsNullOrEmptyOrZeroString($Fattura['RITIRODATAORA'])){
					$writer->writeElement('DataOraRitiro', $Fattura['RITIRODATAORA']); 
				}
				//$writer->writeElement('DataInizioTrasporto', $Fattura['RITIRODATAORA']); 
				if (!IsNullOrEmptyOrZeroString($Fattura['PESOLORDO'])){
					$writer->writeElement('PesoLordo', $Fattura['PESOLORDO']); 
				}
				if (!IsNullOrEmptyOrZeroString($Fattura['PESONETTO'])){
					$writer->writeElement('PesoNetto', $Fattura['PESONETTO']); 
				}
			$writer->endElement(); 
			}
		
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
					$writer->startElement('CodiceArticolo');
						$writer->writeElement('CodiceTipo', 'Codice Art. cliente');
						$writer->writeElement('CodiceValore', $rsFatMov->fields['CODICE']);
					$writer->endElement();
					if (!IsNullOrEmptyOrZeroString($Articolo['CODICE'])){
						$writer->startElement('CodiceArticolo');
							$writer->writeElement('CodiceTipo', 'Codice Art. fornitore');
							$writer->writeElement('CodiceValore', $Articolo['CODICE']);
						$writer->endElement();
					}
					if (!IsNullOrEmptyOrZeroString($Articolo['BARCODE'])){
						$writer->startElement('CodiceArticolo');
							$writer->writeElement('CodiceTipo', 'EAN');
							$writer->writeElement('CodiceValore', $Articolo['BARCODE']);
						$writer->endElement();
					}
					if (!IsNullOrEmptyOrZeroString($Articolo['BARCODECRT'])){
						$writer->startElement('CodiceArticolo');
							$writer->writeElement('CodiceTipo', 'SSC');
							$writer->writeElement('CodiceValore', $Articolo['BARCODECRT']);
						$writer->endElement();
					}
					}
				
					$writer->writeElement('Descrizione', substr(StringAZ09Special($rsFatMov->fields['DESCRIZIONE']),0,1000));
					$writer->writeElement('Quantita', CdecSTD(ABS(CdecSTD($rsFatMov->fields['QTARIGA']))));
					$writer->writeElement('UnitaMisura', StringAZ09Special($rsFatMov->fields['QTAUM']));
					//$writer->writeElement('DataInizioPeriodo', '2012-01-01');
					//$writer->writeElement('DataFinePeriodo', '2012-03-31');
					if ($Fattura['SDI_TD'] != 'TD04') {
						//FATT NORMALE
						if ($rsFatMov->fields['QTARIGA']>0){
							$writer->writeElement('PrezzoUnitario', CdecSTD($rsFatMov->fields['VALORELISTINO']));
						}elseif ($rsFatMov->fields['QTARIGA']<0){
							//ACCONTO
							$writer->writeElement('PrezzoUnitario', CdecSTD($rsFatMov->fields['VALORELISTINO'] * -1)) ;
						}else{
							//OMAGGIO
							$writer->writeElement('PrezzoUnitario', CdecSTD($rsFatMov->fields['VALORELISTINO'])) ;
						}
					}else{
						//NC
						$writer->writeElement('PrezzoUnitario', CdecSTD(ABS(CdecSTD($rsFatMov->fields['VALORELISTINO']))));
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
					if ($Fattura['SDI_TD'] != 'TD04') {
						$writer->writeElement('PrezzoTotale', CdecSTD(($rsFatMov->fields['VALORERIGA'] * $rsFatMov->fields['QTARIGA'])));
					}else{
						$writer->writeElement('PrezzoTotale', CdecSTD(abs(CdecSTD($rsFatMov->fields['VALORERIGA'] * $rsFatMov->fields['QTARIGA']))));
					}
					if (!IsNullOrEmptyOrZeroString($rsFatMov->fields['IVA_NATURA'])){
						$writer->writeElement('AliquotaIVA', CdecSTD(0));
						$writer->writeElement('Natura', $rsFatMov->fields['IVA_NATURA']);
						//$writer->writeElement('RiferimentoNormativo', $rsFatMov->fields['IVA_DESCRIZIONE']);
					}else{
						$writer->writeElement('AliquotaIVA', CdecSTD($rsFatMov->fields['IVA_VALORE']));
					}
					
					//$writer->writeElement('RiferimentoAmministrazione', '012345');
					/*  2.2.1.16 AltriDatiGestionali */ {
						if (!IsNullOrEmptyOrZeroString($rsFatMov->fields['NOTERIGA'])){
							$writer->startElement('AltriDatiGestionali');
							$writer->writeElement('TipoDato', 'Note');
							//$writer->writeElement('RiferimentoTesto', StringAZ09Special($rsFatMov->fields['NOTERIGA']));
							$writer->writeElement('RiferimentoTesto', substr(StringAZ09Special($rsFatMov->fields['NOTERIGA']),0,60));
							$writer->endElement(); 
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
						$writer->writeElement('AliquotaIVA', CdecSTD(ABS(CdecSTD($rsFatIve->fields['IVA_VALORE']))));
					}
					if (!IsNullOrEmptyOrZeroString($rsFatIve->fields['IVA_NATURA'])){
						//NON PAGO IVA
						//sono in esezione o non soggetto o inreverse change   N = ATTIVA
						$writer->writeElement('Natura', $rsFatIve->fields['IVA_NATURA']);
						$writer->writeElement('ImponibileImporto', CdecSTD(ABS(CdecSTD($rsFatIve->fields['IMPONIBILE']))));
						$writer->writeElement('Imposta', CdecSTD(ABS(CdecSTD($rsFatIve->fields['IMPOSTA']))));
						
					}else{
						//PAGO O PAGHERO IVA
						//I Immediata D Differita S SplitPay    N = null
						$writer->writeElement('ImponibileImporto', CdecSTD(ABS(CdecSTD($rsFatIve->fields['IMPONIBILE']))));
						$writer->writeElement('Imposta', CdecSTD(ABS(CdecSTD($rsFatIve->fields['IMPOSTA']))));
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
		
		/* 2.5 Allegati */ {
		}

	$writer->endElement();  
	}

	/* XML GENERATION END ALL */
	$writer->endElement();
	if ($FileName == '') $FileName = 'IT' . $AnagraficaAzienda['PIVA'] . '_' . $SdiProgressivo . '.xml';
	file_put_contents($ExtJSDevExportRAW . 'sdi/' . $FileName, $writer->flush(true), LOCK_EX);
	
	
	/* XML VALIDATE 
	libxml_use_internal_errors(true);

	$xml = new DOMDocument(); 
	$xml->load($ExtJSDevExportRAW . 'sdi/' . $FileName); 

	if (!$xml->schemaValidate('../PHPPersonal/ade//fatturapa.xsd')) {
		libxml_display_errors();
		$output['message'] = $output['message'] .'Errore Validazione'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
*/
	/* XML SIGN 
	if ($FormatoTrasmissione == 'FPA12'){
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

		$inFile = $ExtJSDevExportRAW . 'sdi/' . $FileName;
		$sigFile = $ExtJSDevExportRAW . 'sdi/' . $FileName . '.p7m';

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

		$FileName = 'IT' . $AnagraficaAzienda['PIVA'] . '_' . $SdiProgressivo . '.xml.p7m';
	}
	*/
	return $ExtJSDevExportRAW . 'sdi/' . $FileName;
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
		
		if (property_exists ( $xml->children() , 'ListaErrori' )){
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

function SDIDecodeFatturaXML($FileName = '', $FatID = null) {
	global $conn;
	global $output;
	global $ExtJSDevImportRAW;
	global $ExtJSDevTMP;
	$AppoFattura = array();
	$notaCredito = false;
	$notaCreditoSegno= false;
	
	$xml = simplexml_load_file($FileName);
	if (!$xml) {
		$output['message'] = $output['message'] . 'Fattura XML Errore NOXML ' . WFFileName($FileName) . BRCRLF ;
		$output['failure'] = true;
		$output['success'] = false;
		goto fine;
	}
	if (!property_exists ( $xml->children() , 'FatturaElettronicaHeader' )){
		$output['message'] = $output['message'] . 'Fattura Header Errore NO FatturaElettronica' .BRCRLF ;
		$output['failure'] = true;
		$output['success'] = false;
		goto fine;
	}
	
	$conn->StartTrans(); 
	$FatturaElettronicaHeader = $xml->children()->FatturaElettronicaHeader;
	$DatiTrasmissione = $FatturaElettronicaHeader->children()->DatiTrasmissione;
	
	/* DEFINIZIONI SDI */
	$FATSDIProgressivo = $DatiTrasmissione->ProgressivoInvio->__toString();
	//if (IsNOTNullOrEmptyOrZeroString($DatiTrasmissione->FormatoTrasmissione->__toString())) 
	//if (IsNOTNullOrEmptyOrZeroString($DatiTrasmissione->CodiceDestinatario->__toString())) 
	//if (IsNOTNullOrEmptyOrZeroString($DatiTrasmissione->PECDestinatario->__toString())) 
	
	//CEDENTE Anagrafica (FORNITORE)
	$AnagraficaCLIFAT = '';
	$CedentePrestatore = $FatturaElettronicaHeader->children()->CedentePrestatore;
	
	$DatiAnagrafici = $CedentePrestatore->children()->DatiAnagrafici;
	//echo('<PRE>');
	//simplexml_dump($FatturaElettronicaHeader->children());
	
	$IdFiscaleIVA = $DatiAnagrafici->children()->IdFiscaleIVA;
	
	if ((IsNOTNullOrEmptyOrZeroString($IdFiscaleIVA->IdCodice->__toString())) && (IsNOTNullOrEmptyOrZeroString($DatiAnagrafici->CodiceFiscale->__toString())) ) {
		$AnagraficaCLIFAT = WFVALUEDLOOKUP('*', 'angaziende', "PIVA = '"  . $IdFiscaleIVA->IdCodice->__toString() . "' 
															AND CF = '" . $DatiAnagrafici->CodiceFiscale->__toString() . "'");
	}
	if (($AnagraficaCLIFAT == '' ) && (IsNOTNullOrEmptyOrZeroString($IdFiscaleIVA->IdCodice->__toString()))){
		$AnagraficaCLIFAT = WFVALUEDLOOKUP('*', 'angaziende', "PIVA = '"  . $IdFiscaleIVA->IdCodice->__toString() . "'");
	}
	if (($AnagraficaCLIFAT == '' ) && (IsNOTNullOrEmptyOrZeroString($DatiAnagrafici->CodiceFiscale->__toString())) ){
		$AnagraficaCLIFAT = WFVALUEDLOOKUP('*', 'angaziende', "CF = '" . $DatiAnagrafici->CodiceFiscale->__toString() . "'");
	}

	if ($AnagraficaCLIFAT == '') {
		//INSERT
		$Anagrafica = $DatiAnagrafici->children()->Anagrafica;
		$Sede = $CedentePrestatore->children()->Sede;	
		
		$AppoRecord = array();
		$AppoRecord['CF'] = $DatiAnagrafici->CodiceFiscale->__toString(); 
		$AppoRecord['NAZIONE'] = $IdFiscaleIVA->IdPaese->__toString();
		$AppoRecord['PIVA'] = $IdFiscaleIVA->IdCodice->__toString();
		
		if (property_exists ($Anagrafica , 'Denominazione' )){
			$AppoRecord['RAGSOCIALE'] = $Anagrafica->Denominazione->__toString();
		}else{
			$AppoRecord['RAGSOCIALE'] = $Anagrafica->Nome->__toString() . ' ' . $Anagrafica->Cognome->__toString();
		}
		$AppoRecord['INDIRIZZO'] = $Sede->Indirizzo->__toString() . ' ' . $Sede->NumeroCivico->__toString();
		$AppoRecord['CAP'] = $Sede->CAP->__toString();
		$AppoRecord['CITTA'] = $Sede->Comune->__toString();  
		$AppoRecord['PROVINCIA'] = $Sede->Provincia->__toString(); 
		$AppoRecord['NAZIONE'] = $Sede->Nazione->__toString();
		
		if (property_exists ( $CedentePrestatore->children() , 'Contatti' )){
			$Contatti = $CedentePrestatore->children()->Contatti;
		}else{
			$Contatti = $DatiTrasmissione->children()->ContattiTrasmittente;
		}
		
		if (property_exists ($Contatti , 'Telefono' )){
			$AppoRecord['TELEFONO'] = $Contatti->Telefono->__toString(); 
		}
		if (property_exists ($Contatti , 'Fax' )){
			$AppoRecord['FAX'] = $Contatti->Fax->__toString();
		}
		
		$AppoRecord = WFARRAYEPURE($AppoRecord);
		$conn->AutoExecute('angaziende', $AppoRecord, 'INSERT');
		$AnagraficaCLIFAT = WFVALUEDLOOKUP('*', 'angaziende', "ID = "  . $conn->Insert_ID());
	}else{
		//UPDATE
		$Sede = $CedentePrestatore->children()->Sede;	
		$Anagrafica = $DatiAnagrafici->children()->Anagrafica;
		
		$AppoRecord = array();
		$AppoRecord['CF'] = $DatiAnagrafici->CodiceFiscale->__toString(); 
		$AppoRecord['NAZIONE'] = $IdFiscaleIVA->IdPaese->__toString();
		$AppoRecord['PIVA'] = $IdFiscaleIVA->IdCodice->__toString();
		if (property_exists ($Anagrafica , 'Denominazione' )){
			$AppoRecord['RAGSOCIALE'] = $Anagrafica->Denominazione->__toString();
		}else{
			$pos = strrpos($AnagraficaCLIFAT['RAGSOCIALE'], $Anagrafica->Nome->__toString() . ' ' . $Anagrafica->Cognome->__toString());
			if ($pos === false) { 
				$AppoRecord['RAGSOCIALE'] = $Anagrafica->Nome->__toString() . ' ' . $Anagrafica->Cognome->__toString();
			}
		}
		$AppoRecord['INDIRIZZO'] = $Sede->Indirizzo->__toString() . ' ' . $Sede->NumeroCivico->__toString();
		$AppoRecord['CAP'] = $Sede->CAP->__toString();
		$AppoRecord['CITTA'] = $Sede->Comune->__toString();  
		$AppoRecord['PROVINCIA'] = $Sede->Provincia->__toString(); 
		$AppoRecord['NAZIONE'] = $Sede->Nazione->__toString();
		
		if (property_exists ( $CedentePrestatore->children() , 'Contatti' )){
			$Contatti = $CedentePrestatore->children()->Contatti;
		}else{
			$Contatti = $DatiTrasmissione->children()->ContattiTrasmittente;
		}
		
		if (property_exists ($Contatti , 'Telefono' )){
			$AppoRecord['TELEFONO'] = $Contatti->Telefono->__toString(); 
		}
		if (property_exists ($Contatti , 'Fax' )){
			$AppoRecord['FAX'] = $Contatti->Fax->__toString();
		}
		
		$AppoRecord = WFARRAYEPURE($AppoRecord);
		$conn->AutoExecute('angaziende', $AppoRecord, 'UPDATE', 'ID = ' . $AnagraficaCLIFAT['ID']);
	}
	
	//COMMITTENTE (ME STESSO)
	$AnagraficaAzienda = WFVALUEDLOOKUP('*','angaziende','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'));
	$CessionarioCommittente = $FatturaElettronicaHeader->children()->CessionarioCommittente;
	
	$DatiAnagrafici = $CessionarioCommittente->children()->DatiAnagrafici;
	$IdFiscaleIVA = $DatiAnagrafici->children()->IdFiscaleIVA;
	
	//testa se indirizzata a me
	if (property_exists($IdFiscaleIVA->children() , 'IdCodice' )){
		if (IsNOTNullOrEmptyOrZeroString($IdFiscaleIVA->IdCodice->__toString())){
			if ($IdFiscaleIVA->IdCodice->__toString() != $AnagraficaAzienda['PIVA']) $AnagraficaAzienda = '';
		}
		if (($AnagraficaCLIFAT == '' ) && (IsNOTNullOrEmptyOrZeroString($DatiAnagrafici->CodiceFiscale->__toString())) ){
			if ($DatiAnagrafici->CodiceFiscale->__toString() != $AnagraficaAzienda['PIVA']) $AnagraficaAzienda = '';
		}
	}
	
	//DOCUMENTO FATTURA
	$FatturaElettronicaBody = $xml->children()->FatturaElettronicaBody;
	$DatiBeniServizi = $FatturaElettronicaBody->children()->DatiBeniServizi;
	$DatiPagamento = $FatturaElettronicaBody->children()->DatiPagamento;
	
	/***************************/
	/* 			TESTA		  */
	/***************************/
	$DatiGenerali = $FatturaElettronicaBody->children()->DatiGenerali;
	$DatiGeneraliDocumento = $DatiGenerali->children()->DatiGeneraliDocumento;
	
	$AppoFattura['CT_FATTURAZIONE'] = $AnagraficaCLIFAT['ID'];
	$AppoFattura['IBAN'] = $AnagraficaCLIFAT['IBAN'];
	$AppoFattura['CT_BANCA'] = $AnagraficaCLIFAT['CT_BANCA'];
	$AppoFattura['VALOREIMPONIBILE'] = 0;
	$AppoFattura['VALORETOTALEIVA'] =  0;
	$AppoFattura['VALORETOTALE'] =  0;
	$AppoFattura['TOTALIDEF'] = 0;
	
	if ($DatiGeneraliDocumento->TipoDocumento->__toString() == 'TD04') {
		//nota di credito (negli altri casi e fattura totale o parziale o parcella)
		$AppoFattura['CT_CAUSALI'] = WFVALUEGLOBAL('SDI_CAUSALEPASSIVANC');	
		$notaCredito = true;		
	}else{
		$AppoFattura['CT_CAUSALI'] = WFVALUEGLOBAL('SDI_CAUSALEPASSIVA');
	}
	$Causale = WFVALUEDLOOKUP('*','causali','ID = ' . $AppoFattura['CT_CAUSALI'] );
	
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
	
	$AppoFattura['SEGNO'] = 1; // $Causale['SEGNO'];
	$AppoFattura['CT_SEZIONALI'] = $Causale['CT_SEZIONALI'];
	$AppoFattura['CT_MAGAZZINI'] = 1;

	$AppoFattura['NOTE'] = 1;
	$AppoFattura['DOCDATA'] = $DatiGeneraliDocumento->Data->__toString();
	$AppoFattura['CESSIONEDATA'] = $DatiGeneraliDocumento->Data->__toString();

	$AppoFattura['DOCNUM'] = $DatiGeneraliDocumento->Numero->__toString();
							//$DatiGeneraliDocumento->Divisa->__toString();
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
		$AppoFattura['CASSAPREVALIQUOTAIVA'] = $CassaPrevidenzialeDati->AliquotaIVA;
		$AppoFattura['CASSAPRERITENUTA'] = $CassaPrevidenzialeDati->Ritenuta;
		$AppoFattura['CASSAPRENATURA'] = $CassaPrevidenzialeDati->Natura;
	}
	
	/***************************/
	/* ScontoMaggiorazioneTOT  */
	/***************************/
	if (property_exists ( $DatiGeneraliDocumento->children() , 'ScontoMaggiorazione' )){
		$ScontoMaggiorazione = $DatiGeneraliDocumento->children()->ScontoMaggiorazione;
		if(property_exists ( $ScontoMaggiorazione , 'Importo' )){
			$AppoFatMovimenti['SCONTOMAGEUR'] = $ScontoMaggiorazione->Importo->__toString();
			if($ScontoMaggiorazione->Tipo->__toString() == 'SC'){
				$AppoFatMovimenti['SCONTOMAGEUR'] = $AppoFatMovimenti['SCONTOMAGEUR']  * -1;
			}
		}
		if(property_exists ( $ScontoMaggiorazione , 'Percentuale' )){
			$AppoFatMovimenti['SCONTOMAG0'] = $ScontoMaggiorazione->Percentuale->__toString();
			if($ScontoMaggiorazione->Tipo->__toString() == 'SC'){
				$AppoFatMovimenti['SCONTOMAG0'] = $AppoFatMovimenti['SCONTOMAG0']  * -1;
			}
		}
	}
	
	
	//$AppoFattura['SDI_PEC'] = 'sdi24@pec.fatturapa.it';
	$AppoFattura['SDI_DATA'] = $FATSDIProgressivo . '-' . WFVALUENOW();
	$AppoFattura['SDI_STAUS'] = 'OK';
	$AppoFattura['CT_OPERATORE'] = 1;
	$AppoFattura['CG_CT_CONTABILEESERCIZI'] = WFVALUEDLOOKUP('ID', 'cg_contabileesercizi', 
															   "DATAFINE >= " . WFSQLTODATE($AppoFattura['DOCDATA']) . " AND DATAINIZIO <= " . WFSQLTODATE($AppoFattura['DOCDATA']));

	if ($FatID == null){
		try {   
			$conn->AutoExecute("fat", $AppoFattura, 'INSERT');
		} catch (exception $e){
			$output['message'] = $output['message'] . 'Fattura' . $AppoFattura['CT_FATTURAZIONE'] . ' ' . $AppoFattura['DOCNUM'] . ' ' . $FileName . ' DUPLICATA Errore ' .BRCRLF ;
			$output['failure'] = true;
			$output['success'] = false;
			goto fine;
		}
		$FatID = $conn->Insert_ID();
		$AppoFattura['ID'] = $FatID;
	}else{
		$conn->AutoExecute("fat", $AppoFattura, 'UPDATE', 'ID =' . $FatID);
	}
	$AppoFattura['DOCBARCODE']  =  WFVALUEDOCIDEAN('fat', $FatID ) ;
	
	/***************************/
	/* 		TOTALI 		       */
	/***************************/
	$AppoFattura['VALOREIMPONIBILE']=0;
	$AppoFattura['VALORETOTALEIVA'] = 0;
	$AppoFattura['VALORETOTALE'] = 0;
	if (property_exists ( $DatiBeniServizi->children() , 'DatiRiepilogo' )){
		$DatiRiepilogo = $DatiBeniServizi->children()->DatiRiepilogo;
		foreach ($DatiRiepilogo as $DatiRiepilogoLinea){
			//$DatiRiepilogo->AliquotaIVA->__toString();
			$AppoFatIva = array();
			$AppoFatIva['CT_FAT'] = $FatID;
			
			$AppoFatIva['IMPONIBILE'] = $DatiRiepilogoLinea->ImponibileImporto->__toString();
			$AppoFatIva['IMPOSTA']  = $DatiRiepilogoLinea->Imposta->__toString();
			$AppoFatIva['PERCENTUALE']  = $DatiRiepilogoLinea->AliquotaIVA->__toString();
			$AppoFatIva['DESCRIZIONE']  = '';
			if (property_exists ( $DatiRiepilogoLinea->children() , 'RiferimentoNormativo' )){
				$AppoFatIva['DESCRIZIONE']  = $DatiRiepilogoLinea->RiferimentoNormativo->__toString();
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
			$conn->AutoExecute("fativa", $AppoFatIva, 'INSERT');
		
			$AppoFattura['VALOREIMPONIBILE'] =  $AppoFattura['VALOREIMPONIBILE']  + $AppoFatIva['IMPONIBILE'] ;
			$AppoFattura['VALORETOTALEIVA'] = $AppoFattura['VALORETOTALEIVA'] + $AppoFatIva['IMPOSTA'] ;
			$AppoFattura['VALORETOTALE'] =  $AppoFattura['VALORETOTALE'] + $AppoFatIva['IMPOSTA'] + $AppoFatIva['IMPONIBILE'] ;
		}
	}
	try {   
		$conn->AutoExecute("fat", $AppoFattura, 'UPDATE', 'ID =' . $FatID);
	} catch (exception $e){
		$output['message'] = $output['message'] . 'Fattura IN UPDATE ' . $AppoFattura['DOCNUM'] . ' Errore ' .BRCRLF ;
		$output['failure'] = true;
		$output['success'] = false;
		goto fine;
	}
	
	/***************************/
	/* 	RIGHE VENDITA FT	  */
	/***************************/
	$DettaglioLinee = $DatiBeniServizi->children()->DettaglioLinee;
	foreach ($DettaglioLinee as $DettaglioLinea){
		//FATMOVIMENTI
		$AppoFatMovimenti = array();
		$AppoFatMovimenti['CT_FAT'] = $FatID;
		$AppoFatMovimenti['RIGA'] = $DettaglioLinea->NumeroLinea->__toString();	
		
		$CodiceArticolo = $DettaglioLinea->children()->CodiceArticolo;
		//$CodiceTipo = $CodiceArticolo->CodiceTipo->__toString();
		if (property_exists ( $CodiceArticolo , 'CodiceValore' )){
			$ArticoloListino = WFVALUEDLOOKUP('*','articolilistini',"CT_ANGAZIENDE = " . $AnagraficaCLIFAT['ID'] . 
																	" AND CODICEALTERNATIVO = '" . addslashes($CodiceArticolo->CodiceValore->__toString()) . "'");
			if ($ArticoloListino == ''){
				$Articolo = WFVALUEDLOOKUP('*','articoli',"CODICE = '" . addslashes($CodiceArticolo->CodiceValore->__toString()) . "'");
				if ($Articolo != ''){
					$AppoFatMovimenti['CT_ARTICOLI'] = $Articolo['ID'];
				}else{
					//DAFARE SDI_AUTOARTICOLI genera articolo in anagrafica articoli
					if ($AnagraficaCLIFAT['SDI_AUTOARTICOLI']){
						$Articolo = array();
						$Articolo['ID'] = null;
						$Articolo['CODICE'] = $CodiceArticolo->CodiceValore->__toString();
						$Articolo['DESCRIZIONE'] = $DettaglioLinea->Descrizione->__toString();
						$Articolo['CT_FORNITORE'] = $AnagraficaCLIFAT['ID'];
						$Articolo['UM0'] = 'NR';
						$Articolo['UMCONV'] = '1';
						$Articolo['UM1'] = 'NR';
						$conn->AutoExecute("articoli", $Articolo, 'INSERT');
						$Articolo['ID'] = $conn->Insert_ID();
						
						$ArticoloListino = array();
						$ArticoloListino['CT_ARTICOLI'] = $Articolo['ID'];
						$ArticoloListino['CODICEALTERNATIVO'] = $CodiceArticolo->CodiceValore->__toString();
						$ArticoloListino['UM'] = 'NR';
						$ArticoloListino['DESCRIZIONEALTERNATIVO'] = $DettaglioLinea->Descrizione->__toString();
						$ArticoloListino['CT_ANGAZIENDE'] = $AnagraficaCLIFAT['ID'];
						$ArticoloListino['VALORE'] = $DettaglioLinea->PrezzoUnitario->__toString();
						$conn->AutoExecute("articolilistini", $ArticoloListino, 'INSERT');
						$ArticoloListino['ID'] = $conn->Insert_ID();
						$AppoFatMovimenti['CT_ARTICOLI'] = $Articolo['ID'];
					}else{
						$AppoFatMovimenti['CT_ARTICOLI'] = WFVALUEGLOBAL('CG_ARTICOLODESCRITTIVO');
					}
				}
			}else{
				$AppoFatMovimenti['CT_ARTICOLI'] = $ArticoloListino['CT_ARTICOLI'];
			}
			$AppoFatMovimenti['CODICE'] = $CodiceArticolo->CodiceValore->__toString() ;
		}else{
			$AppoFatMovimenti['CT_ARTICOLI'] = WFVALUEGLOBAL('CG_ARTICOLODESCRITTIVO');
		}
	
		$AppoFatMovimenti['DESCRIZIONE'] = $DettaglioLinea->Descrizione->__toString();
		
		$AppoFatMovimenti['QTA'] = 1;
		if (property_exists ( $DettaglioLinea->children() , 'Quantita' )){
			$AppoFatMovimenti['QTA'] = $DettaglioLinea->Quantita->__toString();
		}
		if (IsNullOrEmptyOrZeroString($AppoFatMovimenti['QTA']))   $AppoFatMovimenti['QTA'] = 1;
		
		$AngUm = 'NR';
		if (property_exists ( $DettaglioLinea , 'UnitaMisura' )){
			$AngUm = WFVALUEDLOOKUP('*','angum',"ID = '" . $DettaglioLinea->UnitaMisura->__toString() . "'");
	    	if (IsNullOrEmptyOrZeroString($AngUm)) { $AngUm = 'NR';}
		}
		$AppoFatMovimenti['QTAUM'] = $AngUm;
		
		$AppoFatMovimenti['QTARIGA'] = $AppoFatMovimenti['QTA'];
		
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
		$AppoFatMovimenti['VALORELISTINO'] = $DettaglioLinea->PrezzoUnitario->__toString();
		
		$AppoFatMovimenti['SCONTOMAGEUR'] = 0;
		$AppoFatMovimenti['SCONTOMAG0'] = 0;
		$AppoFatMovimenti['SCONTOMAG1'] = 0;
		$AppoFatMovimenti['SCONTOMAG2'] = 0;
		$AppoFatMovimenti['SCONTOMAG3'] = 0;
		
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
		$CalValoreRiga = ($AppoFatMovimenti['VALORELISTINO']  * ( 1 + $AppoFatMovimenti['SCONTOMAG0'] / 100 ) 
															* ( 1 + $AppoFatMovimenti['SCONTOMAG1']  / 100 )
															* ( 1 + $AppoFatMovimenti['SCONTOMAG2']  / 100 )
															* ( 1 + $AppoFatMovimenti['SCONTOMAG3']  / 100 )
							)	+ $AppoFatMovimenti['SCONTOMAGEUR'] ;
				 
		$AppoFatMovimenti['VALORERIGA'] = $CalValoreRiga;  
		$AppoFatMovimenti['VALORERIGATOT'] = $DettaglioLinea->PrezzoTotale->__toString();
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
			$AppoFatMovimenti['VALORERIGATOT'] =  abs($AppoFatMovimenti['VALORERIGATOT']) * $AppoFatMovimenti['QTA'];
		}
		$AppoFatMovimenti['VALORERIGAINVALUTA'] = $AppoFatMovimenti['VALORERIGA'];
		$AppoFatMovimenti['VALORERIGAIVA'] = round((($AppoFatMovimenti['VALORERIGA']* $AppoFatMovimenti['QTA']) / 100) * $Aliquota['VALORE'], 2);
		if ($AppoFattura['TOTALIDEF'] == 0){
			$AppoFattura['VALOREIMPONIBILE'] = $AppoFattura['VALOREIMPONIBILE'] + $AppoFatMovimenti['VALORERIGATOT'];
			$AppoFattura['VALORETOTALEIVA'] =  $AppoFattura['VALORETOTALEIVA'] + ($AppoFatMovimenti['VALORERIGAIVA'] * $AppoFatMovimenti['QTA']);
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
			foreach ($AltriDatiGestionali as $AltriDatoGestionali){
				$AppoFatMovimenti['NOTERIGA'] = $AppoFatMovimenti['NOTERIGA'] . 
												$AltriDatoGestionali->TipoDato->__toString() . 
												' : ' . 
												$AltriDatoGestionali->RiferimentoTesto->__toString() .  "   ";	
			}
		}
		
		
			
		$conn->AutoExecute("fatmovimenti", $AppoFatMovimenti, 'INSERT');
	}
	
	
	/***************************/
	/* 		RIGHE ORDINE	  */
	/***************************/
	$OrdiniArray = array();
	if (property_exists ( $DatiGenerali , 'DatiOrdineAcquisto' )){
		$DatiOrdineAcquisto = $DatiGenerali->children()->DatiOrdineAcquisto;
		foreach ($DatiOrdineAcquisto as $DatiOrdineAcquistoRiga){
			$RiferimentoNumeroLinea = $DatiOrdineAcquistoRiga->children()->RiferimentoNumeroLinea;
			foreach ($RiferimentoNumeroLinea as $RiferimentoNumeroLineaRiga){
				$FatMovimento = WFVALUEDLOOKUP('*','fatmovimenti',"CT_FAT = " . $FatID . " AND RIGA = '" . $RiferimentoNumeroLineaRiga->__toString() . "'" );
				if ($DatiOrdineAcquistoRiga->Data->__toString() != ''){
					$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $AnagraficaCLIFAT['ID'] . 
														" AND DOCNUM = '" . $DatiOrdineAcquistoRiga->IdDocumento->__toString() . "'" .
														" AND DOCDATA = '" . $DatiOrdineAcquistoRiga->Data->__toString() . "'");
				}else{
					$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $AnagraficaCLIFAT['ID'] . 
														" AND DOCNUM = '" . $DatiOrdineAcquistoRiga->IdDocumento->__toString() . "'");
				}
				if ($Ord == ''){
					
					$OrdNumEpure = preg_replace("/[^A-Za-z0-9]/", '', $DatiOrdineAcquistoRiga->IdDocumento->__toString());
					if ($DatiOrdineAcquistoRiga->Data->__toString() != ''){
						$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $AnagraficaCLIFAT['ID'] . 
														" AND REGEXP_REPLACE(DOCNUM,'[^A-Za-z0-9]','', 1, 3) = '" . $OrdNumEpure . "'" .
														" AND DOCDATA = '" . $DatiOrdineAcquistoRiga->Data->__toString() . "'");
					}else{
						$Ord = WFVALUEDLOOKUP('*','ord',"CT_FATTURAZIONE = " . $AnagraficaCLIFAT['ID'] . 
														" AND REGEXP_REPLACE(DOCNUM,'[^A-Za-z0-9]','', 1, 3) = '" . $OrdNumEpure . "'");
					}
				}
													
				$OrdMovimenti ='';
				if ($FatMovimento != ''){
					if (($Ord == '') && ($AnagraficaCLIFAT['SDI_AUTOORD'] == true)){
						$Ord = array();
						$Ord['ID'] = null;
						$Ord['CT_FATTURAZIONE'] = $AnagraficaCLIFAT['ID'];
						$Ord['CT_CAUSALI'] = WFVALUEGLOBAL('MRP_CAUSALEACQUISTO');
						$Ord['DOCNUM'] = $DatiOrdineAcquistoRiga->IdDocumento->__toString();
						$Causale = WFVALUEDLOOKUP('*','causali','ID = ' . $Ord['CT_CAUSALI'] );
						$Ord['SEGNO'] = $Causale['SEGNO'];
						$Ord['CG_CT_CONTABILEESERCIZI'] = WFVALUEYEAR();
						$Ord['DOCDATA'] = WFVALUEDAY();
						if ($DatiOrdineAcquistoRiga->Data->__toString() != ''){
							$Ord['DOCDATA'] = $DatiOrdineAcquistoRiga->Data->__toString();
							$Ord['CG_CT_CONTABILEESERCIZI'] = WFVALUEDLOOKUP('ID', 'cg_contabileesercizi', "DATAFINE >= " . WFSQLTODATE($Ord['DOCDATA']) . " AND DATAINIZIO <= " . WFSQLTODATE($Ord['DOCDATA']));
						}
						//WFVALUEDOCIDEAN($Chiave, $TestaCorrente['ID'] );
						$conn->AutoExecute("ord", $Ord, 'INSERT');
						$Ord['ID'] = $conn->Insert_ID();
					}
						
					if ($Ord != '') { 
					if (property_exists ( $DatiDDTRiga , 'NumItem' )){				
						$OrdMovimenti = WFVALUEDLOOKUP('*','ordmovimenti',"CT_ORD = " . $Ord['ID'] ." AND RIGA = '" . $DatiOrdineAcquistoRiga->NumItem->__toString() . "'");
					}
					
					if ($OrdMovimenti == ''){
						$OrdMovimenti = WFVALUEDLOOKUP('*','ordmovimenti',"CT_ORD = " . $Ord['ID'] .  " AND CT_ARTICOLI = " . $FatMovimento['CT_ARTICOLI'] );
					}
					
					if (($OrdMovimenti == '') && ($AnagraficaCLIFAT['SDI_AUTOORD'] == true)){
						$OrdMovimenti = array();
						$OrdMovimenti['CT_ARTICOLI'] = WFVALUEGLOBAL('MRP_CAUSALEACQUISTO');
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
						
						$OrdiniArray[$RiferimentoNumeroLinea]['FATRIGA'] = $RiferimentoNumeroLinea;
						$OrdiniArray[$RiferimentoNumeroLinea]['CT_FATMOVIMENTI'] = $FatMovimento['ID'];
						$OrdiniArray[$RiferimentoNumeroLinea]['CT_ORD'] = $Ord['ID'];
						$OrdiniArray[$RiferimentoNumeroLinea]['CT_ORDMOVIMENTI'] = $OrdMovimenti['ID'];
					}else{				
						//riferimento ordine non trovati ma presenti in fattura
						$StrSQL = "UPDATE fatmovimenti 
										SET RIF = concat(COALESCE(RIF,'') ,'Ord:" . $DatiOrdineAcquistoRiga->IdDocumento->__toString() . 
																		" Del:" . $DatiOrdineAcquistoRiga->Data->__toString() . 
																		" Riga:" . $RiferimentoNumeroLineaRiga->__toString() . "')" .
								" WHERE ID = " . $FatMovimento['ID'] ;
						$conn->Execute ($StrSQL);
					}
				}else{
					//riferimento ordine non trovati ma presenti in fattura
					$StrSQL = "UPDATE fatmovimenti 
									SET RIF = concat(COALESCE(RIF,'') ,'Ord:" . $DatiOrdineAcquistoRiga->IdDocumento->__toString() . 
																		" Del:" . $DatiOrdineAcquistoRiga->Data->__toString() . 
																		" Riga:" . $RiferimentoNumeroLineaRiga->__toString() . "')" .
								" WHERE ID = " . $FatMovimento['ID'] ;
					$conn->Execute ($StrSQL);
				}
				}
			}
		}
	}
				
	/***************************/
	/* 		RIGHE DDT	  */
	/***************************/
	if (property_exists ( $DatiGenerali , 'DatiDDT' )){
		$DatiDDT = $DatiGenerali->children()->DatiDDT;
		foreach ($DatiDDT as $DatiDDTRiga){
			$RiferimentoNumeroLinea = $DatiDDTRiga->children()->RiferimentoNumeroLinea;
			foreach ($RiferimentoNumeroLinea as $RiferimentoNumeroLineaRiga){
				$FatMovimento = WFVALUEDLOOKUP('*','fatmovimenti',"CT_FAT = " . $FatID . " AND RIGA = '" . $RiferimentoNumeroLineaRiga->__toString() . "'" );
				$Ddt = WFVALUEDLOOKUP('*','ddt',"CT_FATTURAZIONE = " . $AnagraficaCLIFAT['ID'] . 
													" AND DOCNUM = '" . $DatiDDTRiga->NumeroDDT->__toString() . "'" .
													" AND DOCDATA = '" . $DatiDDTRiga->DataDDT->__toString() . "'");
				if ($Ddt == ''){
					$DdtNumEpure = preg_replace("/[^A-Za-z0-9]/", '', $DatiDDTRiga->NumeroDDT->__toString());
					
					$Ddt = WFVALUEDLOOKUP('*','ddt',"CT_FATTURAZIONE = " . $AnagraficaCLIFAT['ID'] . 
													" AND REGEXP_REPLACE(DOCNUM,'[^A-Za-z0-9]','', 1, 3) = '" . $DdtNumEpure . "'" .
													" AND DOCDATA = '" . $DatiDDTRiga->DataDDT->__toString() . "'");
				}
				$DdtMovimenti ='';
				
				if ($FatMovimento != ''){
					if (($Ddt == '') && ($AnagraficaCLIFAT['SDI_AUTODDT'] == true)){
						$Ddt = array();
						$Ddt['ID'] = null;
						$Ddt['CT_FATTURAZIONE'] = $AnagraficaCLIFAT['ID'];
						$Ddt['CT_CAUSALI'] = WFVALUEGLOBAL('MRP_CAUSALEACQUISTO');
						$Ddt['DOCNUM'] = $DatiDDTRiga->NumeroDDT->__toString();
						$Ddt['DOCDATA'] = $DatiDDTRiga->DataDDT->__toString();
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
						$DdtMovimenti['CT_ARTICOLI'] = WFVALUEGLOBAL('MRP_CAUSALEACQUISTO');
						$DdtMovimenti = WFRECORDCLONE($FatMovimento) ;
						$DdtMovimenti['ID'] = null;
						$DdtMovimenti['CT_DDT'] = $Ddt['ID'];
						$conn->AutoExecute("ddtmovimenti", $DdtMovimenti, 'INSERT');
						$DdtMovimenti['ID'] = $conn->Insert_ID();
					}
					
					if ($DdtMovimenti != '') {
						$StrSQL = "UPDATE fatmovimenti SET CT_DDTMOVIMENTI = " . $DdtMovimenti['ID'] . " WHERE ID = " . $FatMovimento['ID'] ;
						$conn->Execute ($StrSQL);
						if(
							(IsNullOrEmptyOrZeroString($DdtMovimenti['CT_ORDMOVIMENTI'])) && 
							(!IsNullOrEmptyOrZeroString($OrdiniArray[$RiferimentoNumeroLinea]['CT_ORDMOVIMENTI']))
						){
							$StrSQL = "UPDATE ddtmovimenti SET CT_ORDMOVIMENTI = " . $OrdiniArray[$RiferimentoNumeroLinea]['CT_ORDMOVIMENTI'] . " WHERE ID = " . $DdtMovimenti['ID'] ;
							$conn->Execute ($StrSQL);
						}
					}else{				
						//riferimento ordine non trovati ma presenti in fattura
						$StrSQL = "UPDATE fatmovimenti 
										SET RIF = concat(COALESCE(RIF,'') ,'Ddt:" . $DatiDDTRiga->IdDocumento->__toString() . 
																			" Del:" . $DatiDDTRiga->Data->__toString() . 
																			" Riga:" . $RiferimentoNumeroLineaRiga->__toString() . "')" .
									" WHERE ID = " . $FatMovimento['ID'] ;
						$conn->Execute ($StrSQL);
					}
				}else{
					//riferimento ordine non trovati ma presenti in fattura
					$StrSQL = "UPDATE fatmovimenti 
									SET RIF = concat(COALESCE(RIF,'') , 'Ddt:" . $DatiDDTRiga->IdDocumento->__toString() . 
																		" Del:" . $DatiDDTRiga->Data->__toString() . 
																		" Riga:" . $RiferimentoNumeroLineaRiga->__toString() . "')" .
									" WHERE ID = " . $FatMovimento['ID'] ;
					$conn->Execute ($StrSQL);
				}
				}
			}
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
			
			
			if (property_exists ( $DettaglioPagamentoRiga , 'DataScadenzaPagamento' )){
				$AppoFatScadenze['DATA'] = $DettaglioPagamentoRiga->DataScadenzaPagamento->__toString();
			}
			elseif (property_exists ( $DettaglioPagamentoRiga , 'GiorniTerminiPagamento' )){
				$RataData = new DateTime($DettaglioPagamentoRiga->DataRiferimentoTerminiPagamento->__toString());
				$RataData = date_add($RataData, date_interval_create_from_date_string($DettaglioPagamentoRiga->GiorniTerminiPagamento->__toString() . ' days'));
				$AppoFatScadenze['DATA'] = $RataData;
			}else{
				$AppoFatScadenze['DATA'] = $AppoFattura['DOCDATA'];
			}
			
			$AppoFatScadenze['VALORE'] = $DettaglioPagamentoRiga->ImportoPagamento->__toString();
			$AppoFatScadenze['VALOREINVALUTA'] = $DettaglioPagamentoRiga->ImportoPagamento->__toString();
			$conn->AutoExecute("fatscadenze", $AppoFatScadenze, 'INSERT');
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
		global $ExtJSDevDOC;
		$Allegati = $FatturaElettronicaBody->children()->Allegati;
		foreach ($Allegati as $Allegato){
			$NomeAttachment = $Allegato->NomeAttachment->__toString();
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
			copy( $ExtJSDevDOC . $FileNameNew );
		}
	}
	if ($conn->HasFailedTrans()) {
		$output['message'] = $output['message'] . 'Fattura Errore '  . WFFileName($FileName) . ' ' . $AppoFattura['DOCNUM'] .BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		$conn->completeTrans(); 
		return null;
	}else{
		$output['message'] = $output['message'] . 'Fattura Registrata ' . $AppoFattura['DOCNUM'] .BRCRLF;
		$output['failure'] = false;
		$output['success'] = true;
		$conn->completeTrans(); 
		return $FatID;
	}
	fine:
		$output['message'] = $output['message'] . 'Fattura Errore ' .BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		$conn->completeTrans(); 
}



function SDIEncodeIVAXML($DataIniziale, $SdiProgressivo, $FileName = '') {
	global $conn;
	global $ExtJSDevExportRAW;
	global $output;
	
	$AnagraficaAzienda = WFVALUEDLOOKUP('*','angaziende','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'));
	if ($AnagraficaAzienda == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICAAZIENDA  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	$AnagraficaIntermediario = WFVALUEDLOOKUP('*','angaziende','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAINTERMEDIARIO'));
	if ($AnagraficaIntermediario == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICAINTERMEDIARIO  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	$AnagraficaDichiarante = WFVALUEDLOOKUP('*','angaziende','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICADICHIARANTE'));
	if ($AnagraficaDichiarante == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICADICHIARANTE  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	
	
	$StrSQL = "SELECT * 
				FROM cg_liquidazioniiva 
				WHERE ANNOMESE >= '" . $DataIniziale .  "'
					AND ANNOMESE < DATE_ADD('" . $DataIniziale .  "', INTERVAL " . 3 . " MONTH); "; 
	$rsLiquidazioni = $conn->Execute($StrSQL);
	
	$FatturatoAttivita = 0;
	$FatturatoPassivita = 0;
	$IvaAttivita = 0;
	$IvaPassivita = 0;
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
			$writer->writeElement('iv:CodiceFornitura', 'IVP17'); 
			$writer->writeElement('iv:CodiceFiscaleDichiarante', $AnagraficaDichiarante['CF']); 
			$writer->writeElement('iv:CodiceCarica', 1);
		$writer->endElement();  

		/* 	Comunicazione iva  */
		$writer->startElement('iv:Comunicazione');
			$writer->writeAttribute('identificativo', '00001'); 

			$writer->startElement('iv:Frontespizio');
				$writer->writeElement('iv:CodiceFiscale', $AnagraficaAzienda['CF']); 
				$writer->writeElement('iv:AnnoImposta', WFVALUEYEAR($DataIniziale )); 
				$writer->writeElement('iv:PartitaIVA', $AnagraficaAzienda['PIVA']); 
				$writer->writeElement('iv:LiquidazioneGruppo', 0);
				$writer->writeElement('iv:CFDichiarante', $AnagraficaDichiarante['CF']);
				$writer->writeElement('iv:CodiceFiscaleSocieta', $AnagraficaAzienda['CF']);			
				$writer->writeElement('iv:CodiceCaricaDichiarante', 1); 
				$writer->writeElement('iv:FirmaDichiarazione', 1); 
				$writer->writeElement('iv:CFIntermediario', $AnagraficaIntermediario['CF']);
				$writer->writeElement('iv:ImpegnoPresentazione', 1);
				$writer->writeElement('iv:DataImpegno', WFVALUENOW('dmyy'));
				$writer->writeElement('iv:FirmaIntermediario', 1); 
			$writer->endElement();  

			$writer->startElement('iv:DatiContabili');
			$mese = 0;
			while (!$rsLiquidazioni->EOF) {
				$mese = $mese +1;
				$FatturatoAttivita =  $rsLiquidazioni->fields['FATTURATOATTIVITA'];
				$FatturatoPassivita = $rsLiquidazioni->fields['FATTURATOPASSIVITA'];
				$IvaAttivita = $rsLiquidazioni->fields['TOTALEATTIVA'];
				$IvaPassivita = $rsLiquidazioni->fields['TOTALEPASSIVITA'];
				$IvaTotale =  $rsLiquidazioni->fields['TOTALEIVA'];
				$Interessi = $rsLiquidazioni->fields['INTERESSI'];
				$IvaMese = $IvaMese + $rsLiquidazioni->fields['TOTALEMESE'];
				$Compensato = $rsLiquidazioni->fields['COMPENSATO'];
				$Versato = $rsLiquidazioni->fields['VERSATO'];
				$AnnoMese = $rsLiquidazioni->fields['ANNOMESE'];
				$Saldo = $rsLiquidazioni->fields['SALDO'];
				$IvaMesePrec = $rsLiquidazioni->fields['TOTALEMESEPREC'];
	
				$writer->startElement('iv:Modulo');
					$writer->writeElement('iv:Mese', WFVALUEMONTH($AnnoMese)); 
					//	$writer->writeElement('iv:Trimestre', WFVALUETRIMESTRE($DataIniziale)); 
					$writer->writeElement('iv:Subfornitura', 0); 
					$writer->writeElement('iv:TotaleOperazioniAttive', $FatturatoAttivita); 
					$writer->writeElement('iv:TotaleOperazioniPassive', $FatturatoPassivita); 
					$writer->writeElement('iv:IvaEsigibile', abs($IvaAttivita)); 
					$writer->writeElement('iv:IvaDetratta', abs($IvaPassivita)); 
					if ($IvaTotale < 0){
						$writer->writeElement('iv:IvaCredito', abs($IvaTotale)); 
					}else{
						$writer->writeElement('iv:IvaDovuta', abs($IvaTotale));
					}
					$writer->writeElement('iv:InteressiDovuti', $Interessi); 
					$writer->writeElement('iv:CreditoPeriodoPrecedente', abs($IvaMesePrec)); 
					if ($Saldo < 0){
						$writer->writeElement('iv:ImportoACredito', abs($Saldo)); 
					}else{
						$writer->writeElement('iv:ImportoDaVersare', abs($Versato)); 
					}
						
				$writer->endElement(); 

				$rsLiquidazioni->MoveNext();
			}
			$rsLiquidazioni->Close();				
			$writer->endElement();  

		$writer->endElement(); 
	$writer->endDocument(); 
	
	$SdiProgressivo = str_pad($SdiProgressivo,5,'0',STR_PAD_LEFT);
	if ($FileName == '') $FileName = 'IT' . $AnagraficaAzienda['PIVA'] . '_LI_' . $SdiProgressivo . '.xml';
	file_put_contents($ExtJSDevExportRAW . 'sdi/' . $FileName, $writer->flush(true), LOCK_EX);
	
	return $ExtJSDevExportRAW . 'sdi/' . $FileName;
}



function SDIEncodeEsterometroEmessiXML($DataIniziale, $Mesi = 1, $SdiProgressivo, $FileName = '') {
	global $conn;
	global $ExtJSDevExportRAW;
	global $output;
	
	$SdiProgressivo = str_pad($SdiProgressivo,5,'0',STR_PAD_LEFT);
	
	$AnagraficaAzienda = WFVALUEDLOOKUP('*','angaziende','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'));
	if ($AnagraficaAzienda == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICAAZIENDA  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	
	$AnagraficaDichiarante = WFVALUEDLOOKUP('*','angaziende','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICADICHIARANTE'));
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
				$writer->startElement('IdFiscaleIVA');
					$writer->writeElement('IdPaese', 'IT');
					$writer->writeElement('IdCodice', $AnagraficaAzienda['PIVA']);
				$writer->endElement();
				$writer->writeElement('CodiceFiscale', $AnagraficaAzienda['CF']);
			$writer->endElement();
			
			$writer->startElement('AltriDatiIdentificativi');
				$writer->writeElement('Denominazione', $AnagraficaAzienda['RAGSOCIALE']);
				$writer->startElement('Sede');
					$writer->writeElement('Indirizzo', $AnagraficaAzienda['INDIRIZZO']);
					if ($AnagraficaAzienda['NAZIONE'] == 'IT'){
						$writer->writeElement('CAP', $AnagraficaAzienda['CAP']); 
					}else{
						$writer->writeElement('CAP', '99999');
					}
					$writer->writeElement('Comune', $AnagraficaAzienda['CITTA']); 
					$writer->writeElement('Provincia', $AnagraficaAzienda['PROVINCIA']); 
					$writer->writeElement('Nazione', $AnagraficaAzienda['NAZIONE']); 
				$writer->endElement(); 
				$writer->startElement('RappresentanteFiscale');
					$writer->startElement('IdFiscaleIVA');
						$writer->writeElement('IdPaese', 'IT');
						$writer->writeElement('IdCodice', $AnagraficaAzienda['PIVA']);
					$writer->endElement();
					$writer->writeElement('Denominazione', $AnagraficaAzienda['RAGSOCIALE']);
				$writer->endElement(); 
			$writer->endElement();
		$writer->endElement(); 
		
		
		
		/* CessionarioCommittenteDTE CICLO FATTURE ANGAZIENDE */
		
		
	/* Enumera righe  */ 
	$StrSQL = "SELECT 
					cg_contabile.DATAREG,	
					cg_contabile.CT_ANGAZIENDE,
					cg_contabile.ANGAZIENDE_RAGSOCIALE, 
					cg_contabile.ANGAZIENDE_INDIRIZZO, cg_contabile.ANGAZIENDE_CITTA,cg_contabile.ANGAZIENDE_CAP,cg_contabile.ANGAZIENDE_PROVINCIA,
					cg_contabile.ANGAZIENDE_PIVA,cg_contabile.ANGAZIENDE_CF,
					cg_contabile.DOCDATA, cg_contabile.DOCNUM, 
					cg_contabileiva.CG_CT_CONTABILE, 
					cg_contabileiva.IMPONIBILE, cg_contabileiva.IMPOSTATOT,
					aliquote.VALORE, 
					aliquotenatura.CODICE
				FROM cg_contabile
					INNER JOIN cg_contabileiva ON cg_contabileiva.CG_CT_CONTABILE = cg_contabile.ID
					INNER JOIN aliquote ON cg_contabileiva.CT_ALIQUOTE = aliquote.ID
					LEFT JOIN aliquotenatura ON aliquote.CT_ALIQUOTENATURA = aliquotenatura.ID
					INNER JOIN angaziende ON cg_contabile.CT_ANGAZIENDE = angaziende.ID
				WHERE cg_contabile.SEGNO = -1 
					AND aliquote.SPESOMETRO = 1 
					AND cg_contabile.DATAREG >= '" . $DataIniziale .  "'
					AND cg_contabile.DATAREG < DATE_ADD('" . $DataIniziale .  "', INTERVAL " . $Mesi . " MONTH) 
				ORDER BY cg_contabile.CT_ANGAZIENDE "; 
	$rsFatMov = $conn->Execute($StrSQL);
	$i = 1;
	while (!$rsFatMov->EOF) {
		
		$AnagraficaID = $rsFatMov->fields['CT_ANGAZIENDE'];
		$ContabileID = $rsFatMov->fields['CG_CT_CONTABILE'];
						 
		$AnagraficaCLIFAT = WFVALUEDLOOKUP('*','angaziende','ID = ' . $rsFatMov->fields['CT_ANGAZIENDE']);
		$writer->startElement('CessionarioCommittenteDTE');
			$writer->startElement('IdentificativiFiscali');
				$writer->startElement('IdFiscaleIVA');
					$writer->writeElement('IdPaese', $AnagraficaCLIFAT['PIVANAZIONE']);
					$writer->writeElement('IdCodice', $AnagraficaCLIFAT['PIVA']);
				$writer->endElement();
			$writer->endElement();
			
			/* DatiFatturaBodyDTE  CICLO FATTURE */
			while (1 == 1){
			$AnagraficaID = $rsFatMov->fields['CT_ANGAZIENDE'];
			$ContabileID = $rsFatMov->fields['CG_CT_CONTABILE'];
			
			$writer->startElement('DatiFatturaBodyDTE');
				$writer->startElement('DatiGenerali');
					$writer->writeElement('TipoDocumento', $TipoDocumento);
					$writer->writeElement('Data', $rsFatMov->fields['DOCDATA']);
					$writer->writeElement('Numero', $rsFatMov->fields['DOCNUM']);
				$writer->endElement();
				
				while (1 == 1){
					$AnagraficaID = $rsFatMov->fields['CT_ANGAZIENDE'];
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
						$writer->writeElement('Natura', $rsFatMov->fields['CODICE']);
					$writer->endElement();
					$rsFatMov->MoveNext();
					if ( ($rsFatMov->fields['CT_ANGAZIENDE'] != $AnagraficaID ) || 
						 ($rsFatMov->fields['CG_CT_CONTABILE'] != $ContabileID )
						){
							break;
					}
				}
				
				$writer->endElement();
				$rsFatMov->MoveNext();
				if ( ($rsFatMov->fields['CT_ANGAZIENDE'] != $AnagraficaID ) || 
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
	
	
	$SdiProgressivo = str_pad($SdiProgressivo,5,'0',STR_PAD_LEFT);
	if ($FileName == '') $FileName = 'IT' . $AnagraficaAzienda['PIVA'] . '_DF_' . $SdiProgressivo . $Tipo . '.xml';
	file_put_contents($ExtJSDevExportRAW . 'sdi/' . $FileName, $writer->flush(true), LOCK_EX);
	
	return $ExtJSDevExportRAW . 'sdi/' . $FileName;
}

function SDIEncodeEsterometroRicevutiXML($DataIniziale, $Mesi = 1, $SdiProgressivo, $FileName = '') {
	global $conn;
	global $ExtJSDevExportRAW;
	global $output;
	
	$SdiProgressivo = str_pad($SdiProgressivo,5,'0',STR_PAD_LEFT);
	
	$AnagraficaAzienda = WFVALUEDLOOKUP('*','angaziende','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'));
	if ($AnagraficaAzienda == ''){
		$output['message'] = $output['message'] . 'Variabile global CG_ANAGRAFICAAZIENDA  non definito o azienda abbinata non esistente'.BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		return;
	}
	
	$AnagraficaDichiarante = WFVALUEDLOOKUP('*','angaziende','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICADICHIARANTE'));
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
				$writer->startElement('IdFiscaleIVA');
					$writer->writeElement('IdPaese', 'IT');
					$writer->writeElement('IdCodice', $AnagraficaAzienda['PIVA']);
				$writer->endElement();
				$writer->writeElement('CodiceFiscale', $AnagraficaAzienda['CF']);
			$writer->endElement();
			
			$writer->startElement('AltriDatiIdentificativi');
				$writer->writeElement('Denominazione', $AnagraficaAzienda['DESCRIZIONE']);
				$writer->startElement('Sede');
					$writer->writeElement('Indirizzo', $AnagraficaAzienda['INDIRIZZO']);
					if ($AnagraficaAzienda['NAZIONE'] == 'IT'){
						$writer->writeElement('CAP', $AnagraficaAzienda['CAP']); 
					}else{
						$writer->writeElement('CAP', '99999');
					}
					$writer->writeElement('Comune', $AnagraficaAzienda['CITTA']); 
					$writer->writeElement('Provincia', $AnagraficaAzienda['PROVINCIA']); 
					$writer->writeElement('Nazione', $AnagraficaAzienda['NAZIONE']); 
				$writer->endElement(); 
				$writer->startElement('RappresentanteFiscale');
					$writer->startElement('IdFiscaleIVA');
						$writer->writeElement('IdPaese', 'IT');
						$writer->writeElement('IdCodice', $AnagraficaAzienda['PIVA']);
					$writer->endElement();
					$writer->writeElement('Denominazione', $AnagraficaAzienda['DESCRIZIONE']);
				$writer->endElement(); 
			$writer->endElement();
		$writer->endElement(); 
		
		
		
		/* CessionarioCommittenteDTE CICLO FATTURE ANGAZIENDE */
		
		
	/* Enumera righe  */ 
	$StrSQL = "SELECT DISTINCT	
					cg_contabile.CT_ANGAZIENDE,
					cg_contabile.ANGAZIENDE_RAGSOCIALE, 
					cg_contabile.ANGAZIENDE_INDIRIZZO, cg_contabile.ANGAZIENDE_CITTA,cg_contabile.ANGAZIENDE_CAP,cg_contabile.ANGAZIENDE_PROVINCIA,
					cg_contabile.ANGAZIENDE_PIVA,cg_contabile.ANGAZIENDE_CF
				FROM cg_contabile
					INNER JOIN cg_contabileiva ON cg_contabileiva.CG_CT_CONTABILE = cg_contabile.ID
					INNER JOIN aliquote ON cg_contabileiva.CT_ALIQUOTE = aliquote.ID 
					INNER JOIN ANGAZIENDE ON cg_contabile.CT_ANGAZIENDE = ANGAZIENDE.ID
				WHERE cg_contabile.SEGNO = 1 
					AND aliquote.SPESOMETRO = 1 
					AND cg_contabile.DATAREG >= '" . $DataIniziale .  "'
					AND cg_contabile.DATAREG < DATE_ADD('" . $DataIniziale .  "', INTERVAL " . $Mesi . " MONTH) 
				ORDER BY cg_contabile.CT_ANGAZIENDE "; 
	$rsTESTE = $conn->Execute($StrSQL);
	$i = 1;
	while (!$rsTESTE->EOF) {
		
		$AnagraficaID = $rsTESTE->fields['CT_ANGAZIENDE'];
						 
		$AnagraficaCLIFAT = WFVALUEDLOOKUP('*','angaziende','ID = ' . $rsTESTE->fields['CT_ANGAZIENDE']);
		$writer->startElement('CedentePrestatoreDTR');
			$writer->startElement('IdentificativiFiscali');
				$writer->startElement('IdFiscaleIVA');
					$writer->writeElement('IdPaese', $AnagraficaCLIFAT['PIVANAZIONE']);
					$writer->writeElement('IdCodice', $AnagraficaCLIFAT['PIVA']);
				$writer->endElement();
			$writer->endElement();
			
			/* DatiFatturaBodyDTR  CICLO FATTURE */
			$StrSQL = "SELECT 
					cg_contabile.DATAREG,	
					cg_contabile.DOCDATA, cg_contabile.DOCNUM, 
					cg_contabileiva.CG_CT_CONTABILE, 
					cg_contabileiva.IMPONIBILE, cg_contabileiva.IMPOSTATOT
				FROM cg_contabile
					INNER JOIN cg_contabileiva ON cg_contabileiva.CG_CT_CONTABILE = cg_contabile.ID
					INNER JOIN aliquote ON cg_contabileiva.CT_ALIQUOTE = aliquote.ID 
					INNER JOIN ANGAZIENDE ON cg_contabile.CT_ANGAZIENDE = ANGAZIENDE.ID
				WHERE cg_contabile.SEGNO = 1 
					AND cg_contabile.CT_ANGAZIENDE = " . $AnagraficaID .  "
					AND aliquote.SPESOMETRO = 1 
					AND cg_contabile.DATAREG >= '" . $DataIniziale .  "'
					AND cg_contabile.DATAREG < DATE_ADD('" . $DataIniziale .  "', INTERVAL " . $Mesi . " MONTH) 
				ORDER BY cg_contabile.CT_ANGAZIENDE "; 
			$rsFatMov = $conn->Execute($StrSQL);
			$i = 1;
			while (!$rsFatMov->EOF) {
				$ContabileID = $rsFatMov->fields['CG_CT_CONTABILE'];
				
				$writer->startElement('DatiFatturaBodyDTR');
					$writer->startElement('DatiGenerali');
						$writer->writeElement('TipoDocumento', $TipoDocumento);
						$writer->writeElement('Data', $rsFatMov->fields['DOCDATA']);
						$writer->writeElement('Numero', $rsFatMov->fields['DOCNUM']);
						$writer->writeElement('DataRegistrazione', $rsFatMov->fields['DATAREG']);
					$writer->endElement();
					
				
				$StrSQL = "SELECT 
					cg_contabileiva.IMPONIBILE, cg_contabileiva.IMPOSTATOT,
					aliquote.VALORE, 
					aliquotenatura.CODICE
				FROM  cg_contabileiva 
					INNER JOIN aliquote ON cg_contabileiva.CT_ALIQUOTE = aliquote.ID
					LEFT JOIN aliquotenatura ON aliquote.CT_ALIQUOTENATURA = aliquotenatura.ID
				WHERE aliquote.SPESOMETRO = 1 
					AND cg_contabileiva.CG_CT_CONTABILE = " . $ContabileID ; 
				$rsFatMovIVA = $conn->Execute($StrSQL);
				while (!$rsFatMovIVA->EOF) {
					$ContabileID = $rsFatMovIVA->fields['CG_CT_CONTABILE'];
					//CICLO N IVE
					$writer->startElement('DatiRiepilogo');
						$writer->writeElement('ImponibileImporto', $rsFatMovIVA->fields['IMPONIBILE']);
						$writer->startElement('DatiIVA');
							if (IsNullOrEmptyOrZeroString($rsFatMovIVA->fields['CODICE'])){
								$writer->writeElement('Imposta', $rsFatMovIVA->fields['IMPOSTATOT']);
								$writer->writeElement('Aliquota', $rsFatMovIVA->fields['VALORE']);
							}else{
								$writer->writeElement('Imposta', '0.00');
								$writer->writeElement('Aliquota', '0.00');
							}
						$writer->endElement();
						$writer->writeElement('Natura', $rsFatMovIVA->fields['CODICE']);
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
	
	$SdiProgressivo = str_pad($SdiProgressivo,5,'0',STR_PAD_LEFT);
	if ($FileName == '') $FileName = 'IT' . $AnagraficaAzienda['PIVA'] . '_DF_' . $SdiProgressivo . $Tipo . '.xml';
	file_put_contents($ExtJSDevExportRAW . 'sdi/' . $FileName, $writer->flush(true), LOCK_EX);
	
	return $ExtJSDevExportRAW . 'sdi/' . $FileName;
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
	