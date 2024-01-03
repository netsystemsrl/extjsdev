<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
	<style>
	/*
	table {
	  width:100%;
	}
	table, th, td {
	  border: 1px solid black;
	  border-collapse: collapse;
	}
	th, td {
	  padding: 15px;
	  text-align: left;
	}
	table#t01 tr:nth-child(even) {
	  background-color: #eee;
	}
	table#t01 tr:nth-child(odd) {
	 background-color: #fff;
	}
	table#t01 th {
	  background-color: black;
	  color: white;
	}
	*/
	</style>
</head>
<body>
	<div class="jumbotron jumbotron-fluid">
	  <div class="container">
		<h1 class="display-4">Completa il questionario</h1>
	  </div>
	</div>
	<div class="container">
<?php	
	include('../includes/var.php');	
	$CollectObjList = array();
	
	$conn = ADONewConnection('mysqli');
	$conn->debug =0;
	$conn->PConnect("127.0.0.1",'root','xW6hy6V1u9','netsystem');
	$conn->EXECUTE("SET NAMES 'utf8'");
	$conn->EXECUTE("SET CHARACTER SET 'utf8'");
	$conn->EXECUTE("SET lc_time_names = 'it_IT'");
	
	$SurveyID = 0;
	$AzID = 0;
		
	if (!empty($_GET)){
		$SurveyID = $_GET['SURVEYID'];
		$AzID = $_GET['AZIENDAID'];
	}
	if (!empty($_POST)){
		//SALVATAGGIO
		$conn->debug = 0;
		foreach($_POST as $key => $value){
			$Appo = array();
			$Appo['ANSWER'] = $value;
			$conn->AutoExecute("aaasurveydatadectail", $Appo, 'UPDATE', 'ID = ' .$key );
		}
		echo ('<div class="jumbotron jumbotron-fluid">');
		echo ('  <div class="container">');
		echo ('	<h3 class="display-4">Grazie!</h3>');
		echo ('  </div>');
		echo ('</div>');
	}else{
		$Survey = WFVALUEDLOOKUP('*', 'aaasurvey', "ID = " . $SurveyID);
		echo ($Survey['PRESENTAZIONE']);
		
		//aaasurvey.CT_TABLE, aaasurvey.CT_ID, 
		$sql = "SELECT aaasurvey.DESCRIZIONE, 
						aaasurveydatadectail.ID, aaasurveydectail.GROUPASK, aaasurveydectail.ASK 
				FROM aaasurvey  
					INNER JOIN aaasurveydectail ON aaasurvey.ID = aaasurveydectail.CT_AAASURVEY 
					INNER JOIN aaasurveydatadectail ON aaasurveydectail.ID = aaasurveydatadectail.CT_AAASURVEYDECTAIL 
					INNER JOIN aaasurveydata ON aaasurveydata.ID = aaasurveydatadectail.CT_AAASURVEYDATA 
				WHERE aaasurvey.ID = " . $SurveyID . "  
						AND aaasurveydata.CT_ID = " . $AzID . " 
				ORDER BY aaasurveydectail.GROUPASK";
		$RsSurvey = $conn->Execute($sql);
		
		$GroupOld = '';
		
		echo('<form method="post" action="index.php">');
		
		while (!$RsSurvey->EOF) {
			if ($RsSurvey->fields['GROUPASK'] != $GroupOld){
				if ($GroupOld != '') {
					echo ('</div></div><br>'); //close card div
				}
				$GroupOld = $RsSurvey->fields['GROUPASK'];
				echo('<div class="card"><div class="card-body"><h5 class="card-title">' . $GroupOld . '</h5>');
			}
			echo ('<div class="form-group">');
			echo ('<label>' . $RsSurvey->fields['ASK'] . '</label>');
			echo ('<input type="text" class="form-control" name="' . $RsSurvey->fields['ID'] . '" value="">');
			echo ('</div>');
			$RsSurvey->MoveNext();
		}
		$RsSurvey->close();
		echo ('</div></div><br>'); //close card div
		
		echo('<input type="submit" class="btn btn-info btn-lg btn-block" name="submit" value="Invia - Submit">'); 
		echo('</form>');
	}
	
	$conn->close(); 
?>
</div>
<br>
