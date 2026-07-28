import { useWorkspace } from '@/features/workspace/workspace-provider';
import { AISettingsForm } from './ai-settings-form';
import { WidgetChatPanel } from '@/features/chat-widget/components/widget-chat-panel';

export function AISettingsPage() {
  const { workspace } = useWorkspace();

  if (!workspace) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure how SupportAI talks to your customers, then try it out live.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AISettingsForm workspaceId={workspace.id} />
        <WidgetChatPanel workspaceSlug={workspace.slug} />
      </div>
    </div>
  );
}
