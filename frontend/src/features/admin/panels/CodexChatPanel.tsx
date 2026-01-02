
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore, useCodexAdminStore } from '../../../store';
import { useApi } from '../../../hooks/useApi';
import { HelpText, KNOWN_THEMES, SHARED_THEME_KEY, CONTEXT_PACK_TEMPLATES } from '../AdminUtils';

export default function CodexChatPanel() {
  const { api, apiStream, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const codex = useCodexAdminStore();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState(KNOWN_THEMES[0]);
  const [contextPacks, setContextPacks] = useState<any[]>([]);
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>([]);
  const [packForm, setPackForm] = useState<{ id?: string; name: string; themes: string; content: string; default: boolean }>({
    id: '',
    name: '',
    themes: '',
    content: '',
    default: false,
  });
  const [packTemplateId, setPackTemplateId] = useState<string>('');

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [running, setRunning] = useState(false);

  const selectedPackTemplate = useMemo(
    () => CONTEXT_PACK_TEMPLATES.find((t) => t.id === packTemplateId) || null,
    [packTemplateId]
  );

  useEffect(() => {
    try {
      const shared = localStorage.getItem(SHARED_THEME_KEY);
      if (shared) setTheme(shared);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const prefill = localStorage.getItem('pukaist-codex-prefill');
      if (prefill) {
        setInput(prefill);
        localStorage.removeItem('pukaist-codex-prefill');
        setBanner('Prefilled from document');
      }
    } catch {
      // ignore
    }
  }, [setBanner]);

  useEffect(() => {
    try {
      if (theme) localStorage.setItem(SHARED_THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const envOverrides = useMemo(
    () => ({
      PUKAIST_CODEX_PROFILE: codex.codexProfile,
      PUKAIST_CODEX_MODEL: codex.codexModel,
      PUKAIST_CODEX_EXEC_FLAGS: codex.codexExecFlags,
      PUKAIST_CODEX_LOG_EVENTS: codex.codexLogEvents ? '1' : '',
      PUKAIST_CODEX_LOG_DIR: codex.codexLogDir,
    }),
    [codex]
  );

  const loadChats = useCallback(async () => {
    if (!useLiveApi) return;
    try {
      const data = await api<{ chats: any[] }>('/admin/codex/chats');
      setChats(data.chats || []);
      if (!selectedChatId && data.chats?.length) {
        setSelectedChatId(data.chats[0].id);
      }
    } catch (err) {
      setBanner(`Chats load failed: ${(err as Error).message}`);
    }
  }, [api, selectedChatId, setBanner, useLiveApi]);

  const loadPacks = useCallback(async () => {
    if (!useLiveApi) return;
    try {
      const data = await api<{ packs: any[] }>('/admin/codex/context-packs');
      setContextPacks(data.packs || []);
    } catch (err) {
      setBanner(`Context packs load failed: ${(err as Error).message}`);
    }
  }, [api, setBanner, useLiveApi]);

  const loadChat = useCallback(
    async (id: string) => {
      if (!useLiveApi) return;
      try {
        const data = await api<{ chat: any }>(`/admin/codex/chats/${encodeURIComponent(id)}`);
        const chat = data.chat || {};
        setMessages((chat.messages || []).map((m: any) => ({ role: m.role, content: m.content })));
        if (chat.theme) setTheme(chat.theme);
        setTitle(chat.title || '');
        setSelectedPackIds(chat.context_pack_ids || []);
      } catch (err) {
        setBanner(`Chat load failed: ${(err as Error).message}`);
      }
    },
    [api, setBanner, useLiveApi]
  );

  useEffect(() => {
    void loadChats();
    void loadPacks();
  }, [loadChats, loadPacks]);

  useEffect(() => {
    if (selectedChatId) void loadChat(selectedChatId);
  }, [selectedChatId, loadChat]);

  const createChat = async () => {
    if (!useLiveApi) return;
    try {
      const res = await api<{ chat: any }>('/admin/codex/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          title: title || `Chat ${new Date().toLocaleString()}`,
          context_pack_ids: selectedPackIds,
        }),
      });
      const chat = res.chat;
      setSelectedChatId(chat.id);
      await loadChats();
      setBanner('Chat created');
    } catch (err) {
      setBanner(`Create chat failed: ${(err as Error).message}`);
    }
  };

  const saveChatMeta = async () => {
    if (!useLiveApi || !selectedChatId) return;
    try {
      await api(`/admin/codex/chats/${encodeURIComponent(selectedChatId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, theme, context_pack_ids: selectedPackIds }),
      });
      await loadChats();
      setBanner('Chat updated');
    } catch (err) {
      setBanner(`Update chat failed: ${(err as Error).message}`);
    }
  };

  const deleteChat = async () => {
    if (!useLiveApi || !selectedChatId) return;
    try {
      await api(`/admin/codex/chats/${encodeURIComponent(selectedChatId)}`, { method: 'DELETE' });
      setSelectedChatId(null);
      setMessages([]);
      await loadChats();
      setBanner('Chat deleted');
    } catch (err) {
      setBanner(`Delete chat failed: ${(err as Error).message}`);
    }
  };

  const togglePack = (pid: string) => {
    setSelectedPackIds((prev) => (prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]));
  };

  const savePack = async () => {
    if (!useLiveApi) return;
    try {
      const themesArr = packForm.themes
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const payload: any = {
        id: packForm.id || undefined,
        name: packForm.name,
        themes: themesArr,
        content: packForm.content,
        default: packForm.default,
      };
      await api('/admin/codex/context-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setPackForm({ id: '', name: '', themes: '', content: '', default: false });
      await loadPacks();
      setBanner('Context pack saved');
    } catch (err) {
      setBanner(`Save pack failed: ${(err as Error).message}`);
    }
  };

  const editPack = (p: any) => {
    setPackForm({
      id: p.id,
      name: p.name || '',
      themes: (p.themes || []).join(','),
      content: p.content || '',
      default: !!p.default,
    });
  };

  const deletePack = async (pid: string) => {
    if (!useLiveApi) return;
    try {
      await api(`/admin/codex/context-packs/${encodeURIComponent(pid)}`, { method: 'DELETE' });
      setSelectedPackIds((prev) => prev.filter((p) => p !== pid));
      await loadPacks();
      setBanner('Context pack deleted');
    } catch (err) {
      setBanner(`Delete pack failed: ${(err as Error).message}`);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    let chatId = selectedChatId;
    if (!chatId && useLiveApi) {
      try {
        const res = await api<{ chat: any }>('/admin/codex/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme, title: title || `Chat ${new Date().toLocaleString()}`, context_pack_ids: selectedPackIds }),
        });
        chatId = res.chat.id;
        setSelectedChatId(chatId);
        await loadChats();
      } catch (err) {
        setBanner(`Auto-create chat failed: ${(err as Error).message}`);
        return;
      }
    }
    if (!chatId) {
      setBanner('Create a chat first');
      return;
    }

    setMessages((m) => [...m, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    if (!useLiveApi) {
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = { role: 'assistant', content: 'Demo mode: Codex disabled.' };
        return next;
      });
      return;
    }
    setRunning(true);
    try {
      const resp = await apiStream(`/admin/codex/chats/${encodeURIComponent(chatId)}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, theme, context_pack_ids: selectedPackIds, env: envOverrides }),
      });
      const reader = resp.body?.getReader();
      if (!reader) throw new Error('No stream body');
      const decoder = new TextDecoder();
      let buffer = '';
      let acc = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const chunk = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          if (!chunk) continue;
          let ev = 'message';
          const dataLines: string[] = [];
          for (const ln of chunk.split('\n')) {
            if (ln.startsWith('event:')) ev = ln.slice(6).trim();
            else if (ln.startsWith('data:')) dataLines.push(ln.slice(5).trim());
          }
          const dataStr = dataLines.join('\n');
          let data: any = dataStr;
          try {
            data = JSON.parse(dataStr);
          } catch {
            // raw
          }
          if (ev === 'line' && data?.line) {
            acc += String(data.line) + '\n';
            setMessages((m) => {
              const next = [...m];
              const lastIdx = next.length - 1;
              if (lastIdx >= 0 && next[lastIdx].role === 'assistant') {
                next[lastIdx] = { role: 'assistant', content: (next[lastIdx].content || '') + String(data.line) + '\n' };
              }
              return next;
            });
          }
          if (ev === 'error') {
            setBanner(`Codex error: ${data?.error || dataStr}`);
          }
        }
      }
      await loadChats();
    } catch (err) {
      setBanner(`Codex chat failed: ${(err as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Codex Chat</h3>
          <div className="flex items-center gap-2">
            <select
              value={selectedChatId || ''}
              onChange={(e) => setSelectedChatId(e.target.value || null)}
              className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-xs"
            >
              <option value="">Select chat…</option>
              {chats.map((c) => (
                <option key={c.id} value={c.id}>
                  {(c.title || c.id).slice(0, 40)} {c.theme ? `(${c.theme})` : ''}
                </option>
              ))}
            </select>
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => void createChat()}>
              New chat
            </button>
            {selectedChatId && (
              <button className="btn btn-ghost btn-sm text-xs" onClick={() => void deleteChat()}>
                Delete
              </button>
            )}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-xs"
            >
              {KNOWN_THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value={theme}>{theme}</option>
            </select>
            <input
              className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-xs"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Theme"
            />
            <input
              className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-xs"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
            {selectedChatId && (
              <button className="btn btn-ghost btn-sm text-xs" onClick={() => void saveChatMeta()}>
                Save
              </button>
            )}
          </div>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: Codex chat disabled.</p>}
        <HelpText>
          A persistent chat thread backed by the Codex CLI. Use <span className="font-mono">Context Packs</span> for reusable instructions and templates.
        </HelpText>
        <div className="space-y-2 max-h-[65vh] overflow-auto">
          {messages.map((m, i) => (
            <div key={i} className={`glass p-3 text-xs whitespace-pre-wrap ${m.role === 'user' ? 'border-cyan-400/30' : ''}`}>
              <div className="text-[10px] text-white/50 mb-1">{m.role === 'user' ? 'You' : 'Codex'}</div>
              <div className="text-white/90">{m.content || (m.role === 'assistant' && running ? '…' : '')}</div>
            </div>
          ))}
          {messages.length === 0 && <div className="text-xs text-white/50">No messages yet.</div>}
        </div>
        <div className="mt-3 flex gap-2">
          <textarea
            className="input flex-1 min-h-[60px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Codex…"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <button className="btn btn-primary btn-sm self-end" disabled={running} onClick={() => void send()}>
            Send
          </button>
        </div>
        <div className="mt-1 text-[10px] text-white/40">Ctrl/Cmd+Enter to send.</div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Context Packs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass p-3 space-y-2">
            <div className="text-xs text-white/60">Apply to this chat</div>
            <div className="space-y-1 max-h-56 overflow-auto text-xs">
              {contextPacks.map((p) => (
                <label key={p.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedPackIds.includes(p.id)}
                    onChange={() => togglePack(p.id)}
                  />
                  <span className="text-white/80">
                    {p.name || p.id}
                    {p.themes?.length ? (
                      <span className="text-white/40 ml-1">({p.themes.join(',')})</span>
                    ) : null}
                    {p.default ? <span className="text-emerald-300 ml-1">default</span> : null}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm text-[10px] ml-auto"
                    onClick={() => editPack(p)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-[10px]"
                    onClick={() => void deletePack(p.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </label>
              ))}
              {contextPacks.length === 0 && (
                <div className="text-white/40">No packs yet.</div>
              )}
            </div>
            {selectedChatId && (
              <button className="btn btn-ghost btn-sm text-xs mt-2" onClick={() => void saveChatMeta()}>
                Save pack selection
              </button>
            )}
          </div>

          <div className="glass p-3 space-y-2">
            <div className="text-xs text-white/60">{packForm.id ? 'Edit pack' : 'New pack'}</div>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-white/60">Template (optional)</span>
              <div className="flex gap-2">
                <select
                  className="input flex-1"
                  value={packTemplateId}
                  onChange={(e) => setPackTemplateId(e.target.value)}
                >
                  <option value="">Custom</option>
                  {CONTEXT_PACK_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-ghost btn-sm text-[10px]"
                  type="button"
                  disabled={!selectedPackTemplate}
                  onClick={() => {
                    if (!selectedPackTemplate) return;
                    setPackForm((f) => ({
                      ...f,
                      name: f.name || selectedPackTemplate.name,
                      themes: f.themes || selectedPackTemplate.themes,
                      content: selectedPackTemplate.content,
                      default: selectedPackTemplate.default ?? f.default,
                    }));
                  }}
                >
                  Apply
                </button>
              </div>
              {selectedPackTemplate && <HelpText>{selectedPackTemplate.description}</HelpText>}
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-white/60">Name</span>
              <input
                className="input"
                value={packForm.name}
                onChange={(e) => setPackForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-white/60">Themes (comma separated)</span>
              <input
                className="input"
                value={packForm.themes}
                onChange={(e) => setPackForm((f) => ({ ...f, themes: e.target.value }))}
                placeholder="Land_Reduction_Trespass, Governance_Sovereignty"
              />
              <HelpText>Optional. Used for filtering and for default auto-include.</HelpText>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={packForm.default}
                onChange={(e) => setPackForm((f) => ({ ...f, default: e.target.checked }))}
              />
              <span className="text-white/70">Default for its themes</span>
            </label>
            <HelpText>
              Default packs are automatically included when you chat with a matching theme.
            </HelpText>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-white/60">Content</span>
              <textarea
                className="input min-h-[120px]"
                value={packForm.content}
                onChange={(e) => setPackForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Paste context/instructions here..."
              />
              <HelpText>This content is prepended to the chat prompt (acts like reusable instructions).</HelpText>
            </label>
            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm text-xs" onClick={() => void savePack()}>
                Save pack
              </button>
              <button
                className="btn btn-ghost btn-sm text-xs"
                onClick={() => setPackForm({ id: '', name: '', themes: '', content: '', default: false })}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
