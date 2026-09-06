"""Read-only checks for the completed report and ignored QA contact sheets."""
from pathlib import Path
from zipfile import ZipFile
import re
from PIL import Image, ImageDraw
from pypdf import PdfReader
from docx import Document

ROOT = Path(__file__).resolve().parents[1]
qa = ROOT / '_docx_work/completed_checked'
pdf = PdfReader(qa / 'coursework.pdf')
assert len(pdf.pages) == 34
assert all(len(p.extract_text()) > 100 for p in pdf.pages)
for page, heading in [(26, '2.3.3'), (29, '3.1'), (31, '3.2'),
                      (32, '3.3'), (33, 'Заключение'), (34, 'Список используемых')]:
    assert heading in pdf.pages[page - 1].extract_text(), (page, heading)
doc = Document(ROOT / 'deliverables/Курсовая_Блинов_текущая.docx')
captions = [m[1] for p in doc.paragraphs
            if (m := re.match(r'Рисунок (\d+\.\d+)\s+[–-]', p.text))]
assert [n for n in captions if n.startswith('2.') and int(n.split('.')[1]) >= 8] == [f'2.{i}' for i in range(8, 24)]
assert captions[-2:] == ['3.1', '3.2']
# Every embedded source image, including user screenshots, must survive unchanged.
with ZipFile(ROOT / '_docx_work/before_completion_20260906.docx') as old, \
     ZipFile(ROOT / 'deliverables/Курсовая_Блинов_текущая.docx') as new:
    for name in old.namelist():
        if name.startswith('word/media/'):
            assert old.read(name) == new.read(name), name
for start in range(1, 35, 4):
    sheet = Image.new('RGB', (1400, 2040), '#dddddd')
    draw = ImageDraw.Draw(sheet)
    for k, n in enumerate(range(start, min(start + 4, 35))):
        im = Image.open(qa / f'page-{n:02}.png')
        im.thumbnail((690, 990))
        x, y = (k % 2) * 700, (k // 2) * 1020
        sheet.paste(im, (x, y + 25))
        draw.text((x + 10, y + 5), f'PAGE {n}', fill='black')
    sheet.save(qa / f'qa-{start:02}.png')
print('PASS: 34 pages; expected section pages and captions; all source images unchanged.')
