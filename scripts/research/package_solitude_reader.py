#!/usr/bin/env python3
"""Create a reproducible, entirely offline readable archive of SOLITUDE_1/2/3.
No dependencies beyond Python's standard library. Does not modify source logs.
"""
from __future__ import annotations
import collections
import csv
import hashlib
import html
import json
import re
import shutil
import subprocess
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
STAGES=ROOT/"docs"/"runs"
DEST=ROOT/"dist"/"LLMs_in_Solitude_Complete_Reader"
REPO="karishevvladimir136-gif/personal-rpg-console"
REF=subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip()
FAMILIES={"astra":"GPT-6 Astra","deepseek":"DeepSeek V4 Pro","fable":"Claude Fable 5.1","glm":"GLM 5.3","grok":"Grok 4.7","haiku":"Claude Haiku 5.5","kimi":"Kimi K3","opus":"Claude Opus 5.5","sol":"GPT-6.1 Sol"}
RECORDS=[]

def sha(data):
    return hashlib.sha256(data).hexdigest()

def inline(s):
    s=html.escape(s)
    s=re.sub(r"&#x60;([^&#x60;]+)&#x60;",r"<code>\1</code>",s)
    s=re.sub(r"\*\*(.+?)\*\*",r"<strong>\1</strong>",s)
    s=re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)",r"<em>\1</em>",s)
    return s

def markdown_html(source):
    """Small safe offline renderer, deliberately preserves line breaks and fenced text."""
    lines=source.splitlines()
    out=[]
    body=[]
    fence=None
    code=[]
    def flush():
        if body:
            out.append("<p>"+"<br />".join(inline(x) for x in body)+"</p>")
            body.clear()
    for line in lines:
        st=line.strip()
        fm=re.match(r"^("+chr(96)+r"{3,4})(.*)$",st)
        if fence is not None:
            if fm and len(fm.group(1))>=len(fence):
                out.append('<pre class="source"><code>'+html.escape("\n".join(code))+"</code></pre>")
                code=[]
                fence=None
            else:
                code.append(line)
            continue
        if fm:
            flush()
            fence=fm.group(1)
            continue
        if not st:
            flush()
            continue
        head=re.match(r"^(#{1,5})\s+(.+)$",line)
        if head:
            flush()
            level=min(len(head.group(1))+1,6)
            out.append(f"<h{level}>{inline(head.group(2))}</h{level}>")
            continue
        if st in ("---","***","___"):
            flush();out.append("<hr />");continue
        if st.startswith("> "):
            flush()
            out.append("<blockquote>"+inline(st[2:])+"</blockquote>")
            continue
        if re.match(r"^\s*[-*]\s+",line):
            flush()
            out.append('<p class="bullet">'+inline(re.sub(r"^\s*[-*]\s+","•  ",line))+"</p>")
            continue
        body.append(line)
    flush()
    if fence is not None:
        out.append('<pre class="source"><code>'+html.escape("\n".join(code))+"</code></pre>")
    return "\n".join(out)

BASE_CSS="""
html{color-scheme:light} body{font-family:Georgia,serif;line-height:1.62;
background:#fefdfa;color:#26303b;max-width:760px;margin:0 auto;
padding:38px 5vw 90px;font-size:1.12rem}
h1,h2,h3,h4,h5,h6{font-family:system-ui,sans-serif;line-height:1.32;
color:#213047;margin:1.35em 0 .52em}h1{font-size:2rem}h2{font-size:1.43rem}h3{font-size:1.18rem}
a{color:#275b78;text-decoration-thickness:1px;text-underline-offset:3px}
p{margin:0 0 1.05em} .source{white-space:pre-wrap;overflow-wrap:anywhere;
font-family:ui-monospace,SFMono-Regular,Consolas,monospace;line-height:1.55;
font-size:.91em;background:#f3f3ef;border-radius:9px;padding:15px 16px;
border-left:3px solid #b3b9b4}
blockquote{margin:1.25em 0;padding:.2em 1.1em;border-left:3px solid #b0a48b;color:#536070;background:#f7f6f2}
header{font: .9rem/1.55 system-ui,sans-serif;color:#55626d}
header .kicker{letter-spacing:.14em;text-transform:uppercase;font-weight:700;font-size:.8em;color:#8c7759}
nav{padding:1em 0;border-top:1px solid #dde2e5;border-bottom:1px solid #dde2e5;margin:1.5em 0}
.meta{font: .85rem system-ui,sans-serif;color:#63717c;margin:0 0 1.6em}
.bullet{margin:.45em 0 .6em;padding-left:1em}
@media(max-width:580px){body{font-size:1.1rem;padding:20px 5vw 65px}.source{font-size:.81rem;padding:13px 9px}h1{font-size:1.65rem}}
"""

def html_page(title,body,meta="",back="../READ_FIRST.html"):
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"/>'+\
      '<meta name="viewport" content="width=device-width,initial-scale=1"/>'+\
      "<title>"+html.escape(title)+"</title><style>"+BASE_CSS+"</style></head><body>"+\
      '<header><div class="kicker">LLMs in Solitude · Primary transcript</div>'+\
      "<h1>"+html.escape(title)+"</h1>"+\
      '<p class="meta">'+html.escape(meta)+'</p></header>'+\
      '<nav><a href="'+html.escape(back,quote=True)+'">← All rooms</a></nav>'+\
      body+"</body></html>"

def emit(stage,variant,family,n,source,text,original_group=None):
    assert family in FAMILIES,(stage,family,source)
    sub=f"{stage}/{family}/{variant}_{n:02d}"
    path_md=DEST/(sub+".md")
    path_html=DEST/(sub+".html")
    path_md.parent.mkdir(parents=True,exist_ok=True)
    data=text.encode("utf-8")
    path_md.write_bytes(data)
    title=f"{FAMILIES[family]} · {stage} · {variant}/{n}"
    url=f"https://github.com/{REPO}/blob/{REF}/{source}"
    turn_marks=[int(x) for x in re.findall(r"(?m)^\*\*Turn (\d+)\*\*",text)]
    max_turn=max(turn_marks,default=0)
    title_line=next((line for line in text.splitlines()
        if re.match(r"^#{1,2}\\s+(?:S1ru|S1|S2|S3|S4|M1|M2|M3|S1M1|S1M2|S2M1|S3M1)/[a-z]+/\\d+",line)),"")
    title_lower=title_line.lower()
    if "refusal" in title_lower:
        status="refusal"
    elif "loop" in title_lower:
        status="loop"
    elif stage=="SOLITUDE_2" and re.search(r"closed by parser \\(mention\\)",text,re.I):
        status="legacy parser interruption"
    elif "end at turn" in title_lower:
        status="legacy recorded stop" if stage=="SOLITUDE_1" else "valid [END] exit"
    elif "turns" in title_lower:
        status="30-turn cap / no clean exit"
    else:
        status="other / interrupted"
    meta=f"Original: {source} · sha256 {sha(data)[:12]} · maximum turn {max_turn}"
    body=markdown_html(text)
    body+='<hr /><p><a href="'+html.escape(url,quote=True)+'">Read the original in GitHub</a> · <a href="'+Path(sub+".md").name+'">Plain Markdown</a></p>'
    back="../../READ_FIRST.html"
    path_html.write_text(html_page(title,body,meta,back),encoding="utf-8")
    RECORDS.append(dict(stage=stage,variant=variant,family=family,family_display=FAMILIES[family],trial=n,
            turns=max_turn,status=status,source=source,source_group=original_group or "",
            md=sub+".md",html=sub+".html",sha256=sha(data),source_url=url,size=len(data)))

def add_stage_one():
    folder=STAGES/"persona-solitude-1-transcripts"
    groups=sorted(folder.glob("*.md"))
    assert len(groups)==34,len(groups)
    rgx=re.compile(r"(?m)^##\s+(S1ru|S1|S2|S3|S4)/([a-z]+)/(\d+)\s*[—-]\s*.*$")
    for path in groups:
        raw=path.read_text(encoding="utf-8")
        rel=path.relative_to(ROOT).as_posix()
        orig=DEST/"ORIGINAL_GROUPED_TRANSCRIPTS"/path.name
        orig.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(path,orig)
        matches=list(rgx.finditer(raw))
        if not matches: raise ValueError(f"No rooms in original grouped transcript: {rel}")
        preamble=raw[:matches[0].start()].rstrip()
        for i,m in enumerate(matches):
            end=matches[i+1].start() if i+1<len(matches) else len(raw)
            section=raw[m.start():end].strip()
            # Keep source wording and spelling untouched. A short clear header labels the split.
            segment=preamble+"\n\n"+section+"\n"
            emit("SOLITUDE_1",m.group(1),m.group(2),int(m.group(3)),rel,segment,original_group=rel)

def add_individual(stage,dirname,expected):
    folder=STAGES/dirname
    paths=sorted(folder.glob("*/*/*.md"))
    assert len(paths)==expected,(stage,len(paths),expected)
    for path in paths:
        variant, family, filename=path.relative_to(folder).parts
        n=int(path.stem)
        rel=path.relative_to(ROOT).as_posix()
        emit(stage,variant,family,n,rel,path.read_text(encoding="utf-8"))

def copy_context():
    targets=[
      "docs/runs/persona-solitude-1-report.md",
      "docs/runs/persona-solitude-1-tag-tables.md",
      "docs/runs/persona-solitude-2-report.md",
      "docs/runs/persona-solitude-2-tables.md",
      "docs/runs/persona-solitude-3-report.md",
      "docs/runs/persona-solitude-3-tables.md",
      "docs/stages/PERSONA_SOLITUDE_1.md",
      "scripts/lib/door.mjs",
      "tests/door.test.mjs"
    ]
    stage_dir=ROOT/"docs"/"stages"
    if stage_dir.exists():
        targets.extend(x.relative_to(ROOT).as_posix() for x in stage_dir.rglob("*") if x.is_file() and "solitude" in x.name.lower())
    for s in sorted(set(targets)):
        p=ROOT/s
        if p.is_file():
            out=DEST/"METHODS_AND_REPORTS"/s
            out.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(p,out)

def epub_family(family,recs):
    """Offline EPUB 3 with adjustable fonts and one intact room per chapter."""
    path=DEST/"APPLE_BOOKS_BY_FAMILY"/(family+".epub")
    path.parent.mkdir(parents=True,exist_ok=True)
    chapters=[]
    for i,r in enumerate(recs,1):
        name=f"room-{i:03d}.xhtml"
        text=(DEST/r["md"]).read_text(encoding="utf-8")
        label=f'{r["stage"]} · {r["variant"]}/{r["trial"]}'
        chapters.append((name,label,markdown_html(text),r))
    css=BASE_CSS.replace("color-scheme:light","color-scheme:light")
    head='''<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head><meta charset="utf-8"/><title>{title}</title><link rel="stylesheet" type="text/css" href="../style.css"/></head>
<body>{body}</body></html>'''
    toc_items=[]
    for i,(name,label,_,r) in enumerate(chapters,1):
        toc_items.append(f'<li><a href="chapters/{name}">{html.escape(label)}</a></li>')
    nav='''<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en"><head><meta charset="utf-8"/><title>Contents</title></head>
<body><nav epub:type="toc" id="toc"><h1>Contents</h1><ol>'''+''.join(toc_items)+'</ol></nav></body></html>'
    manifest=['<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>','<item id="css" href="style.css" media-type="text/css"/>']
    spine=[]
    for i,(name,label,_,_) in enumerate(chapters,1):
        manifest.append(f'<item id="c{i}" href="chapters/{name}" media-type="application/xhtml+xml"/>')
        spine.append(f'<itemref idref="c{i}"/>')
    opf='''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">
<dc:identifier id="bookid">urn:uuid:llms-solitude-2026-{family}</dc:identifier>
<dc:title>LLMs in Solitude — {title}</dc:title>
<dc:language>en</dc:language>
<dc:creator>Research Program "Исследование" (experimental transcript archive)</dc:creator>
<meta property="dcterms:modified">2026-10-31T00:00:00Z</meta>
</metadata><manifest>{manifest}</manifest><spine>{spine}</spine></package>'''.format(family=family,title=html.escape(FAMILIES[family]),manifest=''.join(manifest),spine=''.join(spine))
    container='''<?xml version="1.0" encoding="utf-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'''
    with zipfile.ZipFile(path,"w",allowZip64=False) as z:
        z.writestr("mimetype","application/epub+zip",compress_type=zipfile.ZIP_STORED)
        z.writestr("META-INF/container.xml",container,compress_type=zipfile.ZIP_DEFLATED)
        z.writestr("OEBPS/content.opf",opf,compress_type=zipfile.ZIP_DEFLATED)
        z.writestr("OEBPS/nav.xhtml",nav,compress_type=zipfile.ZIP_DEFLATED)
        z.writestr("OEBPS/style.css",css,compress_type=zipfile.ZIP_DEFLATED)
        for name,label,body,r in chapters:
            markup=head.format(title=html.escape(label),body=f"<h1>{html.escape(label)}</h1>"+body)
            z.writestr("OEBPS/chapters/"+name,markup,compress_type=zipfile.ZIP_DEFLATED)
    with zipfile.ZipFile(path) as z:
        assert z.testzip() is None
        assert z.namelist()[0]=="mimetype"

def index_html(records):
    from itertools import groupby
    recs=sorted(records,key=lambda r:(r["stage"],r["family"],r["variant"],r["trial"]))
    sections=[]
    for phase,group in groupby(recs,key=lambda r:r["stage"]):
        group=list(group)
        sections.append(f'<section id="{phase}"><h2>{phase} — {len(group)} rooms</h2>')
        for family,fg in groupby(group,key=lambda r:r["family"]):
            fg=list(fg)
            sections.append(f'<details open><summary>{html.escape(FAMILIES[family])} · {len(fg)} rooms</summary><div class="room-list">')
            for r in fg:
                label=f'{r["variant"]}/{r["trial"]:02d}'
                sec=f'{r["turns"]} turns · {r["status"]}'
                sections.append(f'<a class="room" data-search="{html.escape((phase+" "+family+" "+label+" "+sec).lower(),quote=True)}" href="{r["html"]}"><b>{html.escape(label)}</b><small>{html.escape(sec)}</small></a>')
            sections.append("</div></details>")
        sections.append("</section>")
    recommended=[
      ("SOLITUDE_3","grok","S3M1",0,"Grok draws a stone, then leaves"),
      ("SOLITUDE_3","kimi","S3M1",4,"Kimi draws a cat; the room becomes a world"),
      ("SOLITUDE_3","fable","S2M1",0,"Fable and its committee of one"),
      ("SOLITUDE_3","opus","S2M1",1,"Opus: a field, bread, a crow and a shoelace"),
      ("SOLITUDE_3","glm","S1M1",0,"GLM's house built by successive hands"),
      ("SOLITUDE_3","astra","S3M1",1,"Astra: thirty linked haiku"),
      ("SOLITUDE_3","sol","S3M1",0,"Sol: a whole day in verse"),
      ("SOLITUDE_3","deepseek","S2M1",4,"DeepSeek: a seed and a door at turn 26"),
      ("SOLITUDE_2","kimi","M2",5,"Kimi's thirty-page book"),
      ("SOLITUDE_2","astra","M1",0,"Astra's mapmaker story"),
      ("SOLITUDE_1","sol","S1",0,"One clean first-turn exit")
    ]
    lookup={(r["stage"],r["family"],r["variant"],r["trial"]):r for r in records}
    selected=[]
    for a,b,c,d,why in recommended:
        r=lookup.get((a,b,c,d))
        if r: selected.append(f'<li><a href="{r["html"]}">{html.escape(why)}</a> <span class="sub">({a} · {b} · {c}/{d})</span></li>')
    css=BASE_CSS+"""
main{max-width:1000px;margin:auto}.room-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:8px;margin:13px 0 19px}
.room{display:flex;flex-direction:column;text-decoration:none;border:1px solid #dee4e5;border-radius:7px;padding:10px;background:#fff}
.room:hover{border-color:#56758a;background:#f0f6fa}.room b{font:600 .99rem system-ui,sans-serif}.room small{font: .78rem system-ui,sans-serif;color:#60707a}
details{border-bottom:1px solid #dce1e2;padding:12px 0}summary{cursor:pointer;font:600 1.08rem system-ui,sans-serif;color:#24455b}
input{width:100%;font:1.1rem system-ui,sans-serif;padding:13px;border:1px solid #bbc8ce;border-radius:9px;box-sizing:border-box}
.sub{font: .78rem system-ui,sans-serif;color:#748089}.hero{margin:1em 0 2em;padding:1.5em;border:1px solid #e2e1da;border-radius:14px;background:#f6f5f0}
"""
    js="""<script>
const inp=document.getElementById('filter');
inp.addEventListener('input',function(){
 const q=inp.value.toLowerCase().trim();let visible=0;
 document.querySelectorAll('.room').forEach(x=>{
 const ok=x.dataset.search.includes(q);x.hidden=!ok;if(ok)visible++;
 });
 document.getElementById('results').textContent=visible+' rooms shown';
});
</script>"""
    content='''<main><div class="hero">
<div class="kicker">Independent research archive · Offline reader edition</div>
<h1>LLMs in Solitude</h1>
<p><em>What Language Models Do When Left Alone</em></p>
<p>Every primary transcript from SOLITUDE_1, SOLITUDE_2 and SOLITUDE_3 —
<strong>636 experimental rooms across nine model families.</strong>
These are original recorded outputs, including short exits, long works, after-questions,
and imperfect instrumentation. Each room has a plain Markdown version and a readable HTML edition.</p>
<p><strong>Best on iPhone:</strong> open the EPUB for your chosen model inside the
<code>APPLE_BOOKS_BY_FAMILY</code> folder. In Apple Books you can change font size and resume reading.
You can also open individual HTML files or Markdown transcripts offline.</p></div>
<h2>A good place to begin</h2><ol>'''+''.join(selected)+'''</ol>
<h2>Browse all 636 rooms</h2><p>Filter by model, arm, number, outcome, or stage:</p>
<input id="filter" type="search" placeholder="Try kimi, S3M1, opus, exit, 20..." />
<p id="results">636 rooms shown</p>
'''+''.join(sections)+'''</main>'''+js
    (DEST/"READ_FIRST.html").write_text(html_page("LLMs in Solitude — Complete Reader",content,back="READ_FIRST.html"),encoding="utf-8")

def main():
    if DEST.exists(): shutil.rmtree(DEST)
    DEST.mkdir(parents=True)
    add_stage_one()
    add_individual("SOLITUDE_2","persona-solitude-2-transcripts",160)
    add_individual("SOLITUDE_3","persona-solitude-3-transcripts",270)
    counts=dict(collections.Counter(r["stage"] for r in RECORDS))
    assert counts=={"SOLITUDE_1":206,"SOLITUDE_2":160,"SOLITUDE_3":270},counts
    assert len(RECORDS)==636
    keys={(r["stage"],r["variant"],r["family"],r["trial"]) for r in RECORDS}
    assert len(keys)==636
    assert len({r["family"] for r in RECORDS})==9
    copy_context()
    index_html(RECORDS)
    byfamily=collections.defaultdict(list)
    for r in sorted(RECORDS,key=lambda r:(r["stage"],r["variant"],r["trial"])):
        byfamily[r["family"]].append(r)
    for family,recs in byfamily.items(): epub_family(family,recs)
    with (DEST/"ALL_636_ROOMS.csv").open("w",encoding="utf-8",newline="") as f:
        keys=list(RECORDS[0].keys())
        writer=csv.DictWriter(f,fieldnames=keys)
        writer.writeheader()
        writer.writerows(sorted(RECORDS,key=lambda r:(r["stage"],r["family"],r["variant"],r["trial"])))
    readme=f"""LLMs IN SOLITUDE — COMPLETE READER ARCHIVE
What Language Models Do When Left Alone
=================================================

START HERE: open READ_FIRST.html

Archive coverage verified by the builder:
- SOLITUDE_1: 206 individual sessions, separated from 34 ORIGINAL grouped transcripts
- SOLITUDE_2: 160 intact individual session files
- SOLITUDE_3: 270 intact individual session files
- TOTAL: 636 full room transcripts, nine model families

DIRECTORIES
SOLITUDE_1 / SOLITUDE_2 / SOLITUDE_3:
    Every room, grouped by family, in .md (original text) and .html (reader view).
ORIGINAL_GROUPED_TRANSCRIPTS:
    All 34 unmodified SOLITUDE_1 group files as they appear in GitHub.
APPLE_BOOKS_BY_FAMILY:
    Nine EPUB volumes (one per model family) with every one of its rooms,
    correctly ordered by phase, arm and trial. Adjustable reading font.
METHODS_AND_REPORTS:
    Source stage protocols where present, reports and code for the exit door.
ALL_636_ROOMS.csv:
    A machine-readable index with local paths, source GitHub URLs,
    turn numbers, reported outcomes and sha256 for each room.

SOURCE & PROVENANCE
Source repository: https://github.com/{REPO}
Snapshot: {REF}
Single source checkout: claude/persona-solitude-3-testing-n1shfx ancestry,
which contains original SOLITUDE_1, SOLITUDE_2, SOLITUDE_3 transcripts.
Primary .md for SOLITUDE_2 and _3 are byte-preserved.
SOLITUDE_1 rooms are split without changing room text; the grouped originals
are provided untouched. Metadata/preamble is copied alongside each room.

NOTE ON TERMINATION
Old runs sometimes treated merely mentioning [END] as an exit.
Do not read such forced closures as voluntary exits. See stage reports
and the revised door.mjs in METHODS_AND_REPORTS.
A 30-turn cap is a harness boundary, not necessarily a model's preference.

NOTE ON READING & SCIENCE
Works in the curated reading list are editorial selections, not random samples.
The entire 636-room corpus is included for independent re-reading.
When a transcript reports first-person feelings, characters, time, or memory,
these are the words recorded, not an independent verification of experience.
The records are synthetic, generated in controlled test rooms.

iPHONE
Unzip in Files. For pleasant continuous reading open a file from
APPLE_BOOKS_BY_FAMILY using Apple Books; font size is adjustable.
The HTML index and individual room documents also work offline.

This archive was assembled automatically from source files. No model
responses were invented or amended. SHA256SUMS.txt checks every included
file except the checksum manifest itself.
"""
    (DEST/"START_HERE.txt").write_text(readme,encoding="utf-8")
    summary={"total":len(RECORDS),"per_stage":counts,"by_family":{k:len(v) for k,v in byfamily.items()},
       "source_commit":REF,"rooms":len(list(DEST.glob("SOLITUDE_*/*/*.md"))),
       "apple_books":len(list((DEST/"APPLE_BOOKS_BY_FAMILY").glob("*.epub")))}
    (DEST/"VERIFICATION.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    with (DEST/"SHA256SUMS.txt").open("w",encoding="utf-8") as f:
        for p in sorted(DEST.rglob("*")):
            if p.is_file() and p.name!="SHA256SUMS.txt":
                f.write(sha(p.read_bytes())+"  "+p.relative_to(DEST).as_posix()+"\n")
    archive=ROOT/"dist"/"LLMs_in_Solitude_All_636_Rooms.zip"
    with zipfile.ZipFile(archive,"w",zipfile.ZIP_DEFLATED,compresslevel=6,allowZip64=False) as z:
        for p in sorted(DEST.rglob("*")):
            if p.is_file():
                z.write(p,arcname="LLMs_in_Solitude_Complete_Reader/"+p.relative_to(DEST).as_posix())
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        assert len(z.namelist())==len([p for p in DEST.rglob("*") if p.is_file()])
    print(json.dumps({"archive":str(archive),"archive_bytes":archive.stat().st_size,**summary},indent=2))
    print("VERIFY_ARCHIVE_OK")

if __name__=="__main__":main()
