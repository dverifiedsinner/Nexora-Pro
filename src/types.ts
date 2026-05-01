export enum WalletType {
  MAIN = 'main',
  BONUS = 'bonus',
  REFERRAL = 'referral',
  INVESTMENT = 'investment'
}

export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  type: 'funding' | 'withdrawal' | 'bonus' | 'referral' | 'task' | 'investment';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  walletType: WalletType;
  createdAt: any;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  totalReward: number;
  category: string;
  thumbnail: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'daily' | 'one-time' | 'sponsored';
}

export interface UserTask {
  userId: string;
  taskId: string;
  completedAt: any;
  rewardEarned: number;
}
