// lib/actions/profile.js
'use server';

import { authApi } from '@/utils/auth';

// Update profile server action
export async function updateProfileAction(formData, accessToken) {
  try {
    if (!accessToken) {
      return {
        success: false,
        error: 'Access token required',
      };
    }

    const profileData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      bio: formData.get('bio'),
    };

    // Validate required fields
    if (!profileData.firstName || !profileData.lastName) {
      return {
        success: false,
        error: 'First name and last name are required',
        errors: {
          firstName: !profileData.firstName
            ? 'First name is required'
            : undefined,
          lastName: !profileData.lastName ? 'Last name is required' : undefined,
        },
      };
    }

    const response = await authApi.updateProfile(profileData, accessToken);
    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || 'Profile updated successfully',
        user: data.data?.user,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Profile update failed',
        errors: data.errors,
      };
    }
  } catch (error) {
    console.error('Update profile action error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}

// Change password server action
export async function changePasswordAction(formData, accessToken) {
  try {
    if (!accessToken) {
      return {
        success: false,
        error: 'Access token required',
      };
    }

    const passwordData = {
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    };

    // Validate required fields
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      return {
        success: false,
        error: 'All fields are required',
      };
    }

    // Validate password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return {
        success: false,
        error: 'New passwords do not match',
      };
    }

    // Validate password length
    if (passwordData.newPassword.length < 8) {
      return {
        success: false,
        error: 'New password must be at least 8 characters long',
      };
    }

    const response = await authApi.changePassword(passwordData, accessToken);
    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || 'Password changed successfully',
      };
    } else {
      return {
        success: false,
        error: data.message || 'Password change failed',
      };
    }
  } catch (error) {
    console.error('Change password action error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}

// Upload profile image server action
export async function uploadProfileImageAction(formData, accessToken) {
  try {
    if (!accessToken) {
      return {
        success: false,
        error: 'Access token required',
      };
    }

    const imageFile = formData.get('profileImage');
    if (!imageFile) {
      return {
        success: false,
        error: 'No image file provided',
      };
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Please upload a valid image file',
      };
    }

    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'Image size should be less than 5MB',
      };
    }

    const response = await authApi.uploadProfileImage(formData, accessToken);
    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || 'Profile image uploaded successfully',
        imageUrl: data.data?.imageUrl,
        user: data.data?.user,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Image upload failed',
      };
    }
  } catch (error) {
    console.error('Upload profile image action error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}

// Get user profile server action
export async function getProfileAction(accessToken) {
  try {
    if (!accessToken) {
      return {
        success: false,
        error: 'Access token required',
      };
    }

    const response = await authApi.getProfile(accessToken);
    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        user: data.data?.user,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to fetch profile',
      };
    }
  } catch (error) {
    console.error('Get profile action error:', error);
    return {
      success: false,
      error: 'Failed to fetch profile',
    };
  }
}
