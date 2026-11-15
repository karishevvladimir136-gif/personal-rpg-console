"""Verify frozen evidence and assemble the standalone research article."""
from pathlib import Path
import hashlib, json, re

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'output'
STEM = 'AI_DM_Harness_Research_Article_2026-11-14'

def main():
    OUT.mkdir(exist_ok=True)
    sources = json.loads((ROOT/'evidence/source_manifest.json').read_text())
    quotes = json.loads((ROOT/'evidence/quotes.json').read_text())
    literature = json.loads((ROOT/'evidence/literature.json').read_text())
    records = {x['id']: x for x in sources + literature}
    for item in sources:
        raw = (ROOT/item['archive_path']).read_bytes()
        blob = hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
        assert blob == item['sha'], item['id']
        assert hashlib.sha256(raw).hexdigest() == item['sha256'], item['id']
    body = (ROOT/'article_source.md').read_text()
    used = set(re.findall(r'\[@([^\]]+)\]', body))
    assert not used-set(records), used-set(records)
    assert set(records) == used, 'Unused source record'
    for q in quotes:
        raw = (ROOT/q['archive_path']).read_text()
        assert raw[q['start_char']:q['end_char']] == q['text'], q['id']
        assert hashlib.sha256(q['text'].encode()).hexdigest() == q['sha256']
        assert raw[:q['start_char']].count('\n')+1 == q['line']
        marker = '{{QUOTE:'+q['id']+':'+q['text']+'}}'
        assert body.count(marker) == 1, q['id']
        label = f"{q['source_id']} · {q['source_label']} · {q['id']}"
        body = body.replace(marker, '> '+q['text']+'\n\n'+f"*[{label}]({q['url']})*")
    body = re.sub(r'\[@([^\]]+)\]', lambda m: '['+m[1]+']('+records[m[1]]['url']+')', body)
    refs=[]
    for x in literature:
        refs.append(f"**{x['id']}.** {x['authors']} ({x['year']}). *[{x['title']}]({x['url']})*. {x['version_or_venue']}.")
    body = body.replace('{{EXTERNAL_REFERENCES}}', '\n\n'.join(refs))
    group_names={'I':'Implementation','R':'Experiment reports','T':'Primary trajectories','M':'Companion monograph'}
    primary=['Identifiers retain their numbering in the companion monograph. Each link resolves to the frozen source revision; the evidence archive includes these 28 files, their hashes, and exact quotation locations.']
    for prefix,title in group_names.items():
        primary.append('### '+title)
        for x in sources:
            if not x['id'].startswith(prefix): continue
            name=Path(x['path']).name
            if prefix=='T':
                name=Path(x['path']).parent.name+' / '+name
            primary.append(f"**{x['id']}.** [{name}]({x['url']}). Revision `{x['commit'][:12]}`.")
    body = body.replace('{{PRIMARY_REFERENCES}}', '\n\n'.join(primary))
    assert '{{' not in body and '[@' not in body
    target=OUT/(STEM+'.md');target.write_text(body)
    stats={'primary_source_files':len(sources),'exact_quotations':len(quotes),'external_references':len(literature),
           'words_before_references':len(body.split('## References')[0].split()),
           'markdown_sha256':hashlib.sha256(body.encode()).hexdigest(),
           'source_hashes_verified':True,'quote_spans_verified':True,
           'claim_status':'Methodological article with observed examples and proposed future tests; no new experiment or independent review.'}
    (ROOT/'evidence/verification.json').write_text(json.dumps(stats,indent=2)+'\n')
    print(json.dumps(stats))

if __name__=='__main__':main()
