"use client";

import { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, Users, Eye, BarChart3, Download, RefreshCw, 
  Calendar, ArrowUpRight, Share2, HelpCircle, UploadCloud, FileSpreadsheet
} from "lucide-react";

// Fallback: Generate 30 days of realistic sequential analytics data
const generate30DayData = () => {
  const data = [];
  let followers = 12400;
  
  for (let i = 30; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    const reachGained = Math.floor(Math.random() * 3000) + 1500;
    const engagementGained = Math.floor(Math.random() * 400) + 120;
    const followersGained = Math.floor(Math.random() * 80) + 15;
    followers += followersGained;

    data.push({
      date: dateString,
      reach: reachGained,
      engagement: engagementGained,
      followerGrowth: followersGained,
      totalFollowers: followers,
      engagementRate: parseFloat(((engagementGained / reachGained) * 100).toFixed(2))
    });
  }
  return data;
};

export default function AnalyticsDashboard() {
  const [platform, setPlatform] = useState("Instagram");
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef(null);

  // Load from local storage or generate fallback data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("adishila_analytics_data");
    if (savedData) {
      try {
        setHistoricalData(JSON.parse(savedData));
      } catch (e) {
        setHistoricalData(generate30DayData());
      }
    } else {
      setHistoricalData(generate30DayData());
    }
    setIsLoaded(true);
  }, []);

  // Summary aggregates (Prevent crash if data is empty)
  const totalReach = historicalData.reduce((sum, item) => sum + (item.reach || 0), 0);
  const totalEngagement = historicalData.reduce((sum, item) => sum + (item.engagement || 0), 0);
  const totalGrowth = historicalData.reduce((sum, item) => sum + (item.followerGrowth || 0), 0);
  const currentFollowers = historicalData.length > 0 ? historicalData[historicalData.length - 1].totalFollowers : 0;
  const avgEngagementRate = totalReach > 0 ? parseFloat(((totalEngagement / totalReach) * 100).toFixed(2)) : 0;

  // CSV Data Export Engine
  const exportToCSV = () => {
    const headers = ["Date", "Platform", "Reach", "Engagement", "Follower Growth", "Total Followers", "Engagement Rate (%)"];
    const rows = historicalData.map(item => [
      item.date,
      platform,
      item.reach,
      item.engagement,
      item.followerGrowth,
      item.totalFollowers,
      item.engagementRate
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AdiShila_${platform}_Analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Data Import Engine
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split("\n").filter(line => line.trim() !== "");
      
      try {
        // Skip header row and parse data
        const parsedData = lines.slice(1).map(line => {
          const values = line.split(",");
          // Expecting format: Date, Platform, Reach, Engagement, Follower Growth, Total Followers, Engagement Rate
          return {
            date: values[0],
            reach: parseInt(values[2]) || 0,
            engagement: parseInt(values[3]) || 0,
            followerGrowth: parseInt(values[4]) || 0,
            totalFollowers: parseInt(values[5]) || 0,
            engagementRate: parseFloat(values[6]) || 0
          };
        });

        if (parsedData.length > 0) {
          setHistoricalData(parsedData);
          localStorage.setItem("adishila_analytics_data", JSON.stringify(parsedData));
          alert("Data successfully uploaded and dashboard updated!");
        }
      } catch (err) {
        alert("Invalid CSV format. Please export the sample data to see the required layout.");
        console.error(err);
      }
    };
    reader.readAsText(file);
    // Reset input so they can upload the same file again if they edit it
    e.target.value = null; 
  };

  if (!isLoaded) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-amber-500/30 selection:text-amber-200 p-6 md:p-12 lg:p-16">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-zinc-800/60 pb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold tracking-widest uppercase mb-2">
              <BarChart3 className="w-4 h-4" /> Core Performance Engine
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
              Social Media Analytics
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={platform} 
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            >
              <option value="Instagram">Instagram Business</option>
              <option value="LinkedIn">LinkedIn Company Page</option>
              <option value="Twitter/X">Twitter / X Professional</option>
            </select>

            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>

            {/* NEW UPLOAD BUTTON */}
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            >
              <UploadCloud className="w-4 h-4" /> Upload Weekly Data
            </button>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Community</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400"><Users className="w-4 h-4" /></div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-white">{currentFollowers.toLocaleString()}</span>
              <span className="text-xs font-medium text-emerald-500 flex items-center"><ArrowUpRight className="w-3 h-3" />+{totalGrowth}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Active net followers recorded</p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gross Reach</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400"><Eye className="w-4 h-4" /></div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-white">{totalReach.toLocaleString()}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Content impressions across feeds</p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Engaged Actions</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400"><TrendingUp className="w-4 h-4" /></div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-white">{totalEngagement.toLocaleString()}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Likes, shares, clicks & comments</p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Avg Engagement Rate</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Share2 className="w-4 h-4" /></div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-white">{avgEngagementRate}%</span>
              <span className="text-xs font-medium text-zinc-500 flex items-center">Ind. Bench: 3.2%</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Total engagement / total reach ratio</p>
          </div>
        </div>

        {/* DATA TABLE GRAPHIC CHART REPRESENTATION */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-white">Historical Data Log</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Granular performance data compiled sequentially</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" /> {historicalData.length} Records Loaded
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800/60 max-h-96 overflow-y-auto">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-zinc-950 z-10">
                <tr className="bg-zinc-900/50 text-zinc-400 text-xs font-semibold uppercase tracking-wider border-b border-zinc-800">
                  <th className="p-4">Date</th>
                  <th className="p-4">Impressions / Reach</th>
                  <th className="p-4">Engagement Count</th>
                  <th className="p-4">Follower Gain</th>
                  <th className="p-4 text-right">Day Engagement Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-sm">
                {[...historicalData].reverse().map((day, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="p-4 font-medium text-white">{day.date}</td>
                    <td className="p-4 text-zinc-400">{day.reach.toLocaleString()}</td>
                    <td className="p-4 text-zinc-400">{day.engagement.toLocaleString()}</td>
                    <td className="p-4 text-emerald-500 font-medium">+{day.followerGrowth}</td>
                    <td className="p-4 text-right font-mono text-amber-400/90">{day.engagementRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PROCESS AND MAINTENANCE DOCUMENTATION MODULE */}
        <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-medium">
              <HelpCircle className="w-5 h-5 text-amber-500" /> Operational Blueprint
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This analytics node provides structured visibility into AdiShila&apos;s social metrics pipeline. The dashboard dynamically processes imported data to calculate aggregate ROI.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-zinc-800/80 lg:pl-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" /> Auto-Formatting
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                The application parses raw `.csv` reports natively in your browser. It calculates the Engagement Rate and Net Growth automatically. No coding required.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <UploadCloud className="w-3.5 h-3.5 text-purple-500" /> Update Protocol
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                To update the dashboard, export your native metrics from the assigned platform (Instagram/LinkedIn). Click <strong>"Upload Weekly Data"</strong> and select your `.csv` file.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}