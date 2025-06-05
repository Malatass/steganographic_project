import { hideTextInImage, revealTextFromImage } from './image';

/**
 * Hides text in a specific frame of a video
 * @param {HTMLVideoElement} video - The video element
 * @param {string} message - The message to hide
 * @param {number} frameIndex - The index of the frame to use (default: 0 - first frame)
 * @param {number} bitsPerChannel - Bits per color channel for LSB (1-3)
 * @returns {Object} - Object containing the frame data and metadata
 */
export async function hideTextInVideoFrame(video, message, frameIndex = 0, bitsPerChannel = 1) {
  // Extract the specific frame
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');

  // Seek to the desired frame
  video.currentTime = frameIndex / 30; // Assuming 30fps

  // Wait for the video to seek to the desired frame
  await new Promise((resolve) => {
    video.onseeked = resolve;
  });

  // Draw the frame to canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Hide the text in the frame using existing image steganography
  const stegoImageData = await hideTextInImage(canvas, message, bitsPerChannel);

  // Put the modified frame back to canvas
  ctx.putImageData(stegoImageData, 0, 0);

  // Get frame as data URL for preview
  const modifiedFrameUrl = canvas.toDataURL('image/png');

  return {
    modifiedFrame: modifiedFrameUrl,
    frameCanvas: canvas, // Return the canvas for in-memory decoding
    frameIndex: frameIndex,
    originalWidth: video.videoWidth,
    originalHeight: video.videoHeight
  };
}

/**
 * Reveals text from a specific frame of a video, image file, or from frame data
 * @param {HTMLVideoElement|HTMLCanvasElement|HTMLImageElement} source - The video/image element or canvas with frame
 * @param {number} frameIndex - The index of the frame to check (if source is video)
 * @param {number} bitsPerChannel - Bits per color channel used in LSB
 * @returns {Promise<string>} - The hidden message
 */
export async function revealTextFromVideoFrame(source, frameIndex = 0, bitsPerChannel = 1) {
  let canvas;

  if (source instanceof HTMLVideoElement) {
    // Extract the specific frame from video
    canvas = document.createElement('canvas');
    canvas.width = source.videoWidth;
    canvas.height = source.videoHeight;
    const ctx = canvas.getContext('2d');

    // Seek to the desired frame
    source.currentTime = frameIndex / 30; // Assuming 30fps

    // Wait for the video to seek to the desired frame
    await new Promise((resolve) => {
      source.onseeked = resolve;
    });

    // Draw the frame to canvas
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  } else if (source instanceof HTMLCanvasElement) {
    // Use the provided canvas directly
    canvas = source;
  } else if (source instanceof HTMLImageElement) {
    // Create a canvas from the image
    canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');

    // Make sure the image is loaded
    if (!source.complete) {
      await new Promise((resolve) => {
        source.onload = resolve;
      });
    }

    // Draw the image to canvas
    ctx.drawImage(source, 0, 0);
  } else {
    throw new Error('Source must be either a video element, image element, or canvas');
  }

  // Reveal the text using existing image steganography
  return await revealTextFromImage(canvas, bitsPerChannel);
}
