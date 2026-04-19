import argparse
import sys
from pathlib import Path

from llm_project import (
    DEFAULT_DATA_PATH,
    DEFAULT_OUTPUT_DIR,
    MODEL_OPTIONS,
    cleanup_runtime_artifacts,
    choose_model_interactively,
    ensure_output_dir,
    print_block,
    rerun_in_venv_if_needed,
    train_model,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Set up the environment and train the biography LLM.")
    parser.add_argument("-Action", choices=["install", "cleanup"], default="install", help="Action to perform: install (default) or cleanup")
    parser.add_argument("--data_path", type=str, default=str(DEFAULT_DATA_PATH))
    parser.add_argument("--model_name", type=str, default=None)
    parser.add_argument("--output_dir", type=str, default=str(DEFAULT_OUTPUT_DIR))
    parser.add_argument("--num_train_epochs", type=int, default=12)
    parser.add_argument("--per_device_train_batch_size", type=int, default=2)
    parser.add_argument("--learning_rate", type=float, default=8e-5)
    parser.add_argument("--max_seq_length", type=int, default=512)
    parser.add_argument("--logging_steps", type=int, default=5)
    parser.add_argument("--replace_output", action="store_true")
    parser.add_argument("--yes", action="store_true")
    return parser.parse_args()


def main():

    args = parse_args()

    if args.Action == "cleanup":
        removed_paths = cleanup_runtime_artifacts(remove_output=True, remove_legacy_user_cache=True)
        if removed_paths:
            print_block(
                "Runtime Cleanup Complete",
                ["Removed:", *[f"- {path}" for path in removed_paths]],
                color="yellow",
            )
        else:
            print_block(
                "Runtime Cleanup Complete",
                ["Nothing needed removal. The project runtime was already clean."],
                color="yellow",
            )
        print("Project folder is now ready for a fresh setup run.")
        return

    # Default: install/train
    if rerun_in_venv_if_needed(Path(__file__), sys.argv[1:]):
        return

    data_path = Path(args.data_path).expanduser().resolve()
    output_dir = Path(args.output_dir).expanduser().resolve()

    if not data_path.exists():
        raise FileNotFoundError(f"Training data file not found: {data_path}")

    model_name = args.model_name
    if model_name is None:
        if args.yes:
            model_name = MODEL_OPTIONS[0]
        else:
            model_name = choose_model_interactively()

    replace_output = args.replace_output
    if output_dir.exists() and not replace_output and not args.yes:
        import questionary

        replace_output = questionary.confirm(
            f"{output_dir} already exists. Delete it before training again?",
            default=True,
        ).ask()

    if output_dir.exists() and not replace_output:
        raise SystemExit(
            f"Output folder already exists: {output_dir}. Run again with --replace_output to overwrite it."
        )

    print_block(
        "Biography LLM Trainer",
        [
            "This script prepares the Python environment only when needed,",
            "reuses matching packages on repeat runs, and trains one final model folder.",
            "Use --reset_runtime for a true fresh rebuild from this same script.",
            "",
            f"Base model: {model_name}",
            f"Data file: {data_path}",
            f"Output folder: {output_dir}",
        ],
        color="yellow",
    )

    if not args.yes:
        import questionary

        proceed = questionary.confirm("Start training now?", default=True).ask()
        if not proceed:
            raise SystemExit("Training cancelled.")

    ensure_output_dir(output_dir, replace_existing=True)
    manifest = train_model(
        model_name=model_name,
        data_path=data_path,
        output_dir=output_dir,
        num_train_epochs=args.num_train_epochs,
        per_device_train_batch_size=args.per_device_train_batch_size,
        learning_rate=args.learning_rate,
        max_seq_length=args.max_seq_length,
        logging_steps=args.logging_steps,
    )

    print_block(
        "Training Complete",
        [
            f"Trained model folder: {output_dir}",
            f"Runtime device: {manifest['runtime_device']}",
            f"Examples learned: {manifest['num_examples']}",
            "Next step: run Test_LLM.py for the student comparison lab.",
        ],
        color="green",
    )


if __name__ == "__main__":
    main()