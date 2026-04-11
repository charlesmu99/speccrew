# SpecCrew - Rask Startguide

<p align="center">
  <a href="./GETTING-STARTED.md">简体中文</a> |
  <a href="./GETTING-STARTED.zh-TW.md">繁體中文</a> |
  <a href="./GETTING-STARTED.en.md">English</a> |
  <a href="./GETTING-STARTED.ko.md">한국어</a> |
  <a href="./GETTING-STARTED.de.md">Deutsch</a> |
  <a href="./GETTING-STARTED.es.md">Español</a> |
  <a href="./GETTING-STARTED.fr.md">Français</a> |
  <a href="./GETTING-STARTED.it.md">Italiano</a> |
  <a href="./GETTING-STARTED.da.md">Dansk</a> |
  <a href="./GETTING-STARTED.ja.md">日本語</a> |
  <a href="./GETTING-STARTED.ar.md">العربية</a> |
  <a href="./GETTING-STARTED.no.md">Norsk</a>
</p>

Dette dokumentet hjelper deg med raskt å forstå hvordan du bruker SpecCrew Agent-teamet for å fullføre hele utviklingssyklusen fra krav til levering, etter standard ingeniørprosesser.

---

## 1. Forutsetninger

### Installer SpecCrew

```bash
npm install -g speccrew
```

### Initialiser Prosjekt

```bash
speccrew init --ide qoder
```

Støttede IDE-er: `qoder`, `cursor`, `claude`, `codex`

### Katalogstruktur Etter Initialisering

```
.
├── .qoder/
│   ├── agents/          # Agent-definisjonsfiler
│   └── skills/          # Skill-definisjonsfiler
├── speccrew-workspace/  # Arbeidsområde
│   ├── docs/            # Konfigurasjoner, regler, maler, løsninger
│   ├── iterations/      # Gjeldende iterasjoner
│   ├── iteration-archives/  # Arkiverte iterasjoner
│   └── knowledges/      # Kunnskapsbase
│       ├── base/        # Grunnleggende informasjon (diagnoserapporter, teknisk gjeld)
│       ├── bizs/        # Forretningskunnskapsbase
│       └── techs/       # Teknisk kunnskapsbase
```

### CLI-kommando Hurtigreferanse

| Kommando | Beskrivelse |
|---------|-------------|
| `speccrew list` | List opp alle tilgjengelige Agenter og Skills |
| `speccrew doctor` | Sjekk installasjonsintegritet |
| `speccrew update` | Oppdater prosjektkonfigurasjon til nyeste versjon |
| `speccrew uninstall` | Avinstaller SpecCrew |

---

## 2. Arbeidsflytoversikt

### Full Flytdiagram

```mermaid
flowchart LR
    PRD[Fase 1<br/>Kravanalyse<br/>Product Manager] --> FD[Fase 2<br/>Funksjonsdesign<br/>Feature Designer]
    FD --> SD[Fase 3<br/>Systemdesign<br/>System Designer]
    SD --> DEV[Fase 4<br/>Utvikling<br/>System Developer]
    DEV --> TEST[Fase 5<br/>Systemtesting<br/>Test Manager]
    TEST --> ARCHIVE[Fase 6<br/>Arkivering]
    
    KB[(Kunnskapsbase<br/>Gjennom Hele Prosessen)] -.-> PRD
    KB -.-> FD
    KB -.-> SD
    KB -.-> DEV
    KB -.-> TEST
```

### Grunnleggende Prinsipper

1. **Faseavhengigheter**: Hver fases output er input for neste fase
2. **Kontrollpunkt-bekreftelse**: Hver fase har et bekreftelsespunkt som krever brukergodkjenning før du fortsetter
3. **Kunnskapsbase-drevet**: Kunnskapsbasen strømmer gjennom hele prosessen, gir kontekst for alle faser

---

## 3. Kunnskapsbase-initialisering

Før du starter den formelle ingeniørprosessen, må du initialisere prosjektets kunnskapsbase.

### 3.1 Initialiser Teknisk Kunnskapsbase

**Eksempel på Dialog**:
```
@speccrew-team-leader initialiser teknisk kunnskapsbase
```

**Tre-fase Prosess**:
1. Plattformoppdagelse — Identifiser teknologiplattformer i prosjektet
2. Teknisk Dokumentasjonsgenerering — Generer tekniske spesifikasjonsdokumenter for hver plattform
3. Indeksgenerering — Etabler kunnskapsbase-indeks

**Leveranse**:
```
speccrew-workspace/knowledges/techs/{platform-id}/
├── tech-stack.md          # Teknologistabeldefinisjon
├── architecture.md        # Arkitekturkonvensjoner
├── dev-spec.md            # Utviklingsspesifikasjoner
├── test-spec.md           # Testspesifikasjoner
└── INDEX.md               # Indeksfil
```

### 3.2 Initialiser Forretningskunnskapsbase

**Eksempel på Dialog**:
```
@speccrew-team-leader initialiser forretningskunnskapsbase
```

**Fire-fase Prosess**:
1. Funksjonsinventar — Skann kode for å identifisere alle funksjoner
2. Funksjonsanalyse — Analyser forretningslogikk for hver funksjon
3. Modulsammendrag — Oppsummer funksjoner etter modul
4. Systemsammendrag — Generer forretningsoversikt på systemnivå

**Leveranse**:
```
speccrew-workspace/knowledges/bizs/
├── {platform-type}/
│   └── {module-name}/
│       └── feature-spec.md
└── system-overview.md
```

---

## 4. Fase-for-Fase Dialogguide

### 4.1 Fase 1: Kravanalyse (Product Manager)

**Hvordan Starte**:
```
@speccrew-product-manager jeg har et nytt krav: [beskriv kravet ditt]
```

**Agent Arbeidsflyt**:
1. Les systemoversikt for å forstå eksisterende moduler
2. Analyser brukerkrav
3. Generer strukturert PRD-dokument

**Leveranse**:
```
iterations/{nummer}-{type}-{navn}/01.product-requirement/
├── [feature-name]-prd.md           # Produktkravdokument
└── [feature-name]-bizs-modeling.md # Forretningsmodellering (for komplekse krav)
```

**Bekreftelseskontrollliste**:
- [ ] Reflekterer kravbeskrivelsen brukerens intensjon nøyaktig?
- [ ] Er forretningsregler komplette?
- [ ] Er integrasjonspunkter med eksisterende systemer klare?
- [ ] Er akseptkriterier målbare?

---

### 4.2 Fase 2: Funksjonsdesign (Feature Designer)

**Hvordan Starte**:
```
@speccrew-feature-designer start funksjonsdesign
```

**Agent Arbeidsflyt**:
1. Finn automatisk bekreftet PRD-dokument
2. Last inn forretningskunnskapsbase
3. Generer funksjonsdesign (inkludert UI-wireframes, interaksjonsflyter, datadefinisjoner, API-kontrakter)
4. For flere PRD-er, bruk Task Worker for parallell design

**Leveranse**:
```
iterations/{iter}/02.feature-design/
└── [feature-name]-feature-spec.md  # Funksjonsdesigndokument
```

**Bekreftelseskontrollliste**:
- [ ] Er alle brukerscenarier dekket?
- [ ] Er interaksjonsflyter klare?
- [ ] Er datafeltdefinisjoner komplette?
- [ ] Er unntakshåndtering omfattende?

---

### 4.3 Fase 3: Systemdesign (System Designer)

**Hvordan Starte**:
```
@speccrew-system-designer start systemdesign
```

**Agent Arbeidsflyt**:
1. Finn Feature Spec og API Contract
2. Last inn teknisk kunnskapsbase (teknologistabel, arkitektur, spesifikasjoner for hver plattform)
3. **Kontrollpunkt A**: Rammeverkvurdering — Analyser tekniske gap, anbefal nye rammeverk (om nødvendig), vent på brukerbekreftelse
4. Generer DESIGN-OVERVIEW.md
5. Bruk Task Worker for parallell designdistribusjon for hver plattform (frontend/backend/mobil/skrivebord)
6. **Kontrollpunkt B**: Felles Bekreftelse — Vis oppsummering av alle plattformdesign, vent på brukerbekreftelse

**Leveranse**:
```
iterations/{iter}/03.system-design/
├── DESIGN-OVERVIEW.md              # Designoversikt
├── {platform-id}/
│   ├── INDEX.md                    # Plattformdesign-indeks
│   └── {module}-design.md          # Moduldesign på pseudokodenivå
```

**Bekreftelseskontrollliste**:
- [ ] Bruker pseudokoden faktisk rammeverksyntaks?
- [ ] Er cross-plattform API-kontrakter konsistente?
- [ ] Er feilhåndteringsstrategi unified?

---

### 4.4 Fase 4: Utviklingsimplementering (System Developer)

**Hvordan Starte**:
```
@speccrew-system-developer start utvikling
```

**Agent Arbeidsflyt**:
1. Les systemdesigndokumenter
2. Last inn teknisk kunnskap for hver plattform
3. **Kontrollpunkt A**: Miljø-forhåndsverifisering — Verifiser runtime-versjoner, avhengigheter, tjenestetilgjengelighet; hvis mislykkes, vent på brukerløsning
4. Bruk Task Worker for parallell utviklingsdistribusjon for hver plattform
5. Integrasjonsverifisering: API-kontraktsjustering, datakonsistens
6. Output leveranserapport

**Leveranse**:
```
# Kildekode skrives til prosjektets faktiske kildekodekatalog
iterations/{iter}/04.development/
├── {platform-id}/
│   └── tasks/                      # Utviklingsopptegnelser
└── delivery-report.md
```

**Bekreftelseskontrollliste**:
- [ ] Er miljøet klart?
- [ ] Er integrasjonsproblemer innen akseptabelt område?
- [ ] Følger koden utviklingsspesifikasjoner?

---

### 4.5 Fase 5: Systemtesting (Test Manager)

**Hvordan Starte**:
```
@speccrew-test-manager start testing
```

**Tre-fase Testprosess**:

| Fase | Beskrivelse | Kontrollpunkt |
|------|----------|-------------------|
| Testtilfelldesign | Generer testtilfeller basert på PRD og Feature Spec | A: Vis testtilfelde-dekningsstatistikk og sporbarhetsmatrise, vent på brukerbekreftelse på tilstrekkelig dekning |
| Testkodegenerering | Generer kjørbart testkode | B: Vis genererte testfiler og用例-mapping, vent på brukerbekreftelse |
| Testutførelse og Feilrapport | Utfør tester automatisk og generer rapporter | Ingen (automatisk utførelse) |

**Leveranse**:
```
iterations/{iter}/05.system-test/
├── cases/
│   └── {platform-id}/              # Testtilfelldokumenter
├── code/
│   └── {platform-id}/              # Testkodeplan
├── reports/
│   └── test-report-{date}.md       # Testrapport
└── bugs/
    └── BUG-{id}-{title}.md         # Feilrapporter (én fil per feil)
```

**Bekreftelseskontrollliste**:
- [ ] Er testtilfelledekning komplett?
- [ ] Er testkoden kjørbar?
- [ ] Er feilalvorlighetsvurdering nøyaktig?

---

### 4.6 Fase 6: Arkivering

Iterasjoner arkiveres automatisk når de er fullført:

```
speccrew-workspace/iteration-archives/
└── {nummer}-{type}-{navn}-{dato}/
    ├── 01.product-requirement/
    ├── 02.feature-design/
    ├── 03.system-design/
    ├── 04.development/
    └── 05.system-test/
```

---

## 5. Kunnskapsbaseoversikt

### 5.1 Forretningskunnskapsbase (bizs)

**Formål**: Lagre prosjektets forretningsfunksjonsbeskrivelser, moduloppdelinger, API-kjennetegn

**Katalogstruktur**:
```
knowledges/bizs/
├── {platform-type}/
│   └── {module-name}/
│       └── feature-spec.md
└── system-overview.md
```

**Bruksscenarier**: Product Manager, Feature Designer

### 5.2 Teknisk Kunnskapsbase (techs)

**Formål**: Lagre prosjektets teknologistabel, arkitekturkonvensjoner, utviklingsspesifikasjoner, testspesifikasjoner

**Katalogstruktur**:
```
knowledges/techs/{platform-id}/
├── tech-stack.md
├── architecture.md
├── dev-spec.md
├── test-spec.md
└── INDEX.md
```

**Bruksscenarier**: System Designer, System Developer, Test Manager

---

## 6. Arbeidsflytforløpsstyring

Det virtuelle SpecCrew-teamet følger en streng fase-port-mekanisme hvor hver fase må bekreftes av brukeren før man fortsetter til den neste. Det støtter også gjenopptakbar utførelse — når det startes på nytt etter avbrudd, fortsetter det automatisk fra hvor det slapp.

### 6.1 Trelagsforløpsfiler

Arbeidsflyten vedlikeholder automatisk tre typer JSON-forløpsfiler, plassert i iterasjonskatalogen:

| Fil | Plassering | Formål |
|------|----------|---------|
| `WORKFLOW-PROGRESS.json` | `iterations/{iter}/` | Registrerer status for hver pipeline-fase |
| `.checkpoints.json` | Under hver fasekatalog | Registrerer brukerens sjekkpunkt-bekreftelsesstatus |
| `DISPATCH-PROGRESS.json` | Under hver fasekatalog | Registrerer punkt-for-punkt forløp for parallelle oppgaver (multi-plattform/multi-modul) |

### 6.2 Fasestatusforløp

Hver fase følger dette statusforløpet:

```
pending → in_progress → completed → confirmed
```

- **pending**: Ikke startet ennå
- **in_progress**: Utføres for øyeblikket
- **completed**: Agent-utførelse fullført, venter på brukerbekreftelse
- **confirmed**: Bruker bekreftet gjennom siste sjekkpunkt, neste fase kan starte

### 6.3 Gjenopptakbar Utførelse

Når en Agent startes på nytt for en fase:

1. **Automatisk oppstrømskontroll**: Verifiserer om den forrige fasen er bekreftet, blokkerer og varsler hvis ikke
2. **Sjekkpunkt-gjenoppretting**: Leser `.checkpoints.json`, hopper over passerte sjekkpunkter, fortsetter fra det siste avbruddspunktet
3. **Parallell oppgave-gjenoppretting**: Leser `DISPATCH-PROGRESS.json`, utfører kun oppgaver med `pending` eller `failed` status på nytt, hopper over `completed` oppgaver

### 6.4 Vise Nåværende Forløp

Vis pipeline-panorama-status gjennom Team Leader Agent:

```
@speccrew-team-leader vis nåværende iterasjonsforløp
```

Team Leader vil lese forløpsfilene og vise en statusoversikt som ligner på:

```
Pipeline Status: i001-user-management
  01 PRD:            ✅ Bekreftet
  02 Feature Design: 🔄 Pågår (Sjekkpunkt A passert)
  03 System Design:  ⏳ Avventer
  04 Development:    ⏳ Avventer
  05 System Test:    ⏳ Avventer
```

### 6.5 Bakoverkompatibilitet

Forløpsfil-mekanismen er fullstendig bakoverkompatibel — hvis forløpsfiler ikke finnes (f.eks. i eldre prosjekter eller nye iterasjoner), vil alle Agenter utføre normalt i henhold til den opprinnelige logikken.

---

## 7. Ofte Stilte Spørsmål (FAQ)

### S1: Hva gjør jeg hvis Agenten ikke fungerer som forventet?

1. Kjør `speccrew doctor` for å sjekke installasjonsintegritet
2. Bekreft at kunnskapsbasen er initialisert
3. Bekreft at forrige fases leveranse finnes i gjeldende iterasjonskatalog

### S2: Hvordan hoppe over en fase?

**Anbefales ikke** — Hver fases output er input for neste fase.

Hvis du må hoppe over, forbered manuelt input-dokumentet for den tilsvarende fasen og sørg for at det følger formatspesifikasjoner.

### S3: Hvordan håndtere flere parallelle krav?

Opprett uavhengige iterasjonskataloger for hvert krav:
```
iterations/
├── 001-feature-xxx/
├── 002-feature-yyy/
└── 003-feature-zzz/
```

Hver iterasjon er fullstendig isolert og påvirker ikke hverandre.

### S4: Hvordan oppdatere SpecCrew-versjonen?

Oppdatering krever to trinn:

```bash
# Trinn 1: Oppdater globalt CLI-verktøy
npm install -g speccrew@latest

# Trinn 2: Synkroniser Agenter og Skills i prosjektkatalogen din
cd /path/to/your-project
speccrew update
```

- `npm install -g speccrew@latest`: Oppdaterer selve CLI-verktøyet (nye versjoner kan inkludere nye Agent/Skill-definisjoner, feilrettelser osv.)
- `speccrew update`: Synkroniserer Agent- og Skill-definisjonsfiler i prosjektet ditt til den nyeste versjonen
- `speccrew update --ide cursor`: Oppdaterer konfigurasjon kun for en spesifikk IDE

> **Merk**: Begge trinnene er nødvendige. Hvis du bare kjører `speccrew update`, oppdateres ikke selve CLI-verktøyet; hvis du bare kjører `npm install`, oppdateres ikke prosjektfilene.

### S5: `speccrew update` viser ny versjon men etter installasjon er det fortsatt den gamle?

Vanligvis forårsaket av npm-hurtigbuffer. Løsning:

```bash
npm cache clean --force
npm install -g speccrew@latest
npm list -g speccrew
```

Hvis det fortsatt ikke fungerer, spesifiser versjonsnummeret:
```bash
npm install -g speccrew@0.5.6
```

### S6: Hvordan se historiske iterasjoner?

Etter arkivering, se i `speccrew-workspace/iteration-archives/`, organisert i formatet `{nummer}-{type}-{navn}-{dato}/`.

### S7: Trenger kunnskapsbasen regelmessig oppdatering?

Re-initialisering kreves i følgende situasjoner:
- Betydelige endringer i prosjektstruktur
- Oppdatering eller erstatning av teknologistabel
- Legge til/fjerne forretningsmoduler

---

## 8. Hurtigreferanse

### Agent-start Hurtigreferanse

| Fase | Agent | Startdialog |
|------|-------|-------------------|

| Initialisering | Team Leader | `@speccrew-team-leader initialiser teknisk kunnskapsbase` |
| Kravanalyse | Product Manager | `@speccrew-product-manager jeg har et nytt krav: [beskrivelse]` |
| Funksjonsdesign | Feature Designer | `@speccrew-feature-designer start funksjonsdesign` |
| Systemdesign | System Designer | `@speccrew-system-designer start systemdesign` |
| Utvikling | System Developer | `@speccrew-system-developer start utvikling` |
| Systemtesting | Test Manager | `@speccrew-test-manager start testing` |

### Kontrollpunkter Kontrollliste

| Fase | Antall Kontrollpunkter | Nøkkelelementer for Verifisering |
|------|------------------------|--------------------------------|
| Kravanalyse | 1 | Kravnøyaktighet, forretningsregler kompletthet, akseptkriterier målbarhet |
| Funksjonsdesign | 1 | Szenariedekning, interaksjonsklarhet, datakompletthet, unntakshåndtering |
| Systemdesign | 2 | A: Rammeverkvurdering; B: Pseudokodesyntaks, cross-plattform konsistens, feilhåndtering |
| Utvikling | 1 | A: Miljøklarhet, integrasjonsproblemer, kodespesifikasjoner |
| Systemtesting | 2 | A: Tilfelledekning; B: Testkodekjørbarhet |

### Leveransesti Hurtigreferanse

| Fase | Output-katalog | Filformat |
|------|------------------|-------------|
| Kravanalyse | `iterations/{iter}/01.product-requirement/` | `[name]-prd.md`, `[name]-bizs-modeling.md` |
| Funksjonsdesign | `iterations/{iter}/02.feature-design/` | `[name]-feature-spec.md` |
| Systemdesign | `iterations/{iter}/03.system-design/` | `DESIGN-OVERVIEW.md`, `{platform}/INDEX.md`, `{platform}/{module}-design.md` |
| Utvikling | `iterations/{iter}/04.development/` | Kildekode + `delivery-report.md` |
| Systemtesting | `iterations/{iter}/05.system-test/` | `cases/`, `code/`, `reports/`, `bugs/` |
| Arkivering | `iteration-archives/{iter}-{dato}/` | Fullstendig kopi av iterasjonen |

---

## Neste Steg

1. Kjør `speccrew init --ide qoder` for å initialisere prosjektet ditt
2. Utfør Kunnskapsbase-initialisering
3. Beveg deg gjennom hver fase etter arbeidsflyten, nyt spesifikasjonsdrevet utviklingserfaring!
