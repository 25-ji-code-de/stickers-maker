// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { Box, Typography, Slider } from '@mui/material'

interface ResponsiveSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  showValue?: boolean
}

export default function ResponsiveSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  showValue = true,
}: ResponsiveSliderProps) {
  return (
    <Box sx={{ mt: { xs: 1, md: 2 } }}>
      <Typography variant="body2" gutterBottom sx={{ display: { xs: 'none', md: 'block' } }}>
        {label}{showValue && `: ${value}`}
      </Typography>
      <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', minWidth: '64px' }}>
          {label}
        </Typography>
        <Slider
          value={value}
          onChange={(_, v) => onChange(Array.isArray(v) ? v[0] : v)}
          min={min}
          max={max}
          step={step}
          color="secondary"
          valueLabelDisplay="auto"
        />
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Slider
          value={value}
          onChange={(_, v) => onChange(Array.isArray(v) ? v[0] : v)}
          min={min}
          max={max}
          step={step}
          color="secondary"
        />
      </Box>
    </Box>
  )
}
