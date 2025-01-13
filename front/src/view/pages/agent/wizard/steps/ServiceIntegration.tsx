'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, AlertCircle } from 'lucide-react'

const services = ['Slack', 'Zendesk', 'Jira']

// todo: use this for the agent with fixed actions/tools

export default function ServiceIntegration({ config, updateConfig }) {
  const [integrationStatus, setIntegrationStatus] = useState({})

  useEffect(() => {
    const requiredServices = [...new Set(config.selectedActions.map(action => action.service))]
    const status = {}
    requiredServices.forEach(service => {
      status[service] = config.services.includes(service) ? 'authenticated' : 'required'
    })
    setIntegrationStatus(status)
  }, [config.selectedActions, config.services])

  const handleAuthenticate = (service) => {
    // In a real application, this would initiate the OAuth flow
    console.log(`Authenticating with ${service}`)
    // Simulating successful authentication
    setTimeout(() => {
      setIntegrationStatus(prev => ({ ...prev, [service]: 'authenticated' }))
      updateConfig({ services: [...config.services, service] })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Service Integration</h2>
      <p className="text-gray-600">Authenticate the services required for your selected actions.</p>
      <div className="grid gap-6">
        {Object.entries(integrationStatus).map(([service, status]) => (
          <motion.div
            key={service}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 p-6 rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{service}</h3>
              {status === 'authenticated' ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="w-5 h-5 mr-1" />
                  Authenticated
                </div>
              ) : (
                <div className="flex items-center text-yellow-600">
                  <AlertCircle className="w-5 h-5 mr-1" />
                  Authentication Required
                </div>
              )}
            </div>
            {service === 'Zendesk' ? (
              <div className="space-y-2">
                <Label htmlFor="zendesk-api-key" className="text-sm font-medium text-gray-700">API Key</Label>
                <Input
                  id="zendesk-api-key"
                  type="password"
                  placeholder="Enter your Zendesk API Key"
                  className="border-gray-300 focus:border-black focus:ring-black"
                />
              </div>
            ) : null}
            <Button
              onClick={() => handleAuthenticate(service)}
              disabled={status === 'authenticated'}
              className={`mt-4 w-full ${
                status === 'authenticated'
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {status === 'authenticated' ? 'Authenticated' : `Authenticate with ${service}`}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

