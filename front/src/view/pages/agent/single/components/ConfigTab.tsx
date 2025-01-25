import { motion, AnimatePresence } from "framer-motion";
import AgentConfigTabs from "./AgentConfigTabs";
import { AgentConfig } from "@/services/agentControllerService";

interface ConfigProps {
  agent: AgentConfig;
}

export default function ConfigTab({ agent }: ConfigProps) {
  return (
    <div className=" px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <div className="space-y-12">
          <AnimatePresence>
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="border-b border-gray-200 pb-12"
            >
              <AgentConfigTabs agent={agent} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
