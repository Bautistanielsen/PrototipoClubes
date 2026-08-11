import { answerSportsAssistant } from './sportsAssistant';
import type { SportsAssistantContext, SportsAssistantReply } from './sportsAssistant';

export type SportsAssistantService = (
  question: string,
  context: SportsAssistantContext,
) => Promise<SportsAssistantReply>;

export const localSportsAssistantService: SportsAssistantService = async (question, context) => answerSportsAssistant(question, context);
