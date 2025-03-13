
# AI Models Directory

This directory is used for storing AI models for SDKit integration in the desktop application.

## Structure

- `sd15/` - For Stable Diffusion 1.5 models
- `sdxl/` - For Stable Diffusion XL models

## Installing Models for Desktop App

To use SDKit with this desktop application:

1. **Install Python** (3.8 or later) if not already installed
2. **Install SDKit** using: `pip install sdkit`
3. Download SD1.5 and SDXL models from official sources:
   - [Civitai](https://civitai.com/) - Community models
   - [Hugging Face](https://huggingface.co/) - Official models
4. Place downloaded model files (`.safetensors` or `.ckpt`) in the appropriate folders:
   - SD1.5 models in `src/models/sd15/`
   - SDXL models in `src/models/sdxl/`

### Recommended Models

For the best experience, we recommend the following models:

- **SD1.5**: [Realistic Vision v6.0](https://civitai.com/models/4201/realistic-vision-v60) or [runwayml/stable-diffusion-v1-5](https://huggingface.co/runwayml/stable-diffusion-v1-5)
- **SDXL**: [SDXL 1.0 Base](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0) or [Juggernaut XL](https://civitai.com/models/133005/juggernaut-xl)

### Example SDKit Python Code (For Reference)

The application will automatically use SDKit to generate images using code similar to this:

```python
import sdkit
from sdkit.generate import generate_images
from sdkit.models import load_model
from sdkit.utils import log, save_images

context = sdkit.Context()

# Set the path to the model file on disk (.ckpt or .safetensors file)
context.model_paths["stable-diffusion"] = "./models/sd15/model.safetensors"  # Path adjusted by app
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

For more information on SDKit, see https://github.com/easydiffusion/sdkit
