import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Image as ImageIcon, 
  Check, 
  Loader2, 
  MapPin, 
  Briefcase, 
  Globe, 
  User as UserIcon, 
  FileText,
  Sparkles,
  Upload
} from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface EditProfileModalProps {
  currentUser: User;
  onClose: () => void;
  onUpdateProfile: (updated: Partial<User>) => void;
}

const PRESET_COVERS = [
  {
    name: 'Phnom Penh Cityscape',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Angkor Heritage',
    url: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cyberpunk Neon Gradient',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sunset Ocean Wave',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Emerald Rainforest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Minimal Tech Workspace',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
  },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ConnectHub',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Sokun',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentUser,
  onClose,
  onUpdateProfile,
}) => {
  const { language } = useLanguage();

  const [name, setName] = useState(currentUser.name || '');
  const [role, setRole] = useState(currentUser.role || 'Member');
  const [jobTitle, setJobTitle] = useState(currentUser.jobTitle || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [website, setWebsite] = useState(currentUser.website || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [coverImage, setCoverImage] = useState(currentUser.coverImage || '');

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCoverPresets, setShowCoverPresets] = useState(false);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const res = await api.uploadMedia(file);
      if (res?.url) {
        setAvatar(api.getMediaUrl(res.url));
      }
    } catch (_) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const res = await api.uploadMedia(file);
      if (res?.url) {
        setCoverImage(api.getMediaUrl(res.url));
      }
    } catch (_) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const patch: Partial<User> = {
      name: name.trim(),
      role: role.trim(),
      jobTitle: jobTitle.trim(),
      bio: bio.trim(),
      location: location.trim(),
      website: website.trim(),
      avatar: avatar.trim(),
      coverImage: coverImage.trim() || undefined,
    };

    try {
      await api.updateProfile(patch);
      onUpdateProfile(patch);
      onClose();
    } catch (err) {
      console.warn('Update profile API notice:', err);
      // Fallback local state update
      onUpdateProfile(patch);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">
              {language === 'km' ? 'កែសម្រួលគណនី និងរូបភាពគម្រប' : 'Edit Profile & Cover Photo'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* 1. Cover Photo Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span>{language === 'km' ? 'រូបភាពគម្រប (Cover Photo)' : 'Cover Photo'}</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCoverPresets(!showCoverPresets)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ជ្រើសរើសគំរូស្អាតៗ' : 'Browse Presets'}</span>
              </button>
            </div>

            {/* Cover Preview & Action Overlay */}
            <div className="relative h-40 sm:h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xs border border-gray-200">
              {coverImage ? (
                <img
                  src={api.getMediaUrl(coverImage)}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/80 gap-2">
                  <ImageIcon className="w-8 h-8 opacity-60" />
                  <span className="text-xs font-medium">
                    {language === 'km' ? 'មិនទាន់មានរូបភាពគម្រប' : 'No Cover Photo Set'}
                  </span>
                </div>
              )}

              {/* Cover Action Buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <label className="bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs">
                  {isUploadingCover ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploadingCover ? 'Uploading...' : (language === 'km' ? 'បញ្ចូលរូបថ្មី' : 'Upload Cover')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </label>

                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-xl transition-colors cursor-pointer"
                    title={language === 'km' ? 'លុបរូបគម្រប' : 'Remove Cover'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Cover Presets Grid */}
            {showCoverPresets && (
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    {language === 'km' ? 'ជ្រើសរើសរូបភាពគម្របទេសភាព' : 'Curated Cover Presets'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCoverPresets(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_COVERS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setCoverImage(preset.url);
                        setShowCoverPresets(false);
                      }}
                      className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-600 transition-all shadow-xs"
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Avatar Profile Picture Section */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>{language === 'km' ? 'រូបភាពកម្រងព័ត៌មាន (Avatar)' : 'Profile Picture'}</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ជ្រើសរើស Avatar ស្អាតៗ' : 'Avatar Presets'}</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={api.getMediaUrl(avatar) || 'https://api.dicebear.com/7.x/avataaars/svg?seed=ConnectHub'}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover bg-gray-100"
                />
                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full border-2 border-white cursor-pointer shadow-xs transition-colors">
                  {isUploadingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-xs font-semibold text-gray-800">
                  {language === 'km' ? 'រូបភាពតំណាងរបស់អ្នក' : 'Your Profile Picture'}
                </p>
                <p className="text-xs text-gray-400">
                  {language === 'km'
                    ? 'គាំទ្រទម្រង់ JPG, PNG, WEBP ឬ GIF។ ទំហំរូបភាពណែនាំ 400x400px។'
                    : 'Supports JPG, PNG, WEBP or GIF. Recommended size 400x400px.'}
                </p>
              </div>
            </div>

            {/* Avatar Presets Grid */}
            {showAvatarPresets && (
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    {language === 'km' ? 'ជ្រើសរើស Avatar គំរូ' : 'Choose Avatar Preset'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAvatarPresets(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Preset avatar"
                      onClick={() => {
                        setAvatar(url);
                        setShowAvatarPresets(false);
                      }}
                      className={`w-12 h-12 rounded-full object-cover border-2 cursor-pointer transition-all hover:scale-105 shadow-xs ${
                        avatar === url ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-gray-200 hover:border-blue-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Personal & Professional Details */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              {language === 'km' ? 'ព័ត៌មានលម្អិតអំពីអ្នក' : 'Personal & Bio Information'}
            </h4>

            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                <span>{language === 'km' ? 'ឈ្មោះពេញ (Display Name)' : 'Display Name'} *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Headline / Role & Job Title in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  <span>{language === 'km' ? 'តួនាទី / ជំនាញ (Role / Headline)' : 'Role / Headline'}</span>
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Senior Full-Stack Engineer"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  <span>{language === 'km' ? 'កន្លែងធ្វើការ / ក្រុមហ៊ុន (Workplace)' : 'Workplace / Title'}</span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Angkor Tech Labs"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Bio Multi-line */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <span>{language === 'km' ? 'ជីវប្រវត្តិសង្ខេប (Bio)' : 'Bio'}</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={language === 'km' ? 'រៀបរាប់បន្តិចបន្តួចអំពីខ្លួនអ្នក...' : 'Tell the community a little about yourself...'}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-normal resize-none"
              />
            </div>

            {/* Location & Website Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{language === 'km' ? 'ទីតាំង (Location)' : 'Location'}</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Phnom Penh, Cambodia 🇰🇭"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span>{language === 'km' ? 'គេហទំព័រ / Link (Website)' : 'Website / Link'}</span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://connecthub.app"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingAvatar || isUploadingCover || !name.trim()}
              className="flex-1 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving Changes...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
