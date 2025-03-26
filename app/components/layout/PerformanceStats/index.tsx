"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FullStatsData } from "@/types/Matches";

export interface PerformanceStatsProps {
  stats: FullStatsData;
}

export const PerformanceStats = ({ stats }: PerformanceStatsProps) => {
  return (
    <Card className="bg-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-xl">Stats</CardTitle>
        <CardDescription className="text-gray-400">Overview of your performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">3P FG %</p>
            <p className="text-lg font-bold">{stats.threePtPercentage.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">2P FG %</p>
            <p className="text-lg font-bold">{stats.twoPtPercentage.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">FT %</p>
            <p className="text-lg font-bold">{stats.ftPercentage.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">FTPG</p>
            <p className="text-lg font-bold">{stats.ftpg}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">BPG</p>
            <p className="text-lg font-bold">{stats.bpg.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">APG</p>
            <p className="text-lg font-bold">{stats.apg.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">RPG</p>
            <p className="text-lg font-bold">{stats.rpg.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total points</p>
            <p className="text-lg font-bold">{stats.totalPoints}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total blocks</p>
            <p className="text-lg font-bold">{stats.totalBlocks}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total free throws</p>
            <p className="text-lg font-bold">{stats.totalFreeThrows}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
