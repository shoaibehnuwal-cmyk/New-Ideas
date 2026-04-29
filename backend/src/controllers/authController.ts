import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserModel } from '../models/User';
import { AuthRequest } from '../middleware/auth';

function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign({ userId, role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId, role }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn } as jwt.SignOptions);
  return { accessToken, refreshToken };
}

export const AuthController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await UserModel.create({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone,
      });

      const tokens = generateTokens(user.id, user.role);
      await UserModel.updateRefreshToken(user.id, tokens.refreshToken);

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          subscriptionTier: user.subscription_tier,
        },
        ...tokens,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      if (!user.is_active) {
        res.status(403).json({ error: 'Account is deactivated' });
        return;
      }

      const tokens = generateTokens(user.id, user.role);
      await UserModel.updateRefreshToken(user.id, tokens.refreshToken);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          subscriptionTier: user.subscription_tier,
        },
        ...tokens,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token required' });
        return;
      }

      const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as { userId: string; role: string };
      const user = await UserModel.findById(decoded.userId);

      if (!user || user.refresh_token !== refreshToken) {
        res.status(401).json({ error: 'Invalid refresh token' });
        return;
      }

      const tokens = generateTokens(user.id, user.role);
      await UserModel.updateRefreshToken(user.id, tokens.refreshToken);

      res.json(tokens);
    } catch {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  },

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await UserModel.findById(req.userId!);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        subscriptionTier: user.subscription_tier,
        createdAt: user.created_at,
      });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.userId) {
        await UserModel.updateRefreshToken(req.userId, null);
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  },
};
