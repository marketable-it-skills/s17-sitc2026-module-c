-- SwapLoop canonical MySQL seed dump
-- Dataset version: 1.0.0
-- Frozen application time: 2026-08-15T12:00:00+08:00
-- Generated at: 2026-08-02T13:18:40.898Z
-- Target: MySQL 8.0+ or MariaDB 10.5+

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `swaploop_api` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `swaploop_api`;

DROP TABLE IF EXISTS `priority_windows`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `service_sessions`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `incidents`;
DROP TABLE IF EXISTS `health_assessments`;
DROP TABLE IF EXISTS `telemetry_readings`;
DROP TABLE IF EXISTS `batteries`;
DROP TABLE IF EXISTS `qr_identifiers`;
DROP TABLE IF EXISTS `station_units`;
DROP TABLE IF EXISTS `stations`;
DROP TABLE IF EXISTS `delivery_partners`;
DROP TABLE IF EXISTS `users`;

-- Sources: compact-core.json#users
CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `display_name` VARCHAR(160) NOT NULL,
  `role` VARCHAR(64) NOT NULL,
  `status` VARCHAR(64) NOT NULL,
  `voltage_class` VARCHAR(64) NULL,
  `battery_mode` VARCHAR(64) NULL,
  `connector_type` VARCHAR(64) NULL,
  `partner_id` VARCHAR(64) NULL,
  `seed_created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `display_name`, `role`, `status`, `voltage_class`, `battery_mode`, `connector_type`, `partner_id`) VALUES
  ('rider-001', 'Lin Xiaoyu', 'RIDER', 'ACTIVE', '48V', 'SWAPPABLE', 'SL-48-A', NULL),
  ('rider-002', 'Chen Wei', 'RIDER', 'ACTIVE', '48V', 'INTEGRATED', 'GB-AC-48', NULL),
  ('rider-003', 'Zhao Min', 'RIDER', 'ACTIVE', '48V', 'INTEGRATED', 'GB-AC-48', NULL),
  ('rider-004', 'Wang Jun', 'DELIVERY_RIDER', 'ACTIVE', '60V', 'SWAPPABLE', 'SL-60-B', 'partner-001'),
  ('rider-005', 'Liu Fang', 'DELIVERY_RIDER', 'ACTIVE', '48V', 'SWAPPABLE', 'SL-48-A', 'partner-002'),
  ('rider-006', 'Sun Hao', 'RIDER', 'SUSPENDED', '60V', 'INTEGRATED', 'GB-AC-60', NULL),
  ('staff-001', 'He Lan', 'OPERATOR_ADMIN', 'ACTIVE', NULL, NULL, NULL, NULL),
  ('staff-002', 'Guo Jie', 'SAFETY_INSPECTOR', 'ACTIVE', NULL, NULL, NULL, NULL),
  ('staff-003', 'Tang Yi', 'PARTNER_OPERATOR', 'ACTIVE', NULL, NULL, NULL, 'partner-001');

-- Sources: compact-core.json#deliveryPartners
CREATE TABLE `delivery_partners` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(160) NOT NULL,
  `fleet_size` BIGINT NOT NULL,
  `status` VARCHAR(64) NOT NULL,
  `seed_created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `delivery_partners` (`id`, `name`, `fleet_size`, `status`) VALUES
  ('partner-001', 'SwiftRice Delivery', 420, 'ACTIVE'),
  ('partner-002', 'BlueCrane Courier', 180, 'ACTIVE');

-- Sources: compact-core.json#stations
CREATE TABLE `stations` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(160) NOT NULL,
  `type` VARCHAR(64) NOT NULL,
  `lifecycle_state` VARCHAR(64) NOT NULL,
  `community_name` VARCHAR(160) NOT NULL,
  `latitude` DECIMAL(18,6) NOT NULL,
  `longitude` DECIMAL(18,6) NOT NULL,
  `service_radius_meters` BIGINT NOT NULL,
  `status_reason` TEXT NULL,
  `seed_created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `stations` (`id`, `name`, `type`, `lifecycle_state`, `community_name`, `latitude`, `longitude`, `service_radius_meters`, `status_reason`) VALUES
  ('station-001', 'Haitang Garden East Gate', 'HYBRID', 'ACTIVE', 'Haitang Garden', 31.2308, 121.4717, 700, NULL),
  ('station-002', 'Canal View Delivery Hub', 'SWAP', 'ACTIVE', 'Canal View Homes', 31.2356, 121.4784, 600, NULL),
  ('station-003', 'Morning Bridge Charging Court', 'CHARGING', 'ACTIVE', 'Morning Bridge Court', 31.2262, 121.4652, 650, NULL),
  ('station-004', 'South Gate Exchange', 'HYBRID', 'SUSPENDED', 'South Gate Mixed-Use Block', 31.2187, 121.4821, 800, 'Electrical inspection in progress');

-- Sources: compact-core.json#stationUnits
CREATE TABLE `station_units` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `station_id` VARCHAR(64) NOT NULL,
  `unit_type` VARCHAR(64) NOT NULL,
  `label` VARCHAR(160) NOT NULL,
  `state` VARCHAR(64) NOT NULL,
  `voltage_class` VARCHAR(64) NOT NULL,
  `connector_type` VARCHAR(64) NOT NULL,
  `current_battery_id` VARCHAR(64) NULL,
  `partner_reserved_for_id` VARCHAR(64) NULL,
  `blocked_reason` TEXT NULL,
  `seed_created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `station_units` (`id`, `station_id`, `unit_type`, `label`, `state`, `voltage_class`, `connector_type`, `current_battery_id`, `partner_reserved_for_id`, `blocked_reason`) VALUES
  ('unit-001', 'station-001', 'SWAP_BAY', 'S01', 'READY', '48V', 'SL-48-A', 'battery-001', NULL, NULL),
  ('unit-002', 'station-001', 'SWAP_BAY', 'S02', 'RESERVED', '48V', 'SL-48-A', 'battery-002', NULL, NULL),
  ('unit-003', 'station-001', 'BIKE_BAY', 'B02', 'CHARGING', '48V', 'GB-AC-48', NULL, NULL, NULL),
  ('unit-004', 'station-001', 'BIKE_BAY', 'B01', 'READY_FOR_COLLECTION', '48V', 'GB-AC-48', NULL, NULL, NULL),
  ('unit-005', 'station-002', 'SWAP_BAY', 'S01', 'CHARGING', '60V', 'SL-60-B', 'battery-010', 'partner-001', NULL),
  ('unit-006', 'station-002', 'SWAP_BAY', 'S02', 'READY', '48V', 'SL-48-A', 'battery-005', NULL, NULL),
  ('unit-007', 'station-003', 'BIKE_BAY', 'B02', 'AVAILABLE', '60V', 'GB-AC-60', NULL, NULL, NULL),
  ('unit-008', 'station-003', 'BIKE_BAY', 'B01', 'BLOCKED', '48V', 'GB-AC-48', NULL, NULL, 'SAFETY_CUTOFF');

-- Sources: compact-core.json#qrIdentifiers
CREATE TABLE `qr_identifiers` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `resource_type` VARCHAR(64) NOT NULL,
  `resource_id` VARCHAR(64) NOT NULL,
  `qr_payload` VARCHAR(255) NOT NULL,
  `status` VARCHAR(64) NOT NULL,
  `seed_created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `qr_identifiers` (`id`, `resource_type`, `resource_id`, `qr_payload`, `status`) VALUES
  ('qr-001', 'STATION', 'station-001', 'sl_qr_stn_7H2K9M', 'ACTIVE'),
  ('qr-002', 'STATION', 'station-002', 'sl_qr_stn_4P8R3D', 'ACTIVE'),
  ('qr-003', 'STATION', 'station-003', 'sl_qr_stn_9T1V6C', 'ACTIVE'),
  ('qr-004', 'STATION', 'station-004', 'sl_qr_stn_2N5W8F', 'DISABLED'),
  ('qr-101', 'STATION_UNIT', 'unit-001', 'sl_qr_unit_A1F9K2', 'ACTIVE'),
  ('qr-102', 'STATION_UNIT', 'unit-002', 'sl_qr_unit_B2G8L3', 'ACTIVE'),
  ('qr-103', 'STATION_UNIT', 'unit-003', 'sl_qr_unit_D4H6N5', 'ACTIVE'),
  ('qr-104', 'STATION_UNIT', 'unit-004', 'sl_qr_unit_E5J5P6', 'ACTIVE'),
  ('qr-201', 'BATTERY', 'battery-001', 'sl_qr_bat_001K7D', 'ACTIVE');

-- Sources: compact-safety.json#batteries
CREATE TABLE `batteries` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `asset_code` VARCHAR(64) NOT NULL,
  `voltage_class` VARCHAR(64) NOT NULL,
  `connector_type` VARCHAR(64) NOT NULL,
  `cycle_count` BIGINT NOT NULL,
  `lifecycle_state` VARCHAR(64) NOT NULL,
  `health_band` VARCHAR(64) NOT NULL,
  `station_id` VARCHAR(64) NULL,
  `seed_created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `batteries` (`id`, `asset_code`, `voltage_class`, `connector_type`, `cycle_count`, `lifecycle_state`, `health_band`, `station_id`) VALUES
  ('battery-001', 'SL48-0001', '48V', 'SL-48-A', 184, 'READY', 'HEALTHY', 'station-001'),
  ('battery-002', 'SL48-0002', '48V', 'SL-48-A', 522, 'RESERVED', 'WATCH', 'station-001'),
  ('battery-004', 'SL60-0004', '60V', 'SL-60-B', 610, 'IN_USE', 'WATCH', NULL),
  ('battery-005', 'SL48-0005', '48V', 'SL-48-A', 88, 'READY', 'HEALTHY', 'station-002'),
  ('battery-006', 'SL48-0006', '48V', 'SL-48-A', 406, 'QUARANTINE', 'QUARANTINE', 'station-002'),
  ('battery-008', 'SL48-0008', '48V', 'SL-48-A', 240, 'RETURNED', 'UNKNOWN', 'station-001'),
  ('battery-009', 'SL60-0009', '60V', 'SL-60-B', 934, 'RETIRED', 'RETIRE', NULL),
  ('battery-010', 'SL60-0010', '60V', 'SL-60-B', 302, 'CHARGING', 'HEALTHY', 'station-002');

-- Sources: compact-safety.json#telemetryReadings
CREATE TABLE `telemetry_readings` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `battery_id` VARCHAR(64) NULL,
  `measured_at` DATETIME(3) NULL,
  `received_at` DATETIME(3) NOT NULL,
  `temperature_c` DECIMAL(18,6) NULL,
  `cycle_count_delta` BIGINT NULL,
  `validity` VARCHAR(64) NOT NULL,
  `raw_payload` TEXT NULL,
  `seed_created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `telemetry_readings` (`id`, `battery_id`, `measured_at`, `received_at`, `temperature_c`, `cycle_count_delta`, `validity`, `raw_payload`) VALUES
  ('reading-001', 'battery-001', '2026-08-14 23:05:00.000', '2026-08-14 23:05:04.000', 39.4, 1, 'VALID', NULL),
  ('reading-002', 'battery-002', '2026-08-15 00:15:00.000', '2026-08-15 00:15:03.000', 49.1, 1, 'VALID', NULL),
  ('reading-003', 'battery-006', '2026-08-15 02:30:00.000', '2026-08-15 02:30:02.000', 62.7, 1, 'THERMAL_ANOMALY', NULL),
  ('reading-004', 'battery-008', '2026-08-15 00:00:00.000', '2026-08-15 00:00:03.000', 40, 0, 'STALE', NULL),
  ('reading-005', NULL, NULL, '2026-08-15 03:05:00.000', NULL, NULL, 'MALFORMED', '{battery:''?'',temperature:''hot''}');

-- Sources: compact-safety.json#healthAssessments
CREATE TABLE `health_assessments` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `battery_id` VARCHAR(64) NOT NULL,
  `band` VARCHAR(64) NOT NULL,
  `source` VARCHAR(64) NOT NULL,
  `effective_from` DATETIME(3) NOT NULL,
  `effective_to` DATETIME(3) NULL,
  `max_temperature_c` DECIMAL(18,6) NULL,
  `seed_created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `health_assessments` (`id`, `battery_id`, `band`, `source`, `effective_from`, `effective_to`, `max_temperature_c`) VALUES
  ('health-001', 'battery-001', 'HEALTHY', 'TABLE', '2026-08-14 23:10:00.000', NULL, 39.4),
  ('health-002', 'battery-002', 'WATCH', 'TABLE', '2026-08-15 00:20:00.000', NULL, 49.1),
  ('health-006a', 'battery-006', 'HEALTHY', 'TABLE', '2026-08-14 11:00:00.000', '2026-08-15 02:31:00.000', 43),
  ('health-006b', 'battery-006', 'QUARANTINE', 'THERMAL_ANOMALY_OVERRIDE', '2026-08-15 02:31:00.000', NULL, 62.7),
  ('health-008', 'battery-008', 'UNKNOWN', 'STALE_TELEMETRY', '2026-08-15 03:00:00.000', NULL, NULL),
  ('health-009', 'battery-009', 'RETIRE', 'TABLE', '2026-08-13 04:00:00.000', NULL, 44.1);

-- Sources: compact-safety.json#incidents
CREATE TABLE `incidents` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `station_id` VARCHAR(64) NOT NULL,
  `battery_id` VARCHAR(64) NULL,
  `type` VARCHAR(64) NOT NULL,
  `severity` VARCHAR(64) NOT NULL,
  `status` VARCHAR(64) NOT NULL,
  `detected_at` DATETIME(3) NOT NULL,
  `assigned_inspector_id` VARCHAR(64) NOT NULL,
  `resolution_notes` TEXT NULL,
  `seed_created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `incidents` (`id`, `station_id`, `battery_id`, `type`, `severity`, `status`, `detected_at`, `assigned_inspector_id`, `resolution_notes`) VALUES
  ('incident-001', 'station-002', 'battery-006', 'THERMAL_ANOMALY', 'HIGH', 'OPEN', '2026-08-15 02:30:02.000', 'staff-002', NULL),
  ('incident-002', 'station-003', NULL, 'CHARGING_SAFETY_CUTOFF', 'HIGH', 'UNDER_REVIEW', '2026-08-14 12:41:00.000', 'staff-002', NULL),
  ('incident-003', 'station-001', 'battery-008', 'RIDER_HEAT_REPORT', 'MEDIUM', 'RESOLVED', '2026-08-14 10:05:00.000', 'staff-002', 'Battery retained for telemetry reassessment'),
  ('incident-004', 'station-004', NULL, 'POWER_FAULT', 'HIGH', 'UNDER_REVIEW', '2026-08-13 23:12:00.000', 'staff-002', 'Station suspended pending electrical inspection');

-- Sources: compact-service.json#reservations
CREATE TABLE `reservations` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `service_type` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `station_id` VARCHAR(64) NOT NULL,
  `station_unit_id` VARCHAR(64) NOT NULL,
  `state` VARCHAR(64) NOT NULL,
  `created_at` DATETIME(3) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `battery_out_id` VARCHAR(64) NULL,
  `partner_priority_applied` TINYINT(1) NOT NULL,
  `completed_at` DATETIME(3) NULL,
  `started_at` DATETIME(3) NULL,
  `estimated_ready_at` DATETIME(3) NULL,
  `ready_at` DATETIME(3) NULL,
  `collection_due_at` DATETIME(3) NULL,
  `seed_created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `reservations` (`id`, `service_type`, `user_id`, `station_id`, `station_unit_id`, `state`, `created_at`, `expires_at`, `battery_out_id`, `partner_priority_applied`, `completed_at`, `started_at`, `estimated_ready_at`, `ready_at`, `collection_due_at`) VALUES
  ('reservation-001', 'SWAP', 'rider-001', 'station-001', 'unit-002', 'RESERVED', '2026-08-15 03:59:00.000', '2026-08-15 04:02:00.000', 'battery-002', 0, NULL, NULL, NULL, NULL, NULL),
  ('reservation-002', 'SWAP', 'rider-004', 'station-002', 'unit-005', 'CONFIRMED', '2026-08-15 03:20:00.000', '2026-08-15 03:23:00.000', 'battery-004', 1, '2026-08-15 03:21:12.000', NULL, NULL, NULL, NULL),
  ('reservation-003', 'SWAP', 'rider-005', 'station-002', 'unit-006', 'EXPIRED', '2026-08-15 02:00:00.000', '2026-08-15 02:03:00.000', 'battery-005', 0, NULL, NULL, NULL, NULL, NULL),
  ('reservation-004', 'BIKE_BAY', 'rider-002', 'station-001', 'unit-003', 'CHARGING', '2026-08-15 02:55:00.000', '2026-08-15 03:10:00.000', NULL, 0, NULL, '2026-08-15 03:02:00.000', '2026-08-15 05:32:00.000', NULL, NULL),
  ('reservation-005', 'BIKE_BAY', 'rider-003', 'station-001', 'unit-004', 'READY_FOR_COLLECTION', '2026-08-14 23:50:00.000', '2026-08-15 00:10:00.000', NULL, 0, NULL, '2026-08-15 00:02:00.000', NULL, '2026-08-15 02:32:00.000', '2026-08-15 06:32:00.000'),
  ('reservation-006', 'BIKE_BAY', 'rider-003', 'station-003', 'unit-008', 'SAFETY_CUTOFF', '2026-08-14 12:00:00.000', '2026-08-14 12:20:00.000', NULL, 0, '2026-08-14 12:41:00.000', '2026-08-14 12:12:00.000', NULL, NULL, NULL);

-- Sources: compact-service.json#serviceSessions
CREATE TABLE `service_sessions` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `reservation_id` VARCHAR(64) NOT NULL,
  `service_type` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `station_id` VARCHAR(64) NOT NULL,
  `station_unit_id` VARCHAR(64) NOT NULL,
  `state` VARCHAR(64) NOT NULL,
  `started_at` DATETIME(3) NOT NULL,
  `completed_at` DATETIME(3) NULL,
  `battery_in_id` VARCHAR(64) NULL,
  `battery_out_id` VARCHAR(64) NULL,
  `health_band_at_service` VARCHAR(64) NULL,
  `idempotency_key` VARCHAR(64) NOT NULL,
  `amount_cny` BIGINT NOT NULL,
  `seed_created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `service_sessions` (`id`, `reservation_id`, `service_type`, `user_id`, `station_id`, `station_unit_id`, `state`, `started_at`, `completed_at`, `battery_in_id`, `battery_out_id`, `health_band_at_service`, `idempotency_key`, `amount_cny`) VALUES
  ('session-001', 'reservation-002', 'SWAP', 'rider-004', 'station-002', 'unit-005', 'COMPLETED', '2026-08-15 03:21:00.000', '2026-08-15 03:21:12.000', 'battery-010', 'battery-004', 'WATCH', 'idem-session-001', 0),
  ('session-002', 'reservation-004', 'BIKE_BAY', 'rider-002', 'station-001', 'unit-003', 'CHARGING', '2026-08-15 03:02:00.000', NULL, NULL, NULL, NULL, 'idem-session-002', 5),
  ('session-003', 'reservation-005', 'BIKE_BAY', 'rider-003', 'station-001', 'unit-004', 'READY_FOR_COLLECTION', '2026-08-15 00:02:00.000', NULL, NULL, NULL, NULL, 'idem-session-003', 0),
  ('session-004', 'reservation-006', 'BIKE_BAY', 'rider-003', 'station-003', 'unit-008', 'SAFETY_CUTOFF', '2026-08-14 12:12:00.000', '2026-08-14 12:41:00.000', NULL, NULL, NULL, 'idem-session-004', 0);

-- Sources: compact-service.json#subscriptions
CREATE TABLE `subscriptions` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `owner_type` VARCHAR(64) NOT NULL,
  `owner_id` VARCHAR(64) NOT NULL,
  `plan_code` VARCHAR(64) NOT NULL,
  `plan_name` VARCHAR(160) NOT NULL,
  `status` VARCHAR(64) NOT NULL,
  `monthly_fee_cny` BIGINT NOT NULL,
  `included_uses` BIGINT NOT NULL,
  `overage_price_cny` BIGINT NULL,
  `cycle_start` DATETIME(3) NOT NULL,
  `cycle_end` DATETIME(3) NOT NULL,
  `used_quota` BIGINT NOT NULL,
  `seed_created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `subscriptions` (`id`, `owner_type`, `owner_id`, `plan_code`, `plan_name`, `status`, `monthly_fee_cny`, `included_uses`, `overage_price_cny`, `cycle_start`, `cycle_end`, `used_quota`) VALUES
  ('subscription-001', 'USER', 'rider-001', 'RIDER_30', 'Everyday 30', 'ACTIVE', 168, 30, 6, '2026-07-31 16:00:00.000', '2026-08-31 16:00:00.000', 18),
  ('subscription-002', 'USER', 'rider-002', 'PAYG', 'Pay as you go', 'ACTIVE', 0, 0, NULL, '2026-07-31 16:00:00.000', '2026-08-31 16:00:00.000', 0),
  ('subscription-003', 'USER', 'rider-003', 'RIDER_30', 'Everyday 30', 'CANCELS_AT_PERIOD_END', 168, 30, 6, '2026-07-31 16:00:00.000', '2026-08-31 16:00:00.000', 31),
  ('subscription-004', 'DELIVERY_PARTNER', 'partner-001', 'PARTNER_FLEET', 'Partner fleet priority', 'ACTIVE', 6800, 1200, 4, '2026-07-31 16:00:00.000', '2026-08-31 16:00:00.000', 824);

-- Sources: compact-service.json#priorityWindows
CREATE TABLE `priority_windows` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `partner_id` VARCHAR(64) NOT NULL,
  `station_id` VARCHAR(64) NOT NULL,
  `start_local_time` TIME NOT NULL,
  `end_local_time` TIME NOT NULL,
  `reserved_unit_share_percent` BIGINT NOT NULL,
  `effective_from` DATE NOT NULL,
  `effective_to` DATE NOT NULL,
  `status` VARCHAR(64) NOT NULL,
  `seed_created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `priority_windows` (`id`, `partner_id`, `station_id`, `start_local_time`, `end_local_time`, `reserved_unit_share_percent`, `effective_from`, `effective_to`, `status`) VALUES
  ('window-001', 'partner-001', 'station-002', '11:00:00', '14:00:00', 40, '2026-08-01', '2026-08-31', 'ACTIVE'),
  ('window-002', 'partner-001', 'station-004', '17:00:00', '20:00:00', 40, '2026-08-01', '2026-08-31', 'SUSPENDED_WITH_STATION');

SET UNIQUE_CHECKS = 1;
SET FOREIGN_KEY_CHECKS = 1;
