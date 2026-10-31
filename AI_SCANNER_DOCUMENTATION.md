# NutriTrack AI — AI Scanner Architecture & Machine Learning Documentation

This document provides a comprehensive technical audit of the **NutriTrack AI Food Vision Scanner**. It explains the camera pipeline, computer vision preprocessing, machine learning backends, decision gating logic, nutritional scaling algorithms, and instructions for adapting the scanner to native mobile platforms (React Native & Expo).

---

## 1. High-Level Scanner Architecture

The scanner employs a **hybrid edge-proxy-daemon architecture**:

```
[Mobile / Web Client]
   │
   ├─► 1. Capture/Pick Image (Expo Camera / HTML5 File Input)
   ├─► 2. Validate MIME type & file size (≤ 10 MB)
   │
   ▼ Multipart FormData ("image")
[Next.js Server Proxy: POST /api/scan-food]
   │
   ├─► 3. Verifies SERVER-ONLY env: SCANNER_URL, SCANNER_API_KEY
   ├─► 4. Relays image to Python FastAPI Daemon
   │
   ▼ HTTP POST {SCANNER_URL}/predict
[Python Scanner Microservice: FastAPI / Uvicorn (Port 8001)]
   │
   ├──► A. Image Decoding & Quality Gate (`image_quality.py`)
   │      - Validates JPEG/PNG headers via Pillow
   │      - Max resolution clamp (2048x2048)
   │      - Blur detection (Laplacian variance < 45)
   │      - Exposure check (Mean pixel intensity < 20 or > 245)
   │
   ├──► B. Binary Gate Classifier (`clip_backend.py` / `onnx_backend.py`)
   │      - Determines: Food vs Non-Food vs Packaged Nutrition Label
   │
   ├──► C. Multi-Class Food Identification
   │      - Predicts top-k candidates against 43 taxonomy classes
   │
   └──► D. Decision Thresholding Engine (`decision.py`)
          - Outputs standardized status: accepted | needs_confirmation | rejected_non_food | ambiguous | low_quality_image | model_unavailable
```

---

## 2. Image Preprocessing & Quality Verification

Located in [`nutritrack-scanner/scanner/image_quality.py`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-scanner/scanner/image_quality.py):

### 2.1 Format & Size Clamping
- Supported image formats: JPEG, PNG, WebP.
- Max file payload: $10\text{ MB}$.
- Minimum dimensions: $128 \times 128\text{ pixels}$.
- Maximum dimensions: $2048 \times 2048\text{ pixels}$ (larger images are downsampled using high-quality Lanczos resampling).

### 2.2 Quality Metric Thresholds
1. **Blur Detection**:
   $$\sigma^2 = \text{Variance}(\nabla^2 I)$$
   Calculates the variance of the Laplacian filter across the luminance channel. If $\sigma^2 < 45.0$, the image is flagged as blurry (`blurry`).
2. **Under-Exposure (Too Dark)**:
   $$\mu_{\text{luminance}} < 20.0 \implies \text{flag: } \texttt{too\_dark}$$
3. **Over-Exposure (Too Bright)**:
   $$\mu_{\text{luminance}} > 245.0 \implies \text{flag: } \texttt{too\_bright}$$

If any quality issue is triggered, the service returns immediately with `status: "low_quality_image"` without invoking the neural network.

---

## 3. Food Identification Model & Architecture

### 3.1 Model Status & Transparency Statement
> [!IMPORTANT]
> **Model Training Status**: In the current deployment, NutriTrack operates using an **OpenCLIP ViT-B-32 Zero-Shot Pretrained Model** (`laion2b_s34b_b79k`). There are **no proprietary trained/fine-tuned checkpoint weights** committed in `models/food_classifier` or `models/food_gate`. 
> 
> The codebase contains a complete training harness (`training/train_classifier.py` and `training/train_gate.py`), but until custom weights are trained and loaded, the scanner operates via OpenCLIP zero-shot inference, or gracefully falls back to `status: "model_unavailable"` allowing manual food search. **Results are never faked or hardcoded.**

### 3.2 Active Model Specifications
- **Model Architecture**: Vision Transformer (`ViT-B-32`)
- **Library**: `open_clip_torch` (OpenCLIP 2.24+) + PyTorch 2.6+
- **Pretrained Checkpoint**: `laion2b_s34b_b79k` (trained on LAION-2B dataset)
- **Input Resolution**: $224 \times 224$ pixels, RGB normalized
- **Embedding Dimension**: 512-dimensional shared vision-language latent space

### 3.3 Zero-Shot Dual-Stage Classification Pipeline

#### Stage 1: Gate Classification (`predict_gate`)
The model compares the input image embedding $\vec{v}_{\text{img}}$ against text embeddings of three prompt clusters:
1. `food`:
   - *"a photo of food"*
   - *"a photo of a cooked meal on a plate"*
   - *"a photo of fruit or vegetables"*
   - *"a photo of a drink"*
2. `non_food`:
   - *"a photo of a household object"*
   - *"a photo of soap or a cleaning product"*
   - *"a photo of stationery or a pen"*
   - *"a photo of medicine packaging"*
   - *"a photo of an electronic device"*
   - *"a photo of a person"*
   - *"a photo of plastic"*
3. `nutrition_label`:
   - *"a photo of a nutrition facts label"*
   - *"a photo of packaged food ingredients list"*

Cosine similarity with temperature scaling ($100.0$) followed by Softmax generates gate probabilities:
$$P(\text{food}), P(\text{non\_food}), P(\text{nutrition\_label})$$

If $P(\text{non\_food}) > P(\text{food}) \text{ and } P(\text{non\_food}) > 0.40$, the scan is rejected with `status: "rejected_non_food"`.

#### Stage 2: Food Identification (`predict_id`)
When the gate accepts the image as food, the image embedding is projected against the 43 food taxonomy classes using templated prompts:
$$\text{Prompt}_i = \text{"a photo of } \text{display}_i, \text{ a type of food"}$$
Top-5 candidates are ranked by Softmax probability.

---

## 4. 43-Class Food Taxonomy & Database Integration

Located in [`nutritrack-scanner/scanner/taxonomy.json`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-scanner/scanner/taxonomy.json) and mapped to [`nutritrack-scanner/data/food_db.json`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-scanner/data/food_db.json):

### 4.1 Sample Supported Food Classes
| Label | Display Name | Reference DB ID | Standard Serving | Calories / 100g |
|---|---|---|---|---|
| `apple_fresh` | Fresh Apple | `f-apple-fresh` | 1 medium (182g) | 52 kcal |
| `banana_fresh` | Fresh Banana | `f-banana-fresh` | 1 medium (118g) | 89 kcal |
| `dal_tadka` | Dal Tadka | `f-dal-tadka` | 1 bowl (200g) | 120 kcal |
| `paneer_curry` | Paneer Curry | `f-paneer-curry` | 1 bowl (220g) | 195 kcal |
| `chapati_roti` | Roti / Chapati | `f-chapati-roti` | 1 piece (40g) | 297 kcal |
| `white_rice_cooked`| Steamed White Rice| `f-white-rice` | 1 cup (158g) | 130 kcal |
| `chicken_breast` | Grilled Chicken Breast| `f-chicken-breast`| 1 breast (172g)| 165 kcal |
| `idli_steamed` | Steamed Idli | `f-idli-steamed` | 2 pieces (100g) | 143 kcal |
| `dosa_plain` | Plain Dosa | `f-dosa-plain` | 1 piece (120g) | 168 kcal |
| `boiled_egg` | Boiled Whole Egg | `f-boiled-egg` | 1 large (50g) | 155 kcal |
| `salad_green` | Green Mixed Salad | `f-salad-green` | 1 bowl (150g) | 22 kcal |

---

## 5. Decision Thresholds & Error Handling

Located in [`nutritrack-scanner/scanner/classifier/decision.py`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-scanner/scanner/classifier/decision.py):

| Status Code | Trigger Condition | User Experience / UI Behavior |
|---|---|---|
| `accepted` | Top-1 probability $\ge 0.22$, margin over Top-2 $\ge 0.05$ | Shows recognized dish with serving selector, nutrient table, and Save button |
| `needs_confirmation`| Top-1 probability between $0.15$ and $0.22$, or competitive top candidates | Displays candidate chips for 1-tap confirmation, plus manual search |
| `rejected_non_food` | Gate identifies non-food item ($P(\text{non\_food}) > 0.40$) | Informs user item is not food; provides button to retry or search manually |
| `ambiguous` | Top two candidates within $0.03$ probability difference | Prompts user to select between the close candidates |
| `low_quality_image` | Image failed blur or lighting checks | Displays actionable message (e.g. "Image is too dark") with retake button |
| `packaged_label_detected` | Packaged nutrition facts label detected | Suggests scanning the actual food or searching by product name |
| `model_unavailable` | Backend offline or weights missing | Gracefully opens manual search input; zero fake results |

---

## 6. Serving Size & Nutrition Calculation Engine

Located in [`nutritrack-scanner/scanner/nutrition/calculator.py`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-scanner/scanner/nutrition/calculator.py):

### 6.1 Scientific Portion Disclaimer
> [!CAUTION]
> **No RGB 2D Depth Estimation**: NutriTrack explicitly documents that **portion volume and weight cannot be reliably measured from a single 2D mobile camera photo** without multi-view depth sensors or reference tokens. The system therefore sets `portion.status: "needs_user_input"` and prompts the user to select a recognized standard serving or input exact grams.

### 6.2 Nutrient Scaling Formula
For any selected food and gram weight $W$:
$$\text{Scaling Factor } S = \frac{W}{100.0}$$
$$\text{Nutrient}_{\text{serving}} = \text{Nutrient}_{\text{per 100g}} \times S$$
$$\text{Calories} = \text{round}((\text{Protein} \times 4) + (\text{Carbs} \times 4) + (\text{Fats} \times 9))$$

### 6.3 Serving Options Endpoint
- `GET /foods/{id}/servings` returns pre-defined units:
  - `{"unit": "medium", "grams": 182, "label": "1 medium (182g)"}`
  - `{"unit": "bowl", "grams": 200, "label": "1 standard bowl (200g)"}`
  - `{"unit": "grams", "grams": 100, "label": "100g standard portion"}`

---

## 7. Direct Reuse vs Mobile Adaptation Matrix

| Component | Web Implementation | Mobile (React Native / Expo) Adaptation | Status |
|---|---|---|---|
| **Python ML Backend** | FastAPI on port 8001 | **Reuse Directly** (hosted on cloud server or run on localhost during dev) | 100% Reusable |
| **Next.js Proxy Route** | `/api/scan-food` & `/api/scan-food/search` | **Reuse Directly** as mobile backend API | 100% Reusable |
| **Food Reference DB** | `data/food_db.json` & `foodDatabase.ts` | **Reuse Directly** bundled in Expo app for instant offline search | 100% Reusable |
| **Camera Capture** | `<input type="file" accept="image/*" capture>` | **Adapt**: Use `expo-camera` or `expo-image-picker` with high-res photo capture | Adaptation Required |
| **Image Upload** | Browser `fetch` with `FormData` | **Adapt**: Native `fetch` with `FormData` containing `{ uri, name, type }` | Adaptation Required |
| **Serving Selector** | Web `<select>` & Tailwind buttons | **Adapt**: React Native `<Pressable>` chips or Bottom Sheet Modal | Adaptation Required |
| **Status Feedback** | Web alert banners | **Adapt**: React Native cards with Lucide/Ionicons | Adaptation Required |

---

## 8. Mobile Camera Implementation Blueprint (Expo)

```typescript
import * as ImagePicker from 'expo-image-picker';

export async function scanFoodFromMobileCamera(scannerApiUrl: string) {
  // 1. Request camera permissions
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  if (!permissionResult.granted) {
    throw new Error('Camera permission is required to scan food.');
  }

  // 2. Launch high-resolution native camera
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.85,
    allowsEditing: true,
    aspect: [4, 3],
  });

  if (result.canceled || !result.assets[0]) return null;

  const photo = result.assets[0];

  // 3. Construct React Native native multipart payload
  const formData = new FormData();
  formData.append('image', {
    uri: photo.uri,
    name: 'scan.jpg',
    type: 'image/jpeg',
  } as any);

  // 4. Send to NutriTrack Backend Proxy
  const response = await fetch(`${scannerApiUrl}/api/scan-food`, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
    },
  });

  return await response.json();
}
```
