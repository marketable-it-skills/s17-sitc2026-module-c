# Project Review: SITC2026 S17 — Module C (SwapLoop REST API Backend)

## Summary

Module C has a solid competitor-facing brief, OpenAPI + Swagger packs, MySQL seed, and Bruno suites. It is **not assessment-ready** yet: `marking/marking-scheme.json` is empty and the mark distribution table totals **30** instead of the required **16**. Public contract cleanups done: `/ready` removed; Main Backend `/reset` removed in favour of Station Service `POST /reset` (documented in the PD); broken README asset links removed. Module C solution still exposes `/reset` for Module D.

## Issues Found

### Critical Issues

1. **Empty marking scheme.** `marking/marking-scheme.json` is `{}` (4 bytes). It must be a valid MITS scheme with `totalMark`, `wsosSections`, and `subCriterions`.

2. **Total marks must be 16.** Current mark distribution table sums to **30** (S1=1, S2=2, S3=0, S4=0, S5=27). Update the PD table **and** the future JSON so both total **16**. Suggested direction (to confirm when authoring the scheme): keep S3/S4 at 0 for a backend-only module; put almost all weight in S5, with small S1/S2 shares (similar spirit to Module B’s backend-heavy split, scaled to 16).

3. ~~**`POST /reset` under-specified.**~~ **Resolved:** removed from Main Backend public OpenAPI. Competitors and marking reset via Station Service `POST /reset`. Documented in the project description. Module C solution keeps its own `/reset` for Module D.

### Important Issues

4. ~~**Broken README content links.**~~ **Resolved:** removed missing handouts / Station Service / QR emulator / assets overview links from `README.md`.

5. **Infra image path vs MITS convention.** Image lives at `assets/images/swaploop-infra.png`. Guide expects `assets/project-description-images/` for PD images (folder currently absent).

6. **Header hierarchy.** Requirements uses **17** `#####` endpoint headings. MITS guide tops out at `####`. Flatten to `####` (or keep group `####` + bold endpoint lines) for compliance.

7. **Mark distribution still says scheme is “updated in a separate process”.** Replace with a real 16-point table once the JSON exists, matching sibling modules’ wording (“The mark distribution for this project is as follows:”).

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
- [ ] marking-scheme.json valid (**empty**; must total **16**)
- [ ] Mark distribution matches scheme (**30 ≠ 16**)
- [ ] Assets properly organized / linked (broken README + missing handouts/packages)
- [ ] No broken links or references
- [x] PD endpoint catalog complete vs OpenAPI (`/ready` and Main Backend `/reset` removed from public contract; Station Service `POST /reset` documented)
- [ ] Clear and grammatically correct language (minor fixes needed)
- [x] Core API assets present (OpenAPI, Swagger UIs, DB seed, Bruno main-backend + station-service)

## Recommendations

1. **Author `marking/marking-scheme.json` with `totalMark: 16`**, then sync the PD mark table to the same WSOS split.
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
