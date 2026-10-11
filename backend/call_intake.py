"""Transparent, deterministic call-note extraction for the AERT prototype.

This module does not transcribe audio, geocode, diagnose, assign a clinical
priority, or dispatch a resource. It only surfaces text clues for an operator
to verify. Production use requires approved call-taking protocols and feeds.
"""

import re
from typing import Any


_INCIDENT_RULES = [
    ("Road traffic collision", (r"\bcrash(?:ed)?\b", r"\bcollision\b", r"\baccident\b", r"\bvehicle[s]?\b.*\b(hit|struck|collid|overturn)", r"\btruck\b.*\b(car|auto|vehicle)\b")),
    ("Fire or smoke report", (r"\bfire\b", r"\bsmoke\b", r"\bburning\b", r"\bflames?\b")),
    ("Possible hazardous-material report", (r"\bchemical\b", r"\bgas leak\b", r"\bfuel leak\b", r"\bspill\b", r"\bfumes?\b")),
    ("Medical emergency (caller-described)", (r"\bchest pain\b", r"\bbreathless\b", r"\bdifficulty breathing\b", r"\btrouble breathing\b", r"\bstruggling to breathe\b", r"\bshortness of breath\b", r"\bcollapsed\b", r"\bfainted\b", r"\bseizure\b", r"\bmedical\b", r"\bambulance\b")),
]

_SAFETY_CLUES = {
    "Unconscious / unresponsive mentioned": (r"\bunconscious\b", r"\bunresponsive\b", r"\bnot responding\b", r"\bpassed out\b"),
    "Breathing concern mentioned": (r"\bnot breathing\b", r"\bno breathing\b", r"\bbreathless\b", r"\bcan't breathe\b", r"\bcannot breathe\b", r"\bdifficulty breathing\b", r"\btrouble breathing\b", r"\bstruggling to breathe\b", r"\bshortness of breath\b", r"\bgasping\b", r"\birregular breathing\b"),
    "Entrapment mentioned": (r"\btrapped\b", r"\bpinned\b", r"\bentrapped\b"),
    "Major bleeding mentioned": (r"\bbleeding heavily\b", r"\bsevere bleeding\b", r"\bblood loss\b"),
    "Fire / smoke / hazardous release mentioned": (r"\bfire\b", r"\bsmoke\b", r"\bchemical\b", r"\bgas leak\b", r"\bfuel leak\b", r"\bfumes?\b"),
}

_NUMBER_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}


def _matches(text: str, patterns: tuple[str, ...], allow_not_breathing: bool = False) -> bool:
    for pattern in patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            prefix = text[max(0, match.start() - 32):match.start()]
            is_negated = re.search(r"\b(?:no|not|never|without|denies|denied)\s+(?:\w+\s+){0,2}$", prefix, re.IGNORECASE)
            if not is_negated:
                return True
            if allow_not_breathing and re.search(r"\bnot\s*$", prefix, re.IGNORECASE) and re.search(r"breath", match.group(0), re.IGNORECASE):
                return True
    return False


def analyze_call_notes(raw_transcript: str) -> dict[str, Any]:
    """Return evidence-backed text clues; never invent location or certainty."""
    transcript = " ".join(raw_transcript.split())
    text = transcript.casefold()

    candidates = []
    for label, patterns in _INCIDENT_RULES:
        hits = [pattern for pattern in patterns if _matches(text, (pattern,))]
        if hits:
            candidates.append({"label": label, "evidence_count": len(hits)})

    safety_clues = [
        label for label, patterns in _SAFETY_CLUES.items()
        if _matches(text, patterns, allow_not_breathing=(label == "Breathing concern mentioned"))
    ]

    casualty_count = None
    count_match = re.search(
        r"\b(\d{1,3}|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:people injured|persons injured|patients|victims|injured|casualties)\b",
        text,
        re.IGNORECASE,
    )
    if count_match:
        count_context = text[max(0, count_match.start() - 28):count_match.end()]
        is_approximate_or_range = bool(re.search(
            r"\b(?:at least|about|around|approximately|approx|between)\b|\d\s*(?:-|–|to)\s*$|\b(?:one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:or|to)\s+$",
            count_context,
            re.IGNORECASE,
        ))
        token = count_match.group(1).casefold()
        if not is_approximate_or_range:
            casualty_count = int(token) if token.isdigit() else _NUMBER_WORDS.get(token)

    questions = []
    if not re.search(r"\b(at|near|opposite|behind|in front of|junction|road|street|village|mandal|km|kilometre|kilometer|landmark)\b", text):
        questions.append("What exact location, landmark, road, direction of travel, or map pin should responders use?")
    if casualty_count is None:
        questions.append("How many people need help? If the number is unknown, record it as unknown and update later.")
    if "Unconscious / unresponsive mentioned" in safety_clues or "Breathing concern mentioned" in safety_clues:
        questions.append("Confirm responsiveness and breathing using your approved protocol; follow local emergency notification procedure without delay.")
    if "Fire / smoke / hazardous release mentioned" in safety_clues:
        questions.append("Is there active fire, smoke, a leak, or another hazard, and can callers/responders approach safely?")
    if not questions:
        questions.append("Confirm the exact scene location and a callback number before dispatch.")

    return {
        "engine": "transparent keyword rules · prototype",
        "classification_candidates": candidates,
        "classification_status": "PROVISIONAL_REVIEW_REQUIRED" if candidates else "UNCLASSIFIED_REVIEW_REQUIRED",
        "safety_clues": safety_clues,
        "caller_reported_casualty_count": casualty_count,
        "location_verified": False,
        "coordinates": None,
        "follow_up_questions": questions,
        "limitations": [
            "Transcript text is operator-provided; no live phone, audio, or speech-recognition feed is connected.",
            "These keyword clues are not a medical protocol, diagnosis, calibrated confidence score, or dispatch recommendation.",
            "Confirm facts with the caller and verify the scene on an authoritative map before resource allocation.",
        ],
    }
