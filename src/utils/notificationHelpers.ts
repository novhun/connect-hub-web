/**
 * Helper utility for localizing notification text and timestamps in Khmer and English.
 */

export function formatNotificationContent(content: string, language: 'en' | 'km'): string {
  if (!content) return '';
  if (language !== 'km') return content;

  // Specific common notification sentences
  if (content === 'reacted to your comment in Tech Enthusiasts') {
    return 'បានចុចប្រតិកម្មលើមតិយោបល់របស់អ្នកក្នុង Tech Enthusiasts';
  }
  if (content === "commented on your photo: 'The token consistency is top-notch!'") {
    return "បានបញ្ចេញមតិលើរូបថតរបស់អ្នក៖ 'The token consistency is top-notch!'";
  }
  if (content === 'invited you to join UI/UX Designers weekly critique meetup') {
    return 'បានអញ្ជើញអ្នកឱ្យចូលរួមការជួបជុំ UI/UX Designers weekly critique meetup';
  }
  if (content === 'started an audio call in General Room') {
    return 'បានចាប់ផ្តើមការហៅជាសំឡេងនៅក្នុង General Room';
  }
  if (content === 'started a video call in General Room') {
    return 'បានចាប់ផ្តើមការហៅជាវីដេអូនៅក្នុង General Room';
  }
  if (content === 'sent you a friend request') {
    return 'បានផ្ញើសំណើសុំធ្វើជាមិត្តភក្តិ';
  }
  if (content === 'accepted your friend request') {
    return 'បានទទួលយកសំណើសុំធ្វើជាមិត្តរបស់អ្នក';
  }
  if (content === 'liked your post') {
    return 'បានចូលចិត្តការបង្ហោះរបស់អ្នក';
  }
  if (content === 'commented on your post') {
    return 'បានបញ្ចេញមតិលើការបង្ហោះរបស់អ្នក';
  }
  if (content === 'shared your post') {
    return 'បានចែករំលែកការបង្ហោះរបស់អ្នក';
  }

  // Regex patterns
  let translated = content;
  translated = translated.replace(/reacted to your comment in (.*)/i, 'បានចុចប្រតិកម្មលើមតិយោបល់របស់អ្នកក្នុង $1');
  translated = translated.replace(/commented on your photo: (.*)/i, 'បានបញ្ចេញមតិលើរូបថតរបស់អ្នក៖ $1');
  translated = translated.replace(/invited you to join (.*)/i, 'បានអញ្ជើញអ្នកឱ្យចូលរួម $1');
  translated = translated.replace(/started an audio call in (.*)/i, 'បានចាប់ផ្តើមការហៅជាសំឡេងនៅក្នុង $1');
  translated = translated.replace(/started a video call in (.*)/i, 'បានចាប់ផ្តើមការហៅជាវីដេអូនៅក្នុង $1');
  translated = translated.replace(/reacted to your post/i, 'បានចុចប្រតិកម្មលើការបង្ហោះរបស់អ្នក');
  translated = translated.replace(/liked your post/i, 'បានចូលចិត្តការបង្ហោះរបស់អ្នក');
  translated = translated.replace(/commented on your post/i, 'បានបញ្ចេញមតិលើការបង្ហោះរបស់អ្នក');
  translated = translated.replace(/shared your post/i, 'បានចែករំលែកការបង្ហោះរបស់អ្នក');

  return translated;
}

export function formatNotificationTimestamp(timestamp: string, language: 'en' | 'km'): string {
  if (!timestamp) return '';
  if (language !== 'km') return timestamp;

  const lower = timestamp.toLowerCase().trim();
  if (lower === 'just now' || lower === 'now') return 'អម្បាញ់មិញ';

  const mMatch = timestamp.match(/(\d+)\s*m(?:in)?(?:\s*ago)?/i);
  if (mMatch) return `${mMatch[1]} នាទីមុន`;

  const hMatch = timestamp.match(/(\d+)\s*h(?:our)?(?:\s*ago)?/i);
  if (hMatch) return `${hMatch[1]} ម៉ោងមុន`;

  const dMatch = timestamp.match(/(\d+)\s*d(?:ay)?(?:\s*ago)?/i);
  if (dMatch) return `${dMatch[1]} ថ្ងៃមុន`;

  const wMatch = timestamp.match(/(\d+)\s*w(?:eek)?(?:\s*ago)?/i);
  if (wMatch) return `${wMatch[1]} សប្តាហ៍មុន`;

  return timestamp;
}
