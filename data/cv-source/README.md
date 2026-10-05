# CV publications-page source

`publications.tex` is the editable source for page 3 of `../Tharun_Resume.pdf`.
Its baseline text was checked against the existing PDF before applying the October 2026 factual corrections. The original full-document source was not available: the archived Overleaf files differ from the live CV.

Run `python build.py` with pdfLaTeX, Latin Modern, and PyMuPDF installed. This compiles page 3 and replaces only that page in the existing three-page CV, preserving pages 1 and 2. Keep the PDF alongside this directory when rebuilding.
