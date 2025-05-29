const END_OF_MESSAGE_DELIMITER_BINARY = '0000000000000000'; // 16 zeros, 2 bytes

/**
 * Converts text to a binary string.
 * @param {string} text The input text.
 * @returns {string} The binary string representation.
 */
function textToBinary(text) {
  return Array.from(text)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

/**
 * Converts a binary string to text.
 * @param {string} binary The input binary string.
 * @returns {string} The decoded text.
 */
function binaryToText(binary) {
  let text = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substring(i, i + 8);
    if (byte.length === 8) {
      text += String.fromCharCode(parseInt(byte, 2));
    }
  }
  return text;
}

/**
 * Hides a message within an AudioBuffer using LSB steganography.
 * @param {AudioBuffer} originalAudioBuffer The original audio data.
 * @param {string} message The message to hide.
 * @returns {AudioBuffer} A new AudioBuffer with the hidden message, or null if message is too long.
 */
export function hideInAudio(originalAudioBuffer, message) {
  const audioContext = new (window.AudioContext || window.AudioContext)();
  const messageBinary = textToBinary(message) + END_OF_MESSAGE_DELIMITER_BINARY;

  const channelData = originalAudioBuffer.getChannelData(0); // Use the first channel
  const numSamples = channelData.length;

  if (messageBinary.length > numSamples) {
    console.error('Message is too long to hide in this audio.');
    return null;
  }

  // Create a new AudioBuffer to store the modified data
  const stegoAudioBuffer = audioContext.createBuffer(originalAudioBuffer.numberOfChannels, originalAudioBuffer.length, originalAudioBuffer.sampleRate);

  // Copy original data to all channels of the new buffer
  for (let i = 0; i < originalAudioBuffer.numberOfChannels; i++) {
    stegoAudioBuffer.copyToChannel(originalAudioBuffer.getChannelData(i), i);
  }

  const newChannelData = stegoAudioBuffer.getChannelData(0); // Modify the first channel

  for (let i = 0; i < messageBinary.length; i++) {
    const bit = parseInt(messageBinary[i], 10);
    const floatSample = newChannelData[i];

    // Quantize to 16-bit range, modify LSB, then de-quantize
    let intSample = Math.round(floatSample * 32767);

    // Clear LSB and set the new bit
    intSample = (intSample & 0xfffe) | bit;

    newChannelData[i] = Math.max(-1.0, Math.min(1.0, intSample / 32767));
  }
  return stegoAudioBuffer;
}

/**
 * Reveals a hidden message from an AudioBuffer using LSB steganography.
 * @param {AudioBuffer} stegoAudioBuffer The AudioBuffer containing the hidden message.
 * @returns {string} The revealed message, or null if no message is found.
 */
export function revealFromAudio(stegoAudioBuffer) {
  const channelData = stegoAudioBuffer.getChannelData(0); // Use the first channel
  const numSamples = channelData.length;
  let revealedBits = '';
  let bitBuffer = '';

  for (let i = 0; i < numSamples; i++) {
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
      return binaryToText(revealedBits.substring(0, revealedBits.length - END_OF_MESSAGE_DELIMITER_BINARY.length));
    }
  }
  console.warn('End of message delimiter not found.');
  return null; // Delimiter not found
}
