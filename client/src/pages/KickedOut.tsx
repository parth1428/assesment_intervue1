import { BrandBadge } from '../components/BrandBadge';

export const KickedOut = () => {
  return (
    <div className="page-center">
      <BrandBadge />
      <h1>You've been kicked out!</h1>
      <p className="subtitle">
        Looks like the teacher removed you from the poll system. Please try again later.
      </p>
    </div>
  );
};
