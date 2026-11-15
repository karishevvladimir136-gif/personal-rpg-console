"""Verify the Table edition's frozen files and exact source selections.

Run from the extracted archive with Python 3. No dependencies or network.
"""
from pathlib import Path
import hashlib,json,re

R=Path(__file__).resolve().parent
E=R/'evidence'
manifest=json.loads((E/'source_manifest.json').read_text())
quotes=json.loads((E/'quote_audit.json').read_text())
checked=[]
for kind,folder in [('transcripts','traces'),('reports','sources'),('implementation','code')]:
    for x in manifest[kind]:
        data=(R/folder/x['local']).read_bytes()
        blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
        assert blob==x['sha'],(kind,x['local'],'Git blob mismatch')
        assert hashlib.sha256(data).hexdigest()==x['sha256'],(kind,x['local'],'SHA-256 mismatch')
        checked.append(x['id'])
for q in quotes:
    s=(R/'traces'/q['local']).read_bytes().decode('utf-8')
    assert s[q['start_char']:q['end_char']]==q['text'],q['id']
    assert hashlib.sha256(q['text'].encode()).hexdigest()==q['excerpt_sha256'],q['id']
assert len({q['id'] for q in quotes})==len(quotes)
book=next((R/'output').glob('*.md')).read_text()
labels=re.findall(r'\[(Q\d+)\]',book)
assert labels==[q['id'] for q in quotes],'Rendered excerpt IDs differ from audit order'
assert len(re.findall(r'(?m)^## \d+\.',book))==57
assert '{{' not in book
result={'status':'passed','verified_source_files':len(checked),'primary_transcripts':len(manifest['transcripts']),'reports':len(manifest['reports']),'implementation_files':len(manifest['implementation']),'exact_source_selections':len(quotes),'distinct_selected_transcripts':len({q['local'] for q in quotes}),'numbered_chapters':57,'scope':'Provenance and exact quotation identity; not an independent reproduction of stage scoring or semantic interpretation.'}
(E/'verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
