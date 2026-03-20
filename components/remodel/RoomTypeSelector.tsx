'use client';

import { cn } from '@/lib/cn';
import { ROOM_TYPES } from '@/lib/constants';
import type { RoomType } from '@/types';
import {
  Sofa,
  Bed,
  ChefHat,
  Bath,
  UtensilsCrossed,
  Monitor,
  Baby,
  DoorOpen,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sofa,
  Bed,
  ChefHat,
  Bath,
  UtensilsCrossed,
  Monitor,
  Baby,
  DoorOpen,
};

interface RoomTypeSelectorProps {
  selected: RoomType | null;
  onSelect: (room: RoomType) => void;
}

export default function RoomTypeSelector({ selected, onSelect }: RoomTypeSelectorProps) {
  return (
    <div>
      <h3 className="text-white font-semibold text-lg mb-4">방 종류 선택</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ROOM_TYPES.map((room) => {
          const Icon = ICONS[room.icon];
          return (
            <button
              key={room.id}
              onClick={() => onSelect(room.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer',
                selected === room.id
                  ? 'border-blue-500 bg-blue-500/15 text-blue-400'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
              )}
            >
              {Icon && <Icon className="w-6 h-6" />}
              <span className="text-sm font-medium">{room.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
