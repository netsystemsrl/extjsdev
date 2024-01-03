<?php	
	include('../includes/var.php');	
	$output = array();
	
	ini_set('memory_limit', '-1'); set_time_limit(0); 
	
	// ini_set("output_buffering", 0);  // off 
	ini_set("zlib.output_compression", 0);  // off
	ini_set("implicit_flush", 1);  // on   
	
	error_reporting(E_ALL);
	ini_set('display_errors', 1);
	$CollectObjList = array();
	
echo('Connection MSSQL ...'. BRCRLF);
	$connMSSQL = ADONewConnection('ado_mssql');
	$connMSSQL->debug=0;
	//$myDSN = 'PROVIDER=MSDASQL;DRIVER={SQL Server};SERVER=SRV-SQL\SQLEXPRESS;DATABASE=WM;Trusted_Connection=True;';  
	$myDSN="PROVIDER=MSDASQL;DRIVER={SQL Server};SERVER=.\SQLEXPRESS;DATABASE=WM;UID=sa;PWD=1234;"  ;
	$connMSSQL->Connect($myDSN) || die('fail');
	//$connMSSQL->EXECUTE("SET NAMES 'utf8'; SET CHARACTER SET 'utf8';");
	$connMSSQL->SetFetchMode(ADODB_FETCH_BOTH);
echo('Connected'. BRCRLF);
	
echo('Connection MYSQL'. BRCRLF);
	$conn = ADONewConnection('mysqli');
	$conn->debug = 0;
	$conn->PConnect("127.0.0.1",'root','root','pilomat');
	$conn->EXECUTE("set names 'utf8'");
	$conn->SetFetchMode(ADODB_FETCH_BOTH);
echo('Connected'. BRCRLF);
	$rootFILE = "E:\\WMDatabases\\Area1\\";
	

echo('ATTIVA DISATTIVA ARTICOLI IN VERSIONE' . BRCRLF);
	$sql = "UPDATE MASTERDATA 
				SET STATO = 0
			FROM medmgr.MASTERDATA";
	$connMSSQL->Execute($sql);

	$sql = "UPDATE MASTERDATA 
				SET STATO = 1
			FROM medmgr.MASTERDATA 
				INNER JOIN (
					SELECT MAX(INFOS) AS LastActive
						FROM medmgr.MASTERDATA
						GROUP BY NAME) As CodiciAttivi 
				ON MASTERDATA.INFOS = CodiciAttivi.LastActive";
	$connMSSQL->Execute($sql);

ob_flush();
flush();




echo('IMPORT ARTICOLI' . BRCRLF);
	$sql = "SELECT NAME, DESCRIPTION, UNIT, TYPE, CODICE_RICAMBIO, VERSION, UTILIZZATO_IN, PESO, DESCR_FAM
			FROM medmgr.MASTERDATA
			WHERE (STATO=1) AND (NAME NOT LIKE 'FIT%')  
			ORDER BY NAME";
//			AND (NAME LIKE '.')
	$RsArticoliPDM = $connMSSQL->Execute($sql);
	
	while (!$RsArticoliPDM->EOF) {
		if ($RsArticoliPDM->fields['NAME'] . '' != ''){
			//echo('Process:'. $RsArticoliPDM->fields['NAME'] . BRCRLF);
			$sql = "SELECT *
					FROM articoli
					WHERE CODICE = '" . $RsArticoliPDM->fields['NAME'] . "'";
			$RsArticoli = $conn->Execute($sql);
			$AppoRecord = array();
			if ($RsArticoli->RecordCount() > 0)  {
				$AppoRecord['DESCRIZIONE'] = utf8_encode($RsArticoliPDM->fields['DESCRIPTION']);
				if ($AppoRecord['DESCRIZIONE'] . '' == '') $AppoRecord['DESCRIZIONE'] = $RsArticoliPDM->fields['NAME'];			
				if ($RsArticoliPDM->fields['CODICE_RICAMBIO'] . '' != '') $AppoRecord['CODICERICAMBIO'] = $RsArticoliPDM->fields['CODICE_RICAMBIO'];
				
				$AppoRecord['MRP_VERSIONE'] = $RsArticoliPDM->fields['VERSION'];
				$AppoRecord['DIM_PESO'] = $RsArticoliPDM->fields['PESO'];
				$AppoRecord['UTILIZZATOIN'] = utf8_encode($RsArticoliPDM->fields['UTILIZZATO_IN']);
				
				if (($RsArticoliPDM->fields['DESCR_FAM'] != '') && ($RsArticoli->fields['CFG_CT_GRUPPI'] != '9999')) {
					$AppoRecord['CT_CATEGORIE'] = DLookup($conn, 'ID', 'angcategorie', "DESCRIZIONE = '" .utf8_encode($RsArticoliPDM->fields['DESCR_FAM']) ."'");
					if ($AppoRecord['CT_CATEGORIE'] == '') {
						//aggiungo in tabella categorie la nuova categoria del PDM
						$AppoRecordCategorie = array();
						$AppoRecordCategorie['DESCRIZIONE'] = utf8_encode($RsArticoliPDM->fields['DESCR_FAM']) ;
						$conn->AutoExecute("angcategorie", $AppoRecordCategorie, 'INSERT');
						$AppoRecord['CT_CATEGORIE'] = $conn->Insert_ID();
					}
				}
				$sqlC = $conn->GetUpdateSQL($RsArticoli, $AppoRecord);
				if ($sqlC != '') {
					echo('UPDATED DA PDM' . $RsArticoliPDM->fields['NAME']  . BRCRLF);
					$conn->Execute($sqlC);
				}else{
					//echo('EQUAL DA PDM' . $RsArticoliPDM->fields['NAME'] . BRCRLF);
				}
			}else{
				$AppoRecord['CODICE'] = $RsArticoliPDM->fields['NAME'];
				$AppoRecord['DESCRIZIONE'] = utf8_encode($RsArticoliPDM->fields['DESCRIPTION']);
				if ($AppoRecord['DESCRIZIONE'] . '' == '') $AppoRecord['DESCRIZIONE'] = $RsArticoliPDM->fields['NAME'];
				$ArticoloUm = $RsArticoliPDM->fields['UNIT'];
				if ($ArticoloUm . ''== '') $ArticoloUm = 'NR';
				$AppoRecord['UM0'] = $ArticoloUm;
				$AppoRecord['UMCONV'] = 1;
				$AppoRecord['UM1'] = $ArticoloUm;
				$AppoRecord['TIPOART'] = $RsArticoliPDM->fields['TYPE'];
				$AppoRecord['MRP_VERSIONE'] = $RsArticoliPDM->fields['VERSION'];
				$AppoRecord['DIM_PESO'] = $RsArticoliPDM->fields['PESO'];
				$AppoRecord['UTILIZZATOIN'] = utf8_encode($RsArticoliPDM->fields['UTILIZZATO_IN']);
				
				if ($RsArticoliPDM->fields['DESCR_FAM'] != '') {
					$AppoRecord['CT_CATEGORIE'] = DLookup($conn, 'ID', 'angcategorie', "DESCRIZIONE = '" .utf8_encode($RsArticoliPDM->fields['DESCR_FAM']) ."'");
					if ($AppoRecord['CT_CATEGORIE'] == '') {
						//aggiungo in tabella categorie la nuova categoria del PDM
						$AppoRecordCategorie = array();
						$AppoRecordCategorie['DESCRIZIONE'] = utf8_encode($RsArticoliPDM->fields['DESCR_FAM']) ;
						$conn->AutoExecute("angcategorie", $AppoRecordCategorie, 'INSERT');
						$AppoRecord['CT_CATEGORIE'] = $conn->Insert_ID();
					}
				}
			
				if ($RsArticoliPDM->fields['CODICE_RICAMBIO'] . '' != '') $AppoRecord['CODICERICAMBIO'] = $RsArticoliPDM->fields['CODICE_RICAMBIO'];
				$AppoRecord['PDMORIGIN'] = 1;
				$AppoRecord['LISTINOVENDITA'] = 0;
				$AppoRecord['LISTINOVENDITAINGROSSO'] = 0;
				$AppoRecord['LISTINOCOSTO'] = 0;
				$AppoRecord['CT_ALIQUOTE'] = 1;
				$sqlC = $conn->GetInsertSQL($RsArticoli, $AppoRecord);
				if ($sqlC != '') {
					echo('INSERTED DA PDM' . $RsArticoliPDM->fields['NAME'] . BRCRLF);
					$conn->Execute($sqlC);
				}
			}
		}
		$RsArticoliPDM->MoveNext();
		$RsArticoli->close();
	}
	$RsArticoliPDM->close(); 
	

ob_flush();
flush();


dbimport:
echo(' ALIGN DB'. BRCRLF);
	$sql = "SELECT ID, CODICE, DESCRIZIONE, TIPOART
			FROM articoli
			ORDER BY CODICE";
	$RsArticoli = $conn->Execute($sql);
	
	while (!$RsArticoli->EOF) {		
		//echo('Process:'. $RsArticoli->fields['CODICE'] . BRCRLF);
		$ArticoloParentID = $RsArticoli->fields['ID'];
		$sql = "SELECT WM_ELE_LINKS.QUANTITY_DMS, WM_ELE_LINKS.OVERWRITES, MASTERDATA_1.NAME, MASTERDATA_1.DESCRIPTION, MASTERDATA_1.INFOS
				FROM medmgr.MASTERDATA 
					INNER JOIN medmgr.WM_ELE_LINKS ON MASTERDATA.INFOS = WM_ELE_LINKS.PARENT_ELEMENT 
					INNER JOIN medmgr.MASTERDATA AS MASTERDATA_1 ON WM_ELE_LINKS.CHILD_ELEMENT = MASTERDATA_1.INFOS
				WHERE (MASTERDATA.NAME = '" . $RsArticoli->fields['CODICE'] . "')
					AND (MASTERDATA.STATO = 1) 
					AND (MASTERDATA_1.STATO = 1);";
		$RsArticoliDBPDM = $connMSSQL->Execute($sql);
		
		//azzera linkage con il pdm
		$sql = "UPDATE articoliarticoli
				SET CT_IDPDM = null
				WHERE (PDMORIGIN = 1 OR PDMORIGIN = 2) AND CT_ARTICOLIPARENT = " . $ArticoloParentID ;
		$conn->Execute($sql);
			
		while (!$RsArticoliDBPDM->EOF) {
			$sql = "SELECT ID FROM articoli WHERE CODICE = '" . $RsArticoliDBPDM->fields['NAME'] . "'";
			$RsAppo = $conn->Execute($sql);
			$ArticoloChildID = $RsAppo->fields['ID'];
			$RsAppo->close();
			
			$ArticoloChildMoltiplica = $RsArticoliDBPDM->fields['QUANTITY_DMS'];
			if ($RsArticoliDBPDM->fields['OVERWRITES'] > 0) $ArticoloChildMoltiplica = $RsArticoliDBPDM->fields['OVERWRITES'];
			
			$sql = "SELECT CT_ARTICOLI, CT_ARTICOLIPARENT, MOLTIPLICA, PDMORIGIN, CT_IDPDM
					FROM articoliarticoli
					WHERE CT_ARTICOLI = " . $ArticoloChildID . " 
						AND CT_ARTICOLIPARENT = " . $ArticoloParentID;
			$RsArticoliArticoli = $conn->Execute($sql);
			
			$AppoRecord = array();
			$AppoRecord['CT_ARTICOLI'] = $ArticoloChildID;
			$AppoRecord['CT_ARTICOLIPARENT'] = $ArticoloParentID;
			$AppoRecord['CT_IDPDM'] = $RsArticoliDBPDM->fields['INFOS'];
			
			if ($RsArticoliArticoli->RecordCount() > 0)  {
				if ($RsArticoliArticoli->fields['PDMORIGIN'] == 1){
					$AppoRecord['MOLTIPLICA'] = $ArticoloChildMoltiplica;
				}
				$sqlC = $conn->GetUpdateSQL($RsArticoliArticoli, $AppoRecord);
				if ($sqlC != '') {
					if ($AppoRecord['MOLTIPLICA'] != $RsArticoliArticoli->fields['MOLTIPLICA'] ) echo('UPDATED LINK DA PDM' . $RsArticoliDBPDM->fields['NAME'] . '-' . $RsArticoliDBPDM->fields['INFOS'] . BRCRLF);
					$conn->Execute($sqlC);
				}
			}else{
				$AppoRecord['MOLTIPLICA'] = $ArticoloChildMoltiplica;
				$AppoRecord['PDMORIGIN'] = 1;
				$sqlC = $conn->GetInsertSQL($RsArticoliArticoli, $AppoRecord);
				if ($sqlC != '') {
					echo('INSERTED LINK DA PDM' . $RsArticoliDBPDM->fields['NAME'] . BRCRLF);
					$conn->Execute($sqlC);
				}
			}
			$RsArticoliDBPDM->MoveNext();
		}
		
		//cancella legami monchi
		$sql = "DELETE FROM articoliarticoli
				WHERE PDMORIGIN = 1 AND CT_IDPDM is null AND CT_ARTICOLIPARENT = " . $ArticoloParentID ;
		$conn->Execute($sql);
		if ($conn->affected_rows() > 0) echo('CANCELLA LINK A PDM NULLI' . $ArticoloParentID . BRCRLF);
		
		$RsArticoli->MoveNext();
	}
	$RsArticoliDBPDM->close();
ob_flush();
flush();



	
fileimport:
echo('IMPORT DA PDM JPG MINIATURA ARTICOLO'. BRCRLF);
	$sql = "SELECT d1,d2,d3,fname,FID,NAME FROM FILEJPG";
	$RsArticoliJPG= $connMSSQL->Execute($sql);
	
	while (!$RsArticoliJPG->EOF) {
		$AppoRecord = array();
		$FileOrig = $RsArticoliJPG->fields['d1'] . '\\' . 
					  $RsArticoliJPG->fields['d2'] . '\\' . 
					  $RsArticoliJPG->fields['d3'] . '\\' . 
					  $RsArticoliJPG->fields['fname'];
		$FileDest = $RsArticoliJPG->fields['FID'] . '.JPG' ;
		if (!file_exists($ExtJSDevDOC . '\\' . $FileDest)){
			copy($rootFILE . $FileOrig, $ExtJSDevDOC . '/' . $FileDest);
			echo('Copy '. $FileDest . BRCRLF);
		}
		$AppoRecord['IMMAGINE'] =  $RsArticoliJPG->fields['FID'] . '.JPG' ;
		$sql = "SELECT IMMAGINE
				FROM articoli
				WHERE CODICE = '" . $RsArticoliJPG->fields['NAME'] . "'";
		$RsArticoli = $conn->Execute($sql);
		if ($RsArticoli->RecordCount() > 0)  {
			$sqlC = $conn->GetUpdateSQL($RsArticoli, $AppoRecord);
			if ($sqlC != '') $conn->Execute($sqlC); 
		}else{
			$AppoRecord['CODICE'] =  $RsArticoliJPG->fields['NAME'];
			$sqlC = $conn->GetInsertSQL($RsArticoli, $AppoRecord);
			if ($sqlC != '') $conn->Execute($sqlC); 
		}
		
		$RsArticoliJPG->MoveNext();
	}
	$RsArticoliJPG->close(); 
	$RsArticoli->close();

	
ob_flush();
flush();
//importare tutti i file nel repository epoi ricolelgo a PDF in articoli');
	
	
	
$sql = "DELETE 
		FROM aaadocuments
		WHERE PDMORIGIN = 1";
$conn->Execute($sql);
	
echo('IMPORT DA PDM DOCUMENTS PDF	'. BRCRLF);
	$sql = "SELECT d1,d2,d3,fname,FID,NAME FROM FILEPDF";
	$RsArticoliPDF= $connMSSQL->Execute($sql);
	
	while (!$RsArticoliPDF->EOF) {
		$AppoRecord = array();
		$FileOrig = $RsArticoliPDF->fields['d1'] . '/' . 
					  $RsArticoliPDF->fields['d2'] . '/' . 
					  $RsArticoliPDF->fields['d3'] . '/' . 
					  $RsArticoliPDF->fields['fname'];
		$FileDest = $RsArticoliPDF->fields['FID'] . '.PDF' ;
		if (!file_exists($ExtJSDevDOC . '/' . $FileDest)){
			echo('Copy '. $FileDest . BRCRLF);
			copy($rootFILE . $FileOrig, $ExtJSDevDOC . '/' . $FileDest);
		}
		$AppoRecord['DESCNAME'] = 'VISTA PIANTA PDM' ;
		$AppoRecord['FILENAME'] = $RsArticoliPDF->fields['FID'] . '.PDF' ;
		$AppoRecord['FILEEXT']  = '.PDF' ;
		$AppoRecord['CT_TABLE'] = 'articoli';
		$AppoRecord['PDMORIGIN']  = 1 ;

		$sql = "SELECT ID
				FROM articoli
				WHERE CODICE = '" . $RsArticoliPDF->fields['NAME'] . "'";
		$RsArticoli = $conn->Execute($sql);
		$AppoRecord['CT_ID']    = $RsArticoli->fields['ID'] ;
		
		$sql = "SELECT CT_TABLE, CT_ID, DESCNAME, FILENAME, FILEEXT, PDMORIGIN 
				FROM aaadocuments
				WHERE CT_TABLE = '" . 	$AppoRecord['CT_TABLE'] . "' 
					AND CT_ID = " . 	$RsArticoli->fields['ID'] . "
					AND PDMORIGIN = " .	$AppoRecord['PDMORIGIN'] . "
					AND FILEEXT = '" . 	$AppoRecord['FILEEXT'] . "'";
		$RsDocuments = $conn->Execute($sql);

		if ($RsDocuments->RecordCount()>0)  {
			$sqlC = $conn->GetUpdateSQL($RsDocuments, $AppoRecord);
			if ($sqlC != '') {
				echo('PDF->UPDATE '. $AppoRecord['FILENAME'] . '-' . $AppoRecord['CT_ID'] . BRCRLF);
				$conn->Execute($sqlC); 
			}
		}else{
			$sqlC = $conn->GetInsertSQL($RsDocuments, $AppoRecord);
			if ($sqlC != '') {
				$conn->Execute($sqlC); 
				echo('PDF->Insert '. $AppoRecord['FILENAME'] .  '-' . $AppoRecord['CT_ID'] . BRCRLF);
			}
		}
		
		$RsArticoliPDF->MoveNext();
	}
	$RsArticoliPDF->close(); 
	$RsArticoli->close();
	$RsDocuments->close();


ob_flush();
flush();

//importare tutti i file nel repository epoi ricolelgo a DWG in articoli	




echo('IMPORT DA PDM DWF	'. BRCRLF);
$sql = "SELECT d1,d2,d3,fname,FID,NAME FROM FILEDWG";
	$RsArticoliDWG= $connMSSQL->Execute($sql);
	
	while (!$RsArticoliDWG->EOF) {
		$AppoRecord = array();
		$FileOrig = $RsArticoliDWG->fields['d1'] . '/' . 
								  $RsArticoliDWG->fields['d2'] . '/' . 
								  $RsArticoliDWG->fields['d3'] . '/' . 
								  $RsArticoliDWG->fields['fname'];
		$FileDest = $RsArticoliDWG->fields['FID'] . '.DWG' ;
		if (!file_exists($ExtJSDevDOC . '/' . $FileDest)){
			echo('Copy '. $FileDest . BRCRLF);
			copy($rootFILE . $FileOrig, $ExtJSDevDOC . '/' . $FileDest);
		}
		$AppoRecord['DESCNAME'] = 'DWG TAGLIO PDM' ;
		$AppoRecord['FILENAME'] = $RsArticoliDWG->fields['FID'] . '.DWG' ;
		$AppoRecord['FILEEXT']  = '.DWG' ;
		$AppoRecord['CT_TABLE'] = 'articoli';
		$AppoRecord['PDMORIGIN']  = 1 ;

		$sql = "SELECT ID
				FROM articoli
				WHERE CODICE = '" . $RsArticoliDWG->fields['NAME'] . "'";
		$RsArticoli = $conn->Execute($sql);
		$AppoRecord['CT_ID']    = $RsArticoli->fields['ID'] ;
		
		$sql = "SELECT CT_TABLE, CT_ID, DESCNAME, FILENAME, FILEEXT, PDMORIGIN
				FROM aaadocuments
				WHERE CT_TABLE = '" . 	$AppoRecord['CT_TABLE'] . "' 
					AND CT_ID = " . 	$RsArticoli->fields['ID'] . "
					AND PDMORIGIN = " .	$AppoRecord['PDMORIGIN'] . "
					AND FILEEXT = '" . 	$AppoRecord['FILEEXT'] . "'";
		$RsDocuments = $conn->Execute($sql);

		if ($RsDocuments->RecordCount()>0)  {
			$sqlC = $conn->GetUpdateSQL($RsDocuments, $AppoRecord);
			if ($sqlC != '') {
				echo('DWG->UPDATE '. $AppoRecord['FILENAME'] . '-' . $AppoRecord['CT_ID'] . BRCRLF);
				$conn->Execute($sqlC); 
			}
		}else{
			$sqlC = $conn->GetInsertSQL($RsDocuments, $AppoRecord);
			if ($sqlC != '') {
				$conn->Execute($sqlC); 
				echo('DWG->Insert '. $AppoRecord['FILENAME'] .  '-' . $AppoRecord['CT_ID'] . BRCRLF);
			}
		}
		
		$RsArticoliDWG->MoveNext();
	}
	$RsArticoliDWG->close(); 
	$RsArticoli->close();
	$RsDocuments->close();
	
?>