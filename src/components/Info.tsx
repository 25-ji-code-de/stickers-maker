// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import { GitHub, Favorite } from '@mui/icons-material'

interface InfoProps {
  open: boolean
  handleClose: () => void
}

export default function Info({ open, handleClose }: InfoProps) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="info-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="info-dialog-title">关于 Project SEKAI 贴纸生成器</DialogTitle>
      <DialogContent>
        <Typography variant="h6" component="h3" gutterBottom>
          本项目
        </Typography>
        <List dense>
          <ListItem
            button
            component="a"
            href="https://github.com/25-ji-code-de/stickers-maker"
            target="_blank"
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#cf93d9' }}>
                <GitHub />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="25-ji-code-de/stickers-maker"
              secondary="本仓库 - Project SEKAI 贴纸生成器"
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar
                alt="bili_47177171806"
                src="/avatar.jpg"
                sx={{ bgcolor: '#cf93d9' }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <>
                  bili_47177171806
                  <br />
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    <a
                      href="https://github.com/bili-47177171806"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none', marginRight: 8 }}
                    >
                      GitHub
                    </a>
                    •
                    <a
                      href="https://space.bilibili.com/3546904856103196"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none', marginLeft: 8 }}
                    >
                      Bilibili
                    </a>
                  </Typography>
                </>
              }
              secondary="项目开发者"
            />
          </ListItem>
        </List>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Favorite />}
            href="https://afdian.com/a/1806P"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ borderRadius: 2 }}
          >
            支持项目开发
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" component="h3" gutterBottom>
          致谢与参考
        </Typography>
        <Typography variant="body2" paragraph color="text.secondary">
          本项目参考了社区多个优秀实现
        </Typography>
        <List dense>
          <ListItem
            button
            component="a"
            href="https://www.reddit.com/r/ProjectSekai/comments/x1h4v1/"
            target="_blank"
          >
            <ListItemAvatar>
              <Avatar
                alt="u/SherenPlaysGames"
                src="/avatars/reddit-sheren.webp"
              />
            </ListItemAvatar>
            <ListItemText primary="u/SherenPlaysGames" secondary="原始贴纸创作者" />
          </ListItem>
          <ListItem
            button
            component="a"
            href="https://github.com/theoriginalayaka"
            target="_blank"
          >
            <ListItemAvatar>
              <Avatar
                alt="Ayaka"
                src="/avatars/theoriginalayaka.webp"
              />
            </ListItemAvatar>
            <ListItemText primary="Ayaka" secondary="最初的创意和实现" />
          </ListItem>
          <ListItem
            button
            component="a"
            href="https://github.com/modder4869"
            target="_blank"
          >
            <ListItemAvatar>
              <Avatar alt="Modder4869" src="/avatars/modder4869.webp" />
            </ListItemAvatar>
            <ListItemText primary="Modder4869" secondary="代码贡献" />
          </ListItem>
          <ListItem
            button
            component="a"
            href="https://github.com/BedrockDigger"
            target="_blank"
          >
            <ListItemAvatar>
              <Avatar alt="BedrockDigger" src="/avatars/bedrockdigger.webp" />
            </ListItemAvatar>
            <ListItemText primary="BedrockDigger" secondary="UI 设计贡献" />
          </ListItem>
          <ListItem
            button
            component="a"
            href="https://nightcord.de/@akiyamamizuki"
            target="_blank"
          >
            <ListItemAvatar>
              <Avatar
                alt="Mikan Harada"
                src="/avatars/mikan-harada.webp"
              />
            </ListItemAvatar>
            <ListItemText
              primary="Mikan Harada"
              secondary="@akiyamamizuki - 代码贡献"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" component="h3" gutterBottom>
          参考项目
        </Typography>
        <List dense>
          <ListItem
            button
            component="a"
            href="https://github.com/atnightcord/sekai-stickers"
            target="_blank"
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#e1e4e8' }}>
                <GitHub sx={{ color: '#24292e' }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="atnightcord/sekai-stickers"
              secondary="功能参考"
            />
          </ListItem>
          <ListItem
            button
            component="a"
            href="https://github.com/BedrockDigger/sekai-stickers"
            target="_blank"
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#e1e4e8' }}>
                <GitHub sx={{ color: '#24292e' }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="BedrockDigger/sekai-stickers"
              secondary="UI 参考"
            />
          </ListItem>
          <ListItem
            button
            component="a"
            href="https://github.com/TheOriginalAyaka/sekai-stickers"
            target="_blank"
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#e1e4e8' }}>
                <GitHub sx={{ color: '#24292e' }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="TheOriginalAyaka/sekai-stickers" secondary="最初版本" />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          贴纸素材来自社区收集。如有侵权请联系删除。
          <br />
          如需贡献新贴纸，欢迎通过 GitHub 提交 Issue 或 PR。
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  )
}
