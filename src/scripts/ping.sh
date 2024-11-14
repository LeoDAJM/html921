#!/bin/bash
ping -c 3 -q -n "$1" > p0.txt #Search cut for string chars
cut -f2 -s -d"=" p0.txt > p1.txt
echo "$1,$(cut -f1 -d"/" p1.txt),$(cut -f2 -d"/" p1.txt),$(cut -f3 -d"/" p1.txt)" >> Report.txt > p3.txt
echo -e "$1\nMin: $(cut -f1 -d"/" p1.txt)[ms]\nProm: $(cut -f2 -d"/" p1.txt)[ms]\nMáx: $(cut -f3 -d"/" p1.txt)[ms]"
./src/scripts/db_load.sh
rm p?.*