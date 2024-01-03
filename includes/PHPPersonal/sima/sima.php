<?php		
function SIMAEncodeDDTEmessiXML($DdtID) {
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
	
	$Ddt = WFVALUEDLOOKUP('*','ddt','ID = ' . $DdtID);
	$Preavviso = 'N';
	
	$writer = new XMLWriter();  
	$writer->openMemory();
	$writer->startDocument('1.0','UTF-8');  
	$writer->setIndent(4); 
			
	/* START ALL*/
	$writer->startElement('ns2:DatiFattura'); 
	$writer->writeAttribute('version','1.0'); 
		
		/***********************************************************************************/
		/* 1 Spedizioni */ {
		$writer->startElement('Spedizioni');
			$writer->writeElement('Versione', '11');
			/* Viaggio */ {
			$writer->startElement('Viaggio');
				$writer->writeAttribute('Riferimento',$Ddt['ID']);
				$writer->writeAttribute('Descrizione','');
				$writer->writeAttribute('VettoreCodice','');
				$writer->writeAttribute('CorrispondenteCodice','');
				$writer->writeAttribute('TargaAutomezzo','');
				$writer->writeAttribute('TargaRimorchio','');
				$writer->writeAttribute('Autista','');
				$writer->writeAttribute('DataPartenzaPrevista','');
				$writer->writeAttribute('DataPartenzaReale','');
				$writer->writeAttribute('DataArrivoPrevista','');
				$writer->writeAttribute('Km','');
				$writer->writeAttribute('Note','');
			$writer->endElement();	
			}
			
			/* Spedizione n volte */ {
			$writer->startElement('Spedizione');
				/* Codice */ {
				$writer->startElement('Codice');
					$writer->writeAttribute('Anno','');
					$writer->writeAttribute('Filiale','');
					$writer->writeAttribute('Numero','');
					$writer->writeAttribute('Identificativo',$Ddt['ID']);
					$writer->writeAttribute('SenderId','');
					$writer->writeAttribute('ReceiverId','');
					$writer->writeAttribute('IdEsterno','');
				$writer->endElement();	
				}
				
				/* Riferimenti */ {
				$writer->startElement('Riferimenti');
					$writer->writeAttribute('Ordine','');
					$writer->writeAttribute('Interno','');
					$writer->writeAttribute('Committente','');
					$writer->writeAttribute('Mittente','');
					$writer->writeAttribute('Destinatario','');
					$writer->writeAttribute('InternoExtra','');
				$writer->endElement();	
				}
			
				$writer->writeAttribute('Azione','');
				$writer->writeAttribute('Committente','');
				$writer->writeAttribute('Via','');
				$writer->writeAttribute('TipoServizio','');
				$writer->writeAttribute('TipoServizioConsegna','');
				$writer->writeAttribute('TipoTrasporto','');
				$writer->writeAttribute('Resa','');
				$writer->writeAttribute('Linea','');
				$writer->writeAttribute('PostiPallet','');
				$writer->writeAttribute('Priorita','');
				$writer->writeAttribute('CreaRitiro','');
				
				/* Arrivo */ {
				$writer->startElement('Arrivo');
					$writer->writeAttribute('Tipo','');  //Codice fisso: SV, RS, DC, DI, CC, CM, RM, RC, RD
					$writer->writeAttribute('SGA','');
					$writer->writeAttribute('Data','');
					$writer->writeAttribute('Deposito','');
					$writer->writeAttribute('Corrispondente','');
					$writer->writeAttribute('Ritiro','');
					$writer->writeAttribute('RitiroRifEsterno','');
				$writer->endElement();
				}
				
				/* Consegna */ {
				$writer->startElement('Consegna');
					$writer->writeAttribute('Tipo',''); //Codice fisso: SV, DC, RM, DI, DP, CD, CO, AC, DD, DE
					$writer->writeAttribute('SGA','');
					$writer->writeAttribute('Deposito','');
					$writer->writeAttribute('Corrispondente','');
					$writer->writeAttribute('Preavviso',$Preavviso);  //S o N 
					$writer->writeAttribute('InLinea','');
					$writer->writeAttribute('ConsegnaRifEsterno','');
				$writer->endElement();
				}
				
				/* Mittente */ {
				$writer->startElement('Mittente');
					$writer->writeAttribute('Codice','');
					$writer->writeAttribute('CodiceInterno',$Supplier['ID']);
					$writer->writeAttribute('RagioneSociale',$Supplier['DESCRIZIONE']);
					$writer->writeAttribute('Indirizzo',$Supplier['INDIRIZZO']);
					$writer->writeAttribute('Cap',$Supplier['CAP']);
					$writer->writeAttribute('Localita',$Supplier['CITTA']);
					$writer->writeAttribute('Provincia',$Supplier['PROVINCIA']);
					$writer->writeAttribute('Nazione',$Supplier['NAZIONE']);
					$writer->writeAttribute('Interlocutore',$Supplier['CONTATTO']);
					$writer->writeAttribute('Telefono',$Supplier['TELEFONO']);
					$writer->writeAttribute('Email',$Supplier['EMAIL']);
					$writer->writeAttribute('PartitaIva',$Supplier['PIVA']);
				$writer->endElement();
				}
				
				/* Provenienza */ {
				$writer->startElement('Provenienza');
					$writer->writeAttribute('Codice','');
					$writer->writeAttribute('CodiceInterno',$Supplier['ID']);
					$writer->writeAttribute('RagioneSociale','');
					$writer->writeAttribute('Indirizzo','');
					$writer->writeAttribute('Cap','');
					$writer->writeAttribute('Localita','');
					$writer->writeAttribute('Provincia','');
					$writer->writeAttribute('Nazione','');
					$writer->writeAttribute('Interlocutore','');
					$writer->writeAttribute('Telefono','');
					$writer->writeAttribute('Email','');
					$writer->writeAttribute('PartitaIva','');
				$writer->endElement();
				}
			
				/* Destinatario */ {
				$writer->startElement('Destinatario');
					$writer->writeAttribute('Codice','');
					$writer->writeAttribute('CodiceInterno','');
					$writer->writeAttribute('RagioneSociale','');
					$writer->writeAttribute('Indirizzo','');
					$writer->writeAttribute('Cap','');
					$writer->writeAttribute('Localita','');
					$writer->writeAttribute('Provincia','');
					$writer->writeAttribute('Nazione','');
					$writer->writeAttribute('Interlocutore','');
					$writer->writeAttribute('Telefono','');
					$writer->writeAttribute('Email','');
					$writer->writeAttribute('PartitaIva','');
				$writer->endElement();
				}
				
				/* Destinazione */ {
				$writer->startElement('Destinazione');
					$writer->writeAttribute('Codice','');
					$writer->writeAttribute('CodiceInterno','');
					$writer->writeAttribute('RagioneSociale','');
					$writer->writeAttribute('Indirizzo','');
					$writer->writeAttribute('Cap','');
					$writer->writeAttribute('Localita','');
					$writer->writeAttribute('Provincia','');
					$writer->writeAttribute('Nazione','');
					$writer->writeAttribute('Interlocutore','');
					$writer->writeAttribute('Telefono','');
					$writer->writeAttribute('Email','');
					$writer->writeAttribute('PartitaIva','');
				$writer->endElement();
				}
				
				/* Circuito */ {
				$writer->startElement('Circuito');
					$writer->writeAttribute('Tipologia','');
					$writer->writeAttribute('Attivita','');
					$writer->writeAttribute('TipoServizio','');
					/* PaletteCircuito  n volte */ {
					$writer->startElement('PaletteCircuito');
						/* PalettaCircuito */ {
						$writer->startElement('PalettaCircuito');
							$writer->writeAttribute('NumeroPaletta','');
							$writer->writeAttribute('Lunghezza','');
							$writer->writeAttribute('Larghezza','');
							$writer->writeAttribute('Altezza','');
							$writer->writeAttribute('Peso','');
							$writer->writeAttribute('TipoPalettaCircuito','');
							/* ImballiInterni */ {
							$writer->startElement('ImballiInterni');
								/* ImballiInterni n volte */ {
								$writer->startElement('ImballiInterni');
									$writer->writeAttribute('Lunghezza','');
									$writer->writeAttribute('Larghezza','');
									$writer->writeAttribute('Altezza','');
									$writer->writeAttribute('Peso','');
									$writer->writeAttribute('TipoImballo','');
								$writer->endElement();
								}
							$writer->endElement();
							}
							/* PaletteInterne */ {
							$writer->startElement('PaletteInterne');
								/* PalettaInterna n volte */ {
								$writer->startElement('PalettaInterna');
									$writer->writeAttribute('Lunghezza','');
									$writer->writeAttribute('Larghezza','');
									$writer->writeAttribute('Altezza','');
									$writer->writeAttribute('Peso','');
									$writer->writeAttribute('TipoImballo','');
								$writer->endElement();
								}
							$writer->endElement();
							}
						$writer->endElement();
						}
					$writer->endElement();
					}
				$writer->endElement();
				}
				
				/* Merce */ {
				$writer->startElement('Merce');
					$writer->writeAttribute('Codice','');
					$writer->writeAttribute('Descrizione','');
					/* ADR */ {
					$writer->startElement('ADR');
						/* Merce */ {
						$writer->startElement('Merce');
							/* Identificativo */ {
							$writer->startElement('Identificativo');
								$writer->writeAttribute('CodiceOnu','');
								$writer->writeAttribute('Descrizione','');
								$writer->writeAttribute('ClassePericolo','');
								$writer->writeAttribute('Classificazione','');
								$writer->writeAttribute('GruppoImballaggio','');
								$writer->writeAttribute('QuantitaLimitata','');
								$writer->writeAttribute('CategoriaTrasporto','');
								$writer->writeAttribute('RestrizioniGalleria','');
							$writer->endElement();
							}
							$writer->writeAttribute('TipoImballoDescrizione','');
							$writer->writeAttribute('UnitaMisura','');
							$writer->writeAttribute('Quantita','');
							$writer->writeAttribute('QuantitaImballi','');
							$writer->writeAttribute('PesoNetto','');
							$writer->writeAttribute('DenominazioneTecnica','');
						$writer->endElement();
						}
					$writer->endElement();	
					}
				$writer->endElement();
				}
				
				/* Dogana */ {
				$writer->startElement('Dogana');
					$writer->writeAttribute('VoceDoganale','');
				$writer->endElement();
				}
				
				/* ValoriQuantitativi */ {
				$writer->startElement('ValoriQuantitativi');
					$writer->writeAttribute('Imballi','');
					$writer->writeAttribute('Palette','');
					$writer->writeAttribute('PesoLordo','');
					$writer->writeAttribute('PesoNetto','');
					$writer->writeAttribute('Volume','');
					$writer->writeAttribute('MetriLineari','');
					/* Um1 */ {
					$writer->startElement('Um1');
						$writer->writeAttribute('Codice','');
						$writer->writeAttribute('Quantita','');
					$writer->endElement();
					}
					/* Um2 */ {
					$writer->startElement('Um2');
						$writer->writeAttribute('Codice','');
						$writer->writeAttribute('Quantita','');
					$writer->endElement();
					}
				$writer->endElement();
				}
				
				/* Caratteristiche */ {
				$writer->startElement('Caratteristiche');
					/* Caratteristica  n volte*/ {
					$writer->writeAttribute('Caratteristica','');
						$writer->writeAttribute('Codice','');
						$writer->writeAttribute('Quantita','');
						$writer->writeAttribute('Note','');
					$writer->endElement();
					}
				
				$writer->endElement();
				}
				
				/* DataRitiro */ {
				$writer->startElement('DataRitiro');
					$writer->writeAttribute('Tipo','');
					$writer->writeAttribute('Data','');
					$writer->writeAttribute('OraInizio','');
					$writer->writeAttribute('OraFine','');
				$writer->endElement();
				}
				
				/* DataConsegna */ {
				$writer->startElement('DataConsegna');
					$writer->writeAttribute('Tipo','');
					$writer->writeAttribute('Data','');
					$writer->writeAttribute('OraInizio','');
					$writer->writeAttribute('OraFine','');
				$writer->endElement();
				}
				
				$writer->writeAttribute('TipoVeicolo','');
				
				/* AddebitiAttivi */ {
				$writer->startElement('AddebitiAttivi');
					/* Addebito n volte */ {
					$writer->startElement('Addebito');
						$writer->writeAttribute('TipoAddebito','');
						$writer->writeAttribute('Cliente','');
						$writer->writeAttribute('Voce','');
						$writer->writeAttribute('Valuta','');
						$writer->writeAttribute('UnitaMisura','');
						$writer->writeAttribute('Quantita','');
						$writer->writeAttribute('ImportoUnitario','');
					$writer->endElement();
					}
				$writer->endElement();
				}
				
				/* AddebitiPassivi */ {
				$writer->startElement('AddebitiPassivi');
					/* Addebito n volte */ {
					$writer->startElement('Addebito');
						$writer->writeAttribute('TipoAddebito','');
						$writer->writeAttribute('Fornitore','');
						$writer->writeAttribute('Voce','');
						$writer->writeAttribute('Valuta','');
						$writer->writeAttribute('UnitaMisura','');
						$writer->writeAttribute('Quantita','');
						$writer->writeAttribute('ImportoUnitario','');
					$writer->endElement();
					}
				$writer->endElement();
				}
				
				/* Ddt */ {
				$writer->startElement('Ddt');
					$writer->writeAttribute('Data','');
					$writer->writeAttribute('Numero','');
				$writer->endElement();
				}
				
				/* Documenti */ {
				$writer->startElement('Documenti');
					/* Documento n volte */ {
					$writer->startElement('Documento');
						$writer->writeAttribute('TipoDocumento','');
						$writer->writeAttribute('Numero','');
						$writer->writeAttribute('Riferimento','');
						$writer->writeAttribute('Data','');
						$writer->writeAttribute('Importo','');
						$writer->writeAttribute('Valuta','');
						$writer->writeAttribute('Imballi','');
						$writer->writeAttribute('Palette','');
						$writer->writeAttribute('PesoLordo','');
						$writer->writeAttribute('PesoNetto','');
						$writer->writeAttribute('PesoTassabile','');
						$writer->writeAttribute('Volume','');
					$writer->endElement();
					}
				$writer->endElement();
				}
				
				/* ValoreMerce */ {
				$writer->startElement('ValoreMerce');
					$writer->writeAttribute('Valuta','');
					$writer->writeAttribute('Importo','');
				$writer->endElement();
				}
				
				/* ImportoAssicurato */ {
				$writer->startElement('ImportoAssicurato');
					$writer->writeAttribute('Valuta','');
					$writer->writeAttribute('Importo','');
				$writer->endElement();
				}
				
				/* Contrassegno */ {
				$writer->startElement('Contrassegno');
					$writer->writeAttribute('Valuta','');
					$writer->writeAttribute('Importo','');
					$writer->writeAttribute('TipoIncasso','');
				$writer->endElement();
				}
				
				/* Vincoli */ {
				$writer->startElement('Vincoli');
					$writer->writeAttribute('Vincolo','');
				$writer->endElement();
				}
				
				/* Imballi */ {
				$writer->startElement('Imballi');
					/* Imballo */ {
					$writer->startElement('Imballo');
						$writer->writeAttribute('Codice','');
						$writer->writeAttribute('Descrizione','');
						$writer->writeAttribute('Quantita','');
						$writer->writeAttribute('Lunghezza','');
						$writer->writeAttribute('Larghezza','');
						$writer->writeAttribute('Altezza','');
						$writer->writeAttribute('Peso','');
						$writer->writeAttribute('Volume','');
					$writer->endElement();
					}
				$writer->endElement();
				}
				
				/* Barcodes */ {
				$writer->startElement('Barcodes');
					/* Barcode n volte */ {
					$writer->startElement('Barcode');
						$writer->writeAttribute('Entrata','');
						$writer->writeAttribute('Uscita','');
					$writer->endElement();
					}
				$writer->endElement();
				}
				
				/* Articoli */ {
				$writer->startElement('Articoli');
					/* Articolo n volte*/ {
					$writer->startElement('Articolo');
						$writer->writeAttribute('Codice','');
						$writer->writeAttribute('Descrizione','');
						$writer->writeAttribute('UnitaMisura','');
						$writer->writeAttribute('Quantita','');
						$writer->writeAttribute('IdRiga','');
						$writer->endElement();
					}
				$writer->endElement();
				}
				
				/* ImballaggiSupporti */ {
				$writer->startElement('ImballaggiSupporti');
					/* ImballaggioSupporto n volte*/ {
					$writer->startElement('ImballaggioSupporto');
						$writer->writeAttribute('Categoria','');
						$writer->writeAttribute('Tipologia','');
						$writer->writeAttribute('Quantita','');
						$writer->endElement();
					}
				$writer->endElement();
				}
				
				/* Proprieta */ {
				$writer->startElement('Proprieta');
					/* Proprieta n volte*/ {
					$writer->startElement('Proprieta');
						$writer->writeAttribute('Valore','');
						$writer->writeAttribute('Descrizione','');
						$writer->endElement();
					}
				$writer->endElement();
				}
				
				/* Nota */ {
				$writer->startElement('Nota');
					/* Nota n volte*/ {
					$writer->startElement('Nota');
						$writer->writeAttribute('Tipologia','');
						$writer->writeAttribute('Testo','');
						$writer->endElement();
					}
				$writer->endElement();
				}
				
			$writer->endElement();	
			}
			
		$writer->endElement();	
		}
			
			
			
			
			
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
