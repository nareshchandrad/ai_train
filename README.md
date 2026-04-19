<div align="center">

# 🤖 LLM Fine-Tuning Lab

A minimal, student-friendly project for training and testing a small biography Q&A model.

---

<table>
<tr>
<td align="center">

🎯 <b>Train_LLM.py</b><br>
<sub>Setup, train, or clean up in one script</sub>

</td>
<td align="center">

🧑‍🔬 <b>Test_LLM.py</b><br>
<sub>Ask questions and compare base vs trained</sub>

</td>
</tr>
</table>

---

## 🚀 Overview

This project trains a small transformer model on `data/biography_qa.jsonl` and saves the final weights to `output/trained-model`.

- `Train_LLM.py` installs dependencies in `.venv`, downloads the base model, and trains the model.
- `Test_LLM.py` runs a student-friendly lab for the base model, the trained model, or both.

---

## ✅ Prerequisites

1. Install Python 3.10+.
2. Open PowerShell in the project folder.
3. Verify Python is available:

```powershell
python --version
```

4. If Python is missing, install it and add it to your PATH.

> GPU is optional. The code uses CUDA if available, otherwise it falls back to CPU.

---

## 🧑‍💻 Quick Start

1. Train the model:

```powershell
python Train_LLM.py
```

2. Test the model interactively:

```powershell
python Test_LLM.py
```

3. Try a one-shot question:

```powershell
python Test_LLM.py --question "Where were you born?" --mode compare
```

---

## 📦 Project Structure

<pre>
llm_train/
├── Train_LLM.py         # Setup, train, or clean up
├── Test_LLM.py          # Student test/comparison lab
├── llm_project.py       # Shared logic and inference helpers
├── data/
│   └── biography_qa.jsonl  # Training data
├── output/
│   ├── base-models/      # local copies of downloaded base models
│   └── trained-model/    # final fine-tuned model + training manifest
├── .venv/               # project-local Python environment
├── .cache/huggingface/  # Hugging Face cache and downloads
└── requirements.txt     # non-torch Python dependencies
</pre>

---

## 🧪 Train and test commands

### Train the model

```powershell
python Train_LLM.py
```

If `output/trained-model` already exists and you want to overwrite it:

```powershell
python Train_LLM.py --yes --replace_output
```

![Train workflow](assets/train-live.gif)

*Animated demo of the model training process in the project terminal.*

### Run the interactive test lab

```powershell
python Test_LLM.py
```

![Test workflow](assets/test-live.gif)

*Animated demo of the interactive test lab and model comparison output.*

### One-shot test examples

```powershell
python Test_LLM.py --question "what is your name" --mode compare
python Test_LLM.py --question "where were you born" --mode trained
python Test_LLM.py --question "who are you" --mode base
```

---

## 🧪 Direct inference commands

If you want to bypass the interactive lab, use these direct commands:

```powershell
python -c "from llm_project import generate_answer; print(generate_answer('output/trained-model', 'Where were you born?'))"
python -c "from llm_project import generate_answer; print(generate_answer('output/base-models/HuggingFaceTB_SmolLM2-135M-Instruct', 'Where were you born?'))"
python -c "from llm_project import compare_models; print(compare_models('HuggingFaceTB/SmolLM2-135M-Instruct', 'output/trained-model', 'Where were you born?'))"
```

Recommended inference targets:

- Final trained model: `output/trained-model`
- Local base model copy: `output/base-models/HuggingFaceTB_SmolLM2-135M-Instruct`
- Remote base model name: `HuggingFaceTB/SmolLM2-135M-Instruct`

Use `output/trained-model` for normal testing. Checkpoint folders are intermediate snapshots and are not the main inference target.

---

## ⚙️ Troubleshooting

If training or testing fails, reset the runtime and try again:

```powershell
python Train_LLM.py -Action cleanup
python Train_LLM.py
python Test_LLM.py
```

If the script asks to overwrite output and you want to do it automatically:

```powershell
python Train_LLM.py --yes --replace_output
```

If your Python version is old, upgrade to Python 3.10+ and rerun the same steps.

---

## 💡 Notes

- The base model is `HuggingFaceTB/SmolLM2-135M-Instruct` by default.
- Training data lives in `data/biography_qa.jsonl`.
- The final manifest is `output/trained-model/training_manifest.json`.
- `Test_LLM.py` reads that manifest and compares base vs trained model answers.

---

<div align="center">

<img src="https://img.shields.io/badge/LLM-Lab-blueviolet?style=for-the-badge" />
<img src="https://img.shields.io/badge/Student-Ready-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/Cache-Local-blue?style=for-the-badge" />

</div>
