from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import torch
from torch import nn
import os

app = FastAPI(title="Iris Classifier API")

# Setup directories
base_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(base_dir, "static")
templates_dir = os.path.join(base_dir, "templates")

if not os.path.exists(static_dir):
    os.makedirs(static_dir)
if not os.path.exists(templates_dir):
    os.makedirs(templates_dir)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Define the PyTorch Model Architecture
class IrisClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear_layer_stack = nn.Sequential(
            nn.Linear(4, 16),
            nn.ReLU(),
            nn.Linear(16, 16),
            nn.ReLU(),
            nn.Linear(16, 3)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.linear_layer_stack(x)

# Load the model state_dict
model = IrisClassifier()
model_path = os.path.join(base_dir, "iris_model.pth")

if os.path.exists(model_path):
    # Load model with weights_only=True for safety
    model.load_state_dict(torch.load(model_path, weights_only=True))
    model.eval()
    print(f"Model loaded successfully from {model_path}")
else:
    print(f"Warning: Model file '{model_path}' not found! Please ensure your .pth file is placed in the project root and named 'iris_model.pth'.")

class IrisFeatures(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float

iris_classes = ["Setosa", "Versicolor", "Virginica"]

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    html_file = os.path.join(templates_dir, "index.html")
    with open(html_file, "r", encoding="utf-8") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)

@app.post("/predict")
async def predict(features: IrisFeatures):
    # Prepare input tensor from features
    input_data = torch.tensor([[
        features.sepal_length, 
        features.sepal_width, 
        features.petal_length, 
        features.petal_width
    ]], dtype=torch.float32)
    
    # Make prediction
    with torch.inference_mode():
        logits = model(input_data)
        # Apply softmax to get probabilities
        pred_prob = torch.softmax(logits, dim=1)
        pred_class_idx = pred_prob.argmax(dim=1).item()
        
    predicted_class = iris_classes[pred_class_idx]
    confidence = pred_prob[0][pred_class_idx].item()
    
    return {
        "prediction": predicted_class,
        "confidence": round(confidence * 100, 2)
    }
