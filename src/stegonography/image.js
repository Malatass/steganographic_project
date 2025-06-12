/**
 * Funkce pro ukrývání dat v obraze pomocí metody LSB (Least Significant Bit)
 * Podporuje ukrývání textu nebo jiného obrázku
 */

/**
 * Ukrytí textu do obrázku pomocí LSB metody
 * @param {HTMLCanvasElement} canvas - Plátno s originálním obrázkem
 * @param {string} message - Zpráva k ukrytí
 * @param {number} bitsPerChannel - Počet bitů použitých na jeden kanál (1-3, výchozí 1)
 * @return {Uint8ClampedArray} - ImageData s ukrytou zprávou
 */
export async function hideTextInImage(canvas, message, bitsPerChannel = 1) {
  if (bitsPerChannel < 1 || bitsPerChannel > 3) {
    throw new Error('Počet bitů na kanál musí být mezi 1 a 3');
  }

  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Převedení zprávy do binární podoby
  const messageWithHeader = `TEXT:${message.length}:${message}`;
  const binaryMessage = textToBinary(messageWithHeader);

  // Počet dostupných bitů v obrázku (RGB kanály * počet pixelů * bitsPerChannel)
  // Nepočítáme alfa kanál, abychom zachovali průhlednost
  const availableBits = (data.length - data.length / 4) * bitsPerChannel;

  if (binaryMessage.length > availableBits) {
    throw new Error(`Zpráva je příliš dlouhá pro tento obrázek. Maximální délka je přibližně ${Math.floor(availableBits / 8)} bajtů.`);
  }

  // Ukrytí dat v pixelech
  let bitIndex = 0;
  const mask = getMask(bitsPerChannel);

  for (let i = 0; i < data.length; i += 4) {
    if (bitIndex >= binaryMessage.length) break;

    // Modifikace RGB kanálů (ne alfa)
    for (let j = 0; j < 3; j++) {
      if (bitIndex >= binaryMessage.length) break;

      const channelIndex = i + j;
      const channelValue = data[channelIndex];

      // Odstranění nejméně významných bitů
      const clearedValue = channelValue & ~mask;

      // Vytvoření binárního bloku z binaryMessage
      let messageBitsBlock = 0;
      for (let k = 0; k < bitsPerChannel; k++) {
        if (bitIndex < binaryMessage.length) {
          messageBitsBlock = (messageBitsBlock << 1) | parseInt(binaryMessage[bitIndex], 10);
          bitIndex++;
        }
      }

      // Přidání bitů zprávy
      data[channelIndex] = clearedValue | messageBitsBlock;
    }
  }

  // Vytvoření nové ImageData s ukrytou zprávou
  const stegoImageData = new ImageData(data, canvas.width, canvas.height);
  return stegoImageData;
}

/**
 * Odkrytí textu z obrázku ukrytého metodou LSB
 * @param {HTMLCanvasElement} canvas - Plátno s obrázkem obsahujícím ukrytý text
 * @param {number} bitsPerChannel - Počet bitů použitých na jeden kanál (1-3, výchozí 1)
 * @return {string} - Odkrytý text
 */
export async function revealTextFromImage(canvas, bitsPerChannel = 1) {
  if (bitsPerChannel < 1 || bitsPerChannel > 3) {
    throw new Error('Počet bitů na kanál musí být mezi 1 a 3');
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let binaryData = '';
  let headerFound = false; // True if "TEXT:length:" is found
  let messageLength = 0; // Length from the "TEXT:length:" header
  let stringBeingBuilt = ''; // Accumulates ALL characters decoded from LSB
  let actualMessageContentAfterTextHeader = ''; // Stores content *after* a "TEXT:length:" header

  // Max characters to actively search for "TEXT:length:" header.
  // After this, if not found, we assume it's not a "TEXT:" message or it's something else.
  const maxHeaderSearchThreshold = 200; // Characters

  // An approximate upper limit to prevent excessively long loops on malformed data.
  // Add maxHeaderSearchThreshold to ensure we can read at least that many chars if the image is small.
  const maxTotalCharsToDecode = Math.floor((canvas.width * canvas.height * 3 * bitsPerChannel) / 8) + maxHeaderSearchThreshold;

  for (let i = 0; i < data.length; i += 4) {
    // Iterate over pixels
    // Early exit conditions
    if (stringBeingBuilt.length >= maxTotalCharsToDecode && !headerFound) break; // Safety break if no TEXT header found
    if (headerFound && actualMessageContentAfterTextHeader.length >= messageLength) break; // TEXT message complete

    for (let j = 0; j < 3; j++) {
      // Iterate over RGB channels
      if (stringBeingBuilt.length >= maxTotalCharsToDecode && !headerFound) break;
      if (headerFound && actualMessageContentAfterTextHeader.length >= messageLength) break;

      const channelIndex = i + j;
      if (channelIndex >= data.length) break; // Safety check for data boundary
      const channelValue = data[channelIndex];

      for (let k = bitsPerChannel - 1; k >= 0; k--) {
        // Iterate over LSBs in the channel
        const bit = (channelValue & (1 << k)) >> k;
        binaryData += bit;

        if (binaryData.length === 8) {
          // A full byte is assembled
          const char = String.fromCharCode(parseInt(binaryData, 2));
          binaryData = ''; // Reset for the next byte's bits

          stringBeingBuilt += char; // Always add to the raw decoded string

          if (!headerFound) {
            // Only attempt to parse TEXT header if we haven't found it yet
            // and we are within a reasonable length for a header.
            if (stringBeingBuilt.length <= maxHeaderSearchThreshold) {
              const headerMatch = stringBeingBuilt.match(/^TEXT:(\d+):/);
              if (headerMatch) {
                headerFound = true;
                messageLength = parseInt(headerMatch[1]);
                // Initialize actualMessageContentAfterTextHeader with what's after the header
                actualMessageContentAfterTextHeader = stringBeingBuilt.substring(headerMatch[0].length);

                // If the message (after header) is already complete
                if (actualMessageContentAfterTextHeader.length >= messageLength) {
                  return actualMessageContentAfterTextHeader.substring(0, messageLength);
                }
              }
            }
            // If no TEXT header found yet (or passed threshold), stringBeingBuilt just keeps accumulating.
            // This is important for "ENCRYPTED:..." type data or raw data.
          } else {
            // TEXT header was found, so append the current char to its specific content string
            actualMessageContentAfterTextHeader += char;
            if (actualMessageContentAfterTextHeader.length >= messageLength) {
              return actualMessageContentAfterTextHeader.substring(0, messageLength);
            }
          }
        }
      }
      if (stringBeingBuilt.length >= maxTotalCharsToDecode && !headerFound) break;
      if (headerFound && actualMessageContentAfterTextHeader.length >= messageLength) break;
    }
  }

  // After the loop, determine what to return
  if (headerFound) {
    // "TEXT:length:" header was found and parsed
    if (actualMessageContentAfterTextHeader.length < messageLength) {
      throw new Error('Nebyla odhalena kompletní zpráva (po TEXT: hlavičce), data mohou být poškozená nebo nekompletní.');
    }
    return actualMessageContentAfterTextHeader.substring(0, messageLength);
  } else {
    // No "TEXT:length:" header was found.
    // Return the entire string that was built. This could be an "ENCRYPTED:..." string,
    // or just raw data if no specific header was present.
    // If stringBeingBuilt is empty, it means no valid characters were decoded (or image was empty).
    return stringBeingBuilt;
  }
}

/**
 * Ukrytí obrázku do obrázku pomocí LSB metody
 * @param {HTMLCanvasElement} baseCanvas - Plátno s originálním (nosným) obrázkem
 * @param {HTMLCanvasElement} secretCanvas - Plátno s tajným obrázkem
 * @param {number} bitsPerChannel - Počet bitů použitých na jeden kanál (1-3, výchozí 1)
 * @return {Uint8ClampedArray} - ImageData s ukrytým obrázkem
 */
export async function hideImageInImage(baseCanvas, secretCanvas, bitsPerChannel = 1) {
  if (bitsPerChannel < 1 || bitsPerChannel > 3) {
    throw new Error('Počet bitů na kanál musí být mezi 1 a 3');
  }

  const baseCtx = baseCanvas.getContext('2d');
  const secretCtx = secretCanvas.getContext('2d');

  // Získání dat obrázků
  const baseImageData = baseCtx.getImageData(0, 0, baseCanvas.width, baseCanvas.height);
  const baseData = baseImageData.data;

  // Změna velikosti tajného obrázku, aby se vešel do nosného
  const secretData = resizeSecretImageData(secretCanvas, baseCanvas, bitsPerChannel);

  // Výpočet kapacity (kolik bitů můžeme ukrýt)
  // Počítáme 3 kanály (R,G,B) na pixel, alfa kanál nepoužijeme
  const basePixelCount = baseCanvas.width * baseCanvas.height;
  const availableBits = basePixelCount * 3 * bitsPerChannel;

  // Kolik bitů potřebujeme pro tajný obrázek
  // Přidáváme hlavičku "IMG:šířka:výška:"
  const header = `IMG:${secretCanvas.width}:${secretCanvas.height}:`;
  const headerBinary = textToBinary(header);

  // Počet bitů dat tajného obrázku (RGB kanály, bez alfa)
  const secretDataBits = secretData.length * 8;

  const totalBitsNeeded = headerBinary.length + secretDataBits;

  if (totalBitsNeeded > availableBits) {
    throw new Error(`Tajný obrázek je příliš velký pro tento nosný obrázek. Snižte velikost tajného obrázku nebo použijte větší nosný obrázek.`);
  }

  // Kombinace hlavičky a dat tajného obrázku
  const binaryMessage = headerBinary + arrayToBinary(secretData);

  // Ukrytí dat v pixelech
  let bitIndex = 0;
  const mask = getMask(bitsPerChannel);

  for (let i = 0; i < baseData.length; i += 4) {
    if (bitIndex >= binaryMessage.length) break;

    // Modifikace RGB kanálů (ne alfa)
    for (let j = 0; j < 3; j++) {
      if (bitIndex >= binaryMessage.length) break;

      const channelIndex = i + j;
      const channelValue = baseData[channelIndex];

      // Odstranění nejméně významných bitů
      const clearedValue = channelValue & ~mask;

      // Vytvoření binárního bloku z binaryMessage
      let messageBitsBlock = 0;
      for (let k = 0; k < bitsPerChannel; k++) {
        if (bitIndex < binaryMessage.length) {
          messageBitsBlock = (messageBitsBlock << 1) | parseInt(binaryMessage[bitIndex], 10);
          bitIndex++;
        }
      }

      // Přidání bitů zprávy
      baseData[channelIndex] = clearedValue | messageBitsBlock;
    }
  }

  // Vytvoření nové ImageData s ukrytým obrázkem
  const stegoImageData = new ImageData(baseData, baseCanvas.width, baseCanvas.height);
  return stegoImageData;
}

/**
 * Odkrytí obrázku z obrázku ukrytého metodou LSB
 * @param {HTMLCanvasElement} canvas - Plátno s obrázkem obsahujícím ukrytý obrázek
 * @param {number} bitsPerChannel - Počet bitů použitých na jeden kanál (1-3, výchozí 1)
 * @return {ImageData} - Odkrytý obrázek jako ImageData
 */
export async function revealImageFromImage(canvas, bitsPerChannel = 1) {
  if (bitsPerChannel < 1 || bitsPerChannel > 3) {
    throw new Error('Počet bitů na kanál musí být mezi 1 a 3');
  }

  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const mask = getMask(bitsPerChannel);

  // Extrahování binárních dat
  let binaryData = '';
  let headerText = '';
  let headerFound = false;
  let secretWidth = 0;
  let secretHeight = 0;
  let byteCount = 0;
  const maxBytesToCheck = 10000; // Pro prevenci nekonečné smyčky

  // Extrakce hlavičky pro zjištění velikosti ukrytého obrázku
  for (let i = 0; i < data.length; i += 4) {
    if (byteCount > maxBytesToCheck && !headerFound) {
      throw new Error('Hlavička obrázku nebyla nalezena.');
    }

    // Extrakce z RGB kanálů (ne alfa)
    for (let j = 0; j < 3; j++) {
      const channelIndex = i + j;
      const channelValue = data[channelIndex];

      // Extrakce nejméně významných bitů
      for (let k = bitsPerChannel - 1; k >= 0; k--) {
        const bit = (channelValue & (1 << k)) >> k;
        binaryData += bit;

        // Kontrola, zda máme dost bitů pro jeden bajt
        if (binaryData.length % 8 === 0) {
          const char = String.fromCharCode(parseInt(binaryData.substr(-8), 2));
          headerText += char;
          byteCount++;

          // Hledáme hlavičku "IMG:šířka:výška:"
          if (headerText.includes('IMG:')) {
            const matches = headerText.match(/IMG:(\d+):(\d+):/);
            if (matches && matches.length === 3) {
              headerFound = true;
              secretWidth = parseInt(matches[1]);
              secretHeight = parseInt(matches[2]);

              // Resetujeme binaryData pro sběr dat obrázku
              binaryData = '';

              // Najdeme konec hlavičky
              const headerEndIndex = headerText.indexOf(':', headerText.indexOf(':', headerText.indexOf(':') + 1) + 1);

              // Přejdeme na extrakci dat obrázku
              if (headerEndIndex !== -1) {
                // Skočíme na další bajt po konci hlavičky
                i = Math.floor(((headerEndIndex + 1) * 8) / (3 * bitsPerChannel)) * 4;
                j = (((headerEndIndex + 1) * 8) % (3 * bitsPerChannel)) / bitsPerChannel;
                break;
              }
            }
          }
        }
      }

      if (headerFound) break;
    }

    if (headerFound) break;
  }

  if (!headerFound) {
    throw new Error('V obrázku nebyl nalezen žádný ukrytý obrázek.');
  }

  // Extrakce dat ukrytého obrázku
  binaryData = '';
  const secretDataSize = secretWidth * secretHeight * 4; // RGBA pro každý pixel
  const extractedBytes = new Uint8ClampedArray(secretDataSize);
  let extractedIndex = 0;

  // Pokračujeme od pozice, kde jsme našli konec hlavičky
  for (
    let i = Math.floor(((headerText.indexOf(':', headerText.indexOf(':', headerText.indexOf(':') + 1) + 1) + 1) * 8) / (3 * bitsPerChannel)) * 4;
    i < data.length && extractedIndex < secretDataSize;
    i += 4
  ) {
    // Extrakce z RGB kanálů (ne alfa)
    for (let j = 0; j < 3 && extractedIndex < secretDataSize; j++) {
      const channelIndex = i + j;
      const channelValue = data[channelIndex];

      // Extrakce nejméně významných bitů
      for (let k = bitsPerChannel - 1; k >= 0; k--) {
        const bit = (channelValue & (1 << k)) >> k;
        binaryData += bit;

        // Kontrola, zda máme dost bitů pro jeden bajt
        if (binaryData.length === 8) {
          extractedBytes[extractedIndex] = parseInt(binaryData, 2);
          extractedIndex++;
          binaryData = '';

          if (extractedIndex >= secretDataSize) break;
        }
      }

      if (extractedIndex >= secretDataSize) break;
    }
  }

  // Vytvoření ImageData pro ukrytý obrázek
  return new ImageData(extractedBytes, secretWidth, secretHeight);
}

/**
 * Generování mapy rozdílů mezi dvěma obrázky pro vizualizaci
 * @param {ImageData} originalImageData - Původní obrázek
 * @param {ImageData} stegoImageData - Obrázek s ukrytými daty
 * @param {number} amplification - Faktor zesílení rozdílů (výchozí 20)
 * @return {ImageData} - Vizualizace rozdílů
 */
export async function generateDifferenceMap(originalImageData, stegoImageData, amplification = 20) {
  if (originalImageData.width !== stegoImageData.width || originalImageData.height !== stegoImageData.height) {
    throw new Error('Obrázky musí mít stejnou velikost pro generování mapy rozdílů.');
  }

  const width = originalImageData.width;
  const height = originalImageData.height;
  const diffData = new Uint8ClampedArray(originalImageData.data.length);

  for (let i = 0; i < originalImageData.data.length; i += 4) {
    // Vypočítání rozdílů v RGB kanálech
    const rDiff = Math.abs(originalImageData.data[i] - stegoImageData.data[i]) * amplification;
    const gDiff = Math.abs(originalImageData.data[i + 1] - stegoImageData.data[i + 1]) * amplification;
    const bDiff = Math.abs(originalImageData.data[i + 2] - stegoImageData.data[i + 2]) * amplification;

    // Nastavení RGB kanálů pro vizualizaci rozdílů
    // Červená složka zobrazuje rozdíly v R kanálu, zelená v G a modrá v B
    diffData[i] = Math.min(255, rDiff);
    diffData[i + 1] = Math.min(255, gDiff);
    diffData[i + 2] = Math.min(255, bDiff);
    diffData[i + 3] = 255; // Plná neprůhlednost
  }

  return new ImageData(diffData, width, height);
}

/**
 * Generování zvýrazněné vizualizace ukrytých dat
 * @param {ImageData} originalImageData - Původní obrázek
 * @param {ImageData} stegoImageData - Obrázek s ukrytými daty
 * @param {number} bitsPerChannel - Počet bitů použitých na jeden kanál
 * @return {ImageData} - Vizualizace rozdílů
 */
export async function generateEnhancedVisualization(originalImageData, stegoImageData, bitsPerChannel = 1) {
  const width = originalImageData.width;
  const height = originalImageData.height;
  const visualData = new Uint8ClampedArray(originalImageData.data.length);
  const mask = getMask(bitsPerChannel);
  const invMask = ~mask & 0xff;

  for (let i = 0; i < originalImageData.data.length; i += 4) {
    // Získání nejméně významných bitů
    const rLSB = stegoImageData.data[i] & mask;
    const gLSB = stegoImageData.data[i + 1] & mask;
    const bLSB = stegoImageData.data[i + 2] & mask;

    // Vizualizace: vytvoření vysokého kontrastu mezi původními a LSB bity
    visualData[i] = (stegoImageData.data[i] & invMask) | (rLSB === 0 ? 0 : 255);
    visualData[i + 1] = (stegoImageData.data[i + 1] & invMask) | (gLSB === 0 ? 0 : 255);
    visualData[i + 2] = (stegoImageData.data[i + 2] & invMask) | (bLSB === 0 ? 0 : 255);
    visualData[i + 3] = 255; // Plná neprůhlednost
  }

  return new ImageData(visualData, width, height);
}

/**
 * Získání masky pro LSB operace
 * @param {number} bitsPerChannel - Počet bitů použitých na jeden kanál
 * @return {number} - Binární maska
 */
function getMask(bitsPerChannel) {
  let mask = 0;
  for (let i = 0; i < bitsPerChannel; i++) {
    mask = (mask << 1) | 1;
  }
  return mask;
}

/**
 * Převod textu na binární řetězec
 * @param {string} text - Text k převodu
 * @return {string} - Binární řetězec
 */
function textToBinary(text) {
  let binary = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    binary += charCode.toString(2).padStart(8, '0');
  }
  return binary;
}

/**
 * Převod pole bajtů na binární řetězec
 * @param {Uint8ClampedArray} array - Pole bajtů k převodu
 * @return {string} - Binární řetězec
 */
function arrayToBinary(array) {
  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += array[i].toString(2).padStart(8, '0');
  }
  return binary;
}

/**
 * Změna velikosti tajného obrázku, pokud je to potřeba
 * @param {HTMLCanvasElement} secretCanvas - Tajný obrázek
 * @param {HTMLCanvasElement} baseCanvas - Nosný obrázek
 * @param {number} bitsPerChannel - Počet bitů použitých na jeden kanál
 * @return {Uint8ClampedArray} - Pole bajtů tajného obrázku
 */
function resizeSecretImageData(secretCanvas, baseCanvas, bitsPerChannel) {
  const secretCtx = secretCanvas.getContext('2d');
  if (!secretCtx) {
    console.error('Could not get 2D context for secret canvas');
    return secretCanvas.getContext('2d').getImageData(0, 0, secretCanvas.width, secretCanvas.height).data;
  }

  // Get the original image data
  const secretImageData = secretCtx.getImageData(0, 0, secretCanvas.width, secretCanvas.height);

  // Calculate header size (IMG:width:height:)
  const headerSize = `IMG:${secretCanvas.width}:${secretCanvas.height}:`.length * 8;

  // Calculate capacity in bits (3 channels * bits per pixel * total pixels - header size)
  const baseCapacity = Math.floor(baseCanvas.width * baseCanvas.height * 3 * bitsPerChannel) - headerSize;

  // Calculate secret image size in bits (4 bytes per pixel * 8 bits per byte * total pixels)
  // We're only using RGB channels, so it's actually 3 bytes per pixel
  const secretSize = secretCanvas.width * secretCanvas.height * 3 * 8;

  console.log('Image capacity check:', {
    baseImageSize: `${baseCanvas.width}x${baseCanvas.height}`,
    secretImageSize: `${secretCanvas.width}x${secretCanvas.height}`,
    baseCapacity: `${Math.floor(baseCapacity / 8)} bytes`,
    secretSize: `${Math.floor(secretSize / 8)} bytes`,
    willFit: secretSize <= baseCapacity,
    bitsPerChannel
  });

  console.log(secretSize);
  console.log(baseCapacity);

  // If the secret image is too large, resize it
  if (secretSize > baseCapacity) {
    // Calculate resize factor (with safety margin)
    const resizeFactor = Math.sqrt((baseCapacity / secretSize) * 0.5);

    // Calculate new dimensions ensuring they're at least 1x1
    const newWidth = Math.max(1, Math.floor(secretCanvas.width * resizeFactor));
    const newHeight = Math.max(1, Math.floor(secretCanvas.height * resizeFactor));

    console.log(`Resizing image from ${secretCanvas.width}x${secretCanvas.height} to ${newWidth}x${newHeight} (factor: ${resizeFactor.toFixed(2)})`);

    // Create a temporary canvas for resizing
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = newWidth;
    resizedCanvas.height = newHeight;

    // Draw the original image at the new size
    const resizedCtx = resizedCanvas.getContext('2d');
    if (!resizedCtx) {
      console.error('Could not get context for resize canvas');
      return secretImageData.data;
    }

    // Enable high quality resizing
    resizedCtx.imageSmoothingEnabled = true;
    resizedCtx.imageSmoothingQuality = 'high';
    resizedCtx.drawImage(secretCanvas, 0, 0, secretCanvas.width, secretCanvas.height, 0, 0, newWidth, newHeight);

    // Update the original secret canvas for the UI
    secretCanvas.width = newWidth;
    secretCanvas.height = newHeight;
    secretCtx.drawImage(resizedCanvas, 0, 0);

    return secretCtx.getImageData(0, 0, newWidth, newHeight).data;
  }

  // If no resize needed, return the original image data
  return secretImageData.data;
}

/**
 * Peeks at the initial characters hidden in an image canvas.
 * @param {HTMLCanvasElement} canvas - The canvas to read from.
 * @param {number} bitsPerChannel - Bits used per channel for LSB.
 * @param {number} charLimit - Maximum number of characters to reveal.
 * @returns {Promise<string>} The initial revealed characters.
 */
export async function peekInitialTextFromImage(canvas, bitsPerChannel = 1, charLimit = 50) {
  if (!canvas) return '';
  // Ensure context can be obtained. In a component, canvas might not be ready.
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    console.warn('peekInitialTextFromImage: Could not get canvas context.');
    return '';
  }
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let binaryData = '';
  let revealedChars = '';

  for (let i = 0; i < data.length; i += 4) {
    if (revealedChars.length >= charLimit) break;
    for (let j = 0; j < 3; j++) {
      // RGB channels
      if (revealedChars.length >= charLimit) break;
      const channelIndex = i + j;
      if (channelIndex >= data.length) break; // Boundary check
      const channelValue = data[channelIndex];
      for (let k = bitsPerChannel - 1; k >= 0; k--) {
        const bit = (channelValue & (1 << k)) >> k;
        binaryData += bit;
        if (binaryData.length === 8) {
          revealedChars += String.fromCharCode(parseInt(binaryData, 2));
          binaryData = '';
          if (revealedChars.length >= charLimit) break;
        }
      }
      if (revealedChars.length >= charLimit) break;
    }
  }
  return revealedChars;
}
