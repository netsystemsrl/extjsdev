<?php
	require_once ($_SERVER['DOCUMENT_ROOT'].'/includes/var.php');
	WFSetDebug(false);
	$output = array();
	$output["metaData"]["idProperty"] = "ID";
	$output["metaData"]["totalProperty"] = "total";
	$output["metaData"]["successProperty"] = "success";
	$output["metaData"]["rootProperty"] = "data";
	$output["metaData"]["root"]="data";
	$output["message"] = "";
	$output["messagedebug"] = "";
	$debugmessage = 0;
	$readeddataArray = array();

	$AnagraficaAziendaID = WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA');
	$CausaleAutoProduzione = WFVALUEDLOOKUP('*','causali','ID = ' . WFVALUEGLOBAL('MRP_CAUSALEAUTOPRODUZIONE'));
	$CausalePrenotazione = WFVALUEDLOOKUP('*','causali','ID = ' . WFVALUEGLOBAL('MRP_CAUSALEPRENOTAZIONE'));
	$CausaleVendita = WFVALUEDLOOKUP('*','causali','ID = ' . 1);
	$recordEsercizio  = WFVALUEDLOOKUP('*', 'cg_contabileesercizi', "DATAFINE >= " . WFSQLTODATE(WFVALUENOW('Y-m-d') ) . " AND DATAINIZIO <= " . WFSQLTODATE(WFVALUENOW('Y-m-d') ) );
	$MagazzinoID  = WFVALUEGLOBAL('MAGAZZINO');

	$cnVMT = ADONewConnection('mssqlnative');
	$cnVMT->debug=$conn->debug;
	$cnVMT->SetFetchMode(ADODB_FETCH_ASSOC);
	$cnVMT->setConnectionParameter('characterSet','UTF-8');
	$cnVMT->connect('172.16.10.5','View','ExternalVIEW','SDS31_DB');


	$sqlSegmenti = "SELECT * 
					FROM wms_udc
					WHERE 	LEFT(SSCC,1) = 'S' 
						AND DATA  > '2021-01-01'
						AND ( EANUDC IS NULL)";
	/*
	$sqlSegmenti = "SELECT * 
					FROM wms_udc
					WHERE 	LEFT(EANUDC,1) = 'S' 
						AND DATA  > '2021-05-01'
						AND LENGTH(EANUDC) = 9";
						*/
						
	$rsSegmenti = $conn->Execute($sqlSegmenti);
	while (!$rsSegmenti->EOF) {	
		// if ($rsSegmenti->fields['EANUDC'] 
		//S31217347
		$sqlSegmentiVMT = "SELECT * 
						FROM [SDS31_DB].[View].[CustomExport01] 
						WHERE BARCODE = '" . $rsSegmenti->fields['EANUDC'] . "'";
		try{
			$rsSegmentiVMT = $cnVMT->Execute($sqlSegmentiVMT);
		} catch (exception $e){
				echo('ERR' . $wms_udc['ID'] . BRCRLF);
		}
		if ($rsSegmentiVMT){
			if ($rsSegmentiVMT->RecordCount()==1)  {
				echo('CodiceEAN' . $rsSegmenti->fields['EANUDC'] . BRCRLF);
				$ConcioProgressivo = $rsSegmentiVMT->fields['SEGMENT']; //PEZZO PROGRESSIVO    $rfid
				$ConcioArticoloCodice = $rsSegmentiVMT->fields['SEGMENT_TYPE']; //PEZZO ARTICOLO
				$ConcioArticolo = WFVALUEDLOOKUP('*','articoli',"CODICE = '" . $ConcioArticoloCodice . "'");
				
				$ConcioDataOraStart = $rsSegmentiVMT->fields['MOULDED_DATE']; //PEZZO INIZIO
				$ConcioDataOraEnd = $rsSegmentiVMT->fields['FINISHED_DATE']; //PEZZO FINE
				
				$ConcioDDTDocData= $rsSegmentiVMT->fields['DELIVERED_DATE']; //DDT DATA
				$ConcioDDTDocNum = $rsSegmentiVMT->fields['DELIVERY_NOTE']; //DDT NUM
				$ConcioDDTNote = $rsSegmentiVMT->fields['NOTE_COMMENT']; //DDT DESCRIZIONE
	  
				$ConcioStampoCodice = $rsSegmentiVMT->fields['MOU_NAME']; //PEZZO STAMPO
				if( $ConcioStampoCodice =='GL-A1' ) $ConcioStampoCodice = 'GL-A01';
				if( $ConcioStampoCodice =='GL-A2' ) $ConcioStampoCodice = 'GL-A02';
				if( $ConcioStampoCodice =='GL-A3' ) $ConcioStampoCodice = 'GL-A03';
				if( $ConcioStampoCodice =='GL-A4' ) $ConcioStampoCodice = 'GL-A04';
				if( $ConcioStampoCodice =='GL-A5' ) $ConcioStampoCodice = 'GL-A05';
				if( $ConcioStampoCodice =='GL-A6' ) $ConcioStampoCodice = 'GL-A06';
				if( $ConcioStampoCodice =='GL-A7' ) $ConcioStampoCodice = 'GL-A07';
				if( $ConcioStampoCodice =='GL-A8' ) $ConcioStampoCodice = 'GL-A08';
				if( $ConcioStampoCodice =='GL-A9' ) $ConcioStampoCodice = 'GL-A09';
				
				if( $ConcioStampoCodice =='GL-B1' ) $ConcioStampoCodice = 'GL-B01';
				if( $ConcioStampoCodice =='GL-B2' ) $ConcioStampoCodice = 'GL-B02';
				if( $ConcioStampoCodice =='GL-B3' ) $ConcioStampoCodice = 'GL-B03';
				if( $ConcioStampoCodice =='GL-B4' ) $ConcioStampoCodice = 'GL-B04';
				if( $ConcioStampoCodice =='GL-B5' ) $ConcioStampoCodice = 'GL-B05';
				if( $ConcioStampoCodice =='GL-B6' ) $ConcioStampoCodice = 'GL-B06';
				if( $ConcioStampoCodice =='GL-B7' ) $ConcioStampoCodice = 'GL-B07';
				if( $ConcioStampoCodice =='GL-B8' ) $ConcioStampoCodice = 'GL-B08';
				if( $ConcioStampoCodice =='GL-B9' ) $ConcioStampoCodice = 'GL-B09';
				
				if( $ConcioStampoCodice =='GL-C1' ) $ConcioStampoCodice = 'GL-C01';
				if( $ConcioStampoCodice =='GL-C2' ) $ConcioStampoCodice = 'GL-C02';
				if( $ConcioStampoCodice =='GL-C3' ) $ConcioStampoCodice = 'GL-C03';
				if( $ConcioStampoCodice =='GL-C4' ) $ConcioStampoCodice = 'GL-C04';
				if( $ConcioStampoCodice =='GL-C5' ) $ConcioStampoCodice = 'GL-C05';
				if( $ConcioStampoCodice =='GL-C6' ) $ConcioStampoCodice = 'GL-C06';
				if( $ConcioStampoCodice =='GL-C7' ) $ConcioStampoCodice = 'GL-C07';
				if( $ConcioStampoCodice =='GL-C8' ) $ConcioStampoCodice = 'GL-C08';
				if( $ConcioStampoCodice =='GL-C9' ) $ConcioStampoCodice = 'GL-C09';
				
				if( $ConcioStampoCodice =='GL-D1' ) $ConcioStampoCodice = 'GL-D01';
				if( $ConcioStampoCodice =='GL-D2' ) $ConcioStampoCodice = 'GL-D02';
				if( $ConcioStampoCodice =='GL-D3' ) $ConcioStampoCodice = 'GL-D03';
				if( $ConcioStampoCodice =='GL-D4' ) $ConcioStampoCodice = 'GL-D04';
				if( $ConcioStampoCodice =='GL-D5' ) $ConcioStampoCodice = 'GL-D05';
				if( $ConcioStampoCodice =='GL-D6' ) $ConcioStampoCodice = 'GL-D06';
				if( $ConcioStampoCodice =='GL-D7' ) $ConcioStampoCodice = 'GL-D07';
				if( $ConcioStampoCodice =='GL-D8' ) $ConcioStampoCodice = 'GL-D08';
				if( $ConcioStampoCodice =='GL-D9' ) $ConcioStampoCodice = 'GL-D09';
				
				if( $ConcioStampoCodice =='GL-E1' ) $ConcioStampoCodice = 'GL-E01';
				if( $ConcioStampoCodice =='GL-E2' ) $ConcioStampoCodice = 'GL-E02';
				if( $ConcioStampoCodice =='GL-E3' ) $ConcioStampoCodice = 'GL-E03';
				if( $ConcioStampoCodice =='GL-E4' ) $ConcioStampoCodice = 'GL-E04';
				if( $ConcioStampoCodice =='GL-E5' ) $ConcioStampoCodice = 'GL-E05';
				if( $ConcioStampoCodice =='GL-E6' ) $ConcioStampoCodice = 'GL-E06';
				if( $ConcioStampoCodice =='GL-E7' ) $ConcioStampoCodice = 'GL-E07';
				if( $ConcioStampoCodice =='GL-E8' ) $ConcioStampoCodice = 'GL-E08';
				if( $ConcioStampoCodice =='GL-E9' ) $ConcioStampoCodice = 'GL-E09';
				
				if( $ConcioStampoCodice =='GL-F1' ) $ConcioStampoCodice = 'GL-F01';
				if( $ConcioStampoCodice =='GL-F2' ) $ConcioStampoCodice = 'GL-F02';
				if( $ConcioStampoCodice =='GL-F3' ) $ConcioStampoCodice = 'GL-F03';
				if( $ConcioStampoCodice =='GL-F4' ) $ConcioStampoCodice = 'GL-F04';
				if( $ConcioStampoCodice =='GL-F5' ) $ConcioStampoCodice = 'GL-F05';
				if( $ConcioStampoCodice =='GL-F6' ) $ConcioStampoCodice = 'GL-F06';
				if( $ConcioStampoCodice =='GL-F7' ) $ConcioStampoCodice = 'GL-F07';
				if( $ConcioStampoCodice =='GL-F8' ) $ConcioStampoCodice = 'GL-F08';
				if( $ConcioStampoCodice =='GL-F9' ) $ConcioStampoCodice = 'GL-F09';
				$ConcioStampoPosizione = WFVALUEDLOOKUP('*','wms_posizioni',"CODICE LIKE '%" . $ConcioStampoCodice . "%'");
				if ($ConcioStampoPosizione == ''){ 
					echo('posioneErrore' . $ConcioStampoCodice . BRCRLF);
				}
				
				$GabbiaProgressivo =  $rsSegmentiVMT->fields['REINFORCEMENT']; //GABBIA PROGRESSIVO
				$GabbiaArticoloCodice = $rsSegmentiVMT->fields['REINFORCEMENT_TYPE']; //GABBIA ARTICOLO
				$GabbiaArticolo = WFVALUEDLOOKUP('*','articoli',"CODICE = '" . $GabbiaArticoloCodice . "'");
							
				$wms_udc = array();
				if ($rsSegmenti->fields['CT_ARTICOLI'] != $ConcioArticolo['ID']) $wms_udc['CT_ARTICOLI'] = $ConcioArticolo['ID'];
				if ($rsSegmenti->fields['MPS_CT_RESOURCES'] != 24) 				 $wms_udc['MPS_CT_RESOURCES'] = 24; //STAMPAGGIO
				if ($rsSegmenti->fields['SSCC'] != $ConcioProgressivo)    		 $wms_udc['SSCC'] = $ConcioProgressivo;
				if ($wms_udc['DATA'] != $ConcioDataOraStart)  		 			 $wms_udc['DATA'] = $ConcioDataOraStart;
				if (!empty($wms_udc)){
					$conn->AutoExecute("wms_udc", $wms_udc, 'UPDATE','ID = ' .$rsSegmenti->fields['ID'] );
					echo('udc' . $rsSegmenti->fields['EANUDC'] . BRCRLF);
				}
				$wms_udc['ID'] = $rsSegmenti->fields['ID'];
				
				$sqlSegmentiPos = "SELECT * 
								FROM wms_udcmovimenti
								WHERE EVENTO = '5SCASSERO'
									AND WMS_CT_UDC = " . $wms_udc['ID'] ;
				$rsSegmentiPos = $conn->Execute($sqlSegmentiPos);
				if ($rsSegmentiPos->RecordCount()==1)  {
					echo('SCASSERO UPD' . $wms_udc['ID'] . BRCRLF);
					$wms_udcmovimenti = array();
					$wms_udcmovimenti['WMS_CT_UDC'] 		=  $wms_udc['ID'];
					$wms_udcmovimenti['X'] 				=  $ConcioStampoPosizione['WPS_X'];
					$wms_udcmovimenti['Y'] 				=  $ConcioStampoPosizione['WPS_Y'];
					$wms_udcmovimenti['H'] 				=  $ConcioStampoPosizione['WPS_H'];
					$wms_udcmovimenti['WMS_CT_POSIZIONI'] = $ConcioStampoPosizione['ID'];
					$wms_udcmovimenti['RFID'] = 'GRU';
					$wms_udcmovimenti['WMS_CT_VEICOLI']   = null;
					$wms_udcmovimenti['EVENTO'] = '5SCASSERO';
					$wms_udcmovimentiPrimo['DATA'] = $ConcioDataOraEnd;
					try{
						$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimenti, 'UPDATE','ID = ' .$wms_udc['ID'] );
					} catch (exception $e){
						echo('SCASSERO ERR' . $wms_udc['ID'] . BRCRLF);
					}
				}elseif($rsSegmentiPos->RecordCount()==0)  {
					echo('SCASSERO ADD' . $wms_udc['ID'] . BRCRLF);
					$wms_udcmovimenti = array();
					$wms_udcmovimenti['WMS_CT_UDC'] 		=  $wms_udc['ID'];
					$wms_udcmovimenti['X'] 				=  $ConcioStampoPosizione['WPS_X'];
					$wms_udcmovimenti['Y'] 				=  $ConcioStampoPosizione['WPS_Y'];
					$wms_udcmovimenti['H'] 				=  $ConcioStampoPosizione['WPS_H'];
					$wms_udcmovimenti['WMS_CT_POSIZIONI'] = $ConcioStampoPosizione['ID'];
					$wms_udcmovimenti['RFID'] = 'GRU';
					$wms_udcmovimenti['WMS_CT_VEICOLI']   = null;
					$wms_udcmovimenti['EVENTO'] = '5SCASSERO';
					$wms_udcmovimenti['DATA'] = $ConcioDataOraEnd;
					$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimenti, 'INSERT');
				}
				
				$sqlSegmentiPos = "SELECT * 
								FROM wms_udcmovimenti
								WHERE EVENTO = '2FERRO'
									AND WMS_CT_UDC = " . $wms_udc['ID'] ;
				$rsSegmentiPos = $conn->Execute($sqlSegmentiPos);
				if ($rsSegmentiPos->RecordCount()==0)  {
					echo('FERRO ADD' . $wms_udc['ID'] . BRCRLF);
					//NASCITA UDC DA FERRO
					$wms_udcmovimentiPrimo = array();
					$wms_udcmovimentiPrimo['WMS_CT_UDC'] 		= $wms_udc['ID'];
					$wms_udcmovimentiPrimo['X'] 			=  $ConcioStampoPosizione['WPS_X'];
					$wms_udcmovimentiPrimo['Y'] 			=  $ConcioStampoPosizione['WPS_Y'];
					$wms_udcmovimentiPrimo['H'] 			=  $ConcioStampoPosizione['WPS_H'];
					$wms_udcmovimentiPrimo['WMS_CT_POSIZIONI'] = $ConcioStampoPosizione['ID'];
					$wms_udcmovimentiPrimo['RFID'] = $GabbiaProgressivo;
					$wms_udcmovimentiPrimo['EANUDC'] = $GabbiaProgressivo;
					$wms_udcmovimentiPrimo['EVENTO'] = '2FERRO';
						//DAFARE RICERCA SU GABBIE UDC CON GLI RFID
					$wms_udcmovimentiPrimo['WMS_CT_VEICOLI']   = null;
					$wms_udcmovimentiPrimo['DATA'] = $ConcioDataOraStart;
					$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimentiPrimo, 'INSERT');
					$wms_udcmovimentiPrimo['ID'] = $conn->Insert_ID();
				}
				
				$sqlSegmentiPos = "SELECT * 
								FROM wms_udcmovimenti
								WHERE EVENTO = '3GETTO'
									AND WMS_CT_UDC = " . $wms_udc['ID'];
				$rsSegmentiPos = $conn->Execute($sqlSegmentiPos);
				if ($rsSegmentiPos->RecordCount()==0)  {
					echo('CAMION ADD' . $wms_udc['ID'] . BRCRLF);
					//NASCITA UDC DA CAMION
					$wms_udcmovimentiSecondo = array();
					$wms_udcmovimentiSecondo['WMS_CT_UDC'] 		= $wms_udc['ID'];
					$wms_udcmovimentiSecondo['X'] 			=  $ConcioStampoPosizione['WPS_X'];
					$wms_udcmovimentiSecondo['Y'] 			=  $ConcioStampoPosizione['WPS_Y'];
					$wms_udcmovimentiSecondo['H'] 			=  $ConcioStampoPosizione['WPS_H'];
					$wms_udcmovimentiSecondo['WMS_CT_POSIZIONI'] = $ConcioStampoPosizione['ID'];
					$wms_udcmovimentiSecondo['RFID'] = 'CAMION';
					$wms_udcmovimentiSecondo['EVENTO'] = '3GETTO';
					$wms_udcmovimentiSecondo['WMS_CT_VEICOLI']   = null;
					$wms_udcmovimentiSecondo['DATA'] = $ConcioDataOraStart;
					$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimentiSecondo, 'INSERT');
					$wms_udcmovimentiSecondo['ID'] = $conn->Insert_ID();
				}
			
				if ($ConcioDDTDocData){
					/* SCRIVE PLANNING */
					$Planning = array();
					//3 turni inzio e fine GETTO
					$Turno = 0;
					$datetimeobj = New DateTime($ConcioDataOraStart);
					$data = $datetimeobj->format('Y-m-d');
					$time = $datetimeobj->format('H:i:s');
					$Momento = New DateTime($time);
					$Planning['RIGA'] = $Momento->format('H:m:s');
					
					$date1S = New DateTime("05:00");
					$date1E = New DateTime("13:59");
					
					$date2S = New DateTime("14:00");
					$date2E = New DateTime("21:59");
					
					$date3S = New DateTime("22:00");
					$date3E = New DateTime("23:59");
					$date3BS = New DateTime("00:00");
					$date3BE = New DateTime("04:59");
					if ($Momento > $date1S && $Momento < $date1E){
						$Turno = 'A';
						$Planning['DATEPLANAT'] = $data;
						$Planning['DATESTART'] = $data . ' ' . $date1S->format('H:i:s');
					}
					elseif ($Momento > $date2S && $Momento < $date2E){
						$Turno = 'B';
						$Planning['DATEPLANAT'] = $data;
						$Planning['DATESTART'] = $data . ' ' . $date2S->format('H:i:s');
					}
					elseif ($Momento > $date3S && $Momento < $date3E){
						$Turno = 'C';
						$Planning['DATEPLANAT'] = $data;
						$Planning['DATESTART'] = $data . ' ' . $date3S->format('H:i:s');
					}
					elseif ($Momento > $date3BS && $Momento < $date3BE){
						$Turno = 'C';
						$UDCWMS['DATA'] = WFVALUEDATEADD($data ,-1,'d')->format('Y-m-d');
						$data = WFVALUEDATEADD($data ,-1,'d')->format('Y-m-d');
						$Planning['DATEPLANAT'] = $UDCWMS['DATA'];
						$Planning['DATESTART'] = $data . ' ' . $date3S->format('H:i:s');
					}
						
					$Planning['SERIALBATCH'] = WFVALUEYEAR($ConcioDataOraStart) . '-' . WFVALUEDAYOFYEAR($ConcioDataOraStart) . $Turno;
					$Stampaggio = WFVALUEDLOOKUP('*','mps_resources',"ID = 24"); //STAMPAGGIO FORMATURA CONCI
					$Planning['MPS_CT_RESOURCES'] = $Stampaggio['ID'];
					$PlanningFind = WFVALUEDLOOKUP('*', 'mes_planning', "SERIALBATCH = '" . $Planning['SERIALBATCH'] . "' and MPS_CT_RESOURCES = " .$Planning['MPS_CT_RESOURCES'], ADODB_FETCH_ASSOC);
					
					if ($PlanningFind == ''){
						//$Planning['CT_ARTICOLI'] = $Articolo['ID'];
						$Planning['CT_ORDMOVIMENTI'] = null;
						$Planning['QTYPLAN'] = NULL;
						$Planning['QTYPRO'] = NULL;
						$conn->AutoExecute("mes_planning", $Planning, 'INSERT');
						$Planning['ID'] = $conn->Insert_ID();
					}else{
						$Planning['QTYPLAN'] = NULL;
						$Planning['QTYPRO'] = NULL;
						$conn->AutoExecute("mes_planning", $Planning, 'UPDATE', 'ID = ' . $PlanningFind['ID']);
						$Planning = $PlanningFind;
					}
					
					/* SCRIVE DDT SCARICO TESTA  */
					$AppoDdtScarico = WFVALUEDLOOKUP('*','ddt',"CT_SEZIONALI = " . $CausaleVendita['CT_SEZIONALI']  . " AND DOCNUM =  '" . $ConcioDDTDocNum ."'");
					if ($AppoDdtScarico == ''){
						$AppoDdtScarico = array();
						$AppoDdtScarico['PDMORIGIN'] = 4;
						$AppoDdtScarico['CT_FATTURAZIONE'] = 8427;
						$AppoDdtScarico['RIF'] = $Planning['SERIALBATCH'];
						$AppoDdtScarico['DOCDATA'] = $ConcioDDTDocData;
						$AppoDdtScarico['CT_MAGAZZINI'] = $MagazzinoID;
						$AppoDdtScarico['CG_CT_CONTABILEESERCIZI'] = $recordEsercizio['ID'];
						$AppoDdtScarico['CT_CAUSALI'] = $CausaleVendita['ID']; 
						$AppoDdtScarico['SEGNO'] = $CausaleVendita['SEGNO'];
						$AppoDdtScarico['CT_SEZIONALI'] = $CausaleVendita['CT_SEZIONALI'];
						$AppoDdtScarico['DOCNUM'] = $ConcioDDTDocNum;
						$conn->AutoExecute("ddt", $AppoDdtScarico, 'INSERT');
						$AppoDdtScarico['ID'] = $conn->Insert_ID();
					}
					
					$sqlSegmentiPos = "SELECT * 
										FROM wms_udcmovimenti
										WHERE EVENTO = '9SPEDITO'
											AND WMS_CT_UDC = " . $wms_udc['ID'];
					$rsSegmentiPos = $conn->Execute($sqlSegmentiPos);
					if ($rsSegmentiPos->RecordCount()==0)  {
						echo('DDT ADD' . $wms_udc['ID'] . BRCRLF);
								
						/* SCRIVE DDT SCARICO RIGHE */
						$AppoDdtCaricoMovimenti = array();
						$AppoDdtCaricoMovimenti['CT_DDT'] = $AppoDdtScarico['ID'];
						$AppoDdtCaricoMovimenti['CT_ARTICOLI'] = $ConcioArticolo['ID'];
						$AppoDdtCaricoMovimenti['QTA'] = 1;
						$AppoDdtCaricoMovimenti['QTARIGA'] = 1;
						$AppoDdtCaricoMovimenti['SERIALBATCH'] = $ConcioProgressivo;
						$AppoDdtCaricoMovimenti['NOTE'] = $ConcioDDTNote;
						$conn->AutoExecute("ddtmovimenti", $AppoDdtCaricoMovimenti, 'INSERT');
						$AppoDdtCaricoMovimenti['ID'] = $conn->Insert_ID();
						
						//DDT UDC DA VMT
						$wms_udcmovimentiSecondo = array();
						$wms_udcmovimentiSecondo['WMS_CT_UDC'] = $wms_udc['ID'];
						$wms_udcmovimentiSecondo['EANUDC'] = $ConcioDDTDocNum;
						$wms_udcmovimentiSecondo['EVENTO'] = '9SPEDITO';
						$wms_udcmovimentiSecondo['WMS_CT_VEICOLI']   = null;
						$wms_udcmovimentiSecondo['DATA'] = $ConcioDDTDocData;
						$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimentiSecondo, 'INSERT');
						$wms_udcmovimentiSecondo['ID'] = $conn->Insert_ID();
						
						//UDC DA VMT
						$wms_udcDDT = array();
						$wms_udcDDT['CT_DDT'] = $AppoDdtScarico['ID'];
						$wms_udcDDT['CT_DDTMOVIMENTI'] = $AppoDdtCaricoMovimenti['ID'];
						$conn->AutoExecute("wms_udc", $wms_udcDDT, 'UPDATE','ID = ' .$wms_udc['ID']);
					}
				}
			
			}
		}
		$rsSegmenti->MoveNext();
	}
	$cnVMT->close();
	
	$sqlC = "DELETE 
			FROM wms_udc
			WHERE 	LEFT(EANUDC,1) = 'S' 
				AND LENGTH(EANUDC) != 9
				AND CT_ARTICOLI is null";
	$conn->Execute($sqlC);
	
	$sqlC = "DELETE 
			FROM wms_udc
			WHERE 	LEFT(EANUDC,1) = 'S' 
				AND concat('',substring(EANUDC, 2, 8) * 1) <> substring(EANUDC, 2, 8) 
				AND CT_ARTICOLI is null ";
				
	$conn->Execute($sqlC);
	/* stesso giorno getto alle 7:00 scassero entro le 15:00 VAPORE
	$sqlSegmenti = "SELECT wms_udcmovimenti.ID, wms_udcmovimenti.WMS_CT_UDC
					FROM wms_veicolimovimenti 
						inner join wms_udcmovimenti on wms_udcmovimenti.WMS_CT_POSIZIONI = wms_veicolimovimenti.WMS_CT_POSIZIONI
                           AND TIMESTAMPDIFF(MINUTE,wms_udcmovimenti.DATA , wms_veicolimovimenti .DATA) BETWEEN 400 AND 700
					WHERE wms_udcmovimenti.WMS_CT_UDC IS NOT NULL
						AND wms_veicolimovimenti.WMS_CT_UDC IS NULL
						AND wms_veicolimovimenti.WMS_CT_UDCMOVIMENTI IS NULL
						AND wms_veicolimovimenti.EVENTO = 'SCARICO'";
	$rsVeicoliMovimenti = $conn->Execute($sqlSegmenti);
	while (!$rsVeicoliMovimenti->EOF) {
		$wms_udcmovimenti = array();
		$wms_udcmovimenti['WMS_CT_UDC'] 			=  $rsVeicoliMovimenti['WMS_CT_UDC'];
		$wms_udcmovimenti['WMS_CT_UDCMOVIMENTI'] 	=  $rsVeicoliMovimenti['ID'];
		$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimenti, 'UPDATE','ID = ' .$rsVeicoliMovimenti->fields['ID'] );
		$rsVeicoliMovimenti->MoveNext();
	}

	// giorno successivo getto alle 17:00 scassero entro le 6:00 (gg dopo) VAPORE
	$sqlSegmenti = "SELECT '2' as giorno, wms_veicolimovimenti.ID,wms_udcmovimenti.ID, wms_veicolimovimenti.DATA, wms_udcmovimenti.DATA 
					FROM wms_veicolimovimenti 
						inner join wms_udcmovimenti on wms_udcmovimenti.WMS_CT_POSIZIONI = wms_veicolimovimenti.WMS_CT_POSIZIONI
											   AND TIMESTAMPDIFF(MINUTE,wms_udcmovimenti.DATA , wms_veicolimovimenti .DATA) BETWEEN 720 AND 1040
					WHERE wms_udcmovimenti.WMS_CT_UDC IS NOT NULL
						AND wms_veicolimovimenti.WMS_CT_UDC IS NULL
						AND wms_veicolimovimenti.WMS_CT_UDCMOVIMENTI IS NULL
						AND wms_veicolimovimenti.EVENTO = 'SCARICO'";
	$rsVeicoliMovimenti = $conn->Execute($sqlSegmenti);
	while (!$rsVeicoliMovimenti->EOF) {
		$wms_udcmovimenti = array();
		$wms_udcmovimenti['WMS_CT_UDC'] 			=  $rsVeicoliMovimenti['WMS_CT_UDC'];
		$wms_udcmovimenti['WMS_CT_UDCMOVIMENTI'] 	=  $rsVeicoliMovimenti['ID'];
		$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimenti, 'UPDATE','ID = ' .$rsVeicoliMovimenti->fields['ID'] );
		$rsVeicoliMovimenti->MoveNext();
	}
	*/

	echo('ok');
	
	// NORMALIZZAZIONE
	$sqlC = "DELETE FROM `aaaamessage`
			WHERE `RFID` = 'hb'";
	//$conn->Execute($sqlC);

	$sqlC = "DELETE FROM `wms_udc`
			WHERE `CT_ARTICOLI` = '0' AND `SSCC` IS NULL";
	//$conn->Execute($sqlC);

	$sqlC = "update wms_udcmovimenti
			 SET SEGNO = 0";
	//$conn->Execute($sqlC);
	
	

	$sqlC = "DELETE 
			FROM wms_udc
			WHERE 	LEFT(EANUDC,1) = 'S' 
				AND concat('',substring(EANUDC, 2, 8) * 1) <> substring(EANUDC, 2, 8) 
				AND CT_ARTICOLI is null ";
	$conn->Execute($sqlC);
						
	$sqlC = 'update wms_udcmovimenti
			inner join (
			SELECT WMS_CT_UDC, CT_IOT, DATE_FORMAT(SR, "%d%H%i"), EVENTO, MIN(ID) as CHIAVE
			FROM `wms_udcmovimenti` 
			WHERE WMS_CT_POSIZIONI is null
			group by WMS_CT_UDC, CT_IOT, DATE_FORMAT(SR, "%d%H%i"), EVENTO
			)a on wms_udcmovimenti.id = a.CHIAVE
			set SEGNO = 1';
	//$conn->Execute($sqlC);

	$sqlC = "DELETE FROM `wms_udcmovimenti`
			WHERE  SEGNO = 0";
	//$conn->Execute($sqlC);

	$sqlC = "update wms_udcmovimenti
			inner join iot on iot.ID = wms_udcmovimenti.CT_IOT
			inner join wms_veicoli on wms_veicoli.CT_IOT = iot.ID 
			set wms_udcmovimenti.WMS_CT_VEICOLI = wms_veicoli.ID
			where wms_udcmovimenti.WMS_CT_VEICOLI is null";
	//$conn->Execute($sqlC);

	$sqlC = "UPDATE wms_udcmovimenti
			inner join wms_udc On wms_udc.ID = wms_udcmovimenti.WMS_CT_UDC
			inner join aaaamessage ON wms_udc.EANUDC =  aaaamessage.RFID and aaaamessage.SR = wms_udcmovimenti.SR 
			inner join iot on iot.PARAM1 = aaaamessage.OPERATOR
			inner join wms_veicoli ON wms_veicoli.CT_IOT = iot.ID
			SET wms_udcmovimenti.WMS_CT_VEICOLI = wms_veicoli.ID
			where wms_udcmovimenti.WMS_CT_VEICOLI is null";
	//$conn->Execute($sqlC);

	$sqlC = "update wms_udc
			inner join wms_udcmovimenti on wms_udc.ID = wms_udcmovimenti.WMS_CT_UDC
			set wms_udc.PESOLETTO = wms_udcmovimenti.PESOLETTO 
			where wms_udc.PESOLETTO  is null
			and wms_udcmovimenti.PESOLETTO > 0";
	$conn->Execute($sqlC);

	$sqlC = "update wms_udc
			inner join wms_udcmovimenti on wms_udc.ID = wms_udcmovimenti.WMS_CT_UDC
			set wms_udc.POSIZIONE = CONCAT( wms_udcmovimenti.X, ' ', wms_udcmovimenti.Y)
			where wms_udcmovimenti.X > 0";
	$conn->Execute($sqlC);


	$sqlC = "UPDATE wms_udc
			INNER JOIN (
			WITH ranked_udcmovimenti AS (
				SELECT m.*, ROW_NUMBER() OVER (PARTITION BY WMS_CT_UDC ORDER BY DATA DESC) AS rn
				FROM wms_udcmovimenti AS m
				WHERE m.X > 0
			)
			SELECT * FROM ranked_udcmovimenti WHERE rn = 1
			)as ultimo ON ultimo.WMS_CT_UDC = wms_udc.ID
			SET wms_udc.X = ultimo.X,
			wms_udc.Y = ultimo.Y,
			wms_udc.H = ultimo.H";
	$conn->Execute($sqlC);


	$conn->close();
?>