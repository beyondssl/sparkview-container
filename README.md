# SparkView
![beyond SSL](https://www.beyondssl.com/beyondssl-logo-small-color.png)

Current repository of SparkView for Docker, globally distributed by [beyond SSL GmbH](https://www.beyondssl.com/).

## Possible tags
* [latest](https://github.com/beyondssl/sparkview/blob/master/Dockerfile)
* [5.9.0](https://github.com/beyondssl/sparkview/blob/master/Dockerfile)

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

## About SparkView
SparkView was developed by RemoteSpark, a pioneer in the world of HTML5. It is a smart and easy remote access solution that reduces complexity, allows your employees to work effectively and, therefore, helps to better position your company within the market in the long run. The secure remote access solution works with every browser, no VPN client needs to be installed and works using a server installed in the DMZ. It is also scalable for a great number of users (>10,000). Access your VMs, desktops, servers or applications anytime and from anywhere.

**Benefits of SparkView**
* Secure remote access to applications, desktops and servers from any device via browser
* No installation on clients or target systems
* A central point of administration and authorization
* HTML5-technology
* Flexible, stable and highly scalable
* Very low support effort
* Optional integration of multi-factor authentication
* Supports common protocols like RDP, SSH, Telnet and VNC
* No Java, No Flash, No ActiveX, No Plugin, No Rollout

[Click here](https://www.beyondssl.com/en/products/sparkview/) for more information on SparkView.