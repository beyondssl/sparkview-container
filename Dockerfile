FROM openjdk:21-slim-buster

RUN mkdir /usr/local/bin/SparkGateway

COPY ./SparkView /usr/local/bin/SparkGateway/

EXPOSE 80
EXPOSE 443

WORKDIR /usr/local/bin/SparkGateway

RUN mkdir conf keystore
RUN mv gateway.conf ./conf
RUN mv keystore.jks ./keystore
RUN ln -s ./conf/gateway.conf gateway.conf
RUN ln -s ./keystore/keystore.jks keystore.jks

VOLUME /usr/local/bin/SparkGateway/conf
VOLUME /usr/local/bin/SparkGateway/data
VOLUME /usr/local/bin/SparkGateway/keystore
VOLUME /usr/local/bin/SparkGateway/logs

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]