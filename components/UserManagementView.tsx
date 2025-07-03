
import React from 'react';
import { User, UserRole } from '../types';
import { TrashIcon, PencilIcon, UsersIcon } from './icons/Icons';

interface UserManagementViewProps {
  users: User[];
  currentUser: User;
  onStartEdit: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const isAdmim = role === UserRole.Admin;
  const classes = `px-2.5 py-0.5 text-xs font-medium rounded-full inline-block ${isAdmim ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`;
  return <span className={classes}>{isAdmim ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}</span>;
};


const UserManagementView: React.FC<UserManagementViewProps> = ({ users, currentUser, onStartEdit, onDeleteUser }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อผู้ใช้</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">บทบาท</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUser.id;
              return (
                <tr key={user.id} className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.avatar ? (
                        <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt={user.username} />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UsersIcon className="w-6 h-6 text-gray-500" />
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username} {isCurrentUser && '(คุณ)'}</div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                        onClick={() => onStartEdit(user)} 
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100"
                        title={'แก้ไขผู้ใช้'}
                    >
                        <PencilIcon className="w-5 h-5"/>
                    </button>
                    <button 
                        onClick={() => confirm(`ต้องการลบผู้ใช้ ${user.username} ใช่หรือไม่?`) && onDeleteUser(user.id)} 
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                        disabled={isCurrentUser}
                        title={isCurrentUser ? 'ไม่สามารถลบบัญชีตัวเองได้' : 'ลบผู้ใช้'}
                    >
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementView;
