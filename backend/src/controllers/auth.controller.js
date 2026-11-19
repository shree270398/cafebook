import * as authService from '../services/auth.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body)
  res.status(201).json(result)
})

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body)
  res.json(result)
})

export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken)
  res.json(result)
})

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body)
  res.json({ user })
})

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.token)
  res.status(204).end()
})
