import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <div className={[
      'rounded-xl border shadow-sm transition-all duration-200',
      'bg-white dark:bg-slate-800',
      'border-slate-200 dark:border-slate-700',
      'text-slate-900 dark:text-slate-100',
      'hover:shadow-md',
      className
    ].join(' ')}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <div className={['flex flex-col space-y-1.5 p-6', className].join(' ')}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <h3 className={[
      'text-2xl font-semibold leading-none tracking-tight',
      'text-slate-900 dark:text-slate-100',
      className
    ].join(' ')}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <p className={[
      'text-sm',
      'text-slate-600 dark:text-slate-400',
      className
    ].join(' ')}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <div className={['p-6 pt-0', className].join(' ')}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <div className={[
      'flex items-center p-6 pt-0',
      'border-t border-slate-200 dark:border-slate-700',
      className
    ].join(' ')}>
      {children}
    </div>
  );
};
