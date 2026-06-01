export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-full ${
      active ? 'bg-emerald-950 text-emerald-400' : 'bg-gray-800 text-gray-500'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-500'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        value ? 'bg-emerald-600' : 'bg-gray-700'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
        value ? 'translate-x-4' : 'translate-x-1'
      }`} />
    </button>
  );
}
