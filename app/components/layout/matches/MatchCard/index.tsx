"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pen, Trash } from "lucide-react";
import { Match } from "@/types/Matches";
import { RecordStatsDialog } from "@/app/components/Dialogs/matches/RecordStatsDialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import ButtonLoading from "@/app/button-loading"

/** Represents the best-scoring player on a team. */
type BestPlayer = {
  player: { id: string; nickname: string };
  score: number;
};

interface MatchCardProps {
  match: Match;
  onEdit: (match: Match) => void;
  onDelete: (matchId: number) => void;
  fetchMatches: () => void;
}

export function MatchCard({ match, onEdit, onDelete, fetchMatches }: MatchCardProps) {
  const [statsDialogOpen, setStatsDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showStatsButtonText, setShowStatsButtonText] = useState<string>("Record Stats");

  useEffect(() => {
    if (match.matchType === "QUARTERS") {
      if (match.quarterMatch && match.quarterMatch.quarters?.some((q) => q.stats.length > 0)) {
        setShowStatsButtonText("See Match Details");
      } else {
        setShowStatsButtonText("Record Stats");
      }
    } else if (match.matchType === "POINTS") {
      if (match.pointsMatch && match.pointsMatch.stats.length > 0) {
        setShowStatsButtonText("See Match Details");
      } else {
        setShowStatsButtonText("Record Stats");
      }
    }
  }, [match]);

  // Helper: Calculate score from a stat entry
  const calculateScore = (stat: {
    twoPointsScored: number;
    threePointsScored: number;
    freeThrowsScored: number;
  }) => {
    return stat.twoPointsScored * 2 + stat.threePointsScored * 3 + stat.freeThrowsScored;
  };

  /**
   * Returns an array of all stats for the given team,
   * based on whether the match is POINTS or QUARTERS.
   */
  const getStatsForTeam = (team: Match["teams"][number]): any[] => {
    const statsForTeam: any[] = [];

    if (match.matchType === "POINTS" && match.pointsMatch) {
      // Filter stats for players on this team
      match.pointsMatch.stats.forEach((stat) => {
        if (team.teamPlayers.some((tp) => tp.player.id === stat.playerId)) {
          statsForTeam.push(stat);
        }
      });
    } else if (match.matchType === "QUARTERS" && match.quarterMatch) {
      // Gather stats from each quarter for players on this team
      match.quarterMatch.quarters.forEach((quarter) => {
        quarter.stats.forEach((stat) => {
          if (team.teamPlayers.some((tp) => tp.player.id === stat.playerId)) {
            statsForTeam.push(stat);
          }
        });
      });
    }

    return statsForTeam;
  };

  /**
   * Sums the total points from all players on the team.
   * This is used for the scoreboard.
   */
  const getTeamTotalScore = (team: Match["teams"][number]): number => {
    const statsForTeam = getStatsForTeam(team);
    return statsForTeam.reduce((acc, stat) => acc + calculateScore(stat), 0);
  };

  /**
   * Finds the best-scoring player for a team (highest total).
   * Returns a BestPlayer or null if no stats.
   */
  const getBestPlayerForTeam = (team: Match["teams"][number]): BestPlayer | null => {
    const statsForTeam = getStatsForTeam(team);

    if (statsForTeam.length === 0) {
      return null;
    }

    // Aggregate scores per player
    const aggregated: Record<string, BestPlayer> = {};
    statsForTeam.forEach((stat) => {
      const playerId = stat.playerId;
      const score = calculateScore(stat);

      if (aggregated[playerId]) {
        aggregated[playerId].score += score;
      } else {
        aggregated[playerId] = {
          player: stat.player, // from the DB include
          score,
        };
      }
    });

    // Find highest-scoring player
    let bestPlayer: BestPlayer | null = null;
    for (const entry of Object.values(aggregated)) {
      if (!bestPlayer || entry.score > bestPlayer.score) {
        bestPlayer = entry;
      }
    }

    return bestPlayer;
  };

  // For the scoreboard in the middle, sum all players on each team
  const teamScore1 = match.teams[0] ? getTeamTotalScore(match.teams[0]) : 0;
  const teamScore2 = match.teams[1] ? getTeamTotalScore(match.teams[1]) : 0;

  // Handle deletion with loading state
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(match.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
    setIsDeleting(false);
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-0 gap-0">
      {/* Arena Image */}
      {match.arena?.imageUrl ? (
        <img
          src={`data:image/png;base64,${match.arena.imageUrl}`}
          alt={match.arena.name}
          className="h-48 w-full object-cover rounded-t-md"
        />
      ) : (
        <div className="h-48 w-full bg-gray-600 rounded-t-md flex items-center justify-center text-gray-200">
          No Arena Photo
        </div>
      )}

      <CardContent className="p-4 flex flex-col gap-3">
        {/* Match Details */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1 text-center w-full">
            <h3 className="text-md font-semibold text-brand-orange">
              {match.arena?.name || "Unknown Arena"}
            </h3>
            <p className="text-sm text-gray-400">Date: {match.date.split("T")[0]}</p>
            <p className="text-sm text-gray-400">
              Match type: {match.matchType}{" "}
              {match.pointsToWin ? `(first to ${match.pointsToWin})` : ""}{" "}
              {match.quarterMatch?.quarters[0]
                ? ` (${match.quarterMatch.quarters[0].duration}min)`
                : ""}, {match.teamSize}v{match.teamSize}
            </p>
          </div>
        </div>

        {/* Best Player for Each Team (centered layout) */}
        <div className="mt-4 grid grid-cols-2 gap-6 text-center">
          {match.teams.map((team, index) => {
            const best = getBestPlayerForTeam(team);
            return (
              <div key={team.id} className="flex flex-col items-center">
                <h4 className="text-sm font-semibold text-gray-200 mb-2">Team {index + 1}</h4>
                {best ? (
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-gray-300">
                      {best.player.nickname}
                    </span>
                    <span className="text-xs text-gray-400">({best.score} pts)</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-300">No stats available</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Full Score Section - Centered */}
        <div className="mt-6 flex justify-center items-center text-3xl font-bold text-center">
          <span className={teamScore1 > teamScore2 ? "text-brand-orange" : "text-white"}>
            {teamScore1}
          </span>
          <span className="mx-4 text-white">-</span>
          <span className={teamScore2 > teamScore1 ? "text-brand-orange" : "text-white"}>
            {teamScore2}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button size="sm" variant="outline" onClick={() => setStatsDialogOpen(true)}>
            {showStatsButtonText}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(match)}>
            <Pen className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setDeleteDialogOpen(true)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Stats Dialog */}
      <RecordStatsDialog
        open={statsDialogOpen}
        onOpenChange={setStatsDialogOpen}
        match={match}
        fetchMatches={fetchMatches}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-brand-dark text-white border-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Match</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this match? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <ButtonLoading /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
