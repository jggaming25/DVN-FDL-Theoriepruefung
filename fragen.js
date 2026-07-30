const FRAGEN = [
  { id:1, typ:"singleChoice", titel:"Was ist die maximale Geschwindigkeit innerorts?", optionen:["30 km/h","50 km/h","70 km/h","100 km/h"], maxPunkte:5, bild:null },
  { id:2, typ:"multipleChoice", titel:"Welche Dokumente müssen Sie beim Führen eines Fahrzeugs mitführen?", optionen:["Führerschein","Reisepass","Fahrzeugschein","Krankenversicherungskarte"], maxPunkte:8, bild:null },
  { id:3, typ:"freetext", titel:"Was bedeutet das rote Dreiecksschild mit einem 'V' darauf?", maxZeichen:200, zeichenArt:"lettersAndNumbers", maxPunkte:5, bild:null },
  { id:4, typ:"numberScale", titel:"Bewerten Sie Ihre Fahrkenntnisse von 1-10:", min:1, max:10, schritt:1, maxPunkte:10, bild:null },
  { id:5, typ:"freetext", titel:"Beschreiben Sie das Verhalten bei einer Panne auf der Autobahn:", maxZeichen:500, zeichenArt:"all", maxPunkte:15, bild:null },
  { id:6, typ:"dropdown", titel:"Welche Farbe hat ein Vorfahrtsschild?", optionen:["Rot","Blau","Grün","Gelb"], maxPunkte:3, bild:null },
  { id:7, typ:"stars", titel:"Wie wichtig finden Sie regelmäßige Fahrzeugwartung?", maxSterne:5, maxPunkte:5, bild:null },
  { id:8, typ:"date", titel:"An welchem Datum ist Ihre Fahrprüfung?", maxPunkte:2, bild:null },
  { id:9, typ:"time", titel:"Um wie viel Uhr beginnt die Prüfung?", maxPunkte:2, bild:null },
  { id:10, typ:"singleChoice", titel:"Was zeigt dieses Verkehrszeichen?", optionen:["Vorfahrt gewähren","Halt! Vorfahrt gewähren","Vorfahrtstraße","Ende der Vorfahrtstraße"], maxPunkte:5, bild:"/bilder/zeichen_stop.svg" },
  { id:11, typ:"singleChoice", titel:"Wie verhalten Sie sich bei diesem Verkehrszeichen?", optionen:["Sie haben Vorfahrt","Anhalten und Vorfahrt gewähren","Nicht einfahren","Langsam fahren"], maxPunkte:5, bild:"/bilder/zeichen_vorfahrt_gewaehren.svg" },
  { id:12, typ:"stars", titel:"Bewerten Sie Ihre Kenntnisse über Verkehrsregeln:", maxSterne:5, maxPunkte:10, bild:null },
  { id:13, typ:"numberScale", titel:"Wie viele Stunden Fahrpraxis haben Sie?", min:0, max:50, schritt:0.5, maxPunkte:5, bild:null },
  { id:14, typ:"file", titel:"Laden Sie Ihren Sehtest hoch:", maxPunkte:5, bild:null, erlaubteTypen:["image/jpeg","image/png","application/pdf"] },
  { id:15, typ:"date", titel:"Wann wurde Ihr Führerscheinantrag gestellt?", maxPunkte:2, bild:null },
  { id:16, typ:"time", titel:"Um wie viel Uhr haben Sie Ihre Fahrstunde heute?", maxPunkte:2, bild:null },
  { id:17, typ:"multipleChoice", titel:"Welche Optionen sind bei einer Rotlichtmissachtung möglich?", optionen:["Bußgeld","Punkte in Flensburg","Fahrverbot","Ermahnung"], maxPunkte:10, bild:null },
  { id:18, typ:"freetext", titel:"Erklären Sie die Faustformel für den Bremsweg:", maxZeichen:300, zeichenArt:"lettersAndNumbers", maxPunkte:10, bild:null },
  { id:19, typ:"dropdown", titel:"Welchen Abstand sollten Sie auf der Autobahn einhalten?", optionen:["Halber Tacho","Ganzer Tacho","Doppelter Tacho","25 Meter"], maxPunkte:4, bild:null },
  { id:20, typ:"singleChoice", titel:"Was bedeutet dieses Verkehrszeichen?", optionen:["Parkverbot","Halteverbot","Eingeschränktes Halteverbot","Parken erlaubt"], maxPunkte:5, bild:"/bilder/zeichen_halteverbot.svg" }
];

if (typeof module !== 'undefined' && module.exports) module.exports = FRAGEN;
