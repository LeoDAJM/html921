#!/bin/bash

# Archivo de entrada con las direcciones o nombres a procesar

OUTPUT_DIR="/home/alejandro_jm/git/html921"
REPORT_FILE="${OUTPUT_DIR}/Report.txt"
INPUT_FILE="${OUTPUT_DIR}/src/scripts/inputs.txt"

# Itera sobre cada línea del archivo de entrada
while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ -z "$line" ]]; then
        continue
    fi
    
    # Ejecuta el comando ping y procesa la salida
    TEMP_FILE="${OUTPUT_DIR}/p0.txt"
    ping -c 3 -q -n "$line" > "$TEMP_FILE"
    
    # Extrae datos del archivo temporal
    cut -f2 -s -d"=" "$TEMP_FILE" > "${OUTPUT_DIR}/p1.txt"
    
    # Genera los datos finales
    MIN=$(cut -f1 -d"/" "${OUTPUT_DIR}/p1.txt")
    AVG=$(cut -f2 -d"/" "${OUTPUT_DIR}/p1.txt")
    MAX=$(cut -f3 -d"/" "${OUTPUT_DIR}/p1.txt")
    
    # Agrega datos al reporte
    echo "$line,$MIN,$AVG,$MAX" >> "$REPORT_FILE" > "${OUTPUT_DIR}/p3.txt"
    # Llama al script adicional
    "${OUTPUT_DIR}/src/scripts/db_load.sh"
    
    # Limpia archivos temporales
    rm -f "${OUTPUT_DIR}/p?.txt"
done < "$INPUT_FILE"
