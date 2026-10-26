#!/usr/bin/env python3
"""Publish the most recently committed browser extension ZIP on GitHub Pages."""

import hashlib
import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

SOURCE_DIR = Path("downloads")
OUTPUT_DIR = Path("downloads")
ALIAS_NAME = "latest-extension.zip"
MANIFEST_NAME = "latest.json"


def latest_commit_epoch(path):
    """Return the timestamp of the most recent commit touching a tracked file."""
    value = subprocess.check_output(
        ["git", "log", "-1", "--format=%ct", "--", str(path)],
        text=True,
    ).strip()
    if not value:
        raise RuntimeError("Git history is missing for " + str(path))
    return int(value)


def select_latest_zip():
    """Only consider ZIP files explicitly named as browser extensions."""
    candidates = [
        path for path in SOURCE_DIR.iterdir()
        if path.is_file()
        and path.suffix.lower() == ".zip"
        and "extension" in path.stem.lower()
        and path.name != ALIAS_NAME
    ]
    if not candidates:
        raise RuntimeError("No extension ZIP found under downloads/")
    return max(candidates, key=lambda p: (latest_commit_epoch(p), p.name.lower()))


def read_extension_version(path):
    """Read version from the packaged extension manifest, without extracting files."""
    with zipfile.ZipFile(path) as archive:
        damaged = archive.testzip()
        if damaged:
            raise RuntimeError("Invalid ZIP entry: " + damaged)
        names = [
            name for name in archive.namelist()
            if name == "manifest.json" or name.endswith("/manifest.json")
        ]
        if not names:
            raise RuntimeError("Extension ZIP is missing manifest.json")
        name = sorted(names, key=lambda s: (s.count("/"), len(s)))[0]
        manifest = json.loads(archive.read(name))
        if not isinstance(manifest, dict) or not isinstance(manifest.get("version"), str):
            raise RuntimeError("Extension ZIP contains an invalid manifest version")
        if not manifest.get("manifest_version"):
            raise RuntimeError("Extension ZIP contains an invalid browser extension manifest")
        return manifest["version"]


def main():
    source = select_latest_zip()
    version = read_extension_version(source)
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    destination = OUTPUT_DIR / ALIAS_NAME
    shutil.copyfile(source, destination)
    data = {
        "filename": source.name,
        "version": version,
        "size": source.stat().st_size,
        "sha256": digest,
        "url": "/downloads/" + ALIAS_NAME,
    }
    (OUTPUT_DIR / MANIFEST_NAME).write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    if hashlib.sha256(destination.read_bytes()).hexdigest() != digest:
        raise RuntimeError("Published ZIP failed checksum verification")
    print("Pages ZIP: {} (version {}, size {}, sha256 {})".format(
        source, version, data["size"], digest
    ))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("Extension ZIP publish failed:", exc, file=sys.stderr)
        sys.exit(1)
