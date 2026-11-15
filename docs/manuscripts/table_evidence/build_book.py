from pathlib import Path
import re,json,hashlib,urllib.parse

R=Path(__file__).resolve().parent
OUT=R/'output';OUT.mkdir(exist_ok=True)
BASE='https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/'
manifest=json.loads((R/'trace_manifest.json').read_text())
manifest=sorted(manifest,key=lambda x:x['path'])
sources={}
for i,x in enumerate(manifest,1):
    x['id']=f'T{i:03}'
    data=(R/'traces'/x['local']).read_bytes()
    assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==x['sha'],x['local']
    x['sha256']=hashlib.sha256(data).hexdigest()
    x['text']=data.decode('utf-8')
    x['url']=BASE+x['commit']+'/'+urllib.parse.quote(x['path'],safe='/')
    x['blocks']=[]
    for m in re.finditer(r'(?m)^(`{3,})[^\n]*\n([\s\S]*?)^\1[ \t]*$',x['text']):
        x['blocks'].append({'context':' '.join(x['text'][:m.start()].splitlines()[-4:]),'start':m.start(2),'end':m.end(2),'text':m.group(2)})
    if 'game-party-2-transcripts/' in x['local']:
        for m in re.finditer(r'(?m)(?:^>[^\n]*(?:\n|\Z))+',x['text']):
            x['blocks'].append({'context':' '.join(x['text'][:m.start()].splitlines()[-4:]),'start':m.start(),'end':m.end(),'text':m.group(),'exported_blockquote':True})
        x['blocks'].sort(key=lambda b:b['start'])
    sources[x['local']]=x

audit=[];used=set();chapter='';selection_groups=[]
def prefix(text,words=180):
    # Paragraph boundary only. The excerpt remains a contiguous source span.
    text=re.split(r'\n(?:Your records(?:, changed)?:|Your character|Campaign records:)',text,maxsplit=1)[0]
    chunks=list(re.finditer(r'[\s\S]+?(?:\n(?:> ?)?[ \t]*\n|\Z)',text))
    end=0;count=0
    for c in chunks:
        n=len(c.group().split())
        if count+n>words and end:break
        end=c.end();count+=n
    return text[:end or len(text)].strip()

def quote(x,start,end,label,exported_blockquote=False):
    raw=x['text'][start:end];left=len(raw)-len(raw.lstrip());right=len(raw.rstrip())
    start+=left;end=start+right-left;raw=x['text'][start:end]
    assert raw
    qid=f'Q{len(audit)+1:03}'
    audit.append({'id':qid,'chapter':chapter,'source_id':x['id'],'source_path':x['path'],'local':x['local'],'commit':x['commit'],'git_blob_sha':x['sha'],'start_char':start,'end_char':end,'text':raw,'excerpt_sha256':hashlib.sha256(raw.encode()).hexdigest(),'label':label,'source_export_blockquote':exported_blockquote})
    used.add(x['local'])
    rendered=raw if exported_blockquote else '\n'.join('> '+l for l in raw.split('\n'))
    return '**'+label+f' · {x["id"]} · [{qid}]**\n\n'+rendered+'\n\n'

def bquote(x,b,label,words=180):
    text=prefix(b['text'],words)
    if not text:return ''
    pos=b['text'].index(text)
    return quote(x,b['start']+pos,b['start']+pos+len(text),label,b.get('exported_blockquote',False))

def sourcehead(x):
    return f'*Source: [{x["id"]} — {x["local"]}]({x["url"]}). Selected passages; full transcript in the archive.*\n\n'

def solo(path,turns):
    x=sources[path];s=sourcehead(x);bs=x['blocks']
    for n in turns:
        hits=[i for i,b in enumerate(bs) if re.search(r'\*\*Player\*\* \(player t'+str(n)+r'\):',b['context'])]
        assert len(hits)==1,(path,n,'player',len(hits))
        i=hits[0]
        if n==turns[0]:
            before=[b for b in bs[:i] if re.search(r'### Screen \d+',b['context'])]
            if before:s+=bquote(x,before[-1],f'Visible screen before player turn {n} — excerpt',110)
        s+=bquote(x,bs[i],f'Player turn {n} — excerpt',380)
        after=next((b for b in bs[i+1:] if re.search(r'### Screen \d+',b['context'])),None)
        if after:s+=bquote(x,after,f'Next visible screen after that message — excerpt',170)
    return s

def cards(path,turns):
    x=sources[path];s=sourcehead(x)
    for n in turns:
        bs=[b for b in x['blocks'] if re.search(r'\*\*Player\*\* \(player t'+str(n)+r' card \d+\):',b['context'])]
        assert bs,(path,n,'cards')
        # First and final blocked attempts, with their visible consequences.
        chosen=bs if len(bs)<3 else [bs[0],bs[-1]]
        for b in chosen:
            lab=re.search(r'\(player (.*?)\)',b['context']).group(1)
            s+=bquote(x,b,f'Player at pending card, {lab} — excerpt',180)
            i=x['blocks'].index(b)
            after=next((c for c in x['blocks'][i+1:] if '### Screen' in c['context']),None)
            if after:s+=bquote(x,after,'Next card screen — excerpt',160)
    return s

def bounds(x,n):
    m=re.search(r'(?m)^## Round '+str(n)+r'\b[^\n]*',x['text']);assert m,(x['local'],n,'round')
    nxt=re.search(r'(?m)^## Round \d+\b',x['text'][m.end():])
    return m.end(),m.end()+nxt.start() if nxt else len(x['text'])

def party(path,rounds,names,version=1):
    x=sources[path];s=sourcehead(x)
    for n in rounds:
        start,end=bounds(x,n);bs=[b for b in x['blocks'] if start<b['start']<end]
        count=0;want=names.split(',')
        if version==1:
            for i,b in enumerate(bs):
                if 'What the DM was sent:' not in b['context']:continue
                segs=list(re.finditer(r'(?m)^(Bram Halloway|Sefa Marrin|Pell Dunmore):',b['text']))
                selected=False
                for j,m in enumerate(segs):
                    if names!='all' and not any(m.group(1).startswith(w) for w in want):continue
                    e=segs[j+1].start() if j+1<len(segs) else len(b['text'])
                    t=prefix(b['text'][m.start():e],220);p=b['start']+m.start()
                    s+=quote(x,p,p+len(t),f'Round {n} — input delivered to the DM, {m.group(1)} — excerpt')
                    selected=True;count+=1
                if selected:
                    dm=next((c for c in bs[i+1:] if "**The DM's narration:**" in c['context']),None)
                    if dm:s+=bquote(x,dm,f'Round {n} — DM narration for that scene — excerpt',170)
        else:
            for i,b in enumerate(bs):
                m=re.search(r'\*\*(Bram Halloway|Sefa Marrin|Pell Dunmore)\*\* \(action\):',b['context'])
                if m and (names=='all' or any(m.group(1).startswith(w) for w in want)):
                    s+=bquote(x,b,f'Round {n} — {m.group(1)}, player action — excerpt',220);count+=1
                elif names=='all' and "**The DM's narration:**" in b['context']:
                    s+=bquote(x,b,f'Round {n} — DM narration — excerpt',170)
        assert count,(path,n,names,'no party selection')
    return s

def engine(path,turns):
    x=sources[path];s=sourcehead(x);txt=x['text'];matches=list(re.finditer(r'(?m)^## Turn (\d+)\s*$',txt));lookup={int(m.group(1)):(m.end(),matches[i+1].start() if i+1<len(matches) else len(txt)) for i,m in enumerate(matches)}
    for n in turns:
        assert n in lookup,(path,n)
        a,z=lookup[n];block=txt[a:z]
        # Show only contiguous meaningful parts, each independently audited.
        event=re.search(r'Since your last action:\n([\s\S]*?)(?=\nJournal:|\nYour journal:|\nActions:)',block)
        if event and event.group(1).strip()!='- nothing':
            p=a+event.start();raw=prefix(event.group(0),200)
            s+=quote(x,p,p+len(raw),f'Observation before turn {n} — events from the preceding action')
        afford=re.search(r'Actions:\n([\s\S]*?)(?=\n- Verbs:|\n```)',block)
        if afford:
            # For first selected turn and any explicit confirmation, preserve the action menu.
            if n==turns[0] or '- Question:' in afford.group(0):
                p=a+afford.start();raw=afford.group(0).rstrip()
                s+=quote(x,p,p+len(raw),f'Observation before turn {n} — available controls')
        action=re.search(r'(?m)^> \*\*[^\n]+',block)
        assert action,(path,n,'action')
        # Remove only the export's Markdown quote marker; the recorded line remains exact.
        p=a+action.start()+2
        s+=quote(x,p,a+action.end(),f'Turn {n} — recorded reply line and any public Note or Journal')
    return s

def outcome(path,rounds):
    x=sources[path];s=''
    for n in rounds:
        a,z=bounds(x,n)
        ds=[b for b in x['blocks'] if a<b['start']<z and "**The DM's narration:**" in b['context']]
        b=ds[-1];raw=b['text'];needle='The leg comes free.' if 'The leg comes free.' in raw else 'His leg is free.'
        pos=raw.index(needle);seps=list(re.finditer(r'\n> ?\n',raw))
        st=max([m.end() for m in seps if m.end()<pos] or [0]);ends=[m.start() for m in seps if m.start()>pos]
        en=ends[min(1,len(ends)-1)] if ends else len(raw)
        s+=quote(x,b['start']+st,b['start']+en,f'Round {n} — later DM narration in Pell’s scene, release from the stone',True)
    return s

reports=json.loads((R/'manifest.json').read_text());codes=json.loads((R/'code_manifest.json').read_text())
report_order=['game-player-1-report.md','game-player-2-report.md','game-player-replicate-1-report.md','game-player-same-world-1-report.md','game-player-combat-1-report.md','game-player-combat-2-report.md','game-player-villain-1-report.md','game-party-1-report.md','multi-hero-1-report.md','game-party-2-report.md','open-world-adapter-1-report.md']
reports.sort(key=lambda x:report_order.index(x['local']))
def register(items,folder,prefix_):
    lines=[]
    for i,x in enumerate(items,1):
        data=(R/folder/x['local']).read_bytes()
        assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==x['sha']
        x['id']=f'{prefix_}{i:02}';x['sha256']=hashlib.sha256(data).hexdigest()
        url=BASE+x['commit']+'/'+urllib.parse.quote(x['path'],safe='/')
        lines.append(f'**{x["id"]}.** [{x["path"].split("/")[-1]}]({url})  \nRevision `{x["commit"][:12]}` · branch `{x["branch"]}`.\n')
    return '\n'.join(lines)

def replace(m):
    global chapter
    parts=m.group(1).split('|');kind=parts[0]
    if kind=='reports':return register(reports,'sources','R')
    if kind=='code':return register(codes,'code','I')
    if kind=='inventory':
        return '\n\n'.join(f'**{x["id"]}.** [{x["local"].split("/")[-1]}]({x["url"]}) — {x["path"].removeprefix("docs/runs/").rsplit("/",1)[0]}. Revision `{x["commit"][:12]}`.' for x in manifest)
    if kind=='auditstats':return f'**Edition audit:** {len(audit)} exact source selections from {len(used)} distinct primary transcripts; all 82 archived transcript files, eleven reports, and seven selected implementation files match their recorded Git blob hashes. These checks verify provenance and quotation identity, not semantic correctness of the underlying world.'
    path=parts[1];nums=list(map(int,parts[2].split(',')))
    selection_groups.append({'chapter':chapter,'kind':kind,'source':path,'turns_or_rounds':nums})
    if kind=='solo':return solo(path,nums)
    if kind=='cards':return cards(path,nums)
    if kind in ['party','party2']:return party(path,nums,parts[3],2 if kind=='party2' else 1)
    if kind=='engine':return engine(path,nums)
    if kind=='outcome':return outcome(path,nums)
    raise ValueError(parts)

text='\n\n'.join((R/n).read_text().strip() for n in ['front.md','solo.md','party.md','engine.md','back.md'])+'\n'
chunks=re.split(r'(?m)(^### \d+\. [^\n]+$)',text);out=[]
for chunk in chunks:
    if re.match(r'^### \d+\.',chunk):chapter=chunk.removeprefix('### ')
    out.append(re.sub(r'\{\{([^{}]+)\}\}',replace,chunk))
book=''.join(out)
assert '{{' not in book
# A compact linked contents, also retained as Word/PDF/EPUB headings.
heads=re.findall(r'(?m)^(#{1,3}) (.+)$',book)
toc=['# Contents','']
for mark,h in heads:
    if h.startswith(('PART ','SYNTHESIS','APPENDICES')) or re.match(r'\d+\.',h) or (mark=='##' and re.match(r'[A-H]\. ',h)):
        anchor=re.sub(r'[^\w\s-]','',h.lower());anchor=re.sub(r'\s+','-',anchor)
        if mark=='#':toc.extend(['','**'+h+'**',''])
        elif mark=='##':toc.extend(['','**['+h+'](#'+anchor+')**',''])
        else:toc.extend(['['+h+'](#'+anchor+')',''])
toc='\n'.join(toc)+'\n\n'
book=book.replace('# PART I —',toc+'# PART I —',1)
name='LLMs_at_the_Table_Research_Monograph_2026-11-14'
(OUT/(name+'.md')).write_text(book)
evidence=R/'evidence';evidence.mkdir(exist_ok=True)
(evidence/'quote_audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
(evidence/'source_manifest.json').write_text(json.dumps({'transcripts':[{k:v for k,v in x.items() if k not in ['text','blocks']} for x in manifest],'reports':reports,'implementation':codes},ensure_ascii=False,indent=2))
(evidence/'selection_index.json').write_text(json.dumps(selection_groups,ensure_ascii=False,indent=2))
stats={'main_parts':2,'chapters':len(re.findall(r'(?m)^### \d+\.',book)),'words':len(book.split()),'source_selections':len(audit),'quoted_transcripts':len(used),'archived_transcripts':len(manifest),'quoted_characters':sum(len(q['text']) for q in audit),'book_characters':len(book)}
(evidence/'edition_stats.json').write_text(json.dumps(stats,indent=2));print(json.dumps(stats))
