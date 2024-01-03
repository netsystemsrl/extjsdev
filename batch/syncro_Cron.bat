schtasks /CREATE /tn "ExtJsDev" /tr "D:\EasyPHP\eds-www\batch\wget http://localhost/batch/schedule.php" /sc minute /mo 5
