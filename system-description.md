# SwapLoop System Description

## What is SwapLoop?

SwapLoop is a fictional service for safer e-bike charging in Shanghai. It helps people avoid charging e-bike batteries inside homes, corridors, or other unsuitable places.

SwapLoop stations can offer:

- **Battery swapping** for e-bikes with compatible removable batteries.
- **Bike charging bays** for e-bikes with a built-in battery.

Some stations offer one service. Hybrid stations offer several services.

## How riders use SwapLoop

### Finding a station

A rider can search for a nearby station or scan the QR code displayed at a station. The system shows the station's services, opening status, compatible battery types, and current availability.

### Swapping a battery

A rider with a compatible battery can:

1. Select a station with a suitable ready battery.
2. Reserve the battery for a short time.
3. Scan the QR code on the correct station unit.
4. Insert the depleted battery and collect the charged battery.
5. View the completed service and receipt.

The system checks compatibility and battery safety before allowing the swap.

### Charging an e-bike with a built-in battery

A rider with a built-in battery can reserve a bike charging bay. The bike remains in the bay while it charges. The system tells the rider when charging is complete.

## Other users

### Delivery riders

Delivery riders use the same swap process. During selected busy periods, a delivery partner may have priority access to part of a station's capacity. Priority never overrides compatibility or safety checks.

### Delivery partner operators

Partner operators can view information related to their delivery fleet and configured priority periods. They cannot manage another partner's riders or reservations.

### Station operators

Station operators monitor stations, batteries, unavailable units, and reported problems. They help keep the service available but cannot ignore safety restrictions.

### Safety inspectors

Safety inspectors review incidents and quarantined batteries. They record inspections and resolutions. A battery or charging unit returns to service only after the required safety conditions are met.

## Safety and reliability

SwapLoop receives battery temperature and usage information. A battery may be marked as healthy, needing attention, quarantined, retired, or unknown. Unsafe or unknown batteries cannot be offered for swapping.

If unusual heat or a charging cutoff is detected, the system blocks the affected battery or charging unit and creates an incident. Riders can also report heat, smell, or visible damage.

QR codes identify stations and physical units, but they do not give access by themselves. The system also checks the signed-in user, reservation, location, time, compatibility, and safety state.

## Plans and service history

Riders may use pay-as-you-go or subscription plans. Delivery partners may use a fleet plan. Users can view plan usage, completed swaps and charging sessions, and receipts.

SwapLoop is a competition prototype. It simulates cabinet access and charging behaviour; it does not control real hardware or process real payments.
