#!/bin/bash

echo "=============================="
echo "   DETENIENDO APLICACIÓN"
echo "=============================="

cd ~/project

docker-compose down

echo "Aplicación detenida correctamente"
