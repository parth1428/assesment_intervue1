
export const BrandBadge = ({ label = 'Intervue Poll' }: { label?: string }) => {
  return (
    <div className="brand-badge">
      <span className="brand-dot" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
};
