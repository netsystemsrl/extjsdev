<?php	
	include('../includes/var.php');
	/*
	error_reporting(E_ALL);
	ini_set('display_errors', 1);
	$conn->debug=1; 
	*/
	$debugmessage = 0;
	
	$output = array();
	
	$objname = '';
	if (isset($_GET['objname']))  $objname = $_GET['objname'];
	if (isset($_POST['objname']))  $objname = $_POST['objname'];
	
	$datasource = '';
	if (isset($_GET['datasource'])) $objname = $_GET['datasource'];
	if (isset($_POST['datasource'])) $objname = $_POST['datasource'];
	
	$datasourcedbname = 'iler';
	//$datasourcedbname = isset($_GET["datasourcedbname"]) ? $_GET["datasourcedbname"] : $datasourcedbname;
	//$datasourcedbname = isset($_POST["datasourcedbname"]) ? $_POST["datasourcedbname"] : $datasourcedbname;
	
	$objtype = '';
	if (isset($_GET['objtype']))  $objtype = $_GET['objtype'];
	if (isset($_POST['objtype']))  $objtype = $_POST['objtype'];
	
//CONNECTION
	if (!IsNullOrEmptyString($datasourcedbname)) {
		WFSQLCONNECT($datasourcedbname);
	}
	
// FUNCTIONS

	function ListObjName(){
		global $conn;
		$output = [];
		$strsql = "SELECT A_TABLE.ID, A_TABLE.DD_DESCRIZIONE, A_TABLE.DD_FIS_NAME 
					FROM A_TABLE 
					ORDER BY DD_DESCRIZIONE ASC";
		//OUVTABLE 
		try {   
			$rs = $conn->Execute( $strsql );
		} catch (exception $e){
			//synonyms not exist
		}
		while (!$rs->EOF) {
			$output[]= array(	"text"=> htmlentities($rs->fields['DD_DESCRIZIONE']),
								"extra"=> '',
								"alias"=> htmlentities(str_replace(' ', "_", $rs->fields['DD_DESCRIZIONE'])),
								"originName"=> htmlentities($rs->fields['DD_FIS_NAME']),
								"allowDrop"=> "false",
								"leaf"=> "true",
								"type"=> "ouvtable"
								);	
			$rs->MoveNext();
		}
		return $output;
	}
	function ListObjField($fromname, $fromtype){
		global $conn;
		$type = '';
		$output = [];
		$fromid = 0;
		try {  
			$sql = "select z_catalogo.DD_DESCRIZIONE as FIELDNAME, a_table_catalogo.DD_DESCRIZIONE as FIELDALIAS, z_catalogo.CZ_TIPO_CAMPO as FieldType, a_table.ID as TableID
					FROM a_table_catalogo 
						INNER JOIN z_catalogo ON a_table_catalogo.CZ_CATALOGO = z_catalogo.ID 
						INNER JOIN a_table ON a_table_catalogo.CA_TABLE = a_table.ID
					WHERE a_table.DD_FIS_NAME = '" . $fromname . "'
					ORDER BY a_table_catalogo.DD_DESCRIZIONE ";
			$rsField = $conn->Execute($sql);
		} catch (exception $e){
			$output["failure"] = true; 
			$output["message"] = 'select ' . $e->getMessage();
			$output = array_map('utf8_encode',$output);
			echo  html_entity_decode(json_encode($output));
			die();
		}
		
		//tutti i campi
		$output[]= array(	"field"=> htmlentities("*"),
							"extra"=> "", //"", "auto_increment"
							"alias"=> htmlentities("*"),
							"type"=> $type,  					//"int(11)",  "varchar(255)", "tinyint(1)" "datetime"
							"id"=> uniqid(),					//"26E005CA-0E76-A139-B81B2B8F03813D80",
							"key"=> "",     					//"PRI",  "MUL",  "",
							"tableName"=> htmlentities($fromname),	
							"null"=> "",						
							"default"=> ""   					//0
							);
							
		if ($fromtype == 'TABLE'){
			$indexes = $conn->MetaIndexes( $fromname );
			$primary = $conn->MetaPrimaryKeys( $fromname );
			$foreigns = $conn->MetaForeignKeys($fromname);
		}
		
		//campo per campo
		while (!$rsField->EOF) {
			$fld = $rsField->FetchField($i);
			$name = $rsField->fields('FIELDNAME');
			$alias = $rsField->fields('FIELDALIAS');
			$type = $rsField->fields('CZ_TIPO_CAMPO');
			
			if ($type == '1') $type = 'int(11)';
			if ($type == '2') $type = 'varchar(255)';
			if ($type == '3') $type = 'varchar(255)';
			if ($type == '4') $type = 'datetime';
			if ($type == '5') $type = 'int(11)';
			if ($type == '7') $type = 'varchar(255)';
			if ($type == '10') $type = 'tinyint(1)';
			$keydef = '';
			$foreignKey = '';
			
			//IF TABLE RECOVER FIELD DEFINITION
			if ($fromtype == 'TABLE'){
				
				//FOREIGN
				$sql = "SELECT 	MASTERTABLE.DD_DESCRIZIONE as MASTERTABLENAME, 
								MASTERFIELD.DD_DESCRIZIONE as MASTERTABLEFIELD,
								DECTAILTABLE.DD_DESCRIZIONE as DECTAILTABLENAME,
								DECTAILFIELD.DD_DESCRIZIONE as DECTAILTABLEFIELD
						FROM a_sql_builder_t_link
							INNER JOIN A_TABLE MASTERTABLE ON a_sql_builder_t_link.CA_TABLE_MASTER = MASTERTABLE.ID 
							INNER JOIN z_catalogo MASTERFIELD ON a_sql_builder_t_link.CA_TABLE_DETAIL = MASTERFIELD.ID 
							INNER JOIN A_TABLE DECTAILTABLE ON a_sql_builder_t_link.CA_TABLE_DETAIL = DECTAILTABLE.ID 
							INNER JOIN z_catalogo DECTAILFIELD ON a_sql_builder_t_link.CA_TABLE_DETAIL = DECTAILFIELD.ID 
						WHERE(
									CA_TABLE_MASTER = " . $rs->fields['TableID'] . "
								OR 	CA_TABLE_DETAIL = " . $rs->fields['TableID'] . "
							) AND (
									MASTERFIELD.DD_DESCRIZIONE = '" . $name . "'
								OR	DECTAILFIELD.DD_DESCRIZIONE  = '" . $name. "'
							)";
				$rsForeign = $conn->Execute($sql);
				while (!$rsForeign->EOF) {
					$foreignKey = $foreignKey.
								$rsForeign->fields['MASTERTABLENAME'] . '.' . $rsForeign->fields['MASTERTABLEFIELD'] . 
								' = ' . 
								$rsForeign->fields['DECTAILTABLENAME'] . '.' . $rsForeign->fields['DECTAILTABLEFIELD'] . 
								", ";
					$rsForeign->MoveNext();
				}
				$rsForeign->close();
			}
			
			//KEY
			if ($name == 'ID')  $keydef = 'PRI';
			if (substr($name, 0, 3) == 'CT_')  $keydef= 'MUL';
			$output[]= array(	"field"=> htmlentities($name),
								"alias"=> htmlentities($alias),
								"extra"=> "",     					//"", "auto_increment"
								"type"=> $type,  					//"int(11)",  "varchar(255)", "tinyint(1)" "datetime"
								"id"=> uniqid(),					//"26E005CA-0E76-A139-B81B2B8F03813D80",
								"key"=> $keydef,     				//"PRI",  "MUL",  "",
								"foreign"=> $foreignKey,
								"tableName"=> htmlentities($fromname),	
								"null"=> '',						
								"default"=> ""   					//0
								);
			$rsField->MoveNext();
		}
		$rsField->close();
		
		return $output;
	}
	function IsTable($fromname){
		global $conn;
		
		//TABLES
		if( is_array( $tables = $conn->MetaTables( 'TABLES' , '') ) ) {
			foreach( $tables as $table ) {
				return true;
			}
		}
		return false;
	}

//MAIN
	if ($objname == '')	{
		$output = ListObjName();
	}else{
		if ($objtype = ''){
			if (IsTable($objname)) $objtype = 'TABLE';
		}
		$output = ListObjField($objname, $objtype);
	}
	
	echo Array2JSON($output);
?>