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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Bot, Calendar, Phone, Settings, MessageSquare, Edit, Save, X, ChevronDown } from "lucide-react"
import { useAgent } from "@/contexts/agent-context"
import { supabase } from "@/lib/supabase"

export function AgentDashboard() {
  const { selectedAgent, updateAgent } = useAgent()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(true)
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
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
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-1">Select an Agent</h2>
          <p className="text-sm text-muted-foreground">Choose an agent from the sidebar</p>
        </div>
      </div>
    )
  }

  const agent = selectedAgent

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold truncate">{agent.name || 'Unnamed Agent'}</h1>
            <p className="text-xs text-muted-foreground truncate">ID: {agent.id.slice(0, 8)}...</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-1"
          onClick={handleEditClick}
        >
          <Edit className="h-3 w-3" />
          <span className="text-xs">Edit</span>
        </Button>
      </div>

      <Separator />

      {/* Basic Information */}
      <Collapsible open={isBasicInfoOpen} onOpenChange={setIsBasicInfoOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Basic Information</span>
                </div>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isBasicInfoOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-2 py-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                  <p className="text-xs truncate">{agent.name || 'Not specified'}</p>
                </div>
                
                {agent.phone && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>Phone</span>
                    </label>
                    <p className="text-xs">{agent.phone}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Model</label>
                  <div className="mt-0.5">
                    {agent.model ? (
                      <Badge variant="secondary" className="text-xs px-1 py-0">{agent.model}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not specified</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created</span>
                  </label>
                  <p className="text-xs">{new Date(agent.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* System Prompt */}
      <Collapsible open={isSystemPromptOpen} onOpenChange={setIsSystemPromptOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>System Prompt</span>
                </div>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isSystemPromptOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="py-2">
              {agent.system_prompt ? (
                <div className="bg-muted/50 rounded-lg p-2">
                  <pre className="text-xs whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">{agent.system_prompt}</pre>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No system prompt configured</p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Statistics or Additional Info */}
      <Collapsible open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Agent Statistics</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isStatsOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="py-2">
              <div className="grid gap-2 grid-cols-3">
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-primary">0</div>
                  <div className="text-xs text-muted-foreground">Conversations</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-primary">0</div>
                  <div className="text-xs text-muted-foreground">Messages</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-primary">Active</div>
                  <div className="text-xs text-muted-foreground">Status</div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

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