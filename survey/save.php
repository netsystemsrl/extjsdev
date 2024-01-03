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
		<h1 class="display-4">Completa le Info </h1>
		<p class="lead">bla bla bla</p>
	  </div>
	</div>
	<div class="container">
<?php	
	include('../includes/var.php');	
	$CollectObjList = array();
	
	$conn = ADONewConnection('mysqli');
	$conn->debug = 0;
	$conn->PConnect("127.0.0.1",'root','xW6hy6V1u9','netsystem');
	$conn->EXECUTE("SET NAMES 'utf8'");
	$conn->EXECUTE("SET CHARACTER SET 'utf8'");
	$conn->EXECUTE("SET lc_time_names = 'it_IT'");
	
	$SurveyID = 2;
	//aaasurvey.CT_TABLE, aaasurvey.CT_ID, 
	$sql = "SELECT aaasurvey.DESCRIZIONE, 
					aaasurveydectail.ID, aaasurveydectail.GROUPASK, aaasurveydectail.ASK 
			FROM aaasurvey 
				INNER JOIN aaasurveydectail ON aaasurvey.ID = aaasurveydectail.CT_AAASURVEY
			WHERE aaasurvey.ID = " . $SurveyID . " 
			ORDER BY aaasurveydectail.GROUPASK";
	$RsSurvey = $conn->Execute($sql);
	
	$GroupOld = '';
	
	echo('<form method="post" action="save.php">');
	
	while (!$RsSurvey->EOF) {
		if ($RsSurvey->fields['GROUPASK'] != $GroupOld){
			if ($GroupOld != '') {
				//echo('</table>' . CRLF);
				echo ('</div></div><br>'); //close card div
			}
			$GroupOld = $RsSurvey->fields['GROUPASK'];
			//echo( CRLF);
			//echo('<h2>' . $GroupOld . '</h2>');
			echo('<div class="card"><div class="card-body"><h5 class="card-title">' . $GroupOld . '</h5>');
			//echo('<table class="table">' . CRLF);
			//echo('<caption>' . $GroupOld . '</caption>' . CRLF);
		}
		//echo('<tr>' . CRLF);
			//echo('<th scope="row">' . $RsSurvey->fields['ASK'] . '</th>' . CRLF);
			echo ('<div class="form-group">');
			echo ('<label>' . $RsSurvey->fields['ASK'] . '</label>');
			//echo('<th>' . '<input type="text" name="' . $RsSurvey->fields['ID'] . '" value="">' . '</th>' . CRLF);
			echo ('<input type="text" class="form-control" name="' . $RsSurvey->fields['ID'] . '" value="">');
			echo ('</div>');
		//echo('</tr>' . CRLF);
		$RsSurvey->MoveNext();
	}
	$RsSurvey->close();
	//echo('</table>' . CRLF);
	echo ('</div></div><br>'); //close card div
	echo('<input type="submit" class="btn btn-info btn-lg btn-block" name="submit" value="Invia - Submit">'); 
	echo('</form>');

	$conn->close(); 
?>
</div>
<br>
<div class="jumbotron jumbotron-fluid">
  <div class="container">
	<h3 class="display-4">Grazie!</h3>
	<!--
	<p class="lead">bla bla bla</p>
	-->
  </div>
</div>
