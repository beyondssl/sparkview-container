#!/bin/sh
#
# SparkGateway   Startup script for SparkGateway HTTP & WebSocket Server
# chkconfig: - 85 15
# description: HTTP and WebSocket server, from Remote Spark Corp.
# processname: SparkGateway

### BEGIN INIT INFO
# Provides:          SparkGateway
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: SparkGateway initscript
### END INIT INFO

# Source function library. use  /lib/lsb/init-functions instead on Debian
. /etc/rc.d/init.d/functions


##############################################################################
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
##############################################################################
#
# Small shell script to show how to start/stop SparkGateway using jsvc, this is 
# changed from Tomcat5.sh, please check original file for more information.
#
# Adapt the following lines to your configuration

#WARNING: Don't use this script if Tomcat is also running on same machine.

JAVA_HOME=/usr/java/default
SPARK_HOME=/usr/local/bin/SparkGateway
DAEMON_HOME=/usr/local/bin/SparkGateway

#uncomment this line if you want SparkGatway running under specific user, 
#default is current user, also add 	-user $SPARK_USER for jsvc option
#SPARK_USER=spark

# for multi instances adapt those lines.
TMP_DIR=/var/tmp
PID_FILE=/var/run/jsvc.pid
CLASSPATH=\
$JAVA_HOME/lib/tools.jar:\
$SPARK_HOME/commons-daemon.jar:\
$SPARK_HOME/SparkGateway.jar

case "$1" in
  start)
    #
    # Start Tomcat
    #
    $DAEMON_HOME/jsvc $JSVC_OPTS \
	-jvm server \
    -home $JAVA_HOME \
    -Djava.io.tmpdir=$TMP_DIR \
    -wait 10 \
    -pidfile $PID_FILE \
    -outfile $SPARK_HOME/logs/gateway.out \
    -errfile '&1' \
    -cp $CLASSPATH \
    com.toremote.gateway.SparkGateway \
	-c=$SPARK_HOME/gateway.conf
    #
    # To get a verbose JVM
    #-verbose \
    # To get a debug of jsvc.
    #-debug \
    exit $?
    ;;

  stop)
    #
    # Stop Tomcat
    #
    $DAEMON_HOME/jsvc $JSVC_OPTS \
    -stop \
    -pidfile $PID_FILE \
	-cp $CLASSPATH \
    com.toremote.gateway.SparkGateway
    exit $?
    ;;

  *)
    echo "Usage SparkGateway.sh start/stop"
    exit 1;;
esac
