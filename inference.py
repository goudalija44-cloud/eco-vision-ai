# actual AI prediction logic.

import json
import torch
import torch.nn as nn

from PIL import Image
from torchvision.models import efficientnet_b0

from torchvision import transforms


# =========================
# DEVICE
# =========================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# =========================
# LOAD CONFIGURATION
# =========================

with open("model/model_config.json", "r") as f:
    config = json.load(f)


# =========================
# LOAD CLASS NAMES
# =========================

with open("model/class_names.json", "r") as f:
    class_names = json.load(f)

class_names = {
    int(key): value
    for key, value in class_names.items()
}


# =========================
# CREATE MODEL
# =========================

model = efficientnet_b0(weights=None)

num_classes = config["num_classes"]

model.classifier[1] = nn.Linear(
    model.classifier[1].in_features,
    num_classes
)


# =========================
# LOAD TRAINED WEIGHTS
# =========================

model.load_state_dict(
    torch.load(
        "model/ecovision_efficientnet_b0.pth",
        map_location=device
    )
)

model = model.to(device)

model.eval()


# =========================
# IMAGE TRANSFORMATION
# =========================

transform = transforms.Compose([

    transforms.Resize(
        (
            config["image_size"],
            config["image_size"]
        )
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=config["normalization"]["mean"],
        std=config["normalization"]["std"]
    )
])


# =========================
# PREDICTION FUNCTION
# =========================

def predict_image(image: Image.Image):

    image = image.convert("RGB")

    image_tensor = transform(image)

    image_tensor = image_tensor.unsqueeze(0)

    image_tensor = image_tensor.to(device)


    with torch.no_grad():

        outputs = model(image_tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )


    top_probabilities, top_indices = torch.topk(
        probabilities,
        k=3,
        dim=1
    )


    top_predictions = []

    for probability, index in zip(
        top_probabilities[0],
        top_indices[0]
    ):

        top_predictions.append({

            "class": class_names[index.item()],

            "confidence": round(
                probability.item(),
                4
            )
        })


    prediction = top_predictions[0]


    return {

        "prediction": prediction["class"],

        "confidence": prediction["confidence"],

        "top_predictions": top_predictions
    }