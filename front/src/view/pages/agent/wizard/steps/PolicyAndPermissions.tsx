import { useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const policies = [
  { service: 'Slack', action: 'Respond to simple queries', askConfirmation: false },
  { service: 'Slack', action: 'Escalate to Zendesk', askConfirmation: true },
  { service: 'Zendesk', action: 'Create tickets', askConfirmation: false },
  { service: 'Zendesk', action: 'Assign tickets', askConfirmation: true },
  { service: 'Jira', action: 'Monitor tickets', askConfirmation: false },
  { service: 'Jira', action: 'Send reminders', askConfirmation: true },
]

export default function PolicyAndPermissions({ updateConfig }) {
  const [policySettings, setPolicySettings] = useState(policies)

  const handlePolicyChange = (index) => {
    const updatedSettings = [...policySettings]
    updatedSettings[index].askConfirmation = !updatedSettings[index].askConfirmation
    setPolicySettings(updatedSettings)
    updateConfig({ policies: updatedSettings })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Policy and Permissions</h2>
      <p className="text-black">What should the agent do automatically, and when should it ask for confirmation?</p>
      {policySettings.map((policy, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Checkbox
            id={`policy-${index}`}
            checked={!policy.askConfirmation}
            onCheckedChange={() => handlePolicyChange(index)}
            className="border-gray-300 text-black focus:ring-black"
          />
          <Label htmlFor={`policy-${index}`} className="text-black">
            {policy.service}: {policy.action} (
            {policy.askConfirmation ? 'Ask for confirmation' : 'Autonomous'}
            )
          </Label>
        </div>
      ))}
    </div>
  )
}

