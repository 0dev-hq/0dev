import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DefineIntents({ updateConfig }) {
  const [intents, setIntents] = useState([''])

  const handleIntentChange = (index, value) => {
    const updatedIntents = [...intents]
    updatedIntents[index] = value
    setIntents(updatedIntents)
    updateConfig({ intents: updatedIntents })
  }

  const addIntent = () => {
    setIntents([...intents, ''])
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Define Intents</h2>
      <p className="text-black">What tasks should this agent handle?</p>
      {intents.map((intent, index) => (
        <div key={index} className="space-y-2">
          <Label htmlFor={`intent-${index}`} className="text-black">Intent {index + 1}</Label>
          <Input
            id={`intent-${index}`}
            value={intent}
            onChange={(e) => handleIntentChange(index, e.target.value)}
            placeholder={`e.g., Respond to Slack messages mentioning "support"`}
            className="border-gray-300 focus:border-black focus:ring-black"
          />
        </div>
      ))}
      <Button onClick={addIntent} className="bg-black text-white hover:bg-gray-800">Add Intent</Button>
    </div>
  )
}

