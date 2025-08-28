
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityContext } from '@/hooks/useSecurityContext';
import SecurityBoundary from './SecurityBoundary';
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  created_at: string;
}

const AuditLogViewer = () => {
  const { isAdmin } = useSecurityContext();

  const { data: auditLogs, isLoading, error } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: isAdmin
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rap-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading audit logs: {error.message}
      </div>
    );
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SecurityBoundary requireAdmin>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-rap-platinum mb-6">Security Audit Logs</h2>
        
        {auditLogs?.map((log) => (
          <Card key={log.id} className="bg-carbon-fiber border border-rap-gold/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-rap-platinum">
                  {log.table_name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getActionColor(log.action)}>
                    {log.action}
                  </Badge>
                  <span className="text-sm text-rap-silver">
                    {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-rap-silver">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>User ID:</strong> {log.user_id}
                </div>
                <div>
                  <strong>Record ID:</strong> {log.record_id}
                </div>
                {log.old_values && (
                  <div className="md:col-span-2">
                    <strong>Previous Values:</strong>
                    <pre className="bg-gray-800 p-2 rounded mt-1 overflow-x-auto text-xs">
                      {JSON.stringify(log.old_values, null, 2)}
                    </pre>
                  </div>
                )}
                {log.new_values && (
                  <div className="md:col-span-2">
                    <strong>New Values:</strong>
                    <pre className="bg-gray-800 p-2 rounded mt-1 overflow-x-auto text-xs">
                      {JSON.stringify(log.new_values, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {auditLogs?.length === 0 && (
          <Card className="bg-carbon-fiber border border-rap-gold/30">
            <CardContent className="text-center py-8 text-rap-silver">
              No audit logs found.
            </CardContent>
          </Card>
        )}
      </div>
    </SecurityBoundary>
  );
};

export default AuditLogViewer;
