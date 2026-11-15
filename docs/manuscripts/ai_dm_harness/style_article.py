"""Apply readable research-article typography to the Pandoc DOCX."""
from pathlib import Path
import re
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE

ROOT=Path(__file__).resolve().parent
p=ROOT/'output/AI_DM_Harness_Research_Article_2026-11-14.docx'
d=Document(p)
for name in ['Header','Footer']:
    if name not in d.styles:d.styles.add_style(name,WD_STYLE_TYPE.PARAGRAPH)
for s in d.sections:
    s.page_width=Inches(8.5);s.page_height=Inches(11)
    s.top_margin=Inches(.75);s.bottom_margin=Inches(.7)
    s.left_margin=Inches(.8);s.right_margin=Inches(.8)
    s.header_distance=Inches(.3);s.footer_distance=Inches(.3)
    s.different_first_page_header_footer=True
    h=s.header.paragraphs[0];h.text='AI Dungeon Masters as Open-Ended Research Environments';h.style='Header'
    f=s.footer.paragraphs[0];f.clear();f.alignment=2;f.style='Footer'
    fld=OxmlElement('w:fldSimple');fld.set(qn('w:instr'),'PAGE');f._p.append(fld)
for s in d.styles:
    if s.type in [1,2]:
        s.font.name='Noto Serif';s.font.size=Pt(11.5);s.font.color.rgb=RGBColor(0,0,0)
for name in ['Normal','Body Text','First Paragraph','Compact']:
    if name in d.styles:
        s=d.styles[name];s.paragraph_format.line_spacing=1.13;s.paragraph_format.space_after=Pt(7)
style_ids={s.style_id:s for s in d.styles}
for level,size in [(1,23),(2,15),(3,12.5)]:
    s=style_ids['Heading'+str(level)];s.font.name='Noto Sans';s.font.size=Pt(size);s.font.bold=True
    s.paragraph_format.space_before=Pt(15);s.paragraph_format.space_after=Pt(7)
    s.paragraph_format.keep_with_next=True;s.paragraph_format.page_break_before=False
for name in ['Header','Footer']:
    d.styles[name].font.name='Noto Sans';d.styles[name].font.size=Pt(8)
    d.styles[name].font.color.rgb=RGBColor.from_string('555555')
if 'Block Text' in d.styles:
    s=d.styles['Block Text'];s.font.size=Pt(11.5)
    s.paragraph_format.left_indent=Inches(.23);s.paragraph_format.right_indent=Inches(.13)
    s.paragraph_format.space_before=Pt(3);s.paragraph_format.space_after=Pt(5)
    s.paragraph_format.keep_with_next=True
if 'Hyperlink' in d.styles:
    d.styles['Hyperlink'].font.color.rgb=RGBColor.from_string('254D70')
for name in ['Verbatim Char','Source Code']:
    if name in d.styles:d.styles[name].font.name='DejaVu Sans Mono';d.styles[name].font.size=Pt(9)
paras=d.paragraphs
paras[0].style='Title';paras[0].paragraph_format.space_before=Pt(8);paras[0].paragraph_format.space_after=Pt(10)
for r in paras[0].runs:r.font.name='Noto Sans';r.font.size=Pt(24);r.font.bold=True
paras[1].style='Subtitle';paras[1].paragraph_format.space_after=Pt(12)
for r in paras[1].runs:r.font.name='Noto Sans';r.font.size=Pt(13);r.font.color.rgb=RGBColor.from_string('333333')
for par in paras[2:4]:
    par.paragraph_format.space_after=Pt(5)
    for r in par.runs:r.font.size=Pt(10)
in_refs=False
in_abstract=False
for pi,par in enumerate(paras):
    par.paragraph_format.widow_control=True
    if par.text=='Abstract':in_abstract=True
    elif par.text.startswith('1. The environment'):in_abstract=False
    elif in_abstract:
        par.paragraph_format.line_spacing=1.07
        par.paragraph_format.space_after=Pt(6)
        for r in par.runs:r.font.size=Pt(11)
    if par.text.endswith(':') and pi+1<len(paras) and paras[pi+1].style.style_id=='BlockText':
        par.paragraph_format.keep_with_next=True
    if par.text in ['References','Primary sources and implementation']:
        in_refs=True;par.paragraph_format.page_break_before=(par.text=='Primary sources and implementation')
    elif in_refs and par.style.style_id not in ['Heading1','Heading2','Heading3']:
        par.paragraph_format.keep_together=True
        par.paragraph_format.line_spacing=1.08;par.paragraph_format.space_after=Pt(7)
        for run in par.runs:run.font.size=Pt(10.5)
    if re.match(r'^T\d{3} · ',par.text):
        par.paragraph_format.space_after=Pt(9)
        for r in par.runs:r.font.size=Pt(9)
    if par.text.startswith('Figure 1.'):
        par.paragraph_format.keep_together=True
        for r in par.runs:r.font.size=Pt(9.5)
    if par._p.xpath('.//w:drawing'):
        par.paragraph_format.keep_with_next=True
for tab in d.tables:
    tab.autofit=False
    widths=[2.13,4.77]
    for col,width in zip(tab.columns,widths):col.width=Inches(width)
    for ri,row in enumerate(tab.rows):
        pr=row._tr.get_or_add_trPr();pr.append(OxmlElement('w:cantSplit'))
        if ri==0:pr.append(OxmlElement('w:tblHeader'))
        for ci,cell in enumerate(row.cells):
            cell.width=Inches(widths[ci])
            tcPr=cell._tc.get_or_add_tcPr()
            if ri==0:
                shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'EAF0F4');tcPr.append(shade)
            for par in cell.paragraphs:
                par.paragraph_format.space_before=Pt(2);par.paragraph_format.space_after=Pt(2)
                par.paragraph_format.line_spacing=1.06
                if ri==0:par.paragraph_format.keep_with_next=True
                for r in par.runs:r.font.name='Noto Sans';r.font.size=Pt(10);r.font.bold=(ri==0)
for shape in d.inline_shapes:
    if shape.width>Inches(6.8):
        ratio=Inches(6.8)/shape.width;shape.width=Inches(6.8);shape.height=int(shape.height*ratio)
d.core_properties.title='AI Dungeon Masters as Open-Ended Research Environments'
d.core_properties.subject='Action invention, persistent consequences, and interaction among language models'
d.core_properties.author='Исследование'
d.core_properties.comments='Standalone working research article. Frozen evidence and exact-quotation audit accompany this edition.'
d.save(p)
print('Styled article DOCX')
