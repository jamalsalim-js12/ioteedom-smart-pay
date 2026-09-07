# IoTeedom Smart Pay — Product Requirements

**Status:** Draft after client discussion  
**Date:** 21 August 2026  
**Product:** A modular dashboard for utilities, IoT, and payments — with a mobile app coming later  
**Companion:** [Technical PRD](./TECHNICAL_PRD.md) — architecture, flows, database, modules, and build order.

---

## What this is

We’re building a dashboard that can take on a lot of services over time. The point is not to ship one giant app that tries to do everything on day one. The point is to have one place a household or property can log into, and only see the services IoTeedom switched on for them.

The first things we’re taking seriously:

- Paying water bills
- Paying ECG bills
- Managing smart homes, water meters, solar, and EVs from the same account
- General utility payments, so we’re not boxed into only water and power
- An EV charging setup with a partner — chargers at designated sites we place, paid through a mobile app we’ll build later

Users do not pick the catalog themselves. Superadmin invites the property owner and chooses which modules that owner can see. If someone only has ECG and water, that’s their product. If an estate needs meters, solar, and smart home, superadmin turns those on. We don’t force the full stack on everybody.

---

## Why this exists

Paying utilities in Ghana is still messy. ECG and water are the ones people deal with every month, and they’re usually handled in different apps, different queues, or cash. Smart devices are showing up in homes and on properties, but they live in their own apps too. EV charging is coming, and if we wait until the cars are everywhere before we think about payment, we’ll be late.

IoTeedom already sits in smart cities, IoT, and property. This product is the payments and control layer on top of that. One account. One dashboard. Superadmin decides which services are on.

The EV piece is part of a longer play. We’ll work with an EV partner, put chargers at designated locations, and let people pay from a phone when they plug in. That mobile app is not the first release. The dashboard is. The app comes once the core account, payments, and subscriptions are real.

---

## Who it’s for

**Superadmin (ops)**  
IoTeedom. Invites property owners onto the platform and chooses which features each owner can see. Can change that later. Does not live in the owner dashboard.

**Tenants**  
People living in a unit. They see their own usage and bills. They pay ECG themselves. They pay water to the property owner, not to Ghana Water.

**Property owners / landlords**  
People running one or more units. They collect water from tenants, then pay Ghana Water from their dashboard. They pay **their own** ECG the same way a tenant does — on their dashboard, to ECG. They can see whether tenants have settled ECG, but that money does not pass through them. They also get meters, smart home tracking, and a way to see what’s going on without calling someone every time.

**Owner-occupiers**  
Someone who lives in the house they own. No tenant hop: they pay ECG and Ghana Water themselves.

**EV drivers (later)**  
People charging at our sites. They’ll use the mobile app. The dashboard is where the account, wallet, and history live.

We’re not trying to be a bank. We’re the place you manage the services tied to a home, a property, or a vehicle.

---

## How money moves

ECG and water do **not** use the same rail. This is a product rule, not a UI detail.

### ECG — each person pays their own

ECG does not hop through the landlord. Whoever the meter belongs to pays it on **their** dashboard. The money goes to ECG.

```
Tenant           →  ECG   (that unit’s meter)
Property owner   →  ECG   (the owner’s own meter — house, common area, gate)
Owner-occupier   →  ECG   (the house)
```

The owner can see whether a tenant’s power is settled. They do not collect ECG and they do not pay a tenant’s bill.

### Water — tenant pays owner, owner pays Ghana Water

The water meter on the unit measures what the tenant used. That usage becomes a bill on the tenant’s dashboard. The tenant pays it on the platform; the money lands with the property owner. The owner then pays Ghana Water **from their dashboard** — using what they’ve collected, or covering a shortfall if a tenant is late.

```
Meter reading  →  tenant bill  →  property owner  →  Ghana Water
```

Both legs happen on this platform. Cash on the side is a failure of the product, not a supported path.

### What that means in the dashboard

| Who | ECG | Water |
| --- | --- | --- |
| Tenant | Pay **this unit’s** ECG. Receipt says ECG. | See usage, see the bill, pay the landlord. Receipt says it went to the owner. |
| Property owner | Pay **their own** ECG. See status per tenant unit. No “pay ECG for this tenant.” | Collection per unit, then a Ghana Water remittance from the same dashboard. Those are two different payments. |
| Owner-occupier | Pay ECG. | Pay Ghana Water. No collection step. |

Do not combine ECG and water into one “pay this unit” charge. They are different destinations.

---

## How we think about the product

The dashboard is the hub. Everything else plugs into it.

A user is invited, sets a PIN, confirms the property, then works inside the modules superadmin switched on. Each service is its own module. Modules can share the same account, the same payment methods, and the same activity history, but they don’t all have to be on.

That matters because:

- We can launch with bills and add hardware later
- A user who was only provisioned for payments is not staring at empty solar charts
- Partners (ECG, water, EV, device vendors) can be added without redesigning the whole product

If we get the hub right, adding a new utility or a new device type is configuration and an integration, not a new product.

---

## What users can subscribe to

These are the services we’re planning around. Not all of them ship in v1.

| Service               | What it is                                                             | When                                        |
| --------------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| ECG bills             | Each party pays their own ECG on their dashboard. Owner sees tenant status. | v1 |
| Water bills           | Tenant pays owner from meter usage. Owner remits to Ghana Water.       | v1                                          |
| Other utilities       | Room to add more billers (waste, internet, etc.) without a new product | v1 foundation, more billers over time       |
| Water meters          | Readings, usage, alerts (leak, unusual spike)                          | After bills, once meter integration is real |
| Smart home            | Control and status for connected devices                               | Phased with hardware partners               |
| Smart home tracking   | Usage, incidents, history — not just on/off                            | With smart home                             |
| Solar                 | Production, consumption, battery if we have it, history                | After we know the inverter / vendor         |
| EV (account side)     | Vehicle on the account, charging history, wallet                       | Dashboard first, app later                  |
| EV charging (on-site) | Pay at our chargers via the mobile app                                 | Future — needs partner + hardware + app     |

Provisioning is per property-owner account. Superadmin turns modules on or off. The owner cannot add a module themselves. Pricing is TBD with the client — could be per module, bundled, or free payments + paid monitoring. That’s a commercial decision. The product has to support “this account was given these modules.”

---

## v1 — the dashboard

v1 is a web dashboard. Logged-in users. Not the mobile charging app.

### Account and access

- Superadmin invites the property owner (phone and email). The owner does not self-serve onto the catalog.
- At invite time, superadmin chooses which modules that owner can see. They can change this later.
- Owner login (phone + PIN they were sent). They confirm the property and link biller numbers for the modules they were given.
- Owner dashboard only shows provisioned modules. Empty states if a module is off. No “add solar yourself” control.
- Tenants are on the owner’s account. They see ECG, water, and meters only if those are on for the owner.
- Profile: name, phone, homes / properties they manage.

### Payments

- Tenant: pay this unit’s ECG to ECG; pay water to the property owner
- Property owner: pay their own ECG to ECG; collect water from tenants; remit water to Ghana Water
- Owner-occupier: pay ECG and Ghana Water directly (no collection)
- Payment history that shows **who it went to**, not just the amount
- Saved payment methods — mobile money first, then cards if we can do it cleanly
- Receipts they can download or resend

We collect through **Paystack**. MTN MoMo, Telecel Cash, and AT Money are the rails people will actually use. Card is nice later (Paystack supports it). MoMo is required in v1.

A water payment has two ledgers, not one:

1. **Collection** — tenant → owner. This clears the tenant’s usage bill. It does not settle Ghana Water.
2. **Remittance** — owner → Ghana Water. This settles the GWCL account. It does not mark a tenant as paid.

ECG is a single ledger per meter: the person who uses that meter pays ECG. Tenant meters and owner meters are different bills. The owner never pays a tenant’s ECG.

For each rail, v1 should support:

- Looking up the account / meter / customer number (ECG for whoever owns that meter; GWCL for the owner)
- Seeing what’s owed from meter usage (water) or from the biller (ECG, GWCL)
- Paying it to the right destination
- Confirming it landed, and on whose account

If the official APIs are limited, we say so early and design around what’s actually available. Don’t promise live ECG balance if we’re going to be stuck on a reference number and a hope.

### Home / activity

- A simple home: what’s due, recent payments, any alerts from modules they subscribe to
- Empty states that tell you the module isn’t on this account, not a wall of dead widgets

### Admin (us / the client — superadmin)

- Invite a property owner: name, phone, property, and the module set
- Change which modules an owner can see after they’re on
- See users, payments, failed payments
- Basic support tools (find a user, see their last payments)

v1 admin does not need to be a masterpiece. It needs to exist so we’re not inviting people by spreadsheet and SSH’ing into a database to refund someone.

---

## After v1 — devices and tracking

This is where IoTeedom’s actual work sits. Payments get people in the door. Devices are why they stay.

### Water meters

- Tie a meter to a unit (tenant) and to the property’s Ghana Water account (owner)
- Show current reading and usage over time
- That usage is the tenant’s water bill — not a courtesy chart
- Alerts: leak, no usage when there should be, sudden spike
- Tenant pays the owner from this reading. Owner pays Ghana Water from the property account.

### Smart home

- Devices on the account (lights, locks, sensors, whatever the partner kit actually is)
- Status and basic control
- Tracking: events, temperature, leak/fire/air if those sensors are in the kit
- History you can look back on, not just a live blink

IoTeedom already talks about housing IoT kits (air, temperature, leaks, fire). This module should be designed so those kits have a home here, instead of a separate portal.

### Solar

- Site / inverter on the account
- Production vs what the house is using
- History by day / month
- Alerts if production drops off (inverter down, panel issue)

We’re not selling solar in the dashboard. We’re showing it and, where it makes sense, tying it to the same property as the bills and meters.

---

## EV charging — later, but designed for now

This is a real part of the product. It is not v1.

### What we agreed conceptually

- We work with an EV partner
- We place chargers at designated locations
- Drivers pay from a mobile app when they charge
- The same IoTeedom account sits behind it — wallet, history, support

### What the dashboard needs before the app exists

- Ability to attach a vehicle to an account
- A wallet or payment method that the future app can charge against
- Charging history once sessions start happening
- Operator view of sites and chargers (even if it’s rough)

### What the mobile app will need (when we build it)

- Find a charger / start a session at a site
- Pay for the session ( MoMo / wallet )
- Session status (charging, done, amount)
- History

We should pick the EV partner and the charger hardware _before_ we invent the app UX. The app is a client for whatever that stack is. If we design the app first, we’ll redraw it.

Until then, keep EV as a module on the account so we don’t have to migrate users later.

---

## Platform rules (so we don’t paint ourselves into a corner)

1. **One account, many services.** Identity and payments are shared. Features are not.
2. **Modules are provisioned.** Superadmin switches them on. The UI hides what this account was not given.
3. **Owners are invited.** The catalog is not a self-serve shop. Tenant access follows the owner’s modules.
4. **Ghana first.** ECG, water, MoMo, phone numbers, cedi. We can talk multi-country later. Don’t abstract so hard that v1 takes a year.
5. **Partners are integrations, not the product.** ECG, GWCL, EV partner, meter vendor, solar vendor. If one drops, the dashboard still stands.
6. **Mobile app is a client, not a rewrite.** Same APIs, same account. Dashboard first proves the backend.
7. **We don’t store card/MoMo secrets.** Use a proper payments provider. We store references and history.

---

## What we’re not doing (for now)

- The EV mobile app in v1
- Being a full bank / wallet that people keep salary in
- Marketplace, food, airtime (unless a utility payment partner already includes it and it’s cheap to offer)
- Building our own ECG billing system — we integrate
- Letting tenants pay Ghana Water themselves, or owners pay ECG on a tenant’s behalf, as if those were the same rail
- Hardware manufacturing — we integrate with partners and the kits IoTeedom already uses
- Multi-country in v1

If the client wants any of this in scope, we change the plan. Right now they’re out so the first version can actually ship.

---

## Success

v1 is successful if:

- A tenant can see water usage, pay the owner, and pay ECG, without calling us
- An owner can see what has been collected and pay Ghana Water from the same dashboard
- Payment history is trustworthy (status matches reality)
- Superadmin can invite an owner, pick their modules, and the owner’s dashboard only shows those
- We have a path to plug in meters, solar, and smart home without a rewrite
- The account model can take an EV module and a mobile app later without migrating everyone

Later success:

- Meter and smart home data people actually check
- Charging sessions completing and paying at our sites
- Property managers running more than one unit from one login

---

## Open questions for the client

These are the things I still need answers on before we lock build.

1. **Who is the first user?** Tenant, owner, or both in one estate. Roles are required for water; onboarding has to split them.
2. **ECG and water: prepaid, postpaid, or both?** And do we have API access, or are we starting with account-number pay? Water collection is usage-based from our meter even if GWCL is a lump account.
3. **Payment partner.** **Paystack** — MoMo collections (MTN, Telecel, AT) and payouts to owner wallets. ECG / GWCL fulfillment is a separate biller hop; Paystack does not credit those accounts itself.
4. **EV partner.** Named? Hardware already chosen? Timeline for placing chargers?
5. **Which IoT kits are in play for v1.1?** Water meters, solar inverters, smart home — vendors and whether they have APIs.
6. **Subscription commercial model.** Free to pay bills, paid for monitoring? Per module? Bundle for estates?
7. **Who operates support?** Us, the client, or both?
8. **Compliance.** Payments, data protection, any PURC / utility rules we need to respect before going live.

---

## Suggested build order

**Phase 1 — Dashboard & bills**  
Superadmin invites, module provisioning, accounts, ECG, water, MoMo payments, history, thin admin.

**Phase 2 — Property & devices**  
Water meters, smart home + tracking, solar. Whatever hardware is ready first.

**Phase 3 — EV**  
Partner integration, charger sites, wallet, then the mobile app for paying at the charger.

We can overlap Phase 2 work if a device vendor is ready while Phase 1 is in QA. We should not start the mobile app until Phase 1 accounts and payments are stable.

---

## Notes

This is the product as I understood it from the discussion: a dashboard we can keep integrating into, bills first, devices on the same account, EV and the mobile app as a later chapter. Superadmin invites the property owner and chooses what they can see. Water is not “another ECG.” Tenants pay the owner; the owner pays Ghana Water from their dashboard. ECG stays a direct pay: tenants and owners each pay **their own** ECG on their dashboard.

Once the open questions are answered, this becomes the spec we build against. Until then, treat the module list as the direction and Phase 1 as the commitment.
