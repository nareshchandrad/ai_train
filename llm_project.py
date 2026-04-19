import importlib.metadata
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent
VENV_DIR = ROOT_DIR / ".venv"
REQUIREMENTS_FILE = ROOT_DIR / "requirements.txt"
DEFAULT_DATA_PATH = ROOT_DIR / "data" / "biography_qa.jsonl"
DEFAULT_OUTPUT_DIR = ROOT_DIR / "output" / "trained-model"
MANIFEST_FILE = DEFAULT_OUTPUT_DIR / "training_manifest.json"
BASE_MODEL_LOCAL_DIR = ROOT_DIR / "output" / "base-models"

PROJECT_CACHE_DIR = ROOT_DIR / ".cache"
PROJECT_HF_HOME = PROJECT_CACHE_DIR / "huggingface"
LEGACY_USER_HF_HOME = Path.home() / ".cache" / "huggingface"

os.environ.setdefault("HF_HUB_VERBOSITY", "error")
os.environ.setdefault("HF_HOME", str(PROJECT_HF_HOME))
os.environ.setdefault("HF_HUB_CACHE", str(PROJECT_HF_HOME / "hub"))

TORCH_VERSION = "2.10.0"
TORCHVISION_VERSION = "0.25.0"
TORCHAUDIO_VERSION = "2.10.0"
CUDA_BACKEND_OPTIONS = [
    (13.0, "cu130"),
    (12.8, "cu128"),
    (12.6, "cu126"),
]

MODEL_OPTIONS = [
    "HuggingFaceTB/SmolLM2-135M-Instruct",
    "HuggingFaceTB/SmolLM2-1.7B-Instruct",
    "Qwen/Qwen-2.5B-Chat",
]


def supports_color() -> bool:
    return sys.stdout.isatty() and os.environ.get("NO_COLOR") is None


def style_text(text: str, color: str | None = None, bold: bool = False) -> str:
    if not supports_color():
        return text

    color_codes = {
        "blue": "34",
        "green": "32",
        "yellow": "33",
        "cyan": "36",
        "magenta": "35",
        "red": "31",
    }
    codes = []
    if bold:
        codes.append("1")
    if color in color_codes:
        codes.append(color_codes[color])
    if not codes:
        return text
    return f"\033[{';'.join(codes)}m{text}\033[0m"


def print_block(title: str, lines: list[str] | tuple[str, ...], color: str = "cyan"):
    border = "=" * 72
    print(style_text(border, color=color))
    print(style_text(title, color=color, bold=True))
    print(style_text(border, color=color))
    for line in lines:
        print(line)


def get_venv_python() -> Path:
    if os.name == "nt":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"


def get_huggingface_home() -> Path:
    hf_home = os.environ.get("HF_HOME")
    if hf_home:
        return Path(hf_home)
    return Path.home() / ".cache" / "huggingface"


def get_accelerate_config_path() -> Path:
    return get_huggingface_home() / "accelerate" / "default_config.yaml"


def in_managed_venv() -> bool:
    return Path(sys.executable).resolve() == get_venv_python().resolve()


def run_subprocess(command: list[str], **kwargs):
    print(style_text("$ " + " ".join(command), color="blue"))
    subprocess.check_call(command, cwd=str(ROOT_DIR), **kwargs)


def run_subprocess_capture(command: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(
        command,
        cwd=str(ROOT_DIR),
        check=True,
        capture_output=True,
        text=True,
    )


def ensure_virtualenv_exists():
    if VENV_DIR.exists():
        print("Using existing virtual environment in .venv")
        return

    print("Creating virtual environment in .venv...")
    subprocess.check_call([sys.executable, "-m", "venv", str(VENV_DIR)], cwd=str(ROOT_DIR))
    print("Virtual environment created.")


def parse_version_tuple(value: str) -> tuple[int, ...]:
    numbers = [int(piece) for piece in re.findall(r"\d+", value)]
    return tuple(numbers or [0])


def get_installed_version(distribution_name: str) -> str | None:
    try:
        return importlib.metadata.version(distribution_name)
    except importlib.metadata.PackageNotFoundError:
        return None


def requirements_satisfied(python_exe: Path | None = None) -> tuple[bool, list[str]]:
    if python_exe is not None:
        script = r"""
import importlib.metadata
import json
import re
from pathlib import Path

requirements = Path('requirements.txt').read_text(encoding='utf-8').splitlines()

def parse_version_tuple(value):
    numbers = [int(piece) for piece in re.findall(r'\d+', value)]
    return tuple(numbers or [0])

issues = []
for raw_line in requirements:
    line = raw_line.strip()
    if not line or line.startswith('#'):
        continue
    if '>=' not in line:
        issues.append(f'Unsupported requirement format: {line}')
        continue
    package_name, minimum_version = [piece.strip() for piece in line.split('>=', 1)]
    try:
        installed_version = importlib.metadata.version(package_name)
    except importlib.metadata.PackageNotFoundError:
        issues.append(f'{package_name} is missing')
        continue
    if parse_version_tuple(installed_version) < parse_version_tuple(minimum_version):
        issues.append(f'{package_name} {installed_version} is older than required {minimum_version}')

print(json.dumps(issues))
"""
        result = run_subprocess_capture([str(python_exe), "-X", "utf8", "-c", script])
        issues = json.loads(result.stdout)
        return len(issues) == 0, issues

    missing_or_old = []
    for raw_line in REQUIREMENTS_FILE.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        if ">=" not in line:
            missing_or_old.append(f"Unsupported requirement format: {line}")
            continue

        package_name, minimum_version = [piece.strip() for piece in line.split(">=", 1)]
        installed_version = get_installed_version(package_name)
        if installed_version is None:
            missing_or_old.append(f"{package_name} is missing")
            continue

        if parse_version_tuple(installed_version) < parse_version_tuple(minimum_version):
            missing_or_old.append(
                f"{package_name} {installed_version} is older than required {minimum_version}"
            )

    return len(missing_or_old) == 0, missing_or_old


def get_cuda_version() -> str | None:
    try:
        result = subprocess.run(
            ["nvidia-smi"],
            cwd=str(ROOT_DIR),
            check=True,
            capture_output=True,
            text=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None

    for line in result.stdout.splitlines():
        if "CUDA Version:" not in line:
            continue
        version = line.split("CUDA Version:", 1)[1].strip().split()[0].strip()
        if version and "." in version:
            return version
    return None


def parse_cuda_version(value: str | None) -> tuple[int, int] | None:
    if not value:
        return None
    parts = value.split(".")
    try:
        major = int(parts[0])
        minor = int(parts[1]) if len(parts) > 1 else 0
    except ValueError:
        return None
    return major, minor


def get_preferred_cuda_index(cuda_version: str | None) -> str | None:
    parsed = parse_cuda_version(cuda_version)
    if parsed is None:
        return None
    cuda_value = parsed[0] + parsed[1] / 10
    for minimum_version, backend in CUDA_BACKEND_OPTIONS:
        if cuda_value >= minimum_version:
            return backend
    return None


def verify_torch_runtime(python_exe: Path) -> dict[str, object]:
    script = r"""
import json
import traceback

result = {
    'torch_version': None,
    'torch_cuda_version': None,
    'cuda_available': False,
    'cuda_runtime_ok': False,
    'device_name': None,
    'torchvision_version': None,
    'torchaudio_version': None,
    'error': None,
}

try:
    import torch
    import torchvision
    import torchaudio

    result['torch_version'] = torch.__version__
    result['torch_cuda_version'] = torch.version.cuda
    result['torchvision_version'] = torchvision.__version__
    result['torchaudio_version'] = torchaudio.__version__
    result['cuda_available'] = torch.cuda.is_available()
    if result['cuda_available']:
        result['device_name'] = torch.cuda.get_device_name(0)
        probe = torch.tensor([1.0], device='cuda')
        result['cuda_runtime_ok'] = float((probe + 1).item()) == 2.0
except Exception as exc:
    result['error'] = ''.join(traceback.format_exception_only(type(exc), exc)).strip()

print(json.dumps(result))
"""
    result = run_subprocess_capture([str(python_exe), "-X", "utf8", "-c", script])
    return json.loads(result.stdout)


def runtime_matches_requested_backend(runtime: dict[str, object], requested_backend: str) -> bool:
    torch_version = str(runtime.get("torch_version") or "")
    torchvision_version = str(runtime.get("torchvision_version") or "")
    torchaudio_version = str(runtime.get("torchaudio_version") or "")

    if requested_backend == "cpu":
        return (
            torch_version.startswith(TORCH_VERSION)
            and "+cpu" in torch_version
            and torchvision_version.startswith(TORCHVISION_VERSION)
            and torchaudio_version.startswith(TORCHAUDIO_VERSION)
        )

    expected_cuda_version = requested_backend.replace("cu", "")
    expected_cuda_version = f"{expected_cuda_version[:2]}.{expected_cuda_version[2:]}"
    return (
        torch_version.startswith(TORCH_VERSION)
        and requested_backend in torch_version
        and runtime.get("torch_cuda_version") == expected_cuda_version
        and runtime.get("cuda_runtime_ok") is True
        and torchvision_version.startswith(TORCHVISION_VERSION)
        and torchaudio_version.startswith(TORCHAUDIO_VERSION)
    )


def install_torch_backend(python_exe: Path, index_name: str):
    index_url = f"https://download.pytorch.org/whl/{index_name}"
    run_subprocess(
        [
            str(python_exe),
            "-m",
            "pip",
            "install",
            "--force-reinstall",
            f"torch=={TORCH_VERSION}",
            f"torchvision=={TORCHVISION_VERSION}",
            f"torchaudio=={TORCHAUDIO_VERSION}",
            "--index-url",
            index_url,
        ]
    )


def ensure_torch_backend(python_exe: Path):
    cuda_version = get_cuda_version()
    requested_backend = get_preferred_cuda_index(cuda_version) or "cpu"
    current_runtime = verify_torch_runtime(python_exe)

    if runtime_matches_requested_backend(current_runtime, requested_backend):
        if requested_backend == "cpu":
            print("PyTorch backend already correct: CPU")
        else:
            print(
                f"PyTorch backend already correct: {requested_backend} on "
                f"{current_runtime.get('device_name')}"
            )
        return current_runtime

    if requested_backend == "cpu":
        print("Installing CPU-only PyTorch backend...")
        install_torch_backend(python_exe, "cpu")
    else:
        print(f"Installing PyTorch backend {requested_backend} for CUDA {cuda_version}...")
        install_torch_backend(python_exe, requested_backend)

    runtime = verify_torch_runtime(python_exe)
    if requested_backend != "cpu" and not runtime.get("cuda_runtime_ok"):
        print("CUDA wheel installed but runtime validation failed. Falling back to CPU backend.")
        install_torch_backend(python_exe, "cpu")
        runtime = verify_torch_runtime(python_exe)
    return runtime


def ensure_non_torch_dependencies(python_exe: Path):
    satisfied, issues = requirements_satisfied(python_exe)
    if satisfied:
        print("Python requirements already satisfied. Skipping reinstall.")
        return

    print("Installing missing or outdated Python requirements...")
    for issue in issues:
        print(f"  - {issue}")
    run_subprocess([str(python_exe), "-m", "pip", "install", "-r", str(REQUIREMENTS_FILE)])


def write_accelerate_config(python_exe: Path):
    config_path = get_accelerate_config_path()
    if config_path.exists():
        return

    script = "from accelerate.utils import write_basic_config; write_basic_config(mixed_precision='fp16')"
    subprocess.run([str(python_exe), "-X", "utf8", "-c", script], cwd=str(ROOT_DIR))


def ensure_environment():
    PROJECT_HF_HOME.mkdir(parents=True, exist_ok=True)
    ensure_virtualenv_exists()
    python_exe = get_venv_python()
    if not python_exe.exists():
        raise FileNotFoundError(f"Virtual environment Python not found: {python_exe}")

    ensure_torch_backend(python_exe)
    ensure_non_torch_dependencies(python_exe)
    write_accelerate_config(python_exe)
    return python_exe


def rerun_in_venv_if_needed(script_path: Path, argv: list[str]) -> bool:
    if in_managed_venv():
        return False

    python_exe = ensure_environment()
    command = [str(python_exe), "-X", "utf8", str(script_path), *argv]
    subprocess.check_call(command, cwd=str(ROOT_DIR))
    return True


def ensure_output_dir(output_dir: Path, replace_existing: bool):
    if output_dir.exists() and replace_existing:
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)


def cleanup_runtime_artifacts(remove_output: bool = False, remove_legacy_user_cache: bool = True) -> list[str]:
    if in_managed_venv():
        raise RuntimeError(
            "Runtime cleanup must be started with system Python, not from inside .venv, "
            "because Windows cannot delete the active virtual environment."
        )

    removed = []

    if VENV_DIR.exists():
        shutil.rmtree(VENV_DIR)
        removed.append(str(VENV_DIR))

    if PROJECT_CACHE_DIR.exists():
        shutil.rmtree(PROJECT_CACHE_DIR)
        removed.append(str(PROJECT_CACHE_DIR))

    if remove_output and DEFAULT_OUTPUT_DIR.exists():
        shutil.rmtree(DEFAULT_OUTPUT_DIR)
        removed.append(str(DEFAULT_OUTPUT_DIR))

    if remove_legacy_user_cache and LEGACY_USER_HF_HOME.exists() and LEGACY_USER_HF_HOME != PROJECT_HF_HOME:
        shutil.rmtree(LEGACY_USER_HF_HOME)
        removed.append(str(LEGACY_USER_HF_HOME))

    return removed


def read_jsonl_rows(path: Path) -> list[dict[str, str]]:
    rows = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            item = json.loads(line)
            prompt = item.get("prompt") or item.get("question")
            response = item.get("response") or item.get("answer")
            if not prompt or not response:
                raise ValueError("Each JSONL row must contain prompt/response or question/answer.")
            rows.append({"prompt": prompt.strip(), "response": response.strip()})
    return rows


def sample_questions_from_data(path: Path, limit: int = 6) -> list[str]:
    rows = read_jsonl_rows(path)
    return [row["prompt"] for row in rows[:limit]]


def manifest_path(model_dir: Path | None = None) -> Path:
    return (model_dir or DEFAULT_OUTPUT_DIR) / "training_manifest.json"


def write_training_manifest(manifest: dict, model_dir: Path | None = None):
    path = manifest_path(model_dir)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def load_training_manifest(model_dir: Path | None = None) -> dict | None:
    path = manifest_path(model_dir)
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_text(value: str) -> str:
    return " ".join(value.strip().split())


def format_training_example(tokenizer, prompt: str, response: str) -> str:
    messages = [
        {"role": "user", "content": normalize_text(prompt)},
        {"role": "assistant", "content": normalize_text(response)},
    ]

    if hasattr(tokenizer, "apply_chat_template"):
        return tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)

    eos_token = tokenizer.eos_token or ""
    return f"<|user|>\n{prompt}\n<|assistant|>\n{response}{eos_token}"


def build_generation_prompt(tokenizer, question: str) -> str:
    message = [{"role": "user", "content": normalize_text(question)}]
    if hasattr(tokenizer, "apply_chat_template"):
        return tokenizer.apply_chat_template(message, tokenize=False, add_generation_prompt=True)
    return f"<|user|>\n{question}\n<|assistant|>\n"


def clean_answer_text(output: str) -> str:
    cleaned = output.strip()
    for marker in ("<|assistant|>", "assistant\n", "Assistant:\n", "Assistant:"):
        if marker in cleaned:
            cleaned = cleaned.split(marker, 1)[1].strip()
    for marker in ("<|im_end|>", "<|endoftext|>"):
        cleaned = cleaned.replace(marker, "")
    return cleaned.strip()


def choose_model_interactively(default_model: str | None = None) -> str:
    import questionary

    default_choice = default_model or MODEL_OPTIONS[0]
    return questionary.select(
        "Choose the base model to fine-tune:",
        choices=MODEL_OPTIONS,
        default=default_choice,
    ).ask()


def resolve_runtime_device():
    import torch

    if not torch.cuda.is_available():
        return "cpu", torch.float32, False, False

    try:
        probe = torch.tensor([1.0], device="cuda")
        _ = (probe + 1).item()
        if torch.cuda.is_bf16_supported():
            return "cuda", torch.bfloat16, False, True
        return "cuda", torch.float32, True, False
    except Exception as exc:
        print(f"WARNING: CUDA is detected but not usable: {exc}")
        print("Training will continue on CPU.")
        return "cpu", torch.float32, False, False


def train_model(
    model_name: str,
    data_path: Path,
    output_dir: Path,
    num_train_epochs: int,
    per_device_train_batch_size: int,
    learning_rate: float,
    max_seq_length: int,
    logging_steps: int,
):
    import torch
    from datasets import Dataset
    from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
    from trl import SFTTrainer

    rows = read_jsonl_rows(data_path)
    print(f"Loaded {len(rows)} biography examples from {data_path}")
    runtime_device, model_dtype, use_fp16, use_bf16 = resolve_runtime_device()

    base_model_dir = resolve_local_model_path(model_name)
    tokenizer = AutoTokenizer.from_pretrained(base_model_dir, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        base_model_dir,
        dtype=model_dtype,
        low_cpu_mem_usage=True,
    )

    if runtime_device == "cuda":
        model = model.to("cuda")
        print("Using GPU: cuda")
    else:
        if torch.version.cuda:
            print("WARNING: CUDA support is present in PyTorch but unavailable at runtime.")
        else:
            print("WARNING: CPU-only PyTorch build is active.")
        print("Training will run on CPU.")

    dataset = Dataset.from_list(
        [{"text": format_training_example(tokenizer, row["prompt"], row["response"])} for row in rows]
    )

    training_args = TrainingArguments(
        output_dir=str(output_dir),
        num_train_epochs=num_train_epochs,
        per_device_train_batch_size=per_device_train_batch_size,
        learning_rate=learning_rate,
        logging_steps=logging_steps,
        save_strategy="epoch",
        fp16=use_fp16,
        bf16=use_bf16,
        eval_strategy="no",
        save_total_limit=2,
        remove_unused_columns=False,
        report_to="none",
    )

    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        processing_class=tokenizer,
    )

    print_block(
        "Training Summary",
        [
            f"Base model: {model_name}",
            f"Data file: {data_path}",
            f"Output folder: {output_dir}",
            f"Examples: {len(rows)}",
            f"Epochs: {num_train_epochs}",
            f"Batch size: {per_device_train_batch_size}",
            f"Learning rate: {learning_rate}",
        ],
        color="yellow",
    )

    trainer.train()
    trainer.save_model(str(output_dir))
    tokenizer.save_pretrained(str(output_dir))

    manifest = {
        "base_model_name": model_name,
        "base_model_dir": str(base_model_dir),
        "trained_model_dir": str(output_dir),
        "data_path": str(data_path),
        "num_examples": len(rows),
        "num_train_epochs": num_train_epochs,
        "per_device_train_batch_size": per_device_train_batch_size,
        "learning_rate": learning_rate,
        "max_seq_length": max_seq_length,
        "logging_steps": logging_steps,
        "runtime_device": runtime_device,
        "sample_questions": [row["prompt"] for row in rows[:6]],
    }
    write_training_manifest(manifest, output_dir)
    return manifest


def generate_answer(model_reference: str | Path, question: str, max_new_tokens: int = 120) -> str:
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer

    model_ref = resolve_local_model_path(model_reference)
    tokenizer = AutoTokenizer.from_pretrained(str(model_ref), trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(model_ref)
    device = "cuda" if resolve_runtime_device()[0] == "cuda" else "cpu"
    model = model.to(device)
    model.eval()

    prompt = build_generation_prompt(tokenizer, question)
    inputs = tokenizer(prompt, return_tensors="pt")
    inputs = {key: value.to(device) for key, value in inputs.items()}

    with torch.inference_mode():
        generated = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=False,
            repetition_penalty=1.1,
            no_repeat_ngram_size=4,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )

    new_tokens = generated[0][inputs["input_ids"].shape[1]:]
    decoded = tokenizer.decode(new_tokens, skip_special_tokens=False)
    return clean_answer_text(decoded)


def compare_models(base_model_name: str, trained_model_dir: Path, question: str, max_new_tokens: int = 120) -> dict[str, str]:
    base_model_dir = resolve_local_model_path(base_model_name)
    trained_model_dir = resolve_local_model_path(trained_model_dir)
    base_answer = generate_answer(base_model_dir, question, max_new_tokens=max_new_tokens)
    trained_answer = generate_answer(trained_model_dir, question, max_new_tokens=max_new_tokens)
    return {
        "question": question,
        "base_answer": base_answer,
        "trained_answer": trained_answer,
    }


def print_answer_card(title: str, model_name: str, answer: str, color: str):
    print_block(title, [f"Model: {model_name}", "", "Answer:", answer], color=color)


def get_sample_questions() -> list[str]:
    manifest = load_training_manifest() or {}
    questions = manifest.get("sample_questions") or []
    if questions:
        return questions
    if DEFAULT_DATA_PATH.exists():
        return sample_questions_from_data(DEFAULT_DATA_PATH)
    return []

def sanitize_model_identifier(model_reference):
    safe = re.sub(r"[^A-Za-z0-9_.-]+", "_", model_reference)
    return safe.strip("_")


def download_and_save_model(model_reference, local_path):
    from transformers import AutoModelForCausalLM, AutoTokenizer

    model_name = str(model_reference)
    local_path.mkdir(parents=True, exist_ok=True)

    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    tokenizer.save_pretrained(local_path)

    model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True, low_cpu_mem_usage=True)
    model.save_pretrained(local_path)

    return local_path


def resolve_local_model_path(model_reference):
    reference_path = Path(model_reference)
    if reference_path.exists():
        return reference_path

    model_name = str(model_reference)
    local_path = BASE_MODEL_LOCAL_DIR / sanitize_model_identifier(model_name)
    if local_path.exists():
        return local_path

    return download_and_save_model(model_name, local_path)


def sanitize_model_identifier(model_reference):
    safe = re.sub(r"[^A-Za-z0-9_.-]+", "_", model_reference)
    return safe.strip("_")


def download_and_save_model(model_reference, local_path):
    from transformers import AutoModelForCausalLM, AutoTokenizer

    model_name = str(model_reference)
    local_path.mkdir(parents=True, exist_ok=True)

    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    tokenizer.save_pretrained(local_path)

    model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True, low_cpu_mem_usage=True)
    model.save_pretrained(local_path)

    return local_path


def resolve_local_model_path(model_reference):
    reference_path = Path(model_reference)
    if reference_path.exists():
        return reference_path

    model_name = str(model_reference)
    local_path = BASE_MODEL_LOCAL_DIR / sanitize_model_identifier(model_name)
    if local_path.exists():
        return local_path

    return download_and_save_model(model_name, local_path)
