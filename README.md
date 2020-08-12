# SparkView
Current repository of SparkView for Docker, globally distributed by [beyond SSL GmbH](https://www.beyondssl.com/).

## Possible tags
* [latest, 5.9, 5.9.0](https://github.com/beyondssl/sparkview/blob/master/Dockerfile)

## Dependencies
* OpenJDK 14.0.2 buster

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

All sepcified environmental variables:

* `{REMOTE_MANAGEMENT}` - boolean
* `{REMOTE_PASSWORD}` - string
* `{SSH}` - boolean