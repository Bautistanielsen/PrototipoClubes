import { answerHinchaAssistant } from './hinchaAssistant';
import type { HinchaAssistantContext, HinchaAssistantReply } from './hinchaAssistant';

export type HinchaAssistantService = (
  question: string,
  context: HinchaAssistantContext,
) => Promise<HinchaAssistantReply>;

export const localHinchaAssistantService: HinchaAssistantService = async (question, context) => answerHinchaAssistant(question, context);
