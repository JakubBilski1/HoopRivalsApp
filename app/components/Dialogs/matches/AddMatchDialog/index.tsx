"use client";

import * as React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import ButtonLoading from "@/app/button-loading";

import { MatchParams, MatchType } from "@/types/Matches";
import { Friendships } from "@/types/Friendships";
import { ShortenedUser, User } from "@/types/User";
import { AddPlayersSubDialog } from "./AddPlayersSubDialog";
// Note: We are no longer importing AddQuartersSubDialog since quarters are now handled by a single select.

// Example arena interface
interface Arena {
  name: string;
  location: string;
  image: string;
  id: number;
}

interface AddMatchDialogProps {
  newMatch: MatchParams;
  onNewMatchChange: (val: MatchParams) => void;
  onAddMatch: () => Promise<void>;
  friendships: Friendships | null;
  arenas: Arena[]; // <-- New prop for arenas
  user: User;
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getInitialMatchState: () => MatchParams;
}

export function AddMatchDialog({
  newMatch,
  onNewMatchChange,
  onAddMatch,
  friendships,
  arenas,
  user,
  dialogOpen,
  setDialogOpen,
  getInitialMatchState,
}: AddMatchDialogProps) {
  const [playersDialogOpen, setPlayersDialogOpen] = useState(false);
  // Removed quartersDialogOpen since quarters are now handled inline.
  const [isAdding, setIsAdding] = useState(false);

  // Define default quarters for QUARTERS match type.
  // The backend still expects 4 quarters so we keep the structure.

  // Define the initial state for a new match.
  

  function handlePlayersChange(teamA: ShortenedUser[], teamB: ShortenedUser[]) {
    onNewMatchChange({ ...newMatch, teamA, teamB });
  }
  function handleArenaChange(arenaName: string) {
    const selectedArena = arenas.find((a) => a.name === arenaName);
    if (!selectedArena) return;
    onNewMatchChange({
      ...newMatch,
      arenaId: selectedArena.id,
    });
  }

  // Handler for changing the quarter duration.
  // This will update all 4 quarters with the selected duration.
  function handleQuarterDurationChange(value: string) {
    const newDuration = Number(value);
    const updatedQuarters = newMatch.quarters && newMatch.quarters.map((q) => ({
      ...q,
      duration: newDuration,
    }));
    onNewMatchChange({
      ...newMatch,
      quarters: updatedQuarters,
    });
  }

  // This function handles adding the match and then resetting the form.
  const handleAddMatchAndReset = async () => {
    setIsAdding(true);
    await onAddMatch();
    onNewMatchChange(getInitialMatchState());
    setIsAdding(false);
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-brand-orange hover:bg-orange-500 text-white cursor-pointer">
            <PlusIcon className="mr-2" /> Add Match
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-brand-dark text-white border-0 max-w-xl w-full">
          <DialogTitle className="text-white">Add New Match</DialogTitle>

          <div className="space-y-4">
            {/* Row 1: Match Type & Points to Win */}
            <div className="flex flex-col gap-4 md:flex-row md:gap-4">
              <div className="flex-1">
                <Label>Match Type</Label>
                <Select
                  value={newMatch.matchType}
                  onValueChange={(value) =>
                    onNewMatchChange({
                      ...newMatch,
                      matchType: value as MatchType,
                    })
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUARTERS">
                      Quarters (4 quarters)
                    </SelectItem>
                    <SelectItem value="POINTS">Points to Win</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMatch.matchType === "POINTS" && (
                <div className="flex-1 mt-4 md:mt-0">
                  <Label>Points to Win</Label>
                  <Input
                    type="number"
                    className="bg-gray-800 border-gray-700 mt-1"
                    value={newMatch.pointsToWin ?? ""}
                    onChange={(e) =>
                      onNewMatchChange({
                        ...newMatch,
                        pointsToWin: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>

            {newMatch.matchType === "QUARTERS" && (
              <p className="text-sm text-gray-400">
                This match will have 4 quarters with equal duration.
              </p>
            )}

            {/* Row 2: Teams Type & Date */}
            <div className="flex flex-col md:flex-row md:gap-4">
              <div className="flex-1">
                <Label>Teams Type</Label>
                <Select
                  value={newMatch.teamSize.toString()}
                  onValueChange={(value) =>
                    onNewMatchChange({
                      ...newMatch,
                      teamSize: parseInt(value, 10),
                    })
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1v1</SelectItem>
                    <SelectItem value="2">2v2</SelectItem>
                    <SelectItem value="3">3v3</SelectItem>
                    <SelectItem value="4">4v4</SelectItem>
                    <SelectItem value="5">5v5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 mt-4 md:mt-0">
                <Label>Date</Label>
                <Input
                  type="date"
                  className="bg-gray-800 border-gray-700 mt-1"
                  value={newMatch.date}
                  onChange={(e) =>
                    onNewMatchChange({ ...newMatch, date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Row 3: Arena */}
            <div>
              <Label>Arena</Label>
              <Select
                value={arenas.find((a) => a.id === newMatch.arenaId)?.name || ""}
                onValueChange={handleArenaChange}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 w-full mt-1">
                  <SelectValue placeholder="Select arena" />
                </SelectTrigger>
                <SelectContent>
                  {arenas.map((arena) => (
                    <SelectItem key={arena.name} value={arena.name}>
                      {arena.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quarter Duration Select (visible on all screen sizes) */}
            {newMatch.matchType === "QUARTERS" && (
              <div>
                <Label>Quarter Duration (minutes)</Label>
                <Select
                  value={newMatch.quarters && newMatch.quarters[0]?.duration.toString()}
                  onValueChange={handleQuarterDurationChange}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 w-full mt-1">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Mobile Players Dialog Button */}
            <div className="block md:hidden space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setPlayersDialogOpen(true)}
              >
                Set Players
              </Button>
            </div>

            {/* Inline Players (for larger screens) */}
            <div className="hidden md:block space-y-4">
              <div className="flex flex-col md:flex-row md:gap-4">
                <div className="flex-1">
                  <Label>Team A Players</Label>
                  {Array.from({ length: newMatch.teamSize }).map((_, i) => (
                    <Select
                      key={`add-teamA-${i}`}
                      value={newMatch.teamA[i]?.id || ""}
                      defaultValue={user.nickname}
                      onValueChange={(value) => {
                        const updated = [...newMatch.teamA];
                        updated[i] = {
                          id: value,
                          nickname: value,
                        } as ShortenedUser;
                        onNewMatchChange({
                          ...newMatch,
                          teamA: updated,
                        });
                      }}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 w-full mt-1">
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bot">Filler Player</SelectItem>
                        <SelectItem value={user.id}>
                          {user.nickname}
                        </SelectItem>
                        {friendships?.friends
                          .filter((friend) => friend.status === "ACCEPTED")
                          .map((friend) => (
                            <SelectItem
                              key={friend.friend.id}
                              value={friend.friend.id}
                            >
                              {friend.friend.nickname}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ))}
                </div>

                <div className="flex-1 mt-4 md:mt-0">
                  <Label>Team B Players</Label>
                  {Array.from({ length: newMatch.teamSize }).map((_, i) => (
                    <Select
                      key={`add-teamB-${i}`}
                      value={newMatch.teamB[i]?.id || ""}
                      onValueChange={(value) => {
                        const updated = [...newMatch.teamB];
                        updated[i] = {
                          id: value,
                          nickname: value,
                        } as ShortenedUser;
                        onNewMatchChange({
                          ...newMatch,
                          teamB: updated,
                        });
                      }}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 w-full mt-1">
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bot">Filler Player</SelectItem>
                        <SelectItem value={user.id}>
                          {user.nickname}
                        </SelectItem>
                        {friendships?.friends
                          .filter((friend) => friend.status === "ACCEPTED")
                          .map((friend) => (
                            <SelectItem
                              key={friend.friend.id}
                              value={friend.friend.id}
                            >
                              {friend.friend.nickname}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Match Button */}
            <Button
              className="bg-brand-orange hover:bg-orange-500"
              onClick={handleAddMatchAndReset}
              disabled={isAdding}
            >
              {isAdding ? <ButtonLoading /> : "Add Match"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Players Subdialog (unchanged) */}
      <AddPlayersSubDialog
        open={playersDialogOpen}
        onClose={() => setPlayersDialogOpen(false)}
        teamSize={newMatch.teamSize}
        teamAPlayers={newMatch.teamA}
        teamBPlayers={newMatch.teamB}
        onPlayersChange={handlePlayersChange}
        friendships={friendships}
        user={user}
      />
    </>
  );
}
