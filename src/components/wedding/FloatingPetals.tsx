import React from 'react';

export const FloatingPetals: React.FC = React.memo(() => {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {Array.from({ length: 12 }).map((_, index) => (
        <span
          key={index}
          className="petal"
          style={{
            left: `${8 + index * 8}%`,
            animationDelay: `${index * 0.55}s`,
            animationDuration: `${7 + (index % 4)}s`,
          }}
        />
      ))}
    </div>
  );
});
FloatingPetals.displayName = 'FloatingPetals';
