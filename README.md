# SparkView
Current repository of SparkView for Docker, globally distributed by beyond SSL GmbH.

## Dependencies
* OpenJDK 14 buster

## Quick usage guide
### For use with docker-compose
Just run `docker-compose up -d` from the same directory, where the `docker-compose.yaml` exists or reference to it, using the `-f` flag.

### For use with Docker CLI
The following command will lead to a working instance:<br>
`docker run -p 80:80 beyondssl/sparkview`. Use `-d` flag for detached mode.