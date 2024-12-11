'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Plus, Info, CheckCircle, AlertCircle } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Mock data for actions
const allActions = [
  { 
    id: 1, 
    name: 'Send message', 
    service: 'Slack', 
    tags: ['communication'],
    description: 'Send a message to a Slack channel or user.',
    inputs: ['channel', 'message'],
    outputs: ['messageId', 'timestamp'],
    creator: 'Official'
  },
  { 
    id: 2, 
    name: 'Create ticket', 
    service: 'Zendesk', 
    tags: ['support'],
    description: 'Create a new support ticket in Zendesk.',
    inputs: ['subject', 'description', 'priority'],
    outputs: ['ticketId', 'ticketUrl'],
    creator: 'Official'
  },
  { 
    id: 3, 
    name: 'Assign issue', 
    service: 'Jira', 
    tags: ['project management'],
    description: 'Assign a Jira issue to a team member.',
    inputs: ['issueId', 'assigneeId'],
    outputs: ['success', 'assignedTo'],
    creator: 'Official'
  },
  { 
    id: 4, 
    name: 'Post update', 
    service: 'Slack', 
    tags: ['communication'],
    description: 'Post an update to a Slack channel.',
    inputs: ['channel', 'message'],
    outputs: ['messageId', 'timestamp'],
    creator: 'Official'
  },
  { 
    id: 5, 
    name: 'Close ticket', 
    service: 'Zendesk', 
    tags: ['support'],
    description: 'Close an existing support ticket in Zendesk.',
    inputs: ['ticketId', 'resolution'],
    outputs: ['success', 'closedAt'],
    creator: 'Official'
  },
  { 
    id: 6, 
    name: 'Create sprint', 
    service: 'Jira', 
    tags: ['project management'],
    description: 'Create a new sprint in a Jira project.',
    inputs: ['projectId', 'sprintName', 'startDate', 'endDate'],
    outputs: ['sprintId', 'sprintUrl'],
    creator: 'Official'
  },
]

const allTags = [...new Set(allActions.flatMap(action => action.tags))]
const allServices = [...new Set(allActions.map(action => action.service))]

export default function AllowedActions({ config, updateConfig }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [selectedService, setSelectedService] = useState('all')
  const [filteredActions, setFilteredActions] = useState(allActions)
  const [selectedAction, setSelectedAction] = useState(null)

  useEffect(() => {
    const filtered = allActions.filter(action => 
      action.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedTag === 'all' || action.tags.includes(selectedTag)) &&
      (selectedService === 'all' || action.service === selectedService)
    )
    setFilteredActions(filtered)
  }, [searchTerm, selectedTag, selectedService])

  const addAction = (action) => {
    if (!config.selectedActions.find(a => a.id === action.id)) {
      updateConfig({ selectedActions: [...config.selectedActions, action] })
    }
  }

  const removeAction = (actionId) => {
    updateConfig({ selectedActions: config.selectedActions.filter(a => a.id !== actionId) })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Allowed Actions</h2>
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Actions</TabsTrigger>
          <TabsTrigger value="selected">Selected Actions</TabsTrigger>
        </TabsList>
        <TabsContent value="browse" className="mt-6">
          <div className="flex space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search actions"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All services</option>
              {allServices.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredActions.map(action => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{action.name}</span>
                        {config.selectedActions.find(a => a.id === action.id) ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : null}
                      </CardTitle>
                      <CardDescription>{action.service}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-2">{action.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {action.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="mt-auto">
                      <div className="flex justify-between w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAction(action)}
                        >
                          <Info className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        {config.selectedActions.find(a => a.id === action.id) ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeAction(action.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => addAction(action)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
        <TabsContent value="selected" className="mt-6">
          <ScrollArea className="h-[600px] rounded-md border p-4">
            {config.selectedActions.map(action => (
              <Card key={action.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{action.name}</CardTitle>
                  <CardDescription>{action.service}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">{action.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {action.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAction(action.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      {selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedAction.name}</span>
                <Badge variant="outline">{selectedAction.creator}</Badge>
              </CardTitle>
              <CardDescription>{selectedAction.service}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{selectedAction.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Inputs:</h4>
                  <ul className="list-disc list-inside">
                    {selectedAction.inputs.map(input => (
                      <li key={input}>{input}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Outputs:</h4>
                  <ul className="list-disc list-inside">
                    {selectedAction.outputs.map(output => (
                      <li key={output}>{output}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedAction(null)}
              >
                Close
              </Button>
              {config.selectedActions.find(a => a.id === selectedAction.id) ? (
                <Button
                  variant="destructive"
                  onClick={() => {
                    removeAction(selectedAction.id)
                    setSelectedAction(null)
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => {
                    addAction(selectedAction)
                    setSelectedAction(null)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

