// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { FormControlLabel, Switch } from '@mui/material'

interface ToggleOptionProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function ToggleOption({
  label,
  checked,
  onChange
}: ToggleOptionProps) {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          color="secondary"
        />
      }
      label={label}
    />
  )
}
