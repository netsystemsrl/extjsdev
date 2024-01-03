<?php		
	require_once('../var.php');
	$output = array();
	$output["metaData"]["idProperty"] = "ID";
	$output["metaData"]["totalProperty"] = "total";
	$output["metaData"]["successProperty"] = "success";
	$output["metaData"]["rootProperty"] = "data";
	$output["metaData"]["root"]="data";
	$output["message"] = "";
	$output["messagedebug"] = "";
	if ($UserId == 0) {
		$output["failure"]=true;
		$output["success"]=false;
		$Appo = Array2JSON($output,$debugmessage);
		header("Access-Control-Allow-Origin: *");
		header('Content-Type: application/json');
		echo $Appo;
		die();
	}
	//WFSetDebug(true);
	$debugmessage = 0;
	
	WFSendLOG("DictionarySQL:","START");
	
	
	$objname = '';
	if (isset($_GET['objname']))  $objname = $_GET['objname'];
	if (isset($_POST['objname']))  $objname = $_POST['objname'];
	
	if (isset($_GET['datasource'])) $objname = $_GET['datasource'];
	
	$objtype = '';
	if (isset($_GET['objtype']))  $objtype = $_GET['objtype'];
	if (isset($_POST['objtype']))  $objtype = $_POST['objtype'];
	
// FUNCTIONS
	function ListObjName(){
		global $conn;
		$output = [];
		//TABLES
		if( is_array( $tables = $conn->MetaTables( 'TABLES' , '') ) ) {
			foreach( $tables as $table ) {
				$type= "source";
				$alias = '';
				$output[]= array(	"text"=> $table,
									"extra"=> '',
									"alias"=> $alias,
									"originName"=> $table,
									"allowDrop"=> "false",
									"leaf"=> "true",
									"type"=> "table"
									);	
				}		
		}
		//VIEWS
		if( is_array( $tables = $conn->MetaTables( 'VIEWS' , '') ) ) {	
			foreach( $tables as $table ) {
				$type= "source";
				$output[]= array(	"text"=> $table,
									"allowDrop"=> "false",
									"leaf"=> "true",
									"type"=> "view"
									);	
				}		
		}
		//SYNONYMS 
		/*
		try {   
			$rs = $conn->Execute( "SELECT * FROM USER_SYNONYMS" );
		} catch (exception $e){
			//synonyms not exist
		}
		while (!$rs->EOF) {
			$table=$rs->fields['SYNONYM_NAME'];
			$output[]= array(	"text"=> $table,
								"allowDrop"=> "false",
								"leaf"=> "true",
								"type"=> "synonym"
								);	
			$rs->MoveNext();
		}
		*/
		return $output;
	}
	
	function ListObjField($fromname, $fromtype){
		global $conn;
		$type = '';
		$output = [];
		try {   
			$rs = $conn->Execute("SELECT * FROM " . $fromname . " WHERE 1 = -1");
		} catch (exception $e){
			$output["failure"] = true; 
			$output["message"] = 'select ' . $e->getMessage();
			$output = array_map('utf8_encode',$output);
			echo  html_entity_decode(json_encode($output));
			die();
		}
		$ColumnCountResult = $rs->FieldCount();
		
		//tutti i campi
		$output[]= array(	"field"=> "*",
							"extra"=> "",     					//"", "auto_increment"
							"alias"=> "",
							"type"=> $type,  					//"int(11)",  "varchar(255)", "tinyint(1)" "datetime"
							"id"=> uniqid(),					//"26E005CA-0E76-A139-B81B2B8F03813D80",
							"key"=> "",     					//"PRI",  "MUL",  "",
							"tableName"=> $fromname,	
							"null"=> "",						
							"default"=> ""   					//0
							);
		if ($fromtype == 'TABLE'){
			$indexes = $conn->MetaIndexes( $fromname );
			$primary = $conn->MetaPrimaryKeys( $fromname );
			$foreigns = $conn->MetaForeignKeys($fromname);
		}
		
		for ($i = 0; $i < $ColumnCountResult; $i++) {
			$fld = $rs->FetchField($i);
			$name = $fld->name;
			$alias = ""; $fld->name;
			$type = $rs->MetaType($fld->type);
			$max_length = $fld->max_length;
			
				if ($type == 'C') $type = 'varchar(255)';
				if ($type == 'I') $type = 'int(11)';
				if ($type == 'N') $type = 'int(11)';
				if ($type == 'X') $type = 'varchar(255)';
				if ($type == 'D') $type = 'datetime';
				if ($type == 'T') $type = 'datetime';
				if ($type == 'L') $type = 'tinyint(1)';
				$keydef = '';
				$foreignKey = '';
				
				//IF TABLE RECOVER FIELD DEFINITION
				if ($fromtype == 'TABLE'){
					foreach( $foreigns as $foreignTable => $foreignConstraint ) {
						foreach($foreignConstraint as $foreign){
							$JoinFromField = explode('=',$foreign)[0];
							$JoinToField   = explode('=',$foreign)[1];
							if($name == $JoinFromField){
								$foreignKey = $fromname . '.' . $JoinFromField . ' = ' . $foreignTable . '.' . $JoinToField;
							}
						}
					}
					foreach( $primary as $index ) {
						if($name == $index){ 
							$keydef = 'PRI';
						}
					}
					foreach( $indexes as $index ) {
						if($name == $index){ 
							$keydef = 'MUL';
						}
					}
				}
				
				if ($name == 'ID')  $keydef = 'PRI';
				if (substr($name, 0, 3) == 'CT_')  $keydef= 'MUL';
				$output[]= array(	"field"=> $name,
									"alias"=> $alias,
									"extra"=> "",     					//"", "auto_increment"
									"type"=> $type,  					//"int(11)",  "varchar(255)", "tinyint(1)" "datetime"
									"id"=> uniqid(),					//"26E005CA-0E76-A139-B81B2B8F03813D80",
									"key"=> $keydef,     				//"PRI",  "MUL",  "",
									"foreign"=> $foreignKey,
									"tableName"=> $fromname,	
									"null"=> '',						
									"default"=> ""   					//0
									);
			}
		$rs->close();
		
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
	if ($conn->debug!=1) {
		header('Content-Type: application/json');
	}
	
	$Appo = Array2JSON($output, $debugmessage);
	$Appo = str_replace("'true'", "true", $Appo);
	$Appo = str_replace('"true"', "true", $Appo);
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');

	echo $Appo;
	$conn->close();
?>