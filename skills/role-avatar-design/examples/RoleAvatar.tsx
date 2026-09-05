import React from 'react';

export type EnterpriseRoleKey =
  | 'hr'
  | 'rd'
  | 'finance'
  | 'product'
  | 'frontend'
  | 'architect';

export interface RoleAvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Target role key */
  role: EnterpriseRoleKey;
  /** Sizing presets in pixels: sm (32), md (48), lg (64), xl (96) or custom number */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Whether to render as circle (rounded-full) or squircle (rounded-2xl) */
  shape?: 'circle' | 'squircle';
  /** Optional custom border */
  bordered?: boolean;
}

const ROLE_META: Record<EnterpriseRoleKey, { name: string; filename: string; dept: string; tagBg: string }> = {
  hr: {
    name: 'HR Specialist',
    filename: 'hr-manager.png',
    dept: '人力资源',
    tagBg: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  rd: {
    name: 'R&D Engineer',
    filename: 'rd-engineer.png',
    dept: '研发中心',
    tagBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  finance: {
    name: 'Finance Analyst',
    filename: 'financial-analyst.png',
    dept: '财务分析',
    tagBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  product: {
    name: 'Product Manager',
    filename: 'product-manager.png',
    dept: '产品体验',
    tagBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  frontend: {
    name: 'Frontend Engineer',
    filename: 'frontend-engineer.png',
    dept: '前端架构',
    tagBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  architect: {
    name: 'Software Architect',
    filename: 'software-architect.png',
    dept: '系统架构',
    tagBg: 'bg-zinc-100 text-zinc-800 border-zinc-300',
  },
};

const SIZE_MAP: Record<string, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export const RoleAvatar: React.FC<RoleAvatarProps> = ({
  role,
  size = 'md',
  shape = 'squircle',
  bordered = true,
  className = '',
  alt,
  ...rest
}) => {
  const meta = ROLE_META[role] || ROLE_META.rd;
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 48;
  const radiusClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const borderClass = bordered ? 'border border-zinc-200/80 shadow-xs' : '';

  // Asset path assumes standard vite alias or relative path
  const src = `/src/assets/teamerhub/${meta.filename}`;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-zinc-50 ${radiusClass} ${borderClass} ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <img
        src={src}
        alt={alt || meta.name}
        className="h-full w-full object-cover"
        loading="lazy"
        {...rest}
      />
    </div>
  );
};

export default RoleAvatar;

