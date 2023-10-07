export const countriesFillLayer = {
  id: 'countries-fill',
  type: 'fill',
  paint: {
    'fill-color': [
      'case',
      ['==', ['feature-state', 'answer'], 'wrong'],
      '#f87171',
      ['==', ['feature-state', 'answer'], 'correct'],
      '#4ade80',
      ['==', ['feature-state', 'current'], true],
      '#60a5fa',
      ['==', ['feature-state', 'hover'], true],
      '#a1a1aa',
      '#f4f4f5'
    ],
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      0.7,
      1
    ]
  }
}
export const countriesLineLayer = {
  id: 'data-border',
  type: 'line',
  paint: {
    'line-color': '#555555',
    'line-width': 2
  }
}

export const badgesLayer = {
  id: 'badges',
  type: 'symbol',
  paint: {
    'icon-size': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 0.5]
  }
}
