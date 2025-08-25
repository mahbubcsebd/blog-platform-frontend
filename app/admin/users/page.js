'use client';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import {
  CalendarIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  EyeIcon,
  FunnelIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  TrashIcon,
  UserGroupIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  XCircleIcon as XCircleSolidIcon,
} from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const UsersPage = () => {
  const { isAuthenticated, loading, authenticatedFetch, user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal states
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Action states
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/sign-in');
    }
    if (!loading && isAuthenticated && user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return;

    setUsersLoading(true);
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setUsers(data.data || []);
        setFilteredUsers(data.data || []);
      } else {
        showMessage(data.message || 'Failed to load users', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showMessage('Failed to load users', 'error');
    } finally {
      setUsersLoading(false);
    }
  }, [isAuthenticated, user, authenticatedFetch]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') fetchUsers();
  }, [isAuthenticated, user, fetchUsers]);

  // Search and Filter Logic
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => {
        if (statusFilter === 'active') return user.isActive;
        if (statusFilter === 'inactive') return !user.isActive;
        return true;
      });
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, roleFilter]);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Toggle User Status (Active/Inactive) - ADMIN PROTECTION ADDED
  const handleToggleUserStatus = async (userId) => {
    console.log('Toggling user status for:', userId);

    setUpdatingUserId(userId);
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${userId}/toggle-status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          // No body needed since we're just toggling
        }
      );

      const data = await response.json();
      console.log('Toggle response:', data);

      if (response.ok && data.success) {
        // Update the user in local state
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === userId ? { ...u, isActive: data.data.isActive } : u
          )
        );
        showMessage(data.message, 'success');
      } else {
        showMessage(data.message || 'Failed to update user status', 'error');
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      showMessage('Failed to update user status', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Delete User - ADMIN PROTECTION ADDED
  const handleDeleteUser = async (userId) => {
    if (
      !confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    ) {
      return;
    }

    setDeletingUserId(userId);
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${userId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
        showMessage('User deleted successfully', 'success');
      } else {
        showMessage(data.message || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      showMessage('Failed to delete user', 'error');
    } finally {
      setDeletingUserId(null);
    }
  };

  // View User Details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  // Helper function to check if user is admin
  const isAdminUser = (userToCheck) => {
    return userToCheck.role === 'ADMIN';
  };

  if (loading || usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Authenticating...' : 'Loading users...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Users Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage all registered users and their permissions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {users.length}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm">
              <span className="font-medium text-green-600">
                {users.filter((u) => u.isActive).length}
              </span>
              <span className="text-gray-500 ml-1">Active</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-red-600">
                {users.filter((u) => !u.isActive).length}
              </span>
              <span className="text-gray-500 ml-1">Inactive</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-blue-600">
                {users.filter((u) => u.role === 'ADMIN').length}
              </span>
              <span className="text-gray-500 ml-1">Admins</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-600">
                {users.filter((u) => u.role === 'USER').length}
              </span>
              <span className="text-gray-500 ml-1">Users</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mx-2">
            <div
              className={`${
                messageType === 'success'
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : 'bg-red-100 border-red-400 text-red-700'
              } border px-4 py-3 rounded-lg flex items-center shadow-sm`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {messageType === 'success' ? (
                    <CheckCircleSolidIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircleSolidIcon className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <FunnelIcon className="w-4 h-4 absolute right-2 top-3 text-gray-400 pointer-events-none" />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="MODERATOR">Moderator</option>
                <option value="USER">User</option>
              </select>
              <FunnelIcon className="w-4 h-4 absolute right-2 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <UserGroupIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'No users registered yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                            {user.username && (
                              <div className="text-xs text-gray-400">
                                @{user.username}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="inline-flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </button>

                        {/* Admin Protection: Disable status toggle for ADMIN users */}
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          disabled={
                            updatingUserId === user.id || isAdminUser(user)
                          }
                          className={`inline-flex items-center px-3 py-1 rounded-md transition-colors ${
                            isAdminUser(user)
                              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                              : user.isActive
                              ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          } ${
                            (updatingUserId === user.id || isAdminUser(user)) &&
                            'opacity-50'
                          }`}
                          title={
                            isAdminUser(user)
                              ? 'Admin users cannot be deactivated'
                              : ''
                          }
                        >
                          {updatingUserId === user.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                          ) : user.isActive ? (
                            <XCircleIcon className="w-4 h-4 mr-1" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                          )}
                          {isAdminUser(user)
                            ? 'Protected'
                            : user.isActive
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>

                        {/* Admin Protection: Disable delete for ADMIN users */}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={
                            deletingUserId === user.id || isAdminUser(user)
                          }
                          className={`inline-flex items-center px-3 py-1 rounded-md transition-colors ${
                            isAdminUser(user)
                              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                              : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                          } ${
                            (deletingUserId === user.id || isAdminUser(user)) &&
                            'opacity-50'
                          }`}
                          title={
                            isAdminUser(user)
                              ? 'Admin users cannot be deleted'
                              : ''
                          }
                        >
                          {deletingUserId === user.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                          ) : (
                            <TrashIcon className="w-4 h-4 mr-1" />
                          )}
                          {isAdminUser(user) ? 'Protected' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results count */}
        {filteredUsers.length > 0 && (
          <div className="text-sm text-gray-500 text-center">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View complete information about this user
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-gray-600">@{selectedUser.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={
                        selectedUser.isActive ? 'default' : 'destructive'
                      }
                      className={
                        selectedUser.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                      }
                    >
                      {selectedUser.isActive ? (
                        <>
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                    {isAdminUser(selectedUser) && (
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 hover:bg-purple-100"
                      >
                        Protected Account
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                </div>

                {selectedUser.phone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-900">{selectedUser.phone}</p>
                    </div>
                  </div>
                )}

                {selectedUser.website && (
                  <div className="flex items-center space-x-3">
                    <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Website
                      </p>
                      <a
                        href={selectedUser.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {selectedUser.website}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <Badge
                      variant={
                        selectedUser.role === 'ADMIN' ? 'default' : 'secondary'
                      }
                      className={
                        selectedUser.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800 hover:bg-purple-100'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                      }
                    >
                      {selectedUser.role}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {selectedUser.bio && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Bio</p>
                  <p className="text-gray-900">{selectedUser.bio}</p>
                </div>
              )}

              {selectedUser.address && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Address
                  </p>
                  <p className="text-gray-900">{selectedUser.address}</p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">Joined</p>
                  <p className="text-gray-900">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Last Updated
                  </p>
                  <p className="text-gray-900">
                    {formatDate(selectedUser.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
