
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import AgentInitialization from './steps/AgentInitialization'
import ServiceIntegration from './steps/ServiceIntegration'
import DefineIntents from './steps/DefineIntents'
import PolicyAndPermissions from './steps/PolicyAndPermissions'
import SimulateAgent from './steps/SimulateAgent'
import DeployAgent from './steps/DeployAgent'
import AllowedActions from './steps/AllowedActions'

const steps = [
  'Agent Initialization',
  'Allowed Actions',
  'Service Integration',
  'Define Intents',
  'Policy and Permissions',
  'Simulate Agent',
  'Deploy Agent'
]

export default function AgentWizardPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    description: '',
    selectedActions: [],
    services: [],
    intents: [],
    policies: [],
  })

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateConfig = (newData: Partial<typeof agentConfig>) => {
    setAgentConfig({ ...agentConfig, ...newData })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <AgentInitialization config={agentConfig} updateConfig={updateConfig} />
      case 1:
        return <AllowedActions config={agentConfig} updateConfig={updateConfig} />
      case 2:
        return <ServiceIntegration config={agentConfig} updateConfig={updateConfig} />
      case 3:
        return <DefineIntents config={agentConfig} updateConfig={updateConfig} />
      case 4:
        return <PolicyAndPermissions config={agentConfig} updateConfig={updateConfig} />
      case 5:
        return <SimulateAgent config={agentConfig} />
      case 6:
        return <DeployAgent config={agentConfig} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl border-black shadow-lg">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-3xl font-bold text-black">Agent Configuration Wizard</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`text-sm font-medium ${
                    index <= currentStep ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  {step}
                </motion.div>
              ))}
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-black"
                ></motion.div>
              </div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-200 pt-4">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
            className="text-black border-black hover:bg-gray-100"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="bg-black text-white hover:bg-gray-800"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
