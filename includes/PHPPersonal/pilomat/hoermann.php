<?php

function HMANDecodeOrdiniXML($FileName = '') {
	global $conn;
	global $ExtJSDevImportRAW;
	global $ExtJSDevTMP;
	
	$conn->StartTrans(); 
	$xml = simplexml_load_file($FileName);
	$OrdineHMAN = $xml->children()->Header->children()->Kopfdaten->children();
	
	//TESTATA
	$ClienteObj = $OrdineHMAN->{'Kunde'};
	
	$ClienteNome = $ClienteObj->{'Name-1'};
	
	$AnagraficaCLIFO = WFVALUEDLOOKUP('*', 'anagrafiche', "DESCRIZIONE = '" . $ClienteNome. "'");

	if ($AnagraficaCLIFO == '') {
		//INSERT
		$AppoRecord = array();
		$AppoRecord['DESCRIZIONE'] = $ClienteNome;
		$AppoRecord['INDIRIZZO'] = $ClienteObj->{'Strasse-Postfach'};
		$AppoRecord['CAP'] = $ClienteObj->{'Postleitzahl'};
		$AppoRecord['CITTA'] = $ClienteObj->{'Ort'};
		$AppoRecord['PROVINCIA'] = ''; 
		$AppoRecord['NAZIONE'] =$ClienteObj->{'Land'};
		$AppoRecord['CF'] = ''; 
		$AppoRecord['PIVA'] = '';

		$conn->AutoExecute('anagrafiche', $AppoRecord, 'INSERT');
		$AnagraficaCLIFO = WFVALUEDLOOKUP('*', 'anagrafiche', "ID = "  . $conn->Insert_ID());
	}
	
	$AppoOrdine = array();
	
	$AppoOrdine['DOCDATA'] = WFVALUEDATELOCAL($OrdineHMAN->{'Vorgangsdatum'});
	$AppoOrdine['DOCRIF'] = $OrdineHMAN->{'NL-Vorgangsnummer'};
	$AppoOrdine['VALORETOTALE'] = $OrdineHMAN->{'Vorgangswert'};
	
	$AppoOrdine['CT_FATTURAZIONE'] = 8141;
	$AppoOrdine['CT_SPEDIZIONE'] = $AnagraficaCLIFO['ID'];
	
	$AppoOrdine['IBAN'] = $AnagraficaCLIFO['IBAN'];
	$AppoOrdine['CT_BANCA'] = $AnagraficaCLIFO['CT_BANCA'];
	$AppoOrdine['CT_PAGAMENTI'] = $AnagraficaCLIFO['CT_PAGAMENTI'];
	
	$AppoOrdine['CG_CT_CONTABILEESERCIZI'] = WFVALUEDLOOKUP('ID', 'cg_contabileesercizi', 
															   "DATAFINE >= " . WFSQLTODATE($AppoOrdine['DOCDATA']) . " AND DATAINIZIO <= " . WFSQLTODATE($AppoOrdine['DOCDATA']));
	
	$AppoOrdine['CT_CAUSALI'] = 1;
	$Causale = WFVALUEDLOOKUP('*','causali','ID = ' . $AppoOrdine['CT_CAUSALI'] );
	$AppoOrdine['SEGNO'] = $Causale['SEGNO'];
	$AppoOrdine['CT_SEZIONALI'] = $Causale['CT_SEZIONALI'];
	$AppoOrdine['CT_MAGAZZINI'] = 1;

	
	$AppoOrdine['CT_OPERATORE'] = 1;
	
	$ValAppo = WFGETSEQUENCE('ord', $AppoOrdine);
	$AppoOrdine['DOCNUM'] = $ValAppo;
	
	$conn->AutoExecute("ord", $AppoOrdine, 'INSERT');

	$OrdID = $conn->Insert_ID();
	$sql = "UPDATE ord SET DOCBARCODE = '" . WFVALUEDOCIDEAN('ord', $OrdID ) . "' WHERE ID = " .  $OrdID;
	$conn->Execute($sql);
	
	
	
	
	
	/***************************/
	/* 			RIGHE		  */
	/***************************/

	foreach ($OrdineHMAN as $DettaglioLineaObj){
		$rigaOrdine = $DettaglioLineaObj->children();
		if (property_exists($rigaOrdine, 'Pos-Nr')){
			
			$AppoOrdMovimenti = array();
			$AppoOrdMovimenti['CT_ORD'] = $OrdID;
			
			$AppoOrdMovimenti['RIGA'] = WFFORMAT(Cint($rigaOrdine->{'Pos-Nr'}), 3,  '0',STR_PAD_LEFT) . '.' .
										WFFORMAT(Cint($rigaOrdine->{'Sub-Pos-Nr'}), 4,  '0',STR_PAD_LEFT) ;
			/* ARTICOLO */
			$Articolo = '';
			$CodiceArticolo = $rigaOrdine->{'Artikel-Nr'};
			$ArticoloDescrizione = $articoli['DESCRIZIONEEN'];
			$Larghezza = $rigaOrdine->{'Breite'};
            $Altezza = $rigaOrdine->{'Hoehe'};
			$ArticoloListino = WFVALUEDLOOKUP('*','articolilistini',"CT_LISTINI = 2 " .
																	" AND CODICEALTERNATIVO = '" . $CodiceArticolo->CodiceValore->__toString() . "'");
			if ($ArticoloListino == ''){
				$Articolo = WFVALUEDLOOKUP('*','articoli',"CODICE = '" . $CodiceArticolo . "'");
				if ($ArticoloListino != ''){
					$AppoOrdMovimenti['CT_ARTICOLI'] = $Articolo['ID'];
				}else{
					$Articolo = WFVALUEDLOOKUP('*','articoli',"ID = " . WFVALUEGLOBAL('CG_ARTICOLODESCRITTIVO'));
					$AppoOrdMovimenti['CT_ARTICOLI'] = $Articolo['ID'];
				}
			}else{
				$Articolo = WFVALUEDLOOKUP('*','articoli',"ID = " . $ArticoloListino['CT_ARTICOLI']);
				$AppoOrdMovimenti['CT_ARTICOLI'] = $Articolo['ID'];
			}
			
			$AppoOrdMovimenti['CODICE'] = $CodiceArticolo;
			$AppoOrdMovimenti['DESCRIZIONE'] = $ArticoloDescrizione;
			
			/* QTA */
			$AppoOrdMovimenti['QTA'] = $rigaOrdine->{'Menge'};
			$AppoOrdMovimenti['QTARIGA'] = $rigaOrdine->{'Menge'};
			$AppoOrdMovimenti['QTAUM'] = $Articolo['UM0'];
			
			/* IVA */
			$Aliquota = WFVALUEDLOOKUP('*','aliquote','ID = ' . $Articolo['CT_ALIQUOTE']);
			$AppoOrdMovimenti['CT_ALIQUOTE'] = $Aliquota['ID'];

			/* PREZZO */
			$AppoOrdMovimenti['VALORELISTINO'] = $ArticoloListino['LISTINOVENDITA'];
			$AppoOrdMovimenti['VALORERIGA'] = 0;
			$AppoOrdMovimenti['SCONTOMAGEUR'] = 0;
			$AppoOrdMovimenti['SCONTOMAG0'] = 0;
			$AppoOrdMovimenti['SCONTOMAG1'] = 0;
			$AppoOrdMovimenti['SCONTOMAG2'] = 0;
			$AppoOrdMovimenti['SCONTOMAG3'] = 0;
			
			if ($ArticoloListino['VALORE'] != ''){
			$AppoOrdMovimenti['VALORELISTINO'] =  $ArticoloListino['VALORE'];
			
			if ($ArticoloListino['SCONTOMAG0'] != ''){
				$AppoOrdMovimenti['SCONTOMAG0'] = $ArticoloListino['SCONTOMAG0'];
				$AppoOrdMovimenti['SCONTOMAG0'] = $AppoOrdMovimenti['SCONTOMAG0'];
			}
			if ($ArticoloListino['SCONTOMAG1'] != ''){
				$AppoOrdMovimenti['SCONTOMAG1'] = $ArticoloListino['SCONTOMAG1'];
				$AppoOrdMovimenti['SCONTOMAG1'] = $AppoOrdMovimenti['SCONTOMAG1'];
			}
			if ($ArticoloListino['SCONTOMAG2'] != ''){
				$AppoOrdMovimenti['SCONTOMAG2'] = $ArticoloListino['SCONTOMAG2'];
				$AppoOrdMovimenti['SCONTOMAG2'] = $AppoOrdMovimenti['SCONTOMAG2'];
			}
			$CalValoreRiga = ($AppoOrdMovimenti['VALORELISTINO']  * ( 1 + $AppoOrdMovimenti['SCONTOMAG0'] / 100 ) 
																* ( 1 + $AppoOrdMovimenti['SCONTOMAG1']  / 100 )
																* ( 1 + $AppoOrdMovimenti['SCONTOMAG2']  / 100 )
																* ( 1 + $AppoOrdMovimenti['SCONTOMAG3']  / 100 )
								)	+ $AppoOrdMovimenti['SCONTOMAGEUR'] ;
					 
			$AppoOrdMovimenti['VALORERIGA'] = $CalValoreRiga;  
			$AppoOrdMovimenti['VALORERIGAINVALUTA'] = $AppoOrdMovimenti['VALORERIGA'];
			$AppoOrdMovimenti['VALORERIGAIVA'] = round(($AppoOrdMovimenti['VALORERIGA'] / 100) * $Aliquota['VALORE'], 2);
			$AppoOrdMovimenti['VALORERIGATOT'] = $AppoOrdMovimenti['VALORERIGA'] * $AppoOrdMovimenti['QTARIGA'];
			
			//$AppoOrdMovimenti['NOTERIGA'] = $rigaOrdine->{'Pos-Texte'}->{'Pos-Text'};	
			$conn->AutoExecute("ordmovimenti", $AppoOrdMovimenti, 'INSERT');
		}
		}
	}
	
	if ($conn->HasFailedTrans()) {
		$output['message'] = 'Fattura Errore ' . $AppoOrdine['DOCNUM'];
		$output['failure'] = true;
		$output['succcess'] = false;
		$conn->completeTrans(); 
		return null;
	}else{
		$output['message'] = 'Fattura Registrata ' . $AppoOrdine['DOCNUM'];
		$output['failure'] = false;
		$output['succcess'] = true;
		$conn->completeTrans(); 
		return $OrdID;
	}
}