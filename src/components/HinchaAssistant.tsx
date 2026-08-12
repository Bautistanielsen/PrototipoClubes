import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { localHinchaAssistantService, type HinchaAssistantService } from '../lib/hinchaAssistantService';
import { readSportsCalendarData } from '../lib/sportsCalendar';
import { HOY_ISO } from '../lib/derive';
import assistantAvatar from '../assets/assistant/avatar-asistente-hincha.jpeg';

type ChatMessage = {
  id: number;
  author: 'assistant' | 'user';
  text: string;
};

export type HinchaAssistantProps = {
  assistantService?: HinchaAssistantService;
};

export default function HinchaAssistant({ assistantService = localHinchaAssistantService }: HinchaAssistantProps) {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const messageIdRef = useRef(0);
  const requestIdRef = useRef(0);
  const esSocio = state.portalRol === 'socio';
  const socio = state.socios[0];

  const suggestions = esSocio
    ? ['¿Cómo está mi cuota?', '¿Tengo reservas hechas?', '¿Hay novedades?', '¿Hay torneos abiertos?', '¿Cuándo es el próximo partido?']
    : ['¿Cómo me hago socio?', '¿Tengo reservas hechas?', '¿Hay novedades?', '¿Hay torneos abiertos?', '¿Cuándo es el próximo partido?'];

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
      socio,
      esSocio,
      reservas: state.reservas,
      torneos: state.torneos,
      inscripcionesTorneo: state.inscripcionesTorneo,
      comunicados: state.comunicados,
      comunicadosLeidos: state.comunicadosLeidos,
      equiposDeportivos: state.equiposDeportivos,
      calendar: readSportsCalendarData(),
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

  return <div className="hincha-assistant">
    {isOpen && <section id="hincha-assistant-panel" className="hincha-assistant-panel" role="dialog" aria-modal="false" aria-labelledby="hincha-assistant-title">
      <header className="hincha-assistant-header">
        <div className="hincha-assistant-identity"><div><strong id="hincha-assistant-title">Asistente del hincha</strong><span>{state.clubNombre} · Demo local</span></div></div>
        <button type="button" className="hincha-assistant-close" onClick={closePanel} aria-label="Cerrar asistente del hincha">×</button>
      </header>
      <p className="hincha-assistant-intro">Consultá tu cuota, tus reservas y las novedades del club. Las respuestas se generan en este navegador.</p>
      <div className="hincha-assistant-messages" role="log" aria-live="polite" aria-busy={isPending} aria-label="Conversación con el asistente del hincha">
        {!messages.length && <div className="hincha-assistant-message assistant">Hola{socio.nombre ? ', ' + socio.nombre : ''}. Estoy listo para contarte sobre tu cuota, tus reservas, novedades, torneos y partidos de {state.clubNombre}.</div>}
        {messages.map((message) => <div key={message.id} className={`hincha-assistant-message ${message.author}`}>{message.text}</div>)}
      </div>
      <div className="hincha-assistant-suggestions" aria-label="Consultas sugeridas">
        {suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => void ask(suggestion)} disabled={isPending}>{suggestion}</button>)}
      </div>
      <form className="hincha-assistant-form" onSubmit={submit}>
        <label className="hincha-assistant-sr-only" htmlFor="hincha-assistant-question">Consultá al asistente del hincha</label>
        <input ref={inputRef} id="hincha-assistant-question" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Escribí una consulta..." autoComplete="off" disabled={isPending} />
        <button type="submit" disabled={!query.trim() || isPending}>{isPending ? 'Consultando…' : 'Enviar'}</button>
      </form>
    </section>}
    <button ref={triggerRef} type="button" className="hincha-assistant-trigger" onClick={() => isOpen ? closePanel() : setIsOpen(true)} aria-label={isOpen ? 'Cerrar asistente del hincha' : 'Abrir asistente del hincha'} aria-expanded={isOpen} aria-controls="hincha-assistant-panel" data-tooltip="Asistente del hincha">
      <span className="hincha-assistant-trigger-icon"><img src={assistantAvatar} alt="Avatar del asistente del hincha" /></span>
    </button>
  </div>;
}
