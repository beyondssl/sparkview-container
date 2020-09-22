FROM openjdk:14.0.2-slim-buster

RUN mkdir /usr/local/bin/SparkGateway

COPY ./SparkView /usr/local/bin/SparkGateway/

EXPOSE 80
EXPOSE 443

WORKDIR /usr/local/bin/SparkGateway

RUN mkdir conf keystore lic
RUN mv gateway.conf ./conf
RUN mv keystore.jks ./keystore
RUN echo "No license enabled" >> ./lic/license.dat
RUN mv ./lic/license.dat ./lic/license
RUN ln -s ./conf/gateway.conf gateway.conf
RUN ln -s ./keystore/keystore.jks keystore.jks
RUN ln -s ./lic/license license

VOLUME /usr/local/bin/SparkGateway/conf
VOLUME /usr/local/bin/SparkGateway/data
VOLUME /usr/local/bin/SparkGateway/keystore
VOLUME /usr/local/bin/SparkGateway/lic

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
