import { isHotkeyMatch } from '../src/model/settings';

describe('isHotkeyMatch', () => {
  test('matches simple key without modifiers', () => {
    const event = { key: 'x', ctrlKey: false, altKey: false, shiftKey: false };
    const hotkey = { key: 'x', ctrl: false, alt: false, shift: false };
    expect(isHotkeyMatch(event, hotkey)).toBe(true);
  });

  test('matches key with ctrl modifier', () => {
    const event = { key: 'x', ctrlKey: true, altKey: false, shiftKey: false };
    const hotkey = { key: 'x', ctrl: true, alt: false, shift: false };
    expect(isHotkeyMatch(event, hotkey)).toBe(true);
  });

  test('does not match when modifiers differ', () => {
    const event = { key: 'x', ctrlKey: true, altKey: false, shiftKey: false };
    const hotkey = { key: 'x', ctrl: false, alt: false, shift: false };
    expect(isHotkeyMatch(event, hotkey)).toBe(false);
  });

  test('matches legacy string format', () => {
    const event = { key: 'x', ctrlKey: false, altKey: false, shiftKey: false };
    const hotkey = 'x';
    expect(isHotkeyMatch(event, hotkey)).toBe(true);
  });
});