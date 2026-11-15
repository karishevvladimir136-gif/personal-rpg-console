from pathlib import Path
import re
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE
R=Path(__file__).parent
p=R/'output/LLMs_at_the_Table_Research_Monograph_2026-11-14.docx'
d=Document(p)
for name in ['Header','Footer']:
 if name not in d.styles:d.styles.add_style(name,WD_STYLE_TYPE.PARAGRAPH)
for sec in d.sections:
 sec.page_width=Inches(5.45);sec.page_height=Inches(8.75)
 sec.top_margin=Inches(.48);sec.bottom_margin=Inches(.5)
 sec.left_margin=Inches(.46);sec.right_margin=Inches(.46)
 sec.header_distance=Inches(.17);sec.footer_distance=Inches(.2)
 sec.different_first_page_header_footer=True
 h=sec.header.paragraphs[0];h.text='LLMs at the Table';h.style='Header'
 for r in h.runs:r.font.name='Noto Sans';r.font.size=Pt(7.5);r.font.color.rgb=RGBColor.from_string('555555')
 f=sec.footer.paragraphs[0];f.alignment=2
 field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');f._p.append(field)
 f.style='Footer'
for s in d.styles:
 if s.type==1 or s.type==2:
  try:
   s.font.name='Noto Serif';s.font.size=Pt(12.3);s.font.color.rgb=RGBColor(0,0,0)
   pr=s.element.get_or_add_rPr();fonts=pr.find(qn('w:rFonts'))
   if fonts is None:fonts=OxmlElement('w:rFonts');pr.insert(0,fonts)
   fonts.set(qn('w:eastAsia'),'Noto Sans CJK SC')
  except Exception:pass
normal=d.styles['Normal'];normal.paragraph_format.space_after=Pt(7)
normal.paragraph_format.line_spacing=1.12
for name in ['Body Text','First Paragraph','Compact']:
 if name in d.styles:
  d.styles[name].paragraph_format.space_after=Pt(7)
  d.styles[name].paragraph_format.line_spacing=1.12
style_ids={s.style_id:s for s in d.styles}
for level,size in [(1,25),(2,21),(3,18),(4,14)]:
 s=style_ids[f'Heading{level}'];s.font.name='Noto Sans';s.font.size=Pt(size);s.font.bold=True
 s.paragraph_format.space_before=Pt(16);s.paragraph_format.space_after=Pt(10)
 s.paragraph_format.keep_with_next=True
 s.paragraph_format.page_break_before=(level==1)
if 'Block Text'in d.styles:
 s=d.styles['Block Text'];s.font.size=Pt(12.3)
 s.paragraph_format.left_indent=Inches(.12);s.paragraph_format.right_indent=Inches(0)
 s.paragraph_format.space_after=Pt(6);s.paragraph_format.line_spacing=1.08
for name in ['Verbatim Char','Source Code']:
 if name in d.styles:
  s=d.styles[name];s.font.name='DejaVu Sans Mono';s.font.size=Pt(9)
  if name=='Source Code':
   s.paragraph_format.line_spacing=1.0;s.paragraph_format.space_after=Pt(0);s.paragraph_format.keep_together=False
for s in d.styles:
 if s.style_id.endswith('Tok'):
  s.font.name='DejaVu Sans Mono';s.font.size=Pt(9);s.font.italic=False
for name in ['Header','Footer']:
 d.styles[name].font.name='Noto Sans';d.styles[name].font.size=Pt(7.5)
in_contents=False
for pi,p0 in enumerate(d.paragraphs):
 if p0.text=='Contents' and p0.style.style_id=='Heading1':in_contents=True
 elif p0.text.startswith('PART I ') and p0.style.style_id=='Heading1':in_contents=False
 elif in_contents:
  p0.paragraph_format.keep_together=True
  p0.paragraph_format.space_before=Pt(0)
  p0.paragraph_format.space_after=Pt(1)
  p0.paragraph_format.line_spacing=1.04
  if re.match(r'^[A-H]\. ',p0.text) or p0.text.startswith(('PART I ','PART II ','SYNTHESIS','APPENDICES')):
   p0.paragraph_format.space_before=Pt(8)
   p0.paragraph_format.space_after=Pt(5)
 if p0.style.style_id not in ['Heading1','Heading2','Heading3'] and (re.match(r'^[A-H]\. ',p0.text) or p0.text.startswith(('PART I ','PART II ','SYNTHESIS','APPENDICES'))):
  p0.paragraph_format.keep_with_next=True
 if re.match(r'^[A-H]\. ',p0.text) and p0.style.style_id=='Heading2':
  previous=d.paragraphs[pi-1] if pi else None
  p0.paragraph_format.page_break_before=not(previous and previous.style.style_id=='Heading1')
 if re.match(r'^\d+\. ',p0.text) and p0.style.style_id=='Heading3':
  previous=d.paragraphs[pi-1] if pi else None
  p0.paragraph_format.page_break_before=not(previous and previous.style.style_id in ['Heading1','Heading2'])
 if p0.text.startswith(('Visible screen','Player turn','Next visible','Next card','Observation before','Round ','Turn ')) and re.search(r'Q\d{3}',p0.text):
  p0.paragraph_format.keep_with_next=True
  for r0 in p0.runs:r0.font.name='Noto Sans';r0.font.size=Pt(9);r0.font.bold=True
 if p0.text.startswith('Source:'):
  p0.paragraph_format.keep_with_next=True
  for r0 in p0.runs:r0.font.size=Pt(9)
 p0.paragraph_format.widow_control=True
 if p0.text.startswith('Chamber ')or p0.text=='A note to the reader':p0.paragraph_format.page_break_before=True
 if p0.text=='Reading the exchange':p0.paragraph_format.keep_with_next=True;p0.paragraph_format.space_before=Pt(12)
 if p0.text.startswith('Side ') and ' · message 'in p0.text:
  p0.paragraph_format.keep_with_next=True
  p0.paragraph_format.space_before=Pt(9)
  for r in p0.runs:r.font.name='Noto Sans';r.font.size=Pt(9);r.font.bold=True
 if p0.text.startswith('A: ')and'Room key:'in p0.text:
  for r in p0.runs:r.font.name='Noto Sans';r.font.size=Pt(9)
 if p0.text.startswith('SELF_TALK_')and ' · arm 'in p0.text:
  for r in p0.runs:r.font.name='Noto Sans';r.font.size=Pt(9)
for tab in d.tables:
 tab.autofit=False
 cols=len(tab.columns);width=Inches(4.53/cols)
 for col in tab.columns:col.width=width
 for ri,row in enumerate(tab.rows):
  rp=row._tr.get_or_add_trPr();cant=OxmlElement('w:cantSplit');rp.append(cant)
  for cell in row.cells:
   cell.width=width
   for par in cell.paragraphs:
    if ri==0:par.paragraph_format.keep_with_next=True
    par.paragraph_format.space_after=Pt(4);par.paragraph_format.space_before=Pt(3);par.paragraph_format.line_spacing=1.05
    for run in par.runs:run.font.name='Noto Sans';run.font.size=Pt(9);run.font.bold=(ri==0)
  if ri==0:
   rp=row._tr.get_or_add_trPr();rep=OxmlElement('w:tblHeader');rp.append(rep)
# Cover: title and subtitle followed by restrained metadata.
paras=d.paragraphs
paras[0].style='Title';paras[0].paragraph_format.page_break_before=False;paras[0].paragraph_format.space_before=Pt(48)
for r in paras[0].runs:r.font.name='Noto Sans';r.font.size=Pt(32);r.font.bold=True
paras[1].style='Subtitle';paras[1].paragraph_format.page_break_before=False
for r in paras[1].runs:r.font.name='Noto Serif';r.font.size=Pt(18);r.font.italic=False
for par in paras[2:7]:
 par.paragraph_format.space_after=Pt(14)
 for run in par.runs:run.font.size=Pt(11)
d.core_properties.title='LLMs at the Table'
d.core_properties.subject='What Language Models Do When a Simulated World Can Answer Back'
d.core_properties.author='Исследование'
d.core_properties.comments='Two-harness structure, 14 November 2026. 57 chapters; 82 primary transcript files.'
d.save(p)
print('Styled',p)
