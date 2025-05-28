import { Request, Response } from 'express';
import { db } from '../services/firebase';
import admin from 'firebase-admin';
import { User, UserBan, AuthenticatedRequest } from '../types/types';

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { username, email } = req.body;
    
    const newUser: User = {
      uid: req.user!.uid,
      username,
      email,
      created_at: new Date(),
      status: 'active'
    };
    
    const docRef = await db.collection('users').add(newUser);
    
    res.status(201).json({
      success: true,
      id: docRef.id,
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Тільки адміни можуть переглядати всіх користувачів
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
      return;
    }

    const snapshot = await db.collection('users').get();
    const users: any[] = [];
    
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await db.collection('users').doc(id).get();
    
    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;
    
    // Перевірити чи користувач може редагувати
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }
    
    const userData = userDoc.data();
    if (userData?.uid !== req.user?.uid && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only edit your own profile.'
      });
      return;
    }
    
    const updateData = {
      username,
      email,
      updated_at: new Date()
    };
    
    await db.collection('users').doc(id).update(updateData);
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Перевірити права
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }
    
    const userData = userDoc.data();
    if (userData?.uid !== req.user?.uid && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied.'
      });
      return;
    }
    
    await db.collection('users').doc(id).delete();
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const banUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Тільки адміни
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
      return;
    }
    
    const { user_id, reason, banned_to } = req.body;
    
    const ban: UserBan = {
      user_id,
      reason,
      banned_at: new Date(),
      banned_to: new Date(banned_to)
    };
    await db.collection('user_bans').add(ban);
    const userQuery = await db.collection('users').where('uid', '==', user_id).get();
    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      await userDoc.ref.update({ status: 'banned' });
    }
    
    res.json({
      success: true,
      message: 'User banned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }
    const userDocById = await db.collection('users').doc(req.user.uid).get();
    
    if (userDocById.exists) {
      res.json({
        success: true,
        data: {
          id: userDocById.id,
          uid: req.user.uid,
          ...userDocById.data()
        }
      });
      return;
    }
    const userQuery = await db.collection('users').where('uid', '==', req.user.uid).get();
    
    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      res.json({
        success: true,
        data: {
          id: userDoc.id,
          ...userDoc.data()
        }
      });
      return;
    }
    res.status(404).json({
      success: false,
      error: 'User profile not found',
      needsProfile: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};