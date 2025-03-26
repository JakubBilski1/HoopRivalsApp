"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Loading from "@/app/loading";

interface AggregatedStats {
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
  totalFreeThrows: number;
  totalBlocks: number;
  totalGames: number;
  totalWins: number;
  ppg: number;
  rpg: number;
  apg: number;
  ftpg: number;
  bpg: number;
  fgPercentage: number;
  twoPtPercentage: number;
  threePtPercentage: number;
  ftPercentage: number;
  pointsPerNorm?: number;
}

interface StatsData {
  overallStats: AggregatedStats;
  quartersStatsByTeamSize: Record<string, Record<string, AggregatedStats>>;
  pointsStatsByTeamSizeAndMax: Record<string, Record<string, AggregatedStats>>;
  error?: string;
}

// Define the items to display as cards.
const statItems = [
  { label: "Wins", key: "totalWins" },
  { label: "Total Games", key: "totalGames" },
  { label: "Total Points", key: "totalPoints" },
  { label: "Total Rebounds", key: "totalRebounds" },
  { label: "Total Assists", key: "totalAssists" },
  { label: "Free Throws", key: "totalFreeThrows" },
  { label: "Total Blocks", key: "totalBlocks" },
  { label: "PPG", key: "ppg", decimals: 1 },
  { label: "RPG", key: "rpg", decimals: 1 },
  { label: "APG", key: "apg", decimals: 1 },
  { label: "FTPG", key: "ftpg", decimals: 1 },
  { label: "BPG", key: "bpg", decimals: 1 },
  { label: "FG %", key: "fgPercentage", isPercent: true, decimals: 1 },
  { label: "2PT %", key: "twoPtPercentage", isPercent: true, decimals: 1 },
  { label: "3PT %", key: "threePtPercentage", isPercent: true, decimals: 1 },
  { label: "FT %", key: "ftPercentage", isPercent: true, decimals: 1 },
];

function formatValue(val: number, decimals?: number, isPercent?: boolean) {
  const formatted = decimals != null ? val.toFixed(decimals) : val.toString();
  return isPercent ? `${formatted}%` : formatted;
}

/**
 * Renders a grid of stat cards.
 * If extraCard is provided, it is inserted immediately after the "PPG" card.
 */
function renderStatCards(
  agg: AggregatedStats,
  extraCard?: { label: string; value: string }
) {
  const ppgIndex = statItems.findIndex(item => item.key === "ppg");

  const cards = statItems.map(item => {
    const rawVal = agg[item.key as keyof AggregatedStats] as number;
    const displayVal = formatValue(rawVal, item.decimals, item.isPercent);
    return (
      <Card key={item.key} className="bg-gray-700 p-3">
        <CardHeader>
          <CardTitle className="text-xs text-gray-300">
            {item.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-white">{displayVal}</div>
        </CardContent>
      </Card>
    );
  });

  if (extraCard && ppgIndex !== -1) {
    cards.splice(
      ppgIndex + 1,
      0,
      <Card key="extra-norm" className="bg-gray-700 p-3">
        <CardHeader>
          <CardTitle className="text-xs text-gray-300">{extraCard.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-white">{extraCard.value}</div>
        </CardContent>
      </Card>
    );
  }

  return <div className="grid grid-cols-2 gap-4">{cards}</div>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // For Quarters details
  const [selectedTeamSize, setSelectedTeamSize] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [quartersSheetOpen, setQuartersSheetOpen] = useState(false);

  // For Points details (grouped by team size then max points)
  const [selectedPointsTeamSize, setSelectedPointsTeamSize] = useState<string | null>(null);
  const [selectedMaxPoints, setSelectedMaxPoints] = useState<string | null>(null);
  const [pointsSheetOpen, setPointsSheetOpen] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to fetch stats");
        } else {
          const data: StatsData = await res.json();
          setStats(data);
          console.log(data);
        }
      } catch (err) {
        setError("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center text-white">
        <Loading />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 text-center text-white">
        <p className="mb-4">Error: {error}</p>
        <Button variant="outline" onClick={() => router.push("/login")}>
          Go to Login
        </Button>
      </div>
    );
  }
  if (!stats) return null;

  // For Quarters: available team sizes and quarter durations
  const quartersTeamSizeKeys = stats.quartersStatsByTeamSize
    ? Object.keys(stats.quartersStatsByTeamSize)
    : [];
  const quarterDurations =
    selectedTeamSize && stats.quartersStatsByTeamSize[selectedTeamSize]
      ? Object.keys(stats.quartersStatsByTeamSize[selectedTeamSize])
      : [];

  const handleTeamSizeClick = (size: string) => {
    setSelectedTeamSize(size);
    setSelectedDuration(null);
  };

  const handleDurationClick = (dur: string) => {
    setSelectedDuration(dur);
    setQuartersSheetOpen(true);
  };

  // For Points: available team sizes and max points values
  const pointsTeamSizeKeys = stats.pointsStatsByTeamSizeAndMax
    ? Object.keys(stats.pointsStatsByTeamSizeAndMax)
    : [];
  const maxPointsKeys =
    selectedPointsTeamSize &&
    stats.pointsStatsByTeamSizeAndMax[selectedPointsTeamSize]
      ? Object.keys(stats.pointsStatsByTeamSizeAndMax[selectedPointsTeamSize])
      : [];

  const handlePointsTeamSizeClick = (size: string) => {
    setSelectedPointsTeamSize(size);
    setSelectedMaxPoints(null);
  };

  const handleMaxPointsClick = (max: string) => {
    setSelectedMaxPoints(max);
    setPointsSheetOpen(true);
  };

  // For normalized stat in quarters sheet, insert after PPG.
  let normLabel = "";
  if (selectedDuration) {
    const durationNum = parseInt(selectedDuration, 10);
    normLabel = [5, 10].includes(durationNum) ? "Points per 40" : "Points per 48";
  }
  const extraQuarterStat =
    selectedTeamSize &&
    selectedDuration &&
    stats.quartersStatsByTeamSize[selectedTeamSize][selectedDuration] &&
    stats.quartersStatsByTeamSize[selectedTeamSize][selectedDuration].pointsPerNorm !== undefined
      ? {
          label: normLabel,
          value: formatValue(
            stats.quartersStatsByTeamSize[selectedTeamSize][selectedDuration].pointsPerNorm!,
            1
          ),
        }
      : undefined;

  return (
    <div className="p-4">
      <Card className="mx-auto bg-gray-800 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-brand-orange">Your Stats</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Top-Level Tabs: Overall / Quarters / Points */}
          <Tabs defaultValue="overall" className="w-full">
            <TabsList>
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="quarters">Quarters</TabsTrigger>
              <TabsTrigger value="points">Points</TabsTrigger>
            </TabsList>
            <TabsContent value="overall" className="mt-4">
              {renderStatCards(stats.overallStats)}
            </TabsContent>
            <TabsContent value="quarters" className="mt-4">
              {/* Quarters: Team Size Buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                {quartersTeamSizeKeys.length > 0 ? (
                  quartersTeamSizeKeys.map(size => (
                    <Button
                      key={size}
                      variant="outline"
                      onClick={() => handleTeamSizeClick(size)}
                      className="m-1"
                    >
                      {size}v{size}
                    </Button>
                  ))
                ) : (
                  <p className="text-center text-gray-300">No Quarter matches found.</p>
                )}
              </div>
              {/* Quarter Duration Buttons */}
              {selectedTeamSize && quarterDurations.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {quarterDurations.map(dur => (
                    <Button
                      key={dur}
                      variant="outline"
                      onClick={() => handleDurationClick(dur)}
                    >
                      {dur}-min
                    </Button>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="points" className="mt-4">
              {/* Points: Team Size Buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                {pointsTeamSizeKeys.length > 0 ? (
                  pointsTeamSizeKeys.map(size => (
                    <Button
                      key={size}
                      variant="outline"
                      onClick={() => handlePointsTeamSizeClick(size)}
                      className="m-1"
                    >
                      {size}v{size}
                    </Button>
                  ))
                ) : (
                  <p className="text-center text-gray-300">No Points matches found.</p>
                )}
              </div>
              {/* Points: Max Points Buttons */}
              {selectedPointsTeamSize && maxPointsKeys.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {maxPointsKeys.map(max => (
                    <Button
                      key={max}
                      variant="outline"
                      onClick={() => handleMaxPointsClick(max)}
                    >
                      {max} Points
                    </Button>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sheet for displaying Quarters Stats details */}
      <Sheet open={quartersSheetOpen} onOpenChange={setQuartersSheetOpen}>
        <SheetContent className="w-full h-full p-4 bg-gray-800 text-white">
          <SheetHeader>
            <SheetTitle>
              {selectedTeamSize}v{selectedTeamSize} - {selectedDuration}-min
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto h-[calc(100%-4rem)]">
            {selectedTeamSize &&
            selectedDuration &&
            stats.quartersStatsByTeamSize[selectedTeamSize][selectedDuration] ? (
              renderStatCards(
                stats.quartersStatsByTeamSize[selectedTeamSize][selectedDuration],
                extraQuarterStat
              )
            ) : (
              <p className="text-gray-300">No stats available for this group.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet for displaying Points Stats details */}
      <Sheet open={pointsSheetOpen} onOpenChange={setPointsSheetOpen}>
        <SheetContent className="w-full h-full p-4 bg-gray-800 text-white">
          <SheetHeader>
            <SheetTitle>
              {selectedPointsTeamSize}v{selectedPointsTeamSize} - {selectedMaxPoints} Points
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto h-[calc(100%-4rem)]">
            {selectedPointsTeamSize &&
            selectedMaxPoints &&
            stats.pointsStatsByTeamSizeAndMax[selectedPointsTeamSize][selectedMaxPoints] ? (
              renderStatCards(
                stats.pointsStatsByTeamSizeAndMax[selectedPointsTeamSize][selectedMaxPoints]
              )
            ) : (
              <p className="text-gray-300">No stats available for this group.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
