"""Package the verifiable article source and build a manuscript-only Git payload."""
from pathlib import Path
import hashlib,json,subprocess,sys,tempfile,zipfile

ROOT=Path(__file__).resolve().parent
STEM='AI_DM_Harness_Research_Article_2026-11-14'
support=['README.md','article_source.md','build_article.py','draw_architecture.py','style_article.py','verify_formats.py','package_article.py','article.css']
support += [str(p.relative_to(ROOT)) for p in sorted((ROOT/'evidence').glob('*.json'))]
support += ['assets/action_loop.svg','assets/action_loop.png']
sources=json.loads((ROOT/'evidence/source_manifest.json').read_text())
paths=support+[x['archive_path'] for x in sources]+['output/'+STEM+'.md']
archive=ROOT/'output/AI_DM_Harness_Evidence_2026-11-14.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for rel in sorted(paths):z.write(ROOT/rel,rel)
with tempfile.TemporaryDirectory() as td:
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        z.extractall(td)
    subprocess.run([sys.executable,str(Path(td)/'build_article.py')],check=True,capture_output=True)
    assert (Path(td)/'output'/f'{STEM}.md').read_bytes()==(ROOT/'output'/f'{STEM}.md').read_bytes()
elements=[]
def add(path,content=None,sha=None):
    e={'path':path,'mode':'100644','type':'blob'}
    if sha:e['sha']=sha
    else:e['content']=content
    elements.append(e)
prefix='docs/manuscripts/'
md=(ROOT/'output'/f'{STEM}.md').read_text().replace('(assets/action_loop.png)','(ai_dm_harness/assets/action_loop.svg)')
add(prefix+'AI_DM_HARNESS_RESEARCH_ARTICLE.md',md)
add(prefix+'README.md',(ROOT/'repo_README.md').read_text())
for rel in support:
    if rel.endswith('.png'):continue
    add(prefix+'ai_dm_harness/'+rel,(ROOT/rel).read_text())
for x in sources:add(prefix+'ai_dm_harness/'+x['archive_path'],sha=x['sha'])
assert all(e['path'].startswith(prefix) for e in elements)
payload={'base_tree_sha':'b1ad0b454284853e074b6c00be0a6e7922f3d3c4','repository_full_name':'karishevvladimir136-gif/personal-rpg-console','tree_elements':elements}
(ROOT/'git_tree_payload.json').write_text(json.dumps(payload,ensure_ascii=False))
checks={}
for e in elements:
    if 'sha' in e:checks[e['path']]=e['sha']
    else:
        raw=e['content'].encode();checks[e['path']]=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
(ROOT/'git_expected_hashes.json').write_text(json.dumps(checks,indent=2)+'\n')
print(json.dumps({'archive_files':len(paths),'archive_bytes':archive.stat().st_size,'archive_rebuild':'byte-identical Markdown; source and quote verification passed','git_files':len(elements),'git_payload_characters':len((ROOT/'git_tree_payload.json').read_text())}))
