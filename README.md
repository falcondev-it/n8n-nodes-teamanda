# n8n-nodes-teamanda

This n8n community node lets workflows read Teamanda employee, absence, attendance, payroll,
form and scheduling data, and manage time entries and tasks through the Teamanda REST API.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The node's interface is German.

- Abwesenheit (absence request): Abrufen, Abwesende Abrufen, Mehrere Abrufen
- Anwesenheit (attendance): Mehrere Abrufen
- Arbeitsplatzbuchung (workspace entry): Mehrere Abrufen
- Aufgabe (task): Abrufen, Aktualisieren, Erstellen, Mehrere Abrufen
- Formulareinreichung (form submission): Abrufen, Mehrere Abrufen
- Mitarbeiter (employee): Abrufen, Lohn Abrufen, Mehrere Abrufen
- Mitarbeiterfeld (employee field): Mehrere Abrufen
- Ressource (resource): Abrufen, Mehrere Abrufen
- Ressourcenbuchung (resource booking): Abrufen, Mehrere Abrufen
- Sonderzahlung (special payment): Mehrere Abrufen
- Tagesbericht (daily report): Mehrere Abrufen
- Überstundenauszahlung (overtime payout): Mehrere Abrufen
- Zeiteintrag (time entry): Abrufen, Erstellen, Löschen, Mehrere Abrufen

Employees, teams, projects, cost centers, work types, resources, task categories and
employee fields are offered as dropdowns loaded from the API.

## Credentials

Create an API key in Teamanda and enter it in the Teamanda API credential. The credential
sends the key through the `X-API-Key` header. The default API URL is
`https://api.teamanda.de/v1`; it can be changed for another Teamanda deployment. The
credential test calls `GET /connection`, which needs no permission beyond a valid key.

## Usage

Teamanda list operations support `Alle Zurückgeben`, pagination, and their resource-specific
filters. Deleting a time entry archives it. Creating a time entry or a task is not
idempotent, so do not automatically retry it after an ambiguous timeout.

The checked-in API types are generated from Teamanda's OpenAPI document. Maintainers can
refresh them with `pnpm api:update`; normal builds do not require network access. Every
request routing refers to its operation through the generated types, so an endpoint or
parameter that Teamanda renames fails the build.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Teamanda API documentation](https://api.teamanda.de/v1/docs)

## Version history

- 0.1.0: Initial Teamanda community node.
