import { Request, Response } from 'express';
import { auth, db } from '../services/firebase';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, username } = req.body;
    const usernameQuery = await db.collection('users').where('username', '==', username).get();
    if (!usernameQuery.empty) {
      res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
      return;
    }
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });
    
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid, 
      name,
      username,
      email,
      created_at: new Date(),
      role: 'user',
      status: 'active'
    });
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        username,
        name
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    });
  }
};
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      res.status(400).json({
        success: false,
        error: 'ID Token is required'
      });
      return;
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'User profile not found',
        needsProfile: true
      });
      return;
    }
    
    const userData = userDoc.data();
    if (userData?.status === 'banned') {
      res.status(403).json({
        success: false,
        error: 'Account is banned'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        username: userData?.username,
        name: userData?.name || decodedToken.name,
        role: userData?.role || 'user'
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

export const loginByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.body;
    
    if (!username) {
      res.status(400).json({
        success: false,
        error: 'Username is required'
      });
      return;
    }
    const userQuery = await db.collection('users').where('username', '==', username).get();
    
    if (userQuery.empty) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }
    
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    if (userData.status === 'banned') {
      res.status(403).json({
        success: false,
        error: 'Account is banned'
      });
      return;
    }
    const customToken = await auth.createCustomToken(userData.uid);
    
    res.json({
      success: true,
      message: 'User found, use custom token to authenticate',
      customToken,
      instruction: 'Use this custom token with Firebase Client SDK to get ID token',
      user: {
        uid: userData.uid,
        email: userData.email,
        username: userData.username,
        name: userData.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    });
  }
};

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    res.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        username: userData?.username,
        name: decodedToken.name,
        role: userData?.role || 'user'
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid } = req.params;
    await auth.deleteUser(uid);
    await db.collection('users').doc(uid).delete();
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Deletion failed'
    });
  }
};

export const createTestToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      res.status(400).json({
        success: false,
        error: 'UID is required'
      });
      return;
    }
    
    const customToken = await auth.createCustomToken(uid);
    
    res.json({
      success: true,
      customToken,
      message: "Use this custom token to get ID token via Firebase Auth"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Token creation failed'
    });
  }
};

export const loginWithCustomToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customToken } = req.body;
    
    if (!customToken) {
      res.status(400).json({
        success: false,
        error: 'Custom Token is required'
      });
      return;
    }
    const decoded = JSON.parse(Buffer.from(customToken.split('.')[1], 'base64').toString());
    const uid = decoded.uid;
    
    if (!uid) {
      res.status(400).json({
        success: false,
        error: 'Invalid custom token'
      });
      return;
    }
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
      return;
    }
    
    const userData = userDoc.data();
    if (userData?.status === 'banned') {
      res.status(403).json({
        success: false,
        error: 'Account is banned'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Login successful with custom token',
      user: {
        uid: uid,
        email: userData?.email,
        username: userData?.username,
        name: userData?.name,
        role: userData?.role || 'user'
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid custom token'
    });
  }
};