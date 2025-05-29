<template>
  <v-container class="features-view">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="9">
        <!-- Navigace -->
        <v-breadcrumbs class="px-0 py-2 mb-4 breadcrumbs-nav">
          <v-breadcrumbs-item to="/" title="Domů">
            <v-icon small class="mr-1">mdi-home</v-icon>
            Domů
          </v-breadcrumbs-item>
          <v-breadcrumbs-divider>/</v-breadcrumbs-divider>
          <v-breadcrumbs-item class="breadcrumb-current">Přehled funkcí</v-breadcrumbs-item>
        </v-breadcrumbs>

        <h1 class="text-h3 font-weight-medium text-center mb-6">Přehled funkcí aplikace</h1>
        <p class="text-center mb-8">Kompletní průvodce steganografickými metodami a možnostmi naší aplikace.</p>

        <!-- Obecný přehled -->
        <v-card class="mb-8 pa-4" outlined>
          <v-card-title class="text-h5">
            <v-icon class="mr-2">mdi-information-outline</v-icon>
            Úvod do steganografie
          </v-card-title>
          <v-card-text>
            <p class="mb-3">
              <strong>Steganografie</strong>
              je umění a věda o skrývání informací uvnitř jiného, na první pohled nevinného média tak, aby sama existence skryté informace zůstala utajena. Na
              rozdíl od šifrování, kde je zřejmé, že je zpráva zašifrovaná, steganografie ukrývá samotnou existenci tajné komunikace.
            </p>
            <p class="mb-3">Naše aplikace nabízí několik metod steganografie pro různé typy médií:</p>
            <ul class="mb-3">
              <li>
                <strong>Textovou steganografii</strong>
                - ukrývání zpráv v běžném textu
              </li>
              <li>
                <strong>Obrazovou steganografii</strong>
                - ukrývání informací v pixelech obrázku
              </li>
              <li>
                <strong>Zvukovou steganografii</strong>
                - ukrývání zpráv v audio souborech
              </li>
              <li>
                <strong>Video steganografii</strong>
                - tato funkce je ve vývoji
              </li>
            </ul>
            <p>
              Většina metod umožňuje také dodatečné
              <strong>šifrování</strong>
              ukrývané zprávy pomocí AES-128 nebo AES-256, což přidává další vrstvu zabezpečení.
            </p>
          </v-card-text>
        </v-card>

        <!-- Textová steganografie -->
        <v-card class="mb-8" outlined>
          <v-card-title class="text-h5 d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-format-text</v-icon>
            Textová steganografie
          </v-card-title>
          <v-card-text>
            <p class="mb-4">
              Textová steganografie ukrývá zprávy v běžném textu pomocí různých technik manipulace textu. Tyto metody jsou navrženy tak, aby minimálně narušily
              čitelnost a přirozenost původního textu.
            </p>

            <h3 class="text-h6 mt-4 mb-2">Dostupné metody:</h3>

            <v-expansion-panels variant="accordion">
              <v-expansion-panel title="Oddělovače">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Vkládá tajnou zprávu mezi definované oddělovače (např.
                    <code v-pre>{{ START }}</code>
                    a
                    <code v-pre>{{ END }}</code>

                    ). Tyto oddělovače lze přizpůsobit.
                  </p>
                  <p>
                    <strong>Použití:</strong>
                    Vhodné pro situace, kdy lze skrýt oddělovače v delším textu a kdy příjemce ví, jaké oddělovače hledat.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel title="Base64 + Oddělovače">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Převádí tajnou zprávu do Base64 a vkládá ji mezi definované oddělovače. Tím se zakryje čitelnost zprávy při náhodném nalezení.
                  </p>
                  <p>
                    <strong>Použití:</strong>
                    Poskytuje vyšší bezpečnost než prosté oddělovače, protože tajná zpráva je zakódovaná a není čitelná pouhým okem.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel title="Bílé znaky">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Zakóduje zprávu pomocí neviditelných bílých znaků (mezery, tabulátory) na konci řádků.
                  </p>
                  <p>
                    <strong>Použití:</strong>
                    Velmi nenápadná metoda, vizuálně nezměněný text. Funguje dobře u formátovaného textu, kde jsou konce řádků přirozené.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel title="Zero-width">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Využívá neviditelné znaky s nulovou šířkou (ZWSP, ZWNJ, ZWJ), které se vkládají mezi znaky původního textu.
                  </p>
                  <p>
                    <strong>Použití:</strong>
                    Nejméně detekovatelná metoda, vhodná pro situace s vysokými nároky na utajení. Text vypadá naprosto stejně jako originál.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel title="Baconova šifra">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Historická metoda, která využívá dvou různých formátování textu (např. normální/kurzíva) k binárnímu zakódování zprávy.
                  </p>
                  <p>
                    <strong>Použití:</strong>
                    Spíše historická a vzdělávací metoda. V originálním textu jsou některá písmena formátována odlišně, což vytváří binární kód.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel title="Multi-tag Baconova šifra">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Rozšířená verze Baconovy šifry využívající čtyři různé formáty textu (normální, kurzíva, tučné a podtržené), což umožňuje vyšší kapacitu.
                  </p>
                  <p>
                    <strong>Použití:</strong>
                    Umožňuje zakódovat více informací než klasická Baconova šifra, ale je výraznější a může vzbudit podezření kvůli neobvyklému formátování.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel title="Podobná písmena">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Nahrazuje vybraná písmena podobně vypadajícími znaky (např. o→0, l→1, a→а - latinské vs. cyrilice).
                  </p>
                  <p>
                    <strong>Použití:</strong>
                    Text se zdá být stejný, ale obsahuje znaky z různých sad, které nesou skrytou informaci. Nenápadné, dokud někdo nezkoumá kódování
                    jednotlivých znaků.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel title="Čárky">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Vkládá nebo vynechává volitelné čárky před spojkami "and" a "or" v anglických textech.
                  </p>
                  <p>
                    <strong>Použití:</strong>
                    Funguje pouze v angličtině, využívá nejednoznačných pravidel pro používání čárek. Velmi nenápadná metoda, ale s omezenou kapacitou.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>

        <!-- Obrazová steganografie -->
        <v-card class="mb-8" outlined>
          <v-card-title class="text-h5 d-flex align-center">
            <v-icon class="mr-2" color="success">mdi-image</v-icon>
            Obrazová steganografie
          </v-card-title>
          <v-card-text>
            <p class="mb-4">
              Obrazová steganografie využívá pixely obrázku k ukrytí informací. Naše aplikace používá metodu LSB (Least Significant Bit), která upravuje nejméně
              významné bity barevných složek pixelů.
            </p>

            <h3 class="text-h6 mt-4 mb-2">Podporované funkce:</h3>

            <v-expansion-panels variant="accordion">
              <v-expansion-panel title="Skrývání textu v obrázku (LSB)">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Metoda ukrývá text do nejméně významných bitů barevných kanálů (červená, zelená, modrá) pixelů obrázku.
                  </p>
                  <p>
                    <strong>Bity na kanál:</strong>
                    Můžete zvolit 1-3 bity pro ukládání informací. Více bitů znamená vyšší kapacitu, ale také více vizuálních změn v obrázku.
                  </p>
                  <p>
                    <strong>Výhody:</strong>
                    Změny jsou pro lidské oko téměř neviditelné, zejména při použití 1 bitu na kanál.
                  </p>
                  <p>
                    <strong>Kapacita:</strong>
                    Závisí na velikosti obrázku a počtu použitých bitů. Aplikace automaticky zobrazí maximální dostupnou kapacitu.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel title="Skrývání obrázku v obrázku">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Umožňuje ukrýt jeden obrázek do jiného, většího obrázku pomocí metody LSB.
                  </p>
                  <p>
                    <strong>Proces:</strong>
                    Tajný obrázek je zmenšen (pokud je třeba), aby se vešel do nosného obrázku, a poté je ukryt v nejméně významných bitech.
                  </p>
                  <p>
                    <strong>Použití:</strong>
                    Ideální pro skrývání citlivých grafických informací, jako jsou loga, watermarky nebo fotografie.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel title="Vizualizace změn">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Aplikace poskytuje dvě speciální vizualizace změn provedených v obrázku:
                  </p>
                  <ul>
                    <li>
                      <strong>Mapa rozdílů:</strong>
                      Zobrazuje rozdíly mezi původním a steganografickým obrázkem, zesílené pro lepší viditelnost.
                    </li>
                    <li>
                      <strong>Zvýrazněná data:</strong>
                      Vizuálně zvýrazňuje bity použité k ukrytí dat, což umožňuje "vidět" ukrytou informaci.
                    </li>
                  </ul>
                  <p>
                    <strong>Účel:</strong>
                    Tyto vizualizace jsou užitečné pro vzdělávací účely a pro ověření, že data byla skutečně ukryta.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel title="Automatická detekce">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Funkce pro automatické rozpoznání typu ukrytých dat (text nebo obrázek) při odkrývání.
                  </p>
                  <p>
                    <strong>Proces:</strong>
                    Aplikace nejprve zkouší detekovat text, a pokud není nalezen platný textový formát, pokusí se interpretovat data jako obrázek.
                  </p>
                  <p>
                    <strong>Výhody:</strong>
                    Uživatel nemusí vědět, jaký typ dat byl ukryt v obrázku.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>

        <!-- Zvuková steganografie -->
        <v-card class="mb-8" outlined>
          <v-card-title class="text-h5 d-flex align-center">
            <v-icon class="mr-2" color="info">mdi-volume-high</v-icon>
            Zvuková steganografie
          </v-card-title>
          <v-card-text>
            <v-alert density="compact" type="warning" variant="tonal" class="mb-4">
              <strong>Pozor:</strong>
              Zvuková steganografie je stále ve vývoji a nemusí fungovat na 100% ve všech prohlížečích a se všemi formáty zvukových souborů.
            </v-alert>
            <p class="mb-4">
              Zvuková steganografie umožňuje ukrýt tajné zprávy do audio souborů. Naše aplikace používá techniku LSB podobnou té obrazové, ale aplikovanou na
              zvukové vzorky.
            </p>

            <h3 class="text-h6 mt-4 mb-2">Podporované funkce:</h3>

            <v-expansion-panels variant="accordion">
              <v-expansion-panel title="Skrývání textu v audio souborech">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Ukrývá textové zprávy do audio souborů (podporovány jsou především formáty WAV a MP3).
                  </p>
                  <p>
                    <strong>Proces:</strong>
                    Zpráva je zakódována do nejméně významných bitů audio vzorků, což způsobuje minimální slyšitelné změny.
                  </p>
                  <p>
                    <strong>Kapacita:</strong>
                    Závisí na délce audio souboru a vzorkovací frekvenci. Aplikace zobrazuje maximální dostupnou kapacitu.
                  </p>
                  <p>
                    <strong>Kompatibilita:</strong>
                    Nejlépe funguje s nekomprimovanými WAV soubory. U MP3 může dojít ke ztrátě dat při opětovném uložení kvůli kompresi.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel title="Přehrávání a kontrola">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Po ukrytí dat nabízí aplikace možnost přehrát výsledný zvukový soubor přímo v prohlížeči.
                  </p>
                  <p>
                    <strong>Funkce:</strong>
                    Můžete přímo odkrýt zprávu z aktuálně vygenerovaného audia bez nutnosti ukládat a znovu nahrávat soubor.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>

        <!-- Video steganografie -->
        <v-card class="mb-8" outlined>
          <v-card-title class="text-h5 d-flex align-center">
            <v-icon class="mr-2" color="error">mdi-video</v-icon>
            Video steganografie
          </v-card-title>
          <v-card-text>
            <v-alert density="compact" type="error" variant="tonal" class="mb-4">
              <strong>Ve vývoji:</strong>
              Video steganografie je zatím ve fázi vývoje a není plně implementována v aplikaci.
            </v-alert>
            <p>
              Video steganografie bude v budoucnu umožňovat ukrývání dat do video souborů, kombinováním technik obrazové steganografie aplikovaných na
              jednotlivé snímky videa a zvukové steganografie aplikované na audio stopu.
            </p>
            <p class="mt-2">Plánované funkce budou zahrnovat:</p>
            <ul>
              <li>Ukrývání textu do vybraných snímků videa</li>
              <li>Ukrývání obrázků ve video sekvencích</li>
              <li>Možnost rozložit větší objem dat napříč celým videem</li>
            </ul>
          </v-card-text>
        </v-card>

        <!-- Šifrování -->
        <v-card class="mb-8" outlined>
          <v-card-title class="text-h5 d-flex align-center">
            <v-icon class="mr-2" color="purple">mdi-lock</v-icon>
            Dodatečné šifrování
          </v-card-title>
          <v-card-text>
            <p class="mb-4">
              Pro zvýšení bezpečnosti nabízí aplikace možnost dodatečného šifrování dat před jejich ukrytím. To zajišťuje, že i kdyby někdo objevil přítomnost
              skrytých dat, nebude schopen je přečíst bez znalosti hesla.
            </p>

            <h3 class="text-h6 mt-4 mb-2">Podporované šifrovací metody:</h3>

            <v-expansion-panels variant="accordion">
              <v-expansion-panel title="AES-128">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Symetrická bloková šifra s klíčem délky 128 bitů.
                  </p>
                  <p>
                    <strong>Bezpečnost:</strong>
                    Velmi vysoká úroveň zabezpečení, prakticky neprolomitelná při správném použití.
                  </p>
                  <p>
                    <strong>Výkon:</strong>
                    Rychlejší než AES-256, dostatečně bezpečná pro většinu běžných aplikací.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel title="AES-256">
                <v-expansion-panel-text>
                  <p>
                    <strong>Popis:</strong>
                    Symetrická bloková šifra s klíčem délky 256 bitů.
                  </p>
                  <p>
                    <strong>Bezpečnost:</strong>
                    Nejvyšší úroveň zabezpečení, používaná pro kriticky citlivé informace.
                  </p>
                  <p>
                    <strong>Použití:</strong>
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
        <div class="text-center mt-8">
          <v-btn to="/" size="large" color="primary" variant="flat">
            <v-icon class="mr-2">mdi-arrow-left</v-icon>
            Zpět na hlavní stránku
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
  .steg-list-item {
    font-size: 0.95rem;
  }

  .border {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
  }

  /* Popisy metod ve výběru */
  .method-description {
    font-size: 0.85rem;
    opacity: 0.8;
    margin-top: 4px;
  }

  /* Vlastní styl pro breadcrumbs */
  .breadcrumbs-nav {
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 4px;
  }

  .breadcrumb-current {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.8) !important;
  }
</style>
