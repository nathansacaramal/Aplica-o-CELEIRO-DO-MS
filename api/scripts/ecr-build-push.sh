#!/usr/bin/env bash
# Fase 3 — build da imagem e push para o ECR (foundation output ecr_repository_url).
set -euo pipefail

: "${AWS_REGION:?defina AWS_REGION}"
: "${ECR_REPOSITORY_URL:?defina ECR_REPOSITORY_URL (ex.: output ecr_repository_url)}"

TAG="${IMAGE_TAG:-latest}"
REGISTRY="${ECR_REPOSITORY_URL%%/*}"

echo "Building ${ECR_REPOSITORY_URL}:${TAG} ..."
docker build -t "${ECR_REPOSITORY_URL}:${TAG}" .

echo "Logging in to ${REGISTRY} ..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${REGISTRY}"

echo "Pushing ..."
docker push "${ECR_REPOSITORY_URL}:${TAG}"
echo "Done. Próximo: terraform apply com container_image atualizado ou force-new-deployment."
