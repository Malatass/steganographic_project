<!-- src/components/common/EncryptionPanel.vue -->
<template>
  <div class="encryption-panel">
    <v-expansion-panels variant="accordion">
      <v-expansion-panel :title="isPanelForEncryption ? 'Šifrování heslem (volitelné)' : 'Dešifrování heslem'">
        <v-expansion-panel-text>
          <template v-if="isPanelForEncryption">
            <!-- Panel pro šifrování -->
            <p class="text-body-2 mb-2">Můžete zvolit šifrování výsledku pomocí hesla:</p>
            <v-radio-group v-model="encryptionType" inline class="mb-2">
              <v-radio label="Bez šifrování" value="none"></v-radio>
              <v-radio label="AES-128" value="aes128"></v-radio>
              <v-radio label="AES-256" value="aes256"></v-radio>
            </v-radio-group>
          </template>

          <!-- Pole pro zadání hesla -->
          <v-text-field
            v-if="showPasswordField"
            v-model="password"
            :label="passwordFieldLabel"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            @click:append="toggleShowPassword"
            :hint="isPanelForEncryption ? 'Heslo bude potřeba pro odkrytí zprávy' : ''"
            persistent-hint
          ></v-text-field>

          <!-- Varování o důležitosti hesla -->
          <v-alert v-if="showWarning" type="warning" variant="tonal" density="comfortable" class="mt-2">
            <strong>Pozor:</strong>
            Pokud zapomenete heslo, nebude možné zprávu obnovit!
          </v-alert>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
  import { computed, watch } from 'vue';
  import { useEncryptionStore } from '../../stores/encryption';

  const props = defineProps({
    mode: {
      type: String,
      default: 'encrypt', // nebo 'decrypt'
      validator: (value) => ['encrypt', 'decrypt'].includes(value)
    },
    autoDetectedType: {
      type: String,
      default: 'none'
    }
  });

  const encryptionStore = useEncryptionStore();

  // Pro šifrování používáme hodnoty ze storu
  const encryptionType = computed({
    get: () => encryptionStore.encryptionType,
    set: (value) => encryptionStore.setEncryptionType(value)
  });

  const password = computed({
    get: () => encryptionStore.encryptionPassword,
    set: (value) => encryptionStore.setEncryptionPassword(value)
  });

  const showPassword = computed({
    get: () => encryptionStore.showPassword,
    set: () => encryptionStore.toggleShowPassword()
  });

  // Pomocné computed properties
  const isPanelForEncryption = computed(() => props.mode === 'encrypt');
  const showPasswordField = computed(() => {
    if (isPanelForEncryption.value) {
      return encryptionType.value !== 'none';
    }
    return props.autoDetectedType !== 'none';
  });

  const passwordFieldLabel = computed(() => (isPanelForEncryption.value ? 'Heslo pro šifrování' : 'Heslo pro dešifrování'));

  const showWarning = computed(() => isPanelForEncryption.value && encryptionType.value !== 'none');

  // Funkce
  const toggleShowPassword = () => encryptionStore.toggleShowPassword();

  // Pro automatickou detekci šifrovaného obsahu
  watch(
    () => props.autoDetectedType,
    (newType) => {
      if (!isPanelForEncryption.value && newType !== 'none') {
        encryptionStore.setEncryptionType(newType);
      }
    }
  );
</script>

<style scoped>
  .encryption-panel {
    border-radius: 8px;
    transition: all 0.3s ease;
  }
</style>
