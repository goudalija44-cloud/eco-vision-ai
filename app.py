from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from PIL import Image
import io

from inference import predict_image


# CREATE FASTAPI APP

app = FastAPI(

    title="EcoVision AI",

    description=(
        "AI-powered waste classification API "
        "using EfficientNet-B0 transfer learning."
    ),

    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HOME

@app.get("/")
def home():

    return {

        "message": "Welcome to EcoVision AI",

        "status": "running",

        "model": "EfficientNet-B0",

        "classes": 9
    }



# HEALTH CHECK
@app.get("/health")
def health_check():

    return {

        "status": "healthy",

        "model": "loaded"
    }



# MODEL INFO

@app.get("/model-info")
def model_info():

    return {

        "model": "EfficientNet-B0",

        "task": "Waste Image Classification",

        "classes": 9,

        "input_size": "224x224",

        "top_predictions": 3
    }


# IMAGE PREDICTION

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    # Check file type

    if not file.content_type.startswith("image/"):

        raise HTTPException(

            status_code=400,

            detail="Please upload a valid image file."
        )


    # Read uploaded file

    contents = await file.read()


    try:

        image = Image.open(
            io.BytesIO(contents)
        )

    except Exception:

        raise HTTPException(

            status_code=400,

            detail="Unable to read the uploaded image."
        )


    # Run AI prediction

    result = predict_image(image)


    return {

        "filename": file.filename,

        "prediction": result["prediction"],

        "confidence": result["confidence"],

        "top_predictions": result["top_predictions"]
    }