"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Bot, Calendar, Phone, Settings, MessageSquare, Edit, Save, X } from "lucide-react"
import { useAgent } from "@/contexts/agent-context"
import { supabase } from "@/lib/supabase"

export function AgentDashboard() {
  const { selectedAgent, updateAgent } = useAgent()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    model: '',
    system_prompt: ''
  })

  const handleEditClick = () => {
    if (selectedAgent) {
      setEditForm({
        name: selectedAgent.name || '',
        phone: selectedAgent.phone ? String(selectedAgent.phone) : '',
        model: selectedAgent.model || '',
        system_prompt: selectedAgent.system_prompt || ''
      })
      setIsEditDialogOpen(true)
    }
  }

  const handleSaveChanges = async () => {
    if (!selectedAgent) return
    
    try {
      // Update agent in Supabase database
      const { data, error } = await supabase
        .from('agents')
        .update({
          name: editForm.name,
          phone: editForm.phone ? Number(editForm.phone) : null,
          model: editForm.model,
          system_prompt: editForm.system_prompt,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAgent.id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating agent:', error)
        alert('Gagal menyimpan perubahan. Silakan coba lagi.')
        return
      }
      
      // Update the agent data in context with the response from database
      if (data) {
        updateAgent(data)
      }
      
      console.log('Changes saved to database:', data)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!selectedAgent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Select an Agent</h2>
          <p className="text-muted-foreground">Choose an agent from the sidebar to view its details</p>
        </div>
      </div>
    )
  }

  const agent = selectedAgent

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{agent.name || 'Unnamed Agent'}</h1>
            <p className="text-muted-foreground">Agent ID: {agent.id}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-2"
          onClick={handleEditClick}
        >
          <Edit className="h-4 w-4" />
          <span>Edit Agent</span>
        </Button>
      </div>

      <Separator />

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
          <CardDescription>
            Core details about this agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="text-sm">{agent.name || 'Not specified'}</p>
          </div>
          
          {agent.phone && (
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>Phone</span>
              </label>
              <p className="text-sm">{agent.phone}</p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Model</label>
            <div className="mt-1">
              {agent.model ? (
                <Badge variant="secondary">{agent.model}</Badge>
              ) : (
                <span className="text-sm text-muted-foreground">Not specified</span>
              )}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Created</span>
            </label>
            <p className="text-sm">{new Date(agent.created_at).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          {agent.updated_at && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm">{new Date(agent.updated_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>System Prompt</span>
          </CardTitle>
          <CardDescription>
            Instructions and behavior configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agent.system_prompt ? (
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono">{agent.system_prompt}</pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No system prompt configured</p>
          )}
        </CardContent>
      </Card>

      {/* Statistics or Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Statistics</CardTitle>
          <CardDescription>
            Performance and usage metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Total Conversations</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Messages Sent</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">Active</div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Edit Agent</span>
            </DialogTitle>
            <DialogDescription>
              Update the agent information and configuration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>
              
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter agent name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={editForm.model} onValueChange={(value) => handleInputChange('model', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* System Prompt */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">System Prompt</h4>
              <div className="space-y-2">
                <Label htmlFor="system_prompt">Instructions and Behavior</Label>
                <Textarea
                  id="system_prompt"
                  value={editForm.system_prompt}
                  onChange={(e) => handleInputChange('system_prompt', e.target.value)}
                  placeholder="Enter system prompt instructions..."
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
            <Button 
              onClick={handleSaveChanges}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}