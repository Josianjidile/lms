import { clerkClient } from '@clerk/express';

export const updateRoleToEducator = async (req, res) => {
  try {
    console.log('Request Auth:', req.auth); // Debugging
    const userId = req.auth.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required and missing' });
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'educator',
      },
    });

    res.status(200).json({ success: true, message: 'Role updated to educator! You can publish a course now.' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Error updating role' });
  }
};