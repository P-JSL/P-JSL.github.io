#!/usr/bin/env python3
"""Collect GitHub Release asset download-count snapshots for P-JSL Pages.

Numbers are GitHub Release asset download_count values aggregated across all
published non-prerelease versions. GitHub Pages /downloads files are not counted.
Daily increases are *observed changes between snapshots*, not historical events.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = ROOT / "site-pages.json"
OUTPUT_PATH = ROOT / "assets" / "download-stats.json"
COUNTS_PATH = ROOT / "downloads" / "download-counts.json"
KST = dt.timezone(dt.timedelta(hours=9))
TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPO_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")
MAX_HISTORY = 730


def series_definitions(config):
    """Keep chart IDs stable across title changes and Release versions."""
    series = [
        {
            "id": "video-desktop",
            "label": "Video App · Windows",
            "repository": "P-JSL/P-JSL.github.io",
            "filename": "my-video-app-desktop-windows-x64.zip",
            "assetPrefix": "",
            "source": "release",
        }
    ]
    for page in [config.get("home", {})] + list(config.get("pages", [])):
        slug = page.get("slug", "home")
        for block in page.get("blocks", []):
            if block.get("type") != "download" or block.get("source") != "release":
                continue
            repository = block.get("releaseRepo") or "P-JSL/P-JSL.github.io"
            filename = block.get("filename") or ""
            if not REPO_PATTERN.fullmatch(repository) or not filename:
                continue
            series.append({
                "id": slug + ":" + str(block.get("id", "")),
                "label": str(block.get("title") or filename),
                "repository": repository,
                "filename": filename,
                "assetPrefix": str(block.get("assetPrefix") or ""),
                "source": "release",
            })
    series.append({
        "id": "video-extension-local",
        "label": "Video App · Chrome Extension",
        "repository": "P-JSL/P-JSL.github.io",
        "filename": "latest-extension.zip",
        "assetPrefix": "",
        "source": "pages",
        "status": "not_measured",
        "total": None,
    })
    return series


def github_release_pages(repository):
    """Read published Releases with GitHub's per-asset download_count field."""
    url_root = "https://api.github.com/repos/" + repository + "/releases"
    releases = []
    for page in range(1, 21):
        url = url_root + "?per_page=100&page=" + str(page)
        headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "P-JSL-GitHub-Pages-Download-Statistics",
        }
        if TOKEN:
            headers["Authorization"] = "Bearer " + TOKEN
        request = urllib.request.Request(url, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(request, timeout=25) as response:
                part = json.load(response)
        except urllib.error.HTTPError as error:
            if error.code == 404:
                raise ValueError("Release repository is not accessible: " + repository)
            raise ValueError("GitHub API HTTP " + str(error.code) + " for " + repository)
        if not isinstance(part, list):
            raise ValueError("Unexpected GitHub Release response for " + repository)
        releases.extend(r for r in part if not r.get("draft") and not r.get("prerelease"))
        if len(part) < 100:
            break
    else:
        # Never pretend the first 2,000 releases are an all-time total.
        raise ValueError("Release pagination exceeds supported 2,000 for " + repository)
    return releases


def count_assets(releases, definition):
    """Sum the exact release ZIP (or versioned ZIP prefix) across all versions."""
    count = 0
    matched = 0
    prefix = definition["assetPrefix"].lower()
    filename = definition["filename"].lower()
    for release in releases:
        for asset in release.get("assets", []):
            name = str(asset.get("name") or "").lower()
            if asset.get("state") != "uploaded" or not name.endswith(".zip"):
                continue
            matches = name.startswith(prefix) if prefix else name == filename
            if matches:
                number = asset.get("download_count")
                if not isinstance(number, int) or number < 0:
                    raise ValueError("Invalid asset download_count in " + definition["repository"])
                count += number
                matched += 1
    return count if matched else None


def update_snapshot():
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    old = {}
    if OUTPUT_PATH.exists():
        old = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
    definitions = series_definitions(config)
    grouped = {}
    failures = {}
    for definition in definitions:
        repository = definition["repository"]
        if definition["source"] != "release" or repository in grouped or repository in failures:
            continue
        try:
            grouped[repository] = github_release_pages(repository)
        except (ValueError, urllib.error.URLError, TimeoutError, OSError) as error:
            failures[repository] = str(error)
            print("WARNING: " + repository + ": " + str(error), file=sys.stderr)

    series = []
    for definition in definitions:
        item = dict(definition)
        repository = item["repository"]
        if item["source"] == "pages":
            item["status"] = "not_measured"
            item["total"] = None
        elif repository in failures:
            # Do not silently substitute old counts as if they were current.
            item["status"] = "unavailable"
            item["total"] = None
        else:
            item["total"] = count_assets(grouped.get(repository, []), item)
            item["status"] = "available" if item["total"] is not None else "unpublished"
        series.append(item)

    if failures and not grouped:
        # If no repository was successfully queried, preserve the last known
        # published snapshot instead of replacing it with unknown values.
        print("WARNING: all statistics sources unavailable; preserving previous data", file=sys.stderr)
        return

    old_history = old.get("history", [])
    history = [row for row in old_history if isinstance(row, dict) and "date" in row]
    now = dt.datetime.now(dt.timezone.utc)
    today = now.astimezone(KST).date().isoformat()
    sample = {
        "date": today,
        "counts": {item["id"]: item["total"] for item in series},
    }
    if history and history[-1]["date"] == today:
        # Do not replace successfully observed counts with null on API failure.
        merged = dict(history[-1].get("counts", {}))
        for key, total in sample["counts"].items():
            if total is not None or key not in merged:
                merged[key] = total
        history[-1] = {"date": today, "counts": merged}
    else:
        history.append(sample)
    history = sorted(history, key=lambda row: row["date"])[-MAX_HISTORY:]

    output = {
        "schema": 1,
        "captured_at": now.replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "timezone": "Asia/Seoul",
        "source": "GitHub Releases REST API: assets[].download_count",
        "series": series,
        "history": history,
        "notes": [
            "GitHub Releases 자산의 공개 누적 다운로드 수를 정식 버전 전체에 걸쳐 합산합니다.",
            "날짜별 증가는 수집 시점 사이의 누적 횟수 차이이며 실제 다운로드 발생 시각이 아닙니다.",
            "GitHub Pages downloads/ 직접 다운로드는 집계되지 않습니다.",
            "삭제된 Release나 첨부파일의 다운로드는 이후 합계에 포함되지 않을 수 있습니다.",
        ],
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    # This is a periodically refreshed snapshot of GitHub Release metrics.
    # Never change this file from a visitor's download-click event.
    counts_snapshot = {
        "schema": 1,
        "updated_at": output["captured_at"],
        "metric": "Published GitHub Release ZIP asset download_count (all stable versions)",
        "refresh": "scheduled GitHub Actions, four times per day; no per-click writes",
        "counts": {item["id"]: item["total"] for item in series},
        "items": [
            {
                "id": item["id"],
                "label": item["label"],
                "source": item["source"],
                "status": item["status"],
                "count": item["total"],
            }
            for item in series
        ],
        "note": "GitHub Pages /downloads ZIP transfers have no count API: null means not measured, not zero.",
    }
    COUNTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    COUNTS_PATH.write_text(
        json.dumps(counts_snapshot, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    for item in series:
        print("{} [{}]: {}".format(item["label"], item["status"], item["total"]))
    if failures and len(failures) == len(grouped) + len(failures):
        # No hard failure: site publishing must not depend on statistics uptime.
        print("WARNING: some or all GitHub statistics could not be collected", file=sys.stderr)


if __name__ == "__main__":
    try:
        update_snapshot()
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        print("Download-statistics collection failed: " + str(error), file=sys.stderr)
        sys.exit(1)
