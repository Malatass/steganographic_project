<template>
  <v-container class="features-view">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="9">
        <!-- Vylepšená navigace -->
        <v-breadcrumbs class="px-0 py-3 mb-5 breadcrumbs-nav">
          <v-breadcrumbs-item to="/" title="Domů">
            <v-icon size="small" class="mr-1">mdi-home</v-icon>
            Domů
          </v-breadcrumbs-item>
          <v-breadcrumbs-divider>/</v-breadcrumbs-divider>
          <v-breadcrumbs-item class="breadcrumb-current">Přehled funkcí</v-breadcrumbs-item>
        </v-breadcrumbs>

        <h1 class="text-h3 font-weight-bold text-center mb-6 app-heading">Přehled funkcí aplikace</h1>
        <p class="text-center mb-8 text-subtitle-1 description-text">Kompletní průvodce steganografickými metodami a možnostmi naší aplikace.</p>

        <!-- Vylepšené karty s moderním vzhledem -->
        <v-card class="mb-8 feature-card elevation-2" rounded="lg">
          <div class="feature-header primary">
            <v-icon size="large" class="feature-icon">mdi-information-outline</v-icon>
            <h2 class="text-h5 font-weight-medium">Úvod do steganografie</h2>
          </div>
          <v-card-text class="pa-5">
            <p class="mb-3 text-body-1">
              <strong>Steganografie</strong>
              je umění a věda o skrývání informací uvnitř jiného, na první pohled nevinného média tak, aby sama existence skryté informace zůstala utajena. Na
              rozdíl od šifrování, kde je zřejmé, že je zpráva zašifrovaná, steganografie ukrývá samotnou existenci tajné komunikace.
            </p>
            <p class="mb-3 text-body-1">Naše aplikace nabízí několik metod steganografie pro různé typy médií:</p>
            <ul class="feature-list mb-3">
              <li>
                <v-icon color="primary" size="small" class="mr-2">mdi-format-text</v-icon>
                <strong>Textovou steganografii</strong>
                - ukrývání zpráv v běžném textu
              </li>
              <li>
                <v-icon color="success" size="small" class="mr-2">mdi-image</v-icon>
                <strong>Obrazovou steganografii</strong>
                - ukrývání informací v pixelech obrázku
              </li>
              <li>
                <v-icon color="info" size="small" class="mr-2">mdi-volume-high</v-icon>
                <strong>Zvukovou steganografii</strong>
                - ukrývání zpráv v audio souborech
              </li>
              <li>
                <v-icon color="error" size="small" class="mr-2">mdi-video</v-icon>
                <strong>Video steganografii</strong>
                - tato funkce je ve vývoji
              </li>
            </ul>
            <v-alert color="secondary" class="mt-4" density="compact" variant="tonal" border="start">
              <p class="text-body-1 mb-0">
                Většina metod umožňuje také dodatečné
                <strong>šifrování</strong>
                ukrývané zprávy pomocí AES-128 nebo AES-256, což přidává další vrstvu zabezpečení.
              </p>
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Textová steganografie -->
        <v-card class="mb-8 feature-card elevation-2" rounded="lg">
          <div class="feature-header primary">
            <v-icon size="large" class="feature-icon">mdi-format-text</v-icon>
            <h2 class="text-h5 font-weight-medium">Textová steganografie</h2>
          </div>
          <v-card-text class="pa-5">
            <p class="mb-4 text-body-1">
              Textová steganografie ukrývá zprávy v běžném textu pomocí různých technik manipulace textu. Tyto metody jsou navrženy tak, aby minimálně narušily
              čitelnost a přirozenost původního textu.
            </p>

            <h3 class="text-h6 mt-5 mb-3 section-title">Dostupné metody</h3>

            <v-expansion-panels variant="accordion" class="custom-panels">
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="primary" size="small" class="mr-2">mdi-code-brackets</v-icon>
                  <span>Oddělovače</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Vkládá tajnou zprávu mezi definované oddělovače (např.
                    <code class="code-inline" v-pre>{{ START }}</code>
                    a
                    <code class="code-inline" v-pre>{{ END }}</code>
                    ). Tyto oddělovače lze přizpůsobit.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Použití:</strong>
                    Vhodné pro situace, kdy lze skrýt oddělovače v delším textu a kdy příjemce ví, jaké oddělovače hledat.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="primary" size="small" class="mr-2">mdi-code-json</v-icon>
                  <span>Base64 + Oddělovače</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Převádí tajnou zprávu do Base64 a vkládá ji mezi definované oddělovače. Tím se zakryje čitelnost zprávy při náhodném nalezení.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Použití:</strong>
                    Poskytuje vyšší bezpečnost než prosté oddělovače, protože tajná zpráva je zakódovaná a není čitelná pouhým okem.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="primary" size="small" class="mr-2">mdi-format-indent-increase</v-icon>
                  <span>Bílé znaky</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Zakóduje zprávu pomocí neviditelných bílých znaků (mezery, tabulátory) na konci řádků.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Použití:</strong>
                    Velmi nenápadná metoda, vizuálně nezměněný text. Funguje dobře u formátovaného textu, kde jsou konce řádků přirozené.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="primary" size="small" class="mr-2">mdi-eye-off-outline</v-icon>
                  <span>Zero-width</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Využívá neviditelné znaky s nulovou šířkou (ZWSP, ZWNJ, ZWJ), které se vkládají mezi znaky původního textu.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Použití:</strong>
                    Nejméně detekovatelná metoda, vhodná pro situace s vysokými nároky na utajení. Text vypadá naprosto stejně jako originál.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="primary" size="small" class="mr-2">mdi-format-letter-case</v-icon>
                  <span>Baconova šifra</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Historická metoda, která využívá dvou různých formátování textu (např. normální/kurzíva) k binárnímu zakódování zprávy.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Použití:</strong>
                    Spíše historická a vzdělávací metoda. V originálním textu jsou některá písmena formátována odlišně, což vytváří binární kód.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="primary" size="small" class="mr-2">mdi-format-text-variant</v-icon>
                  <span>Multi-tag Baconova šifra</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Rozšířená verze Baconovy šifry využívající čtyři různé formáty textu (normální, kurzíva, tučné a podtržené), což umožňuje vyšší kapacitu.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Použití:</strong>
                    Umožňuje zakódovat více informací než klasická Baconova šifra, ale je výraznější a může vzbudit podezření kvůli neobvyklému formátování.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="primary" size="small" class="mr-2">mdi-format-text-wrapping-overflow</v-icon>
                  <span>Podobná písmena</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Nahrazuje vybraná písmena podobně vypadajícími znaky (např. o→0, l→1, a→а - latinské vs. cyrilice).
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Použití:</strong>
                    Text se zdá být stejný, ale obsahuje znaky z různých sad, které nesou skrytou informaci. Nenápadné, dokud někdo nezkoumá kódování
                    jednotlivých znaků.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="primary" size="small" class="mr-2">mdi-comma</v-icon>
                  <span>Čárky</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Vkládá nebo vynechává volitelné čárky před spojkami "and" a "or" v anglických textech.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Použití:</strong>
                    Funguje pouze v angličtině, využívá nejednoznačných pravidel pro používání čárek. Velmi nenápadná metoda, ale s omezenou kapacitou.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Obrazová steganografie - upravené expanzní panely -->
            <v-expansion-panels variant="accordion" class="custom-panels">
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="success" size="small" class="mr-2">mdi-text-box-edit</v-icon>
                  <span>Skrývání textu v obrázku (LSB)</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Metoda ukrývá text do nejméně významných bitů barevných kanálů (červená, zelená, modrá) pixelů obrázku.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Bity na kanál:</strong>
                    Můžete zvolit 1-3 bity pro ukládání informací. Více bitů znamená vyšší kapacitu, ale také více vizuálních změn v obrázku.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Výhody:</strong>
                    Změny jsou pro lidské oko téměř neviditelné, zejména při použití 1 bitu na kanál.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Kapacita:</strong>
                    Závisí na velikosti obrázku a počtu použitých bitů. Aplikace automaticky zobrazí maximální dostupnou kapacitu.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="success" size="small" class="mr-2">mdi-image-multiple</v-icon>
                  <span>Skrývání obrázku v obrázku</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Umožňuje ukrýt jeden obrázek do jiného, většího obrázku pomocí metody LSB.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Proces:</strong>
                    Tajný obrázek je zmenšen (pokud je třeba), aby se vešel do nosného obrázku, a poté je ukryt v nejméně významných bitech.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Použití:</strong>
                    Ideální pro skrývání citlivých grafických informací, jako jsou loga, watermarky nebo fotografie.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="success" size="small" class="mr-2">mdi-chart-bar</v-icon>
                  <span>Vizualizace změn</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Aplikace poskytuje dvě speciální vizualizace změn provedených v obrázku:
                  </p>
                  <ul class="feature-list">
                    <li>
                      <v-icon color="success" size="small" class="mr-2">mdi-compare</v-icon>
                      <strong>Mapa rozdílů:</strong>
                      Zobrazuje rozdíly mezi původním a steganografickým obrázkem, zesílené pro lepší viditelnost.
                    </li>
                    <li>
                      <v-icon color="success" size="small" class="mr-2">mdi-magnify-plus</v-icon>
                      <strong>Zvýrazněná data:</strong>
                      Vizuálně zvýrazňuje bity použité k ukrytí dat, což umožňuje "vidět" ukrytou informaci.
                    </li>
                  </ul>
                  <p class="text-body-1 mt-2">
                    <strong class="feature-highlight">Účel:</strong>
                    Tyto vizualizace jsou užitečné pro vzdělávací účely a pro ověření, že data byla skutečně ukryta.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="success" size="small" class="mr-2">mdi-auto-fix</v-icon>
                  <span>Automatická detekce</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Funkce pro automatické rozpoznání typu ukrytých dat (text nebo obrázek) při odkrývání.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Proces:</strong>
                    Aplikace nejprve zkouší detekovat text, a pokud není nalezen platný textový formát, pokusí se interpretovat data jako obrázek.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Výhody:</strong>
                    Uživatel nemusí vědět, jaký typ dat byl ukryt v obrázku.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Zvuková steganografie - upravené expanzní panely -->
            <v-expansion-panels variant="accordion" class="custom-panels">
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="info" size="small" class="mr-2">mdi-message-text-outline</v-icon>
                  <span>Skrývání textu v audio souborech</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Ukrývá textové zprávy do audio souborů (podporovány jsou především formáty WAV a MP3).
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Proces:</strong>
                    Zpráva je zakódována do nejméně významných bitů audio vzorků, což způsobuje minimální slyšitelné změny.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Kapacita:</strong>
                    Závisí na délce audio souboru a vzorkovací frekvenci. Aplikace zobrazuje maximální dostupnou kapacitu.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Kompatibilita:</strong>
                    Nejlépe funguje s nekomprimovanými WAV soubory. U MP3 může dojít ke ztrátě dat při opětovném uložení kvůli kompresi.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="info" size="small" class="mr-2">mdi-play-circle</v-icon>
                  <span>Přehrávání a kontrola</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Po ukrytí dat nabízí aplikace možnost přehrát výsledný zvukový soubor přímo v prohlížeči.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Funkce:</strong>
                    Můžete přímo odkrýt zprávu z aktuálně vygenerovaného audia bez nutnosti ukládat a znovu nahrávat soubor.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Šifrování - upravené expanzní panely -->
            <v-expansion-panels variant="accordion" class="custom-panels">
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="purple" size="small" class="mr-2">mdi-shield-lock</v-icon>
                  <span>AES-128</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Symetrická bloková šifra s klíčem délky 128 bitů.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Bezpečnost:</strong>
                    Velmi vysoká úroveň zabezpečení, prakticky neprolomitelná při správném použití.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Výkon:</strong>
                    Rychlejší než AES-256, dostatečně bezpečná pro většinu běžných aplikací.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="purple" size="small" class="mr-2">mdi-shield-lock-outline</v-icon>
                  <span>AES-256</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong class="feature-highlight">Popis:</strong>
                    Symetrická bloková šifra s klíčem délky 256 bitů.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Bezpečnost:</strong>
                    Nejvyšší úroveň zabezpečení, používaná pro kriticky citlivé informace.
                  </p>
                  <p class="text-body-1">
                    <strong class="feature-highlight">Použití:</strong>
                    Vhodná pro data vyžadující dlouhodobou ochranu nebo mimořádně citlivý obsah.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <v-alert density="compact" type="warning" variant="tonal" class="mt-4">
              <strong>Důležité upozornění:</strong>
              Po zašifrování dat heslem je toto heslo
              <strong>nezbytné</strong>
              pro jejich pozdější odkrytí. Pokud heslo zapomenete, nebude možné data obnovit!
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Tlačítko zpět na hlavní stránku -->
        <div class="text-center mt-8 mb-6">
          <v-btn to="/" size="large" color="primary" variant="elevated" rounded="pill" class="px-6 py-2">
            <v-icon class="mr-2">mdi-arrow-left</v-icon>
            Zpět na hlavní stránku
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
  /* Vylepšené styly pro Features stránku */
  .features-view {
    padding-bottom: 3rem;
  }

  /* Vylepšené záhlaví */
  .app-heading {
    color: #333;
    position: relative;
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }

  .app-heading::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #79be15 0%, #5c9110 100%);
    border-radius: 2px;
  }

  .description-text {
    color: #666;
    max-width: 800px;
    margin: 0 auto 2rem;
  }

  /* Krásné karty s barevnými hlavičkami */
  .feature-card {
    border: none;
    overflow: hidden;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1) !important;
  }

  .feature-header {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    background: linear-gradient(135deg, #79be15 0%, #5c9110 100%);
    color: white;
  }

  .feature-header.primary {
    background: linear-gradient(135deg, #79be15 0%, #5c9110 100%);
  }

  .feature-icon {
    margin-right: 1rem;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 0.5rem;
    border-radius: 50%;
  }

  /* Seznamy */
  .feature-list {
    list-style-type: none;
    padding-left: 0.5rem;
  }

  .feature-list li {
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
  }

  /* Rozbalovací panely */
  .custom-panels {
    border-radius: 8px;
    overflow: hidden;
  }

  .method-title {
    font-weight: 500;
  }

  .v-expansion-panel {
    margin-bottom: 0.5rem;
    border-radius: 8px !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05) !important;
  }

  .v-expansion-panel-title {
    padding: 1rem 1.5rem !important;
  }

  /* Zvýrazněné prvky */
  .feature-highlight {
    color: #5c9110;
    font-weight: 600;
  }

  .section-title {
    position: relative;
    padding-left: 1rem;
    color: #333;
    font-weight: 600;
    border-left: 4px solid #79be15;
  }

  /* Vlastní styl pro breadcrumbs */
  .breadcrumbs-nav {
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  }

  .breadcrumb-current {
    font-weight: 500;
    color: #79be15 !important;
  }

  /* Kód */
  .code-inline {
    background-color: #f5f5f5;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
    color: #e91e63;
    font-size: 0.9em;
  }
</style>
