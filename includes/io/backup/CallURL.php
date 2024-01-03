<?php	
	include('../var.php');
//	error_reporting(E_ALL);
//	ini_set('display_errors', 1);
//	$conn->debug=1; 
//	WFSetDebug(true);
			
	WFSendLOG("CallFile:","START");
	
	if (strrpos(strtoupper($url),'?') > 0){
		foreach ($data as $key => $value) {
			if (strpos($value,',') > 0){
				//array da passare
				$appo = explode(',',$value);
				foreach ($appo as $sub){
					$url = $url . "&" . $key . "=" . $sub;
				}
			}else{
				$url = $url . "&" . $key . "=" . $value;
			}
		}
		if ($conn->debug==1) {
			echo('<b>url:</b>'); echo($url);
		}else{
			header("Content-type:application/pdf");
			//header("Content-Disposition:attachment;filename='downloaded.pdf'");
			echo file_get_contents($url);
		}
	}else{
		if ($conn->debug==1) {
			echo('<b>data:</b>'); var_dump($data);
			echo('<b>url:</b>'); echo($url);
		}else{
			do_post_request($url,$data);
		}
	}
?>