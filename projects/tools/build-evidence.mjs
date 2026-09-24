import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../generated');
await mkdir(out, { recursive: true });

const palette = { ink: '#121212', paper: '#e9e7e1', muted: '#77736b', blue: '#315cff', red: '#ff4d2e', acid: '#c7f36b', line: '#b8b5ad' };

function svgFrame(title, subtitle, body, width = 1200, height = 650) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title><desc id="desc">${subtitle}</desc>
  <rect width="${width}" height="${height}" fill="${palette.paper}"/>
  <text x="54" y="62" fill="${palette.ink}" font-family="Georgia,serif" font-size="34">${title}</text>
  <text x="54" y="92" fill="${palette.muted}" font-family="monospace" font-size="12" letter-spacing="1.2">${subtitle.toUpperCase()}</text>
  ${body}</svg>`;
}

function bars({ labels, values, max = 1, x = 76, y = 150, width = 1040, height = 390, colors = [] }) {
  const gap = 24;
  const barWidth = (width - gap * (labels.length - 1)) / labels.length;
  let out = '';
  for (let i = 0; i <= 5; i++) {
    const yy = y + height - (i / 5) * height;
    out += `<line x1="${x}" y1="${yy}" x2="${x + width}" y2="${yy}" stroke="${palette.line}" stroke-width="1" opacity=".6"/><text x="${x - 13}" y="${yy + 4}" text-anchor="end" fill="${palette.muted}" font-family="monospace" font-size="11">${(max * i / 5).toFixed(max <= 1 ? 1 : 0)}</text>`;
  }
  values.forEach((value, index) => {
    const h = (value / max) * height;
    const bx = x + index * (barWidth + gap);
    const by = y + height - h;
    out += `<rect x="${bx}" y="${by}" width="${barWidth}" height="${h}" fill="${colors[index] || palette.blue}"/><text x="${bx + barWidth / 2}" y="${by - 12}" text-anchor="middle" fill="${palette.ink}" font-family="monospace" font-size="14">${value.toFixed(max <= 1 ? 3 : 2)}</text><text x="${bx + barWidth / 2}" y="${y + height + 28}" text-anchor="middle" fill="${palette.ink}" font-family="monospace" font-size="11">${labels[index]}</text>`;
  });
  return out;
}

const perceptionBody = `
  <text x="54" y="136" fill="${palette.blue}" font-family="monospace" font-size="13">A · OCCLUDED MULTI-VIEW VS SINGLE-VIEW</text>
  ${bars({ labels: ['Single-view', 'Multi-view'], values: [.76, .82], x: 70, y: 180, width: 450, height: 300, colors: [palette.muted, palette.blue] })}
  <text x="650" y="136" fill="${palette.blue}" font-family="monospace" font-size="13">B · STRUCTURED FAILURE TESTS</text>
  ${bars({ labels: ['View 2', 'View 3', 'Torso mask', 'Skip 11'], values: [.9733, .9198, .6559, .6588], x: 630, y: 180, width: 500, height: 300, colors: [palette.acid, palette.blue, palette.red, palette.red] })}
  <text x="54" y="610" fill="${palette.muted}" font-family="monospace" font-size="11">SOURCE: POSEFUSION AND FALL-DETECTION PREPRINT TABLES · F1 SCORE · RECONSTRUCTED VISUAL</text>`;
await writeFile(resolve(out, 'multimodal-perception-results.svg'), svgFrame('Partial evidence, measured', 'F1 across view, occlusion, and temporal ablations', perceptionBody));

const tarLabels = ['Turtle BB', 'Turtle DINO', 'AprilTag BB', 'AprilTag DINO', 'AT DINO + occ.', 'Turtle DINO + occ.', 'VOXL AT'];
const tarValues = [.98, .62, .98, .67, 1.56, 1.65, .80];
const tarBody = `${bars({ labels: tarLabels, values: tarValues, max: 1.8, x: 76, y: 150, width: 1040, height: 390, colors: [palette.muted, palette.blue, palette.muted, palette.blue, palette.red, palette.red, palette.acid] })}<text x="54" y="610" fill="${palette.muted}" font-family="monospace" font-size="11">SOURCE: TAR REPORT TABLE 1 · MEAN DTW IN METERS · LOWER IS BETTER · RECONSTRUCTED VISUAL</text>`;
await writeFile(resolve(out, 'tar-dtw-results.svg'), svgFrame('Trajectory agreement across TAR cases', 'Mean Dynamic Time Warping distance', tarBody));

const anomalyBody = `${bars({ labels: ['Baseline multimodal', 'Feature-wise scoring', 'Half training data'], values: [72, 98, 97], max: 100, x: 120, y: 150, width: 940, height: 390, colors: [palette.muted, palette.blue, palette.acid] })}<text x="54" y="610" fill="${palette.muted}" font-family="monospace" font-size="11">SOURCE: PUBLISHED U-ASTROD RESULTS · DETECTION ACCURACY (%) · RECONSTRUCTED VISUAL</text>`;
await writeFile(resolve(out, 'anomaly-results.svg'), svgFrame('Multimodal anomaly detection', 'Reported accuracy under the study conditions', anomalyBody));

console.log(`Generated evidence figures in ${out}`);
