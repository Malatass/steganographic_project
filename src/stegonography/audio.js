const END_OF_MESSAGE_DELIMITER_BINARY = '0000000000000000'; // 16 nul, 2 bajty
const MAGIC_HEADER = 'STEGANOAUDIO1';

/**
 * Převádí text na binární řetězec reprezentující jeho kódování v UTF-8, převedeného do Base64.
 * @param {string} text Vstupní text.
 * @returns {string} Binární řetězec.
 */
function textToBinary(text) {
  // Krok 1: Kódování textu do UTF-8 bajtů
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(text); // Uint8Array

  // Krok 2: Převod UTF-8 bajtů na Base64 řetězec
  // Nejprve převedeme Uint8Array na řetězec, kde každý znak odpovídá hodnotě bajtu
  let binaryStringForBtoa = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryStringForBtoa += String.fromCharCode(utf8Bytes[i]);
  }
  const base64Encoded = btoa(binaryStringForBtoa); // base64Encoded obsahuje pouze A-Z, a-z, 0-9, +, /, =

  // Krok 3: Převod Base64 řetězce na binární řetězec (sekvence '0' a '1')
  return Array.from(base64Encoded)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

/**
 * Převádí binární řetězec (reprezentující UTF-8 kódovaná Base64 data) zpět na text.
 * @param {string} binary Vstupní binární řetězec (sekvence '0' a '1').
 * @returns {string|null} Dekódovaný text nebo null při selhání dekódování.
 */
function binaryToText(binary) {
  let base64Chars = '';
  // Krok 1: Převod binárního řetězce (sekvence '0'/'1') zpět na Base64 řetězec
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substring(i, i + 8);
    if (byte.length === 8) {
      base64Chars += String.fromCharCode(parseInt(byte, 2));
    } else {
      // Doplnění posledního bajtu nulami pro úplný bajt
      const paddedByte = byte.padEnd(8, '0');
      base64Chars += String.fromCharCode(parseInt(paddedByte, 2));
    }
  }

  try {
    // Krok 2: Dekódování Base64 řetězce na "binární řetězec" (řetězec původních hodnot bajtů)
    const decodedBinaryString = atob(base64Chars); // Může vyhodit InvalidCharacterError

    // Krok 3: Převod "binárního řetězce" na Uint8Array
    const bytes = new Uint8Array(decodedBinaryString.length);
    for (let i = 0; i < decodedBinaryString.length; i++) {
      bytes[i] = decodedBinaryString.charCodeAt(i);
    }

    // Krok 4: Dekódování Uint8Array (jako UTF-8) zpět na původní text
    const decoder = new TextDecoder('utf-8', { fatal: true }); // fatal: true vyhodí chybu při neplatném UTF-8
    return decoder.decode(bytes);
  } catch (e) {
    console.error(`Chyba při převodu binárních dat na text: ${e.message}. Problematický Base64 řetězec (nebo část): "${base64Chars.substring(0, 100)}..."`);
    return null; // Indikace selhání
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
    console.error('[AUDIO KÓDOVÁNÍ] Zpráva je příliš dlouhá pro kapacitu audia:', {
      délkaZprávy: message.length,
      délkaBinárně: messageBinary.length,
      potřebnéVzorky: requiredSamples,
      dostupnéVzorky: availableSamples,
      délkaTrvání: originalAudioBuffer.duration,
      vzorkovacíFrekvence: originalAudioBuffer.sampleRate
    });
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
          '[AUDIO DEKÓDOVÁNÍ] Nepodařilo se dekódovat binární data na text. Data mohou být poškozená, nejsou platný Base64/UTF-8 formát, nebo LSB bity nebyly správně získány.'
        );
        return null;
      }

      if (!decodedTextWithHeader.startsWith(MAGIC_HEADER)) {
        console.warn(
          `[AUDIO DEKÓDOVÁNÍ] Magická hlavička nebyla nalezena. Očekávána "${MAGIC_HEADER}", ale zpracování poskytlo data začínající jinak. Dekódovaná data (začátek): "${decodedTextWithHeader.substring(0, MAGIC_HEADER.length + 10)}..."`
        );
        return null;
      }

      const revealedMessage = decodedTextWithHeader.substring(MAGIC_HEADER.length);
      return revealedMessage;
    }
  }

  console.warn('[AUDIO DEKÓDOVÁNÍ] Oddělovač konce zprávy nebyl nalezen. Žádná zpráva nebyla extrahována.');
  return null; // Oddělovač nebyl nalezen
}
