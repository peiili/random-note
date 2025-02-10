#!/bin/bash
rsync -r --exclude=node_modules ./* aliyun:~/blog/