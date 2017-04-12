[relation]: sqlExample.png
[document]: mongoExample.png

# cygni-competence-mongodb

### SQL- vs Dokumentdatabaser

SQL-databaser eller relationsdatabaser är den vanligaste och mest populära typen av databas. Här ryms MySQL, Oracle, Postgres och liknande. Det som kännetecknar en relationsdatabas är att den är uppbyggd av tabeller som innehåller ett antal rader/records och kanske framförallt att dessa tabeller och records kan relatera till varandra, genom en foreign key.

![Exempel på en relation][relation]

Varje tabell har också ett [schema](https://en.wikipedia.org/wiki/Database_schema). Varje record som läggs in i en tabell måste följa schemat. Främst innebär det att alla fält som definierats i schemat måste finnas med (om de inte tillåts vara `null`) och att fältens värde måste vara av rätt typ (ex numerisk), i vissa fall av en viss längd och så vidare.

Dokumentdatabaser som [MongoDB](https://www.mongodb.com/) lagrar, istället för rader och kolumner, dokument i en trädsruktur. Dokumenten som lagras liknar til exempel HTML-dokument eller JSON. I dokumentdatabaser saknas dessutom både relationer och scheman. Det innebär bland annat att:

* Dokumentdatabaser tenderar att innehålla [denormaliserade objekt](https://en.wikipedia.org/wiki/Denormalization), eftersom relationsbegreppet saknas (det finns ingen motsvarighet till `JOIN`, som är en av SQL's grundstenar). Det finns helt enkelt inte stöd i databasen för relationer utan detta får isåfall lösas programmatiskt.
* Det inte finns några krav på att dokument i samma collection (jmf tabell) ska ha samma struktur, eftersom det inte finns ett schema att förhålla sig till.
* Ett dokument kan ha en hierarki av varierande djup. Det vill säga, ett dokuments fält kan i sig vara dokument. 

![Exempel på ett dokument][document]

_Ett exempel på hur datan i relationsexemplet skulle kunna modelleras i en dokumentdatabas. Här har man valt att ha ett dokument per flygplats. Notera att en av flygplatsposterna avviker dels i att Name saknas, dels i att FuelLevel har ett annat format. Bristen på scheman gör att detta tillåts._

Bristen på scheman gör att det är lättare att ändra och skapa nya typer av datastrukturer i MongoDB än i en SQL-Databas. Ett schema kräver arbete att sätta upp och och det innebär kanske framförallt mer arbete att förändra ett schema. Att inte ha scheman innebär samtidigt större risker att felaktig/ogenomtänkt data läggs in i databasen, vilket man således måste ha kontroll över som utvecklare.

En annan stor skillnad mellan SQL-databaser och MongoDB är att MongoDB saknar stöd för [transaktioner](https://en.wikipedia.org/wiki/Database_transaction). En transaktion innebär att antingen går en operation (som påverkar ett eller flera records) igenom helt och hållet eller så går den inte igenom alls. MongoDB erbjuder bara den garantin för _enskilda dokument_ (inklusive subdokument). 

Ponera att en skrivoperation till en databas påverkar tio dokument/records. I en databas med transaktionsstöd kommer då antingen alla tio att uppdateras, eller inga alls (om något går fel under operationen). De förblir oförändrade vid ett fel, helt enkelt. I MongoDB kan det hända att exempelvis tre av dessa uppdateras men att sju förblir ouppdaterade, om ett fel skulle inträffa mitt i operationen.

Det här måste man ha kännedom om/ta hänsyn till när man utvecklar en applikation vars databas saknar transaktionsstöd. 

### Okej, men vilken databas är bäst?

Bra fråga. Ett av de sundare svaren är "det beror på". Ett bra tillvägagångssätt när man väljer databas är helt enkelt att fundera kring vad det är för data man har att göra med, hur man tror att den kommer att utvecklas (eller inte utvecklas), hur datan ska användas och så vidare. När det är utrett kan man göra en bedömning av vilken databas som är lämplig. Värt att poängtera här är också att det finns många olika typer av databaser inom NoSQL-sfären, MongoDb är bara en av dem. Samma gäller visserligen SQL, men skillnaderna mellan olika databaser är som regel större när det gäller NoSQL.

Innan du börjar med övningen, läs artikeln [SQL vs NoSQL: The Differences](http://www.sitepoint.com/sql-vs-nosql-differences/) som tar upp skillnader och argumenterar för att låta varje use case välja databas. Notera dock att även om författaren använder en generell benämning av NoSQL-databaser så är det MongoDb han utgår ifrån i alla exempel. Läs även fortsättningsartikeln i samma serie, [SQL vs NoSQL: How to Choose](https://www.sitepoint.com/sql-vs-nosql-choose/). 

Det är alltså ingen självklarhet vilken databas man ska välja, och framförallt är det svårt (omöjligt?) att välja *en* databas som ska passa för alla ens syften. MongoDB har fördelen att datan (oftast) är denormaliserad/saknar relationer vilket normalt leder till högre prestanda vid CRUD-operationer. I en SQL-databas kan dessa operationer, givetvis beroende på komplexitet, kräva en hel del overhead. MongoDB vinner också snabbhet tack vare frånvaron av constraints och transaktioner. 

Samtidigt är det uppenbart att det man vinner i snabbhet förlorar man i funktionalitet - transaktioner, constraints och relationer är kraftfulla verktyg som kan vara helt oumbärliga beroende på applikation. En avvägning, helt enkelt. Värt att komma ihåg är också att SQL-databaser har en mycket längre historia med årtionden av optimiseringar, stabila implementationer och mängder av utbildad och erfaren personal. NoSQL-databaser utvecklas dock också kontinuerligt och det finns ofta bra hjälp att tillgå och andra som har stött på samma problem som du.

Efter den introduktionen är du nu redo att prova själv, dags att testa MongoDB!

## Installationsinstruktioner

Installera mongo för din platform:

https://docs.mongodb.org/manual/installation/#tutorials

Klona detta repo.


## Prova MongoDB direkt i skalet
Vi börjar med att bekanta oss med MongoDB-skalet. Mongo har ett interaktivt Javascript-skal, om du är bekant med Javascript sedan tidigare kommer du snabbt att bli bekväm. Det går att antingen exekvera databas-queries (och annan JS-kod) direkt i skalet vilket vi ska göra nu, eller att starta en mongo-process med en javascript-fil vilket vi kommer att göra senare. Om du har installerat enligt anvisningarna och har en mongod-process igång, öppna upp ett nytt terminalfönster och skriv

```
mongo
```

för att starta ett skal. Det bör se ut ungefär såhär:

```
MongoDB shell version: 3.2.4
connecting to: test
>
```

Nu är du redo att köra! Från prompten, prova nedanstående kommandon för att få en känsla för interaktionen. Läs inte bara igenom, utan skriv själv och prova så att du får en känsla för skalet och vad som händer.

```javascript
show dbs // listar existerande databaser
use cygni-kompetens // kopplar upp databasen ‘cygni-kompentens’. Variabeln 'db' pekar nu på 'cygni-kompetens'. 
show dbs // Databasen finns ännu inte (inget har skrivits till disk) men så fort ett dokument skrivs till databasen kommer den att skapas/skrivas till disk. 
show collections // visa existerande collections i db
db.createCollection('items') // skapar en collection items, åtkomst via db.items.
show dbs // nu har databasen skapats och tar upp diskyta.
show collections // visa existerande collections i db, nu bör 'items' finnas där.
db.items.find() // listar alla ‘dokument’ i items
db.items.insert({itemName:'Crate', weight:10})
db.items.find() // verifiera innehållet i items, notera det automatgenererade _id:t, se dokumentationen
```
https://docs.mongodb.org/manual/reference/method/db.collection.insert/#id-field
```javascript
db.items.count() // räknar antalet dokument i angiven collection (items).
db.items.insert({itemName:'Hammer', weight:1}) 
db.items.find() // verifiera tilllägget
db.items.count() 
db.items.insert([{itemName:'Nail', weight:0}, {itemName:'Nail', weight:0}, {itemName:'Nail', weight:0} ]) // bulk insert
db.items.count() // hur många documents blev skrivna till databasen? Varför?
db.items.insert([{_id:'favoriteNail', itemName:'Nail', weight:0}, {_id:'favoriteNail', itemName:'Nail', weight:0}, {_id:'favoriteNail', itemName:'Nail', weight:0} ])
db.items.count() // hur många documents blev skrivna till databasen? Varför?
db.items.find().sort({ weight: 1 }) // sorterar stigande på fältet weight. 
db.items.find().sort({ weight: -1 }) // sorterar fallande på fältet weight.
db.items.find().sort({ weight: -1 }).limit(2) // sorterar fallande på fältet weight och begränsar resultatet till de två första dokumenten i resultatsetet. Läs gärna mer om sort() i dokumentationen.
```
https://docs.mongodb.org/manual/reference/method/cursor.sort/
```javascript
db.items.find({itemName:'Nail'}) // Nu har vi lagt till en query till find(), där vi säger att vi bara vill ha dokument som har fältet itemName med värdet Nail. Notera också skillnaderna i resultatet på _id-fältet. När vi inte anger _id automatgenereras ett värde, men när vi tidgare satte 'favoriteNail' så gäller det som _id.
db.items.find({}, {itemName: true}).sort({ weight: -1 }).limit(2) // notera att första argumentet, queryn, är tomt. Vi vill söka igenom alla dokument, men argument nummer två är en projection, vi är endast intresserade av att se itemName.
db.items.find({}, {weight: true, _id:false}) // Lista endast attributet weight genom att aktivt exkludera _id. Läs mer om querying och projection i dokumentationen.
```
https://docs.mongodb.org/manual/reference/method/db.collection.find
```javascript
db.items.update({itemName:'Hammer'},{itemName:'Sledgehammer', weight:'10', description:'Its bigger and better.'}) // enstaka uppdatering. Hela dokumentet ersätts.
db.items.update({itemName:'Nail'}, {$inc:{weight: 1}, $set:{description:'Heavy metal'}}) // uppdatering som förändrar givna fält istället för att ersätta dokumentet med ett helt nytt.
db.items.find({description:{$exists:true}}) // lista de dokument som har ett description-fält.
db.items.update({itemName:{$exists:true}, description:{$exists:false}}, {$set:{description:'No description'}},{multi:true}) // träffa resterande, sätt 'No Description' på dessa.
db.items.update({itemName:'Wood'},{$set:{lastDelivery:ISODate()},$inc:{quantity:1}, $setOnInsert:{firstdelivery:ISODate()}},{upsert:true}) // upsert = update if exists, insert if not.
db.items.find({itemName:'Wood'}) // notera värdet på timestamps och quantity
db.items.update({itemName:'Wood'},{$set:{lastDelivery:ISODate()},$inc:{quantity:1}, $setOnInsert:{firstdelivery:ISODate()}},{upsert:true})
db.items.find({itemName:'Wood'}) // jämför timestamps och quantity
```
https://docs.mongodb.com/manual/reference/method/db.collection.update/

### Javascript-tester
Nu har du fått bekanta dig en del med basic CRU(D) i mongoDB-skalet. MongoDB kan också startas med en js-fil varpå kommandona i filen exekveras. Allra vanligast är dock att använda en [driver](https://docs.mongodb.com/ecosystem/drivers/) för det programmeringsspråk man använder i sin applikation för interaktion med databasen.

För övningen ska vi dock starta MongoDB med en js-fil som argument. Det finns ett antal tester i [answers.js](https://github.com/mickeelm/cygni-competence-mongodb/blob/master/answers.js), det är din uppgift att få dessa att gå igenom. Se TODO-kommentarer för en hint kring hur du ska lyckas få respektive test att gå igenom. Editera din lokala version och kör ett test i taget. Se till att du står i rätt katalog och kör:

```bash
mongo answers.js
```
