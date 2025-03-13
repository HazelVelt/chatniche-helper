
# AI Models Directory

This directory is used for storing AI models for SDKit integration.

## Structure

- `sd15/` - For Stable Diffusion 1.5 models
- `sdxl/` - For Stable Diffusion XL models

## Installing Models

To use SDKit with this application:

1. Download SD1.5 and SDXL models from official sources
2. Place them in the appropriate folders within this directory
3. Make sure SDKit is properly configured to use these paths
4. Start the SDKit server before using the application

You can install SDKit with: `pip install sdkit`

### SDKit Server

You need to run the SDKit server separately. Create a Python file (e.g., `run_sdkit_server.py`) with:

```python
from sdkit.api import API

# Initialize the API with the paths to your models
api = API(
    host="127.0.0.1", 
    port=8000,
    model_paths={
        "stable-diffusion": "./models/sd15/model.safetensors",  # Adjust path as needed
        "stable-diffusion-xl": "./models/sdxl/model.safetensors"  # Adjust path as needed
    }
)

# Start the server
api.start()
```

Run it with: `python run_sdkit_server.py`

Recommended models:
- SD1.5: runwayml/stable-diffusion-v1-5
- SDXL: stabilityai/stable-diffusion-xl-base-1.0

For more information on SDKit, see https://github.com/easydiffusion/sdkit
