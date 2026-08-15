# Project Review: SITC2026 S17 — Module C (SwapLoop REST API Backend)

## Summary

Module C has a solid competitor-facing brief, OpenAPI + Swagger packs, MySQL seed, Bruno suites, and a **16-point** marking scheme mapped to Bruno requests. Remaining review items: header hierarchy (`#####`), infra image path convention, optional polish.

## Issues Found

### Critical Issues

1. ~~**Empty marking scheme.**~~ **Resolved:** `marking/marking-scheme.json` totals **16** (45 measurement aspects; each maps to one Bruno request).

2. ~~**Total marks must be 16.**~~ **Resolved:** PD mark table synced (S1=1.5, S2=1.5, S5=13).

3. ~~**`POST /reset` under-specified.**~~ **Resolved:** removed from Main Backend public OpenAPI. Competitors and marking reset via Station Service `POST /reset`. Documented in the project description. Module C solution keeps its own `/reset` for Module D.

### Important Issues

4. ~~**Broken README content links.**~~ **Resolved:** removed missing handouts / Station Service / QR emulator / assets overview links from `README.md`.

5. **Infra image path vs MITS convention.** Image lives at `assets/images/swaploop-infra.png`. Guide expects `assets/project-description-images/` for PD images (folder currently absent).

6. **Header hierarchy.** Requirements uses **17** `#####` endpoint headings. MITS guide tops out at `####`. Flatten to `####` (or keep group `####` + bold endpoint lines) for compliance.

7. ~~**Mark distribution placeholder.**~~ **Resolved:** PD table now matches the 16-point scheme.

### Minor Issues

8. **Bruno filename typo:** `assets/bruno/main-backend/auth/login-suspensed.yml` → `suspended`.

9. **`assets/.gitkeep`** remains beside populated assets (harmless clutter).

10. **Technologies in metadata** list both Node.js and PHP — fine as allowed stacks; ensure camp messaging matches.

### Resolved since last review

- **`POST /services/{serviceId}/ready`:** removed from public OpenAPI + Bruno; auto-ready via `GET /charging-status` only. Solution not modified.
- **Main Backend `POST /reset`:** removed from public OpenAPI; Station Service `POST /reset` is the assessor/competitor DB reset. PD updated. Bruno Main Backend suite retargeted to `stationServiceBaseUrl`. Solution still has `/reset` for Module D.
- **Broken README links:** removed missing handouts / packages / assets overview entries.

## Content Quality Issues

### Duplicate Content

- Battery mode / connector type table appears in Introduction; vehicle-profile rules repeat under register/`PATCH /me`. Keep Introduction as product context; Requirements as normative.
- MySQL seed import is stated under Environment **and** again at the start of Requirements — keep one normative “Database” note.
- OpenAPI “authoritative contract” is repeated often (acceptable if shortened once under Environment).

### Language and Clarity

- Line ~234: “A user can register an account provide an electric bike profile” → e.g. “A user registers with an electric bike profile…”.
- Line ~57: trailing space before the period after the SQL link.
- Hold duration (**10 seconds** for assessment vs real-world 15–30 minutes) is clear — keep that assessor note near `POST /services`.
- Station Service host pattern (`cXX-YYYY-station-service…`) is clear and aligns with Module D style.

## Compliance Checklist

- [x] README.md structure (title, skill domain, origin, links, MITS/Erasmus+)
- [x] project-description.md required sections present (Competition time → Mark distribution)
- [ ] project-description.md header hierarchy (too many `#####`)
- [x] metadata.json valid and complete (`estTime: 3` matches 3 hours)
- [x] marking-scheme.json valid (16 pts; matches mark table; 0 validator errors)
- [ ] Mark distribution matches scheme (**30 ≠ 16**)
- [ ] Assets properly organized / linked (broken README + missing handouts/packages)
- [ ] No broken links or references
- [x] PD endpoint catalog complete vs OpenAPI (`/ready` and Main Backend `/reset` removed from public contract; Station Service `POST /reset` documented)
- [ ] Clear and grammatically correct language (minor fixes needed)
- [x] Core API assets present (OpenAPI, Swagger UIs, DB seed, Bruno main-backend + station-service)

## Recommendations

1. ~~**Author `marking/marking-scheme.json` with `totalMark: 16`.**~~ Done.
2. ~~Add a PD subsection for **`POST /reset`**.~~ Done via Station Service reset note in Environment.
3. Fix README links: ship Station Service / QR emulator under `assets/` **or** point only to hosted URLs + Bruno/OpenAPI (as Environment already does for Station Service).
4. Move or copy `swaploop-infra.png` into `assets/project-description-images/` and update the markdown image path.
5. Flatten endpoint heading levels; fix the register grammar sentence and Bruno `suspensed` typo.
6. After the scheme exists, re-run Process 3 checklist to confirm PD ↔ JSON point alignment.

## Clean-up

Candidates (confirm before delete):

- `assets/.gitkeep` (optional)

Not present (nothing to remove):

- `projectplan.md`
- `marking/*.xlsx`
- skill converter temp JSON files

Kept:

- All standardized deliverables and competition assets
- This `review.md`
