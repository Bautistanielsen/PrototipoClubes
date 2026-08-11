// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProvider, useApp } from '../state/AppContext';
import type { SportsAssistantReply } from '../lib/sportsAssistant';
import type { SportsAssistantService } from '../lib/sportsAssistantService';
import SportsAssistant from './SportsAssistant';

const PRIMARY_TEAM = { id: 10, nombre: 'Primera', disciplina: 'Fútbol' };
const RESERVE_TEAM = { id: 20, nombre: 'Reserva', disciplina: 'Fútbol' };

function seedSportsState(activeEquipoDeportivoId = PRIMARY_TEAM.id) {
  window.localStorage.setItem('club-formaciones-v1', JSON.stringify({
    version: 5,
    equiposDeportivos: [PRIMARY_TEAM, RESERVE_TEAM],
    jugadores: [],
    formaciones: [],
    selectedFormacionId: null,
    activeEquipoDeportivoId,
  }));
}

function SquadSwitchButton() {
  const { actions } = useApp();
  return <button type="button" onClick={() => actions.selectEquipoDeportivo(RESERVE_TEAM.id)}>Cambiar a Reserva</button>;
}

function renderAssistant(assistantService: SportsAssistantService, withSquadSwitch = false) {
  return render(<AppProvider><SportsAssistant assistantService={assistantService} />{withSquadSwitch && <SquadSwitchButton />}</AppProvider>);
}

function deferredReply() {
  let resolve: (reply: SportsAssistantReply) => void = () => undefined;
  const promise = new Promise<SportsAssistantReply>((next) => { resolve = next; });
  return { promise, resolve };
}

function resolvedService(text: string): SportsAssistantService {
  return async () => ({ intent: 'fallback', text });
}

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(Date.now()), 0));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe('SportsAssistant', () => {
  it('opens from the trigger and exposes the final assistant avatar', async () => {
    seedSportsState();
    const user = userEvent.setup();
    renderAssistant(resolvedService('Respuesta lista.'));

    const trigger = screen.getByRole('button', { name: 'Abrir ayudante de campo' });
    const avatar = screen.getByRole('img', { name: 'Avatar del ayudante de campo' });
    expect(avatar.getAttribute('src')).toContain('avatar-ayudante-campo-v4.webp');

    await user.click(trigger);

    expect(screen.getByRole('dialog', { name: 'Ayudante de campo' })).toBeTruthy();
  });

  it('shows pending state and renders the injected service response', async () => {
    seedSportsState();
    const pending = deferredReply();
    const assistantService: SportsAssistantService = () => pending.promise;
    const user = userEvent.setup();
    renderAssistant(assistantService);

    await user.click(screen.getByRole('button', { name: 'Abrir ayudante de campo' }));
    await user.type(screen.getByLabelText('Consultá al ayudante de campo'), 'Consulta de prueba');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(screen.getByRole('button', { name: 'Consultando…' }).getAttribute('disabled')).not.toBeNull();
    expect(screen.getByRole('log').getAttribute('aria-busy')).toBe('true');

    await act(async () => { pending.resolve({ intent: 'fallback', text: 'Respuesta controlada.' }); });

    expect(await screen.findByText('Respuesta controlada.')).toBeTruthy();
    expect(screen.getByRole('log').getAttribute('aria-busy')).toBe('false');
  });

  it('shows a graceful failure and lets the user retry', async () => {
    seedSportsState();
    let attempts = 0;
    const assistantService: SportsAssistantService = async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('Servicio no disponible');
      return { intent: 'fallback', text: 'Respuesta tras reintentar.' };
    };
    const user = userEvent.setup();
    renderAssistant(assistantService);

    await user.click(screen.getByRole('button', { name: 'Abrir ayudante de campo' }));
    const input = screen.getByLabelText('Consultá al ayudante de campo');
    await user.type(input, 'Primera consulta');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('No pude consultar los datos de Primera. Intentá nuevamente.')).toBeTruthy();
    expect((input as HTMLInputElement).disabled).toBe(false);

    await user.type(input, 'Segunda consulta');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('Respuesta tras reintentar.')).toBeTruthy();
    expect(attempts).toBe(2);
  });

  it('resets conversation and discards a pending response after changing squads', async () => {
    seedSportsState();
    const pending = deferredReply();
    const assistantService: SportsAssistantService = () => pending.promise;
    const user = userEvent.setup();
    renderAssistant(assistantService, true);

    await user.click(screen.getByRole('button', { name: 'Abrir ayudante de campo' }));
    await user.type(screen.getByLabelText('Consultá al ayudante de campo'), 'Consulta pendiente');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    await user.click(screen.getByRole('button', { name: 'Cambiar a Reserva' }));

    await waitFor(() => {
      expect(screen.getByText('Reserva · Demo local')).toBeTruthy();
      expect(screen.queryByText('Consulta pendiente')).toBeNull();
    });

    await act(async () => { pending.resolve({ intent: 'fallback', text: 'Respuesta obsoleta.' }); });

    await waitFor(() => expect(screen.queryByText('Respuesta obsoleta.')).toBeNull());
  });

  it('restores focus to the trigger when closed with Escape', async () => {
    seedSportsState();
    const user = userEvent.setup();
    renderAssistant(resolvedService('Respuesta lista.'));

    const trigger = screen.getByRole('button', { name: 'Abrir ayudante de campo' });
    await user.click(trigger);
    await user.keyboard('{Escape}');

    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
