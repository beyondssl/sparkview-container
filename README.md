# SparkView
Current repository of SparkView for Docker, globally distributed by [beyond SSL GmbH](https://www.beyondssl.com/).

## Possible tags
* [latest, 5.9, 5.9.0](https://github.com/beyondssl/sparkview/blob/master/Dockerfile)

## Dependencies
* [OpenJDK 14.0.2 buster](https://github.com/docker-library/openjdk/blob/83fbf16d99f4094df192b4f07909b473ad1d8392/14/jdk/buster/Dockerfile)

## Quick usage guide
### For use with docker-compose
Just run `docker-compose up -d` from the same directory, where the `docker-compose.yaml` exists or reference to it, using the `-f` flag.

### For use with Docker CLI
The following command will lead to a working instance:<br>
`docker run -p 80:80 beyondssl/sparkview`. Use `-d` flag for detached mode.

## Information
For quick starts via docker-compose, the following docker-compose.yaml is used by default:
```
---
version: '3'

volumes:
  data:
  conf:
  keystore:

services:
  sparkview:
    image: 'beyondssl/sparkview:latest'
    volumes:
      - 'data:/usr/local/bin/SparkGateway/data'
      - 'conf:/usr/local/bin/SparkGateway/conf'
      - 'keystore:/usr/local/bin/SparkGateway/keystore'
    environment:
      REMOTE_MANAGEMENT: "true"
      REMOTE_PASSWORD: "changeme"
      SSH: "true"
    ports:
      - '80:80'
      - '443:443'
```

All specified environmental variables:

* `{REMOTE_MANAGEMENT}`<br>**boolean**<br>default value: `true`<br>Allows remote access to SparkView, writes the `remoteManage = true/false` parameter to gateway.conf
* `{REMOTE_PASSWORD}`<br>**string**<br>default value: `changeme`<br>Sets the default password for access, **should definitely be changed**, writes the `password = string` parameter to gateway.conf
* `{SSH}`<br>**boolean**<br>default value: `true`<br>Allows ssh access to SparkView, writes the `ssh = true/false` parameter to gateway.conf