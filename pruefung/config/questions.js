const questions = [
  {
    id: 1,
    type: "singleChoice",
    title: "Was ist die maximale Geschwindigkeit innerorts?",
    options: ["30 km/h", "50 km/h", "70 km/h", "100 km/h"],
    correctAnswer: 1,
    maxPoints: 5,
    imageUrl: null
  },
  {
    id: 2,
    type: "multipleChoice",
    title: "Welche der folgenden Dokumente müssen Sie beim Führen eines Fahrzeugs mitführen? (Mehrere Antworten möglich)",
    options: ["Führerschein", "Reisepass", "Fahrzeugschein", "Krankenversicherungskarte"],
    correctAnswers: [0, 2],
    maxPoints: 8,
    imageUrl: null
  },
  {
    id: 3,
    type: "freetext",
    title: "Was bedeutet das rote Dreiecksschild mit einem 'V' darauf?",
    maxLength: 200,
    allowedChars: "lettersAndNumbers",
    maxPoints: 5,
    imageUrl: null
  },
  {
    id: 4,
    type: "numberScale",
    title: "Bewerten Sie Ihre Fahrkenntnisse von 1-10:",
    min: 1,
    max: 10,
    step: 1,
    maxPoints: 10,
    imageUrl: null
  },
  {
    id: 5,
    type: "freetext",
    title: "Beschreiben Sie kurz das Verhalten bei einer Panne auf der Autobahn:",
    maxLength: 500,
    allowedChars: "all",
    maxPoints: 15,
    imageUrl: null
  },
  {
    id: 6,
    type: "dropdown",
    title: "Welche Farbe hat ein Vorfahrtsschild?",
    options: ["Rot", "Blau", "Grün", "Gelb"],
    correctAnswer: 0,
    maxPoints: 3,
    imageUrl: null
  },
  {
    id: 7,
    type: "stars",
    title: "Wie wichtig finden Sie regelmäßige Fahrzeugwartung?",
    maxStars: 5,
    maxPoints: 5,
    imageUrl: null
  },
  {
    id: 8,
    type: "date",
    title: "An welchem Datum ist Ihre Fahrprüfung?",
    maxPoints: 2,
    imageUrl: null
  },
  {
    id: 9,
    type: "time",
    title: "Um wie viel Uhr beginnt die Prüfung?",
    maxPoints: 2,
    imageUrl: null
  },
  {
    id: 10,
    type: "singleChoice",
    title: "Was zeigt dieses Verkehrszeichen?",
    options: ["Vorfahrt gewähren", "Halt! Vorfahrt gewähren", "Vorfahrtstraße", "Ende der Vorfahrtstraße"],
    correctAnswer: 1,
    maxPoints: 5,
    imageUrl: "/images/zeichen_stop.svg"
  },
  {
    id: 11,
    type: "singleChoice",
    title: "Wie verhalten Sie sich bei diesem Verkehrszeichen?",
    options: ["Sie haben Vorfahrt", "Sie müssen anhalten und Vorfahrt gewähren", "Sie dürfen nicht einfahren", "Sie müssen langsam fahren"],
    correctAnswer: 1,
    maxPoints: 5,
    imageUrl: "/images/zeichen_vorfahrt_gewaehren.svg"
  },
  {
    id: 12,
    type: "stars",
    title: "Bewerten Sie Ihre Kenntnisse über Verkehrsregeln:",
    maxStars: 5,
    maxPoints: 10,
    imageUrl: null
  },
  {
    id: 13,
    type: "numberScale",
    title: "Wie viele Stunden Fahrpraxis haben Sie?",
    min: 0,
    max: 50,
    step: 0.5,
    maxPoints: 5,
    imageUrl: null
  },
  {
    id: 14,
    type: "file",
    title: "Laden Sie Ihren Sehtest hoch:",
    maxPoints: 5,
    imageUrl: null,
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"]
  },
  {
    id: 15,
    type: "date",
    title: "Wann wurde Ihr Führerscheinantrag gestellt?",
    maxPoints: 2,
    imageUrl: null
  },
  {
    id: 16,
    type: "time",
    title: "Um wie viel Uhr haben Sie Ihre Fahrstunde heute?",
    maxPoints: 2,
    imageUrl: null
  },
  {
    id: 17,
    type: "multipleChoice",
    title: "Welche Optionen sind bei einer Rotlichtmissachtung möglich?",
    options: ["Bußgeld", "Punkte in Flensburg", "Fahrverbot", "Ermahnung"],
    correctAnswers: [0, 1, 2],
    maxPoints: 10,
    imageUrl: null
  },
  {
    id: 18,
    type: "freetext",
    title: "Erklären Sie die Faustformel für den Bremsweg:",
    maxLength: 300,
    allowedChars: "lettersAndNumbers",
    maxPoints: 10,
    imageUrl: null
  },
  {
    id: 19,
    type: "dropdown",
    title: "Welchen Abstand sollten Sie auf der Autobahn mindestens einhalten?",
    options: ["halber Tacho-Abstand", "ganzer Tacho-Abstand", "doppelter Tacho-Abstand", "25 Meter"],
    correctAnswer: 0,
    maxPoints: 4,
    imageUrl: null
  },
  {
    id: 20,
    type: "singleChoice",
    title: "Was bedeutet dieses Verkehrszeichen?",
    options: ["Parkverbot", "Halteverbot", "Eingeschränktes Halteverbot", "Parken erlaubt"],
    correctAnswer: 2,
    maxPoints: 5,
    imageUrl: "/images/zeichen_halteverbot.svg"
  }
];

module.exports = questions;
