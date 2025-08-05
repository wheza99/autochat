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
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(true)
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false)
  const [isEditingSystemPrompt, setIsEditingSystemPrompt] = useState(false)
  const [isEditingStats, setIsEditingStats] = useState(false)
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
      setIsEditingBasicInfo(true)
    }
  }

  const handleSaveBasicInfo = async () => {
    if (!selectedAgent) return
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .update({
          name: basicInfoForm.name,
          phone: basicInfoForm.phone ? Number(basicInfoForm.phone) : null,
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
      
      setIsEditingBasicInfo(false)
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    }
  }

  const handleEditSystemPrompt = () => {
    if (selectedAgent) {
      setSystemPromptForm(selectedAgent.system_prompt || '')
      setIsEditingSystemPrompt(true)
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
      
      setIsEditingSystemPrompt(false)
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
      setIsEditingStats(true)
    }
  }

  const handleSaveStats = async () => {
    // For now, this is just a placeholder since we don't have stats fields in database
    // In a real implementation, you would update the agent's status or other stats
    console.log('Stats saved:', statsForm)
    setIsEditingStats(false)
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
                  {!isEditingBasicInfo && (
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
                  )}
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isBasicInfoOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-2 py-2">
              {isEditingBasicInfo ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-xs">Name</Label>
                    <Input
                      id="edit-name"
                      value={basicInfoForm.name}
                      onChange={(e) => handleBasicInfoInputChange('name', e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone" className="text-xs">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={basicInfoForm.phone}
                      onChange={(e) => handleBasicInfoInputChange('phone', e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-model" className="text-xs">Model</Label>
                    <Select value={basicInfoForm.model} onValueChange={(value) => handleBasicInfoInputChange('model', value)}>
                      <SelectTrigger className="h-7 text-xs">
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
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={handleSaveBasicInfo}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setIsEditingBasicInfo(false)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
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
              )}
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
                  {!isEditingSystemPrompt && (
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
                  )}
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isSystemPromptOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="py-2">
              {isEditingSystemPrompt ? (
                <div className="space-y-3">
                  <Textarea
                    value={systemPromptForm}
                    onChange={(e) => setSystemPromptForm(e.target.value)}
                    placeholder="Enter system prompt instructions..."
                    className="min-h-[120px] font-mono text-xs"
                  />
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={handleSaveSystemPrompt}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setIsEditingSystemPrompt(false)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                agent.system_prompt ? (
                  <div className="bg-muted/50 rounded-lg p-2">
                    <pre className="text-xs whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">{agent.system_prompt}</pre>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No system prompt configured</p>
                )
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
                <div className="flex items-center space-x-2">
                  {!isEditingStats && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditStats()
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isStatsOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="py-2">
              {isEditingStats ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-status" className="text-xs">Status</Label>
                    <Select value={statsForm.status} onValueChange={(value) => handleStatsInputChange('status', value)}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={handleSaveStats}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setIsEditingStats(false)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
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
                    <div className="text-lg font-bold text-primary">{statsForm.status}</div>
                    <div className="text-xs text-muted-foreground">Status</div>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>


    </div>
  )
}