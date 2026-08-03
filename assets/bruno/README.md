# Bruno API test suite

Open this directory in Bruno and select the `Local` environment. Run the collection against a reset API at `http://localhost:3000`.

The collection covers public discovery, authentication, QR resolution, health history, reservation status, incident authorization, and reset. The automated runner under [`../tests/`](../tests/) adds concurrency and idempotency checks.
