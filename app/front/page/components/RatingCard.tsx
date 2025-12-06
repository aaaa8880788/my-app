'use client';
import React from 'react';
import { ReactNode } from 'react';

interface RatingCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonClick: (buttonText: string) => void;
}

export default function RatingCard({ icon, title, description, buttonText, buttonClick }: RatingCardProps) {
  return (
    <div className="rating-card">
      <div className="card-content fade-in">
        <div className="card-body">
          <div className="card-icon">
            {icon}
          </div>
          <h2 className="card-title">{title}</h2>
          <p className="card-description">
            {description}
          </p>
          <button
            className="card-button"
            onClick={() => buttonClick(buttonText)}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
