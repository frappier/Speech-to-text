/**
 * Text formatting utility for SpeakText
 * Handles punctuation, paragraphs, and list detection
 */

// Main formatting function
export const formatTranscript = (text) => {
  if (!text) return '';
  
  // Remove any HTML tags first
  let cleanText = removeHtmlTags(text);
  
  // Apply formatting
  cleanText = addProperPunctuation(cleanText);
  cleanText = createParagraphs(cleanText);
  cleanText = detectAndFormatLists(cleanText);
  
  return cleanText;
};

// Remove HTML tags
const removeHtmlTags = (text) => {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = text;
  return tempElement.textContent || tempElement.innerText || '';
};

// Add proper punctuation
const addProperPunctuation = (text) => {
  // Capitalize first letter of sentences
  let formattedText = text.replace(/(?:^|[.!?]\s+)([a-z])/g, (match, letter) => {
    return match.replace(letter, letter.toUpperCase());
  });
  
  // Ensure proper spacing after punctuation
  formattedText = formattedText.replace(/([.!?,;:])(?=[a-zA-Z])/g, '$1 ');
  
  // Fix common punctuation issues
  formattedText = formattedText.replace(/\s+([.!?,;:])/g, '$1');
  
  // Ensure sentences end with periods if they don't have punctuation
  formattedText = formattedText.replace(/([a-zA-Z])\s+(?=[A-Z])/g, '$1. ');
  
  return formattedText;
};

// Create paragraphs based on topic changes or pauses
const createParagraphs = (text) => {
  // Split on multiple periods, question marks, or exclamation points
  const sentences = text.split(/(?<=[.!?])\s+/);
  let paragraphs = [];
  let currentParagraph = [];
  
  sentences.forEach((sentence, index) => {
    currentParagraph.push(sentence);
    
    // Create a new paragraph after approximately 3-4 sentences or at topic changes
    if ((index + 1) % 3 === 0 || 
        sentence.includes('However') || 
        sentence.includes('Moreover') || 
        sentence.includes('Furthermore') ||
        sentence.includes('In conclusion')) {
      paragraphs.push(currentParagraph.join(' '));
      currentParagraph = [];
    }
  });
  
  // Add any remaining sentences as a paragraph
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(' '));
  }
  
  return paragraphs.join('\n\n');
};

// Detect and format lists
const detectAndFormatLists = (text) => {
  // Common list indicators
  const listIndicators = [
    'first', 'second', 'third', 'fourth', 'fifth',
    'firstly', 'secondly', 'thirdly', 'lastly',
    'one', 'two', 'three', 'four', 'five',
    'next', 'then', 'finally', 'additionally'
  ];
  
  // Split into paragraphs
  let paragraphs = text.split('\n\n');
  
  paragraphs = paragraphs.map(paragraph => {
    // Check if paragraph contains list-like sentences
    const sentences = paragraph.split(/(?<=[.!?])\s+/);
    let listCount = 0;
    
    sentences.forEach(sentence => {
      // Check for list indicators at the beginning of sentences
      const words = sentence.trim().split(/\s+/);
      if (words.length > 0) {
        const firstWord = words[0].toLowerCase().replace(/[,.;:]/, '');
        if (listIndicators.includes(firstWord)) {
          listCount++;
        }
      }
    });
    
    // If we have multiple list-like sentences, format as a list
    if (listCount >= 2) {
      let listItems = [];
      let inList = false;
      
      sentences.forEach(sentence => {
        const words = sentence.trim().split(/\s+/);
        if (words.length > 0) {
          const firstWord = words[0].toLowerCase().replace(/[,.;:]/, '');
          if (listIndicators.includes(firstWord)) {
            // This is a list item
            inList = true;
            listItems.push(`• ${sentence}`);
          } else if (inList) {
            // This is a continuation of the previous list item
            if (listItems.length > 0) {
              listItems[listItems.length - 1] += ' ' + sentence;
            } else {
              listItems.push(`• ${sentence}`);
            }
          } else {
            // Not part of a list
            listItems.push(sentence);
          }
        }
      });
      
      return listItems.join('\n');
    }
    
    return paragraph;
  });
  
  return paragraphs.join('\n\n');
};
