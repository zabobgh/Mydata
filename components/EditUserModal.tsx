
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../types';

interface EditUserModalProps {
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  userToEdit: User;
  currentUser: User;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ onClose, onUpdateUser, userToEdit, currentUser }) => {
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(userToEdit.role);
  const [avatar, setAvatar] = useState<string | null>(userToEdit.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditingSelf = currentUser.id === userToEdit.id;


  useEffect(() => {
    setRole(userToEdit.role);
    setPassword(''); // Reset password field on new user edit
    setAvatar(userToEdit.avatar || null);
  }, [userToEdit]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If password is not entered, use the old one.
    // In a real app, you'd handle this more securely.
    const updatedPassword = password.trim() ? password : userToEdit.password;

    onUpdateUser({
        ...userToEdit,
        password: updatedPassword,
        role,
        avatar: avatar || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onMouseDown={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4 m-4" onMouseDown={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">แก้ไขผู้ใช้: {userToEdit.username}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-gray-700">รูปโปรไฟล์</label>
            <div className="mt-2 flex items-center gap-4">
              {avatar ? (
                  <img src={avatar} alt="Avatar preview" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                  </div>
              )}
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
              />
              <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                เปลี่ยนรูป
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
            <input 
                type="text" 
                id="edit-username" 
                value={userToEdit.username} 
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100 text-gray-500" 
            />
          </div>
          <div>
            <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
             <input 
                type="password" 
                id="edit-password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="ปล่อยว่างไว้ถ้าไม่ต้องการเปลี่ยน"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" 
            />
          </div>
           <div>
            <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700">บทบาท <span className="text-red-500">*</span></label>
            <select 
                id="edit-role" 
                value={role} 
                onChange={e => setRole(e.target.value as UserRole)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                disabled={isEditingSelf}
            >
                <option value={UserRole.User}>ผู้ใช้งาน</option>
                <option value={UserRole.Admin}>ผู้ดูแลระบบ</option>
            </select>
            {isEditingSelf && <p className="text-xs text-gray-500 mt-1">ไม่สามารถเปลี่ยนบทบาทของตัวเองได้</p>}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">บันทึกการเปลี่ยนแปลง</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
