import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { localAdminAssistantService, type AdminAssistantService } from '../lib/adminAssistantService';
import { HOY_ISO } from '../lib/derive';
import assistantAvatar from '../assets/assistant/avatar-asistente-admin.jpeg';

type ChatMessage = {
  id: number;
  author: 'assistant' | 'user';
  text: string;
};

export type AdminAssistantProps = {
  assistantService?: AdminAssistantService;
};

const SUGGESTIONS = [
  '¿Cuántos socios tenemos?',
  '¿Cuánto se cobró hoy?',
  '¿Cómo venimos de balance este mes?',
  '¿Cuál es el mayor gasto?',
  '¿Hay stock bajo?',
  '¿Hay turnos libres hoy?',
  '¿Cuál fue el último comunicado?',
];

export default function AdminAssistant({ assistantService = localAdminAssistantService }: AdminAssistantProps) {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const messageIdRef = useRef(0);
  const requestIdRef = useRef(0);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [closePanel, isOpen]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) closePanel();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, closePanel]);

  const ask = async (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isPending) return;

    const context = {
      clubNombre: state.clubNombre,
      socios: state.socios,
      categorias: state.categorias,
      pagosHoy: state.pagosHoy,
      egresos: state.egresos,
      reservas: state.reservas,
      canchas: state.canchas,
      ventasShop: state.ventasShop,
      ventasBuffet: state.ventasBuffet,
      inscripcionesTorneo: state.inscripcionesTorneo,
      productosBuffet: state.productosBuffet,
      productosShop: state.productosShop,
      comunicados: state.comunicados,
      sponsors: state.sponsors,
      hoyIso: HOY_ISO,
    };
    const requestId = ++requestIdRef.current;
    setMessages((current) => [
      ...current,
      { id: ++messageIdRef.current, author: 'user', text: trimmedQuestion },
    ]);
    setQuery('');
    setIsPending(true);
    try {
      const reply = await assistantService(trimmedQuestion, context);
      if (requestId === requestIdRef.current) setMessages((current) => [...current, { id: ++messageIdRef.current, author: 'assistant', text: reply.text }]);
    } catch {
      if (requestId === requestIdRef.current) setMessages((current) => [...current, { id: ++messageIdRef.current, author: 'assistant', text: `No pude consultar los datos de ${state.clubNombre}. Intentá nuevamente.` }]);
    } finally {
      if (requestId === requestIdRef.current) setIsPending(false);
    }
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(query);
  };

  return <div className="admin-assistant">
    {isOpen && <section id="admin-assistant-panel" className="admin-assistant-panel" role="dialog" aria-modal="false" aria-labelledby="admin-assistant-title">
      <header className="admin-assistant-header">
        <div className="admin-assistant-identity"><div><strong id="admin-assistant-title">Asistente administrativo</strong><span>{state.clubNombre} · Demo local</span></div></div>
        <button type="button" className="admin-assistant-close" onClick={closePanel} aria-label="Cerrar asistente administrativo">×</button>
      </header>
      <p className="admin-assistant-intro">Consultá la información registrada del club. Las respuestas se generan en este navegador.</p>
      <div className="admin-assistant-messages" role="log" aria-live="polite" aria-busy={isPending} aria-label="Conversación con el asistente administrativo">
        {!messages.length && <div className="admin-assistant-message assistant">Estoy listo para revisar socios, cobranza, finanzas, stock, canchas y comunicados de {state.clubNombre}.</div>}
        {messages.map((message) => <div key={message.id} className={`admin-assistant-message ${message.author}`}>{message.text}</div>)}
      </div>
      <div className="admin-assistant-suggestions" aria-label="Consultas sugeridas">
        {SUGGESTIONS.map((suggestion) => <button type="button" key={suggestion} onClick={() => void ask(suggestion)} disabled={isPending}>{suggestion}</button>)}
      </div>
      <form className="admin-assistant-form" onSubmit={submit}>
        <label className="admin-assistant-sr-only" htmlFor="admin-assistant-question">Consultá al asistente administrativo</label>
        <input ref={inputRef} id="admin-assistant-question" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Escribí una consulta..." autoComplete="off" disabled={isPending} />
        <button type="submit" disabled={!query.trim() || isPending}>{isPending ? 'Consultando…' : 'Enviar'}</button>
      </form>
    </section>}
    <button ref={triggerRef} type="button" className="admin-assistant-trigger" onClick={() => isOpen ? closePanel() : setIsOpen(true)} aria-label={isOpen ? 'Cerrar asistente administrativo' : 'Abrir asistente administrativo'} aria-expanded={isOpen} aria-controls="admin-assistant-panel" data-tooltip="Asistente administrativo">
      <span className="admin-assistant-trigger-icon"><img src={assistantAvatar} alt="Avatar del asistente administrativo" /></span>
    </button>
  </div>;
}
