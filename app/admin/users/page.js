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
  PencilIcon,
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
  const [showRoleUpdate, setShowRoleUpdate] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  // Action states
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState(null);

  // Role hierarchy helper
  const getRoleHierarchy = (role) => {
    const hierarchy = {
      SUPERADMIN: 4,
      ADMIN: 3,
      MODERATOR: 2,
      USER: 1,
    };
    return hierarchy[role] || 0;
  };

  // Check if current user can modify target user
  const canModifyUser = (targetUserRole, targetUserId) => {
    if (!user) return false;

    const currentLevel = getRoleHierarchy(user.role);
    const targetLevel = getRoleHierarchy(targetUserRole);

    // SUPERADMIN can modify anyone except themselves for delete/deactivate
    if (user.role === 'SUPERADMIN') {
      return true;
    }

    // ADMIN can only modify USER and MODERATOR
    if (user.role === 'ADMIN') {
      return targetUserRole === 'USER' || targetUserRole === 'MODERATOR';
    }

    return false;
  };

  // Check if action is restricted for current user
  const isActionRestricted = (targetUserRole, targetUserId, action) => {
    if (!user) return true;

    // SUPERADMIN cannot delete/deactivate themselves
    if (
      user.role === 'SUPERADMIN' &&
      user.id === targetUserId &&
      (action === 'delete' || action === 'deactivate')
    ) {
      return true;
    }

    return false;
  };

  // Helper function to check if user is protected
  const isProtectedUser = (userToCheck) => {
    if (!user) return true;

    // Can't modify if no permission
    if (!canModifyUser(userToCheck.role, userToCheck.id)) {
      return true;
    }

    return false;
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-red-100 text-red-800';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'MODERATOR':
        return 'bg-blue-100 text-blue-800';
      case 'USER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Redirect if not authenticated or not admin/superadmin
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/sign-in');
    }
    if (
      !loading &&
      isAuthenticated &&
      !['ADMIN', 'SUPERADMIN'].includes(user?.role)
    ) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated || !['ADMIN', 'SUPERADMIN'].includes(user?.role))
      return;

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
    if (isAuthenticated && ['ADMIN', 'SUPERADMIN'].includes(user?.role)) {
      fetchUsers();
    }
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

  // Toggle User Status with role hierarchy
  const handleToggleUserStatus = async (userId) => {
    const targetUser = users.find((u) => u.id === userId);

    if (isActionRestricted(targetUser.role, userId, 'deactivate')) {
      showMessage('SUPERADMIN cannot deactivate themselves', 'error');
      return;
    }

    setUpdatingUserId(userId);
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${userId}/toggle-status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
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

  // Delete User with role hierarchy
  const handleDeleteUser = async (userId) => {
    const targetUser = users.find((u) => u.id === userId);

    if (isActionRestricted(targetUser.role, userId, 'delete')) {
      showMessage('SUPERADMIN cannot delete themselves', 'error');
      return;
    }

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

  // Update User Role (SUPERADMIN only)
  const handleUpdateRole = (user) => {
    if (!canUpdateRole(user)) {
      showMessage(
        "You do not have permission to update this user's role",
        'error'
      );
      return;
    }

    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleUpdate(true);
  };

  const canUpdateRole = (targetUser) => {
    // Only SUPERADMIN can update roles
    return user?.role === 'SUPERADMIN';
  };

  const submitRoleUpdate = async () => {
    if (!selectedUser || !newRole) return;

    // Prevent SUPERADMIN from demoting themselves
    if (user.id === selectedUser.id && newRole !== 'SUPERADMIN') {
      showMessage('SUPERADMIN cannot demote themselves', 'error');
      return;
    }

    setUpdatingRoleUserId(selectedUser.id);
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${selectedUser.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === selectedUser.id ? { ...u, role: data.data.role } : u
          )
        );
        showMessage(data.message, 'success');
        setShowRoleUpdate(false);
        setSelectedUser(null);
      } else {
        showMessage(data.message || 'Failed to update user role', 'error');
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      showMessage('Failed to update user role', 'error');
    } finally {
      setUpdatingRoleUserId(null);
    }
  };

  // View User Details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
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

  if (!isAuthenticated || !['ADMIN', 'SUPERADMIN'].includes(user?.role))
    return null;

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
                {user?.role === 'SUPERADMIN' && (
                  <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    SUPERADMIN ACCESS
                  </span>
                )}
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
              <span className="font-medium text-red-600">
                {users.filter((u) => u.role === 'SUPERADMIN').length}
              </span>
              <span className="text-gray-500 ml-1">Super Admins</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-purple-600">
                {users.filter((u) => u.role === 'ADMIN').length}
              </span>
              <span className="text-gray-500 ml-1">Admins</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-blue-600">
                {users.filter((u) => u.role === 'MODERATOR').length}
              </span>
              <span className="text-gray-500 ml-1">Moderators</span>
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
                <option value="SUPERADMIN">Super Admin</option>
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
                  {filteredUsers.map((targetUser) => (
                    <tr key={targetUser.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {targetUser.firstName} {targetUser.lastName}
                              {user?.id === targetUser.id && (
                                <span className="ml-2 text-xs text-blue-600 font-semibold">
                                  (You)
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {targetUser.email}
                            </div>
                            {targetUser.username && (
                              <div className="text-xs text-gray-400">
                                @{targetUser.username}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                            targetUser.role
                          )}`}
                        >
                          {targetUser.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            targetUser.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {targetUser.isActive ? (
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
                          {formatDate(targetUser.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewUser(targetUser)}
                          className="inline-flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </button>

                        {/* Role Update Button (SUPERADMIN only) */}
                        {canUpdateRole(targetUser) && (
                          <button
                            onClick={() => handleUpdateRole(targetUser)}
                            disabled={updatingRoleUserId === targetUser.id}
                            className="inline-flex items-center px-3 py-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors"
                          >
                            {updatingRoleUserId === targetUser.id ? (
                              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                            ) : (
                              <PencilIcon className="w-4 h-4 mr-1" />
                            )}
                            Role
                          </button>
                        )}

                        {/* Status Toggle Button */}
                        <button
                          onClick={() => handleToggleUserStatus(targetUser.id)}
                          disabled={
                            updatingUserId === targetUser.id ||
                            isProtectedUser(targetUser) ||
                            isActionRestricted(
                              targetUser.role,
                              targetUser.id,
                              'deactivate'
                            )
                          }
                          className={`inline-flex items-center px-3 py-1 rounded-md transition-colors ${
                            isProtectedUser(targetUser) ||
                            isActionRestricted(
                              targetUser.role,
                              targetUser.id,
                              'deactivate'
                            )
                              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                              : targetUser.isActive
                              ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          } ${
                            (updatingUserId === targetUser.id ||
                              isProtectedUser(targetUser) ||
                              isActionRestricted(
                                targetUser.role,
                                targetUser.id,
                                'deactivate'
                              )) &&
                            'opacity-50'
                          }`}
                          title={
                            isActionRestricted(
                              targetUser.role,
                              targetUser.id,
                              'deactivate'
                            )
                              ? 'You cannot deactivate yourself'
                              : isProtectedUser(targetUser)
                              ? 'You do not have permission to modify this user'
                              : ''
                          }
                        >
                          {updatingUserId === targetUser.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                          ) : targetUser.isActive ? (
                            <XCircleIcon className="w-4 h-4 mr-1" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                          )}
                          {isProtectedUser(targetUser) ||
                          isActionRestricted(
                            targetUser.role,
                            targetUser.id,
                            'deactivate'
                          )
                            ? 'Protected'
                            : targetUser.isActive
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteUser(targetUser.id)}
                          disabled={
                            deletingUserId === targetUser.id ||
                            isProtectedUser(targetUser) ||
                            isActionRestricted(
                              targetUser.role,
                              targetUser.id,
                              'delete'
                            )
                          }
                          className={`inline-flex items-center px-3 py-1 rounded-md transition-colors ${
                            isProtectedUser(targetUser) ||
                            isActionRestricted(
                              targetUser.role,
                              targetUser.id,
                              'delete'
                            )
                              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                              : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                          } ${
                            (deletingUserId === targetUser.id ||
                              isProtectedUser(targetUser) ||
                              isActionRestricted(
                                targetUser.role,
                                targetUser.id,
                                'delete'
                              )) &&
                            'opacity-50'
                          }`}
                          title={
                            isActionRestricted(
                              targetUser.role,
                              targetUser.id,
                              'delete'
                            )
                              ? 'You cannot delete yourself'
                              : isProtectedUser(targetUser)
                              ? 'You do not have permission to modify this user'
                              : ''
                          }
                        >
                          {deletingUserId === targetUser.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                          ) : (
                            <TrashIcon className="w-4 h-4 mr-1" />
                          )}
                          {isProtectedUser(targetUser) ||
                          isActionRestricted(
                            targetUser.role,
                            targetUser.id,
                            'delete'
                          )
                            ? 'Protected'
                            : 'Delete'}
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
                    {user?.id === selectedUser.id && (
                      <span className="ml-2 text-sm text-blue-600 font-semibold">
                        (You)
                      </span>
                    )}
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
                    {isProtectedUser(selectedUser) && (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
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
                      variant="secondary"
                      className={getRoleBadgeColor(selectedUser.role)}
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

      {/* Role Update Modal */}
      <Dialog open={showRoleUpdate} onOpenChange={setShowRoleUpdate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.firstName}{' '}
              {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={updatingRoleUserId === selectedUser.id}
                >
                  <option value="USER">User</option>
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </select>
              </div>

              {user?.id === selectedUser.id && newRole !== 'SUPERADMIN' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ You cannot demote yourself from SUPERADMIN role.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowRoleUpdate(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={updatingRoleUserId === selectedUser.id}
                >
                  Cancel
                </button>
                <button
                  onClick={submitRoleUpdate}
                  disabled={
                    updatingRoleUserId === selectedUser.id ||
                    (user?.id === selectedUser.id && newRole !== 'SUPERADMIN')
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updatingRoleUserId === selectedUser.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Role'
                  )}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
