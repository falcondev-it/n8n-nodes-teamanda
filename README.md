<a href="https://teamanda.app/">
	<picture>
		<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/falcondev-it/n8n-nodes-teamanda/dev/nodes/Teamanda/teamanda.dark.svg" />
		<img src="https://raw.githubusercontent.com/falcondev-it/n8n-nodes-teamanda/dev/nodes/Teamanda/teamanda.svg" alt="Teamanda" width="80" />
	</picture>
</a>

# @falcondev-it/n8n-nodes-teamanda

[Teamanda](https://teamanda.app/) is HR software for small and mid-sized businesses.

This n8n community node lets workflows read Teamanda employee, absence, attendance, payroll,
form, and scheduling data and manage time entries, tasks, projects, tags, and cost centers
through the Teamanda REST API.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Usage](#usage)
[Example workflows](#example-workflows)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation-and-management/) in the n8n
community nodes documentation and install the package `@falcondev-it/n8n-nodes-teamanda`.

## Operations

- Absence: Get, Get Absent Employees, Get Many
- Attendance: Get Many
- Cost Center: Create, Get, Get Many
- Daily Report: Get Many
- Employee: Get, Get Many
- Employee Field: Get Many
- Form Submission: Get, Get Many
- Overtime Payout: Get Many
- Pay Rate: Get Many
- Project: Create, Get, Get Many
- Resource: Get, Get Many
- Resource Booking: Get, Get Many
- Resource Entry: Get Many
- Special Payment: Get Many
- Tag: Create, Get, Get Many
- Task: Create, Get, Get Many, Update
- Time Entry: Create, Delete, Get, Get Many

Single employees, resources, tasks, task categories, projects, tags, and cost centers are picked
from a list or entered by ID. Teams, work types, employee fields, and the projects of a new tag
are offered as dropdowns loaded from the API.

## Credentials

Create an API key in Teamanda and enter it in the Teamanda API credential. The credential
sends the key through the `X-API-Key` header. The default API URL is
`https://api.teamanda.de/v1`; it can be changed for another Teamanda deployment. The
connection test calls `GET /connection` and needs no permission beyond a valid key.

## Usage

List operations support `Return All`, pagination, their resource-specific filters, and a
`Sort` collection. Task, time entry, and daily report operations return at most 10 fields by
default; turn off `Simplify` to get the full response. Deleting a time entry archives it in
Teamanda and outputs `{ "deleted": true }`. Creating time entries, tasks, projects, tags,
and cost centers (unless a number is given) is not idempotent, so do not automatically
retry it after an ambiguous timeout. Project members, locations, and custom fields cannot be
set through the API.

Date and time values without an offset are read in the workflow's timezone and sent to the
API as UTC.

The checked-in API types are generated from Teamanda's OpenAPI document. Maintainers can
refresh them with `pnpm api:update`; normal builds do not require network access. Every
request routing refers to its operation through the generated types, so an endpoint or
parameter that Teamanda renames fails the build.

## Example workflows

- [Monitor fire safety training](https://github.com/falcondev-it/n8n-nodes-teamanda/blob/dev/examples/fire-safety-training.workflow.json):
  creates a Teamanda task every day for each active employee whose last fire safety training
  is older than 6 months. Import the file in n8n and follow the setup steps in its sticky note.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Teamanda API documentation](https://api.teamanda.de/v1/docs)

## Version history

See the [GitHub releases](https://github.com/falcondev-it/n8n-nodes-teamanda/releases) for the changes in each version.
