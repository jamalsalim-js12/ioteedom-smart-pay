# IoTeedom Smart Pay — Product Requirements

**Status:** Draft after client discussion  
**Date:** 18 August 2026  
**Product:** A modular dashboard for utilities, IoT, and payments — with a mobile app coming later

---

## What this is

We’re building a dashboard that can take on a lot of services over time. The point is not to ship one giant app that tries to do everything on day one. The point is to have one place a household or property can log into, pick the services they actually need, and manage them from there.

The first things we’re taking seriously:

- Paying water bills
- Paying ECG bills
- Managing smart homes, water meters, solar, and EVs from the same account
- General utility payments, so we’re not boxed into only water and power
- An EV charging setup with a partner — chargers at designated sites we place, paid through a mobile app we’ll build later

Users subscribe to what they want. If someone only cares about ECG and water, that’s their product. If a property owner wants meters, solar tracking, and smart home controls, they add those. We don’t force the full stack on everybody.

---

## Why this exists

Paying utilities in Ghana is still messy. ECG and water are the ones people deal with every month, and they’re usually handled in different apps, different queues, or cash. Smart devices are showing up in homes and on properties, but they live in their own apps too. EV charging is coming, and if we wait until the cars are everywhere before we think about payment, we’ll be late.

IoTeedom already sits in smart cities, IoT, and property. This product is the payments and control layer on top of that. One account. One dashboard. Services you opt into.

The EV piece is part of a longer play. We’ll work with an EV partner, put chargers at designated locations, and let people pay from a phone when they plug in. That mobile app is not the first release. The dashboard is. The app comes once the core account, payments, and subscriptions are real.

---

## Who it’s for

**Households**  
People who want to pay ECG and water without jumping between systems, and maybe keep an eye on a meter or a solar setup.

**Property owners / managers**  
People running one or more units who need meters, smart home tracking, and a way to see what’s going on without calling someone every time.

**EV drivers (later)**  
People charging at our sites. They’ll use the mobile app. The dashboard is where the account, wallet, and history live.

We’re not trying to be a bank. We’re the place you manage the services tied to a home, a property, or a vehicle.

---

## How we think about the product

The dashboard is the hub. Everything else plugs into it.

A user signs up, sets up a profile (home, property, later a vehicle), then chooses services. Each service is its own module. Modules can share the same account, the same payment methods, and the same activity history, but they don’t all have to be on.

That matters because:

- We can launch with bills and add hardware later
- A user who only wants payments is not staring at empty solar charts
- Partners (ECG, water, EV, device vendors) can be added without redesigning the whole product

If we get the hub right, adding a new utility or a new device type is configuration and an integration, not a new product.

---

## What users can subscribe to

These are the services we’re planning around. Not all of them ship in v1.

| Service               | What it is                                                             | When                                        |
| --------------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| ECG bills             | View balance / bill, pay, keep history                                 | v1                                          |
| Water bills           | Same idea for water                                                    | v1                                          |
| Other utilities       | Room to add more billers (waste, internet, etc.) without a new product | v1 foundation, more billers over time       |
| Water meters          | Readings, usage, alerts (leak, unusual spike)                          | After bills, once meter integration is real |
| Smart home            | Control and status for connected devices                               | Phased with hardware partners               |
| Smart home tracking   | Usage, incidents, history — not just on/off                            | With smart home                             |
| Solar                 | Production, consumption, battery if we have it, history                | After we know the inverter / vendor         |
| EV (account side)     | Vehicle on the account, charging history, wallet                       | Dashboard first, app later                  |
| EV charging (on-site) | Pay at our chargers via the mobile app                                 | Future — needs partner + hardware + app     |

Subscription is per account. A user can turn services on or off. Pricing is TBD with the client — could be per module, bundled, or free payments + paid monitoring. That’s a commercial decision, not a product one yet, but the product has to support “this account has these modules.”

---

## v1 — the dashboard

v1 is a web dashboard. Logged-in users. Not the mobile charging app.

### Account and access

- Sign up / login (email and phone). Phone matters here.
- Profile: name, phone, homes / properties they manage.
- Roles if we need them later (owner vs occupant). Don’t overbuild this in v1 unless the client has a property-manager use case that requires it on day one.
- User picks services during onboarding and can change them later in settings.

### Payments

- Pay ECG
- Pay water
- Payment history (what, when, how much, status)
- Saved payment methods — mobile money first, then cards if we can do it cleanly
- Receipts they can download or resend

We should assume MTN MoMo, Telecel Cash, and AT Money are the rails people will actually use. Card is nice. MoMo is required.

For ECG and water, v1 should support:

- Looking up the account / meter / customer number
- Seeing what’s owed (or prepaid credit, depending on what the biller gives us)
- Paying it
- Confirming it landed

If the official APIs are limited, we say so early and design around what’s actually available. Don’t promise live ECG balance if we’re going to be stuck on a reference number and a hope.

### Home / activity

- A simple home: what’s due, recent payments, any alerts from modules they subscribe to
- Empty states that tell you to add a service, not a wall of dead widgets

### Admin (us / the client)

- See users, payments, failed payments
- Manage which services are available
- Basic support tools (find a user, see their last payments)

v1 admin does not need to be a masterpiece. It needs to exist so we’re not SSH’ing into a database to refund someone.

---

## After v1 — devices and tracking

This is where IoTeedom’s actual work sits. Payments get people in the door. Devices are why they stay.

### Water meters

- Tie a meter to a home
- Show current reading and usage over time
- Alerts: leak, no usage when there should be, sudden spike
- Eventually: pay based on actual usage if the biller / setup supports it

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
2. **Modules can be off.** The UI hides what you didn’t subscribe to.
3. **Ghana first.** ECG, water, MoMo, phone numbers, cedi. We can talk multi-country later. Don’t abstract so hard that v1 takes a year.
4. **Partners are integrations, not the product.** ECG, GWCL, EV partner, meter vendor, solar vendor. If one drops, the dashboard still stands.
5. **Mobile app is a client, not a rewrite.** Same APIs, same account. Dashboard first proves the backend.
6. **We don’t store card/MoMo secrets.** Use a proper payments provider. We store references and history.

---

## What we’re not doing (for now)

- The EV mobile app in v1
- Being a full bank / wallet that people keep salary in
- Marketplace, food, airtime (unless a utility payment partner already includes it and it’s cheap to offer)
- Building our own ECG or water billing system — we integrate
- Hardware manufacturing — we integrate with partners and the kits IoTeedom already uses
- Multi-country in v1

If the client wants any of this in scope, we change the plan. Right now they’re out so the first version can actually ship.

---

## Success

v1 is successful if:

- A user can create an account, add ECG and water, and pay both without calling us
- Payment history is trustworthy (status matches reality)
- A user can subscribe to only the services they want, and the dashboard doesn’t look broken
- We have a path to plug in meters, solar, and smart home without a rewrite
- The account model can take an EV module and a mobile app later without migrating everyone

Later success:

- Meter and smart home data people actually check
- Charging sessions completing and paying at our sites
- Property managers running more than one unit from one login

---

## Open questions for the client

These are the things I still need answers on before we lock build.

1. **Who is the first user?** Household, estate, or both? This decides roles and onboarding.
2. **ECG and water: prepaid, postpaid, or both?** And do we have API access, or are we starting with account-number pay?
3. **Payment partner.** Who are we using for MoMo / collections? Existing relationship or we choose?
4. **EV partner.** Named? Hardware already chosen? Timeline for placing chargers?
5. **Which IoT kits are in play for v1.1?** Water meters, solar inverters, smart home — vendors and whether they have APIs.
6. **Subscription commercial model.** Free to pay bills, paid for monitoring? Per module? Bundle for estates?
7. **Who operates support?** Us, the client, or both?
8. **Compliance.** Payments, data protection, any PURC / utility rules we need to respect before going live.

---

## Suggested build order

**Phase 1 — Dashboard & bills**  
Accounts, subscriptions, ECG, water, MoMo payments, history, thin admin.

**Phase 2 — Property & devices**  
Water meters, smart home + tracking, solar. Whatever hardware is ready first.

**Phase 3 — EV**  
Partner integration, charger sites, wallet, then the mobile app for paying at the charger.

We can overlap Phase 2 work if a device vendor is ready while Phase 1 is in QA. We should not start the mobile app until Phase 1 accounts and payments are stable.

---

## Notes

This is the product as I understood it from the discussion: a dashboard we can keep integrating into, bills first, devices on the same account, EV and the mobile app as a later chapter, and users choosing what they subscribe to.

Once the open questions are answered, this becomes the spec we build against. Until then, treat the module list as the direction and Phase 1 as the commitment.
