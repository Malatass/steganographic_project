<template>
  <div class="audio-steganography">
    <v-tabs v-model="activeTab" class="mb-6" color="primary" @update:model-value="resetOutputs">
      <v-tab value="hide">Ukrýt zprávu</v-tab>
      <v-tab value="reveal">Odkrýt zprávu</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- Hide Tab -->
      <v-window-item value="hide">
        <v-card class="mb-8 pa-4" outlined>
          <v-card-title class="text-h5">Ukrýt zprávu do audia</v-card-title>
          <v-card-text>
            <v-file-input
              v-model="carrierAudioFile"
              label="Vyberte audio nosič (WAV, MP3)"
              accept="audio/wav, audio/mpeg"
              prepend-icon="mdi-music-note"
              outlined
              variant="outlined"
              class="mb-4"
              @update:model-value="onCarrierAudioSelected"
              :disabled="isProcessing"
            ></v-file-input>

            <div v-if="carrierAudioInfo" class="mb-4 pa-3 border rounded">
              <p><strong>Informace o audiu:</strong></p>
              <p>Trvání: {{ carrierAudioInfo.duration.toFixed(2) }}s</p>
              <p>Vzorkovací frekvence: {{ carrierAudioInfo.sampleRate }} Hz</p>
              <p>Počet kanálů: {{ carrierAudioInfo.channels }}</p>
              <p>Maximální kapacita pro zprávu: {{ formatCapacity(carrierAudioInfo.capacity) }}</p>
            </div>

            <v-alert v-if="carrierAudioFile && carrierAudioFile.type === 'audio/mpeg'" type="warning" variant="tonal" class="mb-4">
              MP3 je ztrátový formát a může způsobit ztrátu ukrytých dat. Pro lepší výsledky doporučujeme použít formát WAV.
            </v-alert>
            <v-textarea
              v-model="secretMessage"
              label="Tajná zpráva k ukrytí"
              rows="3"
              auto-grow
              outlined
              variant="outlined"
              class="mb-4"
              :disabled="!carrierAudioFile || isProcessing"
              :maxlength="carrierAudioInfo ? Math.floor((carrierAudioInfo.sampleRate * carrierAudioInfo.duration - 16) / 8) : 0"
              counter
            ></v-textarea>

            <v-btn color="secondary" @click="performHideInAudio" :disabled="!carrierAudioFile || !secretMessage || isProcessing" :loading="isProcessing">
              Ukrýt zprávu
            </v-btn>

            <div v-if="stegoAudioUrl" class="mt-6">
              <h4 class="mb-2">Audio s ukrytou zprávou:</h4>
              <audio controls :src="stegoAudioUrl" class="w-100"></audio>
              <v-btn small color="primary" @click="prepareStegoAudioForReveal" class="mt-2">Odkrýt zprávu z tohoto audia</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Reveal Tab -->
      <v-window-item value="reveal">
        <v-card class="mb-8 pa-4" outlined>
          <v-card-title class="text-h5">Odkrýt zprávu z audia</v-card-title>
          <v-card-text>
            <v-file-input
              v-model="stegoAudioFileForReveal"
              label="Vyberte audio s ukrytou zprávou (WAV, MP3)"
              accept="audio/wav, audio/mpeg"
              prepend-icon="mdi-music-note-search"
              outlined
              variant="outlined"
              class="mb-4"
              @update:model-value="onStegoAudioForRevealSelected"
              :disabled="isProcessing"
            ></v-file-input>

            <v-btn color="secondary" @click="performRevealFromAudioFile" :disabled="!stegoAudioBufferForReveal || isProcessing" :loading="isProcessing">
              Odkrýt zprávu
            </v-btn>

            <div v-if="revealedMessage" class="mt-6">
              <h4 class="mb-2">Odkrytá zpráva:</h4>
              <v-textarea v-model="revealedMessage" label="Odkrytý text" rows="5" auto-grow outlined readonly variant="outlined" class="mb-4"></v-textarea>
              <v-btn color="success" @click="copyRevealedMessage">
                <v-icon class="mr-2">mdi-content-copy</v-icon>
                Kopírovat do schránky
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { hideInAudio, revealFromAudio } from '../../stegonography/audio'; // Correct path

  const emit = defineEmits(['show-message']);

  const activeTab = ref('hide');
  const isProcessing = ref(false);

  // Hide section
  const carrierAudioFile = ref(null);
  const carrierAudioBuffer = ref(null);
  const carrierAudioInfo = ref(null);
  const secretMessage = ref('');
  const stegoAudioBufferInMemory = ref(null); // To hold the AudioBuffer after hiding
  const stegoAudioUrl = ref(''); // For the <audio> tag src

  // Reveal section
  const stegoAudioFileForReveal = ref(null);
  const stegoAudioBufferForReveal = ref(null);
  const revealedMessage = ref('');

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  function resetOutputs() {
    // Reset relevant fields when switching tabs or methods
    stegoAudioUrl.value = '';
    revealedMessage.value = '';
    stegoAudioBufferInMemory.value = null;
    if (activeTab.value === 'hide') {
      stegoAudioFileForReveal.value = null;
      stegoAudioBufferForReveal.value = null;
    } else {
      carrierAudioFile.value = null;
      carrierAudioBuffer.value = null;
      carrierAudioInfo.value = null;
      secretMessage.value = '';
    }
    emit('show-message', { message: '', type: 'info' });
  }

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

  async function onCarrierAudioSelected() {
    isProcessing.value = true;
    carrierAudioBuffer.value = await loadAudioFileAsBuffer(carrierAudioFile.value);
    if (carrierAudioBuffer.value) {
      const buffer = carrierAudioBuffer.value;
      const capacityBytes = Math.floor((buffer.getChannelData(0).length - 16) / 8); // 16 bits for delimiter
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

  async function performHideInAudio() {
    if (!carrierAudioBuffer.value || !secretMessage.value) {
      emit('show-message', { message: 'Prosím, nahrajte audio a zadejte zprávu.', type: 'error' });
      return;
    }
    isProcessing.value = true;
    emit('show-message', { message: 'Probíhá ukrývání zprávy...', type: 'info' });

    // Simulate delay for processing
    await new Promise((resolve) => setTimeout(resolve, 50));

    const resultBuffer = hideInAudio(carrierAudioBuffer.value, secretMessage.value);

    if (resultBuffer) {
      stegoAudioBufferInMemory.value = resultBuffer;
      // Create a WAV blob for playback
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

  function prepareStegoAudioForReveal() {
    if (stegoAudioBufferInMemory.value) {
      stegoAudioBufferForReveal.value = stegoAudioBufferInMemory.value;
      activeTab.value = 'reveal'; // Switch to reveal tab
      // Clear file input if user wants to use in-memory audio
      stegoAudioFileForReveal.value = null;
      emit('show-message', { message: 'Připraveno k odkrytí zprávy z aktuálně vygenerovaného audia.', type: 'info' });
      performRevealFromGivenBuffer(stegoAudioBufferInMemory.value);
    } else {
      emit('show-message', { message: 'Nejprve ukryjte zprávu pro použití této funkce.', type: 'warning' });
    }
  }

  async function onStegoAudioForRevealSelected() {
    isProcessing.value = true;
    stegoAudioBufferForReveal.value = await loadAudioFileAsBuffer(stegoAudioFileForReveal.value);
    if (stegoAudioBufferForReveal.value) {
      emit('show-message', { message: 'Audio pro odkrytí úspěšně načteno.', type: 'success' });
    }
    isProcessing.value = false;
  }

  async function performRevealFromAudioFile() {
    if (!stegoAudioBufferForReveal.value) {
      emit('show-message', { message: 'Prosím, nahrajte audio s ukrytou zprávou.', type: 'error' });
      return;
    }
    performRevealFromGivenBuffer(stegoAudioBufferForReveal.value);
  }

  async function performRevealFromGivenBuffer(bufferToReveal) {
    isProcessing.value = true;
    emit('show-message', { message: 'Probíhá odkrývání zprávy...', type: 'info' });

    // Simulate delay for processing
    await new Promise((resolve) => setTimeout(resolve, 50));

    const message = revealFromAudio(bufferToReveal);
    if (message !== null) {
      revealedMessage.value = message;
      emit('show-message', { message: 'Zpráva úspěšně odkryta.', type: 'success' });
    } else {
      revealedMessage.value = '';
      emit('show-message', { message: 'Nepodařilo se odkrýt zprávu nebo žádná zpráva nebyla nalezena.', type: 'warning' });
    }
    isProcessing.value = false;
  }

  function formatCapacity(byteSize) {
    if (!byteSize || byteSize < 0) return '0 B';
    if (byteSize < 1024) return `${byteSize} B`;
    if (byteSize < 1024 * 1024) return `${(byteSize / 1024).toFixed(2)} KB`;
    return `${(byteSize / (1024 * 1024)).toFixed(2)} MB`;
  }

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

  // Helper function to convert AudioBuffer to a WAV Blob (simplified)
  function audioBufferToWavBlob(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const numFrames = audioBuffer.length;
    const bitsPerSample = 16; // Standard for WAV

    const interleaved = new Int16Array(numFrames * numChannels);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < numFrames; i++) {
        // Convert float sample to 16-bit integer
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        interleaved[i * numChannels + channel] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      }
    }

    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = numFrames * numChannels * (bitsPerSample / 8);
    const bufferSize = 44 + dataSize; // 44 bytes for WAV header

    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true); // ChunkSize
    writeString(view, 8, 'WAVE');
    // FMT sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // DATA sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM data
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++, offset += 2) {
      view.setInt16(offset, interleaved[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
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
</style>
