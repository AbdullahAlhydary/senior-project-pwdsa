"""CLI entrypoint to train the model from the project dataset."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Ensure backend/ is on sys.path when run as a plain script
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.ml.trainer import train  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Train the decision classifier.")
    parser.add_argument(
        "--csv",
        default=str(Path(__file__).resolve().parents[2] / "datasetSP_CSV.csv"),
        help="Path to dataset CSV.",
    )
    parser.add_argument(
        "--artifacts",
        default=str(BACKEND_DIR / "artifacts"),
        help="Output directory for model artifact and report.",
    )
    args = parser.parse_args()

    report = train(Path(args.csv), Path(args.artifacts))
    print(
        f"\nDone. Model={report.model_name}, "
        f"test_acc={report.test_accuracy:.4f}, test_f1_macro={report.test_f1_macro:.4f}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
