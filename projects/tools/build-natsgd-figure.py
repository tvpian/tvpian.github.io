#!/usr/bin/env python3
"""Reproduce a publication-style architecture, grounded in the NatSGD notebooks."""
from pathlib import Path
from base64 import b64encode
from html import escape

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "projects/generated/natsgd-architecture.svg"


def uri(path, mime):
    return f"data:{mime};base64," + b64encode(path.read_bytes()).decode()


det = uri(ROOT / "projects/assets/natsgd-detector-source.png", "image/png")
overview = uri(ROOT / "imgs/natsgd-context.png", "image/png")
regular = uri(ROOT / "imgs/fonts/dm-sans-400.ttf", "font/ttf")
medium = uri(ROOT / "imgs/fonts/dm-sans-500.ttf", "font/ttf")

S = [f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2220 930" role="img" aria-labelledby="title desc">
<title id="title">Multimodal instruction grounding and recurrent robot-state prediction</title>
<desc id="desc">Panel a shows the gesture-attention notebook: Faster R-CNN produces object features F; frozen GloVe and a GRU produce language embedding s; two gesture GRUs produce g. Two attention modules query F with s and g, forming weighted scene vectors. Concatenation with s and the initial robot state conditions a recurrent prediction head. Panel b shows the alternative direct gesture-conditioning model.</desc>
<defs>
<marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill="#30343b"/></marker>
<image id="gesture-source" href="{overview}" width="2826" height="1404"/>
<clipPath id="gesture-crop"><rect x="43" y="495" width="207" height="145"/></clipPath>
</defs>
<style>
@font-face{{font-family:DM;src:url("{regular}")}}
@font-face{{font-family:DM;src:url("{medium}");font-weight:500}}
text{{font-family:DM,Arial,sans-serif;fill:#252a33}}
.panel{{font-size:25px;font-weight:500}}
.label{{font-size:22px}}
.small{{font-size:17px;fill:#52606b}}
.math{{font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:25px}}
.wire{{fill:none;stroke:#30343b;stroke-width:1.7;marker-end:url(#arrow)}}
.plain{{fill:none;stroke:#30343b;stroke-width:1.5}}
.light{{fill:none;stroke:#b4bbc3;stroke-width:1.2}}
</style><rect width="2220" height="930" fill="#fff"/>
''']

BLUE = ("#dce8f8", "#698ebd")
GREEN = ("#e0eee1", "#739873")
PURPLE = ("#e9e0f2", "#9c83b0")
YELLOW = ("#fff0ce", "#c3a466")
GRAY = ("#f2f3f5", "#adb4bf")


def text(x, y, t, css="label", anchor="middle"):
    S.append(f'<text x="{x}" y="{y}" class="{css}" text-anchor="{anchor}">{escape(t)}</text>')


def box(x, y, w, h, lines, palette=BLUE, size=22):
    bg, stroke = palette
    S.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{bg}" stroke="{stroke}" stroke-width="1.5"/>')
    if isinstance(lines, str):
        lines = [lines]
    first = y+h/2-(len(lines)-1)*13+7
    for i, t in enumerate(lines):
        S.append(f'<text x="{x+w/2}" y="{first+i*26}" text-anchor="middle" style="font-size:{size}px">{escape(t)}</text>')


def arrow(d, dash=False):
    a = ' stroke-dasharray="5 4"' if dash else ""
    S.append(f'<path d="{d}" class="wire"{a}/>')


def segment(d, css="plain"):
    S.append(f'<path d="{d}" class="{css}"/>')


def dot(x, y):
    S.append(f'<circle cx="{x}" cy="{y}" r="3.2" fill="#30343b"/>')


def tensor(x, y, cols, rows, color, label=None, cell=12, depth=True):
    w, h = cols*cell, rows*cell
    bg, stroke = color
    if depth:
        for d in [10, 5]:
            S.append(f'<rect x="{x+d}" y="{y-d}" width="{w}" height="{h}" fill="{bg}" stroke="{stroke}" stroke-width="1"/>')
    S.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{bg}" stroke="{stroke}" stroke-width="1.3"/>')
    for i in range(1, cols):
        S.append(f'<path d="M{x+i*cell} {y} v{h}" stroke="{stroke}" stroke-width=".7"/>')
    for i in range(1, rows):
        S.append(f'<path d="M{x} {y+i*cell} h{w}" stroke="{stroke}" stroke-width=".7"/>')
    if label:
        text(x+w/2, y+h+29, label, "math")
    return w, h


def concat(x, y, radius=22):
    S.append(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="#fff" stroke="#30343b" stroke-width="1.6"/>')
    text(x, y+8, "⊕", "math")


def attention(x, y, title, query, palette):
    box(x, y, 220, 127, [], palette)
    text(x+110, y+31, title, "label")
    # Explicit proposal-weight vector followed by weighted pooling.
    for j, a in enumerate([.35, .65, .95, .5, .25]):
        S.append(f'<rect x="{x+30+j*33}" y="{y+50}" width="25" height="18" fill="{palette[1]}" opacity="{a}" stroke="{palette[1]}" stroke-width=".6"/>')
    text(x+110, y+94, "α = softmax a(F, " + query + ")", "small")
    text(x+110, y+116, "weighted pooling", "small")


text(42, 38, "(a) Gesture-conditioned object attention", "panel", "start")
# Modality labels sit outside the computational graph.
text(146, 82, "Scene image  I", "label")
S.append(f'<image x="43" y="99" width="207" height="156" href="{det}" preserveAspectRatio="xMidYMid meet"/>')
text(146, 278, "notebook detection overlay", "small")
arrow("M250 177 H307")
box(308, 143, 170, 68, ["Faster R-CNN", "object detector"], BLUE)
arrow("M478 177 H551")
tensor(552, 122, 5, 8, BLUE, "F ∈ ℝᴷˣ⁵", cell=13)
text(590, 279, "class + normalized box", "small")

# One shared proposal bus feeds both query-dependent attention modules.
arrow("M627 177 H705 V285 H837 V309")
segment("M705 177 V515 H837")
arrow("M837 515 V533")
dot(705, 177)
text(748, 269, "F", "math")
text(748, 504, "F", "math")

text(146, 344, "Spoken instruction", "label")
text(146, 381, "“Baxter, we need", "label")
text(146, 409, "one onion.”", "label")
arrow("M250 382 H307")
box(308, 348, 109, 68, ["GloVe", "(frozen)"], GREEN)
arrow("M417 382 H455")
box(456, 348, 108, 68, ["GRU", "32"], GREEN)
arrow("M564 382 H603")
tensor(604, 343, 1, 6, GREEN, "s", cell=13, depth=False)
arrow("M617 382 H727")
text(665, 368, "query", "small")
attention(728, 309, "Language attention", "s", GREEN)
arrow("M948 372 H1003")
tensor(1004, 340, 1, 5, GREEN, cell=13, depth=False)
text(1010, 327, "zₗ", "math")
text(1010, 433, "Σᵢ αₗ,ᵢ fᵢ", "math")

text(146, 483, "Human gesture  G", "label")
S.append('<g clip-path="url(#gesture-crop)"><use href="#gesture-source" transform="translate(-483 474) scale(0.267)"/></g>')
text(146, 663, "NatSGD overview detail", "small")
arrow("M250 595 H307")
box(308, 561, 109, 68, ["GRU", "32"], PURPLE)
arrow("M417 595 H455")
box(456, 561, 108, 68, ["GRU", "16"], PURPLE)
arrow("M564 595 H603")
tensor(604, 556, 1, 6, PURPLE, "g", cell=13, depth=False)
arrow("M617 595 H727")
text(665, 581, "query", "small")
attention(728, 533, "Gesture attention", "g", PURPLE)
arrow("M948 596 H1003")
tensor(1004, 563, 1, 5, PURPLE, cell=13, depth=False)
text(1010, 550, "zɡ", "math")
text(1010, 657, "Σᵢ αɡ,ᵢ fᵢ", "math")

# The semantic context is assembled exactly as in the inspected attention model.
concat(1180, 485)
arrow("M1017 372 H1119 V470 H1157")
arrow("M1017 596 H1119 V500 H1157")
tensor(1139, 315, 1, 5, GREEN, cell=12, depth=False)
tensor(1195, 315, 1, 5, GRAY, cell=12, depth=False)
text(1145, 301, "s", "math")
text(1201, 301, "r₀", "math")
segment("M1145 375 V436 H1180")
segment("M1201 375 V436 H1180")
arrow("M1180 436 V462")

arrow("M1203 485 H1254")
for j, palette in enumerate([GREEN, GREEN, GRAY, PURPLE]):
    tensor(1255+j*14, 451, 1, 5, palette, cell=13, depth=False)
text(1281, 550, "c = [zₗ, s, r₀, zɡ]", "math")

# A single recurrent step exposes the actual state encoder and dense head.
S.append('<rect x="1438" y="237" width="589" height="320" rx="4" fill="#fcfcfb" stroke="#b9bdc4" stroke-width="1.3" stroke-dasharray="6 4"/>')
text(1455, 268, "Recurrent prediction head", "label", "start")
text(1407, 363, "rₜ", "math")
arrow("M1390 373 H1478")
box(1479, 339, 142, 69, ["GRU cell", "32"], BLUE)
arrow("M1621 373 H1660 V294 H1510 V338")
text(1657, 319, "hₜ₋₁", "math", "start")
concat(1550, 485, 20)
arrow("M1550 408 V464")
text(1575, 438, "hₜ", "math")
arrow("M1310 485 H1529")
arrow("M1571 485 H1635")
box(1636, 451, 141, 68, ["Dense 32", "ReLU"], YELLOW)
arrow("M1777 485 H1816")
box(1817, 451, 141, 68, ["Dense 16", "linear"], YELLOW)
arrow("M1958 485 H2083")
tensor(2084, 415, 5, 10, BLUE, "R̂ ∈ ℝᵀˣ¹⁶", cell=13)
text(2119, 591, "predicted states", "small")


# Compact second panel: a genuine alternative model, not a second route through a.
segment("M42 718 H2176", "light")
text(42, 758, "(b) Direct gesture-conditioning variant", "panel", "start")
text(42, 791, "Shared detector, language encoder, and language attention", "small", "start")
tensor(695, 770, 1, 5, GREEN, cell=12, depth=False)
tensor(751, 770, 1, 5, GREEN, cell=12, depth=False)
tensor(807, 770, 1, 5, GRAY, cell=12, depth=False)
tensor(863, 770, 1, 5, PURPLE, cell=12, depth=False)
for x, label in [(701, "zₗ"), (757, "s"), (813, "r₀"), (869, "g")]:
    text(x, 755, label, "math")
    segment(f"M{x} 830 V858 H930")
segment("M930 858 V819")
concat(962, 800)
arrow("M930 819 L944 812")
text(1077, 767, "c = [zₗ, s, r₀, g]", "math")
arrow("M985 800 H1222")
box(1223, 770, 360, 62, "Same recurrent prediction head", YELLOW)
arrow("M1583 800 H1655")
tensor(1656, 768, 4, 6, BLUE, "R̂", cell=11)
text(1785, 791, "Gesture embedding conditions", "small", "start")
text(1785, 817, "the controller directly.", "small", "start")
text(42, 914, "Image examples illustrate input modalities; they are not a synchronized trial. Tensors and attention weights are schematic.  ⊕  concatenation.", "small", "start")
S.append("</svg>")
OUT.write_text("\n".join(S), encoding="utf-8")
print(OUT)
