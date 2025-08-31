
import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminTabHeaderProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  children?: React.ReactNode;
}

const AdminTabHeader = ({ title, icon: Icon, description, children }: AdminTabHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-6 h-6 text-[var(--theme-primary)]" />}
        <div>
          <h2 className="text-xl sm:text-2xl font-[var(--theme-font-heading)] text-[var(--theme-primary)] [.theme-font-ceviche_&]:text-3xl [.theme-font-ceviche_&]:sm:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="text-[var(--theme-text)] font-[var(--theme-font-body)] text-sm mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex flex-col sm:flex-row gap-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default AdminTabHeader;
