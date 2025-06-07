<template>
  <div class="video-steganography">
    <v-tabs v-model="activeTab" class="mb-6" color="primary" @update:model-value="resetOutputs">
      <v-tab value="hide">Ukrýt zprávu</v-tab>
      <v-tab value="reveal">Odkrýt zprávu</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- Hide Tab -->
      <v-window-item value="hide">
        <v-card class="mb-8 pa-4" outlined>
          <v-card-title class="text-h5">Ukrýt zprávu do snímku videa</v-card-title>
          <v-card-subtitle>Tato funkce umožňuje ukrýt zprávu do jednoho snímku videa. Pro odkrytí bude nutné znát číslo snímku.</v-card-subtitle>

          <v-card-text>
            <v-file-input
              v-model="videoFile"
              label="Vyberte video (MP4)"
              accept="video/mp4"
              prepend-icon="mdi-video"
              outlined
              variant="outlined"
              class="mb-4"
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

            <v-textarea
              v-model="secretMessage"
              label="Tajná zpráva k ukrytí"
              rows="3"
              auto-grow
              outlined
              variant="outlined"
              class="mb-4"
              :disabled="!videoFile || isProcessing"
              counter
            ></v-textarea>

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
              <div class="mt-4">
                <v-btn color="primary" @click="prepareFrameForReveal">
                  <v-icon class="mr-2">mdi-magnify</v-icon>
                  Odkrýt zprávu z tohoto snímku
                </v-btn>
                <v-btn class="ml-2" color="secondary" @click="downloadModifiedFrame">
                  <v-icon class="mr-2">mdi-download</v-icon>
                  Stáhnout snímek
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Reveal Tab -->
      <v-window-item value="reveal">
        <v-card class="mb-8 pa-4" outlined>
          <v-card-title class="text-h5">Odkrýt zprávu ze snímku</v-card-title>
          <v-card-text>
            <!-- Source selection tabs -->
            <div v-if="!useInMemoryFrame">
              <v-window v-model="revealSource">
                <!-- Reveal from image -->
                <v-window-item value="image">
                  <v-file-input
                    v-model="stegoImageFile"
                    label="Vyberte uložený snímek s ukrytou zprávou (PNG)"
                    accept="image/png,image/jpeg"
                    prepend-icon="mdi-image"
                    outlined
                    variant="outlined"
                    class="mb-4"
                    @update:model-value="onStegoImageSelected"
                    :disabled="isProcessing"
                  ></v-file-input>
                </v-window-item>

                <!-- Reveal from video -->
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
  import { ref } from 'vue';
  import { hideTextInVideoFrame, revealTextFromVideoFrame } from '../../stegonography/video';

  const emit = defineEmits(['show-message']);

  const activeTab = ref('hide');
  const isProcessing = ref(false);
  const useInMemoryFrame = ref(false);
  const revealSource = ref('image'); // 'video' or 'image'

  // Video hide section
  const videoFile = ref(null);
  const videoInfo = ref(null);
  const frameIndex = ref(0);
  const secretMessage = ref('');
  const modifiedFrameUrl = ref('');
  const currentFrameIndex = ref(0);
  const stegoFrameCanvas = ref(null); // Store the canvas with hidden data

  // Video reveal section
  const stegoVideoFile = ref(null);
  const stegoImageFile = ref(null);
  const revealFrameIndex = ref(0);
  const revealedMessage = ref('');

  // Video and image element refs (not displayed in UI)
  const videoElement = document.createElement('video');
  const stegoVideoElement = document.createElement('video');
  const stegoImageElement = document.createElement('img');

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
        frameCount: Math.floor(videoElement.duration * 30) // Assuming 30fps
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
      stegoFrameCanvas.value = result.frameCanvas; // Store canvas for later use

      emit('show-message', { message: 'Zpráva byla úspěšně ukryta ve snímku videa.', type: 'success' });
    } catch (error) {
      console.error('Error hiding message in video:', error);
      emit('show-message', { message: `Chyba při ukrývání zprávy: ${error.message}`, type: 'error' });
    } finally {
      isProcessing.value = false;
    }
  }

  function prepareFrameForReveal() {
    if (stegoFrameCanvas.value) {
      useInMemoryFrame.value = true;
      activeTab.value = 'reveal'; // Switch to reveal tab
      // Clear file inputs since we're using in-memory frame
      stegoVideoFile.value = null;
      stegoImageFile.value = null;
      emit('show-message', { message: 'Připraveno k odkrytí zprávy z aktuálně vygenerovaného snímku.', type: 'info' });
    } else {
      emit('show-message', { message: 'Nejprve ukryjte zprávu pro použití této funkce.', type: 'warning' });
    }
  }

  function clearInMemoryFrame() {
    useInMemoryFrame.value = false;
    emit('show-message', { message: 'Režim snímku v paměti zrušen. Můžete nyní načíst video nebo obrázek.', type: 'info' });
  }

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
        // Reveal from in-memory canvas
        revealed = await revealTextFromVideoFrame(stegoFrameCanvas.value, 0, 1);
      } else if (revealSource.value === 'image' && stegoImageFile.value) {
        // Reveal from image file
        revealed = await revealTextFromVideoFrame(stegoImageElement, 0, 1);
      } else {
        // Reveal from video file
        revealed = await revealTextFromVideoFrame(stegoVideoElement, parseInt(revealFrameIndex.value), 1);
      }

      revealedMessage.value = revealed;
      emit('show-message', { message: 'Zpráva byla úspěšně odkryta.', type: 'success' });
    } catch (error) {
      console.error('Error revealing message:', error);
      emit('show-message', { message: `Chyba při odkrývání zprávy: ${error.message}`, type: 'error' });
      revealedMessage.value = '';
    } finally {
      isProcessing.value = false;
    }
  }

  function downloadModifiedFrame() {
    if (!modifiedFrameUrl.value) return;

    const link = document.createElement('a');
    link.href = modifiedFrameUrl.value;
    link.download = `stego_frame_${currentFrameIndex.value}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

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

  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
</style>
