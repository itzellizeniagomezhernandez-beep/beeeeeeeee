export function detectDevice(userAgent: string) {
  const ua = userAgent.toLowerCase();
  let brand = 'Desconocido';
  let tier: 'budget' | 'mid-range' | 'flagship' = 'mid-range';
  let isIphone = false;

  if (ua.includes('iphone') || ua.includes('ipad')) {
    brand = 'Apple'; tier = 'flagship'; isIphone = true;
  } else if (ua.includes('samsung') || ua.includes('sm-')) {
    brand = 'Samsung';
    if (ua.match(/sm-s|sm-n|sm-z|sm-f/)) tier = 'flagship';
    else tier = 'mid-range';
  } else if (ua.includes('xiaomi') || ua.includes('mi ')) {
    brand = 'Xiaomi'; tier = 'mid-range';
  } else if (ua.includes('redmi')) {
    brand = 'Redmi'; tier = 'budget';
  } else if (ua.includes('poco')) {
    brand = 'POCO'; tier = 'budget';
  } else if (ua.includes('motorola') || ua.includes('moto')) {
    brand = 'Motorola'; tier = 'budget';
  } else if (ua.includes('huawei')) {
    brand = 'Huawei';
    if (ua.match(/mate|p\d0/)) tier = 'flagship';
    else tier = 'mid-range';
  } else if (ua.includes('oppo')) {
    brand = 'Oppo'; tier = 'mid-range';
  } else if (ua.includes('vivo')) {
    brand = 'Vivo'; tier = 'mid-range';
  } else if (ua.includes('realme')) {
    brand = 'Realme'; tier = 'mid-range';
  } else if (ua.includes('android')) {
    brand = 'Android';
  }

  return { brand, tier, isIphone, isMobile: ua.includes('mobi') || ua.includes('android') || ua.includes('iphone') };
}

export function getSensitivities(tier: 'budget' | 'mid-range' | 'flagship') {
  if (tier === 'budget') {
    return { general: 155, redDot: 148, scope2x: 140, scope4x: 130, awm: 85, freeLook: 110 };
  } else if (tier === 'mid-range') {
    return { general: 140, redDot: 135, scope2x: 128, scope4x: 118, awm: 72, freeLook: 95 };
  } else {
    return { general: 120, redDot: 115, scope2x: 108, scope4x: 100, awm: 60, freeLook: 80 };
  }
}

export function getSensitivitiesIphone(tier: 'budget' | 'mid-range' | 'flagship') {
  if (tier === 'budget') {
    return { general: 130, redDot: 125, scope2x: 118, scope4x: 110, awm: 70, freeLook: 90, cycles: 6, dpi: 85 };
  } else if (tier === 'mid-range') {
    return { general: 118, redDot: 112, scope2x: 105, scope4x: 98, awm: 60, freeLook: 78, cycles: 7, dpi: 95 };
  } else {
    return { general: 105, redDot: 100, scope2x: 95, scope4x: 88, awm: 50, freeLook: 68, cycles: 8, dpi: 108 };
  }
}

export function clampAndroid(val: number) { return Math.max(1, Math.min(200, Math.round(val))); }
export function clampIphoneDpi(val: number) { return Math.max(1, Math.min(120, Math.round(val))); }
export function clampCycles(val: number) { return Math.max(1, Math.min(10, Math.round(val))); }
export function clampSensi(val: number) { return Math.max(1, Math.min(200, Math.round(val))); }
