import { hideTextInImage, revealTextFromImage } from './image';

/**
 * Ukrývá text v konkrétním snímku videa
 * @param {HTMLVideoElement} video - Video element
 * @param {string} message - Zpráva k ukrytí
 * @param {number} frameIndex - Index snímku, který se má použít (výchozí: 0 - první snímek)
 * @param {number} bitsPerChannel - Počet bitů na barevný kanál pro LSB (1-3)
 * @returns {Object} - Objekt obsahující data snímku a metadata
 */
export async function hideTextInVideoFrame(video, message, frameIndex = 0, bitsPerChannel = 1) {
  // Extrakce konkrétního snímku
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');

  // Posun na požadovaný snímek
  video.currentTime = frameIndex / 30; // Předpokládáme 30fps

  // Počkáme, až se video přesune na požadovaný snímek
  await new Promise((resolve) => {
    video.onseeked = resolve;
  });

  // Vykreslení snímku na plátno
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Ukrytí textu do snímku pomocí existující obrazové steganografie
  const stegoImageData = await hideTextInImage(canvas, message, bitsPerChannel);

  // Vložení upraveného snímku zpět do plátna
  ctx.putImageData(stegoImageData, 0, 0);

  // Získání snímku jako URL pro náhled
  const modifiedFrameUrl = canvas.toDataURL('image/png');

  return {
    modifiedFrame: modifiedFrameUrl,
    frameCanvas: canvas, // Vrátíme plátno pro dekódování v paměti
    frameIndex: frameIndex,
    originalWidth: video.videoWidth,
    originalHeight: video.videoHeight
  };
}

/**
 * Odkrývá text z konkrétního snímku videa, souboru obrázku nebo z dat snímku
 * @param {HTMLVideoElement|HTMLCanvasElement|HTMLImageElement} source - Video/obrázek element nebo plátno se snímkem
 * @param {number} frameIndex - Index snímku ke kontrole (pokud je source video)
 * @param {number} bitsPerChannel - Počet bitů na barevný kanál použitých v LSB
 * @returns {Promise<string>} - Skrytá zpráva
 */
export async function revealTextFromVideoFrame(source, frameIndex = 0, bitsPerChannel = 1) {
  let canvas;

  if (source instanceof HTMLVideoElement) {
    // Extrakce konkrétního snímku z videa
    canvas = document.createElement('canvas');
    canvas.width = source.videoWidth;
    canvas.height = source.videoHeight;
    const ctx = canvas.getContext('2d');

    // Posun na požadovaný snímek
    source.currentTime = frameIndex / 30; // Předpokládáme 30fps

    // Počkáme, až se video přesune na požadovaný snímek
    await new Promise((resolve) => {
      source.onseeked = resolve;
    });

    // Vykreslení snímku na plátno
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  } else if (source instanceof HTMLCanvasElement) {
    // Použití přímo poskytnutého plátna
    canvas = source;
  } else if (source instanceof HTMLImageElement) {
    // Vytvoření plátna z obrázku
    canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');

    // Ujistíme se, že je obrázek načtený
    if (!source.complete) {
      await new Promise((resolve) => {
        source.onload = resolve;
      });
    }

    // Vykreslení obrázku na plátno
    ctx.drawImage(source, 0, 0);
  } else {
    throw new Error('Zdroj musí být buď video element, obrázek element nebo plátno');
  }

  // Odkrytí textu pomocí existující obrazové steganografie
  return await revealTextFromImage(canvas, bitsPerChannel);
}
