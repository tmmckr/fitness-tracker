import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { calculateChange } from './utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function App() {
  const [monthsData, setMonthsData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState('2026-06'); // Format: YYYY-MM
  
  // PDF Referenz
  const pdfRef = useRef();

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
    const gesamtKm = (parseFloat(joggen) || 0) + (parseFloat(fahrrad) || 0) + (parseFloat(ergo) || 0);
    
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

  // PDF Export Funktion
  const exportToPDF = () => {
    const input = pdfRef.current;
    
    // Kurzes Timeout, um sicherzugehen, dass alles gerendert ist
    setTimeout(() => {
      html2canvas(input, { scale: 2, backgroundColor: '#ffffff' }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        // Fügt das Bild mit 10mm Abstand von oben ein
        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
        pdf.save(`Fitness_Report_${selectedMonth}.pdf`);
      });
    }, 100);
  };

  const current = monthsData[selectedMonth] || { joggen: 0, fahrrad: 0, ergo: 0, kraft: 0, gewicht: 0, gesamtKm: 0 };
  const previous = monthsData[getPreviousMonthKey(selectedMonth)] || null;

  return (
    <div style={{ padding: '15px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Dieser Container wird zum PDF gemacht */}
      <div ref={pdfRef} style={{ padding: '10px', backgroundColor: '#ffffff' }}>
        <h2 style={{ textAlign: 'center', color: '#1a365d' }}>Fitness Tracker</h2>
        
        {/* Monatsauswahl */}
        <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold' }}>
          Monat auswählen:
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px', fontSize: '16px' }} />
        </label>

        {/* Dashboard Karten */}
        <div style={{ display: 'block', marginBottom: '20px' }}>
          {[
            { label: 'Gesamt Strecke', val: `${current.gesamtKm} km`, change: calculateChange(current.gesamtKm, previous?.gesamtKm) },
            { label: 'Joggen', val: `${current.joggen} km`, change: calculateChange(current.joggen, previous?.joggen) },
            { label: 'Fahrrad', val: `${current.fahrrad} km`, change: calculateChange(current.fahrrad, previous?.fahrrad) },
            { label: 'Ergometer', val: `${current.ergo} km`, change: calculateChange(current.ergo, previous?.ergo) },
            { label: 'Krafttraining', val: `${current.kraft} Einheiten`, change: calculateChange(current.kraft, previous?.kraft) },
            { label: 'Gewicht', val: `${current.gewicht} kg`, change: calculateChange(current.gewicht, previous?.gewicht, true) },
          ].map((item, idx) => (
            <div key={idx} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px', backgroundColor: '#f7fafc' }}>
              <span style={{ fontSize: '12px', color: '#718096', display: 'block' }}>{item.label}</span>
              <strong style={{ fontSize: '18px', color: '#2d3748' }}>{item.val}</strong>
              {previous && <span style={{ float: 'right', fontSize: '14px', fontWeight: 'bold', color: item.change.color }}>{item.change.text}</span>}
            </div>
          ))}
        </div>
      </div>
      {/* Ende des PDF-Containers */}

      {/* PDF Button */}
      <button onClick={exportToPDF} style={{ width: '100%', backgroundColor: '#4a5568', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '25px' }}>
        📄 Übersicht als PDF exportieren
      </button>

      {/* Eingabe Formular (erscheint NICHT im PDF) */}
      <form onSubmit={handleSubmit} style={{ border: '1px solid #cbd5e0', padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Werte eintragen</h3>
        {['Joggen (km)', 'Fahrrad (km)', 'Ergometer (km)', 'Krafttraining (Einh.)', 'Gewicht (kg)'].map((label, idx) => {
          const states = [setJoggen, setFahrrad, setErgo, setKraft, setGewicht];
          const values = [joggen, fahrrad, ergo, kraft, gewicht];
          return (
            <label key={idx} style={{ display: 'block', marginBottom: '10px' }}>
              {label}:
              <input type="number" step="0.01" value={values[idx]} onChange={(e) => states[idx](e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px', fontSize: '16px' }} />
            </label>
          );
        })}
        <button type="submit" style={{ width: '100%', backgroundColor: '#2b6cb0', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          Monatsdaten speichern
        </button>
      </form>
    </div>
  );
}

export default App;