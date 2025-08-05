"use client";

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { AgentProvider } from '@/contexts/agent-context'
import { AuthProvider } from '@/components/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Bot } from 'lucide-react'

interface Agent {
  id: string;
  name: string;
  phone: number | null;
  system_prompt: string | null;
  model: string | null;
  created_at: string;
  updated_at: string | null;
}

function AgentList() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch agents from database
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching agents:', error);
        } else {
          setAgents(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleAgentClick = (agentId: string) => {
    router.push(`/agent?id=${agentId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground text-lg">Memuat agent...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Halo, {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User"}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Pilih agent yang ingin Anda gunakan untuk memulai percakapan.
        </p>
      </div>

      {agents.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground text-lg">Tidak ada agent tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <Card 
              key={agent.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105 transform"
              onClick={() => handleAgentClick(agent.id)}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Bot className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-xl">{agent.name || 'Unnamed Agent'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                   {agent.phone && (
                     <p><span className="font-medium">Phone:</span> {agent.phone.toString()}</p>
                   )}
                   {agent.model && (
                     <p><span className="font-medium">Model:</span> {agent.model}</p>
                   )}
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AgentProvider>
        <AgentList />
      </AgentProvider>
    </AuthProvider>
  );
}
