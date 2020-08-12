#!/bin/sh

## modify configuration
CONFIG_FILE="/usr/local/bin/SparkGateway/conf/gateway.conf"
if [ "${REMOTE_MANAGEMENT}" != "" -a "${REMOTE_PASSWORD}" != "" ]
then
  if grep -q remoteManage "${CONFIG_FILE}"
  then
    sed -i "s/^remoteManage.*\$/remoteManage = ${REMOTE_MANAGEMENT}/" "${CONFIG_FILE}"
  else
    echo "remoteManage = ${REMOTE_MANAGEMENT}" >> "${CONFIG_FILE}"
  fi

  if grep -q ^password "${CONFIG_FILE}"
  then
    sed -i "s/^password.*\$/password = ${REMOTE_PASSWORD}/" "${CONFIG_FILE}"
  else
    echo "password = ${REMOTE_PASSWORD}" >> "${CONFIG_FILE}"
  fi
fi


if [ "${SSH}" != "" ]
then
  if grep -q ssh "${CONFIG_FILE}"
  then
    sed -i "s/^ssh.*\$/ssh = ${SSH}/" "${CONFIG_FILE}"
  else
    echo "ssh = ${SSH}" >> "${CONFIG_FILE}"
  fi
fi

java -jar SparkGateway.jar
