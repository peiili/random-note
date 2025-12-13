'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Role {
  id: number;
  name: string;
  displayName: string;
}

interface UserRole {
  roleId: number;
  role: Role;
}

interface User {
  id: number;
  email: string;
  displayName: string;
  status: string;
  emailVerified: boolean;
  userRoles: UserRole[];
}

interface UserActionsProps {
  user: User;
}

export default function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (loading) return;

    if (!confirm(`确定要将用户"${user.displayName}"的状态改为"${newStatus}"吗？`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
        setShowStatusModal(false);
      } else {
        const error = await response.json();
        alert(error.error || '操作失败');
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowStatusModal(true)}
          disabled={loading}
          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
        >
          管理
        </button>
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">管理用户</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">用户信息</div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-900 font-medium">{user.displayName}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">当前角色</div>
                <div className="flex flex-wrap gap-2">
                  {user.userRoles.map((ur) => (
                    <span
                      key={ur.roleId}
                      className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800"
                    >
                      {ur.role.displayName}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">更改状态</div>
                <div className="space-y-2">
                  {user.status !== 'active' && (
                    <button
                      onClick={() => handleStatusChange('active')}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      设为活跃
                    </button>
                  )}
                  {user.status !== 'inactive' && (
                    <button
                      onClick={() => handleStatusChange('inactive')}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                    >
                      设为未激活
                    </button>
                  )}
                  {user.status !== 'suspended' && (
                    <button
                      onClick={() => handleStatusChange('suspended')}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      停用账号
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
