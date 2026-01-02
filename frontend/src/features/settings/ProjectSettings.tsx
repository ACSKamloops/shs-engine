/**
 * Project Settings Panel
 * Configure project intent: allowed extensions, prefilters, LLM mode limits
 * Per Master Plan sections 35, 37, 134
 */
import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks';
import { useAppStore } from '../../store';

interface ProjectIntent {
  allowed_exts: string[];
  prefilter_enabled: boolean;
  llm_mode: 'sync' | 'batch' | 'offline';
  llm_max_chars: number;
}

interface WhoAmI {
  tenant?: string;
  subject?: string;
  roles?: string[];
  is_admin?: boolean;
}

export function ProjectSettings() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  
  const [whoami, setWhoami] = useState<WhoAmI | null>(null);
  const [intent, setIntent] = useState<ProjectIntent>({
    allowed_exts: ['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg'],
    prefilter_enabled: true,
    llm_mode: 'sync',
    llm_max_chars: 8000,
  });
  const [loading, setLoading] = useState(false);

  // Load whoami
  const loadWhoami = useCallback(async () => {
    if (!useLiveApi) {
      setWhoami({ tenant: 'demo', subject: 'demo-user', roles: ['admin'], is_admin: true });
      return;
    }
    try {
      const data = await api<WhoAmI>('/whoami');
      setWhoami(data);
    } catch {
      setWhoami({ tenant: 'local', subject: 'anonymous', roles: ['viewer'], is_admin: false });
    }
  }, [api, useLiveApi]);

  useEffect(() => {
    void loadWhoami();
  }, [loadWhoami]);

  const isAdmin = whoami?.is_admin ?? whoami?.roles?.includes('admin') ?? false;

  const handleExtToggle = (ext: string) => {
    setIntent((prev) => ({
      ...prev,
      allowed_exts: prev.allowed_exts.includes(ext)
        ? prev.allowed_exts.filter((e) => e !== ext)
        : [...prev.allowed_exts, ext],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (useLiveApi) {
        await api('/project/intent', {
          method: 'PUT',
          body: JSON.stringify(intent),
        });
        setBanner('Project settings saved');
      } else {
        setBanner('Demo mode: Settings saved locally');
      }
    } catch {
      setBanner('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const allExts = ['pdf', 'docx', 'txt', 'doc', 'rtf', 'png', 'jpg', 'jpeg', 'tif', 'tiff', 'kmz', 'kml'];

  return (
    <div className="space-y-4">
      {/* User Info */}
      {whoami && (
        <div className="p-3 bg-slate-800/50 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Logged in as</p>
              <p className="text-sm font-medium text-white">{whoami.subject || 'Anonymous'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Tenant</p>
              <p className="text-sm font-medium text-cyan-400">{whoami.tenant || 'local'}</p>
            </div>
          </div>
          <div className="mt-2 flex gap-1 flex-wrap">
            {whoami.roles?.map((role) => (
              <span
                key={role}
                className={`text-xs px-2 py-0.5 rounded ${
                  role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-slate-300'
                }`}
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Allowed Extensions */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide">
          Allowed File Extensions
        </h4>
        <div className="flex flex-wrap gap-1">
          {allExts.map((ext) => (
            <button
              key={ext}
              type="button"
              onClick={() => isAdmin && handleExtToggle(ext)}
              disabled={!isAdmin}
              className={`px-2 py-1 text-xs rounded ${
                intent.allowed_exts.includes(ext)
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                  : 'bg-white/10 text-slate-400 border border-white/10'
              } ${isAdmin ? 'hover:bg-white/20 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
            >
              .{ext}
            </button>
          ))}
        </div>
      </div>

      {/* Prefilter Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white">Prefilter Enabled</p>
          <p className="text-xs text-slate-400">Skip low-quality files before LLM</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={intent.prefilter_enabled}
          onClick={() => isAdmin && setIntent((p) => ({ ...p, prefilter_enabled: !p.prefilter_enabled }))}
          disabled={!isAdmin}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            intent.prefilter_enabled ? 'bg-cyan-500' : 'bg-slate-600'
          } ${!isAdmin && 'opacity-60 cursor-not-allowed'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              intent.prefilter_enabled ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      {/* LLM Mode */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide">
          LLM Processing Mode
        </h4>
        <select
          value={intent.llm_mode}
          onChange={(e) => isAdmin && setIntent((p) => ({ ...p, llm_mode: e.target.value as 'sync' | 'batch' | 'offline' }))}
          disabled={!isAdmin}
          className="w-full bg-white/10 text-white text-sm px-3 py-2 rounded-lg border border-white/10 disabled:opacity-60"
        >
          <option value="sync">Sync (per-document)</option>
          <option value="batch">Batch (cost-optimized)</option>
          <option value="offline">Offline (no LLM calls)</option>
        </select>
      </div>

      {/* LLM Max Chars */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide">
          LLM Input Limit (chars)
        </h4>
        <input
          type="number"
          value={intent.llm_max_chars}
          onChange={(e) => isAdmin && setIntent((p) => ({ ...p, llm_max_chars: Number(e.target.value) }))}
          disabled={!isAdmin}
          className="w-full bg-white/10 text-white text-sm px-3 py-2 rounded-lg border border-white/10 disabled:opacity-60"
          min={1000}
          max={100000}
          step={1000}
        />
      </div>

      {/* Save Button */}
      {isAdmin ? (
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="w-full py-2 px-3 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : '💾 Save Project Settings'}
        </button>
      ) : (
        <p className="text-xs text-slate-500 text-center py-2">
          🔒 Admin role required to modify settings
        </p>
      )}
    </div>
  );
}
