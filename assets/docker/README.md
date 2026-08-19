# Module C — local Docker stack

Local infrastructure for developing and testing the Module C Main Backend against the provided Station Service and MySQL seed.

## Services

| Service | Image | Host URL (defaults) |
| --- | --- | --- |
| `db` | `mysql:8.0` | `localhost:3306` |
| `station-service` | `ghcr.io/sitc2026-dev/s17-sitc2026-station-service:latest` | http://localhost:4020 |
| `phpmyadmin` | `phpmyadmin:latest` | http://localhost:8082 |

On first start, MySQL loads [`../db/swaploop_db.sql`](../db/swaploop_db.sql). Station Service `POST /reset` reloads that same dump into the configured database.

## Setup

```bash
cd assets/module-c/docker
cp .env.example .env
docker compose up -d
```

All values in `docker-compose.yaml` come from `.env` (no compose defaults). Edit `.env` if ports collide on your machine.

| Variable | Purpose |
| --- | --- |
| `STATION_SERVICE_PORT` | Host/container port for Station Service |
| `PHPMYADMIN_PORT` | Host port for phpMyAdmin |
| `DB_HOST` | Host-side DB hostname (e.g. Bruno / local Main Backend) |
| `DB_PORT` | MySQL host port and in-compose DB port passed to Station Service |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL credentials and database name |
| `STATION_SERVICE_BASE_URL` | URL your local Main Backend should call (typically `http://localhost:4020`) |

## Useful commands

```bash
docker compose ps
docker compose logs -f station-service
docker compose down
```

To wipe the MySQL volume and re-seed from the SQL dump:

```bash
docker compose down -v
docker compose up -d
```

## Related assets

- Station Service OpenAPI: [`../api/station-service-openapi.yaml`](../api/station-service-openapi.yaml)
- Station Service Bruno: [`../bruno/station-service`](../bruno/station-service)
- Main Backend Bruno: [`../bruno/main-backend`](../bruno/main-backend)
