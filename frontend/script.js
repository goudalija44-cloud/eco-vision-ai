// ======================================
// ECO VISION AI FRONTEND
// ======================================


// FastAPI backend

const API_URL = "http://127.0.0.1:8000";


// ======================================
// ELEMENTS
// ======================================

const imageInput =
    document.getElementById("imageInput");

const dropZone =
    document.getElementById("dropZone");

const imagePreview =
    document.getElementById("imagePreview");

const previewSection =
    document.getElementById("previewSection");

const fileName =
    document.getElementById("fileName");

const analyzeBtn =
    document.getElementById("analyzeBtn");

const loadingSection =
    document.getElementById("loadingSection");

const resultSection =
    document.getElementById("resultSection");

const errorSection =
    document.getElementById("errorSection");

const errorMessage =
    document.getElementById("errorMessage");

const prediction =
    document.getElementById("prediction");

const confidence =
    document.getElementById("confidence");

const confidenceFill =
    document.getElementById("confidenceFill");

const topPredictions =
    document.getElementById("topPredictions");

const warning =
    document.getElementById("warning");

const resetBtn =
    document.getElementById("resetBtn");

const errorResetBtn =
    document.getElementById("errorResetBtn");


// Store selected image

let selectedFile = null;


// ======================================
// FILE SELECTION
// ======================================

imageInput.addEventListener(
    "change",
    function () {

        const file =
            imageInput.files[0];

        if (file) {

            handleFile(file);

        }

    }
);


// ======================================
// HANDLE FILE
// ======================================

function handleFile(file) {

    if (!file.type.startsWith("image/")) {

        showError(
            "Please select a valid image file."
        );

        return;

    }


    selectedFile = file;


    fileName.textContent =
        file.name;


    const reader =
        new FileReader();


    reader.onload = function (event) {

        imagePreview.src =
            event.target.result;

    };


    reader.readAsDataURL(file);


    dropZone.style.display =
        "none";

    previewSection.style.display =
        "block";

    loadingSection.style.display =
        "none";

    resultSection.style.display =
        "none";

    errorSection.style.display =
        "none";
}


// ======================================
// DRAG & DROP
// ======================================

dropZone.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        dropZone.classList.add(
            "dragover"
        );

    }
);


dropZone.addEventListener(
    "dragleave",
    function () {

        dropZone.classList.remove(
            "dragover"
        );

    }
);


dropZone.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        dropZone.classList.remove(
            "dragover"
        );


        const file =
            event.dataTransfer.files[0];


        if (file) {

            handleFile(file);

        }

    }
);


// ======================================
// ANALYZE IMAGE
// ======================================

analyzeBtn.addEventListener(
    "click",
    analyzeImage
);


async function analyzeImage() {

    if (!selectedFile) {

        showError(
            "Please select an image first."
        );

        return;

    }


    previewSection.style.display =
        "none";

    loadingSection.style.display =
        "block";

    resultSection.style.display =
        "none";

    errorSection.style.display =
        "none";


    const formData =
        new FormData();


    formData.append(
        "file",
        selectedFile
    );


    try {

        const response =
            await fetch(
                `${API_URL}/predict`,
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Prediction failed."
            );

        }


        displayResult(data);

    }


    catch (error) {

        showError(
            error.message
        );

    }

}


// ======================================
// DISPLAY RESULT
// ======================================

function displayResult(data) {

    loadingSection.style.display =
        "none";

    resultSection.style.display =
        "block";


    prediction.textContent =
        data.prediction;


    const confidencePercentage =
        data.confidence * 100;


    confidence.textContent =
        `${confidencePercentage.toFixed(1)}%`;


    confidenceFill.style.width =
        `${confidencePercentage}%`;


    topPredictions.innerHTML =
        "";


    data.top_predictions.forEach(
        function (item, index) {

            const row =
                document.createElement("div");


            row.className =
                "prediction-row";


            const itemConfidence =
                (
                    item.confidence * 100
                ).toFixed(1);


            row.innerHTML = `

                <span class="prediction-class">

                    ${index + 1}.
                    ${item.class}

                </span>

                <span class="prediction-confidence">

                    ${itemConfidence}%

                </span>

            `;


            topPredictions.appendChild(
                row
            );

        }
    );


    // Low-confidence warning

    if (data.confidence < 0.60) {

        warning.style.display =
            "block";

    } else {

        warning.style.display =
            "none";

    }

}


// ======================================
// ERROR
// ======================================

function showError(message) {

    dropZone.style.display =
        "none";

    previewSection.style.display =
        "none";

    loadingSection.style.display =
        "none";

    resultSection.style.display =
        "none";

    errorSection.style.display =
        "block";


    errorMessage.textContent =
        message;

}


// ======================================
// RESET
// ======================================

function resetApplication() {

    selectedFile = null;

    imageInput.value = "";

    imagePreview.src = "";

    fileName.textContent = "";

    prediction.textContent = "";

    confidence.textContent = "0%";

    confidenceFill.style.width =
        "0%";

    topPredictions.innerHTML = "";

    warning.style.display =
        "none";

    dropZone.style.display =
        "block";

    previewSection.style.display =
        "none";

    loadingSection.style.display =
        "none";

    resultSection.style.display =
        "none";

    errorSection.style.display =
        "none";

}


resetBtn.addEventListener(
    "click",
    resetApplication
);


errorResetBtn.addEventListener(
    "click",
    resetApplication
);