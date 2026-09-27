#!/usr/bin/env python3
"""Rebuild ASTROD's paper-style vector figure; layer widths are schematic.
Source: U_ASTROD_Model_v0315(2).pdf, Sections II A–C.
"""
from pathlib import Path
from base64 import b64encode
from html import escape
R=Path(__file__).resolve().parents[2]
def uri(p): return 'data:image/png;base64,'+b64encode(p.read_bytes()).decode()
font=b64encode((R/'imgs/fonts/dm-sans-400.ttf').read_bytes()).decode()
S=[f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2240 990"><title>U-ASTROD multimodal anomaly detection architecture</title><defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill="#30343b"/></marker></defs><style>@font-face{{font-family:DM;src:url(data:font/ttf;base64,{font})}}text{{font-family:DM,Arial;fill:#252a33;font-size:23px}}.small{{font-size:18px;fill:#59646f}}.math{{font-family:Georgia; font-style:italic;font-size:26px}}.wire{{fill:none;stroke:#30343b;stroke-width:1.8;marker-end:url(#a)}}</style><rect width="2240" height="990" fill="white"/>''']
B=('#dce8f8','#698ebd');P=('#e9e0f2','#9c83b0');G=('#e0eee1','#739873');Y=('#fff0ce','#c3a466')
def t(x,y,s,cl='',anchor='middle'):S.append(f'<text x="{x}" y="{y}" class="{cl}" text-anchor="{anchor}">{escape(s)}</text>')
def a(d):S.append(f'<path d="{d}" class="wire"/>')
def box(x,y,w,h,labels,c=B):
 S.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{c[0]}" stroke="{c[1]}" stroke-width="1.5"/>')
 for i,s in enumerate(labels):t(x+w/2,y+h/2+8+(i-(len(labels)-1)/2)*27,s)
def tensor(x,y,cols,rows,c,label=None):
 w,h=cols*13,rows*13
 S.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c[0]}" stroke="{c[1]}"/>')
 for i in range(1,cols):S.append(f'<path d="M{x+i*13} {y} v{h}" stroke="{c[1]}" stroke-width=".6"/>')
 for j in range(1,rows):S.append(f'<path d="M{x} {y+j*13} h{w}" stroke="{c[1]}" stroke-width=".6"/>')
 if label:t(x+w/2,y+h+30,label,'math')
def image(name,x,y,w,h):S.append(f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="{uri(R/name)}" preserveAspectRatio="xMidYMid meet"/>')
def lstm(y,c):
 S.append(f'<rect x="803" y="{y-89}" width="365" height="177" rx="3" fill="#fcfcfb" stroke="#b9bdc4" stroke-dasharray="6 4"/>')
 t(985,y-60,'LSTM temporal encoder')
 for x,lab in [(823,'1'),(949,'t'),(1075,'T')]:
  box(x,y-22,73,46,['LSTM'],c);t(x+36,y+70,'x'+lab,'math');a(f'M{x+36} {y+45} V{y+25}')
 a(f'M896 {y+1} H948');a(f'M1022 {y+1} H1074')
 t(923,y-11,'…');t(1049,y-11,'…')
 a(f'M1148 {y+1} H1220');tensor(1221,y-38,1,6,c)

t(40,40,'(a) Modality-specific representation learning',anchor='start')
for y,name,asset,caption,c in [(190,'Network traffic','imgs/astrod-data-network.png','PCAP → flow features',B),(435,'Odometry','imgs/astrod-data-odometry.png','Pose and velocity',P),(680,'LiDAR','imgs/astrod-data-lidar.png','Point-cloud sequence',G)]:
 t(147,y-93,name);image(asset,45,y-75,205,148);t(147,y+99,caption,'small');lstm(y,c)
 if name!='LiDAR':
  a(f'M250 {y} H316');tensor(317,y-45,4,7,c,'Xₙ' if name=='Network traffic' else 'Xₒ');a(f'M369 {y} H802')
  t(579,y-18,'Aligned feature sequence','small')
 else:
  a(f'M250 {y} H299');box(300,y-38,153,76,['Azimuthal','sampling'],G);a(f'M453 {y} H480')
  # Schematic spatial graph before graph convolution.
  nodes=[(501,y+16),(523,y-24),(561,y+25),(578,y-16)]
  for i,j in [(0,1),(0,2),(1,2),(1,3),(2,3)]:
   u,v=nodes[i],nodes[j];S.append(f'<path d="M{u[0]} {u[1]} L{v[0]} {v[1]}" stroke="{G[1]}" stroke-width="2"/>')
  for x,yy in nodes:S.append(f'<circle cx="{x}" cy="{yy}" r="7" fill="{G[0]}" stroke="{G[1]}"/>')
  t(541,y+69,'Spatial graphs','small');a(f'M585 {y} H617');box(618,y-38,145,76,['GCN'],G);a(f'M763 {y} H802')
 t(1228,y+69,{'Network traffic':'Fₙ','Odometry':'Fₒ','LiDAR':'Fₗ'}[name],'math')
# Late fusion: independent branches converge at concatenation.
a('M1234 191 H1325 V415 H1375');a('M1234 436 H1375');a('M1234 681 H1325 V455 H1375')
S.append('<circle cx="1399" cy="436" r="24" fill="white" stroke="#30343b" stroke-width="1.7"/>');t(1399,444,'⊕','math');t(1399,500,'Concatenation','small')
a('M1424 436 H1480')
for i,c in enumerate([B,P,G]):tensor(1481,377+i*39,1,3,c)
t(1488,358,'V = [Fₙ, Fₒ, Fₗ]','math')
# Autoencoder rendered as an explicit compression / reconstruction pair.
t(1630,40,'(b) Normal-behavior model',anchor='start')
S.append('<rect x="1585" y="280" width="601" height="320" rx="3" fill="#fcfcfb" stroke="#b9bdc4" stroke-dasharray="6 4"/>')
t(1885,318,'Autoencoder');t(1885,347,'Trained on nominal operation','small')
a('M1494 436 H1630')
S.append(f'<path d="M1631 375 L1760 411 V461 L1631 497 Z" fill="{P[0]}" stroke="{P[1]}" stroke-width="1.5"/>');t(1694,549,'Encoder')
a('M1760 436 H1792');tensor(1793,410,1,4,Y,'z');a('M1806 436 H1841')
S.append(f'<path d="M1842 411 L1971 375 V497 L1842 461 Z" fill="{B[0]}" stroke="{B[1]}" stroke-width="1.5"/>');t(1905,549,'Decoder')
a('M1971 436 H2044')
for i,c in enumerate([B,P,G]):tensor(2045,377+i*39,1,3,c)
t(2051,358,'V̂','math')
# Residual comparison below: original V bypasses AE.
a('M1487 495 V697 H1816');a('M2051 495 V697 H2020')
box(1817,659,203,76,['Reconstruction','error'],Y);t(2080,779,'e = MSE(V, V̂)','math')
a('M1918 735 V811');box(1829,812,178,54,['Threshold τ'],Y)
a('M1829 839 H1680');a('M2007 839 H2116');t(1612,847,'Normal');t(2165,847,'Anomaly');t(1739,826,'e ≤ τ','small');t(2060,826,'e > τ','small')
# Explain training protocol without pretending encoders are unsupervised.
t(43,855,'Encoder training','', 'start');t(43,887,'Each modality encoder is trained with a binary classification head;','small','start');t(43,916,'the final classifier layers are removed to extract the feature vectors.','small','start')
t(43,970,'Input images: original project assets. Graphs, tensor sizes, and unrolled steps are schematic.  ⊕  concatenation.','small','start')
S.append('</svg>');(R/'projects/generated/astrod-architecture-paper.svg').write_text('\n'.join(S))
