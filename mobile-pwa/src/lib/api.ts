import { VERIFIED_FOOD_DATABASE } from './foodDatabase';

const API_BASE = ''; // Uses Vite proxy in development or same-origin in production

/**
 * Compresses an image client-side before sending to server to save mobile bandwidth
 */
export async function compressImageForMobile(file: File, maxDim = 1280, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Scan food image via Next.js backend proxy to OpenCLIP scanner daemon
 */
export async function scanFoodImage(file: File): Promise<any> {
  try {
    const compressedBlob = await compressImageForMobile(file);
    const formData = new FormData();
    formData.append('image', compressedBlob, 'meal.jpg');

    const response = await fetch(`${API_BASE}/api/scan-food`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        scanStatus: 'model_unavailable',
        message: err.message || 'Scanner service is unreachable. Please search manually.',
      };
    }

    return await response.json();
  } catch (error: any) {
    console.warn('Network error during scan:', error);
    return {
      scanStatus: 'offline',
      message: 'You appear to be offline. You can search foods manually and log your meal.',
    };
  }
}

/**
 * Recompute nutrition for a specific food and grams portion
 */
export async function recalculateServingNutrition(foodId: string, grams: number): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/scan-food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ foodId, grams }),
    });
    if (!response.ok) throw new Error('Failed to recalculate portion');
    return await response.json();
  } catch (err) {
    // Local fallback using verified database
    const local = VERIFIED_FOOD_DATABASE.find((f) => f.id === foodId);
    if (local) {
      const ratio = grams / local.servingSize;
      return {
        scanStatus: 'accepted',
        food: {
          ...local,
          servingSize: grams,
          calories: Math.round(local.calories * ratio),
          protein: Math.round(local.protein * ratio * 10) / 10,
          carbs: Math.round(local.carbs * ratio * 10) / 10,
          fats: Math.round(local.fats * ratio * 10) / 10,
        },
      };
    }
    return null;
  }
}

/**
 * Search foods with online API proxy and instant local offline fallback
 */
export async function searchFoods(query: string): Promise<any[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  try {
    const resp = await fetch(`${API_BASE}/api/scan-food/search?q=${encodeURIComponent(q)}`);
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    // Ignore online search failure and fall back to local
  }

  // Local offline search
  return VERIFIED_FOOD_DATABASE.filter(
    (f) => f.name.toLowerCase().includes(q) || (f.cuisine && f.cuisine.toLowerCase().includes(q))
  ).map((f) => ({
    food_id: f.id,
    display: f.name,
    calories_per_100g: Math.round((f.calories / f.servingSize) * 100),
    serving_unit: f.servingUnit,
    serving_size: f.servingSize,
  }));
}

/**
 * Send conversational AI assistant message
 */
export async function sendAssistantMessage(message: string, context: any): Promise<string> {
  try {
    const resp = await fetch(`${API_BASE}/api/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
    });
    if (!resp.ok) throw new Error('Assistant service unavailable');
    const data = await resp.json();
    return data.reply || data.text || 'I could not process your request at this time.';
  } catch (err) {
    return "I am currently offline or unable to reach the nutrition intelligence server. Your daily logs and local calculations are working normally!";
  }
}
