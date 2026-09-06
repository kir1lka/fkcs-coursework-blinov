"""Read-only DOCX/PDF checks; write only ignored QA contact sheets."""
from pathlib import Path
from PIL import Image, ImageDraw
from pypdf import PdfReader
from docx import Document
import re
ROOT=Path(__file__).resolve().parents[1]
qa=ROOT/'_docx_work/aligned_checked'
r=PdfReader(qa/'coursework.pdf')
assert len(r.pages)==28
assert all(len(p.extract_text())>100 for p in r.pages)
assert '2.3.3' in r.pages[25].extract_text()
d=Document(ROOT/'deliverables/Курсовая_Блинов_текущая.docx')
nums=[int(m[1]) for p in d.paragraphs if (m:=re.match(r'Рисунок 2\.(\d+)\s+[–-]',p.text))]
assert [n for n in nums if n>=8]==list(range(8,24)),nums
for start in range(1,29,4):
    sheet=Image.new('RGB',(1400,2040),'#dddddd');dr=ImageDraw.Draw(sheet)
    for k,n in enumerate(range(start,min(start+4,29))):
        im=Image.open(qa/f'page-{n:02}.png');im.thumbnail((690,990))
        x=(k%2)*700;y=(k//2)*1020
        sheet.paste(im,(x,y+25));dr.text((x+10,y+5),f'PAGE {n}',fill='black')
    sheet.save(qa/f'qa-{start:02}.png')
print('PASS: 28 pages; no blank/orphan-only pages; figures 2.8–2.23 continuous; section 2.3.3 on page26.')
