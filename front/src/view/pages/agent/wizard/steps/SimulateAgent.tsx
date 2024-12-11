import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SimulateAgent({ agentConfig }) {
  const [simulationInput, setSimulationInput] = useState('')
  const [simulationResult, setSimulationResult] = useState('')

  const runSimulation = () => {
    // In a real application, this would run an actual simulation
    // For now, we'll just provide a mock response
    setSimulationResult(`Simulated response: The agent would handle "${simulationInput}" based on the configured intents and policies.`)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Simulate Agent Behavior</h2>
      <div className="space-y-4">
        <Input
          placeholder="Enter a test scenario"
          value={simulationInput}
          onChange={(e) => setSimulationInput(e.target.value)}
          className="border-gray-300 focus:border-black focus:ring-black"
        />
        <Button onClick={runSimulation} className="bg-black text-white hover:bg-gray-800">
          Run Simulation
        </Button>
      </div>
      {simulationResult && (
        <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 mt-4">
          <p className="text-black">{simulationResult}</p>
        </div>
      )}
    </div>
  )
}

