#!/usr/bin/env python3
"""Prepare independent browser-extension and Windows desktop ZIP downloads for Pages."""

import hashlib
import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path, PurePosixPath

SOURCE_DIR = Path("downloads")
DESTINATIONS = {
    "extension": ("latest-extension.zip", "latest.json"),
    "desktop-windows": ("latest-desktop-windows.zip", "latest-desktop.json"),
}
GENERATED_NAMES = {name for pair in DESTINATIONS.values() for name in pair}


def last_commit_time(path):
    """Rank ZIPs by their most recent source-file commit, not filesystem time."""
    value = subprocess.check_output(
        ["git", "log", "-1", "--format=%ct", "--", str(path)],
        text=True,
    ).strip()
    if not value:
        raise ValueError("File has no tracked commit: " + str(path))
    return int(value)


def inspect_zip(path):
    """Identify the package by its content; the uploaded filename is unrestricted."""
    with zipfile.ZipFile(path) as archive:
        infos = archive.infolist()
        if not infos:
            raise ValueError("Empty ZIP: " + str(path))
        names = set()
        for item in infos:
            name = item.filename
            parsed = PurePosixPath(name)
            if (name in names or parsed.is_absolute() or ".." in parsed.parts
                    or "\\" in name or item.flag_bits & 1):
                raise ValueError("Unsafe ZIP entry in " + str(path))
            names.add(name)

        # A desktop bundle can include browser-related files; executable takes priority.
        if any(name.lower().endswith(".exe") and not name.endswith("/") for name in names):
            return "desktop-windows", None

        manifest_names = [
            name for name in names
            if name == "manifest.json" or name.endswith("/manifest.json")
        ]
        for name in sorted(manifest_names, key=lambda s: (s.count("/"), len(s))):
            info = archive.getinfo(name)
            if info.file_size > 1024 * 1024:
                continue
            try:
                manifest = json.loads(archive.read(name))
            except (ValueError, UnicodeDecodeError):
                continue
            if (isinstance(manifest, dict)
                    and isinstance(manifest.get("manifest_version"), int)
                    and isinstance(manifest.get("version"), str)
                    and manifest.get("version")):
                return "extension", manifest["version"]
        return None, None


def publish_zip(category, path, version):
    """Create an immutable build artifact alias and independent metadata."""
    alias, metadata_name = DESTINATIONS[category]
    destination = SOURCE_DIR / alias
    shutil.copyfile(path, destination)
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    with destination.open("rb") as stream:
        published_digest = hashlib.file_digest(stream, "sha256").hexdigest()
    if digest != published_digest:
        raise ValueError("Published ZIP SHA-256 verification failed: " + str(path))
    metadata = {
        "kind": category,
        "filename": path.name,
        "version": version,
        "size": path.stat().st_size,
        "sha256": digest,
        "url": "/downloads/" + alias,
    }
    (SOURCE_DIR / metadata_name).write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print("Published:", category, path.name, metadata["size"], digest)


def main():
    catalog = {}
    for path in sorted(SOURCE_DIR.iterdir()):
        if not path.is_file() or path.suffix.lower() != ".zip":
            continue
        if path.name in GENERATED_NAMES:
            continue
        category, version = inspect_zip(path)
        if category is None:
            print("Skipped unknown ZIP type:", path.name)
            continue
        candidate = (last_commit_time(path), path.name.lower(), path, version)
        if category not in catalog or candidate[:2] > catalog[category][:2]:
            catalog[category] = candidate

    if "extension" not in catalog:
        raise ValueError("No valid browser extension ZIP in downloads/")
    for category in DESTINATIONS:
        if category in catalog:
            _, _, path, version = catalog[category]
            publish_zip(category, path, version)
        else:
            print("No locally tracked", category, "ZIP; public Release lookup is available for desktop.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, zipfile.BadZipFile, subprocess.CalledProcessError) as exc:
        print("Download catalog preparation failed:", exc, file=sys.stderr)
        sys.exit(1)
