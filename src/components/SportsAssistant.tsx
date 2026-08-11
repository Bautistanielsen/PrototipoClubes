import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { localSportsAssistantService, type SportsAssistantService } from '../lib/sportsAssistantService';
import { readSportsCalendarData } from '../lib/sportsCalendar';
import assistantAvatar from '../assets/assistant/avatar-ayudante-campo-v4.webp';

type ChatMessage = {
  id: number;
  author: 'assistant' | 'user';
  text: string;
};

export type SportsAssistantProps = {
  assistantService?: SportsAssistantService;
};

const SUGGESTIONS = [
  '¿Cuándo es el próximo partido?',
  '¿Qué actividades hay esta semana?',
  'Dame el resumen del equipo',
  '¿Cómo fueron los últimos resultados?',
  '¿Quién es el máximo goleador?',
  '¿Qué formaciones tenemos?',
  '¿Hay jugadores lesionados?',
];

export default function SportsAssistant({ assistantService = localSportsAssistantService }: SportsAssistantProps) {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const messageIdRef = useRef(0);
  const requestIdRef = useRef(0);
  const team = state.equiposDeportivos.find((item) => item.id === state.activeEquipoDeportivoId);
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
  }, [isOpen]);

  useEffect(() => {
    setMessages([]);
    setQuery('');
    setIsPending(false);
    requestIdRef.current += 1;
  }, [state.activeEquipoDeportivoId]);

  if (!team) return null;

  const ask = async (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isPending) return;

    const context = {
      team,
      players: state.jugadores,
      formations: state.formaciones,
      selectedFormationId: state.selectedFormacionId,
      calendar: readSportsCalendarData(),
      currentDateTime: new Date(),
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
      if (requestId === requestIdRef.current) setMessages((current) => [...current, { id: ++messageIdRef.current, author: 'assistant', text: `No pude consultar los datos de ${team.nombre}. Intentá nuevamente.` }]);
    } finally {
      if (requestId === requestIdRef.current) setIsPending(false);
    }
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(query);
  };

  return <div className="sports-assistant">
    {isOpen && <section id="sports-assistant-panel" className="sports-assistant-panel" role="dialog" aria-modal="false" aria-labelledby="sports-assistant-title">
      <header className="sports-assistant-header">
        <div className="sports-assistant-identity"><div><strong id="sports-assistant-title">Ayudante de campo</strong><span>{team.nombre} · Demo local</span></div></div>
        <button type="button" className="sports-assistant-close" onClick={closePanel} aria-label="Cerrar ayudante de campo">×</button>
      </header>
      <p className="sports-assistant-intro">Consultá la información registrada del plantel activo. Las respuestas se generan en este navegador.</p>
      <div className="sports-assistant-messages" role="log" aria-live="polite" aria-busy={isPending} aria-label="Conversación con el ayudante de campo">
        {!messages.length && <div className="sports-assistant-message assistant">Estoy listo para revisar la agenda, resultados, plantel y formaciones de {team.nombre}.</div>}
        {messages.map((message) => <div key={message.id} className={`sports-assistant-message ${message.author}`}>{message.text}</div>)}
      </div>
      <div className="sports-assistant-suggestions" aria-label="Consultas sugeridas">
        {SUGGESTIONS.map((suggestion) => <button type="button" key={suggestion} onClick={() => void ask(suggestion)} disabled={isPending}>{suggestion}</button>)}
      </div>
      <form className="sports-assistant-form" onSubmit={submit}>
        <label className="sports-assistant-sr-only" htmlFor="sports-assistant-question">Consultá al ayudante de campo</label>
        <input ref={inputRef} id="sports-assistant-question" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Escribí una consulta..." autoComplete="off" disabled={isPending} />
        <button type="submit" disabled={!query.trim() || isPending}>{isPending ? 'Consultando…' : 'Enviar'}</button>
      </form>
    </section>}
    <button ref={triggerRef} type="button" className="sports-assistant-trigger" onClick={() => isOpen ? closePanel() : setIsOpen(true)} aria-label={isOpen ? 'Cerrar ayudante de campo' : 'Abrir ayudante de campo'} aria-expanded={isOpen} aria-controls="sports-assistant-panel" data-tooltip="Ayudante de campo">
      <span className="sports-assistant-trigger-icon"><img src={assistantAvatar} alt="Avatar del ayudante de campo" /></span>
    </button>
  </div>;
}
