# n8n-nodes-teamanda

This n8n community node lets workflows read Teamanda employees and scheduling data and
manage completed time entries through the Teamanda REST API.

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

- Employee: Get, Get Many
- Time Entry: Create, Delete, Get, Get Many
- Resource: Get, Get Many
- Resource Booking: Get, Get Many

## Credentials

Create an API key in Teamanda and enter it in the Teamanda API credential. The credential
sends the key through the `X-API-Key` header. The default API URL is
`https://api.teamanda.de/v1`; it can be changed for another Teamanda deployment.

## Usage

Teamanda list operations support `Return All`, pagination, and their resource-specific
filters. Deleting a time entry archives it. Creating a time entry is not idempotent, so do
not automatically retry it after an ambiguous timeout.

The checked-in API types are generated from Teamanda's OpenAPI document. Maintainers can
refresh them with `pnpm api:update`; normal builds do not require network access. Every
request routing refers to its operation through the generated types, so an endpoint or
parameter that Teamanda renames fails the build.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Teamanda API documentation](https://api.teamanda.de/v1/docs)

## Version history

- 0.1.0: Initial Teamanda community node.
