# API Contract - [Feature Name]

> Based on Solution: [Link to corresponding Solution file]
>
> **Important**: This document is output by Solution Agent and is the sole baseline for frontend-backend collaboration.
> *Read-only reference in design/development phase, no modifications allowed.* If changes are needed, must trace back to Solution Agent for correction and re-confirmation.

---

## Change Log

| Version | Date | Changes | Changed By |
|---------|------|---------|------------|
| v1.0 | [Date] | Initial version | Solution Agent |

---

## API List

| API Name | Method | URL | Description |
|----------|--------|-----|-------------|
| [API 1] | POST | `/api/v1/xxx` | [Description] |
| [API 2] | GET | `/api/v1/xxx/:id` | [Description] |

---

## API Details

### [API Name]

**Basic Information**

| Item | Content |
|------|---------|
| Method | `POST` |
| URL | `/api/v1/xxx` |
| Description | [API Description] |
| Authentication | Required / Not Required |

**Request Headers**

| Field | Value | Description |
|-------|-------|-------------|
| `Content-Type` | `application/json` | |
| `Authorization` | `Bearer {token}` | When authentication is required |

**Request Parameters**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| [Field] | string | Yes/No | [Description] | `"example"` |
| [Field] | int | Yes/No | [Description] | `1` |

**Request Example**

```json
{
  "[field]": "[value]"
}
```

**Response Structure**

| Field | Type | Description |
|-------|------|-------------|
| `code` | int | 0=Success, non-zero=Failure |
| `message` | string | Result description |
| `data` | object | Response data |
| `data.[field]` | [Type] | [Description] |

**Response Example (Success)**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "[field]": "[value]"
  }
}
```

**Error Codes**

| Error Code | HTTP Status | Description | Handling Suggestion |
|------------|-------------|-------------|---------------------|
| 4001 | 400 | Parameter validation failed | Check request parameters |
| 4003 | 403 | No permission | Check user permissions |
| 4004 | 404 | Resource not found | Confirm resource ID |
| 5000 | 500 | Internal server error | Contact backend for troubleshooting |

---

**Contract Status:** 📝 Draft / 👀 In Review / ✅ Confirmed  
**Confirmation Date:** [Date]  
**Confirmed By:** [Name]
