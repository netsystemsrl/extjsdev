<?php
	require_once('includes/PHPMailer/PHPMailer/PHPMailerAutoload.php');
	$mail = new PHPMailer();
	$mail->IsSMTP();
	$mail->SMTPDebug = 0;
	$mail->SMTPAuth = 'login';
	$mail->SMTPSecure = 'ssl';
	$mail->Host = 'smtp.gmail.com';
	$mail->Port = 465;
	$mail->Username = 'example@gmail.com';
	$mail->Password = 'somepassword';
	$mail->SetFrom('example@gmail.com', 'Example');
	$mail->Subject = 'The subject';
	$mail->Body = 'The content';
	$mail->IsHTML(true);
	$mail->AddAddress('receiver@gmail.com');
	$mail->Send();
?>