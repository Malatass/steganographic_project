<template>
  <div class="image-steganography">
    <v-tabs v-model="activeTab" class="mb-6" color="primary" @update:model-value="resetOutputs">
      <v-tab value="hide">Ukrýt zprávu</v-tab>
      <v-tab value="reveal">Odkrýt zprávu</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- Záložka pro ukrývání informací -->
      <v-window-item value="hide">
        <v-card class="mb-8 pa-4" outlined>
          <v-card-title class="text-h5">Ukrýt zprávu v obrázku</v-card-title>
          <v-card-text>
            <!-- Výběr typu dat k ukrytí -->
            <v-radio-group v-model="hideMode" inline class="mb-4">
              <v-radio label="Text" value="text"></v-radio>
              <v-radio label="Obrázek" value="image"></v-radio>
            </v-radio-group>

            <template v-if="hideMode === 'image'">
              <v-select
                v-model="selectedImageStegoMethod"
                :items="imageStegoMethods"
                item-title="name"
                item-value="value"
                return-object
                label="Vyberte metodu ukrývání obrázku"
                outlined
                class="mb-4 steg-select"
                @update:model-value="resetOutputs"
                :menu-props="{ width: 'auto' }"
                variant="outlined"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" class="steg-list-item">
                    <v-list-item-subtitle class="method-description">{{ item.raw.description }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
              <v-alert v-if="selectedImageStegoMethod" color="info" class="mb-4" density="comfortable" variant="tonal">
                <strong>{{ selectedImageStegoMethod.name }}:</strong>
                {{ selectedImageStegoMethod.description }}
              </v-alert>
            </template>
            <!-- Nastavení kvality / počet bitů -->
            <div class="mb-4" v-if="hideMode === 'image' && selectedImageStegoMethod.value === 'lsb'">
              <label>Počet bitů na kanál (1-3):</label>
              <v-slider v-model="bitsPerChannel" :min="1" :max="3" :step="1" thumb-label class="mt-1"></v-slider>
              <div class="text-caption">
                <span v-if="bitsPerChannel === 1">Nižší počet bitů = lepší kvalita obrazu, menší kapacita (doporučeno pro fotografie)</span>
                <span v-else-if="bitsPerChannel === 2">Střední nastavení - dobrý kompromis mezi kvalitou a kapacitou</span>
                <span v-else>Vyšší počet bitů = vyšší kapacita, ale může být viditelná degradace obrazu</span>
              </div>
            </div>

            <!-- Výběr obrázku pro nosič -->
            <div class="mb-4">
              <label>Vyberte obrázek jako nosič:</label>
              <v-file-input
                v-model="carrierFile"
                accept="image/*"
                prepend-icon="mdi-image"
                label="Vyberte obrázek"
                outlined
                @update:model-value="onCarrierImageSelected"
                :disabled="isProcessing"
                class="mt-1"
                variant="outlined"
              ></v-file-input>

              <div v-show="carrierImagePreview" class="image-preview mt-2">
                <h4 class="mb-2">Náhled obrázku nosiče:</h4>
                <div class="d-flex align-center">
                  <canvas ref="carrierCanvas" class="preview-canvas border"></canvas>
                  <div class="ml-4">
                    <div v-if="carrierImageInfo" class="text-body-2">
                      <p>
                        <strong>Rozměry:</strong>
                        {{ carrierImageInfo.width }} × {{ carrierImageInfo.height }} px
                      </p>

                      <p v-if="selectedImageStegoMethod.value ==='lsb' ">
                        <strong>Maximální kapacita:</strong>
                        {{ formatCapacity(carrierImageInfo.capacity) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Data pro ukrytí - text nebo obrázek -->
            <div v-if="hideMode === 'text'" class="mb-4">
              <div class="d-flex justify-space-between align-center mb-1">
                <label>Text k ukrytí</label>
                <div class="d-flex gap-2">
                  <v-btn size="small" variant="outlined" color="primary" @click="pasteFromClipboard">
                    <v-icon size="small" class="mr-1">mdi-clipboard-text</v-icon>
                    Vložit ze schránky
                  </v-btn>
                  <v-btn size="small" variant="outlined" color="primary" @click="triggerSecretTextFileInput">
                    <v-icon size="small" class="mr-1">mdi-upload</v-icon>
                    Importovat ze souboru
                  </v-btn>
                </div>
                <input type="file" ref="secretTextFileInput" accept=".txt" style="display: none" @change="importSecretTextFile" />
              </div>
              <v-textarea v-model="secretText" rows="3" auto-grow outlined hide-details :counter="maxTextLength" variant="outlined"></v-textarea>
            </div>

            <div v-else class="mb-4">
              <label>Obrázek k ukrytí:</label>
              <v-file-input
                v-model="secretImageFile"
                accept="image/*"
                prepend-icon="mdi-image"
                label="Vyberte obrázek k ukrytí"
                outlined
                @update:model-value="onSecretImageSelected"
                :disabled="isProcessing || !carrierFile"
                class="mt-1"
                variant="outlined"
              ></v-file-input>

              <div v-show="secretImagePreview" class="image-preview mt-2">
                <h4 class="mb-2">Náhled obrázku k ukrytí:</h4>
                <div class="d-flex align-center">
                  <canvas ref="secretCanvas" class="preview-canvas border"></canvas>
                  <div class="ml-4" v-if="secretImageInfo">
                    <div class="text-body-2">
                      <p>
                        <strong>Rozměry:</strong>
                        {{ secretImageInfo.width }} × {{ secretImageInfo.height }} px
                      </p>
                      <p v-if="selectedImageStegoMethod.value === 'lsb' && !secretImageInfo.willFit" class="text-warning">
                        <v-icon size="small">mdi-alert</v-icon>
                        Obrázek bude zmenšen, aby se vešel (automaticky)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <v-alert v-if="hideMode === 'text' && hasNonLatinChars(secretText)" type="warning" variant="tonal" density="comfortable" class="mt-2">
              <strong>Poznámka:</strong>
              Váš text obsahuje české znaky (ěščřžýáíéúů). Aplikace aktuálně český text nepodporuje.
            </v-alert>
            <div v-if="hideMode === 'text' && secretText" class="binary-representation mt-2">
              <div class="d-flex align-center">
                <v-icon size="small" class="mr-1">mdi-code-brackets</v-icon>
                <span class="text-caption text-medium-emphasis">Binární reprezentace:</span>
                <v-tooltip location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-icon size="small" class="ml-2" v-bind="props">mdi-information-outline</v-icon>
                  </template>
                  <span>Každý znak je reprezentován 8bitovým binárním kódem ASCII/UTF-8.</span>
                </v-tooltip>
              </div>
              <div class="binary-text mt-1">
                <code>{{ secretMessageBinary }}</code>
              </div>
            </div>
            <!-- Šifrování heslem -->
            <div v-if="hideMode === 'text'" class="encryption-options mb-4 mt-4">
              <v-expansion-panels variant="accordion">
                <v-expansion-panel title="Šifrování heslem (volitelné)">
                  <v-expansion-panel-text>
                    <p class="text-body-2 mb-2">Můžete zvolit šifrování ukrývaných dat pomocí hesla:</p>
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
                      Pokud zapomenete heslo, nebude možné ukrytá data obnovit!
                    </v-alert>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>

            <v-btn color="secondary" @click="performHideInImage" :disabled="isProcessing || !canPerformHide" :loading="isProcessing">Ukrýt zprávu</v-btn>
          </v-card-text>
        </v-card>

        <!-- Výsledný obrázek -->
        <v-card v-show="stegoImageUrl" class="mb-8 pa-4 scroll-to" outlined>
          <v-card-title class="text-h5">Výsledek</v-card-title>
          <v-card-text>
            <div class="d-flex flex-column align-center">
              <h3 class="mb-2">Obrázek s ukrytými daty:</h3>
              <div class="d-flex flex-column flex-md-row">
                <div class="preview-container">
                  <h4>Originální obrázek:</h4>
                  <canvas ref="originalPreviewCanvas" class="preview-canvas border"></canvas>
                </div>
                <div class="preview-container ml-md-4">
                  <h4>Obrázek s ukrytými daty:</h4>
                  <img :src="stegoImageUrl" class="stego-image border" alt="Obrázek s ukrytými daty" />
                </div>
              </div>

              <div class="mt-4 d-flex flex-column">
                <h4>Vizualizace rozdílů:</h4>
                <div class="d-flex flex-column flex-md-row">
                  <div class="preview-container">
                    <h5>Mapa rozdílů (zesíleno):</h5>
                    <canvas ref="diffMapCanvas" class="preview-canvas border"></canvas>
                  </div>
                  <div class="preview-container ml-md-4">
                    <h5>Zvýrazněná data:</h5>
                    <canvas ref="enhancedVisCanvas" class="preview-canvas border"></canvas>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 mt-4">
              <v-btn color="success" @click="downloadStegoImage">
                <v-icon class="mr-2">mdi-download</v-icon>
                Stáhnout obrázek
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Záložka pro odkrývání informací -->
      <v-window-item value="reveal">
        <v-card class="mb-8 pa-4" outlined>
          <v-card-title class="text-h5">Odkrýt informace z obrázku</v-card-title>
          <v-card-text>
            <!-- Výběr typu očekávaných dat -->
            <v-radio-group v-model="revealMode" inline class="mb-4">
              <v-radio label="Text" value="text"></v-radio>
              <v-radio label="Obrázek" value="image"></v-radio>
              <v-radio label="Automatická detekce" value="auto"></v-radio>
            </v-radio-group>

            
            <template v-if="revealMode === 'image'">
              <v-select
                v-model="selectedRevealImageStegoMethod"
                :items="imageStegoMethods"
                item-title="name"
                item-value="value"
                return-object
                label="Vyberte metodu odkrývání obrázku"
                outlined
                class="mb-4 steg-select"
                @update:model-value="resetOutputs"
                variant="outlined"
                :menu-props="{ width: 'auto' }"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" class="steg-list-item">
                    <v-list-item-subtitle class="method-description">{{ item.raw.description }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
              <v-alert v-if="selectedRevealImageStegoMethod" color="info" class="mb-4" density="comfortable" variant="tonal">
                <strong>{{ selectedRevealImageStegoMethod.name }}:</strong>
                {{ selectedRevealImageStegoMethod.description }}
              </v-alert>
            </template>

            <!-- Nastavení kvality / počet bitů -->
            <div class="mb-4" v-if="hideMode === 'image' && selectedImageStegoMethod.value === 'lsb'">
              <label>Počet bitů na kanál (1-3):</label>
              <v-slider v-model="revealBitsPerChannel" :min="1" :max="3" :step="1" thumb-label class="mt-1"></v-slider>
              <div class="text-caption">Pro úspěšné odkrytí dat musí být nastavený stejný počet bitů jako při ukrývání.</div>
            </div>

            <!-- Výběr obrázku pro odkrytí -->
            <div class="mb-4">
              <label>Vyberte obrázek s ukrytými daty:</label>
              <v-file-input
                v-model="stegoFile"
                accept="image/*"
                prepend-icon="mdi-image-search"
                label="Vyberte obrázek"
                outlined
                @update:model-value="onStegoImageSelected"
                :disabled="isProcessing"
                class="mt-1"
                variant="outlined"
              ></v-file-input>

              <div v-show="stegoImagePreview" class="image-preview mt-2">
                <h4 class="mb-2">Náhled obrázku s ukrytými daty:</h4>
                <div class="d-flex align-center">
                  <canvas ref="stegoCanvas" class="preview-canvas border"></canvas>
                </div>
              </div>
            </div>

            <!-- Sekce pro dešifrování -->
            <div class="decryption-options mb-4">
              <v-alert v-if="isEncryptedContent" type="info" variant="tonal" density="comfortable" class="mb-2">
                Detekován zašifrovaný obsah ({{ decryptionType.toUpperCase() }}). Pro odkrytí dat zadejte heslo:
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

            <v-btn color="secondary" @click="performRevealFromImage" :disabled="!stegoFile || isProcessing" :loading="isProcessing">Odkrýt informace</v-btn>
          </v-card-text>
        </v-card>

        <!-- Odkrytý výsledek (text nebo obrázek) -->
        <v-card v-if="revealedData || revealedImageUrl" class="mb-8 pa-4 scroll-to-decode" outlined>
          <v-card-title class="text-h5">Odkrytá data</v-card-title>
          <v-card-text>
            <!-- Odkrytý text -->
            <div v-if="revealedData && !revealedImageUrl" class="revealed-text">
              <v-textarea v-model="revealedData" label="Odkrytý text" rows="5" auto-grow outlined readonly class="mb-4" variant="outlined"></v-textarea>

              <div class="d-flex gap-2">
                <v-btn color="success" @click="copyRevealedText">
                  <v-icon class="mr-2">mdi-content-copy</v-icon>
                  Kopírovat do schránky
                </v-btn>

                <v-btn color="success" @click="downloadRevealedText">
                  <v-icon class="mr-2">mdi-download</v-icon>
                  Stáhnout jako TXT
                </v-btn>
              </div>
            </div>

            <!-- Odkrytý obrázek -->
            <div v-if="revealedImageUrl" class="revealed-image d-flex flex-column align-center">
              <h3 class="mb-3">Odkrytý obrázek:</h3>
              <img :src="revealedImageUrl" class="stego-image border mb-4" alt="Odkrytý obrázek" />

              <v-btn color="success" @click="downloadRevealedImage">
                <v-icon class="mr-2">mdi-download</v-icon>
                Stáhnout obrázek
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>

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
  import { ref, defineEmits, watch, onMounted, computed } from 'vue';
  import {
    hideTextInImage,
    revealTextFromImage,
    hideImageInImage,
    revealImageFromImage,
    generateDifferenceMap,
    generateEnhancedVisualization,
    peekInitialTextFromImage,
    hideImageInImageMSB,
    revealImageFromImageMSB,
    hideImageInImageColorSimilarity,
    revealImageFromImageColorSimilarity
  } from '../../stegonography/image';
  import CryptoJS from 'crypto-js';

  const emit = defineEmits(['show-message']);

  const imageStegoMethods = [
    {
      name: 'Klasická LSB (všechny bity)',
      value: 'lsb',
      description: 'Klasická metoda: všechny bity tajného obrázku jsou postupně ukryty do nejméně významných bitů nosného obrázku. (Může zmenšit tajný obrázek, ale umožňuje přesnou rekonstrukci.)'
    },
    {
      name: 'MSB-in-LSB (n MSB do n LSB)',
      value: 'msb',
      description: 'Pouze n nejvýznamnějších bitů každého kanálu tajného obrázku je ukryto do n nejméně významných bitů nosného obrázku. (Obrázky musí mít stejnou velikost, výsledek je vizuální aproximace tajného obrázku.)'
    },
    {
      name: 'Barevná podobnost (Color Similarity)',
      value: 'color-similarity',
      description: 'Ukrytí dat změnou barvy na nejbližší možnou hodnotu, která kóduje požadované bity. Vizuálně velmi nenápadné pro šedotónové obrázky.'
    }
  ];
  const selectedImageStegoMethod = ref(imageStegoMethods[0]);
  const selectedRevealImageStegoMethod = ref(imageStegoMethods[0]);

  // Download filename
  const showFileNameDialog = ref(false);
  const downloadFileName = ref('');
  const downloadFileType = ref('');
  const downloadCallback = ref(null);

  // Zpracování stavu
  const isProcessing = ref(false);
  const activeTab = ref('hide');

  // Proměnné pro ukrývání
  const hideMode = ref('text');
  const carrierFile = ref(null);
  const secretText = ref('');
  const secretImageFile = ref(null);
  const bitsPerChannel = ref(1);
  const maxTextLength = ref(0);

  // Proměnné pro odkrývání
  const revealMode = ref('auto');
  const stegoFile = ref(null);
  const revealBitsPerChannel = ref(1);
  const revealedData = ref('');
  const revealedImageUrl = ref('');

  // Preview obrázků
  const carrierImagePreview = ref('');
  const carrierImageInfo = ref(null);
  const secretImagePreview = ref('');
  const secretImageInfo = ref(null);
  const stegoImagePreview = ref('');
  const stegoImageUrl = ref('');

  // Reference pro canvas elementy
  const carrierCanvas = ref(null);
  const secretCanvas = ref(null);
  const stegoCanvas = ref(null);
  const originalPreviewCanvas = ref(null);
  const diffMapCanvas = ref(null);
  const enhancedVisCanvas = ref(null);

  const canPerformHide = computed(() => {
    // Základní kontrola, zda je vybrán nosný obrázek
    if (!carrierFile.value || !carrierImageInfo.value || !carrierImageInfo.value.originalCanvas) {
      return false;
    }

    // Kontrola podle režimu ukrývání
    if (hideMode.value === 'text') {
      return !!secretText.value;
    }

    if (hideMode.value === 'image') {
      // Zde kontrolujeme, zda je vybrán tajný obrázek a zda má potřebné informace
      if (!secretImageFile.value || !secretImageInfo.value || !secretImageInfo.value.originalCanvas) {
        return false;
      }
    }
    return true; // Všechny podmínky splněny
  });

  // Šifrování a hesla
  const encryptionType = ref('none');
  const encryptionPassword = ref('');
  const showPassword = ref(false);

  // Dešifrování
  const decryptionType = ref('none');
  const decryptionPassword = ref('');
  const showDecryptPassword = ref(false);
  const isEncryptedContent = ref(false);

  // Reference pro file inputy
  const secretTextFileInput = ref(null);

  // Sledování změn režimu ukrývání pro aktualizaci kapacity
  watch(hideMode, () => {
    updateMaxTextLength();
  });

  // Sledování změny počtu bitů pro aktualizaci kapacity
  watch(bitsPerChannel, () => {
    updateMaxTextLength();
  });

  // Funkce pro formátování velikosti dat
  function formatCapacity(byteSize) {
    if (byteSize < 1024) {
      return `${byteSize} B`;
    } else if (byteSize < 1024 * 1024) {
      return `${(byteSize / 1024).toFixed(2)} KB`;
    } else {
      return `${(byteSize / (1024 * 1024)).toFixed(2)} MB`;
    }
  }

  // Obsluha výběru nosného obrázku
  function onCarrierImageSelected() {
    if (!carrierFile.value) {
      carrierImagePreview.value = '';
      carrierImageInfo.value = null;
      maxTextLength.value = 0;
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        if (!carrierCanvas.value) return;

        // Nastavení canvas na velikost obrázku (max 400px pro náhled, zachování poměru stran)
        const maxWidth = 400;
        const ratio = Math.min(1, maxWidth / img.width);

        carrierCanvas.value.width = img.width * ratio;
        carrierCanvas.value.height = img.height * ratio;

        const ctx = carrierCanvas.value.getContext('2d');
        ctx.clearRect(0, 0, carrierCanvas.value.width, carrierCanvas.value.height);
        ctx.drawImage(img, 0, 0, carrierCanvas.value.width, carrierCanvas.value.height);

        // Uložení originálu pro pozdější použití při skrývání
        const originalCanvas = document.createElement('canvas');
        originalCanvas.width = img.width;
        originalCanvas.height = img.height;
        const origCtx = originalCanvas.getContext('2d');
        origCtx.drawImage(img, 0, 0);

        // Výpočet maximální kapacity (počet pixelů * 3 kanály * bitsPerChannel / 8 bitů na bajt)
        const imageCapacityBytes = Math.floor((img.width * img.height * 3 * bitsPerChannel.value) / 8);

        // Snížíme velikost o hlavičku (pro případ textu)
        const textCapacity = Math.max(0, imageCapacityBytes - 100);
        maxTextLength.value = textCapacity;

        // Uložení informací o obrázku
        carrierImageInfo.value = {
          width: img.width,
          height: img.height,
          capacity: imageCapacityBytes,
          originalCanvas: originalCanvas
        };
        carrierImagePreview.value = e.target.result;

        // Pokud je vybrán i tajný obrázek, aktualizujeme jeho informace
        if (secretImageFile.value) {
          onSecretImageSelected();
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(carrierFile.value);
  }

  // Obsluha výběru tajného obrázku
  function onSecretImageSelected() {
    if (!secretImageFile.value || !carrierImageInfo.value) {
      secretImagePreview.value = '';
      secretImageInfo.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        if (!secretCanvas.value) return;

        if (selectedImageStegoMethod.value.value === 'msb' && carrierImageInfo.value) {
          if (img.width !== carrierImageInfo.value.width || img.height !== carrierImageInfo.value.height) {
            // Create a new canvas with carrier size
            const resizedCanvas = document.createElement('canvas');
            resizedCanvas.width = carrierImageInfo.value.width;
            resizedCanvas.height = carrierImageInfo.value.height;
            const resizedCtx = resizedCanvas.getContext('2d');
            // Draw the secret image scaled to fit the carrier
            resizedCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, resizedCanvas.width, resizedCanvas.height);
            // Update originalSecretCanvas and preview
            secretCanvas.value.width = Math.min(300, resizedCanvas.width);
            secretCanvas.value.height = Math.min(300, resizedCanvas.height);
            const previewCtx = secretCanvas.value.getContext('2d');
            previewCtx.clearRect(0, 0, secretCanvas.value.width, secretCanvas.value.height);
            previewCtx.drawImage(resizedCanvas, 0, 0, secretCanvas.value.width, secretCanvas.value.height);
            // Update info
            secretImageInfo.value = {
              width: resizedCanvas.width,
              height: resizedCanvas.height,
              size: resizedCanvas.width * resizedCanvas.height * 3,
              willFit: true,
              originalCanvas: resizedCanvas
            };
            // For preview
            secretImagePreview.value = resizedCanvas.toDataURL();
            return;
          }
        }

        // Nastavení canvas na velikost obrázku (max 300px pro náhled, zachování poměru stran)
        const maxWidth = 300;
        const ratio = Math.min(1, maxWidth / img.width);

        secretCanvas.value.width = img.width * ratio;
        secretCanvas.value.height = img.height * ratio;

        const ctx = secretCanvas.value.getContext('2d');
        ctx.clearRect(0, 0, secretCanvas.value.width, secretCanvas.value.height);
        ctx.drawImage(img, 0, 0, secretCanvas.value.width, secretCanvas.value.height);

        // Uložení originálu pro pozdější použití při skrývání
        const originalSecretCanvas = document.createElement('canvas');
        originalSecretCanvas.width = img.width;
        originalSecretCanvas.height = img.height;
        const origCtx = originalSecretCanvas.getContext('2d');
        origCtx.drawImage(img, 0, 0);

        // Výpočet velikosti dat tajného obrázku
        const secretImageSize = img.width * img.height * 3; // RGB - vynecháváme alfa kanál
        const headerSize = 100; // Odhadovaná velikost hlavičky
        const totalSize = secretImageSize + headerSize;

        // Kontrola, zda se tajný obrázek vejde do nosného
        const willFit = totalSize <= carrierImageInfo.value.capacity;

        // Uložení informací o tajném obrázku
        secretImageInfo.value = {
          width: img.width,
          height: img.height,
          size: secretImageSize,
          willFit: willFit,
          originalCanvas: originalSecretCanvas
        };

        secretImagePreview.value = e.target.result;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(secretImageFile.value);
  }

  // Obsluha výběru steganografického obrázku pro odkrývání
  function onStegoImageSelected() {
    if (!stegoFile.value) {
      stegoImagePreview.value = '';
      return;
    }

    isEncryptedContent.value = false;
    decryptionPassword.value = '';
    decryptionType.value = 'none';

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        if (!stegoCanvas.value) {
          console.warn('stegoCanvas ref is null, cannot display preview');
          return;
        }

        // Nastavení canvas na velikost obrázku (max 400px pro náhled, zachování poměru stran)
        const maxWidth = 400;
        const ratio = Math.min(1, maxWidth / img.width);

        stegoCanvas.value.width = img.width * ratio;
        stegoCanvas.value.height = img.height * ratio;

        const ctx = stegoCanvas.value.getContext('2d');
        ctx.clearRect(0, 0, stegoCanvas.value.width, stegoCanvas.value.height);
        ctx.drawImage(img, 0, 0, stegoCanvas.value.width, stegoCanvas.value.height);

        stegoImagePreview.value = e.target.result;

        // Pokud je režim odkrývání automatický, pokusíme se detekovat hlavičku
        const headerDetectionCanvas = document.createElement('canvas');
        headerDetectionCanvas.width = Math.min(200, img.width);
        headerDetectionCanvas.height = Math.min(200, img.height);

        const headerCtx = headerDetectionCanvas.getContext('2d');
        if (!headerCtx) {
          console.error('Failed to get context for header detection canvas');
          return;
        }
        headerCtx.drawImage(img, 0, 0, headerDetectionCanvas.width, headerDetectionCanvas.height);

        try {
          const initialPeekText = await peekInitialTextFromImage(headerDetectionCanvas, revealBitsPerChannel.value, 50);

          if (initialPeekText && initialPeekText.startsWith('ENCRYPTED:')) {
            const parts = initialPeekText.substring(10).split(':');

            if (parts.length >= 1) {
              const encTypeHeader = parts[0];
              const detectedEncType = encTypeHeader === 'AES-128' ? 'aes128' : encTypeHeader === 'AES-256' ? 'aes256' : '';

              if (detectedEncType) {
                isEncryptedContent.value = true;
                decryptionType.value = detectedEncType;
              } else {
                console.warn('Could not determine encryption type from header:', initialPeekText);
              }
            }
          }
        } catch (err) {
          console.warn('Error during encryption header detection:', err);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(stegoFile.value);
  }

  // Aktualizace maximální délky textu podle velikosti nosného obrázku a počtu bitů
  function updateMaxTextLength() {
    if (!carrierImageInfo.value) return;

    // Výpočet maximální kapacity (počet pixelů * 3 kanály * bitsPerChannel / 8 bitů na bajt)
    const imageCapacityBytes = Math.floor((carrierImageInfo.value.width * carrierImageInfo.value.height * 3 * bitsPerChannel.value) / 8);

    // Snížíme velikost o hlavičku (pro případ textu)
    const textCapacity = Math.max(0, imageCapacityBytes - 100);
    maxTextLength.value = textCapacity;
  }

  // Zpracování ukrytí dat v obrázku
  async function performHideInImage() {
    if (!carrierFile.value) {
      emit('show-message', { message: 'Prosím, vyberte nosný obrázek.', type: 'error' });
      return;
    }

    if (hideMode.value === 'text' && !secretText.value) {
      emit('show-message', { message: 'Prosím, zadejte text k ukrytí.', type: 'error' });
      return;
    }

    if (hideMode.value === 'image' && !secretImageFile.value) {
      emit('show-message', { message: 'Prosím, vyberte obrázek k ukrytí.', type: 'error' });
      return;
    }

    // Kontrola, zda jsou načteny potřebné informace
    if (!carrierImageInfo.value || !carrierImageInfo.value.originalCanvas) {
      emit('show-message', { message: 'Chyba: Informace o nosném obrázku nejsou kompletní. Počkejte prosím na dokončení načítání.', type: 'error' });
      return;
    }
    if (hideMode.value === 'image' && (!secretImageInfo.value || !secretImageInfo.value.originalCanvas)) {
      emit('show-message', { message: 'Chyba: Informace o tajném obrázku nejsou kompletní. Počkejte prosím na dokončení načítání.', type: 'error' });
      return;
    }

    isProcessing.value = true;
    emit('show-message', { message: 'Probíhá ukrývání dat...', type: 'info' });

    try {
      // Získáme originální canvas nosného obrázku
      const originalCanvas = carrierImageInfo.value.originalCanvas;
      let stegoImageData;

      if (hideMode.value === 'text') {
        let textToHide = secretText.value;

        if (encryptionType.value !== 'none') {
          if (!encryptionPassword.value) {
            emit('show-message', { message: 'Prosím, zadejte heslo pro šifrování.', type: 'error' });
            isProcessing.value = false;
            return;
          }

          const plainText = secretText.value;
          const password = encryptionPassword.value;
          let key;
          let aesModeStr = encryptionType.value === 'aes128' ? 'AES-128' : 'AES-256';

          const encrypted = CryptoJS.AES.encrypt(plainText, password);
          textToHide = `ENCRYPTED:${aesModeStr}:${encrypted.toString()}`;
        }

        stegoImageData = await hideTextInImage(originalCanvas, textToHide, bitsPerChannel.value);
      } else {
        const secretOriginalCanvas = secretImageInfo.value.originalCanvas;
        if (selectedImageStegoMethod.value.value === 'msb') {
          stegoImageData = await hideImageInImageMSB(originalCanvas, secretOriginalCanvas, bitsPerChannel.value);
        } else if (selectedImageStegoMethod.value.value === 'color-similarity') {
          stegoImageData = await hideImageInImageColorSimilarity(originalCanvas, secretOriginalCanvas, bitsPerChannel.value);
        } else {
          stegoImageData = await hideImageInImage(originalCanvas, secretOriginalCanvas, bitsPerChannel.value);
        }
      }

      // Vytvoříme nový canvas pro výsledný obrázek
      const resultCanvas = document.createElement('canvas');
      resultCanvas.width = originalCanvas.width;
      resultCanvas.height = originalCanvas.height;
      const resultCtx = resultCanvas.getContext('2d');
      resultCtx.putImageData(stegoImageData, 0, 0);

      // Generování vizualizace rozdílů
      // 1. Připravíme originální data
      const originalCtx = originalCanvas.getContext('2d');
      const originalImageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

      // 2. Vygenerujeme mapu rozdílů
      const diffMapImageData = await generateDifferenceMap(originalImageData, stegoImageData, 20);

      // 3. Vygenerujeme zvýrazněnou vizualizaci
      const enhancedVisImageData = await generateEnhancedVisualization(originalImageData, stegoImageData, bitsPerChannel.value);

      // 4. Zobrazíme výsledky v UI
      // Originální náhled
      if (originalPreviewCanvas.value) {
        originalPreviewCanvas.value.width = Math.min(400, originalCanvas.width);
        originalPreviewCanvas.value.height = Math.min((400 * originalCanvas.height) / originalCanvas.width, originalCanvas.height);
        const previewCtx = originalPreviewCanvas.value.getContext('2d');
        previewCtx.clearRect(0, 0, originalPreviewCanvas.value.width, originalPreviewCanvas.value.height);
        previewCtx.drawImage(originalCanvas, 0, 0, originalPreviewCanvas.value.width, originalPreviewCanvas.value.height);
      }

      // Mapa rozdílů
      if (diffMapCanvas.value) {
        diffMapCanvas.value.width = Math.min(400, originalCanvas.width);
        diffMapCanvas.value.height = Math.min((400 * originalCanvas.height) / originalCanvas.width, originalCanvas.height);
        const diffCtx = diffMapCanvas.value.getContext('2d');

        // Vytvoříme dočasný canvas pro plnou velikost
        const tempDiffCanvas = document.createElement('canvas');
        tempDiffCanvas.width = originalCanvas.width;
        tempDiffCanvas.height = originalCanvas.height;
        const tempDiffCtx = tempDiffCanvas.getContext('2d');
        tempDiffCtx.putImageData(diffMapImageData, 0, 0);

        // Škálujeme na náhled
        diffCtx.clearRect(0, 0, diffMapCanvas.value.width, diffMapCanvas.value.height);
        diffCtx.drawImage(tempDiffCanvas, 0, 0, diffMapCanvas.value.width, diffMapCanvas.value.height);
      }

      // Zvýrazněná vizualizace
      if (enhancedVisCanvas.value) {
        enhancedVisCanvas.value.width = Math.min(400, originalCanvas.width);
        enhancedVisCanvas.value.height = Math.min((400 * originalCanvas.height) / originalCanvas.width, originalCanvas.height);
        const enhancedCtx = enhancedVisCanvas.value.getContext('2d');

        // Vytvoříme dočasný canvas pro plnou velikost
        const tempEnhancedCanvas = document.createElement('canvas');
        tempEnhancedCanvas.width = originalCanvas.width;
        tempEnhancedCanvas.height = originalCanvas.height;
        const tempEnhancedCtx = tempEnhancedCanvas.getContext('2d');
        tempEnhancedCtx.putImageData(enhancedVisImageData, 0, 0);

        // Škálujeme na náhled
        enhancedCtx.clearRect(0, 0, enhancedVisCanvas.value.width, enhancedVisCanvas.value.height);
        enhancedCtx.drawImage(tempEnhancedCanvas, 0, 0, enhancedVisCanvas.value.width, enhancedVisCanvas.value.height);
      }

      // Uložení výsledného obrázku
      stegoImageUrl.value = resultCanvas.toDataURL('image/png');

      emit('show-message', {
        message: `Data byla úspěšně ukryta v obrázku.`,
        type: 'success'
      });
      scrollTo('.scroll-to');
    } catch (e) {
      console.error('Error in performHideInImage:', e);
      emit('show-message', {
        message: `${e.message}`,
        type: 'error'
      });
      scrollTo('.result-alert');
    } finally {
      isProcessing.value = false;
    }
  }

  async function performRevealFromImage() {
    if (!stegoFile.value) {
      emit('show-message', {
        message: 'Prosím, vyberte obrázek s ukrytými daty.',
        type: 'error'
      });
      return;
    }

    isProcessing.value = true;
    emit('show-message', {
      message: 'Probíhá odkrývání dat...',
      type: 'info'
    });
    revealedData.value = '';
    revealedImageUrl.value = '';

    try {
      // Načteme obrázek z vybraného souboru
      const img = new Image();
      const loadImagePromise = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => {
          reject(new Error('Nepodařilo se načíst obrázek pro odkrývání.'));
        };
        img.src = URL.createObjectURL(stegoFile.value);
      });

      await loadImagePromise;

      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = img.width;
      fullCanvas.height = img.height;
      const fullCtx = fullCanvas.getContext('2d');
      if (!fullCtx) {
        throw new Error('Nepodařilo se získat kontext pro fullCanvas.');
      }
      fullCtx.drawImage(img, 0, 0);
      URL.revokeObjectURL(img.src);

      // Automatická detekce režimu odkrývání
      if (revealMode.value === 'auto') {
        try {
          const initialTextPeek = await peekInitialTextFromImage(fullCanvas, revealBitsPerChannel.value);

          // Zkontrolujeme, zda je to text nebo šifrovaný text
          if (initialTextPeek && (initialTextPeek.startsWith('TEXT:') || initialTextPeek.startsWith('ENCRYPTED:'))) {
            // Pokud je to text nebo šifrovaný text, použijeme textový režim
            await processTextReveal(fullCanvas);
            return;
          }
        } catch (textPeekError) {}

        try {
          await processImageReveal(fullCanvas);
          return;
        } catch (imageError) {
          // Pokud selže odkrývání obrázku, zkusíme textové odkrývání
          try {
            await processTextReveal(fullCanvas);
            return;
          } catch (textError) {
            // Pokud selže i textové odkrývání, vyhodíme chybu
            throw new Error(`Automatická detekce selhala. Nelze rozpoznat formát ukrytých dat.`);
          }
        }
      } else if (revealMode.value === 'text') {
        // Textový režim specificky vybrán
        await processTextReveal(fullCanvas);
      } else if (revealMode.value === 'image') {
        // Obrázkový režim specificky vybrán
        await processImageReveal(fullCanvas);
      }
    } catch (e) {
      emit('show-message', {
        message: `Chyba při odkrývání: ${e.message}`,
        type: 'error'
      });
      scrollTo('.result-alert');
    } finally {
      isProcessing.value = false;
    }

    // Pomocná funkce pro zpracování textového odkrývání
    async function processTextReveal(canvas) {
      let revealedTextContent = await revealTextFromImage(canvas, revealBitsPerChannel.value);

      if (revealedTextContent.startsWith('ENCRYPTED:')) {
        const headerMatch = revealedTextContent.match(/^ENCRYPTED:(AES-128|AES-256):(.*)$/s);

        if (!headerMatch) {
          throw new Error('Chybný formát šifrované hlavičky.');
        }

        const detectedHeaderEncType = headerMatch[1];
        const actualCipherText = headerMatch[2];
        const actualDecryptionTypeFromHeader = detectedHeaderEncType === 'AES-128' ? 'aes128' : 'aes256';

        // Zkontrolujeme, zda je dešifrování povoleno
        isEncryptedContent.value = true;
        decryptionType.value = actualDecryptionTypeFromHeader;

        // Kontrola hesla
        if (!decryptionPassword.value) {
          emit('show-message', {
            message: `Obsah je šifrován (${decryptionType.value.toUpperCase()}). Zadejte prosím heslo.`,
            type: 'warning'
          });

          revealedData.value = 'Zašifrovaný obsah. Zadejte prosím heslo pro dešifrování.';

          scrollTo('.scroll-to-decode');
          return;
        }

        // Attempt decryption
        try {
          const decrypted = CryptoJS.AES.decrypt(actualCipherText, decryptionPassword.value);
          const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

          if (!decryptedString && actualCipherText) {
            throw new Error('Neplatné heslo nebo poškozená data.');
          }
          revealedTextContent = decryptedString;
        } catch (decErr) {
          throw new Error(`Nepodařilo se dešifrovat data: ${decErr.message || 'Neplatné heslo nebo chyba formátu.'}`);
        }
      } else if (revealedTextContent.startsWith('TEXT:')) {
        // Pokud je to text s hlavičkou TEXT:
        const textHeaderMatch = revealedTextContent.match(/^TEXT:(\d+):(.*)$/s);
        if (textHeaderMatch) {
          const declaredLength = parseInt(textHeaderMatch[1], 10);
          const actualContent = textHeaderMatch[2];
          revealedTextContent = actualContent.substring(0, declaredLength);
        }
      }

      // Pokud je to čistý text bez hlavičky, použijeme ho přímo
      revealedData.value = revealedTextContent;
      revealedImageUrl.value = '';

      emit('show-message', {
        message: 'Text byl úspěšně odkryt.',
        type: 'success'
      });

      scrollTo('.scroll-to-decode');
    }

    // Pomocná funkce pro zpracování obrázkového odkrývání
    async function processImageReveal(canvas) {
      let revealedImageData;
      if (selectedRevealImageStegoMethod.value.value === 'msb') {
        revealedImageData = await revealImageFromImageMSB(canvas, revealBitsPerChannel.value);
      } else if (selectedRevealImageStegoMethod.value.value === 'color-similarity') {
        revealedImageData = await revealImageFromImageColorSimilarity(canvas, revealBitsPerChannel.value);
      } else {
        revealedImageData = await revealImageFromImage(canvas, revealBitsPerChannel.value);
      }

      // Kontrola, zda jsme získali platná data obrázku
      const headerBytes = new Uint8Array(revealedImageData.data.buffer, 0, Math.min(50, revealedImageData.data.length));
      const headerText = new TextDecoder().decode(headerBytes);

      // Kontrola, zda je obrázek šifrovaný
      if (headerText.includes('ENCRYPTED:')) {
        isEncryptedContent.value = true;

        if (headerText.includes('AES-128')) {
          decryptionType.value = 'aes128';
        } else if (headerText.includes('AES-256')) {
          decryptionType.value = 'aes256';
        }

        if (!decryptionPassword.value) {
          emit('show-message', {
            message: `Obsah je šifrován (${decryptionType.value.toUpperCase()}). Zadejte prosím heslo.`,
            type: 'warning'
          });

          revealedImageUrl.value = '';
          revealedData.value = 'Zašifrovaný obsah (obrázek). Zadejte prosím heslo pro dešifrování.';

          scrollTo('.scroll-to-decode');
          return;
        }

        throw new Error('Dešifrování obrázků není aktuálně podporováno.');
      }

      const revealedCanvas = document.createElement('canvas');
      revealedCanvas.width = revealedImageData.width;
      revealedCanvas.height = revealedImageData.height;

      const revealedCtx = revealedCanvas.getContext('2d');
      if (!revealedCtx) throw new Error('Nelze získat kontext pro zobrazení odkrytého obrázku.');
      revealedCtx.putImageData(revealedImageData, 0, 0);

      revealedImageUrl.value = revealedCanvas.toDataURL('image/png');
      revealedData.value = '';

      emit('show-message', {
        message: 'Obrázek byl úspěšně odkryt.',
        type: 'success'
      });

      scrollTo('.scroll-to-decode');
    }
  }

  // Pomocná funkce pro stahovíní souborů s dialogem pro název
  function prepareDownload(defaultName, fileType, callback) {
    downloadFileName.value = defaultName;
    downloadFileType.value = fileType;
    downloadCallback.value = callback;
    showFileNameDialog.value = true;
  }

  // Funkce pro provedení stažení souboru
  function performDownload() {
    if (!downloadFileName.value) {
      emit('show-message', {
        message: 'Název souboru nesmí být prázdný.',
        type: 'error'
      });
      return;
    }
    if (typeof downloadCallback.value === 'function') {
      downloadCallback.value(downloadFileName.value);
    }
    showFileNameDialog.value = false;
  }

  // Funkce pro stažení výsledného obrázku s ukrytými daty
  function downloadStegoImage() {
    if (!stegoImageUrl.value) {
      emit('show-message', {
        message: 'Nejprve musíte ukrýt data v obrázku.',
        type: 'error'
      });
      return;
    }

    prepareDownload('steganografie_obrazek', '.png', (fileName) => {
      const link = document.createElement('a');
      link.href = stegoImageUrl.value;
      link.download = `${fileName}${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      emit('show-message', {
        message: 'Obrázek s ukrytými daty byl úspěšně stažen.',
        type: 'success'
      });
    });
  }

  // Funkce pro kopírování odkrytého textu do schránky
  function copyRevealedText() {
    if (!revealedData.value) {
      emit('show-message', {
        message: 'Není k dispozici žádný text ke kopírování.',
        type: 'error'
      });
      return;
    }

    navigator.clipboard
      .writeText(revealedData.value)
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

  // Funkce pro stažení odkrytého textu jako TXT souboru
  function downloadRevealedText() {
    if (!revealedData.value) {
      emit('show-message', {
        message: 'Není k dispozici žádný text ke stažení.',
        type: 'error'
      });
      return;
    }

    prepareDownload('odkryta_zprava', '.txt', (fileName) => {
      const blob = new Blob([revealedData.value], { type: 'text/plain;charset=utf-8' });
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

  // Funkce pro stažení odkrytého obrázku
  function downloadRevealedImage() {
    if (!revealedImageUrl.value) {
      emit('show-message', {
        message: 'Není k dispozici žádný obrázek ke stažení.',
        type: 'error'
      });
      return;
    }

    prepareDownload('odkryty_obrazek', '.png', (fileName) => {
      const link = document.createElement('a');
      link.href = revealedImageUrl.value;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      emit('show-message', {
        message: 'Odkrytý obrázek byl úspěšně stažen.',
        type: 'success'
      });
    });
  }

  // Funkce pro import textu ze souboru
  function triggerSecretTextFileInput() {
    secretTextFileInput.value.click();
  }

  // Import tajné zprávy ze souboru
  function importSecretTextFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      secretText.value = e.target.result;
      emit('show-message', {
        message: `Soubor "${file.name}" byl úspěšně importován jako text k ukrytí.`,
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

  // Reset výstupu při změně záložky
  function resetOutputs() {
    if (activeTab.value === 'hide') {
      stegoFile.value = null;
      stegoImagePreview.value = '';
      revealedData.value = '';
      revealedImageUrl.value = '';
      isEncryptedContent.value = false;
      decryptionPassword.value = '';
      decryptionType.value = 'none';
      showDecryptPassword.value = false;
      revealMode.value = 'auto';
      revealBitsPerChannel.value = 1;
    } else if (activeTab.value === 'reveal') {
      stegoImageUrl.value = '';
      carrierFile.value = null;
      secretText.value = '';
      secretImageFile.value = null;
      carrierImagePreview.value = '';
      secretImagePreview.value = '';
      carrierImageInfo.value = null;
      secretImageInfo.value = null;
      encryptionType.value = 'none';
      encryptionPassword.value = '';
      showPassword.value = false;
      hideMode.value = 'text';
      bitsPerChannel.value = 1;
    }

    emit('show-message', { message: '', type: 'info' });
  }

  // Inicializace referencí na canvasy po načtení komponenty
  onMounted(() => {
    // Ujistíme se, že všechny canvasy jsou správně referencovány

    if (
      (!carrierCanvas.value && carrierImagePreview.value) ||
      (!secretCanvas.value && secretImagePreview.value) ||
      (!stegoCanvas.value && stegoImagePreview.value)
    ) {
      console.warn(
        'Některé canvasy pro náhledy (carrier, secret, stego) nejsou při inicializaci komponenty dostupné. To je očekávané, pokud nejsou obrázky ještě načteny a zobrazeny, a canvasy se objeví později.'
      );
    }
  });

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();

      if (!text) {
        emit('show-message', {
          message: 'Schránka je prázdná nebo neobsahuje text',
          type: 'warning'
        });
        return;
      }

      secretText.value = text;
      emit('show-message', {
        message: 'Text ze schránky byl vložen',
        type: 'success'
      });
    } catch (err) {
      emit('show-message', {
        message: `Nepodařilo se přečíst obsah schránky: ${err.message || 'Přístup ke schránce byl odepřen'}`,
        type: 'error'
      });
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

  watch(hideMode, (newMode) => {
    secretText.value = '';
    secretImageFile.value = null;
    secretImagePreview.value = '';
    secretImageInfo.value = null;

    encryptionType.value = 'none';
    encryptionPassword.value = '';
    showPassword.value = false;

    updateMaxTextLength();

    emit('show-message', { message: '', type: 'info' });

    stegoImageUrl.value = '';
  });

  watch(revealMode, (newMode) => {
    revealedData.value = '';
    revealedImageUrl.value = '';

    if (newMode !== 'text') {
      decryptionPassword.value = '';
      isEncryptedContent.value = false;
    }

    emit('show-message', { message: '', type: 'info' });
  });

  watch([bitsPerChannel, revealBitsPerChannel], () => {
    if (activeTab.value === 'hide') {
      stegoImageUrl.value = '';
    } else {
      revealedData.value = '';
      revealedImageUrl.value = '';
    }

    if (activeTab.value === 'hide') {
      updateMaxTextLength();
    }

    emit('show-message', { message: '', type: 'info' });
  });
  const secretMessageBinary = computed(() => {
    if (hideMode.value === 'text') {
      return textToBinary(secretText.value);
    }
    return '';
  });

  // Funkce pro převod textu na binární reprezentaci
  function textToBinary(text) {
    if (!text) return '';

    return Array.from(text)
      .map((char) => {
        const binary = char.charCodeAt(0).toString(2).padStart(8, '0');
        return binary;
      })
      .join(' ');
  }

  // Funkce pro kontrolu, zda text obsahuje znaky mimo latinku
  function hasNonLatinChars(text) {
    if (!text) return false;

    return /[ěščřžýáíéúůĚŠČŘŽÝÁÍÉÚŮ]/i.test(text);
  }


</script>

<style scoped>
  .binary-representation {
    background-color: #f5f5f5;
    border-radius: 4px;
    padding: 8px 12px;
    border: 1px dashed #ccc;
    margin-bottom: 1rem;
  }

  .binary-text {
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 100px;
    overflow-y: auto;
    font-family: monospace;
    font-size: 0.85rem;
    line-height: 1.5;
  }

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
