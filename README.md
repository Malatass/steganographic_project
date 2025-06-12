# vue-steganography-app

Tento projekt je moderní aplikace pro steganografii, která umožňuje skrývat a odkrývat informace v různých typech médií: text, obrázky, audio a video.

## Hlavní funkce

- **Výběr steganografické metody**: Uživatel si může zvolit z několika metod pro každý typ média.
- **Podpora šifrování**: Možnost šifrovat ukrytou zprávu pomocí AES-128 nebo AES-256 (kromě audia a videa).
- **Stavové zprávy a vizualizace**: Aplikace zobrazuje grafické výstupy, náhledy a upozornění na úspěch či chyby.
- **Možnost stahování výsledků**: Výsledné obrázky, audio a video snímky lze stáhnout s vlastním názvem.
- **Import a práce se schránkou**: Podpora vkládání a importu textu/souborů ze schránky nebo souborového systému.

## Důležitá omezení a upozornění

- **Podpora UTF-8 a českých znaků**: Některé metody (zejména textové) plně podporují UTF-8 a české znaky, jiné (např. audio, některé obrazové) pouze ASCII. Pokud zadáte české znaky, zobrazí se upozornění.
- **Automatická změna velikosti obrázku**: Při skrývání obrázku v obrázku se tajný obrázek automaticky zmenší, pokud je příliš velký. Tato funkce nemusí být vždy 100% spolehlivá a může dojít ke ztrátě detailů.
- **Audio a video**: Pokud stáhnete audio s ukrytou zprávou a znovu jej nahrajete, může být zpráva ztracena kvůli kompresi (zejména u MP3). Pro nejlepší výsledky používejte WAV. U videa a audia s nízkou kvalitou nebo vysokou kompresí nemusí být možné zprávu úspěšně ukrýt ani odkrýt.

## Technologie

- **Vue 3** – moderní framework pro tvorbu uživatelských rozhraní
- **Vite** – rychlý vývojový a buildovací nástroj
- **Vuetify** – komponentová knihovna pro moderní vzhled

## Instalace

1. Klonujte repozitář:
   ```
   git clone <repo-url>
   ```
2. Přejděte do adresáře projektu:
   ```
   cd vue-steganography-app
   ```
3. Nainstalujte závislosti:
   ```
   npm install
   ```

## Spuštění aplikace

Pro spuštění v režimu vývoje:
```
npm run dev
```

## Build pro produkci

Pro vytvoření produkční verze:
```
npm run build
```

## Přispívání

Návrhy na vylepšení nebo opravy chyb jsou vítány formou pull requestů.

## Licence

MIT
