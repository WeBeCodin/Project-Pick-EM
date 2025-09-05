'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check, Star } from 'lucide-react';

interface Game {
  id: string;
  homeTeam: { name: string; abbreviation: string };
  awayTeam: { name: string; abbreviation: string };
  gameTime: string;
  week: number;
  network: string;
  status: string;
}

interface PickModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gameId: string, selectedTeam: 'home' | 'away', confidence: number) => Promise<void>;
  existingPick?: {
    selectedTeam: 'home' | 'away';
    confidence: number;
  };
}

export function PickModal({ game, isOpen, onClose, onSubmit, existingPick }: PickModalProps) {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(
    existingPick?.selectedTeam || null
  );
  const [confidence, setConfidence] = useState(existingPick?.confidence || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (existingPick) {
      setSelectedTeam(existingPick.selectedTeam);
      setConfidence(existingPick.confidence);
    } else {
      setSelectedTeam(null);
      setConfidence(1);
    }
  }, [existingPick, game]);

  if (!isOpen || !game) return null;

  const handleSubmit = async () => {
    if (!selectedTeam) return;

    setIsSubmitting(true);
    try {
      await onSubmit(game.id, selectedTeam, confidence);
      onClose();
    } catch (error) {
      console.error('Error submitting pick:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatGameTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Make Your Pick
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Game Info */}
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {game.awayTeam.name} @ {game.homeTeam.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatGameTime(game.gameTime)} • {game.network}
              </div>
            </div>

            {/* Team Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Select Winner
              </h3>
              
              {/* Away Team */}
              <button
                onClick={() => setSelectedTeam('away')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedTeam === 'away'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {game.awayTeam.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {game.awayTeam.abbreviation} (Away)
                    </div>
                  </div>
                  {selectedTeam === 'away' && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              </button>

              {/* Home Team */}
              <button
                onClick={() => setSelectedTeam('home')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedTeam === 'home'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {game.homeTeam.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {game.homeTeam.abbreviation} (Home)
                    </div>
                  </div>
                  {selectedTeam === 'home' && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              </button>
            </div>

            {/* Confidence Level */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Confidence Level (1-5)
              </h3>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setConfidence(level)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      confidence === level
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <Star 
                        className={`h-4 w-4 ${
                          confidence >= level ? 'text-yellow-500 fill-current' : 'text-gray-400'
                        }`} 
                      />
                      <span className="text-xs font-medium">{level}</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Higher confidence = more points if correct, but more points lost if wrong
              </p>
            </div>

            {/* Current Pick Status */}
            {existingPick && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Current Pick:</strong> {existingPick.selectedTeam === 'home' ? game.homeTeam.abbreviation : game.awayTeam.abbreviation} (Confidence: {existingPick.confidence})
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!selectedTeam || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : existingPick ? 'Update Pick' : 'Submit Pick'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PickModal;
