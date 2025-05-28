import { Request, Response } from 'express';
import { db } from '../services/firebase';
import { Voting, AuthenticatedRequest } from '../types/types';

export const createVoting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, tag } = req.body;
    
    const newVoting: Voting = {
      author_id: req.user!.uid,
      title,
      description,
      created_at: new Date(),
      tag,
      status: 'active'
    };
    
    const docRef = await db.collection('votings').add(newVoting);
    
    res.status(201).json({
      success: true,
      id: docRef.id,
      data: newVoting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllVotings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
      return;
    }

    const snapshot = await db.collection('votings').get();
    const votings: any[] = [];
    
    snapshot.forEach((doc) => {
      votings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: votings.length,
      data: votings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getVotings = async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('votings')
      .where('status', '==', 'active')
      .orderBy('created_at', 'desc')
      .get();
    
    const votings: any[] = [];
    
    snapshot.forEach((doc) => {
      votings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: votings.length,
      data: votings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getVotingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await db.collection('votings').doc(id).get();
    
    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Voting not found'
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

export const deleteVoting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const votingDoc = await db.collection('votings').doc(id).get();
    if (!votingDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Voting not found'
      });
      return;
    }
    
    const votingData = votingDoc.data();
    
    // Перевірити права (власник або адмін)
    if (votingData?.author_id !== req.user?.uid && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied.'
      });
      return;
    }
    
    await db.collection('votings').doc(id).update({ status: 'deleted' });
    
    res.json({
      success: true,
      message: 'Voting deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const closeVoting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { result_text } = req.body;
    
    const votingDoc = await db.collection('votings').doc(id).get();
    if (!votingDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Voting not found'
      });
      return;
    }
    
    const votingData = votingDoc.data();
    if (votingData?.author_id !== req.user?.uid) {
      res.status(403).json({
        success: false,
        error: 'Only the author can close this voting.'
      });
      return;
    }
    
    await db.collection('votings').doc(id).update({ 
      status: 'closed',
      result_text: result_text || ''
    });
    
    res.json({
      success: true,
      message: 'Voting closed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};