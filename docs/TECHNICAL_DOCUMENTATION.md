# 📘 Rural-Nex Technical Documentation & Code Architecture Guide

Welcome to the **Rural-Nex Technical Documentation**. This document provides an exhaustive, line-by-level architectural guide, code explanation, data pipeline walkthrough, error handling specification, and visual flowchart set for the Rural-Nex platform.

---

## 📌 Table of Contents
1. [System Overview & Architectural Principles](#1-system-overview--architectural-principles)
2. [Authentication & Identity System (Deep-Dive)](#2-authentication--identity-system-deep-dive)
3. [Geospatial Intelligence & GIS Engine (Deep-Dive)](#3-geospatial-intelligence--gis-engine-deep-dive)
4. [Financial Viability Engine & Loan Calculators (Deep-Dive)](#4-financial-viability-engine--loan-calculators-deep-dive)
5. [AI Advisory & Multi-Engine Feasibility Pipeline (Deep-Dive)](#5-ai-advisory--multi-engine-feasibility-pipeline-deep-dive)
6. [Government Scheme Matching & Subsidy Engine (Deep-Dive)](#6-government-scheme-matching--subsidy-engine-deep-dive)
7. [What-If Simulator & Business Comparison Matrix](#7-what-if-simulator--business-comparison-matrix)
8. [Frontend Architecture & Resilience Patterns](#8-frontend-architecture--resilience-patterns)
9. [Comprehensive Error Handling Matrix & Status Codes](#9-comprehensive-error-handling-matrix--status-codes)

---

## 1. System Overview & Architectural Principles

Rural-Nex is built as a **decoupled monorepo** adhering to three core engineering principles:

```mermaid
graph TD
    subgraph ArchitecturalPrinciples["Core Architectural Principles"]
        P1["🛡️ Hybrid Determinism<br/>(Deterministic Math + Generative AI)"]
        P2["⚡ Multi-Tier Resilience<br/>(Graceful Fallbacks & Offline Capabilities)"]
        P3["🔒 Zero-Trust Privacy<br/>(Local Biometrics & Encryption)"]
    end
```

1. **Hybrid Determinism**: Financial numbers, feasibility scores, and government subsidy matchings are computed strictly by **deterministic algorithms** (Python / PostGIS) to guarantee 100% mathematical precision. Generative AI (Google Gemini) is only used for qualitative synthesis, SWOT analysis, and natural language communication.
2. **Multi-Tier Resilience**: If external LLM APIs (Gemini) or SMS Gateways fail, the system automatically degrades gracefully to local mock providers, fallback calculations, or local demo sessions—ensuring zero application crashes.
3. **Zero-Trust Privacy & Biometrics**: Facial biometrics are processed by extracting non-reversible mathematical embedding vectors using OpenCV/face models; raw facial images are never stored permanently.

---

## 2. Authentication & Identity System (Deep-Dive)

The authentication module in `backend/users/` supports **5 distinct authentication pipelines**, designed to accommodate rural users with varying technical capabilities.

### Authentication Pipeline Architecture

```mermaid
flowchart TD
    Req["Incoming Auth Request"] --> Type{"Request Type"}
    
    Type -- "Username / Pass" --> JWT["TokenObtainPairView"]
    Type -- "Phone Number" --> SMS["SendPhoneOTPView"]
    Type -- "Facial Camera Data" --> Face["FaceLoginView"]
    Type -- "Google OAuth" --> Google["GoogleLoginView"]
    
    SMS --> SMS_Cache["Generate 6-Digit OTP -> Store in Cache (300s TTL)"]
    SMS_Cache --> SMS_Verify["VerifyPhoneOTPView"]
    
    Face --> OpenCV["OpenCV Facial Landmark Extractor"]
    OpenCV --> Vec["Extract 128D Embedding Vector"]
    Vec --> Cosine["Calculate L2 Euclidean Distance against User Embeddings"]
    Cosine --> Match{"Distance < 0.6?"}
    Match -- Yes --> Face_Success["Retrieve Associated User"]
    Match -- No --> Face_Fail["Return 401 Unauthorized ('Face not recognized')"]
    
    JWT & SMS_Verify & Face_Success & Google --> Check2FA{"Is 2FA Enabled?"}
    Check2FA -- Yes --> Prompt2FA["Return 2FA Required Token (403 Status)"]
    Prompt2FA --> Verify2FA["Verify2FAView (TOTP Verification)"]
    Verify2FA --> IssueToken["Issue SimpleJWT Access Token (15m) + Refresh Token (7d)"]
    Check2FA -- No --> IssueToken
    
    IssueToken --> Session["Record Active Session in Database (IP, User-Agent)"]
```

### Step-by-Step Code Execution & Logic

#### 1. Biometric Face Login (`FaceLoginView` in `backend/users/views.py`)
```python
class FaceLoginView(APIView):
    def post(self, request):
        image_data = request.data.get('image') # Base64 Data URL
        # Step 1: Decode Base64 string to OpenCV BGR matrix
        # Step 2: Extract face encoding vector using deep neural net
        # Step 3: Compare against stored profile encodings:
        #        distance = numpy.linalg.norm(stored_encoding - input_encoding)
        # Step 4: If multiple matches exist (family accounts), return candidate list.
        # Step 5: On single match (distance < threshold), generate SimpleJWT tokens.
```
* **Error Handling**:
  - `400 Bad Request`: If image is missing, corrupt, or contains no detectable face.
  - `401 Unauthorized`: If facial embedding distance exceeds threshold (`> 0.6`).
  - `409 Conflict`: If multiple accounts match, prompts user to select account ID.

#### 2. SMS Phone OTP Authentication (`SendPhoneOTPView` & `VerifyPhoneOTPView`)
- **Generation Step**: Uses `secrets.randbelow(900000) + 100000` to produce a 6-digit cryptographically secure OTP.
- **Storage**: Saved in Django cache with key `phone_otp_<number>` and a TTL of 300 seconds (5 minutes).
- **Verification Step**: Validates provided OTP against cache. Upon match, cache key is immediately deleted to prevent replay attacks.
- **Error Handling**:
  - Rate limiting: Re-sending OTP is blocked for 60 seconds per phone number.
  - `400 Bad Request`: Invalid or expired OTP.

#### 3. Active Session Revocation (`RevokeOtherSessionsView`)
- User active sessions are tracked in the database with fields `[session_key, ip_address, user_agent, last_activity]`.
- Calling `revoke-others/` deletes all session records associated with the user *except* the current request's session key.

---

## 3. Geospatial Intelligence & GIS Engine (Deep-Dive)

The GIS module in `backend/geo/` leverages **PostGIS** and GeoDjango to perform real-time spatial calculations.

### GIS Processing Pipeline

```mermaid
sequenceDiagram
    autonumber
    participant Client as Frontend Map Component
    participant API as Geo REST API (/api/v1/geo/)
    participant PostGIS as PostGIS Spatial Database
    participant APMC as Mandi Market Provider

    Client->>API: POST /api/v1/geo/radius-search/ {lat, lng, radius_km, category}
    API->>PostGIS: ST_DWithin(location_geom, ST_MakePoint(lng, lat), radius_meters)
    PostGIS-->>API: Returns queryset of matching competitor businesses
    API->>PostGIS: ST_Distance(location_geom, ST_MakePoint(lng, lat))
    PostGIS-->>API: Returns precise distances in meters
    API->>APMC: Fetch latest mandi commodity prices for nearest district
    APMC-->>API: Returns live crop/produce prices
    API-->>Client: Returns aggregated JSON (Competitor list, Density score, Mandi prices)
```

### Key Mathematical & Spatial Queries

#### Spatial Radius Search Query (Django ORM / PostGIS)
```python
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from geo.models import BusinessLocation

user_location = Point(float(lng), float(lat), srid=4326)
competitors = BusinessLocation.objects.filter(
    location__distance_lte=(user_location, D(km=radius_km)),
    category=category
).annotate(distance=Distance('location', user_location))
```

#### Suitability Index Score Formula
The location suitability index $S$ is calculated deterministically as:

$$S = \left( W_{\text{pop}} \cdot P_{\text{norm}} \right) + \left( W_{\text{road}} \cdot R_{\text{score}} \right) - \left( W_{\text{comp}} \cdot C_{\text{density}} \right) + \left( W_{\text{water}} \cdot W_{\text{table}} \right)$$

Where:
- $P_{\text{norm}}$: Normalized population catchment score within radius.
- $R_{\text{score}}$: Road infrastructure connectivity score (0–100).
- $C_{\text{density}}$: Competitor count penalty factor.
- $W_{\text{table}}$: Groundwater availability score (critical for agro-processing).

#### Error Handling & Fallbacks:
- **Fallback to Haversine**: If PostGIS / GDAL libraries are unavailable in local development environment, the system gracefully switches to standard spherical Haversine formula calculation in pure Python without crashing.

---

## 4. Financial Viability Engine & Loan Calculators (Deep-Dive)

The financial engine in `backend/finance/` performs automated credit-worthiness and feasibility modeling.

### Financial Calculation Flowchart

```mermaid
flowchart TD
    Inputs["Input Parameters:<br/>• Total Capital (C0)<br/>• Equity vs Loan Ratio<br/>• Interest Rate (r)<br/>• Monthly Fixed Costs (FC)<br/>• Selling Price (P)<br/>• Variable Cost (VC)"] --> BEP_Calc["Calculate Break-Even Point"]
    
    BEP_Calc --> Formula1["BEP Volume = FC / (P - VC)<br/>BEP Revenue = BEP Volume * P"]
    
    Inputs --> EMI_Calc["Calculate EMI & Loan Schedule"]
    EMI_Calc --> Formula2["EMI = P * [r(1+r)^n] / [(1+r)^n - 1]<br/>Build Monthly Amortization Table"]
    
    Inputs --> CashFlow_Calc["Project 5-Year Cash Flow"]
    CashFlow_Calc --> Formula3["NPV = ∑ [Ct / (1+r)^t] - C0<br/>Payback Period = Months to recover C0"]
    
    Formula1 & Formula2 & Formula3 --> ViabilityCheck{"Financial Viability Check"}
    ViabilityCheck -- "DSCR > 1.25 & BEP < 60%" --> HighViability["Status: HEALTHY (Green)"]
    ViabilityCheck -- "DSCR 1.0-1.25" --> ModerateViability["Status: MARGINAL (Yellow)"]
    ViabilityCheck -- "DSCR < 1.0" --> LowViability["Status: HIGH RISK (Red)"]
```

### Core Algorithms & Formulas

1. **Break-Even Point (BEP)**:
   $$\text{BEP Sales Volume} = \frac{\text{Fixed Monthly Operational Costs}}{\text{Selling Price per Unit} - \text{Variable Cost per Unit}}$$

2. **Debt Service Coverage Ratio (DSCR)**:
   $$\text{DSCR} = \frac{\text{Net Operating Income}}{\text{Total Debt Service (Annual EMI Obligations)}}$$
   *Threshold*: DSCR $\ge 1.25$ is required for standard PSU bank loan approval.

3. **Loan EMI (Equated Monthly Installment)**:
   $$\text{EMI} = P \times \frac{r(1+r)^n}{(1+r)^n - 1}$$
   Where $P$ = Principal Loan Amount, $r$ = Monthly interest rate ($\frac{\text{Annual Rate}}{12 \times 100}$), $n$ = Loan tenure in months.

#### Error Handling & Boundary Guardrails:
- **Zero Margin Protection**: If $\text{Selling Price} \le \text{Variable Cost}$, BEP calculation returns `Infinity` error safely trapped with message *"Selling price must exceed variable cost per unit"*.
- **Zero Loan Tenure**: If loan tenure is 0 months, EMI calculation sets debt obligation to 0 without division-by-zero runtime exceptions.

---

## 5. AI Advisory & Multi-Engine Feasibility Pipeline (Deep-Dive)

The advisory engine in `backend/advisory/` orchestrates a hybrid pipeline that combines deterministic algorithms with Google Gemini LLM generation.

### Feasibility Analysis Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Field Officer
    participant API as Advisory API View
    participant Scoring as FeasibilityScoringService
    participant ProviderFactory as LLM Provider Factory
    participant Gemini as Google Gemini Provider
    participant Mock as Mock LLM Provider Fallback

    User->>API: POST /api/v1/advisory/feasibility/analyze/
    API->>Scoring: analyze(lat, lng, radius, category, size)
    Scoring-->>API: Returns Deterministic Score (e.g., 78/100, "RECOMMENDED")
    
    API->>ProviderFactory: get_llm_provider(provider_name)
    ProviderFactory-->>API: Returns Active Provider Instance
    
    API->>Gemini: generate_advisory_report(prompt, context, schema)
    
    alt Gemini API Succeeds
        Gemini-->>API: Returns Structured JSON Synthesis
    else Gemini API Fails / Key Invalid / Timeout
        API->>Mock: generate_advisory_report(prompt, context, schema)
        Mock-->>API: Returns Local Deterministic Mock Synthesis
    end
    
    API->>API: Overwrite LLM's score with Deterministic Score (Guardrail)
    API-->>User: Returns Combined JSON (Deterministic Data + Safe AI Analysis)
```

### Deterministic Score Overwrite Guardrail (`ai_services.py`)
To prevent LLM hallucination where AI might invent a feasibility score conflicting with actual financial math, the system enforces a strict code-level guardrail:

```python
# Force-align LLM output with deterministic math engine
ai_response['feasibility']['score'] = feasibility_result["overall_score"]
ai_response['feasibility']['label'] = feasibility_result["verdict"]
```

### Prompt Sanitization & Security (`llm_providers.py`)
User-provided text inputs are sanitized to prevent prompt injection and XSS exploits:

```python
def sanitize_context(context: Dict[str, Any]) -> str:
    safe_ctx = copy.deepcopy(context)
    for key in ['expected_scale', 'target_customers', 'products']:
        if key in safe_ctx and isinstance(safe_ctx[key], str):
            safe_ctx[key] = html.escape(safe_ctx[key][:500]) # Escape HTML & truncate
    return json.dumps(safe_ctx)
```

---

## 6. Government Scheme Matching & Subsidy Engine (Deep-Dive)

The schemes module in `backend/schemes/` evaluates business proposals against national/state welfare databases.

### Scheme Matching State Diagram

```mermaid
stateDiagram-v2
    [*] --> UnfilteredSchemes: Fetch All Database Schemes
    
    UnfilteredSchemes --> FilterCategory: Match Business Category (e.g., Food Processing)
    FilterCategory --> FilterLocation: Match Location (Rural vs Urban, State)
    FilterLocation --> FilterInvestment: Match Min/Max Investment Limits
    FilterInvestment --> FilterApplicant: Match Applicant Profile (General / SC / ST / Women)
    
    FilterApplicant --> EligibleSchemes: List of Eligible Schemes
    
    EligibleSchemes --> CalculateSubsidy: Run Scheme Subsidy Calculator
    
    CalculateSubsidy --> OutputMatrix: Generate Final Match Object<br/>• Scheme Name<br/>• Subsidy % (e.g., 35%)<br/>• Max Subsidy Cap (e.g., ₹10 Lakhs)<br/>• Net Effective Loan Required
```

### Subsidy Calculation Logic
For schemes like PMEGP:
- **Special Category (SC/ST/OBC/Women/Ex-Servicemen/Rural)**: 35% Capital Subsidy (Owner contribution required: 5%).
- **General Category (Urban)**: 15% Capital Subsidy (Owner contribution required: 10%).
- **Subsidy Cap Guard**: $\text{Calculated Subsidy} = \min(\text{Project Size} \times \text{Subsidy Rate}, \text{Max Subsidy Cap})$.

---

## 7. What-If Simulator & Business Comparison Matrix

### 1. What-If Sensitivity Simulator (`/api/v1/advisory/simulate/`)
Allows real-time stress testing of financial viability under adverse economic conditions:
- **Raw Material Inflation (+20%)**: Re-calculates Net Margin and pushes BEP higher.
- **Demand Drop (-30%)**: Tests whether cash flow remains sufficient to cover monthly EMI.
- **Output**: Returns a comparative delta report showing *Baseline Metrics* vs *Stressed Metrics*.

### 2. Multi-Business Comparison Matrix (`/api/v1/advisory/feasibility/compare/`)
Processes up to 3 business options concurrently, generating comparative radar scoring across:
- Initial Capital Requirement Score
- Market Demand Potential Score
- Technical Feasibility & Infrastructure Ease
- Subsidy & Scheme Support Availability
- Overall Risk Score

---

## 8. Frontend Architecture & Resilience Patterns

The frontend in `frontend/src/` is built with React 18, Vite, TypeScript, and Tailwind CSS.

### State & Context Architecture

```mermaid
graph TD
    subgraph AppRoot["React App Root Container (App.tsx)"]
        AuthProvider["AuthContext<br/>(Manages JWT, User state, Login modes)"]
        SettingsProvider["SettingsContext<br/>(Theme, Currency units, i18n language)"]
        FilterProvider["GlobalFilterContext<br/>(State, District, Global geo selection)"]
    end
    
    subgraph Pages["Protected Application Routes"]
        Dash["Dashboard Page"]
        Wiz["Feasibility Wizard (Steps 1-6)"]
        GeoPage["GIS Spatial Map Page"]
        FinPage["Financial Calculator Page"]
        SimPage["What-If Simulator Page"]
        CompPage["Business Compare Page"]
    end
    
    AuthProvider & SettingsProvider & FilterProvider --> Pages
```

### Network Disconnection & Demo Session Resilience
To handle remote rural areas with flaky internet connections, the frontend Axios client (`frontend/src/api/`) implements automatic offline degradation:

```mermaid
flowchart TD
    API_Call["Frontend API Request"] --> NetworkCheck{"Backend Available?"}
    NetworkCheck -- Yes (HTTP 200) --> ProcessResponse["Process Normal Backend Data"]
    NetworkCheck -- No (Network Error / Timeout) --> DemoFallback["Trigger Graceful Demo Fallback"]
    DemoFallback --> IssueDemoToken["Generate Session Demo Token in Memory"]
    DemoFallback --> RenderMockData["Render Offline Demo Data with Notification Banner"]
```

---

## 9. Comprehensive Error Handling Matrix & Status Codes

The table below documents all application error scenarios, status codes, root causes, system handling strategies, and user notifications.

| HTTP Code | Scenario / Error Condition | Root Cause | System Mitigation Strategy | User Notification |
| :--- | :--- | :--- | :--- | :--- |
| **`400 Bad Request`** | Invalid Wizard Step Data | Missing mandatory fields (e.g. initial capital = null). | Field validation schema catches missing keys before database submission. | Highlight missing form inputs in red with explicit error label. |
| **`401 Unauthorized`** | Expired JWT Access Token | Access token expired after 15 minutes. | Axios interceptor automatically calls `/api/v1/auth/refresh/` using refresh token. | Seamless auto-retry; redirects to `/login` only if refresh token expires. |
| **`401 Unauthorized`** | Face Biometric Match Failed | Face camera encoding L2 distance $> 0.6$. | Logs biometric attempt failure without saving image. | *"Face not recognized. Please try again or log in with password/OTP."* |
| **`403 Forbidden`** | 2FA TOTP Required | User has 2FA enabled but TOTP code was not provided. | Halts JWT issuance; returns temporary pre-auth token. | Opens 2FA modal asking for 6-digit authenticator code. |
| **`409 Conflict`** | Multiple Biometric Accounts | Multiple family profiles share facial encoding similarity. | Backend returns candidate array of user IDs. | Shows account selector modal: *"Select which account you want to sign into."* |
| **`429 Too Many Requests`** | SMS OTP Rate Limited | User requested SMS OTP more than once within 60 seconds. | Redis/Cache throttles request key. | *"Please wait 60 seconds before requesting a new OTP."* |
| **`500 Internal Error`** | PostGIS C-Library Missing | Host OS missing native GDAL/GEOS libraries. | Backend catches `GEOSException` and falls back to Python Haversine math. | Transparent execution; system logs warning to server logs. |
| **`503 Service Unavailable`** | Gemini API Down / Timeout | Google Gemini API rate limited or unreachable. | Provider factory catches exception and falls back to `MockLLMProvider`. | Detailed analysis completed successfully using local deterministic scoring engine. |

---

## 📑 Document Control
- **Document Version**: 2.0.0 (SIH Production Release)
- **Primary Maintainer**: Rural-Nex Core Engineering Team
- **Linked Documents**:
  - [README.md](file:///c:/Users/tirth/OneDrive/Desktop/SIH/Rural-Nex/README.md)
  - [SECURITY.md](file:///c:/Users/tirth/OneDrive/Desktop/SIH/Rural-Nex/docs/SECURITY.md)
  - [E2E_TEST_REPORT.md](file:///c:/Users/tirth/OneDrive/Desktop/SIH/Rural-Nex/docs/E2E_TEST_REPORT.md)
