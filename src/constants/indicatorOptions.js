export const INDICATOR_OPTIONS = [
  {
    label: 'pH值',
    value: 'ph',
    metricName: 'pH',
    metricCode: 'G0005',
    unit: '',
    legend: {
      title: 'pH',
      unit: '',
      items: [
        { label: 'I类', color: '#22a6f2', range: '(6 ≤ a ≤ 9)' },
        { label: '劣V类', color: '#ff2a1a', range: '(a < 6 或 a > 9)' }
      ]
    }
  },
  {
    label: '总磷值',
    value: 'phosphorus',
    metricName: '总磷',
    metricCode: 'G0012',
    unit: 'mg/L',
    legend: {
      title: '总磷',
      unit: '单位: mg/L',
      items: [
        { label: 'I类', color: '#22a6f2', range: '≤ 0.02' },
        { label: 'II类', color: '#28d6f7', range: '≤ 0.10' },
        { label: 'III类', color: '#b7e532', range: '≤ 0.20' },
        { label: 'IV类', color: '#f3d231', range: '≤ 0.30' },
        { label: 'V类', color: '#ff8c31', range: '≤ 0.40' },
        { label: '劣V类', color: '#ff2a1a', range: '> 0.40' }
      ]
    }
  }
]

