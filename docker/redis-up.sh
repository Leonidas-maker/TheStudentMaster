#!/bin/sh
#Script to startup Redis Server.

#Reading secret in a temporary variable.
REDIS_PASSWORD=`cat /run/secrets/tsm_redis_password`

#Start Redis server
redis-server --requirepass "$REDIS_PASSWORD"  