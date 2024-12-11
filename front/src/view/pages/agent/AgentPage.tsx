'use client'

import { useState } from 'react'
import { ArrowLeft, BarChart, MessageSquare, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from 'react-router-dom'
import { AgentHeader } from './AgentHeader'
import { AgentStats } from './AgentStats'
import { PerformanceChart } from './PerformanceChart'
import { RecentActivities } from './RecentActivities'
import { ChatBox } from './ChatBoxProps'

const agent = {
  id: 1,
  name: 'Agent Smith',
  type: 'Customer Support',
  status: 'Online',
  avatar: '/placeholder.svg?height=100&width=100',
  activeChats: 5,
  totalChats: 1000,
  averageResponseTime: '2m 30s',
  satisfactionRate: 95,
  performanceScore: 92,
}

export default function AgentPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/agent" >
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <Button>Edit Agent</Button>
      </div>

      <AgentHeader agent={agent} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <AgentStats agent={agent} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivities />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Chat with {agent.name}</CardTitle>
              <CardDescription>
                You are now in a live chat session with {agent.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatBox agentName={agent.name} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

