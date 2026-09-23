# Changelog

## Unreleased

- Add Absence, Attendance, Daily Report, Employee Field, Form Submission, Overtime Payout,
  Special Payment, Task and Workspace Entry resources, and the employee wage operation.
- Offer employees, teams, projects, cost centers, resources, task categories, employee fields
  and the organization's enabled work types as dropdowns.
- New filters for employees (status, teams, search, fields) and time entries (changed since).
- Filter employees by attribute through a list of field and value pairs instead of raw JSON.
- Send dates and times as UTC instants, as the API requires, reading values without an offset
  in the workflow's timezone.
- Test credentials against `GET /connection`.

## 0.1.0

- Initial Teamanda community node with Employee, Time Entry, Resource, and Resource Booking
  resources. The node interface is labelled in German.
