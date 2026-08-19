#!/usr/bin/env bash
# Roda `db:migrate` em uma task Fargate na mesma VPC/subnets/SG do serviço — alcança o RDS privado.
# Pré-requisitos: AWS CLI, jq, imagem no ECR com `database/`, `.sequelizerc`,
# `scripts/sequelize-with-node-env.cjs` (yarn db:migrate) e sequelize-cli em dependencies;
# build/push após alterar Dockerfile; task definition revisada no ECS.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FOUNDATION="${ROOT}/infra/aws/foundation"

if ! command -v aws >/dev/null || ! command -v jq >/dev/null; then
  echo "Instale aws CLI e jq." >&2
  exit 1
fi

cd "$FOUNDATION"
CLUSTER="$(terraform output -raw ecs_cluster_name)"
SERVICE="$(terraform output -raw ecs_service_name)"
REGION="$(grep -E '^\s*aws_region\s*=' terraform.tfvars 2>/dev/null | head -1 | cut -d'"' -f2 || true)"
if [[ -z "${REGION:-}" ]]; then
  REGION="${AWS_REGION:-us-east-1}"
fi

export AWS_DEFAULT_REGION="${AWS_REGION:-$REGION}"

TASK_DEF_ARN="$(
  aws ecs describe-services \
    --cluster "$CLUSTER" \
    --services "$SERVICE" \
    --query 'services[0].taskDefinition' \
    --output text
)"

NETCFG="$(
  aws ecs describe-services \
    --cluster "$CLUSTER" \
    --services "$SERVICE" \
    --query 'services[0].networkConfiguration.awsvpcConfiguration' \
    --output json
)"

SUBNETS="$(echo "$NETCFG" | jq -r '.subnets | join(",")')"
SGS="$(echo "$NETCFG" | jq -r '.securityGroups | join(",")')"
ASSIGN_PUBLIC="$(echo "$NETCFG" | jq -r '.assignPublicIp // "DISABLED"')"

echo "Cluster:  $CLUSTER"
echo "Service:  $SERVICE"
echo "Task def: $TASK_DEF_ARN"
echo "Subnets:  $SUBNETS"
echo "SGs:      $SGS"
echo "PublicIP: $ASSIGN_PUBLIC"
echo ""

RUN_JSON="$(mktemp)"
trap 'rm -f "$RUN_JSON"' EXIT

jq -n \
  --arg cluster "$CLUSTER" \
  --arg taskdef "$TASK_DEF_ARN" \
  --arg subnets "$SUBNETS" \
  --arg sgs "$SGS" \
  --arg public "$ASSIGN_PUBLIC" \
  '{
    cluster: $cluster,
    taskDefinition: $taskdef,
    launchType: "FARGATE",
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: ($subnets | split(",")),
        securityGroups: ($sgs | split(",")),
        assignPublicIp: $public
      }
    },
    overrides: {
      containerOverrides: [{
        name: "app",
        command: ["sh", "-c", "cd /app && NODE_ENV=production yarn db:migrate"]
      }]
    }
  }' >"$RUN_JSON"

TASK_ARN="$(aws ecs run-task --cli-input-json "file://$RUN_JSON" --query 'tasks[0].taskArn' --output text)"
echo "Task: $TASK_ARN"
echo "Logs: grupo /ecs/$(terraform output -raw ecs_cluster_name | sed 's/-cluster$//') — filtro stream migrate/run-task"
echo ""
aws ecs wait tasks-stopped --cluster "$CLUSTER" --tasks "$TASK_ARN"
EXIT_CODE="$(
  aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$TASK_ARN" \
    --query 'tasks[0].containers[0].exitCode' --output text
)"
echo "Exit code (container app): $EXIT_CODE"
[[ "$EXIT_CODE" == "0" ]]
