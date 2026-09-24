# n8n-nodes-teamanda

This n8n community node lets workflows read Teamanda employee, absence, attendance, payroll,
form, and scheduling data and manage time entries and tasks through the Teamanda REST API.

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

- Absence: Get, Get Absent Employees, Get Many
- Attendance: Get Many
- Daily Report: Get Many
- Employee: Get, Get Many, Get Wage
- Employee Field: Get Many
- Form Submission: Get, Get Many
- Overtime Payout: Get Many
- Resource: Get, Get Many
- Resource Booking: Get, Get Many
- Resource Entry: Get Many
- Special Payment: Get Many
- Task: Create, Get, Get Many, Update
- Time Entry: Create, Delete, Get, Get Many

Employees, teams, projects, cost centers, work types, resources, task categories, and employee
fields are offered as dropdowns loaded from the API.

## Credentials

Create an API key in Teamanda and enter it in the Teamanda API credential. The credential
sends the key through the `X-API-Key` header. The default API URL is
`https://api.teamanda.de/v1`; it can be changed for another Teamanda deployment. The
connection test calls `GET /connection` and needs no permission beyond a valid key.

## Usage

List operations support `Return All`, pagination, their resource-specific filters, and a
`Sort` collection. Deleting a time entry archives it in Teamanda and outputs
`{ "deleted": true }`. Creating time entries and tasks is not idempotent, so do
not automatically retry it after an ambiguous timeout.

Date and time values without an offset are read in the workflow's timezone and sent to the
API as UTC.

The checked-in API types are generated from Teamanda's OpenAPI document. Maintainers can
refresh them with `pnpm api:update`; normal builds do not require network access. Every
request routing refers to its operation through the generated types, so an endpoint or
parameter that Teamanda renames fails the build.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Teamanda API documentation](https://api.teamanda.de/v1/docs)

## Version history

- 0.1.0: Initial Teamanda community node.
