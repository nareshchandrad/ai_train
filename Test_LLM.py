import argparse
import sys
from pathlib import Path

from llm_project import (
    DEFAULT_OUTPUT_DIR,
    compare_models,
    generate_answer,
    get_sample_questions,
    load_training_manifest,
    print_answer_card,
    print_block,
    rerun_in_venv_if_needed,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Student-friendly testing and comparison lab for the trained LLM.")
    parser.add_argument("--model_dir", type=str, default=str(DEFAULT_OUTPUT_DIR))
    parser.add_argument("--question", type=str, default=None)
    parser.add_argument("--mode", choices=["trained", "base", "compare"], default=None)
    parser.add_argument("--max_new_tokens", type=int, default=120)
    return parser.parse_args()


def show_intro(manifest: dict):
    lines = [
        "Hands-on lab: ask a biography question to the base model, the trained model, or compare both.",
        "",
        f"Base model source: {manifest['base_model_name']}",
        f"Base model folder: {manifest.get('base_model_dir', manifest['base_model_name'])}",
        f"Trained model: {manifest['trained_model_dir']}",
        f"Training data: {manifest['data_path']}",
        f"Training device: {manifest['runtime_device']}",
    ]

    sample_questions = get_sample_questions()
    if sample_questions:
        lines.append("")
        lines.append("Sample questions you can try:")
        for question in sample_questions:
            lines.append(f"• {question}")

    print_block("Biography Model Test Lab", lines, color="blue")


def run_one_shot(manifest: dict, question: str, mode: str, max_new_tokens: int):
    if mode == "trained":
        answer = generate_answer(manifest["trained_model_dir"], question, max_new_tokens=max_new_tokens)
        print_answer_card("Trained model", manifest["trained_model_dir"], answer, color="green")
        return

    if mode == "base":
        answer = generate_answer(manifest["base_model_name"], question, max_new_tokens=max_new_tokens)
        print_answer_card("Base model", manifest["base_model_name"], answer, color="magenta")
        return

    result = compare_models(
        base_model_name=manifest["base_model_name"],
        trained_model_dir=Path(manifest["trained_model_dir"]),
        question=question,
        max_new_tokens=max_new_tokens,
    )
    print_block("Comparison Question", [question], color="yellow")
    print_answer_card("Base model", manifest["base_model_name"], result["base_answer"], color="magenta")
    print_answer_card("Trained model", manifest["trained_model_dir"], result["trained_answer"], color="green")


def interactive_lab(manifest: dict, max_new_tokens: int):
    import questionary
    from prompt_toolkit.styles import Style

    menu_style = Style(
        [
            ("qmark", "fg:#00c0ff bold"),
            ("question", "bold fg:#ff0000"),
            ("pointer", "fg:#00ff80 bold"),
            ("selected", "fg:#00ff80 bold"),
            ("instruction", "fg:#808080 italic"),
            ("separator", "fg:#666666"),
            ("text", "fg:#f8f8f2"),
        ]
    )

    show_intro(manifest)
    print()
    while True:
        action = questionary.select(
            "Choose what you want to explore:",
            choices=[
                "Ask the trained model",
                "Ask the base model",
                "Compare base vs trained",
                "Show sample questions",
                "Exit",
            ],
            qmark="❯",
            pointer="➜",
            instruction="Use arrow keys to choose an option.",
            style=menu_style,
            use_shortcuts=False,
        ).ask()

        if action in {None, "Exit"}:
            print("Exiting the test lab.")
            return

        if action == "Show sample questions":
            sample_questions = get_sample_questions()
            if sample_questions:
                print_block("Sample Questions", [f"• {question}" for question in sample_questions], color="cyan")
            else:
                print("No sample questions found.")
            continue

        question = questionary.text(
            "Type your biography question, or press Enter to return to the menu:"
        ).ask()
        if not question:
            continue

        if action == "Ask the trained model":
            run_one_shot(manifest, question, "trained", max_new_tokens)
            continue

        if action == "Ask the base model":
            run_one_shot(manifest, question, "base", max_new_tokens)
            continue

        run_one_shot(manifest, question, "compare", max_new_tokens)


def main():
    if rerun_in_venv_if_needed(Path(__file__), sys.argv[1:]):
        return

    args = parse_args()
    model_dir = Path(args.model_dir).expanduser().resolve()
    manifest = load_training_manifest(model_dir)
    if manifest is None:
        raise SystemExit(f"No trained model manifest found in {model_dir}. Run Train_LLM.py first.")

    if args.question:
        run_one_shot(manifest, args.question, args.mode or "compare", args.max_new_tokens)
        return

    interactive_lab(manifest, args.max_new_tokens)


if __name__ == "__main__":
    main()