<div align="center">

# 🤖 LLM Fine-Tuning Lab

A minimal, student-friendly project for hands-on LLM fine-tuning and testing.

---

<table>
<tr>
<td align="center">

🎯 <b>Train_LLM.py</b><br>
<sub>Setup, train, or clean up in one script</sub>

</td>
<td align="center">

🧑‍🔬 <b>Test_LLM.py</b><br>
<sub>Student Q&A and model comparison lab</sub>

</td>
</tr>
</table>

---

</div>

## 🚦 Quick Start

```bash
# Train or resume (installs everything needed)
python Train_LLM.py

# Clean all runtime artifacts (cache, .venv, output)
python Train_LLM.py -Action cleanup

# Train with options (non-interactive)
python Train_LLM.py --yes --replace_output
```

- `Train_LLM.py` automatically creates `.venv` and installs required packages locally.

---

## 🗂️ Project Structure

<pre>
llm_train/
├── Train_LLM.py         # Setup, train, or cleanup
├── Test_LLM.py          # Student test/comparison lab
├── llm_project.py       # Shared logic
├── data/
│   └── biography_qa.jsonl  # Training data
├── output/
│   └── trained-model/      # Final model & manifest
├── .venv/               # Project-local Python env
├── .cache/huggingface/  # All model/cache/config
└── requirements.txt     # Non-torch dependencies
</pre>

---

## 🏋️‍♂️ Training

- Uses <b>HuggingFaceTB/SmolLM2-135M-Instruct</b> by default (small, fast, educational)
- Trains on <b>data/biography_qa.jsonl</b>
- Saves to <b>output/trained-model</b>
- All runtime files stay inside the project folder

---

## 🧹 Cleanup

To fully reset the project (delete .venv, cache, output):

```bash
python Train_LLM.py -Action cleanup
```

---

## 🧑‍🎓 Student Lab

```bash
python Test_LLM.py
```

- Ask the trained model
- Ask the base model
- Compare both answers
- View sample questions

One-shot examples:

```bash
python Test_LLM.py --question "what is your name" --mode compare
python Test_LLM.py --question "where were you born" --mode trained
```

---

## 💡 Tips

- Add more Q&A pairs to <b>data/biography_qa.jsonl</b> for better results
- All dependencies and cache are project-local
- No global Python or cache pollution
- Repeat runs are fast (reuses env and packages)

---

<div align="center">

<img src="https://img.shields.io/badge/LLM-Lab-blueviolet?style=for-the-badge" />
<img src="https://img.shields.io/badge/Student-Ready-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/Cache-Local-blue?style=for-the-badge" />

</div>
