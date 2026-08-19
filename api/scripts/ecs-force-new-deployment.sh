#!/usr/bin/env bash
# Fase 3 — nova revisão da task sem alterar Terraform (usa mesma task definition family).
set -euo pipefail

: "${AWS_REGION:?}"
: "${ECS_CLUSTER_NAME:?}"
: "${ECS_SERVICE_NAME:?}"

aws ecs update-service \
  --region "${AWS_REGION}" \
  --cluster "${ECS_CLUSTER_NAME}" \
  --service "${ECS_SERVICE_NAME}" \
  --force-new-deployment \
  --no-cli-pager

echo "Deploy disparado. Aguarde estabilização (ECS console ou aws ecs wait services-stable)."
