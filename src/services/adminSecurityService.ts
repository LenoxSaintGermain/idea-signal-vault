
import { doc, getDoc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';

export class AdminSecurityService {
  private static instance: AdminSecurityService;

  static getInstance(): AdminSecurityService {
    if (!AdminSecurityService.instance) {
      AdminSecurityService.instance = new AdminSecurityService();
    }
    return AdminSecurityService.instance;
  }

  async verifyAdminRole(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return false;
      }

      const userData = userSnap.data() as User;
      return userData.isAdmin === true;
    } catch (error) {
      console.error('Admin verification failed:', error);
      return false;
    }
  }

  async grantAdminRole(targetUserId: string, adminUserId: string): Promise<void> {
    // Verify the person granting admin is an admin
    const isCurrentUserAdmin = await this.verifyAdminRole(adminUserId);
    if (!isCurrentUserAdmin) {
      throw new Error('Insufficient permissions to grant admin role');
    }

    try {
      const userRef = doc(db, 'users', targetUserId);
      await updateDoc(userRef, {
        isAdmin: true,
        adminGrantedAt: Timestamp.now(),
        adminGrantedBy: adminUserId
      });

      // Log the admin action
      await this.logAdminAction(adminUserId, 'grant_admin', {
        targetUserId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to grant admin role:', error);
      throw new Error('Failed to grant admin role');
    }
  }

  async revokeAdminRole(targetUserId: string, adminUserId: string): Promise<void> {
    // Verify the person revoking admin is an admin
    const isCurrentUserAdmin = await this.verifyAdminRole(adminUserId);
    if (!isCurrentUserAdmin) {
      throw new Error('Insufficient permissions to revoke admin role');
    }

    // Prevent self-revocation
    if (targetUserId === adminUserId) {
      throw new Error('Cannot revoke your own admin role');
    }

    try {
      const userRef = doc(db, 'users', targetUserId);
      await updateDoc(userRef, {
        isAdmin: false,
        adminRevokedAt: Timestamp.now(),
        adminRevokedBy: adminUserId
      });

      // Log the admin action
      await this.logAdminAction(adminUserId, 'revoke_admin', {
        targetUserId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to revoke admin role:', error);
      throw new Error('Failed to revoke admin role');
    }
  }

  private async logAdminAction(adminUserId: string, action: string, details: any): Promise<void> {
    try {
      await addDoc(collection(db, 'admin_logs'), {
        adminUserId,
        action,
        details,
        timestamp: Timestamp.now(),
        ipAddress: 'client-side', // In a real app, this would come from server
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
      // Don't throw - logging failures shouldn't break the main operation
    }
  }
}

export const adminSecurity = AdminSecurityService.getInstance();
