"""Minimal Semantic Scholar Graph API client — the fallback citation source.

Used only when scraping Google Scholar fails. Deliberately stdlib-only
(``urllib``) so it still works when the ``scholarly`` install is broken.

Requires the Semantic Scholar *author* id, which is **not** the same as the
Google Scholar id. Find it by searching for one of the publications on
https://www.semanticscholar.org and opening the author page; the id is the
number in the URL (``.../author/Jun-Wu/1234567``).

An API key is optional but strongly recommended: without one the public
endpoint is rate-limited to the point of returning HTTP 429 (observed during
development). Request a free key at
https://www.semanticscholar.org/product/api#api-key-form
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request

API_ROOT = "https://api.semanticscholar.org/graph/v1/author/"
FIELDS = "name,affiliations,citationCount,paperCount,hIndex"


class SemanticScholarError(RuntimeError):
    """Raised for any non-recoverable failure talking to the API."""


def _get(url: str, api_key: str | None, timeout: int) -> dict:
    request = urllib.request.Request(url, headers={"Accept": "application/json"})
    if api_key:
        request.add_header("x-api-key", api_key)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.load(response)


def fetch_author(
    author_id: str,
    api_key: str | None = None,
    timeout: int = 30,
    retries: int = 3,
) -> dict:
    """Return ``{name, citationCount, paperCount, hIndex, ...}`` for an author.

    Retries on 429 (rate limit) and 5xx, with linear backoff. 4xx other than
    429 is treated as fatal — retrying will not help.
    """
    query = urllib.parse.urlencode({"fields": FIELDS})
    url = f"{API_ROOT}{urllib.parse.quote(str(author_id))}?{query}"

    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            data = _get(url, api_key, timeout)
            if "citationCount" not in data:
                raise SemanticScholarError(f"unexpected response: {data!r}")
            return data
        except urllib.error.HTTPError as exc:
            body = ""
            try:
                body = exc.read().decode("utf-8", "replace")[:200]
            except Exception:  # pragma: no cover - best effort only
                pass
            last_error = SemanticScholarError(f"HTTP {exc.code} {exc.reason} {body}")
            if exc.code != 429 and exc.code < 500:
                raise last_error from exc
        except Exception as exc:  # network errors, timeouts, bad JSON
            last_error = exc

        if attempt < retries - 1:
            time.sleep(5 * (attempt + 1))

    raise SemanticScholarError(f"giving up after {retries} attempts: {last_error}")
