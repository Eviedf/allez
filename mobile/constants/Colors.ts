export const Colors = {
  // Rock palette — dark neutrals
  rock: {
    50:  '#f7f7f6',
    100: '#eeede9',
    200: '#d8d5cf',
    300: '#b9b4ac',
    400: '#948d82',
    500: '#7a7268',
    600: '#655e55',
    700: '#534d46',
    800: '#2d2926',
    900: '#1a1714',
  },

  // Summit — electric teal/green
  summit: {
    50:  '#edfaf4',
    100: '#d3f4e3',
    300: '#6ddcaa',
    500: '#22c77a',
    600: '#16a363',
    700: '#138050',
  },

  // Send — warm orange for success
  send: {
    50:  '#fff7ed',
    100: '#ffedd5',
    300: '#fbb56a',
    500: '#f97316',
    600: '#ea6c0c',
    700: '#c2550a',
  },

  // Project — sky blue
  project: {
    500: '#3b82f6',
    600: '#2563eb',
  },

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
}

export const Fonts = {
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  weight: {
    regular: '400' as const,
    medium:  '500' as const,
    semibold:'600' as const,
    bold:    '700' as const,
    black:   '900' as const,
  },
}

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
}

export const Spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
}
