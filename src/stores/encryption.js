// src/stores/encryption.js
import { defineStore } from 'pinia';
import CryptoJS from 'crypto-js';

export const useEncryptionStore = defineStore('encryption', {
  state: () => ({
    encryptionType: 'none', // 'none', 'aes128', 'aes256'
    encryptionPassword: '',
    showPassword: false,
  }),

  actions: {
    setEncryptionType(type) {
      this.encryptionType = type;
    },
    
    setEncryptionPassword(password) {
      this.encryptionPassword = password;
    },
    
    toggleShowPassword() {
      this.showPassword = !this.showPassword;
    },
    
    resetEncryption() {
      this.encryptionType = 'none';
      this.encryptionPassword = '';
      this.showPassword = false;
    },
    
    encrypt(text) {
      if (!text || this.encryptionType === 'none') {
        return text;
      }
      
      try {
        if (this.encryptionType === 'aes128') {
          const key = CryptoJS.SHA256(this.encryptionPassword).toString().substring(0, 32);
          return JSON.stringify({
            ct: CryptoJS.AES.encrypt(text, key).toString(),
            iv: CryptoJS.lib.WordArray.random(16).toString(),
            s: CryptoJS.lib.WordArray.random(8).toString(),
            type: 'aes128'
          });
        } else if (this.encryptionType === 'aes256') {
          const key = CryptoJS.SHA256(this.encryptionPassword).toString();
          return JSON.stringify({
            ct: CryptoJS.AES.encrypt(text, key).toString(),
            iv: CryptoJS.lib.WordArray.random(16).toString(),
            s: CryptoJS.lib.WordArray.random(8).toString(),
            type: 'aes256'
          });
        }
      } catch (e) {
        throw new Error(`Chyba při šifrování: ${e.message}`);
      }
      
      return text;
    },
    
    decrypt(encryptedText, password = null) {
      if (!encryptedText) return encryptedText;
      
      try {
        const data = JSON.parse(encryptedText);
        if (!data.ct || !data.type) {
          return encryptedText; // Není to šifrovaný obsah
        }
        
        const usePassword = password || this.encryptionPassword;
        let key;
        
        if (data.type === 'aes128') {
          key = CryptoJS.SHA256(usePassword).toString().substring(0, 32);
        } else if (data.type === 'aes256') {
          key = CryptoJS.SHA256(usePassword).toString();
        } else {
          throw new Error('Nepodporovaný typ šifrování');
        }
        
        const bytes = CryptoJS.AES.decrypt(data.ct, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!decrypted) {
          throw new Error('Neplatné heslo nebo poškozená data');
        }
        
        return decrypted;
      } catch (e) {
        if (e.message.includes('JSON')) {
          return encryptedText; // Není to JSON, pravděpodobně nešifrovaný text
        }
        throw new Error(`Nepodařilo se dešifrovat: ${e.message}`);
      }
    },
    
    detectEncryptionType(text) {
      try {
        const data = JSON.parse(text);
        if (data.type === 'aes128' || data.type === 'aes256') {
          return data.type;
        }
      } catch (e) {
        // Není to JSON, pravděpodobně nešifrovaný text
      }
      return 'none';
    }
  }
});