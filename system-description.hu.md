# SwapLoop rendszerleírás

## Mi a SwapLoop?

A SwapLoop egy kitalált szolgáltatás az elektromos kerékpárok biztonságosabb töltéséhez Sanghajban. Segít elkerülni, hogy az elektromos kerékpárok akkumulátorait lakásokban, folyosókon vagy más alkalmatlan helyeken töltsék — ami korábban súlyos tűzesetekhez vezetett.

A SwapLoop állomások a következőket kínálják:

- **Akkumulátorcsere** kompatibilis, kivehető akkumulátorral rendelkező elektromos kerékpárokhoz.
- **E-bike-töltőhelyek** beépített akkumulátorral rendelkező elektromos kerékpárokhoz.

Egyes állomások csak az egyik szolgáltatást nyújtják; a hibrid állomások mindkettőt.

A rendszer az alábbi fizikai egységeket különbözteti meg:

- A **SwapLoop Station** (SwapLoop állomás) a teljes szolgáltatási helyszín.
- Az **E-bike Charging Bay** (e-bike-töltőhely) egy teljes, beépített akkumulátoros elektromos kerékpár töltésére szolgál.
- A **Battery Swap Cabinet** (akkumulátorcserélő automata) a cserélhető akkumulátorokat tároló és töltő berendezés.
- A **Battery Slot** (akkumulátorrekesz) az akkumulátorcserélő automata egyetlen rekesze.

A SwapLoop hálózattal nem kompatibilis, kivehető akkumulátorok töltése nem része a szolgáltatásnak.

## Hogyan használják a felhasználók a SwapLoopot

### Regisztráció és profilkezelés

A felhasználó regisztrálhat egy fiókot. A regisztráció során megadja, milyen típusú elektromos kerékpárja van, és milyen akkumulátorral rendelkezik. A regisztrált felhasználó beléphet, megtekintheti vagy módosíthatja a profilját, és igénybe veheti a szolgáltatásokat. A versenyfeladat előre létrehozott tesztfiókokat is biztosít. A bejelentkezés egyszerű bearer tokent használ; összetett OAuth-folyamat, tokenfrissítés, e-mail-megerősítés és jelszó-visszaállítás nem szükséges.

A flottás futárok nem így regisztrálnak: a fiókjukat a flottakezelő hozza létre. Ez a folyamat nem tartozik a feladat hatókörébe.

### Állomás keresése

A felhasználó:

- megjelenítheti az összes állomást,
- helyadatok alapján szűrheti a listát a közeli állomásokra,
- beolvashatja az állomáson megjelenített QR-kódot.

A rendszer a kiválasztott állomásnál megjeleníti a szolgáltatásokat, a nyitvatartási állapotot, a kompatibilis akkumulátortípusokat és az aktuális rendelkezésre állást.

### Akkumulátor cseréje

Kompatibilis, kivehető akkumulátorral rendelkező felhasználó:

1. Kiválaszt egy állomást kereséssel, ahol van számára megfelelő, kész akkumulátor. Ha már az állomásnál van, az állomás kifüggesztett QR-kódjának beolvasásával ellenőrzi, van-e megfelelő akkumulátor.
2. Lefoglalja az akkumulátort. Ha a cserét 15 percen belül nem végzi el, a foglalás törlődik.
3. Elmegy a helyszínre, és kiveszi a lemerült akkumulátort az elektromos kerékpárból.
4. Beolvassa a Battery Swap Cabinet QR-kódját. Érvényes foglalás esetén kinyílik a feltöltött akkumulátort tartalmazó Battery Slot; a felhasználó kiveszi a feltöltött akkumulátort.
5. Beolvassa a lemerült akkumulátor QR-kódját, majd ugyanabba a Battery Slotba helyezi az akkumulátort.
6. A rekesz lezárása után a rendszer befejezi a cserét, és levonja a szolgáltatás díját.
7. A felhasználó megtekinti a befejezett szolgáltatást és a nyugtát. A nyugta egyéni felhasználónál tartalmazza a szolgáltatás árát is, flottás felhasználóknál ez az adat hiányzik.

### Beépített akkumulátoros elektromos kerékpár töltése

Beépített akkumulátorral rendelkező felhasználó:

1. Keres egy megfelelő E-bike Charging Bay szolgáltatást nyújtó SwapLoop állomást.
2. Lefoglal egy kompatibilis e-bike-töltőhelyet.
3. A helyszínen beolvassa az e-bike-töltőhely QR-kódját.
4. A rendszer ellenőrzi a felhasználót, a foglalást, a kompatibilitást és a töltőhely biztonsági állapotát, majd elindítja a szimulált töltést.
5. Az elektromos kerékpár a töltés ideje alatt a töltőhelyen marad. A rendszer jelzi, ha a töltés befejeződött vagy biztonsági okból leállt.
6. A felhasználó átveszi az elektromos kerékpárt, a rendszer pedig lezárja a töltési munkamenetet.

## Egyéb felhasználók

### Futárok

A futárok ugyanazt a cserefolyamatot használják. Kiválasztott csúcsidőszakokban egy szállítási partner prioritást kaphat az állomás kapacitásának egy részére. A prioritás soha nem írja felül a kompatibilitási vagy biztonsági ellenőrzéseket.

## Biztonság és megbízhatóság

A QR-kódok azonosítják az állomásokat és a fizikai egységeket, de önmagukban nem adnak hozzáférést. A rendszer emellett ellenőrzi a bejelentkezett felhasználót, a foglalást, a helyszínt, az időt, a kompatibilitást és a biztonsági állapotot.

## Csomagok, szolgáltatási előzmények és nyugták

A felhasználók használhatnak használatalapú (_pay-as-you-go_) csomagot. A szállítási partnerek flottacsomagot használnak.

A felhasználók megtekinthetik a befejezett cseréket és töltési munkameneteket, valamint a nyugtákat.

## Rendszerarchitektúra

### Admin felület

A szolgáltatás adminisztrációs felülete SSR-alkalmazás, amely önállóan fér hozzá az adatbázisban tárolt adatokhoz. Az élő állomásállapotot és telemetriai adatokat közvetlenül a Station Service-től kérdezi le. Az adminfelület nem függ a később elkészülő Main Backendtől. Ezen a felületen a rendszeradminisztrátorok végzik a feladataikat. Az admin funkciók pontos köre még meghatározandó (TBD).

### Main Backend és Station Service

A **Main Backend** biztosítja a SPA frontend számára szükséges REST API-végpontokat. Kezeli többek között a felhasználókat, profilokat, foglalásokat, jogosultságokat, szolgáltatási folyamatokat és díjakat.

A **Station Service** a fizikai infrastruktúrát szimulálja. Élő műszaki állapotot és telemetriai adatokat szolgáltat a SwapLoop állomásokról, az akkumulátorcserélő automatákról, az akkumulátorrekeszekről, az e-bike-töltőhelyekről és az akkumulátorokról. Nem kezel felhasználókat, foglalásokat vagy üzleti állapotokat.

A Main Backend rendszeres lekérdezésekkel frissíti az állomások műszaki állapotát. Ha egy akkumulátor töltés alatt áll, annak telemetriai adatai egyedileg is lekérdezhetők. A Main Backend csak akkor tekint foglalhatónak egy erőforrást, ha az a Station Service szerint műszakilag használható, és a Main Backend nyilvántartásában nincs rá aktív foglalás. A párhuzamos foglalások megakadályozása a Main Backend és az adatbázis feladata.

A Module B adminfelülete közvetlenül használja az adatbázist és a Station Service-t, mert a Module B elkészítésekor a Main Backend még nem létezik. A Module B adminfelületének és a később elkészülő Main Backendnek lehetőség szerint egymástól függetlenül kell működnie.

### SPA frontend

Az SPA frontend mobile-first ügyfélalkalmazás, amely a natív mobilalkalmazást helyettesíti. Az ügyfelek ezzel menedzselhetik a szolgáltatás igénybevételét (lásd: [Hogyan használják a felhasználók a SwapLoopot](#hogyan-használják-a-felhasználók-a-swaploopot)).

### QR-kód kezelés

Versenykörnyezetben a QR-kód-beolvasást egy biztosított emulátor helyettesíti, így nincs szükség kamerára vagy valódi fizikai berendezésre. Ezért:

1. A Station Service tárolja a szimulációhoz kiválasztott QR-kód adatait.
2. Az emulátor webkomponensként áll a versenyzők rendelkezésére, és beépíthető az alkalmazásba.
3. A szimulációhoz a Station Service-hez kapcsolódó egyszerű felületen kiválasztják, melyik kód beolvasását akarják szimulálni, például egy SwapLoop Station vagy Battery Swap Cabinet QR-kódját.
4. Ha a frontenden aktiválják a QR-kód-beolvasást, a webkomponens egyszerű lekérdezéssel lekéri a kiválasztott kódot a Station Service-től.
5. A kiválasztott QR-kód vizuálisan is megjelenik, a webkomponens pedig átadja a beolvasott tartalmat a frontendnek.

A SwapLoop egy versenyprototípus. Szimulálja az akkumulátorcserélő automata rekeszeinek nyitását és a töltési működést; nem vezérel valódi hardvert, és nem dolgoz fel valódi fizetéseket.
