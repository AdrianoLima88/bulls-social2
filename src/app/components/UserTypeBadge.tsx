import React from 'react';
import { Building2, Newspaper, GraduationCap, Landmark, CheckCircle } from 'lucide-react';

interface UserTypeBadgeProps {
  userType: 'normal' | 'company' | 'media' | 'educator' | 'government';
  verified?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const UserTypeBadge: React.FC<UserTypeBadgeProps> = ({ 
  userType, 
  verified = false,
  size = 'md' 
}) => {
  const getBadgeConfig = () => {
    switch (userType) {
      case 'company':
        return {
          icon: Building2,
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-500',
          label: 'Company',
        };
      case 'media':
        return {
          icon: Newspaper,
          bgColor: 'bg-purple-500',
          textColor: 'text-purple-500',
          label: 'Mídia',
        };
      case 'educator':
        return {
          icon: GraduationCap,
          bgColor: 'bg-orange-500',
          textColor: 'text-orange-500',
          label: 'Educator',
        };
      case 'government':
        return {
          icon: Landmark,
          bgColor: 'bg-red-500',
          textColor: 'text-red-500',
          label: 'Governo',
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig();
  
  if (!config && !verified) return null;

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-1">
      {verified && (
        <div className="flex items-center justify-center">
          <CheckCircle className={`${iconSizes[size]} text-blue-500 fill-blue-500`} />
        </div>
      )}
      {config && (
        <div className={`flex items-center justify-center rounded-full ${config.bgColor} p-0.5`}>
          <config.icon className={`${iconSizes[size]} text-white`} />
        </div>
      )}
    </div>
  );
};

interface PostTypeBadgeProps {
  postType: 'analysis' | 'opinion' | 'education' | 'media' | 'company' | 'news';
  size?: 'sm' | 'md' | 'lg';
}

export const PostTypeBadge: React.FC<PostTypeBadgeProps> = ({ postType, size = 'sm' }) => {
  const getBadgeConfig = () => {
    switch (postType) {
      case 'analysis':
        return {
          label: 'Analysis',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
        };
      case 'company':
        return {
          label: 'Company',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
        };
      case 'news':
        return {
          label: 'News',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
        };
      case 'education':
        return {
          label: 'Education',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
        };
      case 'opinion':
        return {
          label: 'Opinion',
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-700',
          borderColor: 'border-slate-200',
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig();
  if (!config) return null;

  const textSizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor} ${textSizes[size]}`}>
      {config.label}
    </span>
  );
};
