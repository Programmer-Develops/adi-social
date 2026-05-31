import Image from "next/image";
import AnalyticsDashboard from "./analytics/AnalyticsDashboard";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">    
      <AnalyticsDashboard />
    </div>
  );
}
