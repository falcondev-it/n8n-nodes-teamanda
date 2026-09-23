# n8n-nodes-teamanda

Mit diesem n8n-Community-Node lesen Workflows über die Teamanda-REST-API Mitarbeiter-,
Abwesenheits-, Anwesenheits-, Lohn-, Formular- und Planungsdaten und verwalten
Zeiteinträge und Aufgaben.

[n8n](https://n8n.io/) ist eine Workflow-Automatisierungsplattform unter [Fair-Code-Lizenz](https://docs.n8n.io/sustainable-use-license/).

[Installation](#installation)
[Operationen](#operationen)
[Zugangsdaten](#zugangsdaten)
[Verwendung](#verwendung)
[Ressourcen](#ressourcen)
[Versionsverlauf](#versionsverlauf)

## Installation

Folge der [Installationsanleitung](https://docs.n8n.io/integrations/community-nodes/installation/) in der Dokumentation zu n8n-Community-Nodes.

## Operationen

- Abwesenheit: Abrufen, Abwesende Abrufen, Mehrere Abrufen
- Anwesenheit: Mehrere Abrufen
- Arbeitsplatzbuchung: Mehrere Abrufen
- Aufgabe: Abrufen, Aktualisieren, Erstellen, Mehrere Abrufen
- Formulareinreichung: Abrufen, Mehrere Abrufen
- Mitarbeiter: Abrufen, Lohn Abrufen, Mehrere Abrufen
- Mitarbeiterfeld: Mehrere Abrufen
- Ressource: Abrufen, Mehrere Abrufen
- Ressourcenbuchung: Abrufen, Mehrere Abrufen
- Sonderzahlung: Mehrere Abrufen
- Tagesbericht: Mehrere Abrufen
- Überstundenauszahlung: Mehrere Abrufen
- Zeiteintrag: Abrufen, Erstellen, Löschen, Mehrere Abrufen

Mitarbeiter, Teams, Projekte, Kostenstellen, Zeittypen, Ressourcen, Aufgabenkategorien und
Mitarbeiterfelder stehen als Dropdowns zur Auswahl, die aus der API geladen werden.

## Zugangsdaten

Lege in Teamanda einen API-Schlüssel an und trage ihn in den Zugangsdaten „Teamanda API“
ein. Der Schlüssel wird im Header `X-API-Key` gesendet. Die Standard-API-URL ist
`https://api.teamanda.de/v1` und lässt sich für eine andere Teamanda-Instanz ändern. Der
Verbindungstest ruft `GET /connection` auf und braucht außer einem gültigen Schlüssel keine
Berechtigung.

## Verwendung

Listen-Operationen unterstützen `Alle Zurückgeben`, Paginierung und ihre jeweiligen Filter.
Das Löschen eines Zeiteintrags archiviert ihn. Das Erstellen von Zeiteinträgen und Aufgaben
ist nicht idempotent, also nach einem unklaren Timeout nicht automatisch wiederholen.

Datums- und Zeitwerte ohne Offset werden in der Zeitzone des Workflows gelesen und als UTC
an die API gesendet.

Die eingecheckten API-Typen werden aus Teamandas OpenAPI-Dokument erzeugt. Maintainer
aktualisieren sie mit `pnpm api:update`; ein normaler Build braucht keinen Netzwerkzugriff.
Jedes Request-Routing verweist über die erzeugten Typen auf seine Operation, sodass ein
Endpoint oder Parameter, den Teamanda umbenennt, den Build scheitern lässt.

## Ressourcen

- [Dokumentation zu n8n-Community-Nodes](https://docs.n8n.io/integrations/#community-nodes)
- [Teamanda-API-Dokumentation](https://api.teamanda.de/v1/docs)

## Versionsverlauf

- 0.1.0: Erste Version des Teamanda-Community-Nodes.
