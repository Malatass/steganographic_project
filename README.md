# Aplikace pro Steganografii

Tento projekt je moderní steganografická aplikace vyvinutá jako školní úkol pro předmět ENC-K - Kryptologie na Mendelově univerzitě v Brně. Aplikace umožňuje uživatelům skrývat a odkrývat informace v různých typech médií: text, obrázky, audio a video.

## O projektu

Tato aplikace byla vytvořena jako splnění požadavku kurzu implementovat netriviální aplikaci využívající steganografické metody v programovacím jazyce vhodném pro tento úkol. Ačkoliv JavaScript nemusí být nejefektivnějším jazykem pro implementaci steganografických algoritmů (ve srovnání například s Pythonem), byl zvolen pro prozkoumání jiného přístupu, než je běžně používán ostatními v kurzu.

## Hlavní funkce

- **Různé steganografické metody**: Aplikace podporuje různé metody pro každý typ média:

  - **Text**: Oddělovače, Base64 + Oddělovače, Bílé znaky, Znaky s nulovou šířkou, Baconova šifra, Multi-tag Baconova šifra, Podobná písmena, České spojky, Rozestupy slov
  - **Obrázky**: LSB (Least Significant Bit) steganografie s nastavitelnou bitovou hloubkou
  - **Audio**: LSB audio steganografie ve WAV souborech
  - **Video**: Steganografie založená na snímcích s extrakcí a zpracováním jednotlivých snímků

- **Podpora šifrování**: Možnost šifrovat skryté zprávy pomocí AES-128 nebo AES-256 (kromě audia a videa)
- **Stavové zprávy a vizualizace**: Aplikace zobrazuje grafické výstupy, náhledy a oznámení o úspěchu nebo chybě
- **Stahování výsledků**: Výsledné obrázky, audio a video snímky lze stáhnout s vlastními názvy
- **Podpora schránky a importu**: Podpora pro vkládání a import textu/souborů ze schránky nebo souborového systému

## Důležitá omezení a upozornění

- **Podpora UTF-8 a českých znaků**: Některé metody (zejména textové) plně podporují UTF-8 a české znaky, zatímco jiné (např. audio, některé obrazové metody) podporují pouze ASCII. Při zadávání českých znaků se zobrazí upozornění.
- **Automatická změna velikosti obrázku**: Při skrývání obrázku v jiném obrázku je tajný obrázek automaticky zmenšen, pokud je příliš velký. Tato funkce nemusí být vždy 100% spolehlivá a může dojít ke ztrátě detailů.
- **Audio a video**: Pokud stáhnete audio se skrytou zprávou a znovu jej nahrajete, zpráva může být ztracena kvůli kompresi (zejména u MP3). Pro nejlepší výsledky používejte WAV. U nízkokvalitního nebo vysoce komprimovaného videa a audia nemusí být možné úspěšně skrýt nebo odkrýt zprávu.

## Technologie

- **Vue 3** – moderní framework pro budování uživatelských rozhraní
- **Vite** – rychlý vývojový a sestavovací nástroj
- **Vuetify** – komponentová knihovna pro moderní design

## Instalace

1. Naklonujte repozitář:
   ```
   git clone <repo-url>
   ```
2. Přejděte do adresáře projektu:
   ```
   cd steganographic_project
   ```
3. Nainstalujte závislosti:
   ```
   npm install
   ```

## Dostupná prostředí

Aplikace je dostupná online v následujících prostředích:

- **GitHub Pages** - Veřejně dostupná verze aplikace https://github.com/Malatass/steganographic_project
- **Server Akela** - Verze běžící na MENDELU serveru https://akela.mendelu.cz/~xfisa/ENC-K/
- **Zdrojový kód** - GitHub repozitář s kompletním kódem https://malatass.github.io/steganographic_project/

## Spuštění aplikace

Pro spuštění ve vývojovém režimu:

```
npm run dev
```

## Produkční sestavení

Pro vytvoření produkčního sestavení:

```
npm run build
```

## Přispívání

Návrhy na vylepšení nebo opravy chyb jsou vítány ve formě pull requestů.

## Licence

MIT

## Poděkování

Tento projekt byl vyvinut jako součást kurzu ENC-K - Kryptologie na Mendelově univerzitě v Brně. Zvláštní poděkování patří vyučujícím za jejich vedení a podporu.
