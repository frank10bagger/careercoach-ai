import { createClient } from '@/lib/supabase/server';

// Append a row to ai_audit_log. Captures every AI call for governance.
export async function logAiCall(opts: {
  userId: string;
  feature: string;
  promptSummary: string;
  outputSummary: string;
  wasMocked: boolean;
}) {
  try {
    const supabase = await createClient();
    await supabase.from('ai_audit_log').insert({
      user_id: opts.userId,
      feature: opts.feature,
      prompt_summary: opts.promptSummary.slice(0, 500),
      output_summary: opts.outputSummary.slice(0, 500),
      was_mocked: opts.wasMocked,
    });
  } catch (err) {
    console.error('audit log insert failed', err);
  }
}
