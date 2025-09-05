import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function isGameStarted(gameTime: Date | string): boolean {
  return new Date(gameTime) <= new Date();
}

export function getGameStatus(game: any): 'upcoming' | 'live' | 'completed' {
  const now = new Date();
  const gameTime = new Date(game.gameTime);
  
  if (gameTime > now) return 'upcoming';
  if (game.homeScore !== null && game.awayScore !== null) return 'completed';
  return 'live';
}

export function getCurrentWeek(): number {
  // Simple calculation - in a real app, you'd want to sync this with the NFL schedule
  const now = new Date();
  const seasonStart = new Date(now.getFullYear(), 8, 1); // September 1st
  const weeksPassed = Math.floor((now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(18, weeksPassed + 1));
}

export function getCurrentSeason(): number {
  const now = new Date();
  const year = now.getFullYear();
  // NFL season runs from September to February of next year
  return now.getMonth() >= 8 ? year : year - 1;
}
