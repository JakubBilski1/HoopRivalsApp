"use client";

import React, { useState, useEffect } from "react";
import { Match } from "@/types/Matches";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pen } from "lucide-react";
import ButtonLoading from "@/app/button-loading"

type TeamStats = {
  playerId: string;
  stats: {
    twoPointsScored: number;
    twoPointsAttempted: number;
    threePointsScored: number;
    threePointsAttempted: number;
    freeThrowsScored: number;
    freeThrowsAttempted: number;
    rebounds?: number;
    assists?: number;
    blocks: number;
  };
};

type Stats = {
  teamA: TeamStats[];
  teamB: TeamStats[];
};

type body = {
  statsData: { quarterId: number; stats: Stats }[] | { stats: Stats };
  matchId?: number;
};

interface QuarterPlayerStats {
  quarterNumber: number;
  playerId: string;
  twoPointsScored: string;
  twoPointsAttempted: string;
  threePointsScored: string;
  threePointsAttempted: string;
  freeThrowsScored: string;
  freeThrowsAttempted: string;
  rebounds: string;
  assists: string;
  blocks: string;
}

interface RecordStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: Match;
  fetchMatches: () => void;
}

// Helper function to format shooting stats as "scored/attempted (perc%)"
const formatShooting = (scored: string, attempted: string) => {
  const s = Number(scored);
  const a = Number(attempted);
  const perc = a > 0 ? Math.round((s / a) * 100) : 0;
  return `${s}/${a} (${perc}%)`;
};

// Initialize stats as strings, pulling existing stats if available.
function initializeStats(match: Match): QuarterPlayerStats[] {
  const stats: QuarterPlayerStats[] = [];
  if (match.matchType === "QUARTERS" && match.quarterMatch) {
    match.quarterMatch.quarters?.forEach((quarter) => {
      match.teams.forEach((team) => {
        team.teamPlayers.forEach((teamPlayer) => {
          const existing = quarter.stats.find(
            (s) => s.playerId === teamPlayer.playerId
          );
          stats.push({
            quarterNumber: quarter.number,
            playerId: teamPlayer.playerId,
            twoPointsScored: existing?.twoPointsScored?.toString() || "0",
            twoPointsAttempted: existing?.twoPointsAttempted?.toString() || "0",
            threePointsScored: existing?.threePointsScored?.toString() || "0",
            threePointsAttempted:
              existing?.threePointsAttempted?.toString() || "0",
            freeThrowsScored: existing?.freeThrowsScored?.toString() || "0",
            freeThrowsAttempted:
              existing?.freeThrowsAttempted?.toString() || "0",
            rebounds: existing?.rebounds?.toString() || "0",
            assists: existing?.assists?.toString() || "0",
            blocks: existing?.blocks?.toString() || "0",
          });
        });
      });
    });
  } else if (match.matchType === "POINTS") {
    // If pointsMatch stats exist, use them; otherwise, default to "0"
    match.teams.forEach((team) => {
      team.teamPlayers.forEach((teamPlayer) => {
        let existing: any = undefined;
        if (match.pointsMatch && match.pointsMatch.stats) {
          existing = match.pointsMatch.stats.find(
            (s) => s.playerId === teamPlayer.playerId
          );
        }
        stats.push({
          quarterNumber: 1,
          playerId: teamPlayer.playerId,
          twoPointsScored: existing?.twoPointsScored?.toString() || "0",
          twoPointsAttempted: existing?.twoPointsAttempted?.toString() || "0",
          threePointsScored: existing?.threePointsScored?.toString() || "0",
          threePointsAttempted:
            existing?.threePointsAttempted?.toString() || "0",
          freeThrowsScored: existing?.freeThrowsScored?.toString() || "0",
          freeThrowsAttempted:
            existing?.freeThrowsAttempted?.toString() || "0",
          rebounds: existing?.rebounds?.toString() || "0",
          assists: existing?.assists?.toString() || "0",
          blocks: existing?.blocks?.toString() || "0",
        });
      });
    });
  }
  return stats;
}

export function RecordStatsDialog({
  open,
  onOpenChange,
  match,
  fetchMatches,
}: RecordStatsDialogProps) {
  // If there are existing stats, default to view mode; otherwise, edit mode.
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [stats, setStats] = useState<QuarterPlayerStats[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Build mapping from playerId to team index (0 for teamA, 1 for teamB)
  const playerTeamMapping: { [playerId: string]: number } = {};
  match.teams.forEach((team, index) => {
    team.teamPlayers.forEach((tp) => {
      playerTeamMapping[tp.playerId] = index;
    });
  });

  // Determine if there are existing stats (for PUT vs POST)
  const hasExistingStats =
    match.matchType === "QUARTERS"
      ? match.quarterMatch &&
        match.quarterMatch.quarters?.some((q) => q.stats && q.stats.length > 0)
      : match.matchType === "POINTS" &&
        match.pointsMatch &&
        match.pointsMatch.stats &&
        match.pointsMatch.stats.length > 0;

  useEffect(() => {
    if (open && match) {
      setStats(initializeStats(match));
      if (hasExistingStats) {
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    }
  }, [open, match, hasExistingStats]);

  // Update a specific stat field; values are stored as strings.
  const updateStatField = (
    quarterNumber: number,
    playerId: string,
    field: keyof Omit<QuarterPlayerStats, "quarterNumber" | "playerId">,
    value: string
  ) => {
    setStats((prev) =>
      prev.map((stat) =>
        stat.quarterNumber === quarterNumber && stat.playerId === playerId
          ? { ...stat, [field]: value }
          : stat
      )
    );
  };

  // Build the request body for saving stats.
  const buildStatsBody = (): body => {
    if (match.matchType === "QUARTERS") {
      const quarterMap: { [q: number]: QuarterPlayerStats[] } = {};
      stats.forEach((stat) => {
        if (!quarterMap[stat.quarterNumber]) {
          quarterMap[stat.quarterNumber] = [];
        }
        quarterMap[stat.quarterNumber].push(stat);
      });

      const statsDataArray =
        match.quarterMatch &&
        match.quarterMatch.quarters?.map((quarter) => {
          const quarterStats = quarterMap[quarter.number] || [];
          const teamA: TeamStats[] = [];
          const teamB: TeamStats[] = [];
          quarterStats.forEach((stat) => {
            const teamIndex = playerTeamMapping[stat.playerId];
            const teamStat: TeamStats = {
              playerId: stat.playerId,
              stats: {
                twoPointsScored: Number(stat.twoPointsScored) || 0,
                twoPointsAttempted: Number(stat.twoPointsAttempted) || 0,
                threePointsScored: Number(stat.threePointsScored) || 0,
                threePointsAttempted: Number(stat.threePointsAttempted) || 0,
                freeThrowsScored: Number(stat.freeThrowsScored) || 0,
                freeThrowsAttempted: Number(stat.freeThrowsAttempted) || 0,
                rebounds: Number(stat.rebounds) || 0,
                assists: Number(stat.assists) || 0,
                blocks: Number(stat.blocks) || 0,
              },
            };
            if (teamIndex === 0) {
              teamA.push(teamStat);
            } else if (teamIndex === 1) {
              teamB.push(teamStat);
            }
          });

          return {
            quarterId: quarter.id,
            stats: {
              teamA,
              teamB,
            },
          };
        }) || [];

      return {
        statsData: statsDataArray,
        matchId: match.id,
      };
    } else {
      // For POINTS matches, aggregate stats into teamA / teamB.
      const teamA: TeamStats[] = [];
      const teamB: TeamStats[] = [];
      stats.forEach((stat) => {
        const teamIndex = playerTeamMapping[stat.playerId];
        const teamStat: TeamStats = {
          playerId: stat.playerId,
          stats: {
            twoPointsScored: Number(stat.twoPointsScored) || 0,
            twoPointsAttempted: Number(stat.twoPointsAttempted) || 0,
            threePointsScored: Number(stat.threePointsScored) || 0,
            threePointsAttempted: Number(stat.threePointsAttempted) || 0,
            freeThrowsScored: Number(stat.freeThrowsScored) || 0,
            freeThrowsAttempted: Number(stat.freeThrowsAttempted) || 0,
            rebounds: Number(stat.rebounds) || 0,
            assists: Number(stat.assists) || 0,
            blocks: Number(stat.blocks) || 0,
          },
        };
        if (teamIndex === 0) {
          teamA.push(teamStat);
        } else if (teamIndex === 1) {
          teamB.push(teamStat);
        }
      });
      return {
        statsData: { stats: { teamA, teamB } },
        matchId: match.id,
      };
    }
  };

  // On save, choose PUT if updating existing stats, POST otherwise.
  const handleSave = async () => {
    setIsSaving(true);
    const bodyData = buildStatsBody();
    const requestMethod = hasExistingStats ? "PUT" : "POST";
    try {
      const response = await fetch("/api/matches/stats", {
        method: requestMethod,
        body: JSON.stringify(bodyData),
      });
      let error = ""
      if (!response.ok) {
        error = await response.text()
      }
      if (response.status === 200) {
        toast.success("Stats saved successfully.");
        onOpenChange(false);
        fetchMatches();
      } else if (response.status === 400) {
        toast.error(error)
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save stats.");
    }
    setIsSaving(false);
  };

  const isAnyQuarterPopulated =
    match.matchType === "QUARTERS" &&
    match.quarterMatch &&
    match.quarterMatch.quarters?.some((q) => q.stats && q.stats.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-brand-dark text-white border-0 max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex items-center justify-between">
          <div>
            <DialogTitle>
              {match.matchType === "QUARTERS"
                ? isAnyQuarterPopulated
                  ? "Match Details"
                  : "Record Stats"
                : "Record Game Stats"}
            </DialogTitle>
            <DialogDescription>
              {match.matchType === "QUARTERS"
                ? "Fill in or update each player's stats for every quarter."
                : "Fill in or update each player's stats for the whole game."}
            </DialogDescription>
          </div>
          {/* If not editing, show the pen icon button to switch to edit mode */}
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="p-2">
              <Pen className="h-5 w-5" />
            </button>
          )}
        </DialogHeader>

        {match.matchType === "QUARTERS" ? (
          <Accordion type="multiple" className="mt-4">
            {match.quarterMatch &&
              match.quarterMatch.quarters?.map((quarter) => (
                <AccordionItem key={quarter.number} value={`quarter-${quarter.number}`}>
                  <AccordionTrigger>Quarter {quarter.number}</AccordionTrigger>
                  <AccordionContent>
                    {match.teams.map((team, tIndex) => (
                      <div key={team.id} className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-300 mb-2">
                          Team {tIndex + 1}
                        </h3>
                        {team.teamPlayers.map((teamPlayer) => {
                          const playerStat = stats.find(
                            (s) =>
                              s.quarterNumber === quarter.number &&
                              s.playerId === teamPlayer.playerId
                          );
                          if (!playerStat) return null;
                          return (
                            <div key={teamPlayer.playerId} className="mb-4 p-4 border rounded-md bg-gray-800">
                              <h4 className="text-sm font-bold text-gray-200 mb-2">
                                {teamPlayer.player.nickname}
                              </h4>
                              {isEditing ? (
                                <>
                                  {/* Editable inputs */}
                                  <div className="mb-2">
                                    <label className="block text-xs mb-1">2P (Scored / Attempted)</label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="number"
                                        value={playerStat.twoPointsScored}
                                        onChange={(e) =>
                                          updateStatField(
                                            quarter.number,
                                            teamPlayer.playerId,
                                            "twoPointsScored",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <Input
                                        type="number"
                                        value={playerStat.twoPointsAttempted}
                                        onChange={(e) =>
                                          updateStatField(
                                            quarter.number,
                                            teamPlayer.playerId,
                                            "twoPointsAttempted",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="mb-2">
                                    <label className="block text-xs mb-1">3P (Scored / Attempted)</label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="number"
                                        value={playerStat.threePointsScored}
                                        onChange={(e) =>
                                          updateStatField(
                                            quarter.number,
                                            teamPlayer.playerId,
                                            "threePointsScored",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <Input
                                        type="number"
                                        value={playerStat.threePointsAttempted}
                                        onChange={(e) =>
                                          updateStatField(
                                            quarter.number,
                                            teamPlayer.playerId,
                                            "threePointsAttempted",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="mb-2">
                                    <label className="block text-xs mb-1">FT (Scored / Attempted)</label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="number"
                                        value={playerStat.freeThrowsScored}
                                        onChange={(e) =>
                                          updateStatField(
                                            quarter.number,
                                            teamPlayer.playerId,
                                            "freeThrowsScored",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <Input
                                        type="number"
                                        value={playerStat.freeThrowsAttempted}
                                        onChange={(e) =>
                                          updateStatField(
                                            quarter.number,
                                            teamPlayer.playerId,
                                            "freeThrowsAttempted",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  {match.teamSize > 1 && (
                                    <>
                                      <div className="mb-2">
                                        <label className="block text-xs mb-1">Rebounds</label>
                                        <Input
                                          type="number"
                                          value={playerStat.rebounds}
                                          onChange={(e) =>
                                            updateStatField(
                                              quarter.number,
                                              teamPlayer.playerId,
                                              "rebounds",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                      <div className="mb-2">
                                        <label className="block text-xs mb-1">Assists</label>
                                        <Input
                                          type="number"
                                          value={playerStat.assists}
                                          onChange={(e) =>
                                            updateStatField(
                                              quarter.number,
                                              teamPlayer.playerId,
                                              "assists",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                    </>
                                  )}
                                  <div className="mb-2">
                                    <label className="block text-xs mb-1">Blocks</label>
                                    <Input
                                      type="number"
                                      value={playerStat.blocks}
                                      onChange={(e) =>
                                        updateStatField(
                                          quarter.number,
                                          teamPlayer.playerId,
                                          "blocks",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm">
                                    <strong>Points:</strong> {Number(playerStat.twoPointsScored) * 2 + Number(playerStat.threePointsScored) * 3 + Number(playerStat.freeThrowsScored)}
                                  </p>
                                  <p className="text-sm">
                                    <strong>2P:</strong> {formatShooting(playerStat.twoPointsScored, playerStat.twoPointsAttempted)}
                                  </p>
                                  <p className="text-sm">
                                    <strong>3P:</strong> {formatShooting(playerStat.threePointsScored, playerStat.threePointsAttempted)}
                                  </p>
                                  <p className="text-sm">
                                    <strong>FT:</strong> {formatShooting(playerStat.freeThrowsScored, playerStat.freeThrowsAttempted)}
                                  </p>
                                  {match.teamSize > 1 && (
                                    <>
                                      <p className="text-sm">
                                        <strong>Rebounds:</strong> {playerStat.rebounds}
                                      </p>
                                      <p className="text-sm">
                                        <strong>Assists:</strong> {playerStat.assists}
                                      </p>
                                    </>
                                  )}
                                  <p className="text-sm">
                                    <strong>Blocks:</strong> {playerStat.blocks}
                                  </p>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        ) : (
          <div className="mt-4">
            {match.teams.map((team, tIndex) => (
              <div key={team.id} className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Team {tIndex + 1}</h3>
                {team.teamPlayers.map((teamPlayer) => {
                  const playerStat = stats.find((s) => s.playerId === teamPlayer.playerId);
                  if (!playerStat) return null;
                  return (
                    <div key={teamPlayer.playerId} className="mb-4 p-4 border rounded-md bg-gray-800">
                      <h4 className="text-sm font-bold text-gray-200 mb-2">
                        {teamPlayer.player.nickname}
                      </h4>
                      {isEditing ? (
                        <>
                          <div className="mb-2">
                            <label className="block text-xs mb-1">2P (Scored / Attempted)</label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                value={playerStat.twoPointsScored}
                                onChange={(e) =>
                                  updateStatField(
                                    1,
                                    teamPlayer.playerId,
                                    "twoPointsScored",
                                    e.target.value
                                  )
                                }
                              />
                              <Input
                                type="number"
                                value={playerStat.twoPointsAttempted}
                                onChange={(e) =>
                                  updateStatField(
                                    1,
                                    teamPlayer.playerId,
                                    "twoPointsAttempted",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="mb-2">
                            <label className="block text-xs mb-1">3P (Scored / Attempted)</label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                value={playerStat.threePointsScored}
                                onChange={(e) =>
                                  updateStatField(
                                    1,
                                    teamPlayer.playerId,
                                    "threePointsScored",
                                    e.target.value
                                  )
                                }
                              />
                              <Input
                                type="number"
                                value={playerStat.threePointsAttempted}
                                onChange={(e) =>
                                  updateStatField(
                                    1,
                                    teamPlayer.playerId,
                                    "threePointsAttempted",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="mb-2">
                            <label className="block text-xs mb-1">FT (Scored / Attempted)</label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                value={playerStat.freeThrowsScored}
                                onChange={(e) =>
                                  updateStatField(
                                    1,
                                    teamPlayer.playerId,
                                    "freeThrowsScored",
                                    e.target.value
                                  )
                                }
                              />
                              <Input
                                type="number"
                                value={playerStat.freeThrowsAttempted}
                                onChange={(e) =>
                                  updateStatField(
                                    1,
                                    teamPlayer.playerId,
                                    "freeThrowsAttempted",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          {match.teamSize > 1 && (
                            <>
                              <div className="mb-2">
                                <label className="block text-xs mb-1">Rebounds</label>
                                <Input
                                  type="number"
                                  value={playerStat.rebounds}
                                  onChange={(e) =>
                                    updateStatField(
                                      1,
                                      teamPlayer.playerId,
                                      "rebounds",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div className="mb-2">
                                <label className="block text-xs mb-1">Assists</label>
                                <Input
                                  type="number"
                                  value={playerStat.assists}
                                  onChange={(e) =>
                                    updateStatField(
                                      1,
                                      teamPlayer.playerId,
                                      "assists",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </>
                          )}
                          <div className="mb-2">
                            <label className="block text-xs mb-1">Blocks</label>
                            <Input
                              type="number"
                              value={playerStat.blocks}
                              onChange={(e) =>
                                updateStatField(
                                  1,
                                  teamPlayer.playerId,
                                  "blocks",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-sm">
                            <strong>Points:</strong> {Number(playerStat.twoPointsScored) * 2 + Number(playerStat.threePointsScored) * 3 + Number(playerStat.freeThrowsScored)}
                          </p>
                          <p className="text-sm">
                            <strong>2P:</strong> {formatShooting(playerStat.twoPointsScored, playerStat.twoPointsAttempted)}
                          </p>
                          <p className="text-sm">
                            <strong>3P:</strong> {formatShooting(playerStat.threePointsScored, playerStat.threePointsAttempted)}
                          </p>
                          <p className="text-sm">
                            <strong>FT:</strong> {formatShooting(playerStat.freeThrowsScored, playerStat.freeThrowsAttempted)}
                          </p>
                          {match.teamSize > 1 && (
                            <>
                              <p className="text-sm">
                                <strong>Rebounds:</strong> {playerStat.rebounds}
                              </p>
                              <p className="text-sm">
                                <strong>Assists:</strong> {playerStat.assists}
                              </p>
                            </>
                          )}
                          <p className="text-sm">
                            <strong>Blocks:</strong> {playerStat.blocks}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Show Save Stats button only when in edit mode */}
        {isEditing && (
          <DialogFooter className="mt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-brand-orange text-white rounded-md"
            >
              {isSaving ? <ButtonLoading /> : "Save Stats"}
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
