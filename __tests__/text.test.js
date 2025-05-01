import { wasATextAction } from '../src/model/text';

// Mock textToSpeech since we don't want to actually trigger speech in tests
jest.mock('../model/tts', () => ({
  textToSpeech: jest.fn()
}));

describe('Text Action Handler', () => {
  let recognitionState;
  
  beforeEach(() => {
    // Reset recognitionState before each test
    recognitionState = {
      isRecognizing: false,
      recognition: null,
      speechDisplay: null
    };
    
    // Clear all document elements before each test
    document.body.innerHTML = '';
  });

  test('identifies text action commands', () => {
    // Test reply command recognition
    expect(wasATextAction('open reply', recognitionState)).toBe(false); // false because no reply button exists
    
    // Add a reply button to the DOM
    const replyButton = document.createElement('button');
    replyButton.setAttribute('data-testid', 'discussion-topic-reply');
    document.body.appendChild(replyButton);
    
    expect(wasATextAction('open reply', recognitionState)).toBe(true);
  });

  test('handles complex reply commands', () => {
    // Add necessary DOM elements
    const replyButton = document.createElement('button');
    replyButton.setAttribute('data-testid', 'discussion-topic-reply');
    document.body.appendChild(replyButton);

    const iframe = document.createElement('iframe');
    iframe.className = 'tox-edit-area__iframe';
    document.body.appendChild(iframe);

    expect(wasATextAction('reply with hello world', recognitionState)).toBe(true);
  });

  test('returns false for non-text actions', () => {
    expect(wasATextAction('go to dashboard', recognitionState)).toBe(false);
    expect(wasATextAction('open calendar', recognitionState)).toBe(false);
    expect(wasATextAction('invalid command', recognitionState)).toBe(false);
  });
});