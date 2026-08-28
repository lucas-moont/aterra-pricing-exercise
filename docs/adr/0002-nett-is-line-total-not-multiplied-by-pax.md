# `nett` is the line total — the engine does not multiply by pax

The seed's per-person lines (`trn-2`, `trn-3`, `act-1`, `act-2`) carry
`basis: "per_person"`, `pax: 2`, and `units: "2 pax"`. It is tempting to read
`nett` as a *per-person* figure and multiply it by pax. The canonical formula in
the brief is **per line** and never multiplies by pax.

We treat **`nett` as the line total as given** and do **not** multiply by pax.
Multiplying would inflate every per-person line and make every downstream total
wrong — the single most dangerous error this engine could contain.

pax-aware repricing (per-person lines scaling, per-unit lines splitting on
capacity) is deliberately designed-not-built and needs `units` to become
structured first — see `docs/features-and-treatments.md` and
`docs/beyond-the-brief.md`. Until then, a future reader must not "fix" the engine
by multiplying per-person lines by pax. That is not a bug.
