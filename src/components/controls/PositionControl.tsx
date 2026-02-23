// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Slider,
  Typography,
} from '@mui/material'
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from '@mui/icons-material'
import { Position } from '../../types'

interface PositionControlProps {
  position: Position
  onPositionChange: (position: Position) => void
  moveX: (delta: number) => void
  moveY: (delta: number) => void
  maxX?: number
  maxY?: number
  showMobile?: boolean
  showDesktop?: boolean
}

/**
 * Complete position control with sliders and buttons
 * Mobile: displays slider controls around canvas
 * Desktop: displays button groups and labeled sliders
 */
export default function PositionControl({
  position,
  onPositionChange,
  moveX,
  moveY,
  maxX = 296,
  maxY = 256,
  showMobile = true,
  showDesktop = true,
}: PositionControlProps) {
  return (
    <>
      {/* Mobile: Horizontal slider (below canvas) */}
      {showMobile && (
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          mt={1}
          sx={{ display: { xs: 'flex', md: 'none' }, height: '50px' }}
        >
          <IconButton size="small" onClick={() => moveX(-5)}>
            <KeyboardArrowLeft />
          </IconButton>
          <Box flex={1} display="flex" alignItems="center">
            <Slider
              value={position.x}
              onChange={(_, v) => onPositionChange({ ...position, x: Array.isArray(v) ? v[0] : v })}
              min={0}
              max={maxX}
              color="secondary"
              sx={{ width: '100%' }}
            />
          </Box>
          <IconButton size="small" onClick={() => moveX(5)}>
            <KeyboardArrowRight />
          </IconButton>
        </Box>
      )}

      {/* Mobile: Vertical slider (right of canvas) */}
      {showMobile && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{ display: { xs: 'flex', md: 'none' }, height: '205px' }}
        >
          <IconButton size="small" onClick={() => moveY(-5)}>
            <KeyboardArrowUp />
          </IconButton>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Slider
              orientation="vertical"
              value={maxY - position.y}
              onChange={(_, v) => onPositionChange({ ...position, y: maxY - (Array.isArray(v) ? v[0] : v) })}
              min={0}
              max={maxY}
              color="secondary"
              sx={{ height: '100%' }}
            />
          </Box>
          <IconButton size="small" onClick={() => moveY(5)}>
            <KeyboardArrowDown />
          </IconButton>
        </Box>
      )}

      {/* Desktop: Button groups and sliders */}
      {showDesktop && (
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box display="flex" gap={1} mb={1} mt={2}>
            <ButtonGroup size="small" fullWidth>
              <Button onClick={() => moveX(-5)} startIcon={<KeyboardArrowLeft />}>
                X-5
              </Button>
              <Button onClick={() => moveX(5)} endIcon={<KeyboardArrowRight />}>
                X+5
              </Button>
            </ButtonGroup>
            <ButtonGroup size="small" fullWidth>
              <Button onClick={() => moveY(-5)} startIcon={<KeyboardArrowUp />}>
                Y-5
              </Button>
              <Button onClick={() => moveY(5)} endIcon={<KeyboardArrowDown />}>
                Y+5
              </Button>
            </ButtonGroup>
          </Box>

          <Typography variant="body2" gutterBottom>
            水平位置: {position.x}
          </Typography>
          <Slider
            value={position.x}
            onChange={(_, v) => onPositionChange({ ...position, x: Array.isArray(v) ? v[0] : v })}
            min={0}
            max={maxX}
            color="secondary"
          />

          <Typography variant="body2" gutterBottom>
            垂直位置: {position.y}
          </Typography>
          <Slider
            value={position.y}
            onChange={(_, v) => onPositionChange({ ...position, y: Array.isArray(v) ? v[0] : v })}
            min={0}
            max={maxY}
            color="secondary"
          />
        </Box>
      )}
    </>
  )
}
