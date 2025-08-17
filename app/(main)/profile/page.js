// app/profile/page.js
'use client';

import { updateProfileAction } from '@/actions/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth, useAuthenticatedFetch } from '@/hooks/useAuth';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Camera,
  CheckCircle2,
  Edit,
  Loader2,
  Lock,
  Mail,
  Save,
  Settings,
  Shield,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useState } from 'react';

const initialState = { error: null, success: false };

export default function ProfilePage() {
  const { user, loading, isAuthenticated, getValidToken, logout } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Profile update form state
  const [state, formAction, isPending] = useActionState(
    async (_prevState, formData) => {
      try {
        const accessToken = await getValidToken();
        if (!accessToken) {
          return { success: false, error: 'Authentication required' };
        }

        const result = await updateProfileAction(formData, accessToken);

        if (result.success) {
          setIsEditing(false);
          // Refresh user data in context if needed
          setTimeout(() => {
            window.location.reload(); // Simple way to refresh user data
          }, 1500);
        }

        return result;
      } catch (error) {
        return { success: false, error: 'Failed to update profile' };
      }
    },
    initialState
  );

  // Handle profile image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setProfileImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload image
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await authenticatedFetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Image uploaded successfully:', data);
        // Handle successful upload
      } else {
        console.error('Failed to upload image');
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image & Basic Info */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        `${user?.firstName?.[0] || 'U'}${
                          user?.lastName?.[0] || ''
                        }`
                      )}
                    </div>

                    {/* Upload button */}
                    <label
                      htmlFor="profile-image"
                      className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                      ) : (
                        <Camera className="h-4 w-4 text-gray-600" />
                      )}
                    </label>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 text-center">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-gray-600 text-center">{user?.email}</p>

                  {user?.role && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role}
                    </span>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-3" />
                    <span>
                      Joined{' '}
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-3" />
                    <span>Email verified</span>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Quick Actions */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => router.push('/settings')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => router.push('/change-password')}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details & Edit Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-semibold text-gray-900">
                      Profile Information
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Manage your personal information and preferences
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Success/Error Messages */}
                {state?.success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 font-medium">
                      Profile updated successfully!
                    </AlertDescription>
                  </Alert>
                )}

                {state?.error && !state?.success && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 font-medium">
                      {state.error}
                    </AlertDescription>
                  </Alert>
                )}

                {isEditing ? (
                  /* Edit Form */
                  <form action={formAction} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="firstName"
                          className="text-sm font-medium text-gray-700"
                        >
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          defaultValue={user?.firstName || ''}
                          required
                          disabled={isPending}
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="lastName"
                          className="text-sm font-medium text-gray-700"
                        >
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          defaultValue={user?.lastName || ''}
                          required
                          disabled={isPending}
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="h-11 bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500">
                        Email cannot be changed. Contact support if you need to
                        update your email.
                      </p>
                    </div>

                    {/* Phone (if applicable) */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-700"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={user?.phone || ''}
                        disabled={isPending}
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="bio"
                        className="text-sm font-medium text-gray-700"
                      >
                        Bio
                      </Label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        defaultValue={user?.bio || ''}
                        disabled={isPending}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form state
                        }}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* View Mode */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          First Name
                        </Label>
                        <p className="mt-1 text-lg text-gray-900">
                          {user?.firstName || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Last Name
                        </Label>
                        <p className="mt-1 text-lg text-gray-900">
                          {user?.lastName || 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Email Address
                      </Label>
                      <p className="mt-1 text-lg text-gray-900">
                        {user?.email}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Phone Number
                      </Label>
                      <p className="mt-1 text-lg text-gray-900">
                        {user?.phone || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Bio
                      </Label>
                      <p className="mt-1 text-gray-900">
                        {user?.bio || 'No bio added yet.'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Member Since
                      </Label>
                      <p className="mt-1 text-gray-900">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
