import 'jest-preset-angular/setup-jest';

// Optional global mocks
Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', { value: '<!DOCTYPE html>' });
Object.defineProperty(window, 'getComputedStyle', { value: () => ({}) });