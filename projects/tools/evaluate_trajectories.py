#!/usr/bin/env python3
"""Compute mean Dynamic Time Warping distance from two 3D trajectory CSVs.

Each CSV must contain x,y,z columns. The implementation intentionally has no
third-party dependencies so the result can be regenerated beside exported logs.
"""

import argparse
import csv
import json
import math


def load_points(path):
    with open(path, newline="", encoding="utf-8") as stream:
        return [(float(r["x"]), float(r["y"]), float(r["z"])) for r in csv.DictReader(stream)]


def distance(a, b):
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


def dtw(a, b):
    previous = [math.inf] * (len(b) + 1)
    previous[0] = 0.0
    parents = [[None] * (len(b) + 1) for _ in range(len(a) + 1)]
    costs = [[math.inf] * (len(b) + 1) for _ in range(len(a) + 1)]
    costs[0][0] = 0.0
    for i, point_a in enumerate(a, start=1):
        current = [math.inf] * (len(b) + 1)
        for j, point_b in enumerate(b, start=1):
            options = [(previous[j], (i - 1, j)), (current[j - 1], (i, j - 1)), (previous[j - 1], (i - 1, j - 1))]
            best, parent = min(options, key=lambda item: item[0])
            current[j] = distance(point_a, point_b) + best
            costs[i][j] = current[j]
            parents[i][j] = parent
        previous = current
    i, j = len(a), len(b)
    path = []
    while i and j:
        path.append((i - 1, j - 1))
        i, j = parents[i][j]
    path.reverse()
    distances = [distance(a[i], b[j]) for i, j in path]
    return {"dtw_cost": costs[len(a)][len(b)], "path_length": len(path), "mean_aligned_distance": sum(distances) / len(distances)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("trajectory_a")
    parser.add_argument("trajectory_b")
    parser.add_argument("--output", default=None)
    args = parser.parse_args()
    result = dtw(load_points(args.trajectory_a), load_points(args.trajectory_b))
    payload = json.dumps(result, indent=2)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as stream:
            stream.write(payload + "\n")
    else:
        print(payload)


if __name__ == "__main__":
    main()
