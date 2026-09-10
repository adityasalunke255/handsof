"""
FastAPI Microservice for Business Saathi AI Product Studio
Exposes:
- POST /api/ai/studio-enhance
- GET /health
"""

import sys
import io
import base64

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

from studio_processor import StudioProcessor

app = FastAPI(
    title="Business Saathi AI Product Studio",
    description="Microservice for rural artisan photo studio enhancement and zero-shot VLM cataloging",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

processor = StudioProcessor()


class Base64ImageRequest(BaseModel):
    image_base64: str = ""
    craft_hint: str = ""
    preset: str = "boutique_pedestal"


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "Business Saathi AI Product Studio",
        "engine": "Python FastAPI + PIL/Rembg",
        "version": "1.0.0"
    }


@app.post("/api/ai/studio-enhance")
async def enhance_product_image(payload: Base64ImageRequest):
    try:
        if not payload.image_base64:
            raise HTTPException(status_code=400, detail="image_base64 is required.")

        base64_data = payload.image_base64
        if "," in base64_data:
            base64_data = base64_data.split(",")[1]
        image_bytes = base64.b64decode(base64_data)
        raw_image = Image.open(io.BytesIO(image_bytes))

        # Run 3-step studio pipeline with selected aesthetic preset
        studio_image, metadata = processor.process_image(
            raw_image, 
            craft_hint=payload.craft_hint, 
            preset=payload.preset or "boutique_pedestal"
        )

        # Convert studio image to Base64 PNG data URL
        buffer = io.BytesIO()
        studio_image.save(buffer, format="PNG", optimize=True)
        encoded_png = base64.b64encode(buffer.getvalue()).decode("utf-8")
        data_url = f"data:image/png;base64,{encoded_png}"

        return {
            "success": True,
            "engine": "python_fastapi_rembg",
            "preset": payload.preset or "boutique_pedestal",
            "enhanced_image": data_url,
            "metadata": metadata
        }

    except Exception as e:
        print(f"[Error in enhance_product_image]: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AI Product Studio Microservice on http://localhost:8000 ...")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
