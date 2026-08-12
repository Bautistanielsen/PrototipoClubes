import { answerAdminAssistant } from './adminAssistant';
import type { AdminAssistantContext, AdminAssistantReply } from './adminAssistant';

export type AdminAssistantService = (
  question: string,
  context: AdminAssistantContext,
) => Promise<AdminAssistantReply>;

export const localAdminAssistantService: AdminAssistantService = async (question, context) => answerAdminAssistant(question, context);
