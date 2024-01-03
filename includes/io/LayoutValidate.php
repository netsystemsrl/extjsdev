 <?php
	require_once('../var.php');
//	error_reporting(E_ALL);
//	ini_set('display_errors', 1);
//	$conn->debug=1; 
			
	WFSendLOG("LayoutValidate:","START");

	$output = array();
	$FormValidate = '';
	
	$LayoutId = 0;
	$LayoutId = isset($_POST["layoutid"]) ? $_POST["layoutid"] : $LayoutId;
	$LayoutId = isset($_GET["layoutid"]) ? $_GET["layoutid"] : $LayoutId;
	
	if (($LayoutId != '') && ($LayoutId != '0')){
		if (is_numeric($LayoutId) == true){
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layout WHERE ID = " . $LayoutId ;
		} else {
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layout WHERE DESCNAME = '" . $LayoutId ."'";
		}
		$rs = $conn->Execute($sql);
		if ($rs !== false) {
			$FormValidate = $rs->fields['VALIDATEJSON'];
			$rs->close();
			echo ($FormValidate);
		}
	}
	
	$conn->close();
?>