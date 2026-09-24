#!/usr/bin/env python3
"""Recompute classification evidence from an exported CSV.

Required columns: y_true, y_pred.
Optional grouping columns such as view, occlusion, or skip_rate can be passed
with --group-by. This script does not train or infer a model; it makes reported
evaluation reproducible once prediction exports are available.
"""

import argparse
import csv
import json
from collections import defaultdict


def safe_div(num, den):
    return num / den if den else 0.0


def binary_metrics(rows):
    labels = sorted({r[0] for r in rows} | {r[1] for r in rows})
    per_class = []
    total_correct = 0
    for label in labels:
        tp = sum(t == label and p == label for t, p in rows)
        fp = sum(t != label and p == label for t, p in rows)
        fn = sum(t == label and p != label for t, p in rows)
        support = sum(t == label for t, _ in rows)
        precision = safe_div(tp, tp + fp)
        recall = safe_div(tp, tp + fn)
        f1 = safe_div(2 * precision * recall, precision + recall)
        per_class.append((support, precision, recall, f1))
        total_correct += tp
    total = len(rows)
    return {
        "samples": total,
        "accuracy": safe_div(total_correct, total),
        "precision_weighted": safe_div(sum(s * p for s, p, _, _ in per_class), total),
        "recall_weighted": safe_div(sum(s * r for s, _, r, _ in per_class), total),
        "f1_weighted": safe_div(sum(s * f for s, _, _, f in per_class), total),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("csv_path")
    parser.add_argument("--group-by", default=None)
    parser.add_argument("--output", default=None)
    args = parser.parse_args()

    groups = defaultdict(list)
    with open(args.csv_path, newline="", encoding="utf-8") as stream:
        for row in csv.DictReader(stream):
            key = row.get(args.group_by, "all") if args.group_by else "all"
            groups[key].append((row["y_true"], row["y_pred"]))

    result = {name: binary_metrics(rows) for name, rows in sorted(groups.items())}
    payload = json.dumps(result, indent=2)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as stream:
            stream.write(payload + "\n")
    else:
        print(payload)


if __name__ == "__main__":
    main()
