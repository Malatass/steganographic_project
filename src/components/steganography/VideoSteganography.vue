<template>
  <div class="video-steganography">
    <v-tabs v-model="activeTab" class="mb-6" color="primary" @update:model-value="resetOutputs">
      <v-tab value="hide">Ukrýt zprávu</v-tab>
      <v-tab value="reveal">Odkrýt zprávu</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="hide">
        <v-card class="mb-8 pa-4" outlined>
          <v-card-title class="text-h5">Ukrýt zprávu do snímku videa</v-card-title>
          <v-card-subtitle>Tato funkce umožňuje ukrýt zprávu do jednoho snímku videa. Pro odkrytí bude nutné znát číslo snímku.</v-card-subtitle>

          <v-card-text>
            <label>Vyberte video jako nosič:</label>
            <v-file-input
              v-model="videoFile"
              label="Vyberte video (MP4)"
              accept="video/mp4"
              prepend-icon="mdi-video"
              outlined
              variant="outlined"
              class="mt-1"
              @update:model-value="onVideoSelected"
              :disabled="isProcessing"
            ></v-file-input>

            <div v-if="videoInfo" class="mb-4 pa-3 border rounded">
              <p><strong>Informace o videu:</strong></p>
              <p>Délka: {{ formatDuration(videoInfo.duration) }}</p>
              <p>Rozměry: {{ videoInfo.width }} × {{ videoInfo.height }} px</p>
              <p>Počet snímků: {{ videoInfo.frameCount }} (odhad)</p>
            </div>

            <div class="mb-4">
              <v-text-field
                v-model="frameIndex"
                type="number"
                label="Číslo snímku pro ukrytí (0 = první snímek)"
                min="0"
                :max="videoInfo ? Math.floor(videoInfo.frameCount) - 1 : 0"
                :disabled="!videoFile || isProcessing"
                variant="outlined"
              ></v-text-field>
            </div>

            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-1">
                <label>Text k ukrytí</label>
                <div class="d-flex gap-2">
                  <v-btn size="small" variant="outlined" color="primary" @click="pasteSecretFromClipboard">
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

              <v-textarea
                v-model="secretMessage"
                rows="3"
                auto-grow
                outlined
                variant="outlined"
                class="mb-4"
                :disabled="!videoFile || isProcessing"
                counter
              ></v-textarea>

              <v-alert v-if="hasNonLatinChars(secretMessage)" type="warning" variant="tonal" density="comfortable" class="mt-2">
                <strong>Poznámka:</strong>
                Váš text obsahuje české znaky (ěščřžýáíéúů). Aplikace aktuálně český text nepodporuje.
              </v-alert>
            </div>

            <v-alert type="info" variant="tonal" class="mb-4" icon="mdi-information-outline">
              <p>Systém umožňuje ukládat zprávy pouze do jednotlivých snímků videa, ne do celého videa najednou.</p>
              <p class="mb-0">Po ukrytí zprávy budete moci stáhnout upravený snímek jako obrázek.</p>
            </v-alert>

            <v-btn color="secondary" @click="hideMessageInVideo" :disabled="!videoFile || !secretMessage || isProcessing" :loading="isProcessing">
              Ukrýt zprávu
            </v-btn>

            <div v-if="modifiedFrameUrl" class="mt-6">
              <h4 class="mb-2">Snímek s ukrytou zprávou:</h4>
              <img :src="modifiedFrameUrl" class="border frame-preview" alt="Snímek s ukrytou zprávou" />
              <p class="mt-2 text-body-2">
                <strong>Zpráva byla ukryta ve snímku {{ currentFrameIndex }}.</strong>
                Pro pozdější extrakci zprávy si snímek stáhněte a zapamatujte si číslo snímku.
              </p>

              <div class="d-flex gap-2 mt-2">
                <v-btn color="secondary" @click="prepareFrameForReveal">
                  <v-icon class="mr-2">mdi-magnify</v-icon>
                  Odkrýt zprávu z tohoto obrázeku
                </v-btn>

                <v-btn color="success" class="ml-2" @click="openDownloadDialog">
                  <v-icon class="mr-2">mdi-download</v-icon>
                  Stáhnout obrázek
                </v-btn>
              </div>
              <v-dialog v-model="downloadDialog" max-width="400">
                <v-card>
                  <v-card-title>Stáhnout soubor</v-card-title>
                  <v-card-text>
                    <v-text-field
                      v-model="downloadFileName"
                      label="Název souboru"
                      outlined
                      :suffix="downloadFileSuffix"
                      autofocus
                      variant="outlined"
                    ></v-text-field>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="downloadDialog = false">Zrušit</v-btn>
                    <v-btn color="primary" @click="downloadModifiedFrame">Stáhnout</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>

      <v-window-item value="reveal">
        <v-card class="mb-8 pa-4" outlined>
          <v-card-title class="text-h5">Odkrýt zprávu ze snímku</v-card-title>
          <v-card-text>
            <div v-if="!useInMemoryFrame">
              <v-window v-model="revealSource">
                <v-window-item value="image">
                  <label>Vyberte obrázek s ukrytými daty:</label>
                  <v-file-input
                    v-model="stegoImageFile"
                    accept="image/*"
                    prepend-icon="mdi-image-search"
                    label="Vyberte obrázek"
                    outlined
                    class="mt-1"
                    variant="outlined"
                    @update:model-value="onStegoImageSelected"
                    :disabled="isProcessing"
                  ></v-file-input>
                </v-window-item>

                <v-window-item value="video">
                  <v-file-input
                    v-model="stegoVideoFile"
                    label="Vyberte originální video s ukrytou zprávou (MP4)"
                    accept="video/mp4"
                    prepend-icon="mdi-video"
                    outlined
                    variant="outlined"
                    class="mb-4"
                    @update:model-value="onStegoVideoSelected"
                    :disabled="isProcessing"
                  ></v-file-input>

                  <div class="mb-4">
                    <v-text-field
                      v-model="revealFrameIndex"
                      type="number"
                      label="Číslo snímku s ukrytou zprávou"
                      min="0"
                      :disabled="!stegoVideoFile || isProcessing"
                      variant="outlined"
                    ></v-text-field>
                  </div>

                  <v-alert type="warning" variant="tonal" class="mb-4" icon="mdi-alert-outline">
                    <p>
                      <strong>Upozornění:</strong>
                      Odkrývání z původního videa může být nespolehlivé, protože formát MP4 používá kompresi, která může poškodit ukrytá data.
                    </p>
                    <p class="mb-0">Pro spolehlivější výsledky použijte uložený snímek z předchozího kroku.</p>
                  </v-alert>
                </v-window-item>
              </v-window>
            </div>

            <div v-if="useInMemoryFrame" class="mb-4 pa-3 border rounded">
              <p><strong>Používání snímku v paměti</strong></p>
              <div class="d-flex align-center">
                <img :src="modifiedFrameUrl" class="frame-preview-small mr-4" alt="Snímek v paměti" />
                <div>
                  <p>Pracujete s aktuálně vygenerovaným snímkem v paměti.</p>
                  <v-btn small color="error" @click="clearInMemoryFrame" class="mt-2">Zrušit a použít jiný zdroj</v-btn>
                </div>
              </div>
            </div>

            <v-btn
              color="secondary"
              @click="revealMessageFromVideo"
              :disabled="
                (!stegoVideoFile && !stegoImageFile && !useInMemoryFrame) ||
                (revealSource === 'video' && !stegoVideoFile && !useInMemoryFrame) ||
                (revealSource === 'image' && !stegoImageFile && !useInMemoryFrame) ||
                isProcessing
              "
              :loading="isProcessing"
            >
              Odkrýt zprávu
            </v-btn>

            <template v-if="revealedMessage">
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
            </template>
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
  import { ref, watch } from 'vue';
  import { hideTextInVideoFrame, revealTextFromVideoFrame } from '../../stegonography/video';

  const emit = defineEmits(['show-message']);

  const activeTab = ref('hide');
  const isProcessing = ref(false);
  const useInMemoryFrame = ref(false);
  const revealSource = ref('image'); // 'video' nebo 'image'

  // Sekce pro ukrývání do videa
  const videoFile = ref(null);
  const videoInfo = ref(null);
  const frameIndex = ref(0);
  const secretMessage = ref('');
  const modifiedFrameUrl = ref('');
  const currentFrameIndex = ref(0);
  const stegoFrameCanvas = ref(null); // Uložení plátna s ukrytými daty

  // Sekce pro odkrývání z videa
  const stegoVideoFile = ref(null);
  const stegoImageFile = ref(null);
  const revealFrameIndex = ref(0);
  const revealedMessage = ref('');

  // Reference na video a obrázek elementy (nejsou zobrazeny v UI)
  const videoElement = document.createElement('video');
  const stegoVideoElement = document.createElement('video');
  const stegoImageElement = document.createElement('img');

  const downloadDialog = ref(false);
  const downloadFileName = ref('stego_frame');
  const downloadFileSuffix = ref('.png');

  const secretMessageFileInput = ref(null);

  function resetOutputs() {
    if (activeTab.value === 'hide') {
      revealedMessage.value = '';
    } else {
      if (!useInMemoryFrame.value) {
        modifiedFrameUrl.value = '';
        currentFrameIndex.value = 0;
        stegoFrameCanvas.value = null;
      }
    }
    emit('show-message', { message: '', type: 'info' });
  }

  // Zpracování vybraného video souboru pro nosič
  function onVideoSelected() {
    if (!videoFile.value) {
      videoInfo.value = null;
      return;
    }

    isProcessing.value = true;
    const url = URL.createObjectURL(videoFile.value);
    videoElement.src = url;

    videoElement.onloadedmetadata = () => {
      videoInfo.value = {
        duration: videoElement.duration,
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
        frameCount: Math.floor(videoElement.duration * 30) // Předpokládáme 30 snímků za sekundu
      };
      isProcessing.value = false;
      emit('show-message', { message: 'Video úspěšně načteno.', type: 'success' });
    };

    videoElement.onerror = () => {
      isProcessing.value = false;
      emit('show-message', { message: 'Nepodařilo se načíst video.', type: 'error' });
      URL.revokeObjectURL(url);
    };
  }

  // Zpracování vybraného videa s ukrytými daty pro odkrytí
  function onStegoVideoSelected() {
    if (!stegoVideoFile.value) return;

    const url = URL.createObjectURL(stegoVideoFile.value);
    stegoVideoElement.src = url;

    stegoVideoElement.onloadedmetadata = () => {
      emit('show-message', { message: 'Video s ukrytými daty úspěšně načteno.', type: 'success' });
    };

    stegoVideoElement.onerror = () => {
      emit('show-message', { message: 'Nepodařilo se načíst video s ukrytými daty.', type: 'error' });
      URL.revokeObjectURL(url);
    };
  }

  // Zpracování vybraného obrázku s ukrytými daty pro odkrytí
  function onStegoImageSelected() {
    if (!stegoImageFile.value) return;

    const url = URL.createObjectURL(stegoImageFile.value);
    stegoImageElement.src = url;

    stegoImageElement.onload = () => {
      emit('show-message', { message: 'Obrázek s ukrytými daty úspěšně načten.', type: 'success' });
    };

    stegoImageElement.onerror = () => {
      emit('show-message', { message: 'Nepodařilo se načíst obrázek s ukrytými daty.', type: 'error' });
      URL.revokeObjectURL(url);
    };
  }

  // Funkce pro ukrytí zprávy ve snímku videa
  async function hideMessageInVideo() {
    if (!videoFile.value || !secretMessage.value) {
      emit('show-message', { message: 'Vyberte video a zadejte zprávu.', type: 'error' });
      return;
    }

    isProcessing.value = true;
    emit('show-message', { message: 'Probíhá ukrývání zprávy...', type: 'info' });

    try {
      const result = await hideTextInVideoFrame(videoElement, secretMessage.value, parseInt(frameIndex.value), 1);
      modifiedFrameUrl.value = result.modifiedFrame;
      currentFrameIndex.value = result.frameIndex;
      stegoFrameCanvas.value = result.frameCanvas; // Uložení plátna pro pozdější použití

      emit('show-message', { message: 'Zpráva byla úspěšně ukryta ve snímku videa.', type: 'success' });
    } catch (error) {
      emit('show-message', { message: `Chyba při ukrývání zprávy: ${error.message}`, type: 'error' });
    } finally {
      isProcessing.value = false;
    }
  }

  // Příprava snímku v paměti pro odkrytí
  function prepareFrameForReveal() {
    if (stegoFrameCanvas.value) {
      useInMemoryFrame.value = true;
      activeTab.value = 'reveal'; // Přepnutí na záložku odkrytí
      // Vyčištění vstupů souborů, protože používáme snímek v paměti
      stegoVideoFile.value = null;
      stegoImageFile.value = null;
      emit('show-message', { message: 'Připraveno k odkrytí zprávy z aktuálně vygenerovaného snímku.', type: 'info' });
    } else {
      emit('show-message', { message: 'Nejprve ukryjte zprávu pro použití této funkce.', type: 'warning' });
    }
  }

  // Vyčištění snímku v paměti
  function clearInMemoryFrame() {
    useInMemoryFrame.value = false;
    emit('show-message', { message: 'Režim snímku v paměti zrušen. Můžete nyní načíst video nebo obrázek.', type: 'info' });
  }

  // Funkce pro odkrytí zprávy ze snímku videa nebo obrázku
  async function revealMessageFromVideo() {
    if (
      (!stegoVideoFile.value && !stegoImageFile.value && !useInMemoryFrame.value) ||
      (revealSource.value === 'video' && !stegoVideoFile.value && !useInMemoryFrame.value) ||
      (revealSource.value === 'image' && !stegoImageFile.value && !useInMemoryFrame.value)
    ) {
      emit('show-message', { message: 'Vyberte video, obrázek nebo použijte aktuální snímek.', type: 'error' });
      return;
    }

    isProcessing.value = true;
    emit('show-message', { message: 'Probíhá odkrývání zprávy...', type: 'info' });

    try {
      let revealed;

      if (useInMemoryFrame.value && stegoFrameCanvas.value) {
        // Odkrytí z plátna v paměti
        revealed = await revealTextFromVideoFrame(stegoFrameCanvas.value, 0, 1);
      } else if (revealSource.value === 'image' && stegoImageFile.value) {
        // Odkrytí ze souboru obrázku
        revealed = await revealTextFromVideoFrame(stegoImageElement, 0, 1);
      } else {
        // Odkrytí ze souboru videa
        revealed = await revealTextFromVideoFrame(stegoVideoElement, parseInt(revealFrameIndex.value), 1);
      }

      revealedMessage.value = revealed;
      emit('show-message', { message: 'Zpráva byla úspěšně odkryta.', type: 'success' });
    } catch (error) {
      emit('show-message', { message: `Chyba při odkrývání zprávy: ${error.message}`, type: 'error' });
      revealedMessage.value = '';
    } finally {
      isProcessing.value = false;
    }
  }

  // Otevření dialogu pro stažení
  function openDownloadDialog() {
    downloadFileName.value = `stego_frame_${currentFrameIndex.value}`;
    downloadDialog.value = true;
  }

  // Stažení upraveného snímku s ukrytou zprávou
  function downloadModifiedFrame() {
    if (!modifiedFrameUrl.value) return;
    const link = document.createElement('a');
    link.href = modifiedFrameUrl.value;
    link.download = `${downloadFileName.value || 'stego_frame'}${downloadFileSuffix.value}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    downloadDialog.value = false;
    emit('show-message', { message: 'Snímek byl úspěšně stažen.', type: 'success' });
  }

  // Kopírování odkryté zprávy do schránky
  function copyRevealedMessage() {
    if (!revealedMessage.value) return;

    navigator.clipboard
      .writeText(revealedMessage.value)
      .then(() => {
        emit('show-message', { message: 'Zpráva byla zkopírována do schránky.', type: 'success' });
      })
      .catch((err) => {
        emit('show-message', { message: `Nepodařilo se zkopírovat zprávu: ${err}`, type: 'error' });
      });
  }

  // Stažení odkryté zprávy jako textového souboru
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

  // Formátování délky videa
  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Vyvolání dialogu pro výběr souboru s tajnou zprávou
  function triggerSecretMessageFileInput() {
    secretMessageFileInput.value.click();
  }

  // Vložení textu ze schránky do pole pro tajnou zprávu
  async function pasteSecretFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        emit('show-message', { message: 'Schránka je prázdná nebo neobsahuje text', type: 'warning' });
        return;
      }
      secretMessage.value = text;
      emit('show-message', { message: 'Text ze schránky byl vložen', type: 'success' });
    } catch (err) {
      emit('show-message', { message: `Nepodařilo se přečíst obsah schránky: ${err.message || 'Přístup ke schránce byl odepřen'}`, type: 'error' });
    }
  }

  // Import tajné zprávy ze souboru
  function importSecretMessageFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      secretMessage.value = e.target.result;
      emit('show-message', { message: `Soubor "${file.name}" byl úspěšně importován jako text k ukrytí.`, type: 'success' });
    };
    reader.onerror = (e) => {
      emit('show-message', { message: `Chyba při čtení souboru: ${e.target.error}`, type: 'error' });
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  // Kontrola, zda text obsahuje neanglické znaky
  function hasNonLatinChars(text) {
    if (!text) return false;
    // Kontrola jakýchkoliv ne-ASCII znaků (včetně českých)
    return /[ěščřžýáíéúůĚŠČŘŽÝÁÍÉÚŮ]/i.test(text);
  }

  // Sledování změn aktivní záložky a resetování stavu
  watch(activeTab, (newTab) => {
    if (newTab === 'hide') {
      // Reset sekce odkrývání
      revealedMessage.value = '';
      stegoVideoFile.value = null;
      stegoImageFile.value = null;
      revealFrameIndex.value = 0;
      useInMemoryFrame.value = false;
    } else {
      // Reset sekce ukrývání
      secretMessage.value = '';
      frameIndex.value = 0;
    }
    emit('show-message', { message: '', type: 'info' });
  });

  const downloadFileType = ref('.txt');
  const downloadCallback = ref(null);

  // Název souboru pro stahování
  const showFileNameDialog = ref(false);

  function prepareDownload(defaultName, fileType, callback) {
    downloadFileName.value = defaultName;
    downloadFileType.value = fileType;
    downloadCallback.value = callback;
    showFileNameDialog.value = true;
  }

  function performDownload() {
    if (!downloadFileName.value) {
      emit('show-message', {
        message: 'Název souboru nesmí být prázdný.',
        type: 'error'
      });
      return;
    }

    if (!downloadCallback.value || typeof downloadCallback.value !== 'function') {
      emit('show-message', {
        message: 'Chyba při stahování: Neplatná funkce pro stažení.',
        type: 'error'
      });
      return;
    }
    if (typeof downloadCallback.value === 'function') {
      downloadCallback.value(downloadFileName.value);
    }
    showFileNameDialog.value = false;
  }
</script>

<style scoped>
  .video-steganography {
    margin-bottom: 2rem;
  }

  .border {
    border: 1px solid #e0e0e0;
  }

  .rounded {
    border-radius: 4px;
  }

  .frame-preview {
    max-width: 100%;
    border-radius: 4px;
  }

  .frame-preview-small {
    max-width: 100px;
    max-height: 60px;
    border-radius: 4px;
  }
  .revealed-text {
    margin-top: 1rem;
  }

  .v-card + .v-card {
    margin-top: 2rem;
  }

  .gap-2 {
    gap: 8px;
  }
</style>
