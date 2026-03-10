"use client";

interface Profile {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

interface TeamMemberPickerProps {
  members: Profile[];
  value: string | null;
  onChange: (id: string) => void;
  label?: string;
}

export default function TeamMemberPicker({ members, value, onChange, label = "Assign To" }: TeamMemberPickerProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
      >
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.full_name} ({m.role})
          </option>
        ))}
      </select>
    </div>
  );
}
