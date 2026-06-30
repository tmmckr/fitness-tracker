import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { calculateChange } from './utils';
function App() {
const [monthsData, setMonthsData] = useState({});
const [selectedMonth, setSelectedMonth] = useState('2026-06'); // Format: YYYY-MM
// Formular-Zustände
const [joggen, setJoggen] = useState('');
const [fahrrad, setFahrrad] = useState('');
const [ergo, setErgo] = useState('');
const [kraft, setKraft] = useState('');
const [gewicht, setGewicht] = useState('');
// Echtzeit-Synchronisation mit Firestore
useEffect(() => {
const unsubscribe = onSnapshot(collection(db, "months"), (snapshot) => {
const data = {};
snapshot.forEach((doc) => {
data[doc.id] = doc.data();
});
setMonthsData(data);
});
return () => unsubscribe();
}, []);
// Daten speichern
const handleSubmit = async (e) => {
e.preventDefault();
const gesamtKm = (parseFloat(joggen) || 0) + (parseFloat(fahrrad) || 0) +
(parseFloat(ergo) || 0);
await setDoc(doc(db, "months", selectedMonth), {
joggen: parseFloat(joggen) || 0,
fahrrad: parseFloat(fahrrad) || 0,
ergo: parseFloat(ergo) || 0,
kraft: parseInt(kraft) || 0,
gewicht: parseFloat(gewicht) || 0,
gesamtKm: parseFloat(gesamtKm.toFixed(2))
});
// Formular zurücksetzen
setJoggen(''); setFahrrad(''); setErgo(''); setKraft(''); setGewicht('');
alert("Daten erfolgreich gespeichert!");
};
// Vormonat ermitteln für den Vergleich
const getPreviousMonthKey = (currentKey) => {
const [year, month] = currentKey.split('-').map(Number);
if (month === 1) return `${year - 1}-12`;
const prevMonth = month - 1;
return `${year}-${prevMonth < 10 ? '0' : ''}${prevMonth}`;
};
const current = monthsData[selectedMonth] || { joggen: 0, fahrrad: 0, ergo: 0, kraft: 0,
gewicht: 0, gesamtKm: 0 };
const previous = monthsData[getPreviousMonthKey(selectedMonth)] || null;
return (
  {/* Monatsauswahl */}
Monat auswählen:

setSelectedMonth(e.target.value)} style={{ width:

'100%', padding: '10px', marginTop: '5px', fontSize: '16px' }} />

{/* Dashboard Karten */}

{[
{ label: 'Gesamt Strecke', val: `${current.gesamtKm} km`, change:
calculateChange(current.gesamtKm, previous?.gesamtKm) },
{ label: 'Joggen', val: `${current.joggen} km`, change:
calculateChange(current.joggen, previous?.joggen) },
{ label: 'Fahrrad', val: `${current.fahrrad} km`, change:
calculateChange(current.fahrrad, previous?.fahrrad) },
{ label: 'Ergometer', val: `${current.ergo} km`, change:
calculateChange(current.ergo, previous?.ergo) },
{ label: 'Krafttraining', val: `${current.kraft} Einheiten`, change:
calculateChange(current.kraft, previous?.kraft) },
{ label: 'Gewicht', val: `${current.gewicht} kg`, change:
calculateChange(current.gewicht, previous?.gewicht, true) },
  ].map((item, idx) => (

{item.label}
{item.val}

{previous && {item.change.text}}

))}

{/* Eingabe Formular */}
{['Joggen (km)', 'Fahrrad (km)', 'Ergometer (km)', 'Krafttraining (Einh.)',
'Gewicht (kg)'].map((label, idx) => {
const states = [setJoggen, setFahrrad, setErgo, setKraft, setGewicht];
const values = [joggen, fahrrad, ergo, kraft, gewicht];
return (
{label}:

states[idx](e.target.value)} style={{ width:

'100%', padding: '8px', marginTop: '4px', fontSize: '16px' }} />
);
})}
Monatsdaten speichern

);
}
export default App;
