const END_OF_MESSAGE_DELIMITER_BINARY = '0000000000000000'; // 16 zeros, 2 bytes
const MAGIC_HEADER = 'STEGANOAUDIO1';
const MAGIC_HEADER_BASE64 = btoa(MAGIC_HEADER);

/**
 * Converts text to Base64, then to binary string.
 * This adds an extra layer of encoding that makes the data more robust.
 * @param {string} text The input text.
 * @returns {string} The binary string representation.
 */
function textToBinary(text) {
  // First convert text to Base64
  const base64 = btoa(text);

  // Then convert Base64 string to binary
  return Array.from(base64)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

/**
 * Converts a binary string back to text via Base64.
 * @param {string} binary The input binary string.
 * @returns {string} The decoded text.
 */
function binaryToText(binary) {
  let base64 = '';

  // Convert binary to Base64 string
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substring(i, i + 8);
    if (byte.length === 8) {
      base64 += String.fromCharCode(parseInt(byte, 2));
    }
  }

  try {
    // Decode the Base64 back to text
    return atob(base64);
  } catch (e) {
    console.error('Error decoding Base64:', e);
    return base64; // Return the Base64 if decoding fails
  }
}

/**
 * Hides a message within an AudioBuffer using LSB steganography.
 * @param {AudioBuffer} originalAudioBuffer The original audio data.
 * @param {string} message The message to hide.
 * @returns {AudioBuffer} A new AudioBuffer with the hidden message, or null if message is too long.
 */
export function hideInAudio(originalAudioBuffer, message) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const messageWithHeader = MAGIC_HEADER + message;
  console.log('[AUDIO ENCODE] Encoding message with magic header:', MAGIC_HEADER, '| Message:', message);
  const messageBinary = textToBinary(messageWithHeader) + END_OF_MESSAGE_DELIMITER_BINARY;

  const channelData = originalAudioBuffer.getChannelData(0); // Use the first channel
  const numSamples = channelData.length;

  if (messageBinary.length > numSamples) {
    console.error('[AUDIO ENCODE] Message is too long to hide in this audio. Length:', messageBinary.length, 'Samples available:', numSamples);
    return null;
  }

  // Create a new AudioBuffer to store the modified data
  const stegoAudioBuffer = audioContext.createBuffer(originalAudioBuffer.numberOfChannels, originalAudioBuffer.length, originalAudioBuffer.sampleRate);

  // Copy original data to all channels of the new buffer
  for (let i = 0; i < originalAudioBuffer.numberOfChannels; i++) {
    stegoAudioBuffer.copyToChannel(originalAudioBuffer.getChannelData(i), i);
  }

  const newChannelData = stegoAudioBuffer.getChannelData(0); // Modify the first channel

  // Skip the first 200 samples to avoid header modifications that might be more noticeable
  const startOffset = 200;

  for (let i = 0; i < messageBinary.length; i++) {
    const bit = parseInt(messageBinary[i], 10);

    // Add offset to avoid header area
    const sampleIndex = i + startOffset;

    if (sampleIndex < numSamples) {
      const floatSample = newChannelData[sampleIndex];

      // Quantize to 16-bit range, modify LSB, then de-quantize
      let intSample = Math.round(floatSample * 32767);

      // Clear LSB and set the new bit
      intSample = (intSample & 0xfffe) | bit;

      newChannelData[sampleIndex] = Math.max(-1.0, Math.min(1.0, intSample / 32767));
    }
  }
  console.log('[AUDIO ENCODE] Message successfully encoded. Total bits:', messageBinary.length, 'Header:', MAGIC_HEADER, 'Header (Base64):', MAGIC_HEADER_BASE64);

  return stegoAudioBuffer;
}

/**
 * Reveals a hidden message from an AudioBuffer using LSB steganography.
 * @param {AudioBuffer} stegoAudioBuffer The AudioBuffer containing the hidden message.
 * @returns {string} The revealed message, or null if no message is found or header is missing.
 */
export function revealFromAudio(stegoAudioBuffer) {
  const channelData = stegoAudioBuffer.getChannelData(0); // Use the first channel
  const numSamples = channelData.length;
  let revealedBits = '';
  let bitBuffer = '';

  // Skip the first 200 samples to match the hide function
  const startOffset = 200;

  for (let i = startOffset; i < numSamples; i++) {
    const floatSample = channelData[i];
    const intSample = Math.round(floatSample * 32767);
    const lsb = intSample & 1;

    revealedBits += lsb.toString();
    bitBuffer += lsb.toString();

    if (bitBuffer.length > END_OF_MESSAGE_DELIMITER_BINARY.length) {
      bitBuffer = bitBuffer.substring(1); // Keep buffer size same as delimiter
    }

    if (bitBuffer === END_OF_MESSAGE_DELIMITER_BINARY) {
      // Remove delimiter from revealedBits
      const messageWithoutDelimiter = revealedBits.substring(0, revealedBits.length - END_OF_MESSAGE_DELIMITER_BINARY.length);
      const decoded = binaryToText(messageWithoutDelimiter);
      if (!decoded) {
        console.warn('[AUDIO DECODE] Decoded message is empty. Possibly lost due to file format or corruption.');
        return null;
      }
      if (!decoded.startsWith(MAGIC_HEADER)) {
        console.warn('[AUDIO DECODE] Magic header not found. This audio likely does not contain a valid hidden message. Decoded:', decoded);
        return null;
      }
      const revealed = decoded.substring(MAGIC_HEADER.length);
      console.log('[AUDIO DECODE] Magic header found. Revealed message:', revealed);
      return revealed;
    }
  }

  console.warn('[AUDIO DECODE] End of message delimiter not found. No message extracted.');
  return null; // Delimiter not found
}
