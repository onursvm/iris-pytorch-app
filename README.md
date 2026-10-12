# 🌸 Iris Species Classifier

A deep learning web application that classifies Iris flower species in real time using a **PyTorch** neural network served via a **FastAPI** backend.

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-2.x-EE4C2C?logo=pytorch&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)

---

## 🧠 Model Architecture

| Layer | Details |
|---|---|
| Input | 4 features (sepal & petal measurements) |
| Hidden 1 | Linear(4→16) + ReLU |
| Hidden 2 | Linear(16→16) + ReLU |
| Output | Linear(16→3) → Softmax |

**Classes:** Setosa 🌹 · Versicolor 💜 · Virginica 🌿

---

## ✨ Features

- Real-time species prediction with confidence score
- Per-class probability breakdown
- 🇬🇧 / 🇹🇷 Language toggle (EN / TR)
- Modern dark-themed glassmorphism UI
- Animated result card

---

## 🚀 Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/IrisClassifierWebApp.git
cd IrisClassifierWebApp

# 2. Create virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the server
uvicorn main:app --reload
IrisClassifierWebApp/
├── main.py                        # FastAPI app + model inference
├── iris_model.pth                 # Trained model weights
├── Iris.csv                       # Dataset
├── MultiClassClassification.ipynb # Training notebook
├── requirements.txt
├── .gitignore
├── templates/
│   └── index.html
└── static/
    ├── style.css
    ├── script.js
    └── lang_toggle.css

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, PyTorch
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Dataset:** [Iris Dataset](https://archive.ics.uci.edu/dataset/53/iris)

