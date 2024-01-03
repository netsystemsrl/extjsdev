killall anviz-server
service gearman-job-server restart
/var/www/html/includes/PHPPersonal/anviz/anviz-server &
wget -qO- "http://localhost/includes/io/Schedule.php?dbname=manager&username=scheduler&password=a135792468" &> /dev/null