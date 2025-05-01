import { extractDestination } from '../src/controller/router';

describe('extractDestination', () => {
  test('extracts direct command destinations', () => {
    expect(extractDestination('go to dashboard')).toBe('dashboard');
    expect(extractDestination('open calendar')).toBe('calendar');
    expect(extractDestination('show me courses')).toBe('courses');
  });

  test('extracts question form destinations', () => {
    expect(extractDestination('where are my messages')).toBe('messages');
    expect(extractDestination('can I see my inbox')).toBe('inbox');
  });

  test('extracts narrate command', () => {
    expect(extractDestination('read the main content')).toBe('narrate');
    expect(extractDestination('what is on my screen')).toBe('narrate');
  });

  test('handles microphone commands', () => {
    expect(extractDestination('mute microphone')).toBe('micmute');
    expect(extractDestination('mic mute')).toBe('micmute');
  });

  test('handles volume commands', () => {
    expect(extractDestination('volume up')).toBe('volume up');
    expect(extractDestination('volume down')).toBe('volume down');
    expect(extractDestination('set volume to 50')).toBe('volume 50');
  });
});