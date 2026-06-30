export const calculateChange = (current, previous, isWeight = false) => {
if (previous === undefined || previous === null || previous === 0) {
return { text: "Neu", color: "#4a5568" };
}
const percent = ((current - previous) / previous) * 100;
const sign = percent > 0 ? "+" : "";
const formattedText = `${sign}${percent.toFixed(1)}%`;
// Gewichtsverlust ist positiv (grün), Gewichtszunahme negativ (rot).
// Bei Sport-Metriken ist es umgekehrt.
if (isWeight) {
return {
text: formattedText,
color: percent < 0 ? "#38a169" : percent > 0 ? "#e53e3e" : "#4a5568"
};
} else {
return {
text: formattedText,
color: percent > 0 ? "#38a169" : percent < 0 ? "#e53e3e" : "#4a5568"
};
}
};
