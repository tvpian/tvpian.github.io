# Project-page evidence tools

`build-evidence.mjs` creates the SVG figures used by the project pages from values reported in the linked papers and reports. These are reconstructed visualizations, not new experimental runs.

`evaluate_classification.py` recomputes accuracy, weighted precision, recall, and F1 from exported `y_true,y_pred` CSV files. Optional grouping supports view, occlusion, or frame-skip comparisons.

`evaluate_trajectories.py` recomputes a dependency-free DTW alignment and mean aligned 3D distance from two `x,y,z` trajectory CSV files.

To replace reconstructed paper figures with regenerated evidence, provide the prediction exports or synchronized trajectory logs, run the relevant evaluator, and update the source table in `build-evidence.mjs` only after confirming the experimental conditions match.
