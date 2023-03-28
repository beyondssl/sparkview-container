# SparkView by beyond SSL
<img alt="beyond SSL GmbH" src="https://repository.beyondssl.com/images/beyondssl-200.svg" width="200">

Current repository of SparkView for Docker, globally distributed by [beyond SSL GmbH](https://www.beyondssl.com/).

## About SparkView
SparkView is a smart and easy remote access solution that works from any device with a browser.

No VPN client needs to be installed, simply deploy the Docker image in your DMZ.

Access VMs, desktops, servers or applications anytime and from anywhere, without complex and costly client roll-outs or user management.

**Key benefits of SparkView**
* TLS security (SSL via RDP) and authentication on network level (NLA)
* No data transmitted between client and application, just images
* One single point of administration
* Easy local printing, no installation and handling of printer drivers needed
* Very fast and easy file transfer (drag & drop)
* Copy and paste between the local client and remote applications
* Supports Radius, SAML, SSO, 2FA
* Flexible, stable and highly scalable (> 10k users)
* RDP, SSH, VNC and Telnet protocols are supported
* No Java, No Flash, No ActiveX, No Plugin
* and more

Check out this image for a first look and talk to us to learn about all the features and solutions offered by beyond SSL and SparkView (e.g. integrations with F5 and Pulse Secure)

For more information, please [click here](https://www.beyondssl.com/en/products/sparkview/).

## Possible tags
* [latest](https://github.com/beyondssl/sparkview/blob/master/Dockerfile)

## Dependencies
* [OpenJDK 21 slim buster](https://github.com/docker-library/openjdk/blob/6e380564c7664da5698bbff2a30934f9f6ca23ff/21/jdk/slim-buster/Dockerfile)

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
  lic:

services:
  sparkview:
    image: 'beyondssl/sparkview:latest'
    volumes:
      - 'data:/usr/local/bin/SparkGateway/data'
      - 'conf:/usr/local/bin/SparkGateway/conf'
      - 'keystore:/usr/local/bin/SparkGateway/keystore'
      - 'lic:/usr/local/bin/SparkGateway/lic'
    ports:
      - '80:80'
      - '443:443'
```