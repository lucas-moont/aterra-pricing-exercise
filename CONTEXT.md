# AterraAI — Pricing Screen

The *Price* step of AterraAI: a consultant takes a planned itinerary, applies
commission and markup per line, and works out what the traveller pays. This is
where the DMC makes or loses its margin. This file is a glossary only — no
implementation details.

## The four parties

**Supplier**:
Whoever provides one service — a hotel, an airline, a transfer company. The DMC
pays them the Nett cost.

**DMC**:
Destination management company. Builds and prices the trip locally, and is the
company using this screen. Aterra's customers are DMCs.
_Avoid_: operator, agency (an Agent is a different party).

**Agent**:
The retail travel agent who introduced the traveller. Takes a Commission out of
the final price. This money is never the DMC's.
_Avoid_: advisor (used in the data field `advisor`, but Agent is canonical), broker.

**Traveller**:
The person who takes the trip and pays the final price.
_Avoid_: client (used loosely for the paying side, but Traveller is the person; Client Ceiling is the one place "client" stays).

## Pricing

**Nett**:
What the DMC pays the Supplier for a line, in USD, before VAT.

**VAT**:
Tax added on top of Nett. Varies by line/country (`vatPct`).

**Markup**:
What the DMC adds on top of its own cost (`mrkpPct`). Can be negative — a
negative markup is a discount, not an error.

**Commission**:
What the Agent takes out of the final sell price (`commPct`). It comes out of the
Traveller's money before the DMC sees it. **Never the DMC's money.**

**GP**:
Gross profit. What the DMC banks (cost incl. VAT plus markup) minus what it paid
the Supplier incl. VAT. **GP excludes Commission** — commission is the Agent's,
not the DMC's. `GP = DMC RECEIVES − (COST + VAT)`, `GP% = GP ÷ DMC RECEIVES`.
_Avoid_: margin (used casually, but GP is the canonical figure and its base is DMC RECEIVES, never Client Pays).

**Client Ceiling**:
The maximum the traveller/client has said they will spend on the whole trip.

**pax**:
Number of travellers. A per-person line scales with pax; a per-unit line does not.

**Per-unit vs per-person**:
How a line is priced. A vehicle transfer is per-unit (one price no matter how
many people). A flight or activity is per-person (price × pax).

## Line & quote

**Line Item**:
One service on the quote — a hotel night, a transfer, an activity. Belongs to a
Section.

**Section**:
A group of lines: ACCOMMODATION, TRANSPORT, or ACTIVITIES. Has its own subtotal.

**Quote**:
The whole quotation: header (client, trip, dates, ceiling, pax) plus all lines.
_Avoid_: quotation, proposal (proposal is a later, client-facing step downstream of Price).

**Confidence / Rate source**:
Where a Nett rate came from (signed contract, portal hold, carried-forward tariff)
and how sure we are (high / medium / low). Shown to the consultant as reasoning.

## The three failure states

The founder designed the happy path only. These are the three moments she never
drew — the heart of the exercise. Each needs a canonical name so we stop calling
it "the budget thing".

**Ceiling Breach**:
The trip total has gone **above** the Client Ceiling. The most expensive mistake
this screen allows — it means going back to the client to ask for more money.

**Underwater Line**:
A single line is priced **below what it costs** (line GP < 0), usually after a
discount (negative markup). Dangerous because the trip's overall margin can still
look healthy, so the consultant does not notice.
_Avoid_: negative margin (describes it, but Underwater Line is the named state).

**Unpriced Line**:
A service with **no contracted rate found yet** (`nett = null`). This is
**unknown, not zero** — treating it as $0 understates the trip by an unknown
amount and is a serious error.
_Avoid_: zero-rate, missing price (implies $0; the point is that it is unknown).

**Provisional Total**:
A trip total that openly declares it is incomplete because at least one
Unpriced Line is excluded from it (shown as "from $X · excludes N unpriced
lines"). A total that silently omits a missing number is a lie; a Provisional
Total tells the truth about what it does not yet know.
