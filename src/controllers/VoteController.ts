import { Request, Response } from 'express';
import { db } from '../services/firebase';
import { Vote, AuthenticatedRequest } from '../types/types';

export const vote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { voting_id } = req.body;
    const user_id = req.user!.uid;
    const votingDoc = await db.collection('votings').doc(voting_id).get();
    if (!votingDoc.exists || votingDoc.data()?.status !== 'active') {
      res.status(404).json({
        success: false,
        error: 'Voting not found or not active'
      });
      return;
    }
    const existingVote = await db.collection('votes')
      .where('voting_id', '==', voting_id)
      .where('user_id', '==', user_id)
      .get();
    
    if (!existingVote.empty) {
      await existingVote.docs[0].ref.delete();
      res.json({
        success: true,
        message: 'Vote cancelled successfully'
      });
      return;
    }
    const newVote: Vote = {
      voting_id,
      user_id,
      voted_at: new Date()
    };
    
    const docRef = await db.collection('votes').add(newVote);
    
    res.status(201).json({
      success: true,
      id: docRef.id,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getVotingVotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { voting_id } = req.params;
    
    const snapshot = await db.collection('votes')
      .where('voting_id', '==', voting_id)
      .get();
    
    const votes: any[] = [];
    
    snapshot.forEach((doc) => {
      votes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: votes.length,
      data: votes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllVotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
      return;
    }

    const snapshot = await db.collection('votes').get();
    const votes: any[] = [];
    
    snapshot.forEach((doc) => {
      votes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: votes.length,
      data: votes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};