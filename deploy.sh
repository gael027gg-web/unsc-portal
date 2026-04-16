#!/bin/bash

echo "=============================="
echo "    INICIANDO DEPLOY APP"
echo "=============================="

REPO_URL="https://github.com/gael027gg-web/unsc-portal.git"
PROJECT_DIR="/home/ec2-user/unsc-portal"

# 1. Verificar o Clonar (Punto 7 de la rúbrica)
if [ -d "$PROJECT_DIR" ]; then
    echo "El proyecto ya existe. Actualizando..."
    cd $PROJECT_DIR
    git pull
else
    echo "Clonando repositorio..."
    git clone $REPO_URL $PROJECT_DIR
    cd $PROJECT_DIR
fi

# 2. Asegurar permisos de los scripts que ya creamos
chmod +x *.sh

# 3. Despliegue con Docker Compose (V2)
echo "Construyendo y levantando contenedores..."
# Usamos 'docker compose' (sin guion) que es el estándar actual
docker compose up -d --build

echo "=============================="
echo "    DEPLOY COMPLETADO"
echo "=============================="
docker ps