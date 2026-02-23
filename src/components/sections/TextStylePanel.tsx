// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import ResponsiveSlider from '../controls/ResponsiveSlider'
import ColorPickerWithReset from '../controls/ColorPickerWithReset'
import ToggleOption from '../controls/ToggleOption'
import characters from '../../characters.json'
import { FontKey } from '../../types'

interface TextStylePanelProps {
  character: number
  text: string
  setText: (text: string) => void
  fontSize: number
  setFontSize: (size: number) => void
  rotate: number
  setRotate: (rotate: number) => void
  spaceSize: number
  setSpaceSize: (size: number) => void
  letterSpacing: number
  setLetterSpacing: (spacing: number) => void
  strokeWidth: number
  setStrokeWidth: (width: number) => void
  fontKey: FontKey
  setFontKey: (key: FontKey) => void
  textColor: string
  setTextColor: (color: string) => void
  strokeColor: string
  setStrokeColor: (color: string) => void
  curve: boolean
  setCurve: (curve: boolean) => void
  vertical: boolean
  setVertical: (vertical: boolean) => void
  textBehind: boolean
  setTextBehind: (behind: boolean) => void
}

/**
 * Panel that groups all text styling controls together
 */
export default function TextStylePanel({
  character,
  text,
  setText,
  fontSize,
  setFontSize,
  rotate,
  setRotate,
  spaceSize,
  setSpaceSize,
  letterSpacing,
  setLetterSpacing,
  strokeWidth,
  setStrokeWidth,
  fontKey,
  setFontKey,
  textColor,
  setTextColor,
  strokeColor,
  setStrokeColor,
  curve,
  setCurve,
  vertical,
  setVertical,
  textBehind,
  setTextBehind,
}: TextStylePanelProps) {
  return (
    <>
      <TextField
        fullWidth
        multiline
        rows={2}
        label="文字内容"
        value={text}
        onChange={(e) => setText(e.target.value)}
        color="secondary"
        sx={{ mb: 2 }}
      />

      <ResponsiveSlider
        label="字体大小"
        value={fontSize}
        onChange={setFontSize}
        min={10}
        max={100}
      />

      <ResponsiveSlider
        label="旋转角度"
        value={rotate}
        onChange={setRotate}
        min={-10}
        max={10}
        step={0.2}
      />

      <ResponsiveSlider
        label="行间距"
        value={spaceSize}
        onChange={setSpaceSize}
        min={18}
        max={100}
      />

      <ResponsiveSlider
        label="字间距"
        value={letterSpacing}
        onChange={setLetterSpacing}
        min={-10}
        max={30}
      />

      <ResponsiveSlider
        label="描边宽度"
        value={strokeWidth}
        onChange={setStrokeWidth}
        min={0}
        max={30}
      />

      <Grid container spacing={2} mt={2}>
        <Grid item xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel color="secondary">字体</InputLabel>
            <Select
              value={fontKey}
              onChange={(e) => setFontKey(e.target.value as FontKey)}
              label="字体"
              color="secondary"
            >
              <MenuItem value="yuruka">YurukaStd</MenuItem>
              <MenuItem value="fangtang">尚首方糖体</MenuItem>
              <MenuItem value="system">系统默认</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <ColorPickerWithReset
            label="文字颜色"
            value={textColor}
            onChange={setTextColor}
            defaultColor={characters[character].color}
          />
        </Grid>
        <Grid item xs={6}>
          <ColorPickerWithReset
            label="描边颜色"
            value={strokeColor}
            onChange={setStrokeColor}
            defaultColor="#ffffff"
          />
        </Grid>
      </Grid>

      <Box mt={2}>
        <ToggleOption label="弧形文字" checked={curve} onChange={setCurve} />
        <ToggleOption label="竖排文字" checked={vertical} onChange={setVertical} />
        <ToggleOption label="文字置于底层" checked={textBehind} onChange={setTextBehind} />
      </Box>
    </>
  )
}
