# SwapLoop deterministic charging rules

Use these fixed rules for all Module C charging calculations. The server clock after reset is `2026-08-15T12:00:00+08:00` in `Asia/Shanghai`.

## Reservation and access

- A charging reservation expires **10 minutes** after its requested start time if charging has not started.
- A successful QR access operation returns a simulated access token valid for **30 seconds**.
- Access tokens are runtime values only. They do not require their own database table.
- A unit can have at most one non-terminal reservation.

## Compatibility

Only riders with battery mode `INTEGRATED` may create a charging reservation, and the required unit type is `BIKE_BAY`. Riders with `SWAPPABLE` batteries use the swap service. Other removable batteries are outside the pilot's scope.

The rider, unit, voltage class, and connector type must all match. No automatic substitution is allowed.

## Charging duration

Duration is measured from the server-generated `startedAt` timestamp.

| Voltage class | Duration |
| ------------- | -------: |
| `48V` | 150 minutes |
| `60V` | 180 minutes |

`estimatedReadyAt = startedAt + duration`.

At `estimatedReadyAt`, a session in `CHARGING` becomes `READY_FOR_COLLECTION`. The collection deadline is exactly **4 hours** after `readyAt`. Passing the deadline does not release the unit; it remains occupied and unavailable until collection.

## Safety cutoff

A charging session immediately becomes `SAFETY_CUTOFF` when either condition is received:

- `temperatureC > 55`; or
- `safetyCutoff: true` in the mock feed.

The same operation must atomically:

1. stop the logical charging session;
2. set the station unit to `BLOCKED`;
3. create one `CHARGING_SAFETY_CUTOFF` incident;
4. preserve the triggering reading and timestamp.

Repeating the same cutoff event must not create another incident.

## Collection and billing

- Collection is permitted only from `READY_FOR_COLLECTION`.
- Collection is idempotent and releases the station unit exactly once.
- Pay-as-you-go charging costs **5 CNY** per completed session.
- Monthly quota plans consume one use; overage uses the subscription's seeded `overagePriceCny`.
- Round only the final payable amount to the nearest whole yuan using half-up rounding.
