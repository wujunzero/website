"""Fetch citation data for the configured Google Scholar profile.

Two sources, tried in order:

1. ``scholarly`` — scrapes Google Scholar. This is the authoritative number
   (it is what the Scholar profile shows) but Google actively blocks
   scrapers, so it fails often. Retried a few times with backoff.
2. The Semantic Scholar Graph API — used only when (1) fails. Stable, but the
   number differs slightly from Google Scholar's, and it needs
   ``SEMANTIC_SCHOLAR_AUTHOR_ID`` to be configured (see semantic_scholar.py).

If *both* fail the script exits non-zero **without writing anything**, so the
last good data on the ``google-scholar-stats`` branch survives and the badge
never goes blank or drops to zero.

Environment:
    GOOGLE_SCHOLAR_ID              the Scholar profile id (required)
    SEMANTIC_SCHOLAR_AUTHOR_ID     fallback author id (optional)
    SEMANTIC_SCHOLAR_API_KEY       fallback api key (optional, recommended)
    CRAWLER_RETRIES                attempts per source (default 3)
    CRAWLER_BASE_DELAY             backoff base in seconds (default 5)
"""

from __future__ import annotations

import json
import os
import random
import time
from datetime import datetime, timezone

RESULTS_DIR = "results"
RETRIES = int(os.environ.get("CRAWLER_RETRIES", "3"))
BASE_DELAY = float(os.environ.get("CRAWLER_BASE_DELAY", "5"))


def log(message: str) -> None:
    print(f"[crawler] {message}", flush=True)


def backoff(attempt: int) -> None:
    delay = BASE_DELAY * (2**attempt) + random.uniform(0, 2)
    log(f"  retrying in {delay:.1f}s")
    time.sleep(delay)


def fetch_from_scholar(author_id: str) -> dict:
    """Primary source.

    ``scholarly`` is imported lazily on purpose: if its install is broken
    (this has happened before — a transitive ``bibtexparser`` bump removed the
    v1 API it imports), the fallback can still run.
    """
    from scholarly import scholarly

    author = scholarly.search_author_id(author_id)
    scholarly.fill(author, sections=["basics", "indices", "counts", "publications"])
    return {
        "name": author.get("name"),
        "citedby": author["citedby"],
        "hindex": author.get("hindex"),
        "i10index": author.get("i10index"),
        "publications": {v["author_pub_id"]: v for v in author.get("publications", [])},
        "source": "google-scholar",
    }


def fetch_from_semantic_scholar(author_id: str) -> dict:
    from semantic_scholar import fetch_author

    data = fetch_author(author_id, api_key=os.environ.get("SEMANTIC_SCHOLAR_API_KEY"))
    return {
        "name": data.get("name"),
        "citedby": data["citationCount"],
        "hindex": data.get("hIndex"),
        "i10index": None,
        "publications": {},
        "source": "semantic-scholar",
    }


def try_source(name: str, author_id: str | None, fetch) -> tuple[dict | None, str | None]:
    if not author_id:
        return None, f"{name}: not configured"

    for attempt in range(RETRIES):
        try:
            log(f"{name}: attempt {attempt + 1}/{RETRIES}")
            return fetch(author_id), None
        except Exception as exc:  # noqa: BLE001 - report anything and fall back
            error = f"{name}: {exc!r}"
            log(f"{name}: failed - {exc!r}")
            if attempt < RETRIES - 1:
                backoff(attempt)

    return None, error


def main() -> int:
    errors: list[str] = []

    author, error = try_source(
        "google-scholar", os.environ.get("GOOGLE_SCHOLAR_ID"), fetch_from_scholar
    )
    if error:
        errors.append(error)

    if author is None:
        author, error = try_source(
            "semantic-scholar",
            os.environ.get("SEMANTIC_SCHOLAR_AUTHOR_ID"),
            fetch_from_semantic_scholar,
        )
        if error:
            errors.append(error)

    if author is None:
        log("all sources failed - leaving the published data untouched")
        for item in errors:
            log(f"  - {item}")
        return 1

    author["updated"] = datetime.now(timezone.utc).isoformat()
    log(f"using {author['source']}: {author['citedby']} citations")

    os.makedirs(RESULTS_DIR, exist_ok=True)
    with open(f"{RESULTS_DIR}/gs_data.json", "w", encoding="utf-8") as handle:
        json.dump(author, handle, ensure_ascii=False, indent=2)

    # shields.io reads `label` + `message`. The label is only changed when the
    # number comes from a different source, so a degraded run is visible
    # rather than silently reporting a different metric.
    label = "citations" if author["source"] == "google-scholar" else "citations (S2)"
    shield_data = {
        "schemaVersion": 1,
        "label": label,
        "message": f"{author['citedby']}",
    }
    with open(f"{RESULTS_DIR}/gs_data_shieldsio.json", "w", encoding="utf-8") as handle:
        json.dump(shield_data, handle, ensure_ascii=False)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
