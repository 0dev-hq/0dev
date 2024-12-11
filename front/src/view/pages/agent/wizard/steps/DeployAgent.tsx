import { Button } from "@/components/ui/button"

export default function DeployAgent({ agentConfig }) {
  const handleDeploy = () => {
    // In a real application, this would initiate the deployment process
    console.log('Deploying agent with configuration:', agentConfig)
    alert('Agent deployed successfully!')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Deploy Agent</h2>
      <p className="text-black">Review your configuration and deploy the agent.</p>
      <pre className="p-4 bg-gray-100 rounded-lg border border-gray-300 overflow-auto text-sm text-black">
        {JSON.stringify(agentConfig, null, 2)}
      </pre>
      <Button onClick={handleDeploy} className="bg-black text-white hover:bg-gray-800">
        Deploy Agent
      </Button>
    </div>
  )
}

