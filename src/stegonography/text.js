const DEFAULT_START_DELIMITER = '{{START}}';
const DEFAULT_END_DELIMITER = '{{END}}';

/**
 * Ukrývání pomocí oddělovačů
 */
function hideWithDelimiters(originalText, secretMessage, startDelimiter, endDelimiter) {
  const useStartDelimiter = startDelimiter || DEFAULT_START_DELIMITER;
  const useEndDelimiter = endDelimiter || DEFAULT_END_DELIMITER;

  if (
    originalText.includes(useStartDelimiter) ||
    originalText.includes(useEndDelimiter) ||
    secretMessage.includes(useStartDelimiter) ||
    secretMessage.includes(useEndDelimiter)
  ) {
    throw new Error('V textu nebo tajné zprávě se již nacházejí použité oddělovače.');
  }
  return `${originalText}${useStartDelimiter}${secretMessage}${useEndDelimiter}`;
}

function revealWithDelimiters(stegText, startDelimiter, endDelimiter) {
  const useStartDelimiter = startDelimiter || DEFAULT_START_DELIMITER;
  const useEndDelimiter = endDelimiter || DEFAULT_END_DELIMITER;

  const startIndex = stegText.indexOf(useStartDelimiter);
  const endIndex = stegText.indexOf(useEndDelimiter);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return stegText.substring(startIndex + useStartDelimiter.length, endIndex);
  }
  return null;
}

/**
 * Delimitery + Base64 s obfuskací
 *
 * Tato metoda kombinuje:
 * 1. Převod tajné zprávy do Base64
 * 2. Obfuskaci Base64 výstupu (přeházení znaků)
 * 3. Použití diskrétních delimitů pro uložení
 */
function hideWithBase64Delimiters(originalText, secretMessage, startDelimiter, endDelimiter) {
  const useStartDelimiter = startDelimiter || '<!-- ';
  const useEndDelimiter = endDelimiter || ' -->';

  if (originalText.includes(useStartDelimiter) || originalText.includes(useEndDelimiter)) {
    throw new Error('V textu se již nacházejí použité oddělovače.');
  }

  // Převod zprávy do Base64
  let base64Message = btoa(encodeURIComponent(secretMessage));

  // Obfuskace Base64 zprávy (jednoduchá permutace)
  const obfuscatedBase64 = obfuscateBase64(base64Message);

  // Vložení do textu
  return `${originalText}${useStartDelimiter}${obfuscatedBase64}${useEndDelimiter}`;
}

function revealWithBase64Delimiters(stegText, startDelimiter, endDelimiter) {
  const useStartDelimiter = startDelimiter || '<!-- ';
  const useEndDelimiter = endDelimiter || ' -->';

  const startIndex = stegText.indexOf(useStartDelimiter);
  const endIndex = stegText.indexOf(useEndDelimiter);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const obfuscatedBase64 = stegText.substring(startIndex + useStartDelimiter.length, endIndex);

    try {
      // Deobfuskace Base64
      const base64Message = deobfuscateBase64(obfuscatedBase64);

      // Dekódování Base64 zpět na text
      return decodeURIComponent(atob(base64Message));
    } catch (e) {
      throw new Error('Nepodařilo se dekódovat skrytou zprávu. Ujistěte se, že používáte správný typ oddělovačů.');
    }
  }

  return null;
}

function obfuscateBase64(base64String) {
  let result = '';
  for (let i = 0; i < base64String.length; i += 2) {
    if (i + 1 < base64String.length) {
      result += base64String[i + 1] + base64String[i];
    } else {
      result += base64String[i];
    }
  }
  return result;
}

function deobfuscateBase64(obfuscatedString) {
  return obfuscateBase64(obfuscatedString); // Stejný algoritmus funguje pro obfuskaci i deobfuskaci
}

/**
 * Metoda neviditelných znaků - ukrývá zprávu jako mezery, tabulátory a zero-width znaky na konci řádků
 * Mezera = 00, Tab = 01, Zero-width space = 10, Zero-width non-joiner = 11
 */
function hideWithInvisibleChars(originalText, secretMessage) {
  // Konverze tajné zprávy do binární podoby
  // Add end marker
  const messageWithMarker = secretMessage + '§';

  // Encode as before with the marker included
  const encoder = new TextEncoder();
  const binaryMessage = Array.from(encoder.encode(messageWithMarker))
    .map((byte) => byte.toString(2).padStart(8, '0'))
    .join('');

  // Připravíme řádky pro ukrytí
  const lines = originalText.split('\n');

  // Spočítáme, kolik bitů můžeme ukrýt (2 bity na řádek)
  const bitsCapacity = lines.length * 2;
  const bitsNeeded = binaryMessage.length;

  if (bitsCapacity < bitsNeeded) {
    throw new Error(`Text musí obsahovat alespoň ${Math.ceil(bitsNeeded / 2)} řádků pro ukrytí zprávy.`);
  }

  // Přidáme neviditelné znaky na konec každého řádku podle dvojic bitů
  for (let i = 0; i < lines.length && i * 2 < binaryMessage.length; i++) {
    const bit1 = i * 2 < binaryMessage.length ? binaryMessage[i * 2] : '0';
    const bit2 = i * 2 + 1 < binaryMessage.length ? binaryMessage[i * 2 + 1] : '0';

    lines[i] = lines[i].trimEnd();

    // Kódování dvojic bitů pomocí různých neviditelných znaků
    if (bit1 === '0' && bit2 === '0') {
      lines[i] += ' '; // mezera
    } else if (bit1 === '0' && bit2 === '1') {
      lines[i] += '\t'; // tabulátor
    } else if (bit1 === '1' && bit2 === '0') {
      lines[i] += '\u200B'; // zero-width space
    } else {
      // bit1 === '1' && bit2 === '1'
      lines[i] += '\u200C'; // zero-width non-joiner
    }
  }

  return lines.join('\n');
}

function revealWithInvisibleChars(stegText) {
  const lines = stegText.split('\n');
  let binaryMessage = '';

  // Extrahujeme binární data z neviditelných znaků na konci řádků
  for (let line of lines) {
    if (line.length === 0) continue;

    const lastChar = line.charAt(line.length - 1);

    if (lastChar === ' ') {
      binaryMessage += '00'; // mezera
    } else if (lastChar === '\t') {
      binaryMessage += '01'; // tabulátor
    } else if (lastChar === '\u200B') {
      binaryMessage += '10'; // zero-width space
    } else if (lastChar === '\u200C') {
      binaryMessage += '11'; // zero-width non-joiner
    }
  }

  // Převod binárních dat zpět na text
  let bytes = [];
  for (let i = 0; i < binaryMessage.length; i += 8) {
    const byte = binaryMessage.substr(i, 8);
    if (byte.length === 8) {
      bytes.push(parseInt(byte, 2));
    }
  }

  const decoded = new TextDecoder().decode(new Uint8Array(bytes));

  // Odstranění koncové značky
  const endMarkerIndex = decoded.indexOf('§');
  return endMarkerIndex !== -1 ? decoded.substring(0, endMarkerIndex) : decoded;
}

/**
 * Rozšířená Baconova šifra s více HTML tagy
 *
 * Využívá 4 různé HTML tagy pro reprezentaci 2 bitů (4 možné stavy):
 * - normální text = 00
 * - <i> = 01
 * - <b> = 10
 * - <u> = 11
 *
 * To poskytuje dvojnásobnou kapacitu oproti původní Baconově šifře.
 */
function hideWithMultiTagBacon(originalText, secretMessage) {
  // Konverze tajné zprávy do binární podoby
  const messageWithMarker = secretMessage + '§';

  // Convert to binary
  const binaryMessage = Array.from(messageWithMarker)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');

  // Kontrola, zda máme dostatek nosného textu
  // Potřebujeme 1 písmeno na 2 bity (4x efektivnější než klasická Baconova šifra)
  const textLetters = originalText.replace(/[^a-zA-Z]/g, '').length;
  if (textLetters < Math.ceil(binaryMessage.length / 2)) {
    throw new Error(`Text musí obsahovat alespoň ${Math.ceil(binaryMessage.length / 2)} písmen pro ukrytí zprávy.`);
  }

  // Aplikace formátování na nosný text podle binárních dat
  let result = '';
  let bitIndex = 0;

  for (let i = 0; i < originalText.length; i++) {
    const char = originalText[i];

    if (bitIndex >= binaryMessage.length) {
      result += originalText.substring(i);
      break;
    }

    if (/[a-zA-Z]/.test(char)) {
      // Pro každé písmeno vezmeme 2 bity
      const bit1 = bitIndex < binaryMessage.length ? binaryMessage[bitIndex] : '0';
      const bit2 = bitIndex + 1 < binaryMessage.length ? binaryMessage[bitIndex + 1] : '0';

      // Kódování dvojic bitů pomocí různých HTML tagů
      if (bit1 === '0' && bit2 === '0') {
        result += char; // normální text
      } else if (bit1 === '0' && bit2 === '1') {
        result += `<i>${char}</i>`; // kurzíva
      } else if (bit1 === '1' && bit2 === '0') {
        result += `<b>${char}</b>`; // tučné písmo
      } else {
        // bit1 === '1' && bit2 === '1'
        result += `<u>${char}</u>`; // podtržení
      }

      bitIndex += 2;
    } else {
      result += char;
    }
  }

  return result;
}

function revealWithMultiTagBacon(stegText) {
  // Extrakce binárních dat z formátovaného textu
  let binaryMessage = '';

  // Regex pro nalezení všech formátovaných znaků
  const regex = /<i>([a-zA-Z])<\/i>|<b>([a-zA-Z])<\/b>|<u>([a-zA-Z])<\/u>|([a-zA-Z])/g;
  let match;

  while ((match = regex.exec(stegText)) !== null) {
    if (match[1]) {
      // Kurzíva = 01
      binaryMessage += '01';
    } else if (match[2]) {
      // Tučné = 10
      binaryMessage += '10';
    } else if (match[3]) {
      // Podtržené = 11
      binaryMessage += '11';
    } else {
      // Normální text = 00
      binaryMessage += '00';
    }
  }

  // Převod binárních dat zpět na text
  let result = '';
  for (let i = 0; i < binaryMessage.length; i += 8) {
    const byte = binaryMessage.substr(i, 8);
    if (byte.length === 8) {
      const char = String.fromCharCode(parseInt(byte, 2));
      if (char === '§') break; // Stop at end marker
      result += char;
    }
  }

  return result;
}

/**
 * Baconova šifra - používá dva různé styly písma
 * Simulujeme pomocí HTML formátování: normální text pro A, <i> pro B
 */
function hideWithBaconCipher(originalText, secretMessage) {
  const baconDict = {
    a: 'AAAAA',
    b: 'AAAAB',
    c: 'AAABA',
    d: 'AAABB',
    e: 'AABAA',
    f: 'AABAB',
    g: 'AABBA',
    h: 'AABBB',
    i: 'ABAAA',
    j: 'ABAAB',
    k: 'ABABA',
    l: 'ABABB',
    m: 'ABBAA',
    n: 'ABBAB',
    o: 'ABBBA',
    p: 'ABBBB',
    q: 'BAAAA',
    r: 'BAAAB',
    s: 'BAABA',
    t: 'BAABB',
    u: 'BABAA',
    v: 'BABAB',
    w: 'BABBA',
    x: 'BABBB',
    y: 'BBAAA',
    z: 'BBAAB',

    á: 'BBAABA',
    č: 'BBABAA',
    ď: 'BBABAB',
    é: 'BBABBA',
    ě: 'BBABBB',
    í: 'BBBAAA',
    ň: 'BBBAAB',
    ó: 'BBBABA',
    ř: 'BBBABB',
    š: 'BBBBAA',
    ť: 'BBBBAB',
    ú: 'BBBBBA',
    ů: 'BBBBBB',
    ý: 'BAAAAA',
    ž: 'BAAAAB',

    ' ': 'BAAAABA',
    '.': 'BAAAABB',
    ',': 'BAABAA',
    '?': 'BAABAB',
    '!': 'BAABBA',
    '-': 'BAABBB'
  };
  const messageLength = Math.min(secretMessage.length, 31);
  const lengthCode = messageLength.toString(2).padStart(5, '0').replace(/0/g, 'A').replace(/1/g, 'B');

  // Prepend the length to the Bacon message
  const baconMessage =
    lengthCode +
    secretMessage
      .toLowerCase()
      .split('')
      .map((char) => baconDict[char] || '')
      .join('');

  // Kontrola, zda máme dostatek nosného textu
  if (originalText.replace(/\s/g, '').length < baconMessage.length) {
    throw new Error(`Text musí obsahovat alespoň ${baconMessage.length} znaků pro ukrytí zprávy.`);
  }

  // Aplikace formátování na nosný text podle Baconova kódu
  let result = '';
  let baconIndex = 0;

  for (let i = 0; i < originalText.length; i++) {
    if (baconIndex >= baconMessage.length) {
      // Pokud jsme zakódovali celou zprávu, přidáme zbytek nezměněn
      result += originalText.substring(i);
      break;
    }

    const char = originalText[i];
    if (/[a-zA-Z]/.test(char)) {
      // Aplikujeme pouze na písmena
      if (baconMessage[baconIndex] === 'A') {
        result += char; // Normální text
      } else {
        result += `<i>${char}</i>`; // Text kurzívou
      }
      baconIndex++;
    } else {
      // Nepísmenné znaky zůstávají nezměněny
      result += char;
    }
  }

  return result;
}

function revealWithBaconCipher(stegText) {
  const baconToChar = {};
  for (const [char, code] of Object.entries({
    a: 'AAAAA',
    b: 'AAAAB',
    c: 'AAABA',
    d: 'AAABB',
    e: 'AABAA',
    f: 'AABAB',
    g: 'AABBA',
    h: 'AABBB',
    i: 'ABAAA',
    j: 'ABAAB',
    k: 'ABABA',
    l: 'ABABB',
    m: 'ABBAA',
    n: 'ABBAB',
    o: 'ABBBA',
    p: 'ABBBB',
    q: 'BAAAA',
    r: 'BAAAB',
    s: 'BAABA',
    t: 'BAABB',
    u: 'BABAA',
    v: 'BABAB',
    w: 'BABBA',
    x: 'BABBB',
    y: 'BBAAA',
    z: 'BBAAB',

    á: 'BBAABA',
    č: 'BBABAA',
    ď: 'BBABAB',
    é: 'BBABBA',
    ě: 'BBABBB',
    í: 'BBBAAA',
    ň: 'BBBAAB',
    ó: 'BBBABA',
    ř: 'BBBABB',
    š: 'BBBBAA',
    ť: 'BBBBAB',
    ú: 'BBBBBA',
    ů: 'BBBBBB',
    ý: 'BAAAAA',
    ž: 'BAAAAB',

    ' ': 'BAAAABA',
    '.': 'BAAAABB',
    ',': 'BAABAA',
    '?': 'BAABAB',
    '!': 'BAABBA',
    '-': 'BAABBB'
  })) {
    baconToChar[code] = char;
  }

  // Extrakce Baconova kódu z formátovaného textu

  let baconCode = '';
  const regex = /<i>([a-zA-Z])<\/i>|([a-zA-Z])/g;
  let match;

  while ((match = regex.exec(stegText)) !== null) {
    if (match[1]) {
      // Italic = B
      baconCode += 'B';
    } else {
      // Normal = A
      baconCode += 'A';
    }
  }

  // First 5 characters represent the message length
  if (baconCode.length < 5) return '';

  // Extract message length
  const lengthCode = baconCode.substring(0, 5);
  const messageLength = parseInt(lengthCode.replace(/A/g, '0').replace(/B/g, '1'), 2);

  // Skip the length indicator and only decode the actual message length
  let result = '';
  const requiredBaconLength = 5 * messageLength; // 5 bits per character

  // Start after the length code and only process enough groups for the message
  for (let i = 5; i < 5 + requiredBaconLength && i + 4 < baconCode.length; i += 5) {
    const code = baconCode.substr(i, 5);
    if (code.length === 5 && baconToChar[code]) {
      result += baconToChar[code];
    }
  }

  return result;
}

/**
 * Podobná písmena - nahrazuje vybraná písmena podobně vypadajícími znaky
 */
function hideWithSimilarLetters(originalText, secretMessage) {
  // Převedení tajné zprávy na binární podobu
  const messageWithMarker = secretMessage + '§';

  // Convert to binary
  const binaryMessage = Array.from(messageWithMarker)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');

  // Definice substitučních párů (normální: alternativa)
  const substitutionMap = {
    o: '0',
    l: '1',
    i: '1',
    e: '€',
    a: '@',
    s: '5',
    c: 'ç',
    n: 'ñ',
    u: 'ü',
    y: '¥',
    z: '2',
    b: 'ß',
    g: '9',
    t: '7',
    h: 'ћ',
    r: 'ř',
    č: 'ç',
    ě: 'é',
    š: '§',
    ž: 'ž',
    ř: 'ř'
  };

  // Opačná mapa pro dekódování
  const reverseMap = {};
  for (const [key, value] of Object.entries(substitutionMap)) {
    reverseMap[key] = key;
    reverseMap[value] = key;
  }

  // Spočítáme dostupné znaky, které lze nahradit
  let availableChars = 0;
  for (const char of originalText) {
    if (Object.keys(substitutionMap).includes(char)) {
      availableChars++;
    }
  }

  if (availableChars < binaryMessage.length) {
    throw new Error(`Text musí obsahovat alespoň ${binaryMessage.length} nahraditelných znaků pro ukrytí zprávy.`);
  }

  // Vytvoříme steganografický text nahrazením znaků
  let result = '';
  let binaryIndex = 0;

  for (const char of originalText) {
    if (binaryIndex < binaryMessage.length && Object.keys(substitutionMap).includes(char)) {
      // Pokud je aktuální bit 1, použijeme alternativní znak
      if (binaryMessage[binaryIndex] === '1') {
        result += substitutionMap[char];
      } else {
        result += char;
      }
      binaryIndex++;
    } else {
      // Ostatní znaky zůstávají nezměněny
      result += char;
    }
  }

  // Uložíme vzor nahrazených znaků na konec textu
  const substitutionPattern = Object.keys(substitutionMap).join('');
  result += `\n[VZOR:${substitutionPattern}]`;

  return result;
}

function revealWithSimilarLetters(stegText) {
  // Extrakce vzoru substituce
  const patternMatch = stegText.match(/\[VZOR:([a-zčěšžřáíéúůýóďťň]+)\]$/);
  if (!patternMatch) {
    return null;
  }

  // Získáme text bez značky vzoru
  const text = stegText.substring(0, stegText.lastIndexOf('\n[VZOR:'));
  const substitutionChars = patternMatch[1].split('');

  // Definice substitučních párů
  const substitutionMap = {
    o: '0',
    l: '1',
    i: '1',
    e: '€',
    a: '@',
    s: '5',
    c: 'ç',
    n: 'ñ',
    u: 'ü',
    y: '¥',
    z: '2',
    b: 'ß',
    g: '9',
    t: '7',
    h: 'ћ',
    r: 'ř',
    č: 'ç',
    ě: 'é',
    š: '§',
    ž: 'ž',
    ř: 'ř'
  };

  // Create a map of substituted characters to their original versions
  const reverseMap = {};
  for (const [original, substitution] of Object.entries(substitutionMap)) {
    reverseMap[original] = original; // Original maps to itself
    reverseMap[substitution] = original; // Substituted version maps to original
  }

  // Extrakce binární zprávy
  let binaryMessage = '';
  let bitsProcessed = 0;

  for (const char of text) {
    // Check if this character is either a substitutable character or a substitution
    if (substitutionChars.includes(reverseMap[char]) || substitutionChars.includes(char)) {
      const originalChar = reverseMap[char] || char;
      const substitutedChar = substitutionMap[originalChar];

      // If the character in text is the substituted version, then it's a '1' bit
      binaryMessage += char === substitutedChar ? '1' : '0';
      bitsProcessed++;

      // Stop if we've already processed enough bits for complete bytes
      // This prevents trailing incomplete bytes
      if (bitsProcessed % 8 === 0) {
        // Check if we have the end marker in the current complete set of bytes
        const currentBytes = [];
        for (let i = 0; i < binaryMessage.length; i += 8) {
          if (i + 8 <= binaryMessage.length) {
            const byte = binaryMessage.substr(i, 8);
            currentBytes.push(parseInt(byte, 2));
          }
        }

        // Check if we've found the end marker
        const currentText = new TextDecoder().decode(new Uint8Array(currentBytes));
        if (currentText.includes('§')) {
          // Found end marker, we can stop
          break;
        }
      }
    }
  }

  // Převod binárních dat zpět na text
  let bytes = [];
  for (let i = 0; i < binaryMessage.length; i += 8) {
    if (i + 8 <= binaryMessage.length) {
      // Only process complete bytes
      const byte = binaryMessage.substr(i, 8);
      bytes.push(parseInt(byte, 2));
    }
  }

  const decoded = new TextDecoder().decode(new Uint8Array(bytes));

  // Remove end marker and anything after it
  const endMarkerIndex = decoded.indexOf('§');
  return endMarkerIndex !== -1 ? decoded.substring(0, endMarkerIndex) : decoded;
}

/**
 * Česká metoda spojek - ukrývá bity ve volitelných čárkách před českými spojkami
 */
function hideWithCzechConjunctions(originalText, secretMessage) {
  // Convert message to binary
  const messageWithMarker = secretMessage + '§';

  // Convert to binary
  const binaryMessage = Array.from(messageWithMarker)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');

  // Find potential places for commas: before "a", "ale", "nebo", "či", "aby"...
  const czechConjunctionsRegex = /\b(\w+)( )(a|ale|nebo|či|aby|proto|přece|protože)\b/g;
  let matches = [...originalText.matchAll(czechConjunctionsRegex)];

  if (matches.length < binaryMessage.length) {
    throw new Error(`Text musí obsahovat alespoň ${binaryMessage.length} výskytů českých spojek pro ukrytí zprávy.`);
  }

  let result = originalText;
  let offset = 0;

  // Add or skip commas based on binary data
  for (let i = 0; i < binaryMessage.length && i < matches.length; i++) {
    const match = matches[i];
    const insertPosition = match.index + match[1].length + offset;

    if (binaryMessage[i] === '1') {
      // Insert comma for bit 1
      result = result.substring(0, insertPosition) + ',' + result.substring(insertPosition);
      offset += 1;
    }
    // No comma for bit 0
  }

  return result;
}

function revealFromCzechConjunctions(stegText) {
  // Find all potential comma places before Czech conjunctions
  const czechCommaRegex = /\b(\w+)(,)?(a|ale|nebo|či|aby|proto|přece|protože)\b/g;
  let matches = [...stegText.matchAll(czechCommaRegex)];

  // Extract binary data from presence/absence of commas
  let binaryMessage = '';
  for (const match of matches) {
    binaryMessage += match[2] ? '1' : '0';
  }

  // Convert binary back to text using UTF-8 aware conversion
  let bytes = [];
  for (let i = 0; i < binaryMessage.length; i += 8) {
    const byte = binaryMessage.substr(i, 8);
    if (byte.length === 8) {
      bytes.push(parseInt(byte, 2));
    }
  }

  const decoded = new TextDecoder().decode(new Uint8Array(bytes));

  // Remove end marker
  const endMarkerIndex = decoded.indexOf('§');
  return endMarkerIndex !== -1 ? decoded.substring(0, endMarkerIndex) : decoded;
}

/**
 * Metoda mezer mezi slovy - mění šířku mezery mezi slovy
 * Normální mezera = 0, Větší mezera = 1
 */
function hideWithWordSpacing(originalText, secretMessage) {
  // Převedení tajné zprávy na binární podobu s podporou češtiny
  const encoder = new TextEncoder();
  const binaryMessage = Array.from(encoder.encode(secretMessage))
    .map((byte) => byte.toString(2).padStart(8, '0'))
    .join('');

  // Rozdělíme text na slova
  const words = originalText.split(' ');

  // Potřebujeme o jedno slovo méně než je mezer
  if (words.length - 1 < binaryMessage.length) {
    throw new Error(`Text musí obsahovat alespoň ${binaryMessage.length + 1} slov pro ukrytí zprávy.`);
  }

  // Vytvoříme nový text s upravenými mezerami
  let result = words[0];

  for (let i = 1; i < words.length; i++) {
    const bit = i - 1 < binaryMessage.length ? binaryMessage[i - 1] : '0';

    // Pro bit 1 použijeme větší mezeru (thin space + normal space)
    if (bit === '1') {
      result += ' \u200A' + words[i];
    } else {
      // Pro bit 0 použijeme normální mezeru
      result += ' ' + words[i];
    }
  }

  return result;
}

function revealFromWordSpacing(stegText) {
  // Najdeme všechny mezery
  const spacePairs = stegText.match(/( \u200A| )/g);

  if (!spacePairs) return null;

  // Extrahujeme binární zprávu
  let binaryMessage = '';
  for (const space of spacePairs) {
    binaryMessage += space.includes('\u200A') ? '1' : '0';
  }

  // Převedeme binární data na text s podporou češtiny
  let bytes = [];
  for (let i = 0; i < binaryMessage.length; i += 8) {
    const byte = binaryMessage.substr(i, 8);
    if (byte.length === 8) {
      bytes.push(parseInt(byte, 2));
    }
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}

// Exportované funkce s výběrem metody
export function hideInText(originalText, secretMessage, method = 'delimiters', options = {}) {
  try {
    switch (method) {
      case 'delimiters':
        return hideWithDelimiters(originalText, secretMessage, options.startDelimiter, options.endDelimiter);
      case 'whitespace':
        return hideWithInvisibleChars(originalText, secretMessage);
      case 'bacon':
        return hideWithBaconCipher(originalText, secretMessage);
      case 'multi-tag-bacon':
        return hideWithMultiTagBacon(originalText, secretMessage);
      case 'similar-letters':
        return hideWithSimilarLetters(originalText, secretMessage);
      case 'czech-conjunctions':
        return hideWithCzechConjunctions(originalText, secretMessage);
      case 'word-spacing':
        return hideWithWordSpacing(originalText, secretMessage);
      case 'base64-delimiters':
        return hideWithBase64Delimiters(originalText, secretMessage, options.startDelimiter, options.endDelimiter);
      default:
        throw new Error(`Neznámá steganografická metoda: ${method}`);
    }
  } catch (error) {
    throw new Error(`Nepodařilo se ukrýt zprávu: ${error.message}`);
  }
}

export function revealFromText(stegText, method = 'delimiters', options = {}) {
  try {
    switch (method) {
      case 'delimiters':
        return revealWithDelimiters(stegText, options.startDelimiter, options.endDelimiter);
      case 'whitespace':
        return revealWithInvisibleChars(stegText);
      case 'bacon':
        return revealWithBaconCipher(stegText);
      case 'multi-tag-bacon':
        return revealWithMultiTagBacon(stegText);
      case 'similar-letters':
        return revealWithSimilarLetters(stegText);
      case 'czech-conjunctions':
        return revealFromCzechConjunctions(stegText);
      case 'word-spacing':
        return revealFromWordSpacing(stegText);
      case 'base64-delimiters':
        return revealWithBase64Delimiters(stegText, options.startDelimiter, options.endDelimiter);
      default:
        throw new Error(`Neznámá steganografická metoda: ${method}`);
    }
  } catch (error) {
    throw new Error(`Nepodařilo se odkrýt zprávu: ${error.message}`);
  }
}

export const textStegoMethods = [
  {
    value: 'delimiters',
    name: 'Oddělovače',
    description: 'Ukrývá zprávu pomocí volitelných oddělovačů v textu.',
    supportsCustomDelimiters: true
  },
  {
    value: 'base64-delimiters',
    name: 'Base64 + oddělovače',
    description: 'Ukrývá zprávu pomocí oddělovačů s Base64 kódováním a obfuskací.',
    supportsCustomDelimiters: true
  },
  {
    value: 'whitespace',
    name: 'Neviditelné znaky',
    description: 'Ukrývá zprávu pomocí mezer, tabulátorů a zero-width znaků na koncích řádků.'
  },
  {
    value: 'bacon',
    name: 'Baconova šifra',
    description: 'Ukrývá zprávu pomocí různých stylů písma (normální a kurzíva). Podporuje pouze základní latinku.',
    limitedCharSupport: true
  },
  {
    value: 'multi-tag-bacon',
    name: 'Vícetagová Baconova šifra',
    description: 'Ukrývá zprávu pomocí čtyř různých stylů písma. Podporuje pouze základní latinku.',
    limitedCharSupport: true
  },
  {
    value: 'similar-letters',
    name: 'Podobná písmena',
    description: 'Nahrazuje vybraná písmena podobně vypadajícími znaky (o→0, l→1).'
  },
  {
    value: 'czech-conjunctions',
    name: 'České spojky',
    description: 'Vkládá nebo vynechává volitelné čárky před českými spojkami jako "a", "ale", "nebo".',
    czechSpecific: true
  },
  {
    value: 'word-spacing',
    name: 'Mezery mezi slovy',
    description: 'Mění šířku mezer mezi slovy (normální a rozšířená). Neviditelná metoda fungující i s češtinou.',
    czechSupport: true
  }
];
