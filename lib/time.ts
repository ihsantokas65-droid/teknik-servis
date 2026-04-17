/**
 * Türkiye saati (GMT+3) ile mesai kontrolü yapar.
 * Akşam 21:00'den sabah 08:00'e kadar "kapalı" kabul edilir.
 */
export function isNightMode() {
  const now = new Date();
  
  // Local saatten bağımsız olarak TR saatini (UTC+3) hesaplayalım
  const trTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
  const hours = trTime.getHours();

  // 21:00 (21) ile 08:00 (7) arası nöbetçi mod aktif
  return hours >= 21 || hours < 8;
}

export function getOpeningTime() {
  return "08:30";
}
