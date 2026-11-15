"""Validate the reading edition's part hierarchy and internal links."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import posixpath
import re
import xml.etree.ElementTree as ET
import zipfile

R = Path(__file__).resolve().parent
base = R / 'output/LLMs_at_the_Table_Research_Monograph_2026-11-14'
book = base.with_suffix('.md').read_text()
parts = re.findall(r'(?m)^# (PART [IVX]+ — .+)$', book)
assert parts == ['PART I — THE AI DM HARNESS', 'PART II — THE OPENWORLD HARNESS']
chapters = re.findall(r'(?m)^### (\d+)\. (.+)$', book)
assert [int(n) for n, _ in chapters] == list(range(1, 58))
assert book.index('### 42.') < book.index('# PART II') < book.index('### 43.')
assert book.index('### 52.') < book.index('# SYNTHESIS') < book.index('### 53.')
assert '17. An Open-Ended World: When the Model Chooses What to Do' in book
assert '## F. One Table, Different Models' in book
assert '34. When Models Form a Party' in book

result = {'status': 'passed', 'main_parts': parts, 'numbered_chapters': 57}
epub = base.with_suffix('.epub')
if epub.exists():
    with zipfile.ZipFile(epub) as z:
        names = set(z.namelist())
        roots = {n: ET.fromstring(z.read(n)) for n in names if n.endswith('.xhtml')}
        ids = {n: {e.attrib['id'] for e in root.iter() if 'id' in e.attrib} for n, root in roots.items()}
        count = 0
        for name, root in roots.items():
            for e in root.iter():
                if e.tag.rsplit('}', 1)[-1] != 'a' or 'href' not in e.attrib:
                    continue
                u = urlsplit(e.attrib['href'])
                if u.scheme or u.netloc:
                    continue
                target = posixpath.normpath(posixpath.join(posixpath.dirname(name), unquote(u.path))) if u.path else name
                assert target in names, (name, e.attrib['href'], 'missing file')
                if u.fragment:
                    assert unquote(u.fragment) in ids.get(target, set()), (name, e.attrib['href'], 'missing anchor')
                count += 1
        result['epub_internal_links'] = count
docx = base.with_suffix('.docx')
if docx.exists():
    with zipfile.ZipFile(docx) as z:
        root = ET.fromstring(z.read('word/document.xml'))
    ns = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
    bookmarks = {e.attrib[ns+'name'] for e in root.iter(ns+'bookmarkStart')}
    anchors = [e.attrib[ns+'anchor'] for e in root.iter(ns+'hyperlink') if ns+'anchor' in e.attrib]
    assert all(a in bookmarks for a in anchors), sorted(set(anchors)-bookmarks)
    result['docx_internal_links'] = len(anchors)
(R/'evidence/navigation_verification.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result))
