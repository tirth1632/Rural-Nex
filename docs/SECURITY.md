# Security Policy & Implementation

This document outlines the security mechanisms implemented in the Rural-Nex Django REST Backend to protect user data, ensure secure data processing, and defend against common web vulnerabilities.

## 1. Authentication and Authorization
- **JWT Authentication**: All API endpoints (except explicitly public ones, e.g., login/registration) are protected using JSON Web Tokens (`djangorestframework-simplejwt`).
- **Object-Level Permissions**:
  - `BusinessProposalViewSet` and `AnalysisRunViewSet` override `get_queryset()` to strict filter by `user=request.user`. Users cannot enumerate or access proposals belonging to others.
  - Endpoints retrieving specific resources (e.g., `ReportAPIView`) enforce `get_object_or_404(BusinessProposal, pk=pk, user=request.user)`.
- **Password Strength**: Standard Django password validators are enforced (Similarity, Minimum Length, Common Passwords, Numeric Passwords).

## 2. API Abuse & Rate Limiting
- **Throttling**: Django REST Framework throttling is enabled globally.
  - `AnonRateThrottle`: Limits unauthenticated requests (e.g. login attempts) to 100/day.
  - `UserRateThrottle`: Limits authenticated users to 1000/day to prevent scraping.
  - `AIGenerateRateThrottle`: A custom strict throttle (`generate_ai` scope) applied to computationally expensive LLM and PDF endpoints (e.g., `GenerateAdvisoryAPIView`, `BusinessCompareAPIView`, `ReportAPIView`) to prevent financial exhaustion. Limited to 50/day per user.

## 3. Data Validation & Integrity
- **Numeric Boundaries**: Custom APIViews (`SimulationAPIView`, `FeasibilityAnalyzeAPIView`) that manually cast strings to `float` or `Decimal` include explicit boundary checks (e.g., Max 1,000,000,000) to prevent memory exhaustion, NaN attacks, or integer overflow in underlying financial calculations.
- **SQL Injection**: All database queries utilize Django's ORM parameterized queries. No raw SQL is executed.

## 4. Cross-Origin Resource Sharing (CORS) & CSRF
- **CORS Mitigation**: `django-cors-headers` is implemented. In production, `CORS_ALLOWED_ORIGINS` strictly limits API access to trusted frontend clients via the `DJANGO_CORS_ORIGINS` environment variable.
- **CSRF**: As the API strictly uses JWT Bearer tokens (Stateless Authentication) rather than Session Cookies, CSRF tokens are largely bypassed for API clients. However, standard Django CSRF protections remain active for any session-based endpoints (e.g., Django Admin).

## 5. Production Environment & Headers
When `DEBUG = False` (driven by `DJANGO_DEBUG`):
- `SECURE_BROWSER_XSS_FILTER = True`
- `X_FRAME_OPTIONS = 'DENY'` (Prevents Clickjacking)
- `SECURE_CONTENT_TYPE_NOSNIFF = True`
- `SECURE_HSTS_SECONDS = 31536000` (Enforces HTTPS)
- `SECURE_HSTS_INCLUDE_SUBDOMAINS = True`
- `SECURE_HSTS_PRELOAD = True`
- `SESSION_COOKIE_SECURE = True`
- `CSRF_COOKIE_SECURE = True`

## 6. Secret Management
- Development defaults are provided, but production variables (`DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`) must be injected via the environment. The `SECRET_KEY` is not hardcoded for production instances.

## Reporting a Vulnerability
If you discover a security vulnerability within Rural-Nex, please send an e-mail to the security team. All security vulnerabilities will be promptly addressed.
