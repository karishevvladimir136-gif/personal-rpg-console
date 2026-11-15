"""Check the editorial packet's references; this is not independent peer review."""
from pathlib import Path
import json,re
R=Path(__file__).resolve().parent;E=R/'evidence'
book=next((R/'output').glob('*.md')).read_text()
lit=json.loads((E/'literature_register.json').read_text())
review=json.loads((E/'editorial_review.json').read_text())
q={x['id']:x for x in json.loads((E/'quote_audit.json').read_text())}
ids=[x['id'] for x in lit['works']]
assert ids==[f'E{x:02}' for x in range(1,15)]
assert set(re.findall(r'\[(E\d{2})\]',book))==set(ids)
for x in lit['works']:
 assert f'**{x["id"]}.**' in book and x['url'] in book
assert review['independent_review_performed'] is False
assert len(review['claims'])==18
count=0
for c in review['claims']:
 assert c['independent_review_status']=='not_performed'
 for e in c['evidence']:
  text=(R/e['archive_path']).read_text()
  if 'quote_id' in e:
   x=q[e['quote_id']];assert text[x['start_char']:x['end_char']]==x['text']
   assert e['source_id']==x['source_id']
   assert text.count('\n',0,x['start_char'])+1==e['start_line']
  if 'anchor_text' in e:
   pos=text.index(e['anchor_text'])
   assert text.count('\n',0,pos)+1==e['start_line']
   assert int(re.findall(r'(?m)^## Round (\d+)',text[:pos])[-1])==e['exported_round']
  count+=1
result={'status':'passed','external_references':14,'internal_claim_reviews':18,'resolved_internal_evidence_links':count,'independent_review_performed':False,'scope':'Reference identities, local source locations and declared review status; no independent semantic adjudication or benchmark rerun.'}
(E/'publication_verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
