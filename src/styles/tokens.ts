// src/styles/tokens.ts

export const tokens = {
  // Semantic Feedback Colors
  colors: {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/80',
      text: 'text-emerald-900',
      icon: 'text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    },
    error: {
      bg: 'bg-rose-50',
      border: 'border-rose-200/80',
      text: 'text-rose-900',
      icon: 'text-rose-600',
      badge: 'bg-rose-50 text-rose-800 border-rose-200/80',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200/80',
      text: 'text-amber-900',
      icon: 'text-amber-600',
      badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
    },
    info: {
      bg: 'bg-slate-50',
      border: 'border-slate-200/90',
      text: 'text-slate-900',
      icon: 'text-slate-600',
      badge: 'bg-slate-100 text-slate-800 border-slate-200/90',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200/80',
      text: 'text-indigo-900',
      icon: 'text-indigo-600',
      badge: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
    },
  },

  // Typography Scales
  typography: {
    pageTitle: 'text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight',
    sectionTitle: 'text-base sm:text-lg font-bold text-slate-900',
    cardTitle: 'text-sm sm:text-base font-bold text-slate-900',
    body: 'text-xs text-slate-600 leading-relaxed',
    bodyMuted: 'text-[11px] text-slate-500',
    microLabel: 'text-[10px] font-bold uppercase tracking-wider text-slate-500',
    moneyLarge: 'font-mono font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight',
    moneyMedium: 'font-mono font-bold text-sm sm:text-base text-slate-900',
    moneySmall: 'font-mono font-semibold text-xs text-slate-800',
  },

  // Surfaces & Cards
  surfaces: {
    card: 'bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs transition-all',
    cardInteractive: 'bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm cursor-pointer transition-all',
    cardActive: 'bg-slate-900 text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-900 shadow-sm ring-2 ring-emerald-500/50 transition-all',
    tableHeader: 'border-b-2 border-slate-900 bg-slate-50 text-slate-700 uppercase text-[11px] font-bold',
    tableRow: 'hover:bg-slate-50/70 border-b border-slate-100 transition-colors',
  },

  // Buttons
  buttons: {
    primary: 'flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs min-h-[38px]',
    secondary: 'flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-xs min-h-[38px]',
    outline: 'flex items-center justify-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-xs transition-all min-h-[34px]',
    ghost: 'flex items-center justify-center space-x-1 text-slate-500 hover:text-slate-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-xs transition-all',
  },
};
