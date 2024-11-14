#!/bin/bash
# Jimenez Mendoza Diego Alejandro
# Custom Ping Test ETN921
# data management
ping -c 3 -q -n "$1" > p0.txt #Search cut for string chars
cut -f2 -s -d"=" p0.txt > p1.txt
echo "$1,$(cut -f1 -d"/" p1.txt),$(cut -f2 -d"/" p1.txt),$(cut -f3 -d"/" p1.txt)" >> Report.txt > p3.txt
./src/scripts/db_load.sh
rm p?.*
more Report.txt