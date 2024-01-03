find . -type f -name "*.eml" -exec rm -f {} \;
find . -type f -name "*.p7s" -exec rm -f {} \;

find . -type f -name "*_daticert.xml" -exec rm -f {} \;
find . -type f -name "*_MC_00?.xml" -exec rm -f {} \;
find . -type f -name "*_NS_00?.xml" -exec rm -f {} \;
find . -type f -name "*_RC_00?.xml" -exec rm -f {} \;

find . -type f -path '*temp/*' -name "*.zip" -exec rm -f {} \;

find . -type f -path '*old/*' -name "*.*" -exec rm -f {} \;

find . -type f -size 0  -exec rm -f {} \;

find . -type f -name "*.log" -exec rm -f {} \;
find . -type f -name "DataRead.txt" -exec rm -f {} \;

# find . -type d -name "repositorycom" -exec cp /var/www/html/archive/empty/repositorycom/* {} \;