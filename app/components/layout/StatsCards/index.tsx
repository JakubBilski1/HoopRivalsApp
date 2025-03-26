"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { FullStatsData } from "@/types/Matches";

interface StatsProps {
  stats: FullStatsData
}

export const StatsCards = ({ stats }: StatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gray-800 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <p className="text-3xl font-bold text-brand-orange">{stats.ppg.toFixed(1)}</p>
          <p className="text-gray-300">PPG</p>
        </div>
      </Card>
      <Card className="bg-gray-800 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <p className="text-3xl font-bold text-brand-orange">{stats.fgPercentage.toFixed(1)}%</p>
          <p className="text-gray-300">field goals pct.</p>
        </div>
      </Card>
      <Card className="bg-gray-800 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <p className="text-3xl font-bold text-brand-orange">{stats.totalWins}/{stats.totalGames}</p>
          <p className="text-gray-300">Wins/Games</p>
        </div>
      </Card>
    </div>
  );
};
