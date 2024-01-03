<?php
include_once ('amazon_top.php');

try {
	if ($correctFeedErrors) {
		include ('amazon_feedErrors.php');
		//error_log(date("Y-m-d H:i:s",time())." cron: dopo amazon feed Errors \n", 3, LOGFILE);
	}
} catch (Throwable $e) {
	error_log(date("Y-m-d H:i:s",time())." cron: erros ".$e->getMessage() , 3, LOGFILE);
	error_log("The exception was created in file ".$e->getFile()." on line: " . $e->getLine() , 3, LOGFILE);
    echo 'Caught Throwable: '.$e->getMessage()."\n";
	echo "The exception was created in file ".$e->getFile()." on line: " . $e->getLine();
}

try {
	include ('amazon_productSyncro.php');
	//error_log(date("Y-m-d H:i:s",time())." cron: dopo amazon Syncro Prods \n", 3, LOGFILE);
	include ('amazon_productSyncroQuantity.php');
	//error_log(date("Y-m-d H:i:s",time())." cron: dopo amazon Syncro Quantity \n", 3, LOGFILE);
	include ('amazon_productSyncroPrices.php');
	//error_log(date("Y-m-d H:i:s",time())." cron: dopo amazon Syncro Prices \n", 3, LOGFILE);
	include ('amazon_productSyncroImages.php');
	//error_log(date("Y-m-d H:i:s",time())." cron: dopo amazon Syncro Images \n", 3, LOGFILE);
} catch (Throwable $e) {
	error_log(date("Y-m-d H:i:s",time())." cron: erros ".$e->getMessage() , 3, LOGFILE);
    error_log("The exception was created in file ".$e->getFile()." on line: " . $e->getLine() , 3, LOGFILE);
	echo 'Caught Throwable: '.$e->getMessage()."\n";
	echo "The exception was created in file ".$e->getFile()." on line: " . $e->getLine();
}
?>