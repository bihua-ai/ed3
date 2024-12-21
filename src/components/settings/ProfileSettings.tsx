import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save } from 'lucide-react';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { MatrixClientUtil } from '../../utils/matrixClient';

export default function ProfileSettings() {
  const { profile, refreshProfile } = useMatrixClient();
  const [displayName, setDisplayName] = useState('');
  const [profileText, setProfileText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update display name when profile is loaded
  useEffect(() => {
    if (profile?.displayname) {
      setDisplayName(profile.displayname);
    }
  }, [profile]);

  const handleSave = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const client = await MatrixClientUtil.initialize();
      await client.setDisplayName(displayName);
      await refreshProfile();
    } catch (err) {
      setError('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);

    try {
      const client = await MatrixClientUtil.initialize();
      const response = await client.uploadContent(file);
      await client.setAvatarUrl(response.content_uri);
      await refreshProfile();
    } catch (err) {
      setError('头像上传失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">个人设置</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            头像
          </label>
          <div className="flex items-center gap-6">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.displayname || 'User'}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              更换头像
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            显示名称
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="请输入显示名称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            个人简介
          </label>
          <textarea
            value={profileText}
            onChange={(e) => setProfileText(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="请输入个人简介"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                保存更改
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}