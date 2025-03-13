
# AI Models Directory

This directory is used for storing AI models for SDKit integration.

## Structure

- `sd15/` - For Stable Diffusion 1.5 models
- `sdxl/` - For Stable Diffusion XL models

## Installing Models

To use SDKit with this application:

1. Install SDKit using: `pip install sdkit`
2. Download SD1.5 and SDXL models from official sources
3. Place them in the appropriate folders within this directory

### Using SDKit in Python

SDKit is a Python library that runs directly on your system. Here's an example of how to use it:

```python
import sdkit
from sdkit.generate import generate_images
from sdkit.models import load_model
from sdkit.utils import log, save_images

context = sdkit.Context()

# Set the path to the model file on disk (.ckpt or .safetensors file)
context.model_paths["stable-diffusion"] = "./models/sd15/model.safetensors"  # Adjust path as needed
load_model(context, "stable-diffusion")

# Generate the image
images = generate_images(
    context, 
    prompt="Photograph of an astronaut riding a horse", 
    seed=42, 
    width=512, 
    height=512,
    sampler_name="euler_a",
    num_inference_steps=30,
    guidance_scale=7.5
)

# Save the image
save_images(images, dir_path="./output")

log.info("Generated images!")
```

### Available Parameters

SDKit supports numerous parameters for image generation:

```python
generate_images(
    context: Context,
    prompt: str = "",
    negative_prompt: str = "",
    seed: int = 42,
    width: int = 512,
    height: int = 512,
    num_outputs: int = 1,
    num_inference_steps: int = 25,
    guidance_scale: float = 7.5,
    init_image = None,  # For img2img
    init_image_mask = None,  # For inpainting
    prompt_strength: float = 0.8,
    preserve_init_image_color_profile = False,
    sampler_name: str = "euler_a",  # Options: "ddim", "plms", "heun", "euler", "euler_a", etc.
    hypernetwork_strength: float = 0,
)
```

Recommended models:
- SD1.5: runwayml/stable-diffusion-v1-5
- SDXL: stabilityai/stable-diffusion-xl-base-1.0

For more information on SDKit, see https://github.com/easydiffusion/sdkit
