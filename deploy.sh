#!/bin/bash

echo "=============================="
echo "   INICIANDO DEPLOY APP"
echo "=============================="

# URL de tu repositorio

REPO_URL="TU_REPO_URL"
PROJECT_NAME="project"

# Verificar si ya existe la carpeta

if [ -d "$PROJECT_NAME" ]; then
echo "El proyecto ya existe. Actualizando..."
cd $PROJECT_NAME
git pull
else
echo "Clonando repositorio..."
git clone $REPO_URL
cd $PROJECT_NAME
fi

# Dar permisos a scripts

chmod +x *.sh

echo "Construyendo contenedores..."
docker-compose build

echo "Levantando contenedores..."
docker-compose up -d

echo "=============================="
echo "   DEPLOY COMPLETADO"
echo "=============================="
