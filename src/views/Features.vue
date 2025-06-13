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
        <!-- Informace o školním projektu-->
        <v-card class="mb-8 feature-card elevation-2" rounded="lg">
          <div class="feature-header primary">
            <v-icon size="large" class="feature-icon">mdi-school</v-icon>
            <h2 class="text-h5 font-weight-medium">O projektu</h2>
          </div>
          <v-card-text class="pa-5">
            <p class="mb-3 text-body-1">
              Tato aplikace byla vytvořena jako školní projekt pro předmět
              <strong>ENC-K - Kryptologie</strong>
              na Mendelově univerzitě v Brně.
            </p>
            <p class="mb-3 text-body-1">
              Cílem projektu bylo využít některou z metod/funkcí/algoritmů steganografie a vytvořit netriviální aplikaci v programovacím jazyce vhodném pro
              tento účel. Přestože JavaScript nemusí být pro implementaci steganografických algoritmů tím nejefektivnějším (ve srovnání např. s Pythonem), byl
              zvolen jako alternativa k běžně používaným řešením ostatních studentů.
            </p>
            <p class="mb-0 text-body-1">
              Výsledkem je komplexní webová aplikace, která nabízí různé steganografické metody pro práci s textem, obrázky, audiem a videem, a umožňuje tak
              uživatelům prakticky prozkoumat principy steganografie.
            </p>
          </v-card-text>
        </v-card>

        <!-- Vylepšené karty -->
        <v-card class="mb-8 feature-card elevation-2" rounded="lg">
          <div class="feature-header primary">
            <v-icon size="large" class="feature-icon">mdi-information-outline</v-icon>
            <h2 class="text-h5 font-weight-medium">Úvod do steganografie</h2>
          </div>
          <v-card-text class="pa-5">
            <p class="mb-3 text-body-1">
              <strong>Steganografie</strong>
              je umění a věda o skrývání informací uvnitř jiného média tak, aby samotná existence skryté informace zůstala utajena. Na rozdíl od šifrování, kde
              je zřejmé, že je zpráva zašifrovaná, steganografie ukrývá samotnou existenci tajné komunikace.
            </p>
            <p class="mb-3 text-body-1">
              Tato aplikace umožňuje skrývat a odkrývat informace v textu, obrázcích, audiosouborech a videích. Každý typ média nabízí několik metod, které se
              liší kapacitou, nenápadností a odolností vůči úpravám.
            </p>
            <v-alert color="info" class="mt-4" density="compact" variant="tonal" border="start">
              <p class="text-body-1 mb-0">
                <strong>Upozornění:</strong>
                Některé metody mají omezenou podporu pro speciální znaky (například české znaky nebo znaky s diakritikou). Pokud zadáte takové znaky, aplikace
                vás upozorní na možné problémy s kompatibilitou.
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
              Textová steganografie umožňuje ukrývat zprávy v běžném textu pomocí různých technik manipulace s textem. Tyto metody jsou navrženy tak, aby
              minimálně narušily čitelnost a přirozenost původního textu.
            </p>
            <v-alert color="warning" class="mb-4" density="compact" variant="tonal" border="start">
              <p class="text-body-1 mb-0">
                <strong>Poznámka:</strong>
                Některé metody plně podporují UTF-8 a české znaky (například neviditelné znaky, české spojky), jiné pouze ASCII (například oddělovače, Baconova
                šifra, podobná písmena). Pokud zadáte české znaky do nepodporované metody, může být výsledek nečitelný nebo nefunkční.
              </p>
            </v-alert>
            <h3 class="text-h6 mt-5 mb-3 section-title">Dostupné metody</h3>
            <v-expansion-panels variant="accordion" class="custom-panels">
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="primary" size="small" class="mr-2">mdi-code-brackets</v-icon>
                  <span>Oddělovače</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong>Popis:</strong>
                    Vkládá tajnou zprávu mezi definované oddělovače (např.
                    <code class="code-inline" v-pre>{{ START }}</code>
                    a
                    <code class="code-inline" v-pre>{{ END }}</code>
                    ). Oddělovače lze přizpůsobit.
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Podporuje pouze ASCII znaky. Pokud použijete české znaky, výsledek nemusí být správný.
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
                    <strong>Popis:</strong>
                    Převádí tajnou zprávu do Base64 a vkládá ji mezi definované oddělovače. Tím se zakryje čitelnost zprávy při náhodném nalezení.
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Podporuje pouze ASCII znaky.
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
                    <strong>Popis:</strong>
                    Zakóduje zprávu pomocí neviditelných bílých znaků (mezery, tabulátory) na konci řádků.
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Plně podporuje UTF-8 a české znaky.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="primary" size="small" class="mr-2">mdi-eye-off-outline</v-icon>
                  <span>Zero-width znaky</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong>Popis:</strong>
                    Využívá neviditelné znaky s nulovou šířkou (ZWSP, ZWNJ, ZWJ), které se vkládají mezi znaky původního textu.
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Plně podporuje UTF-8 a české znaky.
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
                    <strong>Popis:</strong>
                    Historická metoda, která využívá dvou různých formátování textu (např. normální/kurzíva) k binárnímu zakódování zprávy.
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Podporuje pouze ASCII znaky.
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
                    <strong>Popis:</strong>
                    Rozšířená verze Baconovy šifry využívající čtyři různé formáty textu (normální, kurzíva, tučné a podtržené), což umožňuje vyšší kapacitu.
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Podporuje pouze ASCII znaky.
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
                    <strong>Popis:</strong>
                    Nahrazuje vybraná písmena podobně vypadajícími znaky (např. o→0, l→1, a→а - latinské vs. cyrilice).
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Podporuje pouze ASCII znaky.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="primary" size="small" class="mr-2">mdi-link-variant</v-icon>
                  <span>České spojky</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong>Popis:</strong>
                    Ukrytí zprávy pomocí volitelných čárek před českými spojkami (a, ale, nebo, či, ...).
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Plně podporuje UTF-8 a české znaky.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="primary" size="small" class="mr-2">mdi-format-line-spacing</v-icon>
                  <span>Rozestupy slov</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong>Popis:</strong>
                    Ukrytí zprávy pomocí různých typů mezer mezi slovy (normální mezera vs. úzká mezera).
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Plně podporuje UTF-8 a české znaky.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>

        <!-- Obrazová steganografie -->
        <v-card class="mb-8 feature-card elevation-2" rounded="lg">
          <div class="feature-header primary">
            <v-icon size="large" class="feature-icon">mdi-image</v-icon>
            <h2 class="text-h5 font-weight-medium">Obrazová steganografie</h2>
          </div>
          <v-card-text class="pa-5">
            <p class="mb-3 text-body-1">
              Obrazová steganografie umožňuje ukrývat informace v pixelech obrázku. Každý pixel může nést informaci v nejméně významných bitech barevných kanálů
              (LSB), což je pro lidské oko téměř nepostřehnutelné.
            </p>
            <v-alert color="warning" class="mb-4" density="compact" variant="tonal" border="start">
              <p class="text-body-1 mb-0">
                <strong>Upozornění:</strong>
                Pokud je tajný obrázek příliš velký, aplikace jej automaticky zmenší, aby se vešel do nosného obrázku. Tato změna velikosti nemusí být vždy 100%
                spolehlivá a může dojít ke ztrátě detailů nebo kvality.
              </p>
            </v-alert>
            <h3 class="text-h6 mt-5 mb-3 section-title">Dostupné metody</h3>
            <v-expansion-panels variant="accordion" class="custom-panels">
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="success" size="small" class="mr-2">mdi-text-box-edit</v-icon>
                  <span>Skrývání textu v obrázku (LSB)</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong>Popis:</strong>
                    Metoda ukrývá text do nejméně významných bitů barevných kanálů (červená, zelená, modrá) pixelů obrázku. Změny jsou pro lidské oko téměř
                    neviditelné, zejména při použití 1 bitu na kanál.
                  </p>
                  <p class="text-body-1">
                    <strong>Kapacita:</strong>
                    Závisí na velikosti obrázku a počtu použitých bitů. Aplikace automaticky zobrazí maximální dostupnou kapacitu.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="success" size="small" class="mr-2">mdi-image-multiple</v-icon>
                  <span>Skrývání obrázku v obrázku (LSB)</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong>Popis:</strong>
                    Umožňuje ukrýt jeden obrázek do jiného, většího obrázku pomocí metody LSB. Tajný obrázek je automaticky zmenšen, pokud je třeba, aby se
                    vešel do nosného obrázku.
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Při automatické změně velikosti může dojít ke ztrátě detailů tajného obrázku.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="success" size="small" class="mr-2">mdi-arrow-expand-all</v-icon>
                  <span>MSB-in-LSB (n MSB do n LSB)</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong>Popis:</strong>
                    Tato metoda ukládá n nejvýznamnějších bitů každého kanálu tajného obrázku do n nejméně významných bitů nosného obrázku. Výsledkem je vizuální aproximace tajného obrázku, která je dobře viditelná zejména u ilustrací nebo schémat.
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Obrázky musí mít stejnou velikost. Výsledek není vhodný pro fotografie, ale je velmi efektivní pro jednoduchou grafiku.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="success" size="small" class="mr-2">mdi-palette-outline</v-icon>
                  <span>Barevná podobnost (Color Similarity)</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong>Popis:</strong>
                    Metoda využívá změnu barvy každého pixelu na nejbližší možnou hodnotu, která kóduje požadované bity tajného obrázku. Výsledkem je obrázek, který je vizuálně téměř nerozeznatelný od originálu, zejména u šedotónových obrázků.
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Nejlépe funguje pro šedotónové obrázky, ale lze použít i pro barevné. Kapacita je omezena počtem bitů na kanál.
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
                    <strong>Popis:</strong>
                    Aplikace poskytuje speciální vizualizace změn provedených v obrázku (rozdílová mapa, zvýrazněná vizualizace), které pomáhají pochopit, kde
                    byla data ukryta.
                  </p>
                  <p class="text-body-1">
                    <strong>Využití:</strong>
                    Užitečné pro vzdělávací účely a ověření, že data byla skutečně ukryta.
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
                    <strong>Popis:</strong>
                    Funkce pro automatické rozpoznání typu ukrytých dat (text nebo obrázek) při odkrývání. Uživatel nemusí vědět, jaký typ dat byl ukryt v
                    obrázku.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>

        <!-- Video steganografie -->
        <v-card class="mb-8 feature-card elevation-2" rounded="lg">
          <div class="feature-header primary">
            <v-icon size="large" class="feature-icon">mdi-video</v-icon>
            <h2 class="text-h5 font-weight-medium">Video steganografie</h2>
          </div>
          <v-card-text class="pa-5">
            <p class="mb-3 text-body-1">
              Video steganografie umožňuje ukrývat zprávy do jednotlivých snímků videa pomocí manipulace s nejméně významnými bity (LSB) v obrazových datech.
              Tato metoda je vhodná pro krátké zprávy a videa s vyšší kvalitou.
            </p>
            <v-alert color="warning" class="mb-4" density="compact" variant="tonal" border="start">
              <p class="text-body-1 mb-0">
                <strong>Upozornění:</strong>
                Nejlepších výsledků dosáhnete s videi ve vysoké kvalitě a s minimální kompresí. U silně komprimovaných nebo nízkokvalitních videí nemusí být
                možné zprávu úspěšně ukrýt ani odkrýt. Kapacita je omezena na jeden snímek a délku zprávy.
              </p>
            </v-alert>
            <h3 class="text-h6 mt-5 mb-3 section-title">Použitá metoda</h3>
            <v-expansion-panels variant="accordion" class="custom-panels">
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="error" size="small" class="mr-2">mdi-video-frame</v-icon>
                  <span>LSB ve snímku videa</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong>Popis:</strong>
                    Zpráva je ukryta do jednoho vybraného snímku videa pomocí LSB v obrazových datech. Po ukrytí lze snímek stáhnout a později použít k odhalení
                    zprávy.
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Kapacita je omezena velikostí snímku a použitou kompresí. U některých video formátů může dojít ke ztrátě dat při exportu nebo opětovném
                    nahrání.
                  </p>
                  <p class="text-body-1">
                    <strong>Doporučení:</strong>
                    Používejte videa s minimální kompresí (např. MP4 s vysokým bitrate) a pamatujte si číslo snímku, do kterého byla zpráva ukryta.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>

        <!-- Zvuková steganografie -->
        <v-card class="mb-8 feature-card elevation-2" rounded="lg">
          <div class="feature-header primary">
            <v-icon size="large" class="feature-icon">mdi-volume-high</v-icon>
            <h2 class="text-h5 font-weight-medium">Zvuková steganografie</h2>
          </div>
          <v-card-text class="pa-5">
            <p class="mb-3 text-body-1">
              Zvuková steganografie umožňuje ukrývat zprávy v audio souborech pomocí manipulace s nejméně významnými bity (LSB) v digitálním zvuku. Změny jsou
              pro lidské ucho prakticky neslyšitelné, ale kapacita je omezená.
            </p>
            <v-alert color="warning" class="mb-4" density="compact" variant="tonal" border="start">
              <p class="text-body-1 mb-0">
                <strong>Upozornění:</strong>
                Nejlepších výsledků dosáhnete s nekomprimovanými WAV soubory. Pokud stáhnete audio s ukrytou zprávou a znovu jej nahrajete (zejména ve formátu
                MP3), může být zpráva ztracena kvůli kompresi. U krátkých nebo silně komprimovaných nahrávek nemusí být možné zprávu úspěšně ukrýt ani odkrýt.
              </p>
            </v-alert>
            <h3 class="text-h6 mt-5 mb-3 section-title">Použitá metoda</h3>
            <v-expansion-panels variant="accordion" class="custom-panels">
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="info" size="small" class="mr-2">mdi-message-text-outline</v-icon>
                  <span>LSB v audio (skrytí textu)</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong>Popis:</strong>
                    Zpráva je zakódována do nejméně významných bitů audio vzorků v jednom kanálu. Změny jsou neslyšitelné, ale kapacita je omezená délkou a
                    kvalitou nahrávky.
                  </p>
                  <p class="text-body-1">
                    <strong>Omezení:</strong>
                    Podporovány jsou především WAV soubory. U MP3 a jiných ztrátových formátů je vysoké riziko ztráty zprávy.
                  </p>
                  <p class="text-body-1">
                    <strong>Doporučení:</strong>
                    Pro maximální spolehlivost používejte nekomprimované WAV soubory a delší nahrávky.
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>

        <!-- Šifrování -->
        <v-card class="mb-8 feature-card elevation-2" rounded="lg">
          <div class="feature-header primary">
            <v-icon size="large" class="feature-icon">mdi-shield-lock</v-icon>
            <h2 class="text-h5 font-weight-medium">Šifrování</h2>
          </div>
          <v-card-text class="pa-5">
            <p class="mb-3 text-body-1">
              Pro zvýšení bezpečnosti lze ukryté zprávy (v textu a obrázcích) šifrovat pomocí moderních algoritmů AES. Šifrování zajišťuje, že i při odhalení
              skryté zprávy nebude její obsah čitelný bez znalosti hesla.
            </p>
            <h3 class="text-h6 mt-5 mb-3 section-title">Dostupné algoritmy</h3>
            <v-expansion-panels variant="accordion" class="custom-panels">
              <v-expansion-panel>
                <v-expansion-panel-title class="method-title">
                  <v-icon color="purple" size="small" class="mr-2">mdi-shield-lock</v-icon>
                  <span>AES-128</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <p class="text-body-1">
                    <strong>Popis:</strong>
                    Symetrická bloková šifra s klíčem délky 128 bitů. Nabízí vysokou úroveň zabezpečení a rychlost.
                  </p>
                  <p class="text-body-1">
                    <strong>Doporučení:</strong>
                    Vhodná pro běžné použití, kde je důležitá rychlost i bezpečnost.
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
                    <strong>Popis:</strong>
                    Symetrická bloková šifra s klíčem délky 256 bitů. Poskytuje nejvyšší úroveň zabezpečení, vhodná pro citlivá data a dlouhodobou ochranu.
                  </p>
                  <p class="text-body-1">
                    <strong>Doporučení:</strong>
                    Používejte pro data vyžadující maximální bezpečnost (např. osobní údaje, důvěrné informace).
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            <v-alert density="compact" type="info" variant="tonal" class="mt-4">
              <strong>Poznámka:</strong>
              Šifrování je volitelné a dostupné pouze pro textovou a obrazovou steganografii.
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Obecné varování a doporučení -->
        <v-card class="mb-8 feature-card elevation-2" rounded="lg">
          <div class="feature-header primary">
            <v-icon size="large" class="feature-icon">mdi-alert-decagram</v-icon>
            <h2 class="text-h5 font-weight-medium">Obecná doporučení a varování</h2>
          </div>
          <v-card-text class="pa-5">
            <ul class="feature-list mb-3">
              <li>
                <v-icon color="warning" size="small" class="mr-2">mdi-alert</v-icon>
                <strong>Testujte výsledky:</strong>
                Po ukrytí zprávy vždy ověřte, že ji lze úspěšně odkrýt. U některých formátů (audio, video) může dojít ke ztrátě dat při exportu nebo opětovném
                nahrání.
              </li>
              <li>
                <v-icon color="warning" size="small" class="mr-2">mdi-alert</v-icon>
                <strong>Limity kapacity:</strong>
                Každá metoda má omezenou kapacitu. Pokud je zpráva příliš dlouhá, nemusí být možné ji ukrýt.
              </li>
              <li>
                <v-icon color="warning" size="small" class="mr-2">mdi-alert</v-icon>
                <strong>Bezpečnost:</strong>
                Steganografie sama o sobě nezaručuje bezpečnost obsahu. Pro citlivé informace vždy používejte šifrování.
              </li>
              <li>
                <v-icon color="warning" size="small" class="mr-2">mdi-alert</v-icon>
                <strong>Vhodné použití:</strong>
                Pro nejlepší výsledky používejte kvalitní, nekomprimované soubory (WAV, PNG, video s vysokým bitrate).
              </li>
              <li>
                <v-icon color="warning" size="small" class="mr-2">mdi-alert</v-icon>
                <strong>Kompatibilita znaků:</strong>
                Pokud zadáváte speciální znaky (české znaky, diakritika), ověřte, že je metoda podporuje.
              </li>
            </ul>
          </v-card-text>
        </v-card>

        <!-- Informace o školním projektu závěr-->
        <v-card class="mb-8 feature-card elevation-2" rounded="lg">
          <div class="feature-header primary">
            <v-icon size="large" class="feature-icon">mdi-school-outline</v-icon>
            <h2 class="text-h5 font-weight-medium">Poznámka k implementaci</h2>
          </div>
          <v-card-text class="pa-5">
            <p class="mb-3 text-body-1">
              Aplikace byla vyvinuta jako praktická demonstrace steganografických technik v rámci předmětu
              <strong>ENC-K - Kryptologie</strong>
              na Mendelově univerzitě v Brně.
            </p>
            <p class="mb-0 text-body-1">
              Pro implementaci byl zvolen JavaScript a framework Vue.js, což umožňuje přístup k aplikaci přímo z webového prohlížeče bez nutnosti instalace
              dodatečného software. Přestože tento přístup může mít určitá omezení z hlediska výkonu při zpracování větších souborů, poskytuje vysokou míru
              dostupnosti a uživatelské přívětivosti.
            </p>
          </v-card-text>
        </v-card>

        <!-- Dostupná prostředí -->
        <v-card class="mb-8 feature-card elevation-2" rounded="lg">
          <div class="feature-header primary">
            <v-icon size="large" class="feature-icon">mdi-web</v-icon>
            <h2 class="text-h5 font-weight-medium">Dostupná prostředí</h2>
          </div>
          <v-card-text class="pa-5">
            <p class="mb-4 text-body-1">Tato aplikace je dostupná online na následujících platformách:</p>

            <div class="d-flex justify-space-around flex-wrap gap-4">
              <v-card width="250" class="environment-card pa-4 text-center elevation-2" rounded="lg">
                <v-avatar size="56" class="mb-3 bg-primary-lighten-5">
                  <v-icon color="primary" size="36">mdi-github</v-icon>
                </v-avatar>
                <h3 class="text-h6 mb-2">GitHub Pages</h3>
                <p class="text-body-2 mb-4">Veřejně přístupná verze aplikace hostovaná na GitHub Pages</p>
                <v-btn
                  color="primary"
                  variant="outlined"
                  class="px-6"
                  href="https://malatass.github.io/steganographic_project/"
                  target="_blank"
                  prepend-icon="mdi-open-in-new"
                >
                  Otevřít aplikaci
                </v-btn>
              </v-card>

              <v-card width="250" class="environment-card pa-4 text-center elevation-2" rounded="lg">
                <v-avatar size="56" class="mb-3 bg-amber-lighten-5">
                  <v-icon color="amber-darken-2" size="36">mdi-school</v-icon>
                </v-avatar>
                <h3 class="text-h6 mb-2">Server Akela</h3>
                <p class="text-body-2 mb-4">Verze aplikace hostovaná na školním serveru Mendelu</p>
                <v-btn
                  color="amber-darken-2"
                  variant="outlined"
                  class="px-6"
                  href="https://akela.mendelu.cz/~xfisa/ENC-K/"
                  target="_blank"
                  prepend-icon="mdi-open-in-new"
                >
                  Otevřít na Akela
                </v-btn>
              </v-card>

              <v-card width="250" class="environment-card pa-4 text-center elevation-2" rounded="lg">
                <v-avatar size="56" class="mb-3 bg-indigo-lighten-5">
                  <v-icon color="indigo" size="36">mdi-source-repository</v-icon>
                </v-avatar>
                <h3 class="text-h6 mb-2">Zdrojový kód</h3>
                <p class="text-body-2 mb-4">Kompletní zdrojový kód aplikace na GitHubu</p>
                <v-btn
                  color="indigo"
                  variant="outlined"
                  class="px-6"
                  href="https://github.com/Malatass/steganographic_project"
                  target="_blank"
                  prepend-icon="mdi-github"
                >
                  Zobrazit kód
                </v-btn>
              </v-card>
            </div>
          </v-card-text>
        </v-card>

        <!-- Tlačítko zpět na hlavní stránku -->
        <div class="text-center mt-8 mb-6">
          <v-btn to="/" size="large" color="primary" variant="outlined" class="px-6 py-2">
            <v-icon class="mr-2">mdi-arrow-left</v-icon>
            Zpět na hlavní stránku
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
  .features-view {
    padding-bottom: 3rem;
  }

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

  .feature-card {
    transition: none !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .feature-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: none !important;
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

  .feature-list {
    list-style-type: none;
    padding-left: 0.5rem;
  }

  .feature-list li {
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
  }

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

  .breadcrumbs-nav {
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  }

  .breadcrumb-current {
    font-weight: 500;
    color: #79be15 !important;
  }

  .code-inline {
    background-color: #f5f5f5;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
    color: #e91e63;
    font-size: 0.9em;
  }
</style>
