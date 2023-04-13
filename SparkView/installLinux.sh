#!/bin/sh

# Colors
#-----------

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'


# Check if Java is installed
#-----------

if ! [ -n `which java` ]; then
	echo "${RED}~~~~~~~~~~~~~~~~~~~~~~~${NC}"
	echo "${RED}⚠  No Java detected! ⚠${NC}"
	echo "${RED}~~~~~~~~~~~~~~~~~~~~~~~${NC}"
	echo "In order to run SparkView, Java must be installed on your device. Please install Java to continue: https://jdk.java.net. It is best to use the latest production version."
	exit 0
fi


# Get new SparkView release
#-----------

cd /usr/local/bin
wget -q --no-check-certificate https://www.remotespark.com/view/SparkGateway.zip
unzip -q SparkGateway.zip
rm SparkGateway.zip

VERSION=$(head -n 1 ./SparkGateway/html/release.txt | tr -d '\r')

echo "${GREEN}SparkView was downloaded successfully (${BLUE}$VERSION${GREEN})!${NC}"


# Create service file (systemd)
#-----------

echo "Creating service file ${BLUE}/etc/systemd/system/SparkView.service${NC} …"

CURRUSER="$USER"

cat << EOF > /etc/systemd/system/SparkView.service
[Unit]
Description=SparkView Service
After=network.target
[Service]
User=$CURRUSER
WorkingDirectory=/usr/local/bin/SparkGateway
ExecStart=java -jar /usr/local/bin/SparkGateway/SparkGateway.jar
SuccessExitStatus=143
[Install]
WantedBy=multi-user.target
EOF

echo "Reloading service daemon …"
systemctl daemon-reload

echo "Enabling SparkView service …"
systemctl enable SparkView

echo "Starting SparkView …"
systemctl start SparkView
echo "${GREEN}SparkView was launched successfully!${NC}"
