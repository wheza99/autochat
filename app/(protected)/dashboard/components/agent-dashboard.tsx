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
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(false)
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [isBasicInfoDialogOpen, setIsBasicInfoDialogOpen] = useState(false)
  const [isSystemPromptDialogOpen, setIsSystemPromptDialogOpen] = useState(false)
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)
  const [basicInfoForm, setBasicInfoForm] = useState({
    name: '',
    phone: '',
    model: ''
  })
  const [systemPromptForm, setSystemPromptForm] = useState('')
  const [statsForm, setStatsForm] = useState({
    status: 'Active'
  })

  const handleEditBasicInfo = () => {
    if (selectedAgent) {
      setBasicInfoForm({
        name: selectedAgent.name || '',
        phone: selectedAgent.phone ? String(selectedAgent.phone) : '',
        model: selectedAgent.model || ''
      })
      setIsBasicInfoDialogOpen(true)
    }
  }

  const handleSaveBasicInfo = async () => {
    if (!selectedAgent) return
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .update({
          name: basicInfoForm.name,
          phone: basicInfoForm.phone || null,
          model: basicInfoForm.model,
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
      
      if (data) {
        updateAgent(data)
      }
      
      setIsBasicInfoDialogOpen(false)
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    }
  }

  const handleEditSystemPrompt = () => {
    if (selectedAgent) {
      setSystemPromptForm(selectedAgent.system_prompt || '')
      setIsSystemPromptDialogOpen(true)
    }
  }

  const handleSaveSystemPrompt = async () => {
    if (!selectedAgent) return
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .update({
          system_prompt: systemPromptForm,
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
      
      if (data) {
        updateAgent(data)
      }
      
      setIsSystemPromptDialogOpen(false)
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    }
  }

  const handleBasicInfoInputChange = (field: string, value: string) => {
    setBasicInfoForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEditStats = () => {
    if (selectedAgent) {
      setStatsForm({
        status: 'Active' // Default status since we don't have this field in database yet
      })
      setIsStatsDialogOpen(true)
    }
  }

  const handleSaveStats = async () => {
    // For now, this is just a placeholder since we don't have stats fields in database
    // In a real implementation, you would update the agent's status or other stats
    console.log('Stats saved:', statsForm)
    setIsStatsDialogOpen(false)
  }

  const handleStatsInputChange = (field: string, value: string) => {
    setStatsForm(prev => ({
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
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditBasicInfo()
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isBasicInfoOpen ? 'rotate-180' : ''}`} />
                </div>
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
                
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>Phone</span>
                  </label>
                  <p className="text-xs">{agent.phone || 'Not specified'}</p>
                </div>
                
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
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditSystemPrompt()
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isSystemPromptOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="py-2">
              {agent.system_prompt ? (
                <div className="bg-muted/50 rounded-lg p-3">
                  <pre className="text-xs whitespace-pre-wrap font-mono max-h-48 overflow-y-auto leading-relaxed">{agent.system_prompt}</pre>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No system prompt configured</p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Basic Information Dialog */}
      <Dialog open={isBasicInfoDialogOpen} onOpenChange={setIsBasicInfoDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Basic Information</DialogTitle>
            <DialogDescription>
              Update the basic information for this agent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={basicInfoForm.name}
                onChange={(e) => setBasicInfoForm(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={basicInfoForm.phone}
                onChange={(e) => setBasicInfoForm(prev => ({ ...prev, phone: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model
              </Label>
              <Select value={basicInfoForm.model} onValueChange={(value) => setBasicInfoForm(prev => ({ ...prev, model: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveBasicInfo}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* System Prompt Dialog */}
      <Dialog open={isSystemPromptDialogOpen} onOpenChange={setIsSystemPromptDialogOpen}>
        <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Edit System Prompt</DialogTitle>
            <DialogDescription>
              Configure the system prompt instructions for this agent.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 p-6 overflow-hidden">
            <Textarea
              value={systemPromptForm}
              onChange={(e) => setSystemPromptForm(e.target.value)}
              placeholder="Enter system prompt instructions..."
              className="w-full h-full font-mono text-sm resize-none border-0 focus:ring-0 focus:outline-none p-0 break-words overflow-wrap-anywhere overflow-y-auto"
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
            />
          </div>
          <DialogFooter className="px-6 py-4 border-t bg-gray-50/50">
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" onClick={() => setIsSystemPromptDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleSaveSystemPrompt}>
                Save changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Statistics Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Agent Statistics</DialogTitle>
            <DialogDescription>
              Update the status and configuration for this agent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={statsForm.status} onValueChange={(value) => setStatsForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveStats}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}