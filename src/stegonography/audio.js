const END_OF_MESSAGE_DELIMITER_BINARY = '0000000000000000'; // 16 zeros, 2 bytes
const MAGIC_HEADER = 'STEGANOAUDIO1';

/**
 * Converts text to a binary string representation of its UTF-8 encoded, Base64 version.
 * @param {string} text The input text.
 * @returns {string} The binary string representation.
 */
function textToBinary(text) {
  // Step 1: Encode text to UTF-8 bytes
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(text); // Uint8Array

  // Step 2: Convert UTF-8 bytes to a Base64 string
  // First, convert Uint8Array to a string where each character's code is a byte value
  let binaryStringForBtoa = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryStringForBtoa += String.fromCharCode(utf8Bytes[i]);
  }
  const base64Encoded = btoa(binaryStringForBtoa); // base64Encoded now contains only A-Z, a-z, 0-9, +, /, =

  // Step 3: Convert the Base64 string to a binary string (sequence of '0' and '1')
  return Array.from(base64Encoded)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

/**
 * Converts a binary string (representing UTF-8 encoded, Base64 data) back to text.
 * @param {string} binary The input binary string (sequence of '0's and '1's).
 * @returns {string|null} The decoded text, or null if decoding fails.
 */
function binaryToText(binary) {
  let base64Chars = '';
  // Step 1: Convert binary string (sequence of '0'/'1') back to Base64 string
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substring(i, i + 8);
    if (byte.length === 8) {
      base64Chars += String.fromCharCode(parseInt(byte, 2));
    } else {
      // Pad the last byte with zeros to make it a complete byte
      const paddedByte = byte.padEnd(8, '0');
      base64Chars += String.fromCharCode(parseInt(paddedByte, 2));
    }
  }

  try {
    // Step 2: Decode Base64 string to "binary string" (string of original byte values)
    const decodedBinaryString = atob(base64Chars); // Can throw InvalidCharacterError

    // Step 3: Convert "binary string" to Uint8Array
    const bytes = new Uint8Array(decodedBinaryString.length);
    for (let i = 0; i < decodedBinaryString.length; i++) {
      bytes[i] = decodedBinaryString.charCodeAt(i);
    }

    // Step 4: Decode Uint8Array (as UTF-8) back to original text
    const decoder = new TextDecoder('utf-8', { fatal: true }); // fatal: true throws on invalid UTF-8
    return decoder.decode(bytes);
  } catch (e) {
    console.error(`Error in binaryToText: ${e.message}. Problematic Base64 string (or part of it): "${base64Chars.substring(0, 100)}..."`);
    return null; // Indicate failure
  }
}

/**
 * Skrývá zprávu v rámci AudioBuffer pomocí LSB steganografie.
 * @param {AudioBuffer} originalAudioBuffer Původní audio data.
 * @param {string} message Zpráva k ukrytí.
 * @returns {AudioBuffer} Nový AudioBuffer s ukrytou zprávou, nebo null pokud je zpráva příliš dlouhá.
 */
export function hideInAudio(originalAudioBuffer, message) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const messageWithHeader = MAGIC_HEADER + message;
  const messageBinary = textToBinary(messageWithHeader) + END_OF_MESSAGE_DELIMITER_BINARY;

  const channelData = originalAudioBuffer.getChannelData(0); // Použít první kanál
  const numSamples = channelData.length;

  // Vynechání prvních 200 vzorků + délka zprávy pro kontrolu kapacity
  const startOffset = 200;
  const requiredSamples = messageBinary.length;
  const availableSamples = numSamples - startOffset;

  if (requiredSamples > availableSamples) {
    console.error(
      '[AUDIO ENCODE] Message too long for audio capacity:',
      {
        messageLength: message.length,
        binaryLength: messageBinary.length,
        requiredSamples,
        availableSamples,
        audioDuration: originalAudioBuffer.duration,
        sampleRate: originalAudioBuffer.sampleRate
      }
    );
    return null;
  }

  // Vytvoření nového AudioBuffer pro uložení upravených dat
  const stegoAudioBuffer = audioContext.createBuffer(originalAudioBuffer.numberOfChannels, originalAudioBuffer.length, originalAudioBuffer.sampleRate);

  // Kopírování původních dat do všech kanálů nového bufferu
  for (let i = 0; i < originalAudioBuffer.numberOfChannels; i++) {
    stegoAudioBuffer.copyToChannel(originalAudioBuffer.getChannelData(i), i);
  }

  const newChannelData = stegoAudioBuffer.getChannelData(0); // Úprava prvního kanálu

  for (let i = 0; i < messageBinary.length; i++) {
    const bit = parseInt(messageBinary[i], 10);
    const sampleIndex = i + startOffset;

    if (sampleIndex < numSamples) {
      const floatSample = newChannelData[sampleIndex];
      let intSample;

      // Přesnější kvantizace s ohledem na asymetrický rozsah 16-bit PCM
      if (floatSample < 0) {
        intSample = Math.round(floatSample * 32768);
      } else {
        intSample = Math.round(floatSample * 32767);
      }
      // Ořezání na platný 16-bitový rozsah
      intSample = Math.max(-32768, Math.min(32767, intSample));

      // Vyčištění LSB a nastavení nového bitu
      intSample = (intSample & 0xfffe) | bit;

      // De-kvantizace zpět na float
      let newFloatSample;
      if (intSample < 0) {
        newFloatSample = intSample / 32768.0;
      } else {
        newFloatSample = intSample / 32767.0;
      }
      // Zajistit, že hodnota zůstane v rozsahu [-1.0, 1.0]
      newChannelData[sampleIndex] = Math.max(-1.0, Math.min(1.0, newFloatSample));
    }
  }

  return stegoAudioBuffer;
}

/**
 * Odkrývá skrytou zprávu z AudioBuffer pomocí LSB steganografie.
 * @param {AudioBuffer} stegoAudioBuffer AudioBuffer obsahující skrytou zprávu.
 * @returns {string} Odkrytá zpráva, nebo null pokud nebyla zpráva nalezena nebo chybí hlavička.
 */
export function revealFromAudio(stegoAudioBuffer) {
  const channelData = stegoAudioBuffer.getChannelData(0); // Použít první kanál
  const numSamples = channelData.length;
  let revealedBits = '';
  let bitBuffer = '';

  const startOffset = 200;

  for (let i = startOffset; i < numSamples; i++) {
    const floatSample = channelData[i];
    let intSample;

    // Přesnější kvantizace s ohledem na asymetrický rozsah 16-bit PCM
    if (floatSample < 0) {
      intSample = Math.round(floatSample * 32768);
    } else {
      intSample = Math.round(floatSample * 32767);
    }
    // Ořezání na platný 16-bitový rozsah
    intSample = Math.max(-32768, Math.min(32767, intSample));

    const lsb = intSample & 1;

    revealedBits += lsb.toString();
    bitBuffer += lsb.toString();

    if (bitBuffer.length > END_OF_MESSAGE_DELIMITER_BINARY.length) {
      bitBuffer = bitBuffer.substring(1); // Udržení velikosti bufferu stejné jako oddělovač
    }

    if (bitBuffer === END_OF_MESSAGE_DELIMITER_BINARY) {
      // Odstranění oddělovače z revealedBits
      const messageBinaryWithoutDelimiter = revealedBits.substring(0, revealedBits.length - END_OF_MESSAGE_DELIMITER_BINARY.length);

      const decodedTextWithHeader = binaryToText(messageBinaryWithoutDelimiter);

      if (!decodedTextWithHeader) {
        console.warn(
          '[AUDIO DECODE] Failed to decode binary data to text. The data might be corrupted, not valid Base64/UTF-8, or the LSBs were not retrieved correctly.'
        );
        return null;
      }

      if (!decodedTextWithHeader.startsWith(MAGIC_HEADER)) {
        console.warn(
          `[AUDIO DECODE] Magic header not found. Expected "${MAGIC_HEADER}" but processing yielded data starting differently. Decoded data (start): "${decodedTextWithHeader.substring(0, MAGIC_HEADER.length + 10)}..."`
        );
        return null;
      }

      const revealedMessage = decodedTextWithHeader.substring(MAGIC_HEADER.length);
      return revealedMessage;
    }
  }

  console.warn('[AUDIO DECODE] Oddělovač konce zprávy nebyl nalezen. Žádná zpráva nebyla extrahována.');
  return null; // Oddělovač nebyl nalezen
}
