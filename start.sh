#!/bin/bash

PID_FILE="appservice.pid"

node ./bin/www >access.log 2>&1 &

echo $! > $PID_FILE

echo "app run success pid is" + $!