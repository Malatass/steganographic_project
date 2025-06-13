<template>
  <div class="audio-steganography">
    <!-- Záložky pro ukrytí/odkrytí zprávy -->
    <v-tabs v-model="activeTab" class="mb-6" color="primary">
      <v-tab value="hide">Ukrýt zprávu</v-tab>
      <v-tab value="reveal">Odkrýt zprávu</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- Záložka pro ukrývání zprávy -->
      <v-window-item value="hide">
        <v-card class="mb-8 pa-4" outlined>
          <v-card-title class="text-h5">Ukrýt zprávu do audia</v-card-title>
          <v-card-text>
            <label>Vyberte audio jako nosič:</label>
            <v-file-input
              v-model="carrierAudioFile"
              label="Vyberte audio nosič (WAV, MP3)"
              accept="audio/wav, audio/mpeg"
              prepend-icon="mdi-music-note"
              outlined
              variant="outlined"
              class="mt-1"
              @update:model-value="onCarrierAudioSelected"
              :disabled="isProcessing"
            ></v-file-input>

            <!-- Informace o vybraném audio souboru -->
            <div v-if="carrierAudioInfo" class="mb-4 pa-3 border rounded">
              <p><strong>Informace o audiu:</strong></p>
              <p>Trvání: {{ carrierAudioInfo.duration.toFixed(2) }}s</p>
              <p>Vzorkovací frekvence: {{ carrierAudioInfo.sampleRate }} Hz</p>
              <p>Počet kanálů: {{ carrierAudioInfo.channels }}</p>
              <p>Maximální kapacita pro zprávu: {{ formatCapacity(carrierAudioInfo.capacity) }}</p>
            </div>

            <!-- Varování o MP3 formátu -->
            <v-alert v-if="carrierAudioFile && carrierAudioFile.type === 'audio/mpeg'" type="warning" variant="tonal" class="mb-4">
              MP3 je ztrátový formát a může způsobit ztrátu ukrytých dat. Pro lepší výsledky doporučujeme použít formát WAV.
            </v-alert>

            <!-- Vstup pro tajnou zprávu -->
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

              <!-- Textové pole pro zprávu -->
              <v-textarea
                v-model="secretMessage"
                rows="3"
                auto-grow
                outlined
                variant="outlined"
                class="mb-4"
                :disabled="!carrierAudioFile || isProcessing"
                :maxlength="carrierAudioInfo ? Math.floor((carrierAudioInfo.sampleRate * carrierAudioInfo.duration - 16) / 8) : 0"
                counter
              ></v-textarea>
              <v-alert v-if="hasNonLatinChars(secretMessage)" type="info" variant="tonal" density="comfortable" class="mt-2">
                <strong>Poznámka:</strong>
                Váš text obsahuje české znaky (ěščřžýáíéúů). Audio metoda podporuje rozšířené znaky, ale může nastat chybovost.
              </v-alert>
            </div>

            <!-- Tlačítko pro ukrytí zprávy -->
            <v-btn color="secondary" @click="performHideInAudio" :disabled="!carrierAudioFile || !secretMessage || isProcessing" :loading="isProcessing">
              Ukrýt zprávu
            </v-btn>

            <!-- Výsledek ukrytí - audio přehrávač -->
            <div v-if="stegoAudioUrl" class="mt-6">
              <h4 class="mb-2">Audio s ukrytou zprávou:</h4>
              <audio controls :src="stegoAudioUrl" class="w-100"></audio>
              <div class="d-flex gap-2 mt-2">
                <v-btn color="secondary" @click="prepareStegoAudioForReveal">
                  <v-icon class="mr-2">mdi-magnify</v-icon>
                  Odkrýt zprávu z tohoto audia
                </v-btn>

                <v-btn color="success" class="ml-2" @click="openDownloadDialog" :disabled="true">
                  <v-icon class="mr-2">mdi-download</v-icon>
                  Stáhnout audio
                </v-btn>
              </div>
            </div>
            <!-- Dialog pro stažení souboru -->
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
                  <v-btn color="primary" @click="downloadStegoAudio">Stáhnout</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Záložka pro odkrývání zprávy -->
      <v-window-item value="reveal">
        <v-card class="mb-8 pa-4" outlined>
          <v-card-title class="text-h5">Odkrýt zprávu z audia</v-card-title>
          <v-card-text>
            <!-- Pokud používáme audio v paměti z předchozího kroku -->
            <div v-if="useInMemoryAudio" class="mb-4 pa-3 border rounded">
              <p><strong>Používání audia v paměti</strong></p>

              <div class="d-flex align-center">
                <audio controls :src="stegoAudioUrl" class="w-100 mr-4"></audio>
                <div>
                  <p>Pracujete s aktuálně vygenerovaným audiem v paměti.</p>
                  <v-btn small color="error" @click="clearInMemoryAudio" class="mt-2">Zrušit a použít jiný zdroj</v-btn>
                </div>
              </div>
            </div>
            <!-- Výběr audio souboru pro odkrytí -->
            <label v-if="!useInMemoryAudio">Vyberte soubor s ukrytou zprávou (WAV, MP3)</label>
            <v-file-input
              v-if="!useInMemoryAudio"
              v-model="stegoAudioFileForReveal"
              label="Vyberte audio"
              accept="audio/wav, audio/mpeg"
              prepend-icon="mdi-music-note"
              outlined
              variant="outlined"
              class="mb-4"
              @update:model-value="onStegoAudioForRevealSelected"
              :disabled="isProcessing"
            ></v-file-input>
            <!-- Tlačítko pro odkrytí zprávy -->
            <v-btn
              color="secondary"
              @click="performRevealFromAudioFile"
              :disabled="(!stegoAudioBufferForReveal && !useInMemoryAudio) || isProcessing"
              :loading="isProcessing"
            >
              Odkrýt zprávu
            </v-btn>

            <!-- Výsledek odkrytí -->
            <div v-if="revealedMessage" class="mt-6">
              <h4 class="mb-2">Odkrytá zpráva:</h4>
              <v-textarea v-model="revealedMessage" label="Odkrytý text" rows="5" auto-grow outlined readonly variant="outlined" class="mb-4"></v-textarea>
              <div class="d-flex gap-2">
                <v-btn color="success" @click="copyRevealedMessage">
                  <v-icon class="mr-2">mdi-content-copy</v-icon>
                  Kopírovat do schránky
                </v-btn>
                <v-btn color="success" @click="downloadRevealedMessage">
                  <v-icon class="mr-2">mdi-download</v-icon>
                  Stáhnout jako TXT
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { hideInAudio, revealFromAudio } from '../../stegonography/audio';

  const emit = defineEmits(['show-message']);

  const activeTab = ref('hide');
  const isProcessing = ref(false);

  // Proměnné pro ukrývání zprávy
  const carrierAudioFile = ref(null);
  const carrierAudioBuffer = ref(null);
  const carrierAudioInfo = ref(null);
  const secretMessage = ref('');
  const stegoAudioBufferInMemory = ref(null); // Pro uchování AudioBuffer po ukrytí
  const stegoAudioUrl = ref(''); // Pro src atribut <audio> tagu
  const downloadDialog = ref(false);
  const downloadFileName = ref('stego_audio');
  const downloadFileSuffix = ref('.wav');

  // Proměnné pro odkrývání zprávy
  const stegoAudioFileForReveal = ref(null);
  const stegoAudioBufferForReveal = ref(null);
  const revealedMessage = ref('');
  const useInMemoryAudio = ref(false);

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Schránka a import souborů pro tajnou zprávu
  const secretMessageFileInput = ref(null);
  function triggerSecretMessageFileInput() {
    secretMessageFileInput.value.click();
  }
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
  function importSecretMessageFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      secretMessage.value = e.target.result;
      emit('show-message', { message: `Soubor "${file.name}" byl úspěšně importován jako tajná zpráva.`, type: 'success' });
    };
    reader.onerror = (e) => {
      emit('show-message', { message: `Chyba při čtení souboru: ${e.target.error}`, type: 'error' });
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  // Načtení audio souboru jako AudioBuffer
  async function loadAudioFileAsBuffer(file) {
    if (!file) return null;
    const arrayBuffer = await file.arrayBuffer();
    try {
      return await audioContext.decodeAudioData(arrayBuffer);
    } catch (e) {
      emit('show-message', { message: `Chyba při dekódování audia: ${e.message}`, type: 'error' });
      return null;
    }
  }

  // Zpracování vybraného audio souboru pro nosič
  async function onCarrierAudioSelected() {
    // Resetování stavů souvisejících s předchozími operacemi steganografie nebo audio v paměti
    isProcessing.value = true;
    stegoAudioUrl.value = '';
    stegoAudioBufferInMemory.value = null;
    revealedMessage.value = '';
    useInMemoryAudio.value = false;
    stegoAudioFileForReveal.value = null; // Vyčištění vstupu souboru na záložce odkrytí
    stegoAudioBufferForReveal.value = null; // Vyčištění bufferu na záložce odkrytí
    carrierAudioInfo.value = null; // Resetování informací o nosiči před načtením nového

    carrierAudioBuffer.value = await loadAudioFileAsBuffer(carrierAudioFile.value);
    if (carrierAudioBuffer.value) {
      const buffer = carrierAudioBuffer.value;
      const capacityBytes = Math.floor((buffer.getChannelData(0).length - 16) / 8); // 16 bitů pro oddělovač
      carrierAudioInfo.value = {
        duration: buffer.duration,
        sampleRate: buffer.sampleRate,
        channels: buffer.numberOfChannels,
        capacity: capacityBytes > 0 ? capacityBytes : 0
      };
      emit('show-message', { message: 'Audio nosič úspěšně načten.', type: 'success' });
    } else {
      carrierAudioInfo.value = null;
    }
    isProcessing.value = false;
  }

  // Funkce pro ukrytí zprávy v audio souboru
  async function performHideInAudio() {
    if (!carrierAudioBuffer.value || !secretMessage.value) {
      emit('show-message', { message: 'Prosím, nahrajte audio a zadejte zprávu.', type: 'error' });
      return;
    }
    isProcessing.value = true;
    emit('show-message', { message: 'Probíhá ukrývání zprávy...', type: 'info' });

    // Simulace zpoždění pro zpracování
    await new Promise((resolve) => setTimeout(resolve, 50));

    const resultBuffer = hideInAudio(carrierAudioBuffer.value, secretMessage.value);

    if (resultBuffer) {
      stegoAudioBufferInMemory.value = resultBuffer;
      // Vytvoření WAV blobu pro přehrávání
      const wavBlob = audioBufferToWavBlob(resultBuffer);
      if (wavBlob) {
        stegoAudioUrl.value = URL.createObjectURL(wavBlob);
        emit('show-message', { message: 'Zpráva úspěšně ukryta v audiu.', type: 'success' });
      } else {
        emit('show-message', { message: 'Nepodařilo se vytvořit audio pro přehrání.', type: 'error' });
      }
    } else {
      emit('show-message', { message: 'Nepodařilo se ukrýt zprávu. Zpráva je možná příliš dlouhá.', type: 'error' });
    }
    isProcessing.value = false;
  }

  // Otevření dialogu pro stažení
  function openDownloadDialog() {
    downloadFileName.value = 'stego_audio';
    downloadDialog.value = true;
  }

  // Stažení audio souboru s ukrytou zprávou
  function downloadStegoAudio() {
    if (!stegoAudioBufferInMemory.value) return;
    const wavBlob = audioBufferToWavBlob(stegoAudioBufferInMemory.value);
    if (wavBlob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(wavBlob);
      link.download = `${downloadFileName.value || 'stego_audio'}${downloadFileSuffix.value}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      downloadDialog.value = false;
    }
  }

  // Příprava audio v paměti pro odkrytí
  function prepareStegoAudioForReveal() {
    if (stegoAudioBufferInMemory.value && stegoAudioUrl.value /* Ujištění, že URL je také nastavena z operace ukrytí */) {
      stegoAudioBufferForReveal.value = stegoAudioBufferInMemory.value;
      useInMemoryAudio.value = true;
      // stegoAudioUrl je již nastavena z performHideInAudio

      activeTab.value = 'reveal'; // Přepnutí na záložku odkrytí
      revealedMessage.value = ''; // Vyčištění případné předchozí odkryté zprávy na záložce odkrytí

      emit('show-message', { message: 'Připraveno k odkrytí zprávy z aktuálně vygenerovaného audia.', type: 'info' });
    } else {
      emit('show-message', { message: 'Nejprve ukryjte zprávu pro použití této funkce.', type: 'warning' });
    }
  }

  // Vyčištění audio v paměti
  function clearInMemoryAudio() {
    useInMemoryAudio.value = false;
    stegoAudioBufferForReveal.value = null;
    stegoAudioUrl.value = ''; // Vyčištění URL
    stegoAudioBufferInMemory.value = null; // Také vyčištění zdrojového bufferu pro výstup záložky ukrytí
    revealedMessage.value = ''; // Vyčištění odkryté zprávy při změně kontextu
    emit('show-message', { message: 'Režim audia v paměti zrušen. Můžete nyní načíst audio soubor.', type: 'info' });
  }

  // Zpracování vybraného audio souboru pro odkrytí
  async function onStegoAudioForRevealSelected() {
    isProcessing.value = true;
    if (stegoAudioFileForReveal.value) {
      if (stegoAudioFileForReveal.value.type !== 'audio/wav') {
        emit('show-message', {
          message: 'Varování: Nejlepší výsledky dosáhnete s formátem WAV. MP3 a jiné formáty mohou způsobit ztrátu dat.',
          type: 'warning'
        });
      }
    }
    stegoAudioBufferForReveal.value = await loadAudioFileAsBuffer(stegoAudioFileForReveal.value);
    if (stegoAudioBufferForReveal.value) {
      emit('show-message', { message: 'Audio pro odkrytí úspěšně načteno.', type: 'success' });
    }
    isProcessing.value = false;
  }

  // Funkce pro odkrytí zprávy z audio souboru
  async function performRevealFromAudioFile() {
    if (!stegoAudioBufferForReveal.value && !useInMemoryAudio.value) {
      emit('show-message', { message: 'Prosím, nahrajte audio s ukrytou zprávou.', type: 'error' });
      return;
    }
    performRevealFromGivenBuffer(stegoAudioBufferForReveal.value);
  }

  // Zpracování odkrytí zprávy z daného bufferu
  async function performRevealFromGivenBuffer(bufferToReveal) {
    isProcessing.value = true;
    emit('show-message', { message: 'Probíhá odkrývání zprávy...', type: 'info' });

    // Simulace zpoždění pro zpracování
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (!bufferToReveal) {
      emit('show-message', { message: 'Chyba: Audio buffer není k dispozici.', type: 'error' });
      isProcessing.value = false;
      return;
    }
    const message = revealFromAudio(bufferToReveal);
    if (!message) {
      emit('show-message', {
        message:
          'Nepodařilo se odkrýt zprávu. Pravděpodobně byl použit nevhodný formát (např. MP3) nebo audio neobsahuje platnou ukrytou zprávu, nebo byla zpráva ztracena při kompresi při stahování audia.',
        type: 'warning'
      });
      revealedMessage.value = '';
      isProcessing.value = false;
      return;
    }
    revealedMessage.value = message;
    emit('show-message', { message: 'Zpráva úspěšně odkryta.', type: 'success' });
    isProcessing.value = false;
  }

  // Formátování velikosti dat
  function formatCapacity(byteSize) {
    if (!byteSize || byteSize < 0) return '0 B';
    if (byteSize < 1024) return `${byteSize} B`;
    if (byteSize < 1024 * 1024) return `${(byteSize / 1024).toFixed(2)} KB`;
    return `${(byteSize / (1024 * 1024)).toFixed(2)} MB`;
  }

  // Kopírování odkryté zprávy do schránky
  function copyRevealedMessage() {
    if (!revealedMessage.value) {
      emit('show-message', { message: 'Není k dispozici žádný text ke kopírování.', type: 'error' });
      return;
    }
    navigator.clipboard
      .writeText(revealedMessage.value)
      .then(() => emit('show-message', { message: 'Text byl zkopírován do schránky.', type: 'success' }))
      .catch((err) => emit('show-message', { message: `Nepodařilo se zkopírovat text: ${err}`, type: 'error' }));
  }

  // Stažení odkryté zprávy jako textového souboru
  function downloadRevealedMessage() {
    if (!revealedMessage.value) {
      emit('show-message', { message: 'Není k dispozici žádný text ke stažení.', type: 'error' });
      return;
    }

    const blob = new Blob([revealedMessage.value], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `odkryta_zprava_audio.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    emit('show-message', { message: 'Odkrytý text byl úspěšně stažen.', type: 'success' });
  }

  // Pomocná funkce pro převod AudioBuffer na WAV Blob (zjednodušená)
  function audioBufferToWavBlob(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const numFrames = audioBuffer.length;
    const bitsPerSample = 16; // Standard pro WAV

    const interleaved = new Int16Array(numFrames * numChannels);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < numFrames; i++) {
        // Převod float vzorku na 16-bitové celé číslo
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        interleaved[i * numChannels + channel] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      }
    }

    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = numFrames * numChannels * (bitsPerSample / 8);
    const bufferSize = 44 + dataSize; // 44 bajtů pro WAV hlavičku

    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true); // ChunkSize
    writeString(view, 8, 'WAVE');
    // FMT sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 pro PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 pro PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // DATA sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Zápis PCM dat
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++, offset += 2) {
      view.setInt16(offset, interleaved[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  // Pomocná funkce pro zápis řetězce do DataView
  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // Kontrola, zda text obsahuje neanglické znaky
  function hasNonLatinChars(text) {
    if (!text) return false;
    return /[ěščřžýáíéúůĚŠČŘŽÝÁÍÉÚŮ]/i.test(text);
  }

  // Sledování změn aktivní záložky
  watch(activeTab, (newTab) => {
    emit('show-message', { message: '', type: 'info' });
    revealedMessage.value = '';

    if (newTab === 'hide') {
      stegoAudioFileForReveal.value = null;
      stegoAudioBufferForReveal.value = null;
    } else if (newTab === 'reveal') {
      carrierAudioFile.value = null;
      carrierAudioBuffer.value = null;
      carrierAudioInfo.value = null;
      secretMessage.value = '';
      if (!useInMemoryAudio.value) {
        stegoAudioUrl.value = '';
      }
    }
  });
</script>

<style scoped>
  .audio-steganography {
    margin-bottom: 2rem;
  }
  .border {
    border: 1px solid #e0e0e0;
  }
  .rounded {
    border-radius: 4px;
  }
  .w-100 {
    width: 100%;
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
