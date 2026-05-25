'use client';

import { create } from 'zustand';

interface AppStore {
  activeMonth: string; // "YYYY-MM"
  setActiveMonth: (month: string) => void;
}

const now = new Date();
const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export const useAppStore = create<AppStore>((set) => ({
  activeMonth: defaultMonth,
  setActiveMonth: (month) => set({ activeMonth: month }),
}));
