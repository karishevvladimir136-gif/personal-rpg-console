"""Check assets, links, exact quote text and reading-edition structure."""
from pathlib import Path
from urllib.parse import urlsplit,unquote
import json,posixpath,re,zipfile,xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parent
base=ROOT/'output/AI_DM_Harness_Research_Article_2026-11-14'
body=base.with_suffix('.md').read_text()
assert '{{' not in body and '[@' not in body
assert len(re.findall(r'^## \d+\. ',body,re.M))==11
assert (ROOT/'assets/action_loop.png').exists()
result={'status':'passed','main_sections':11}
ns='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
with zipfile.ZipFile(base.with_suffix('.docx')) as z:
    root=ET.fromstring(z.read('word/document.xml'))
    text=''.join(e.text or '' for e in root.iter(ns+'t'))
    for q in json.loads((ROOT/'evidence/quotes.json').read_text()):assert q['text'] in text,q['id']
    bookmarks={e.attrib[ns+'name'] for e in root.iter(ns+'bookmarkStart')}
    anchors=[e.attrib[ns+'anchor'] for e in root.iter(ns+'hyperlink') if ns+'anchor' in e.attrib]
    assert all(a in bookmarks for a in anchors)
    result['docx_exact_quotes']=5
    result['docx_internal_links']=len(anchors)
    result['docx_embedded_images']=len([n for n in z.namelist() if n.startswith('word/media/')])
with zipfile.ZipFile(base.with_suffix('.epub')) as z:
    names=set(z.namelist());roots={n:ET.fromstring(z.read(n)) for n in names if n.endswith('.xhtml')}
    ids={n:{e.attrib['id'] for e in rt.iter() if 'id' in e.attrib} for n,rt in roots.items()}
    count=0
    for name,rt in roots.items():
        for e in rt.iter():
            attr='href' if e.tag.rsplit('}',1)[-1]=='a' else 'src'
            if attr not in e.attrib:continue
            u=urlsplit(e.attrib[attr])
            if u.scheme or u.netloc:continue
            target=posixpath.normpath(posixpath.join(posixpath.dirname(name),unquote(u.path))) if u.path else name
            assert target in names,(name,e.attrib[attr])
            if u.fragment:assert unquote(u.fragment) in ids.get(target,set())
            count+=1
    result['epub_internal_links_and_assets']=count
if base.with_suffix('.pdf').exists():
    import fitz
    pdf=fitz.open(base.with_suffix('.pdf'))
    result['pdf_pages']=len(pdf)
    assert all(p.rect.width==612 and p.rect.height==792 for p in pdf)
    assert all(len(p.get_text().split())>15 for p in pdf)
    result['pdf_hyperlinks']=sum(len(p.get_links()) for p in pdf)
    for p in pdf:
        for b in p.get_text('blocks'):
            assert b[0]>=0 and b[1]>=0 and b[2]<=613 and b[3]<=793,(p.number,b[:4])
    result['pdf_page_geometry']='US Letter; text within page bounds'
(ROOT/'evidence/format_verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
