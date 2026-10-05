"""Build the complete three-page CV from its LaTeX source."""
from pathlib import Path
import shutil
import subprocess
import fitz

root = Path(__file__).resolve().parent
for _ in range(2):
    subprocess.run(['pdflatex', '-interaction=nonstopmode', '-halt-on-error', 'cv.tex'], cwd=root, check=True)
with fitz.open(root / 'cv.pdf') as cv:
    assert len(cv) <= 3, 'CV exceeds the three-page limit'
shutil.copyfile(root / 'cv.pdf', root.parent / 'Tharun_Resume.pdf')
