interface AdAnnouncementProps {
  visible: boolean;
  text?: string;
  className?: string;
}

const AdAnnouncement = ({ visible, text = "Advertisement", className = "" }: AdAnnouncementProps) => {
  if (!visible) return null;
  
  return (
    <p className={`text-center font-mogra text-sm text-[hsl(var(--theme-primary))] mb-3 transition-opacity duration-300 ${className}`}>
      {text}
    </p>
  );
};

export default AdAnnouncement;
