
import { StagingStyle } from "../types";
import { STYLE_CONFIGS } from "../constants";

// Firebase Cloud Function URL
const FUNCTION_URL = "https://us-central1-damonstaging.cloudfunctions.net/stageRoom";

export const stageRoom = async (
  originalImageBase64: string,
  style: StagingStyle,
  roomType: string = 'LIVING_ROOM',
  model: string = 'gemini-2.5-flash-image'
): Promise<{ url: string; description: string }> => {
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: originalImageBase64,
        style: style,
        roomType: roomType,
        model: model
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.url) {
      throw new Error("No image data was returned from the server.");
    }

    return { url: data.url, description: data.description };
  } catch (error: any) {
    console.error("Staging Error:", error);
    throw new Error(error.message || "Failed to stage the room. Please try again.");
  }
};

// Keep STYLE_CONFIGS export for use in other components
export { STYLE_CONFIGS };
