import React from 'react';
import { Users, Lock, Globe, Plus, Check } from 'lucide-react';
import { Group, User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface GroupsViewProps {
  groups: Group[];
  currentUser: User;
  onSelectGroup: (group: Group) => void;
  onToggleJoinGroup: (groupId: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  groups,
  currentUser,
  onSelectGroup,
  onToggleJoinGroup,
}) => {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {language === 'km' ? 'សហគមន៍ និងក្រុម' : 'Communities & Groups'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'km' 
              ? 'ភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកជំនាញ ចំណង់ចំណូលចិត្ត និងមជ្ឈមណ្ឌលចាប់អារម្មណ៍នានា។' 
              : 'Connect with professionals, hobbies, and interest-based hubs.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div 
              className="p-5 cursor-pointer"
              onClick={() => onSelectGroup(group)}
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={group.icon}
                  alt={group.name}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                />
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{group.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    {group.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    <span>
                      {group.isPrivate 
                        ? (language === 'km' ? 'ឯកជន' : 'Private') 
                        : (language === 'km' ? 'សាធារណៈ' : 'Public')} • {group.membersCount}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{group.description}</p>
            </div>

            <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
              {group.isManaged ? (
                <span className="text-xs font-semibold text-blue-600">
                  {language === 'km' ? 'អ្នកគ្រប់គ្រង' : 'Admin'}
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  {language === 'km' ? 'សមាជិកសហគមន៍' : 'Community Member'}
                </span>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => onSelectGroup(group)}
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 cursor-pointer"
                >
                  {language === 'km' ? 'មើល' : 'View'}
                </button>
                <button
                  onClick={() => onToggleJoinGroup(group.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    group.joined
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
                  }`}
                >
                  {group.joined ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  <span>
                    {group.joined 
                      ? (language === 'km' ? 'បានចូលរួម' : 'Joined') 
                      : (language === 'km' ? 'ចូលរួម' : 'Join')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
