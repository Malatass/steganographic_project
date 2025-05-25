<template>
  <div class="text-steganography">
    <v-tabs v-model="activeTab" class="mb-6" color="primary" @update:model-value="resetOutputs">
      <v-tab value="hide">Ukrýt zprávu</v-tab>
      <v-tab value="reveal">Odkrýt zprávu</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="hide">
        <v-card class="mb-8 pa-4" outlined>
          <v-card-title class="text-h5">Ukrýt zprávu do textu</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedMethod"
              :items="methods"
              item-title="name"
              item-value="value"
              return-object
              label="Vyberte metodu steganografie"
              outlined
              class="mb-4 steg-select"
              @update:model-value="resetOutputs"
              variant="outlined"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" class="steg-list-item">
                  <v-list-item-subtitle class="method-description">{{ item.raw.description }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>

            <v-alert v-if="selectedMethod" color="info" class="mb-4" density="comfortable" variant="tonal">
              <strong>{{ selectedMethod.name }}:</strong>
              {{ selectedMethod.description }}
            </v-alert>

            <!-- Volitelné nastavení oddělovačů pro metody podporující delimitery -->
            <v-expand-transition>
              <div v-if="(selectedMethod.value === 'delimiters' || selectedMethod.value === 'base64-delimiters') && selectedMethod.supportsCustomDelimiters">
                <v-switch v-model="useCustomDelimiters" label="Použít vlastní oddělovače" color="primary" hide-details class="mb-2"></v-switch>
                <v-row v-if="useCustomDelimiters">
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="customStartDelimiter" label="Počáteční oddělovač" outlined dense variant="outlined"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="customEndDelimiter" label="Koncový oddělovač" outlined dense variant="outlined"></v-text-field>
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>

            <!-- Původní text s možností importu -->
            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-1">
                <label>Původní text (nosič)</label>
                <div class="d-flex gap-2">
                  <v-btn size="small" variant="outlined" color="primary" @click="pasteFromClipboard('original')">
                    <v-icon size="small" class="mr-1">mdi-clipboard-text</v-icon>
                    Vložit ze schránky
                  </v-btn>
                  <v-btn size="small" variant="outlined" color="primary" @click="triggerOriginalTextFileInput">
                    <v-icon size="small" class="mr-1">mdi-upload</v-icon>
                    Importovat ze souboru
                  </v-btn>
                </div>
                <input type="file" ref="originalTextFileInput" accept=".txt" style="display: none" @change="importOriginalTextFile" />
              </div>
              <v-textarea v-model="originalText" rows="3" auto-grow outlined hide-details variant="outlined"></v-textarea>
            </div>

            <!-- Tajná zpráva s možností importu -->
            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-1">
                <label>Tajná zpráva</label>
                <div class="d-flex gap-2">
                  <v-btn size="small" variant="outlined" color="primary" @click="pasteFromClipboard('secret')">
                    <v-icon size="small" class="mr-1">mdi-clipboard-text</v-icon>
                    Vložit ze schránky
                  </v-btn>
                  <v-btn size="small" variant="outlined" color="primary" @click="triggerSecretMessageFileInput">
                    <v-icon size="small" class="mr-1">mdi-upload</v-icon>
                    Importovat ze souboru
                  </v-btn>
                </div>
                <input type="file" ref="secretMessageFileInput" accept=".txt" style="display: none" @change="importSecretMessageFile" />
              </div>
              <v-textarea v-model="secretMessage" rows="2" auto-grow outlined hide-details variant="outlined"></v-textarea>
            </div>

            <v-btn color="secondary" @click="performHideInText" :disabled="!originalText || !secretMessage" type="button">Ukrýt zprávu</v-btn>
          </v-card-text>
        </v-card>

        <v-card v-if="resultText" class="mb-8 pa-4 scroll-to" outlined>
          <v-card-title class="text-h5">Výsledek</v-card-title>
          <v-card-text>
            <div v-if="selectedMethod.value === 'bacon' || selectedMethod.value === 'multi-tag-bacon'" v-html="resultText" class="mb-4 bacon-result"></div>
            <v-textarea
              v-else
              v-model="resultText"
              label="Text s ukrytou zprávou"
              rows="3"
              auto-grow
              outlined
              readonly
              class="mb-4"
              variant="outlined"
            ></v-textarea>
            <div class="encryption-options mb-4">
              <v-expansion-panels variant="accordion">
                <v-expansion-panel title="Šifrování heslem (volitelné)">
                  <v-expansion-panel-text>
                    <p class="text-body-2 mb-2">Můžete zvolit šifrování výsledku pomocí hesla:</p>
                    <v-radio-group v-model="encryptionType" inline class="mb-2">
                      <v-radio label="Bez šifrování" value="none"></v-radio>
                      <v-radio label="AES-128" value="aes128"></v-radio>
                      <v-radio label="AES-256" value="aes256"></v-radio>
                    </v-radio-group>

                    <v-text-field
                      v-if="encryptionType !== 'none'"
                      v-model="encryptionPassword"
                      label="Heslo pro šifrování"
                      :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="showPassword ? 'text' : 'password'"
                      variant="outlined"
                      @click:append="showPassword = !showPassword"
                      hint="Heslo bude potřeba pro odkrytí zprávy"
                      persistent-hint
                    ></v-text-field>

                    <v-alert v-if="encryptionType !== 'none'" type="warning" variant="tonal" density="comfortable" class="mt-2">
                      <strong>Pozor:</strong>
                      Pokud zapomenete heslo, nebude možné zprávu obnovit!
                    </v-alert>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>

            <div class="d-flex gap-2">
              <v-btn color="success" @click="copyToClipboard">
                <v-icon class="mr-2">mdi-content-copy</v-icon>
                Kopírovat do schránky
              </v-btn>
              <v-btn color="success" @click="showFileNameDialog = true">
                <v-icon class="mr-2">mdi-download</v-icon>
                Stáhnout jako TXT
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>

      <v-window-item value="reveal">
        <v-card class="mb-8 pa-4" outlined>
          <v-card-title class="text-h5">Odkrýt zprávu z textu</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedRevealMethod"
              :items="methods"
              item-title="name"
              item-value="value"
              return-object
              label="Vyberte metodu steganografie"
              class="mb-4 steg-select"
              variant="outlined"
              @update:model-value="resetOutputs"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" class="steg-list-item">
                  <v-list-item-subtitle class="method-description">{{ item.raw.description }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>

            <!-- Volitelné nastavení oddělovačů pro metodu delimiters -->
            <v-expand-transition>
              <div
                v-if="
                  (selectedRevealMethod.value === 'delimiters' || selectedRevealMethod.value === 'base64-delimiters') &&
                  selectedRevealMethod.supportsCustomDelimiters
                "
              >
                <v-switch v-model="useCustomDelimitersReveal" label="Použít vlastní oddělovače" color="primary" hide-details class="mb-2"></v-switch>
                <v-row v-if="useCustomDelimitersReveal">
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="customStartDelimiterReveal" label="Počáteční oddělovač" outlined dense variant="outlined"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="customEndDelimiterReveal" label="Koncový oddělovač" outlined dense variant="outlined"></v-text-field>
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>

            <!-- Text s ukrytou zprávou s možností importu -->
            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-1">
                <label>Text s ukrytou zprávou</label>
                <div class="d-flex gap-2">
                  <v-btn size="small" variant="outlined" color="primary" @click="pasteFromClipboard('stego')">
                    <v-icon size="small" class="mr-1">mdi-clipboard-text</v-icon>
                    Vložit ze schránky
                  </v-btn>
                  <v-btn size="small" variant="outlined" color="primary" @click="triggerStegoTextFileInput">
                    <v-icon size="small" class="mr-1">mdi-upload</v-icon>
                    Importovat ze souboru
                  </v-btn>
                </div>
                <input type="file" ref="stegoTextFileInput" accept=".txt" style="display: none" @change="importStegoTextFile" />
              </div>
              <v-textarea v-model="stegoTextInput" rows="3" auto-grow outlined hide-details variant="outlined"></v-textarea>
            </div>

            <!-- Sekce pro dešifrování -->
            <div class="decryption-options mb-4">
              <v-alert v-if="isEncryptedContent" type="info" variant="tonal" density="comfortable" class="mb-2">
                Detekován zašifrovaný obsah ({{ decryptionType.toUpperCase() }}). Pro odkrytí zprávy zadejte heslo:
              </v-alert>

              <v-text-field
                v-if="isEncryptedContent"
                v-model="decryptionPassword"
                label="Heslo pro dešifrování"
                :append-icon="showDecryptPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showDecryptPassword ? 'text' : 'password'"
                variant="outlined"
                @click:append="showDecryptPassword = !showDecryptPassword"
              ></v-text-field>
            </div>

            <v-btn color="secondary" @click="performRevealFromText" :disabled="!stegoTextInput" type="button">Odkrýt zprávu</v-btn>
          </v-card-text>
        </v-card>

        <!-- NEW: Odkrytý výsledek - similar to ImageSteganography -->
        <v-card v-if="revealedMessage" class="mb-8 pa-4 scroll-to-decode" outlined>
          <v-card-title class="text-h5">Odkrytá data</v-card-title>
          <v-card-text>
            <div class="revealed-text">
              <v-textarea v-model="revealedMessage" label="Odkrytý text" rows="5" auto-grow outlined readonly class="mb-4" variant="outlined"></v-textarea>

              <v-btn color="success" @click="copyRevealedMessage">
                <v-icon class="mr-2">mdi-content-copy</v-icon>
                Kopírovat do schránky
              </v-btn>

              <v-btn color="success" class="ml-2" @click="downloadRevealedMessage">
                <v-icon class="mr-2">mdi-download</v-icon>
                Stáhnout jako TXT
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- Dialog pro název souboru při stahování -->
    <v-dialog v-model="showFileNameDialog" max-width="500px">
      <v-card>
        <v-card-title>Stáhnout soubor</v-card-title>
        <v-card-text>
          <v-text-field v-model="downloadFileName" label="Název souboru" outlined :suffix="downloadFileType" autofocus variant="outlined"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showFileNameDialog = false">Zrušit</v-btn>
          <v-btn color="primary" @click="performDownload">Stáhnout</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import { ref, defineEmits, watch } from 'vue';
  import { hideInText, revealFromText, textStegoMethods } from '../../stegonography/text';
  import CryptoJS from 'crypto-js';

  const emit = defineEmits(['show-message']);

  // Tab control
  const activeTab = ref('hide');

  // Add new state variable for revealed message
  const revealedMessage = ref('');

  // Text steganography variables
  const originalText = ref('');
  const secretMessage = ref('');
  const stegoTextInput = ref('');
  const resultText = ref('');
  const methods = ref(textStegoMethods);
  const selectedMethod = ref(textStegoMethods[0]);
  const selectedRevealMethod = ref(textStegoMethods[0]);

  // Custom delimiters
  const useCustomDelimiters = ref(false);
  const customStartDelimiter = ref('{{START}}');
  const customEndDelimiter = ref('{{END}}');

  const useCustomDelimitersReveal = ref(false);
  const customStartDelimiterReveal = ref('{{START}}');
  const customEndDelimiterReveal = ref('{{END}}');

  // Funkce pro nastavení výchozích oddělovačů podle vybrané metody
  function setDefaultDelimitersForMethod(method) {
    if (method === 'base64-delimiters') {
      // Pro Base64 metodu použijeme HTML komentáře jako výchozí
      customStartDelimiter.value = '<!-- ';
      customEndDelimiter.value = ' -->';
      return {
        startDelimiter: '<!-- ',
        endDelimiter: ' -->'
      };
    } else {
      // Pro běžné oddělovače ponecháme původní hodnoty
      customStartDelimiter.value = '{{START}}';
      customEndDelimiter.value = '{{END}}';
      return {
        startDelimiter: '{{START}}',
        endDelimiter: '{{END}}'
      };
    }
  }

  // Stejná funkce pro odkrývání
  function setDefaultDelimitersForRevealMethod(method) {
    if (method === 'base64-delimiters') {
      customStartDelimiterReveal.value = '<!-- ';
      customEndDelimiterReveal.value = ' -->';
      return {
        startDelimiter: '<!-- ',
        endDelimiter: ' -->'
      };
    } else {
      customStartDelimiterReveal.value = '{{START}}';
      customEndDelimiterReveal.value = '{{END}}';
      return {
        startDelimiter: '{{START}}',
        endDelimiter: '{{END}}'
      };
    }
  }

  // Download filename
  const showFileNameDialog = ref(false);
  const downloadFileName = ref('steganografie_text');

  // Reference pro file inputs
  const originalTextFileInput = ref(null);
  const secretMessageFileInput = ref(null);
  const stegoTextFileInput = ref(null);

  // Šifrování a hesla
  const encryptionType = ref('none'); // 'none', 'aes128', 'aes256'
  const encryptionPassword = ref('');
  const showPassword = ref(false);

  // Dešifrování
  const decryptionType = ref('none'); // 'none', 'aes128', 'aes256'
  const decryptionPassword = ref('');
  const showDecryptPassword = ref(false);
  const isEncryptedContent = ref(false);

  // Funkce pro detekci šifrovaného obsahu
  function detectEncryptedContent(text) {
    try {
      const data = JSON.parse(text);
      if (data.type === 'aes128' || data.type === 'aes256') {
        isEncryptedContent.value = true;
        decryptionType.value = data.type;
        return true;
      }
    } catch (e) {
      // Není JSON, pravděpodobně nešifrovaný text
      isEncryptedContent.value = false;
      decryptionType.value = 'none';
    }
    return false;
  }

  // Funkce pro šifrování textu
  function encryptText(text, password, type) {
    if (!text || !password || type === 'none') {
      return text;
    }

    // Pro AES-128 použijeme první polovinu klíče vytvořeného pomocí SHA-256
    if (type === 'aes128') {
      const key = CryptoJS.SHA256(password).toString().substring(0, 32); // 128 bitů = 16 bajtů = 32 hexadecimálních znaků
      return JSON.stringify({
        ct: CryptoJS.AES.encrypt(text, key).toString(),
        iv: CryptoJS.lib.WordArray.random(16).toString(),
        s: CryptoJS.lib.WordArray.random(8).toString(),
        type: 'aes128'
      });
    }
    // Pro AES-256 použijeme plný 256-bitový klíč
    else if (type === 'aes256') {
      const key = CryptoJS.SHA256(password).toString();
      return JSON.stringify({
        ct: CryptoJS.AES.encrypt(text, key).toString(),
        iv: CryptoJS.lib.WordArray.random(16).toString(),
        s: CryptoJS.lib.WordArray.random(8).toString(),
        type: 'aes256'
      });
    }

    return text;
  }

  // Funkce pro dešifrování textu
  function decryptText(encryptedText, password, type) {
    if (!encryptedText || !password || type === 'none') {
      return encryptedText;
    }

    try {
      const data = JSON.parse(encryptedText);

      if (!data.ct || !data.type) {
        throw new Error('Neplatný formát zašifrovaných dat');
      }

      let key;
      if (data.type === 'aes128') {
        key = CryptoJS.SHA256(password).toString().substring(0, 32);
      } else if (data.type === 'aes256') {
        key = CryptoJS.SHA256(password).toString();
      } else {
        throw new Error('Nepodporovaný typ šifrování');
      }

      const bytes = CryptoJS.AES.decrypt(data.ct, key);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error('Neplatné heslo nebo poškozená data');
      }

      return decrypted;
    } catch (error) {
      throw new Error('Nepodařilo se dešifrovat text: ' + error.message);
    }
  }

  // Reset all outputs, error messages when switching tabs or methods
  function resetOutputs() {
    resultText.value = '';
    revealedMessage.value = '';
    emit('show-message', { message: '', type: 'info' });

    // Reset při přepnutí záložek
    if (activeTab.value === 'hide') {
      // Při přepnutí na ukrývání resetujeme pole pro skrytou zprávu
      stegoTextInput.value = '';
      isEncryptedContent.value = false;
      decryptionPassword.value = '';
    } else {
      // Při přepnutí na odkrývání resetujeme pole pro výsledek
      resultText.value = '';
      encryptionType.value = 'none';
      encryptionPassword.value = '';
    }
  }

  // Funkce pro import textových souborů
  function triggerOriginalTextFileInput() {
    originalTextFileInput.value.click();
  }

  function triggerSecretMessageFileInput() {
    secretMessageFileInput.value.click();
  }

  function triggerStegoTextFileInput() {
    stegoTextFileInput.value.click();
  }

  // Import původního textu ze souboru
  function importOriginalTextFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      originalText.value = e.target.result;
      emit('show-message', {
        message: `Soubor "${file.name}" byl úspěšně importován jako původní text.`,
        type: 'success'
      });
    };
    reader.onerror = (e) => {
      emit('show-message', {
        message: `Chyba při čtení souboru: ${e.target.error}`,
        type: 'error'
      });
    };
    reader.readAsText(file);

    // Reset hodnoty input prvku, aby bylo možné nahrát stejný soubor znovu
    event.target.value = '';
  }

  // Import tajné zprávy ze souboru
  function importSecretMessageFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      secretMessage.value = e.target.result;
      emit('show-message', {
        message: `Soubor "${file.name}" byl úspěšně importován jako tajná zpráva.`,
        type: 'success'
      });
    };
    reader.onerror = (e) => {
      emit('show-message', {
        message: `Chyba při čtení souboru: ${e.target.error}`,
        type: 'error'
      });
    };
    reader.readAsText(file);

    // Reset hodnoty input prvku, aby bylo možné nahrát stejný soubor znovu
    event.target.value = '';
  }

  // Import textu s ukrytou zprávou ze souboru
  function importStegoTextFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      stegoTextInput.value = e.target.result;
      emit('show-message', {
        message: `Soubor "${file.name}" byl úspěšně importován pro odkrytí zprávy.`,
        type: 'success'
      });

      // Detekujeme zašifrovaný obsah
      detectEncryptedContent(stegoTextInput.value);
    };
    reader.onerror = (e) => {
      emit('show-message', {
        message: `Chyba při čtení souboru: ${e.target.error}`,
        type: 'error'
      });
    };
    reader.readAsText(file);

    // Reset hodnoty input prvku, aby bylo možné nahrát stejný soubor znovu
    event.target.value = '';
  }

  function performHideInText() {
    if (!originalText.value || !secretMessage.value) {
      emit('show-message', {
        message: 'Prosím, zadejte původní text i tajnou zprávu.',
        type: 'error'
      });
      return;
    }

    try {
      const options = {};

      if ((selectedMethod.value.value === 'delimiters' || selectedMethod.value.value === 'base64-delimiters') && useCustomDelimiters.value) {
        options.startDelimiter = customStartDelimiter.value || '{{START}}';
        options.endDelimiter = customEndDelimiter.value || '{{END}}';
      }

      const result = hideInText(originalText.value, secretMessage.value, selectedMethod.value.value, options);

      resultText.value = result;
      emit('show-message', {
        message: `Zpráva byla úspěšně ukryta pomocí metody "${selectedMethod.value.name}"`,
        type: 'success'
      });
      scrollTo('.scroll-to');
    } catch (e) {
      emit('show-message', {
        message: `${e.message}`,
        type: 'error'
      });
      scrollTo('.result-alert');
    }
  }

  const scrollTo = (selector) => {
    setTimeout(() => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const downloadFileType = ref('.txt');
  const downloadCallback = ref(null);

  function prepareDownload(defaultName, fileType, callback) {
    downloadFileName.value = defaultName;
    downloadFileType.value = fileType;
    downloadCallback.value = callback;
    showFileNameDialog.value = true;
  }

  function copyRevealedMessage() {
    if (!revealedMessage.value) {
      emit('show-message', {
        message: 'Není k dispozici žádný text ke kopírování.',
        type: 'error'
      });
      return;
    }

    navigator.clipboard
      .writeText(revealedMessage.value)
      .then(() => {
        emit('show-message', {
          message: 'Text byl zkopírován do schránky.',
          type: 'success'
        });
      })
      .catch((err) => {
        emit('show-message', {
          message: `Nepodařilo se zkopírovat text: ${err}`,
          type: 'error'
        });
      });
  }

  // Function to download revealed message
  function downloadRevealedMessage() {
    if (!revealedMessage.value) {
      emit('show-message', {
        message: 'Není k dispozici žádný text ke stažení.',
        type: 'error'
      });
      return;
    }

    prepareDownload('odkryta_zprava', '.txt', (fileName) => {
      const blob = new Blob([revealedMessage.value], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      emit('show-message', {
        message: 'Odkrytý text byl úspěšně stažen.',
        type: 'success'
      });
    });
  }

  function performRevealFromText() {
    if (!stegoTextInput.value) {
      emit('show-message', {
        message: 'Prosím, zadejte text obsahující skrytou zprávu.',
        type: 'error'
      });
      return;
    }

    try {
      // Pokud je text šifrovaný, nejprve ho dešifrujeme
      let inputText = stegoTextInput.value;

      if (isEncryptedContent.value) {
        if (!decryptionPassword.value) {
          emit('show-message', {
            message: 'Pro dešifrování zašifrovaného obsahu musíte zadat heslo.',
            type: 'error'
          });
          return;
        }

        try {
          inputText = decryptText(inputText, decryptionPassword.value, decryptionType.value);
        } catch (e) {
          emit('show-message', {
            message: e.message,
            type: 'error'
          });
          return;
        }
      }

      // Připravíme options podle metody
      const options = {};

      if ((selectedRevealMethod.value.value === 'delimiters' || selectedRevealMethod.value.value === 'base64-delimiters') && useCustomDelimitersReveal.value) {
        options.startDelimiter = customStartDelimiterReveal.value || '{{START}}';
        options.endDelimiter = customEndDelimiterReveal.value || '{{END}}';
      }

      const revealed = revealFromText(inputText, selectedRevealMethod.value.value, options);

      if (revealed !== null && revealed !== '') {
        // Set the revealed message in the dedicated textarea
        revealedMessage.value = revealed;

        // Just show a simple success message
        emit('show-message', {
          message: 'Zpráva byla úspěšně odkryta.',
          type: 'success'
        });
        scrollTo('.scroll-to-decode');
      } else {
        emit('show-message', {
          message: 'V textu nebyla nalezena žádná skrytá zpráva nebo byla použita jiná metoda skrývání.',
          type: 'warning'
        });
        scrollTo('.result-alert');
      }
    } catch (e) {
      emit('show-message', {
        message: `${e.message}`,
        type: 'error'
      });
      scrollTo('.result-alert');
    }
  }

  function copyToClipboard() {
    // Pokud je vybrané šifrování, šifrujeme text před kopírováním
    let textToCopy = resultText.value;

    if (encryptionType.value !== 'none') {
      if (!encryptionPassword.value) {
        emit('show-message', {
          message: 'Pro šifrování musíte zadat heslo.',
          type: 'error'
        });
        return;
      }

      try {
        textToCopy = encryptText(textToCopy, encryptionPassword.value, encryptionType.value);
      } catch (e) {
        emit('show-message', {
          message: `Chyba při šifrování: ${e.message}`,
          type: 'error'
        });
        return;
      }
    }

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        emit('show-message', {
          message:
            encryptionType.value !== 'none'
              ? `Text byl zašifrován pomocí ${encryptionType.value.toUpperCase()} a zkopírován do schránky.`
              : 'Text byl zkopírován do schránky.',
          type: 'success'
        });
      })
      .catch((err) => {
        emit('show-message', {
          message: `Nepodařilo se zkopírovat text: ${err}`,
          type: 'error'
        });
      });
  }

  // Funkce pro stažení výsledku jako TXT souboru
  function downloadTextFile() {
    const fileName = (downloadFileName.value || 'steganografie_text') + '.txt';

    // Pokud je vybrané šifrování, šifrujeme text před stažením
    let textToDownload = resultText.value;

    if (encryptionType.value !== 'none') {
      if (!encryptionPassword.value) {
        emit('show-message', {
          message: 'Pro šifrování musíte zadat heslo.',
          type: 'error'
        });
        return;
      }

      try {
        textToDownload = encryptText(textToDownload, encryptionPassword.value, encryptionType.value);
      } catch (e) {
        emit('show-message', {
          message: `Chyba při šifrování: ${e.message}`,
          type: 'error'
        });
        return;
      }
    }

    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });

    // Vytvoříme odkaz pro stažení
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    // Přidáme odkaz do DOM, klikneme na něj a pak ho odstraníme
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Zavřeme dialog
    showFileNameDialog.value = false;

    emit('show-message', {
      message:
        encryptionType.value !== 'none'
          ? `Soubor ${fileName} byl zašifrován pomocí ${encryptionType.value.toUpperCase()} a úspěšně stažen.`
          : `Soubor ${fileName} byl úspěšně stažen.`,
      type: 'success'
    });
  }

  // Hlídáme změny v stegoTextInput
  watch(stegoTextInput, (newValue) => {
    if (newValue) {
      detectEncryptedContent(newValue);
    } else {
      isEncryptedContent.value = false;
    }
  });

  // Sledujeme změny vybrané metody pro ukrývání
  watch(
    () => selectedMethod.value?.value,
    (newMethod) => {
      if (newMethod) {
        setDefaultDelimitersForMethod(newMethod);
      }
    }
  );

  function performDownload() {
    if (typeof downloadCallback.value === 'function') {
      downloadCallback.value(downloadFileName.value);
    }
    showFileNameDialog.value = false;
  }
  async function pasteFromClipboard(target) {
    try {
      const text = await navigator.clipboard.readText();

      if (!text) {
        emit('show-message', {
          message: 'Schránka je prázdná nebo neobsahuje text',
          type: 'warning'
        });
        return;
      }

      // Apply to appropriate textarea
      switch (target) {
        case 'original':
          originalText.value = text;
          emit('show-message', {
            message: 'Text ze schránky byl vložen do původního textu',
            type: 'success'
          });
          break;
        case 'secret':
          secretMessage.value = text;
          emit('show-message', {
            message: 'Text ze schránky byl vložen do tajné zprávy',
            type: 'success'
          });
          break;
        case 'stego':
          stegoTextInput.value = text;
          // Also detect encrypted content if applicable
          if (text) {
            detectEncryptedContent(text);
          }
          emit('show-message', {
            message: 'Text ze schránky byl vložen do pole pro odkrývání',
            type: 'success'
          });
          break;
      }
    } catch (err) {
      emit('show-message', {
        message: `Nepodařilo se přečíst obsah schránky: ${err.message || 'Přístup ke schránce byl odepřen'}`,
        type: 'error'
      });
    }
  }

  // Sledujeme změny vybrané metody pro odkrývání
  watch(
    () => selectedRevealMethod.value?.value,
    (newMethod) => {
      if (newMethod) {
        setDefaultDelimitersForRevealMethod(newMethod);
      }
    }
  );
  // Add watchers for method changes
  watch(selectedMethod, () => {
    // Reset result when changing hiding method
    resultText.value = '';
    emit('show-message', { message: '', type: 'info' });
  });

  watch(selectedRevealMethod, () => {
    // Reset revealed message when changing reveal method
    revealedMessage.value = '';
    emit('show-message', { message: '', type: 'info' });
  });

  // Reset custom delimiters when toggling their use
  watch(useCustomDelimiters, () => {
    resultText.value = '';
    emit('show-message', { message: '', type: 'info' });
  });

  watch(useCustomDelimitersReveal, () => {
    revealedMessage.value = '';
    emit('show-message', { message: '', type: 'info' });
  });

  // Reset output when custom delimiters change
  watch([customStartDelimiter, customEndDelimiter], () => {
    if (useCustomDelimiters.value) {
      resultText.value = '';
      emit('show-message', { message: '', type: 'info' });
    }
  });

  watch([customStartDelimiterReveal, customEndDelimiterReveal], () => {
    if (useCustomDelimitersReveal.value) {
      revealedMessage.value = '';
      emit('show-message', { message: '', type: 'info' });
    }
  });
</script>

<style scoped>
  .revealed-text {
    margin-top: 1rem;
  }
  .encryption-options,
  .decryption-options {
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .steg-select :deep(.v-field__input) {
    padding: 12px 16px;
  }

  .steg-list-item {
    padding: 12px 16px;
    border-left: 3px solid transparent;
    transition: all 0.2s ease;
  }

  .steg-list-item:hover {
    background-color: rgba(121, 190, 21, 0.05);
    border-left-color: #79be15;
  }

  .method-title {
    color: #424242;
    font-weight: 500;
    margin-bottom: 4px;
    font-size: 1rem;
  }

  .method-description {
    color: #757575;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  :deep(.v-list-item--active) {
    background-color: rgba(121, 190, 21, 0.1);
    border-left: 3px solid #79be15;
  }

  :deep(.v-list-item--active) .method-title {
    color: #79be15;
    font-weight: 600;
  }

  .v-card + .v-card {
    margin-top: 2rem;
  }

  .bacon-result {
    white-space: pre-wrap;
    font-family: monospace;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
    background-color: #f5f5f5;
  }

  /* Přidáme styly pro správné zobrazení tagů ve výsledku */
  .bacon-result i {
    color: #2196f3;
  }

  .bacon-result b {
    color: #f44336;
  }

  .bacon-result u {
    color: #4caf50;
    text-decoration-style: wavy;
  }

  .gap-2 {
    gap: 8px;
  }
</style>
