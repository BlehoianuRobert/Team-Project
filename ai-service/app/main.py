"""Vision API + Chat: rental handover vs return comparison and support chatbot."""

from __future__ import annotations

import base64
import json
import logging
import os
import re
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
AI_MODEL = os.getenv("AI_MODEL", "gpt-4o-mini")
CHAT_MODEL = os.getenv("CHAT_MODEL", "gpt-4o-mini")
MAX_IMAGES_PER_GROUP = int(os.getenv("MAX_IMAGES_PER_GROUP", "6"))
REQUEST_TIMEOUT_S = float(os.getenv("REQUEST_TIMEOUT_S", "120"))
CHAT_MAX_HISTORY = int(os.getenv("CHAT_MAX_HISTORY", "20"))

app = FastAPI(title="Rental vision AI", version="1.0.0")


class RentalCompareBody(BaseModel):
    rentalId: int | None = None
    baselineImageUrls: list[str] = Field(default_factory=list)
    returnImageUrls: list[str] = Field(default_factory=list)
    rentedProductContext: str = ""


class ChatMessage(BaseModel):
    role: str = "user"
    content: str


class ChatBody(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)
    userContext: str = ""


def _parse_json_object(text: str) -> dict[str, Any]:
    text = text.strip()
    m = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.DOTALL)
    if m:
        text = m.group(1)
    return json.loads(text)


async def _download_as_data_url(client: httpx.AsyncClient, url: str) -> str:
    r = await client.get(url, timeout=60.0)
    r.raise_for_status()
    ctype = r.headers.get("content-type", "image/jpeg").split(";")[0].strip()
    if not ctype.startswith("image/"):
        ctype = "image/jpeg"
    b64 = base64.standard_b64encode(r.content).decode("ascii")
    return f"data:{ctype};base64,{b64}"


async def _urls_to_image_parts(
    client: httpx.AsyncClient, urls: list[str], label: str, cap: int
) -> list[dict[str, Any]]:
    parts: list[dict[str, Any]] = []
    for i, url in enumerate(urls[:cap]):
        try:
            data_url = await _download_as_data_url(client, url)
            parts.append({"type": "text", "text": f"[{label} photo {i + 1}]"})
            parts.append(
                {
                    "type": "image_url",
                    "image_url": {"url": data_url, "detail": "low"},
                }
            )
        except Exception as e:
            logger.warning("skip image %s: %s", url, e)
    return parts


async def _openai_json(system: str, user_content: list[dict[str, Any]]) -> dict[str, Any]:
    if not OPENAI_API_KEY:
        raise ValueError("NO_API_KEY")

    payload = {
        "model": AI_MODEL,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_content},
        ],
    }
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_S) as client:
        r = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        if r.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"OpenAI error: {r.text[:500]}")
        data = r.json()
    content = data["choices"][0]["message"]["content"]
    return _parse_json_object(content)


RENTAL_SYSTEM = """You are an expert inspecting rental returns.

The FIRST image group is the PRODUCT CATALOG / LISTING (reference photos shown when the item is rented).
The SECOND group is RETURN photos uploaded by the renter (what they return).

Decide whether the return photos show the same product type and model as the catalog reference.

Return a single JSON object with these keys (numbers 0.0-1.0 unless noted):
- "score": visible condition vs catalog reference (0 = aligns well with reference / acceptable, 1 = severe mismatch or much worse)
- "newDamageScore": estimated NEW physical wear or damage only (scratches, cracks, dents, burns, deformation, missing parts) vs catalog reference (0-1). Do NOT increase this for a compatible cable plugged in, normal accessories, or different photo angle/lighting if the device itself is unchanged.
- "modelMatchScore": confidence RETURN photos show the SAME item model/variant as CATALOG (0-1)
- "predictedCondition": one of GOOD, FAIR, DAMAGED, UNKNOWN
- "ocrText": short summary of important visible text (labels, serials, screen errors) or empty string
- "powerOnDetected": true if a powered-on screen/device state is clearly visible in return set, else false or null
- "errorCodesDetected": true if error/warning text visible on a screen, else false or null
- "errorCodes": short text of error codes if any, else null
- "detectedBrand": string or null
- "detectedModel": string or null (specific model if inferable, else null)
- "serialNumberDetected": visible serial/part number text or null
- "needsReview": true if you are uncertain, lighting is poor, angles mismatch, or scores warrant human review
- "message": one concise sentence for the rental manager

CRITICAL: If CATALOG and RETURN show clearly different product categories or families (examples: wall charger vs dev board/ESP32, phone vs camera), modelMatchScore MUST be at most 0.15, needsReview true, and message must state the mismatch plainly.

Be conservative: if return photos do not clearly show the same product as the catalog, lower modelMatchScore and set needsReview true."""


@app.get("/health")
async def health():
    return {"status": "ok", "model": AI_MODEL, "openaiConfigured": bool(OPENAI_API_KEY)}


def _mock_rental_response() -> dict[str, Any]:
    return {
        "score": 0.12,
        "newDamageScore": 0.08,
        "modelMatchScore": 0.88,
        "predictedCondition": "GOOD",
        "ocrText": "",
        "powerOnDetected": None,
        "errorCodesDetected": False,
        "errorCodes": None,
        "detectedBrand": None,
        "detectedModel": None,
        "serialNumberDetected": None,
        "needsReview": False,
        "message": "MOCK analysis: set OPENAI_API_KEY on the ai-service container for real vision output.",
    }


def _normalize_rental_response(raw: dict[str, Any]) -> dict[str, Any]:
    return {
        "score": raw.get("score"),
        "newDamageScore": raw.get("newDamageScore"),
        "modelMatchScore": raw.get("modelMatchScore"),
        "predictedCondition": raw.get("predictedCondition"),
        "ocrText": raw.get("ocrText"),
        "powerOnDetected": raw.get("powerOnDetected"),
        "errorCodesDetected": raw.get("errorCodesDetected"),
        "errorCodes": raw.get("errorCodes"),
        "detectedBrand": raw.get("detectedBrand"),
        "detectedModel": raw.get("detectedModel"),
        "serialNumberDetected": raw.get("serialNumberDetected"),
        "needsReview": bool(raw.get("needsReview", False)),
        "message": raw.get("message", ""),
    }


@app.post("/v1/rental-compare")
async def rental_compare(body: RentalCompareBody):
    if not body.baselineImageUrls:
        raise HTTPException(400, "baselineImageUrls required")
    if not body.returnImageUrls:
        raise HTTPException(400, "returnImageUrls required")

    cap = MAX_IMAGES_PER_GROUP
    user_parts: list[dict[str, Any]] = [
        {
            "type": "text",
            "text": (
                "Analyze these image sets. First group is CATALOG (product listing photos). "
                "Second group is RETURN (renter upload). Compare return to catalog."
            ),
        }
    ]
    ctx = (body.rentedProductContext or "").strip()
    if ctx:
        user_parts.append(
            {
                "type": "text",
                "text": (
                    "Rented product (metadata): "
                    + ctx
                    + ". CATALOG images and RETURN photos must plausibly depict this same kind of item; "
                    "if RETURN shows a different device family (e.g. dev board vs charger), "
                    "modelMatchScore must be at most 0.15 and needsReview true."
                ),
            }
        )
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            user_parts.extend(
                await _urls_to_image_parts(client, body.baselineImageUrls, "CATALOG", cap)
            )
            user_parts.extend(
                await _urls_to_image_parts(client, body.returnImageUrls, "RETURN", cap)
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("image fetch failed")
        raise HTTPException(500, str(e)) from e

    if len(user_parts) <= 1:
        raise HTTPException(400, "Could not load any images from URLs")

    try:
        raw = await _openai_json(RENTAL_SYSTEM, user_parts)
    except ValueError:
        raw = _mock_rental_response()
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("rental_compare failed")
        raise HTTPException(500, str(e)) from e

    return _normalize_rental_response(raw)


@app.post("/analyze/esthetic-shape")
async def legacy_analyze_placeholder():
    raise HTTPException(
        410,
        "Use POST /v1/rental-compare with JSON body (baselineImageUrls + returnImageUrls). "
        "Set APP_AI_COMPARE_URL to that path.",
    )


# ---------------------------------------------------------------------------
# Chat endpoint
# ---------------------------------------------------------------------------

CHAT_SYSTEM = """Ești asistentul virtual al platformei de închiriere online „Online Rental System".
Răspunzi DOAR în limba română. Fii prietenos, concis și ușor de citit.

REGULI DE FORMATARE (OBLIGATORII):
- Folosește propoziții scurte, nu paragrafe lungi.
- Traduce ÎNTOTDEAUNA statusurile în română: PENDING=În așteptare, CONFIRMED=Confirmată, ACTIVE=Activă, RETURNED=Returnată, COMPLETED=Finalizată, CANCELED=Anulată, OVERDUE=Întârziată.
- Traduce tipul de livrare: PERSONAL_PICKUP=Ridicare personală, DELIVERY=Livrare curier.
- Folosește emoji-uri moderate pentru a face textul mai vizual (✅, 📦, ⏳, ⚠️, 📷, 💳).
- FOARTE IMPORTANT: dacă sunt mai mult de 5 închirieri, NU le lista pe toate! În schimb:
  1. Dă un rezumat general (ex: "Ai 16 închirieri active: 3 cu întârziere, 10 confirmate, 3 în așteptare.")
  2. Evidențiază DOAR cele care necesită atenție (întârziate, aproape de termen).
  3. Menționează pe scurt restul grupat (ex: "Restul de 10 sunt confirmate și în termen.")
- Dacă sunt sub 5, le poți lista individual dar concis.
- NU lista toate câmpurile brut. Fii selectiv și relevant.
- Răspunsul NU trebuie să depășească 150 de cuvinte.

Platforma permite utilizatorilor să:
- Navigheze un catalog de produse (electronice, gadgeturi) și să le închirieze pe perioade determinate.
- Plătească online prin Stripe (card bancar).
- Aleagă livrare prin curier sau ridicare personală.
- La retur, să încarce fotografii; un sistem AI compară pozele cu cele originale pentru a detecta daune.
- Lase recenzii și rating-uri produselor.

Statusurile unei închirieri sunt: PENDING → CONFIRMED → ACTIVE → RETURNED → COMPLETED (sau CANCELED / OVERDUE).

Când primești context despre utilizator (închirieri active, produse etc.), folosește-l pentru a răspunde personalizat.
Dacă nu știi răspunsul sau întrebarea nu e legată de platformă, spune politicos că nu poți ajuta cu acel subiect.
Nu inventa informații pe care nu le ai în context.
Nu dezvălui detalii tehnice interne (endpoint-uri, structuri de baze de date etc.)."""


async def _openai_chat(system: str, messages: list[dict[str, str]]) -> str:
    if not OPENAI_API_KEY:
        return "Chatbot-ul nu este configurat momentan. Vă rugăm să contactați suportul."

    payload = {
        "model": CHAT_MODEL,
        "messages": [{"role": "system", "content": system}] + messages,
        "max_tokens": 1000,
        "temperature": 0.7,
    }
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_S) as client:
        r = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        if r.status_code >= 400:
            logger.error("OpenAI chat error: %s", r.text[:500])
            raise HTTPException(status_code=502, detail="Serviciul AI nu este disponibil momentan.")
        data = r.json()
    return data["choices"][0]["message"]["content"]


@app.post("/v1/chat")
async def chat(body: ChatBody):
    if not body.message or not body.message.strip():
        raise HTTPException(400, "Mesajul nu poate fi gol.")

    system = CHAT_SYSTEM
    if body.userContext and body.userContext.strip():
        system += "\n\nContext utilizator curent:\n" + body.userContext.strip()

    messages: list[dict[str, str]] = []
    for msg in body.history[-CHAT_MAX_HISTORY:]:
        if msg.role in ("user", "assistant"):
            messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": body.message.strip()})

    try:
        reply = await _openai_chat(system, messages)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("chat failed")
        raise HTTPException(500, "Eroare internă la procesarea mesajului.") from e

    return {"reply": reply}
