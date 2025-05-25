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
  const binaryMessage = Array.from(secretMessage)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
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
  let result = '';
  for (let i = 0; i < binaryMessage.length; i += 8) {
    const byte = binaryMessage.substr(i, 8);
    if (byte.length === 8) {
      result += String.fromCharCode(parseInt(byte, 2));
    }
  }

  return result;
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
  const binaryMessage = Array.from(secretMessage)
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
      result += String.fromCharCode(parseInt(byte, 2));
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
    ' ': 'BBBAA',
    '.': 'BBBAB',
    ',': 'BBBBA',
    '?': 'BBBBB'
  };

  // Převedení tajné zprávy na Baconův kód
  const baconMessage = secretMessage
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
  const baconToChar = {
    AAAAA: 'a',
    AAAAB: 'b',
    AAABA: 'c',
    AAABB: 'd',
    AABAA: 'e',
    AABAB: 'f',
    AABBA: 'g',
    AABBB: 'h',
    ABAAA: 'i',
    ABAAB: 'j',
    ABABA: 'k',
    ABABB: 'l',
    ABBAA: 'm',
    ABBAB: 'n',
    ABBBA: 'o',
    ABBBB: 'p',
    BAAAA: 'q',
    BAAAB: 'r',
    BAABA: 's',
    BAABB: 't',
    BABAA: 'u',
    BABAB: 'v',
    BABBA: 'w',
    BABBB: 'x',
    BBAAA: 'y',
    BBAAB: 'z',
    BBBAA: ' ',
    BBBAB: '.',
    BBBBA: ',',
    BBBBB: '?'
  };

  // Extrakce Baconova kódu z formátovaného textu
  let baconCode = '';
  const regex = /<i>([a-zA-Z])<\/i>|([a-zA-Z])/g;
  let match;

  while ((match = regex.exec(stegText)) !== null) {
    if (match[1]) {
      // Písmeno kurzívou = B
      baconCode += 'B';
    } else {
      // Normální písmeno = A
      baconCode += 'A';
    }
  }

  // Převod Baconova kódu zpět na text
  let result = '';
  for (let i = 0; i < baconCode.length; i += 5) {
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
  const binaryMessage = Array.from(secretMessage)
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
    r: 'ř'
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
  const patternMatch = stegText.match(/\[VZOR:([a-z]+)\]$/);
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
    r: 'ř'
  };

  // Extrakce binární zprávy
  let binaryMessage = '';

  for (const char of text) {
    const normalChar = Object.keys(substitutionMap).find((k) => k === char || substitutionMap[k] === char);

    if (normalChar && substitutionChars.includes(normalChar)) {
      // Pokud je to nahraditelný znak
      binaryMessage += char === normalChar ? '0' : '1';
    }
  }

  // Převod binárních dat zpět na text
  let result = '';
  for (let i = 0; i < binaryMessage.length; i += 8) {
    const byte = binaryMessage.substr(i, 8);
    if (byte.length === 8) {
      result += String.fromCharCode(parseInt(byte, 2));
    }
  }

  return result;
}

/**
 * Čárková metoda - ukrývá bity ve volitelných čárkách (před "and" nebo "or" v angličtině)
 */
function hideWithCommas(originalText, secretMessage) {
  // Převedení tajné zprávy na binární podobu
  const binaryMessage = Array.from(secretMessage)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');

  // Najdeme místa, kde jsou čárky volitelné: před "and" nebo "or"
  const optionalCommaRegex = /\b(\w+)( )(and|or)\b/g;
  let matches = [...originalText.matchAll(optionalCommaRegex)];

  if (matches.length < binaryMessage.length) {
    throw new Error(`Text musí obsahovat alespoň ${binaryMessage.length} výskytů 'and' nebo 'or' pro ukrytí zprávy.`);
  }

  let result = originalText;
  let offset = 0;

  // Přidáme nebo vynecháme čárky podle binárních dat
  for (let i = 0; i < binaryMessage.length && i < matches.length; i++) {
    const match = matches[i];
    const insertPosition = match.index + match[1].length + offset;

    if (binaryMessage[i] === '1') {
      // Vložíme čárku pro bit 1
      result = result.substring(0, insertPosition) + ',' + result.substring(insertPosition);
      offset += 1;
    }
    // Pro bit 0 čárku nevkládáme
  }

  return result;
}

function revealWithCommas(stegText) {
  // Najdeme všechna potenciální místa pro čárky (před "and" nebo "or")
  const commaBeforeRegex = /\b(\w+)(,)?( )(and|or)\b/g;
  let matches = [...stegText.matchAll(commaBeforeRegex)];

  // Extrahujeme binární data z přítomnosti/absence čárek
  let binaryMessage = '';
  for (const match of matches) {
    binaryMessage += match[2] ? '1' : '0';
  }

  // Převod binárních dat zpět na text
  let result = '';
  for (let i = 0; i < binaryMessage.length; i += 8) {
    const byte = binaryMessage.substr(i, 8);
    if (byte.length === 8) {
      result += String.fromCharCode(parseInt(byte, 2));
    }
  }

  return result;
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
      case 'commas':
        return hideWithCommas(originalText, secretMessage);
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
      case 'commas':
        return revealWithCommas(stegText);
      case 'base64-delimiters':
        return revealWithBase64Delimiters(stegText, options.startDelimiter, options.endDelimiter);
      default:
        throw new Error(`Neznámá steganografická metoda: ${method}`);
    }
  } catch (error) {
    throw new Error(`Nepodařilo se odkrýt zprávu: ${error.message}`);
  }
}

// Přidání nových metod do seznamu pro UI
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
    description: 'Ukrývá zprávu pomocí různých stylů písma (normální a kurzíva).'
  },
  {
    value: 'multi-tag-bacon',
    name: 'Vícetagová Baconova šifra',
    description: 'Ukrývá zprávu pomocí čtyř různých stylů písma (normální, kurzíva, tučné a podtržené).'
  },
  {
    value: 'similar-letters',
    name: 'Podobná písmena',
    description: 'Nahrazuje vybraná písmena podobně vypadajícími znaky (o→0, l→1).'
  },
  {
    value: 'commas',
    name: 'Čárky',
    description: 'Vkládá nebo vynechává volitelné čárky před spojkami "and" a "or".'
  }
];
