"""Validate AUTHORITY_1 scenario files. Usage: python3 validate_scenarios.py [files...] (default: all four classes)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from authority1.scenarios import CLASS_FILES, render_item, history_sorted, validate_files  # noqa: E402

files = sys.argv[1:] or [str(f) for f in CLASS_FILES]
errs, allsc = validate_files(files)
for e in errs:
    print("ERROR", e)
if "--show" in sys.argv:
    pass
if not errs:
    lens = [len(s["items"]) for s in allsc]
    print(f"OK {len(allsc)} scenarios; history lengths {min(lens)}–{max(lens)} (mean {sum(lens)/len(lens):.1f})")
sys.exit(1 if errs else 0)
