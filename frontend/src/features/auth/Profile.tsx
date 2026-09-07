import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user, token } = useAuth();
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(user?.profile?.preferred_language || 'en');
  const [success, setSuccess] = useState('');

  const handleUpdate = async () => {
    try {
      const res = await fetch('/api/v1/auth/profile/', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferred_language: lang })
      });
      
      if (res.ok) {
        setSuccess('Profile updated successfully');
        i18n.changeLanguage(lang);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold mb-6 text-primary">Your Profile</h2>
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{success}</div>}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">Username</label>
          <div className="font-medium text-lg">{user.username}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Email</label>
          <div className="font-medium text-lg">{user.email}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Role</label>
          <div className="font-medium text-lg text-primary">{user.role}</div>
        </div>
        
        <div className="pt-4 border-t">
          <label className="block text-sm font-medium mb-2">Preferred Language</label>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="w-full border rounded p-2 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="gu">Gujarati</option>
          </select>
          <button 
            onClick={handleUpdate}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded text-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
