import { POSSIBLE_SIDEBAR_DESTINATIONS, sidebarActionsRouter } from '../src/model/sidebar';

// Mock window.location and window.history
const mockLocation = {
  href: 'https://test.instructure.com',
  origin: 'https://test.instructure.com',
  pathname: '/'
};

// Store the original window.location
const originalLocation = window.location;

describe('Sidebar Navigation', () => {
  beforeAll(() => {
    delete window.location;
    window.location = { ...mockLocation };
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  test('sidebar destinations array contains expected values', () => {
    expect(POSSIBLE_SIDEBAR_DESTINATIONS).toContain('home');
    expect(POSSIBLE_SIDEBAR_DESTINATIONS).toContain('dashboard');
    expect(POSSIBLE_SIDEBAR_DESTINATIONS).toContain('calendar');
    expect(POSSIBLE_SIDEBAR_DESTINATIONS).toContain('courses');
  });

  test('sidebarActionsRouter handles calendar navigation', () => {
    sidebarActionsRouter('calendar');
    expect(window.location.href).toBe('https://test.instructure.com/calendar');
  });

  test('sidebarActionsRouter handles inbox/messages navigation', () => {
    sidebarActionsRouter('inbox');
    expect(window.location.href).toBe('https://test.instructure.com/conversations');
    
    sidebarActionsRouter('messages');
    expect(window.location.href).toBe('https://test.instructure.com/conversations');
  });

  test('sidebarActionsRouter returns false for invalid destinations', () => {
    expect(sidebarActionsRouter('invalid_destination')).toBe(false);
  });
});