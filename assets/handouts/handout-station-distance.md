# Station distance (nearby filter)

Use this when implementing `GET /stations` with `lat` and `lng`.

`distanceMeters` is the great-circle distance between:

- the query point: query parameters `lat`, `lng`
- the station point: `stations.latitude`, `stations.longitude`

Use the **Haversine** formula with Earth radius **6 371 000** metres. Return `distanceMeters` as a **whole number** (round to nearest metre).

## Formula

Convert degrees to radians: \(\varphi = \text{degrees} \times \pi / 180\).

\[
\begin{aligned}
\Delta\varphi &= \varphi_{\text{station}} - \varphi_{\text{query}} \\
\Delta\lambda &= \lambda_{\text{station}} - \lambda_{\text{query}} \\
a &= \sin^2(\Delta\varphi / 2) + \cos(\varphi_{\text{query}}) \cdot \cos(\varphi_{\text{station}}) \cdot \sin^2(\Delta\lambda / 2) \\
d &= 2 \cdot R \cdot \arcsin(\sqrt{a})
\end{aligned}
\]

\(R = 6\,371\,000\), \(d\) in metres. Then `distanceMeters = round(d)`.

## Nearby behaviour

When both `lat` and `lng` are present:

1. Compute `distanceMeters` for every station.
2. Keep stations with `distanceMeters ≤ radiusMeters` (`radiusMeters` defaults to **1500** if omitted).
3. Sort **nearest first**.
4. Omit `distanceMeters` when `lat` / `lng` are not provided (then sort by `name`).

Same coordinates as a station (for example `lat=31.2308&lng=121.4717` for `station-001`) must yield `distanceMeters` **0**.

## Example (JavaScript)

```javascript
const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function distanceMeters(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

const value = Math.round(
  distanceMeters(queryLat, queryLng, station.latitude, station.longitude),
);
```

## Example (PHP)

```php
const EARTH_RADIUS_METERS = 6371000;

function distanceMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
{
    $dLat = deg2rad($lat2 - $lat1);
    $dLng = deg2rad($lng2 - $lng1);
    $a = sin($dLat / 2) ** 2
        + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_METERS * asin(sqrt($a));
}

$value = (int) round(distanceMeters($queryLat, $queryLng, $stationLat, $stationLng));
```
