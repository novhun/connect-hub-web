// Utility for automatic language detection and translation between Khmer and English

const translationCache = new Map<string, string>();

// Detect if text contains Khmer characters
export function detectLanguage(text: string): 'km' | 'en' | 'unknown' {
  if (!text || !text.trim()) return 'unknown';
  const clean = text.trim();
  
  // Khmer Unicode Block: \u1780-\u17FF (Khmer), \u19E0-\u19FF (Khmer Symbols)
  const khmerMatch = clean.match(/[\u1780-\u17FF\u19E0-\u19FF]/g);
  const latinMatch = clean.match(/[a-zA-Z]/g);

  const khmerCount = khmerMatch ? khmerMatch.length : 0;
  const latinCount = latinMatch ? latinMatch.length : 0;

  if (khmerCount > 0 && khmerCount >= latinCount * 0.3) {
    return 'km';
  }
  if (latinCount > 0) {
    return 'en';
  }
  return 'unknown';
}

// Common phrase dictionary for fast offline & accurate social translations
const EN_TO_KM_MAP: Record<string, string> = {
  'good morning': 'អរុណសួស្តី',
  'good morning everyone': 'អរុណសួស្តីអ្នកទាំងអស់គ្នា',
  'good afternoon': 'ទិវាសួស្តី',
  'good evening': 'សាយណ្ហសួស្តី',
  'good night': 'រាត្រីសួស្តី',
  'hello': 'សួស្តី',
  'hello world': 'សួស្តីពិភពលោក',
  'hi everyone': 'សួស្តីអ្នកទាំងអស់គ្នា',
  'how are you': 'តើអ្នកសុខសប្បាយជាទេ?',
  'thank you': 'អរគុណ',
  'thank you so much': 'អរគុណច្រើនណាស់',
  'welcome': 'សូមស្វាគមន៍',
  'congratulations': 'សូមអបអរសាទរ',
  'happy birthday': 'រីករាយថ្ងៃខួបកំណើត',
  'happy new year': 'រីករាយឆ្នាំថ្មី',
  'have a great day': 'សូមឱ្យមានថ្ងៃដ៏រីករាយ',
  'have a nice day': 'សូមឱ្យមានថ្ងៃល្អ',
  'stay safe': 'សូមថែរក្សាសុវត្ថិភាពទាំងអស់គ្នា',
  'good luck': 'សូមសំណាងល្អ',
  'awesome': 'អស្ចារ្យណាស់',
  'beautiful': 'ស្រស់ស្អាតណាស់',
  'nice': 'ល្អណាស់',
  'great': 'អស្ចារ្យ',
  'love this': 'ស្រឡាញ់មួយនេះណាស់',
  'miss you': 'នឹកអ្នក',
  'weekend vibes': 'បរិយាកាសចុងសប្តាហ៍',
  'feeling happy': 'មានអារម្មណ៍ថារីករាយ',
  'feeling excited': 'មានអារម្មណ៍ថារំភើប',
  'feeling blessed': 'មានអារម្មណ៍ថាមានសំណាងល្អ',
  'feeling thankful': 'មានអារម្មណ៍ថាដឹងគុណ',
  'feeling loved': 'មានអារម្មណ៍ថាត្រូវបានគេស្រឡាញ់',
  'just finished my workout': 'ទើបតែហាត់ប្រាណរួច',
  'enjoying the coffee': 'កំពុងរីករាយជាមួយកាហ្វេ',
  'coffee time': 'ពេលកាហ្វេ',
  'working hard': 'ខិតខំធ្វើការ',
  'new project coming soon': 'គម្រោងថ្មីនឹងមកដល់ក្នុងពេលឆាប់ៗនេះ',
  'what do you think': 'តើអ្នកយល់យ៉ាងណាដែរ?',
  'check this out': 'សាកមើលនេះទៅមើល',
  'enjoying life': 'រីករាយជាមួយជីវិត',
  'best day ever': 'ថ្ងៃដ៏ល្អបំផុតមិនធ្លាប់មាន',
  'family time': 'ពេលវេលាជាមួយគ្រួសារ',
  'traveling': 'កំពុងធ្វើដំណើរ',
  'sunset': 'ថ្ងៃលិច',
  'sunrise': 'ថ្ងៃរះ',
  'food': 'ម្ហូបអាហារ',
  'delicious': 'ឆ្ងាញ់ណាស់',
};

const KM_TO_EN_MAP: Record<string, string> = {
  'អរុណសួស្តី': 'Good morning',
  'អរុណសួស្តីអ្នកទាំងអស់គ្នា': 'Good morning everyone',
  'សួស្តី': 'Hello',
  'សួស្តីអ្នកទាំងអស់គ្នា': 'Hello everyone',
  'តើអ្នកសុខសប្បាយជាទេ': 'How are you?',
  'អរគុណ': 'Thank you',
  'អរគុណច្រើន': 'Thank you very much',
  'អរគុណច្រើនណាស់': 'Thank you so much',
  'សូមស្វាគមន៍': 'Welcome',
  'សូមអបអរសាទរ': 'Congratulations',
  'រីករាយថ្ងៃខួបកំណើត': 'Happy birthday',
  'រីករាយឆ្នាំថ្មី': 'Happy New Year',
  'រាត្រីសួស្តី': 'Good night',
  'សូមសំណាងល្អ': 'Good luck',
  'ស្រស់ស្អាតណាស់': 'Very beautiful',
  'ល្អណាស់': 'Very good',
  'អស្ចារ្យណាស់': 'Awesome',
  'នឹកអ្នក': 'Miss you',
  'ឆ្ងាញ់ណាស់': 'Very delicious',
  'កំពុងរីករាយជាមួយកាហ្វេ': 'Enjoying coffee',
  'ពេលកាហ្វេ': 'Coffee time',
  'គម្រោងថ្មី': 'New project',
  'រីករាយថ្ងៃចុងសប្តាហ៍': 'Happy weekend',
};

// Translate text between English and Khmer
export async function translatePostContent(
  text: string,
  targetLang: 'km' | 'en'
): Promise<string> {
  if (!text || !text.trim()) return text;
  const trimmed = text.trim();
  const cacheKey = `${targetLang}:${trimmed}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 1. Check exact dictionary match
  const lower = trimmed.toLowerCase();
  if (targetLang === 'km' && EN_TO_KM_MAP[lower]) {
    const result = EN_TO_KM_MAP[lower];
    translationCache.set(cacheKey, result);
    return result;
  }
  if (targetLang === 'en' && KM_TO_EN_MAP[trimmed]) {
    const result = KM_TO_EN_MAP[trimmed];
    translationCache.set(cacheKey, result);
    return result;
  }

  // 2. Try online translation via fast free translation API
  try {
    const fromLang = targetLang === 'km' ? 'en' : 'km';
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedText = data[0].map((item: any) => item[0]).join('');
        if (translatedText && translatedText.trim()) {
          translationCache.set(cacheKey, translatedText);
          return translatedText;
        }
      }
    }
  } catch {
    // Network or offline fallback
  }

  // 3. Smart phrase substitution fallback
  let fallbackResult = trimmed;
  if (targetLang === 'km') {
    for (const [enKey, kmVal] of Object.entries(EN_TO_KM_MAP)) {
      const reg = new RegExp(`\\b${enKey}\\b`, 'gi');
      fallbackResult = fallbackResult.replace(reg, kmVal);
    }
  } else {
    for (const [kmKey, enVal] of Object.entries(KM_TO_EN_MAP)) {
      fallbackResult = fallbackResult.split(kmKey).join(enVal);
    }
  }

  translationCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}
