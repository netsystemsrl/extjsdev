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
	
	WFSendLOG("PivotDataRead:","START");
	
	$LayoutId = 0;
	$LayoutId = isset($_POST["layoutid"]) ? $_POST["layoutid"] : $LayoutId;
	$LayoutId = isset($_GET["layoutid"]) ? $_GET["layoutid"] : $LayoutId;
	
	$LayoutEditorId = 0;
	$LayoutEditorId = isset($_POST["layouteditorid"]) ? $_POST["layouteditorid"] : $LayoutEditorId;
	$LayoutEditorId = isset($_GET["layouteditorid"]) ? $_GET["layouteditorid"] : $LayoutEditorId;
	
	$objname = '';
	$objname = isset($_POST["objname"]) ? $_POST["objname"] : $objname;
	$objname = isset($_GET["objname"]) ? $_GET["objname"] : $objname;
		
	$datasourcetype = '';
	$datasourcetype = isset($_POST["datasourcetype"]) ? $_POST["datasourcetype"] : $datasourcetype;
	$datasourcetype = isset($_GET["datasourcetype"]) ? $_GET["datasourcetype"] : $datasourcetype;
	
	$datasource = '';
	$datasource = isset($_POST["datasource"]) ? $_POST["datasource"] : $datasource;
	$datasource = isset($_GET["datasource"]) ? $_GET["datasource"] : $datasource;
	
	$datasourcedbname = '';
	$datasourcedbname = isset($_POST["datasourcedbname"]) ? $_POST["datasourcedbname"] : $datasourcedbname;
	$datasourcedbname = isset($_GET["datasourcedbname"]) ? $_GET["datasourcedbname"] : $datasourcedbname;
	
	$datasourcefield = 'ID';
	$datasourcefield = isset($_POST["datasourcefield"]) ? $_POST["datasourcefield"] : $datasourcefield;
	$datasourcefield = isset($_GET["datasourcefield"]) ? $_GET["datasourcefield"] : $datasourcefield;
	
	$modeldef = '';
	$modeldef = isset($_POST["modeldef"]) ? $_POST["modeldef"] : $modeldef;
	$modeldef = isset($_GET["modeldef"]) ? $_GET["modeldef"] : $modeldef;
	
	$onlydata = '';
	$onlydata = isset($_POST["onlydata"]) ? $_POST["onlydata"] : $onlydata;
	$onlydata = isset($_GET["onlydata"]) ? $_GET["onlydata"] : $onlydata;
	
	$RecordStart = 0;
	$RecordStart = isset($_POST["start"]) ? $_POST["start"] : $RecordStart;
	$RecordStart = isset($_GET["start"]) ? $_GET["start"] : $RecordStart;
	
	$RecordLimit = 10000000;
	$RecordLimit = isset($_POST["limit"]) ? $_POST["limit"] : $RecordLimit;
	$RecordLimit = isset($_GET["limit"]) ? $_GET["limit"] : $RecordLimit;
	if ($RecordLimit. '' == '') $RecordLimit = 10000000;
	
	$datamode = '';
	$datamode = isset($_POST["datamode"]) ? $_POST["datamode"] : $datamode;
	$datamode = isset($_GET["datamode"]) ? $_GET["datamode"] : $datamode;
	
	$dataorder = '';
	$dataorder = isset($_POST["sort"]) ? $_POST["sort"] : $dataorder;
	$dataorder = isset($_GET["sort"]) ? $_GET["sort"] : $dataorder;
	
	$combowhere = '';
	$combowhere = isset($_POST["searchStr"]) ? $_POST["searchStr"] : $combowhere;
	$combowhere = isset($_GET["searchStr"]) ? $_GET["searchStr"] : $combowhere;
	
	$datawhere = '';
	$datawhere = isset($_POST["datawhere"]) ? $_POST["datawhere"] : $datawhere;
	$datawhere = isset($_GET["datawhere"]) ? $_GET["datawhere"] : $datawhere;
	
	$filter = '';
	$filter = isset($_POST["filter"]) ? $_POST["filter"] : $filter;
	$filter = isset($_GET["filter"]) ? $_GET["filter"] : $filter;
	$filter = isset($_POST["query"]) ? $_POST["query"] : $filter;
	$filter = isset($_GET["query"]) ? $_GET["query"] : $filter;

	
	//general var definition
	$sql = "";
	$sqlorder = "";
	$sqlwhere = "";
	$sqlAppo = array();
	
	//object var definition
	$valueField = "ID";
	$keyField = "ID";
	$displayField = "DESCRIZIONE";
	$datasourcefield = "";
	
	//parameters
	$RecordCountResult = 0;
	$ColumnCountResult = 0;
	$output = array();
	$output["metaData"]["idProperty"] = "ID";
	$output["metaData"]["totalProperty"] = "total";
	$output["metaData"]["successProperty"] = "success";
	$output["metaData"]["root"] = "data";
	$output["message"] = "";
	$output["messagedebug"] = "";
		
	//Recupero layout 
	//Definizione datasource e datasourcetype e datasourcedbname
	$LayoutJson = array();
	$LayoutObjList = array();
	if (IsNumericID($LayoutId)){
		$sql = "SELECT * FROM " . $ExtJSDevDB . "layout WHERE ";
		if (is_numeric($LayoutId) == true){
			$sql = $sql .  "ID = " . $LayoutId ;
		} else {
			$sql = $sql .  "DESCNAME = '" . $LayoutId ."'";
		}
		$rs = $conn->Execute($sql);
		if ($rs !== false) {
			$LayoutId = $rs->fields['ID']; 
			$JsonAppo = $rs->fields['LAYOUTJSON']; 
			$LayoutJson = json_decode($JsonAppo,true);
			$FormName = $rs->fields['DESCNAME'];
			if ($datasource == '') $datasource = $rs->fields['DATASOURCE'];
			if ($datasourcefield == '') $datasourcefield = $rs->fields['DATASOURCEFIELD'];
			if ($datasourcetype == '') $datasourcetype = $rs->fields['DATASOURCETYPE'];
			if ($datasourcedbname == '') $datasourcedbname = $rs->fields['DATASOURCEDBNAME'];
			$rs->close();
			$CollectObjList = array();
			CollectOnObjectPropertyExist($LayoutJson,'datasourcefield');
			//HA SOLO IL NOME MANCANO IL RESTO DEGLI OGGETTI
			$LayoutObjList = object_clone($CollectObjList);
		}
	}
	
	//Recupero oggetto nella form  
	//Definizione datasource e datasourcetype
	$ObjJson = array();
	if (!IsNullOrEmptyString($objname) && IsNumericID($LayoutId)) {
		$ObjJson = ReturnOnObjectPropertyValue($LayoutJson,'name',$objname);
		if ($objname != 'Form00') $LayoutObjList = array();
		if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'LayoutId' . $LayoutId . "<br>\r\n";
			
		if ($conn->debug==1) echo('<b>obj->name</b>:' . $objname . "<br>\r\n");
		//if ($conn->debug==1) var_dump($ObjJson);
		
		if (isset($ObjJson["displayField"])		|| property_exists($ObjJson,"displayField")) {
			if ($conn->debug==1) echo('<b>obj->displayField</b>:' . $displayField . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["displayField"])) $displayField = $ObjJson["displayField"];
		}
		if (isset($ObjJson["valueField"])		|| property_exists($ObjJson,"valueField")) {
			if ($conn->debug==1) echo('<b>obj->valueField</b>:' . $valueField . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["valueField"])) $valueField = $ObjJson["valueField"];
		}
		if (isset($ObjJson["layouteditorid"])	|| property_exists($ObjJson,"layouteditorid")) {
			if ($conn->debug==1) echo('<b>obj->LayoutEditorId</b>:' . $LayoutEditorId . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["layouteditorid"])) $LayoutEditorId = $ObjJson["layouteditorid"];
		}
		if (isset($ObjJson["keyField"])			|| property_exists($ObjJson,"keyField")) {
			if ($conn->debug==1) echo('<b>obj->keyField</b>:' . $keyField . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["keyField"])) $keyField = $ObjJson["keyField"];
		}
		if (isset($ObjJson["datasourcefield"])	|| property_exists($ObjJson,"datasourcefield")) {
			if ($conn->debug==1) echo('<b>obj->datasourcefield</b>:' . $datasourcefield . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["datasourcefield"])) $datasourcefield = $ObjJson["datasourcefield"];
		}
		if (isset($ObjJson["datasource"])		|| property_exists($ObjJson,"datasource")) {
			if ($conn->debug==1) echo('<b>obj->datasource</b>:' . $datasource . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["datasource"])) $datasource = $ObjJson["datasource"];
		}
		if (isset($ObjJson["datasourcetype"])	|| property_exists($ObjJson,"datasourcetype")) {
			if ($conn->debug==1) echo('<b>obj->datasourcetype</b>:' . $datasource . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["datasourcetype"])) $datasourcetype = $ObjJson["datasourcetype"];
		}
		if (isset($ObjJson["datasourcedbname"]) || property_exists($ObjJson,"datasourcedbname")) {
			if ($conn->debug==1) echo('<b>obj->datasourcedbname</b>:' . $datasourcedbname . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["datasourcedbname"])) $datasourcedbname = $ObjJson["datasourcedbname"];
		}
	}
	
	//oggetto passato è una grid
	//Recupero campi aggiuntivi foreign in chiaro
	$LayoutEditorJson = array();
	if (IsNumericID($LayoutEditorId)){ 
		$sql = "SELECT * FROM " . $ExtJSDevDB . "layout WHERE ";
		if (is_numeric($LayoutEditorId) == true){
			$sql = $sql .  "ID = " . $LayoutEditorId ;
		} else {
			$sql = $sql .  "DESCNAME = '" . $LayoutEditorId ."'";
		}
		$rs = $conn->Execute($sql);
		if ($rs !== false) {
			$LayoutEditorId = $rs->fields['ID']; 
			
			$JsonAppo = $rs->fields['LAYOUTJSON']; 
			$LayoutEditorJson = json_decode($JsonAppo,true);
			$rs->close();
			$CollectObjList = array();
			CollectOnObjectPropertyExist($LayoutEditorJson,'datasourcefield');
			//HA SOLO IL NOME MANCANO IL RESTO DEGLI OGGETTI
			$LayoutObjList = object_clone($CollectObjList);
		}
	}
	
	//compilo la datasource con funzioni in parametri 
	if ($datasourcetype != 'CODE'){
	if ($conn->debug==1) echo('<b>datasource</b>:' . $datasource . "<br>\r\n");
		$datasource = ExecFuncInStringSQL($datasource);
		if ((Left($datasource, 1) == '"') && (Right($datasource, 1) == '"')) $datasource = Mid($datasource,1,Len($datasource)-2);
		if ((Left($datasource, 1) == "'") && (Right($datasource, 1) == "'")) $datasource = Mid($datasource,1,Len($datasource)-2);
		if ($conn->debug==1) echo('<b>datasource</b>:' . $datasource . "<br><br>\r\n");
	} 
	
	if ($conn->debug==1) echo('<b>datasourcefield</b>:' . $datasourcefield . "<br>\r\n");
	$datasourcefield = ExecFuncInStringSQL($datasourcefield);
	if ((Left($datasourcefield, 1) == '"') && (Right($datasourcefield, 1) == '"')) $datasourcefield = Mid($datasourcefield,1,Len($datasourcefield)-2);
	if ((Left($datasourcefield, 1) == "'") && (Right($datasourcefield, 1) == "'")) $datasourcefield = Mid($datasourcefield,1,Len($datasourcefield)-2);
	if ($conn->debug==1) echo('<b>datasourcefield</b>:' . $datasourcefield . "<br><br>\r\n");
	
	if ($conn->debug==1) echo('<b>valueField</b>:' . $valueField . "<br>\r\n");
	$valueField = ExecFuncInStringSQL($valueField);
	if ((Left($valueField, 1) == '"') && (Right($valueField, 1) == '"')) $valueField = Mid($valueField,1,Len($valueField)-2);
	if ((Left($valueField, 1) == "'") && (Right($valueField, 1) == "'")) $valueField = Mid($valueField,1,Len($valueField)-2);
	if ($conn->debug==1) echo('<b>valueField</b>:' . $valueField . "<br><br>\r\n");
	
	if ($conn->debug==1) echo('<b>displayField</b>:' . $displayField . "<br>\r\n");
	$displayField = ExecFuncInStringSQL($displayField);
	if ((Left($displayField, 1) == '"') && (Right($displayField, 1) == '"')) $displayField = Mid($displayField,1,Len($displayField)-2);
	if ((Left($displayField, 1) == "'") && (Right($displayField, 1) == "'")) $displayField = Mid($displayField,1,Len($displayField)-2);
	if ($conn->debug==1) echo('<b>displayField</b>:' . $displayField . "<br><br>\r\n");
	
	if ($conn->debug==1) echo('<b>datawhere</b>:' . $datawhere . "<br>\r\n");
	$datawhere = ExecFuncInStringSQL($datawhere);
	if ((Left($datawhere, 1) == '"') && (Right($datawhere, 1) == '"')) $datawhere = Mid($datawhere,1,Len($datawhere)-2);
	if ((Left($datawhere, 1) == "'") && (Right($datawhere, 1) == "'")) $datawhere = Mid($datawhere,1,Len($datawhere)-2);
	if ($conn->debug==1) echo('<b>datawhere</b>:' . $datawhere . "<br><br>\r\n");
	
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'datasourcetype:' . $datasourcetype . "<br>\r\n";
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'datasource:' . $datasource . "<br>\r\n";
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'datasourcedbnamedef:' . $dbname . "<br>\r\n";
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'datasourcedbname:' . $datasourcedbname . "<br>\r\n";
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'datawhere:' . $datawhere . "<br>\r\n";
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'datasourcefield:' . $datasourcefield . "<br>\r\n";
	
	//Esecuzione datasource in base al datasourcetype
	if ($conn->debug==1) echo('<b>datasourcetype</b>:' . $datasourcetype . "<br>\r\n");
	/*
	$dbHostname = 'localhost';
	$dbUser = 'root';
	$dbPass = '';
	$dbDatabase = 'extjsdev';
	$dbTable = 'mytable';
	*/
	
	/*
	DAFARE
	include "adodb/pivottable.inc.php"; 
    $sql = PivotTableSQL( 
        $gDB,                                      # adodb connection 
        'products p ,categories c ,suppliers s',   # tables 
        'SupplierName',                             # rows (multiple fields allowed) 
        'CategoryName',                            # column to pivot on 
        'p.CategoryID = c.CategoryID and s.SupplierID= p.SupplierID' # joins/where 
    ); 
	
	$sql = PivotTableSQL( 
	$gDB, # adodb connection 
	'products p ,categories c ,suppliers s', # tables 
	'SupplierName', # rows (multiple fields allowed) 
	array( # column ranges 
		' 0 ' => 'UnitsInStock <= 0', 
		"1 to 5" => '0 < UnitsInStock and UnitsInStock <= 5', 
		"6 to 10" => '5 < UnitsInStock and UnitsInStock <= 10', 
		"11 to 15" => '10 < UnitsInStock and UnitsInStock <= 15', 
		"16+" => '15 < UnitsInStock' 
	), 
	' p.CategoryID = c.CategoryID and s.SupplierID= p.SupplierID', # joins/where 
	'UnitsInStock', # sum this field 
	'Sum ' # sum label prefix 
	); 
	*/

	define('KEYS_SEPARATOR', '#_#');
	define('KEY_GRAND_TOTAL', '#mzgrandtotal#');
	$CONFIG['ERROR_REPORTING'] = E_ALL ^ E_DEPRECATED; 

	$result = array();
	$output=array();
	$req = json_decode($HTTP_RAW_POST_DATA, true);
	
	$leftAxis = new Axis($conn, $datasource, $req['leftAxis']);
	$leftItems = $leftAxis->process();
	
	$topAxis = new Axis($conn, $datasource, $req['topAxis']);
	$topItems = $topAxis->process();
	
	$results = new Results($conn, $datasource, $req['aggregate']);
	
	$results->add(array(
		'key'           => KEY_GRAND_TOTAL,
		'fields'        => array()
	), array(
		'key'           => KEY_GRAND_TOTAL,
		'fields'        => array()
	));
	
	foreach($leftItems as $li){
		$results->add($li, array(
			'key'           => KEY_GRAND_TOTAL,
			'fields'        => array()
		));
		foreach($topItems as $ti){
			$results->add($li, $ti);
		}
	}

	foreach($topItems as $ti){
		$results->add(array(
			'key'           => KEY_GRAND_TOTAL,
			'fields'        => array()
		), $ti);
	}
	$resultItems = $results->calculate();
	
	// do some cleanup
	foreach($leftItems as &$item){
		unset($item['level']);
		unset($item['fields']);
	}
	foreach($topItems as &$item){
		unset($item['level']);
		unset($item['fields']);
	}
	foreach($resultItems as &$item){
		unset($item['leftFields']);
		unset($item['topFields']);
	}
	
	$output = array(
		'success'   => true,
		'leftAxis'  => $leftItems,
		'topAxis'   => $topItems,
		'results'   => $resultItems
	);
 
	$conn->close();
	echo Array2JSON($output);


class Results {
    private $conn;
    private $table;
    private $dimensions = array();
    public $items = array();
    
    public function __construct($conn, $table, $dimensions){
        $this->conn = $conn;
        $this->table = $table;
        $this->dimensions = $dimensions;
    }
    
    public function add($left, $top){
        $this->items[] = array(
            'leftKey'       => $left['key'],
            'topKey'        => $top['key'],
            'leftFields'    => $left['fields'],
            'topFields'     => $top['fields'],
            'values'        => array()
        );
    }
    
    public function calculate(){
        foreach($this->items as &$item){
            $sqlSelect = array();
            
            foreach($this->dimensions as $dimension){
                $sqlSelect[] = "{$dimension['aggregator']}({$dimension['dataIndex']}) as {$dimension['id']}";
            }

            $sql = "select " . join(', ', $sqlSelect) . " from {$this->table}";

            $sqlWhere = array();
            
            foreach($item['leftFields'] as $fKey => $fValue){
                $sqlWhere[] = "{$fKey} = '{$fValue}'";
            }

            foreach($item['topFields'] as $fKey => $fValue){
                $sqlWhere[] = "{$fKey} = '{$fValue}'";
                
            }
            if(count($sqlWhere) > 0){
                $sql .= ' WHERE ' . join(' AND ', $sqlWhere);
            }
			$rs = $this->conn->Execute($sql);
            if($rs){
                $row = $rs->FetchRow();
            }
            
            foreach($this->dimensions as $dimension){
                $item['values'][$dimension['id']] = $row ? $row[$dimension['id']] : 0;
            }
        }
        
        return $this->items;
    }
}

class Axis{
    private $conn;
    private $table;
    private $dimensions = array();
    public $items = array();
    
    public function __construct($conn, $table, $dimensions){
        $this->conn = $conn;
        $this->table = $table;
        $this->dimensions = $dimensions;
    }
    
    public function process(){
        foreach($this->dimensions as $level => $dimension){
            $values = $this->getUniqueValues($dimension);
            
            if($level == 0){
                foreach($values as $v){
                    $fields = array();
                    $fields[$dimension['dataIndex']] = $v;
                    $this->items[] = array(
                        'level'         => 0,
                        'key'           => crc32($v),
                        'value'         => $v,
                        'name'          => $v,
                        'dimensionId'   => $dimension['id'],
                        'fields'        => $fields
                    );
                }
            }else{
                $items = $this->getItemsByLevel($level - 1);
                
                foreach($items as $item){
                    foreach($values as $v){
                        $fields = $item['fields'];
                        
                        $fields[$dimension['dataIndex']] = $v;
                        $this->items[] = array(
                            'level'         => $level,
                            'key'           => $item['key'] . KEYS_SEPARATOR . crc32($v),
                            'value'         => $v,
                            'name'          => $v,
                            'dimensionId'   => $dimension['id'],
                            'fields'        => $fields
                        );
                    }
                }
            }
        }
        
        return $this->items;
    }
    
    private function getUniqueValues($dimension){
        $sql = "select distinct {$dimension['dataIndex']} from {$this->table}";
        if($dimension['sortable']){
            $sql .= " order by {$dimension['dataIndex']} {$dimension['direction']}";
        }
		$rs = $this->conn->Execute($sql);
        $rows = array();
        while ($row = $rs->FetchRow()) {
            $rows[] = $row[$dimension['dataIndex']];
        }
        
        return $rows;
    }
    
    private function getItemsByLevel($level){
        $items = array();
        
        foreach($this->items as $item){
            if($item['level'] == $level){
                $items[] = $item;
            }
        }
        
        return $items;
    }
}

?>
