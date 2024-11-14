#!/bin/bash

# Cargar los datos en la base de datos MySQL
open /home/alejandro_jm/git/html921/p3.txt
mariadb -u ale -pAleGatoGalleta <<JAS
use ping_db;
LOAD DATA LOCAL INFILE '/home/alejandro_jm/git/html921/p3.txt' 
INTO TABLE ping_data
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 0 LINES
(domain, ping_min, ping_avg, ping_max);
JAS
