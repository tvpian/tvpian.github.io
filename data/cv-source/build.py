"""Rebuild the CV publications page, preserving the other PDF pages."""
from pathlib import Path
import subprocess
import fitz

root = Path(__file__).resolve().parent
subprocess.run(['pdflatex', '-interaction=nonstopmode', '-halt-on-error', 'publications.tex'], cwd=root, check=True)
target = root.parent / 'Tharun_Resume.pdf'
cv = fitz.open(target)
publication_page = fitz.open(root / 'publications.pdf')
assert len(cv) == 3 and len(publication_page) == 1
cv.delete_page(2)
cv.insert_pdf(publication_page)
temporary = target.with_name('Tharun_Resume.updated.pdf')
cv.save(temporary)
cv.close()
temporary.replace(target)
