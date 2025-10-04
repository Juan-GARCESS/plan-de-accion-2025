﻿import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <div className={ounded-lg border bg-card text-card-foreground shadow-sm {className}}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <div className={lex flex-col space-y-1.5 p-6 {className}}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <h3 className={	ext-2xl font-semibold leading-none tracking-tight {className}}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <p className={	ext-sm text-muted-foreground {className}}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <div className={p-6 pt-0 {className}}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <div className={lex items-center p-6 pt-0 {className}}>
      {children}
    </div>
  );
};
