<?php
	$fileName = $_POST['filename'].'.xml';
	$fileContent = urldecode($_POST['content']);
	header('Content-Length: '.strlen($fileContent));
	header("Content-Type:   application/vnd.ms-excel; charset=utf-8");
	header("Content-Disposition: attachment; filename=\"$fileName\"");
	header("Expires: 0");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
	header("Cache-Control: private", false);
	echo $fileContent;
?>