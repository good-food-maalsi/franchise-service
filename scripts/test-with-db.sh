#!/usr/bin/env bash
set -e

COMPOSE_FILE="docker-compose.test.yml"
# Même port que docker-compose.test.yml (5432:5432)
TEST_DB_URL="postgresql://postgres:postgres@localhost:5432/franchise_test?schema=public"
MAX_ATTEMPTS=30
CMD="${1:-npm run test:run}"

echo "▶ Nettoyage puis démarrage de PostgreSQL pour les tests..."
docker compose -f "$COMPOSE_FILE" down -v
docker compose -f "$COMPOSE_FILE" up -d

echo "▶ Attente de la base de données..."
for i in $(seq 1 $MAX_ATTEMPTS); do
  if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U postgres -d franchise_test >/dev/null 2>&1; then
    echo "▶ Base prête."
    break
  fi
  if [ "$i" -eq "$MAX_ATTEMPTS" ]; then
    echo "❌ Timeout: la base n'a pas répondu."
    docker compose -f "$COMPOSE_FILE" down
    exit 1
  fi
  sleep 1
done

echo "▶ Application des migrations..."
export DATABASE_URL="$TEST_DB_URL"
npx prisma migrate deploy

echo "▶ Exécution: $CMD"
eval "$CMD"
EXIT_CODE=$?

echo "▶ Arrêt du conteneur de test..."
docker compose -f "$COMPOSE_FILE" down

exit $EXIT_CODE
