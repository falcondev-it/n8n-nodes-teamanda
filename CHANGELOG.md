# Changelog

## 0.1.0

- Initial Teamanda community node with Absence, Attendance, Daily Report, Employee, Employee
  Field, Form Submission, Overtime Payout, Resource, Resource Booking, Special Payment, Task,
  Time Entry and Resource Entry resources, including the employee wage operation.
- Employees, teams, projects, cost centers, resources, task categories, employee fields and the
  organization's enabled work types are offered as dropdowns.
- Task, time entry and daily report operations offer a Simplify toggle, and Get Many
  operations sort through a dedicated Sort collection.
- Deleting a time entry outputs `{ "deleted": true }`.
- Employees can be filtered by attribute through a list of field and value pairs.
- Dates and times are sent as UTC instants, as the API requires, reading values without an
  offset in the workflow's timezone.
- Credentials are tested against `GET /connection`.
