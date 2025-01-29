import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IntegrationCardProps {
  integration: {
    name: string;
    description: string;
    categories: string[];
  };
  isSelected: boolean;
  onToggle: () => void;
}

export function IntegrationCard({
  integration,
  isSelected,
  onToggle,
}: IntegrationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            {integration.name}
            {isSelected && (
              <Badge variant="secondary" className="ml-2">
                Selected
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-sm">
            {integration.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {integration.categories.map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
          <Button
            onClick={onToggle}
            className={`w-full ${
              isSelected
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isSelected ? "Remove" : "Add Integration"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
