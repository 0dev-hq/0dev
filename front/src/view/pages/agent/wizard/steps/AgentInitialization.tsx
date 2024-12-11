import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AgentInitialization({ updateConfig }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleChange = () => {
    updateConfig({ name, description })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Agent Initialization</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="agent-name" className="text-black">Agent Name</Label>
          <Input
            id="agent-name"
            placeholder="CustomerSupportBot"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              handleChange()
            }}
            className="border-gray-300 focus:border-black focus:ring-black"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agent-description" className="text-black">Description</Label>
          <Textarea
            id="agent-description"
            placeholder="An agent that assists with Slack queries, manages Zendesk tickets, and monitors Jira issues."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              handleChange()
            }}
            className="border-gray-300 focus:border-black focus:ring-black"
          />
        </div>
      </div>
    </div>
  )
}

