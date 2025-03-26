"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Friendships } from "@/types/Friendships";
import { ShortenedUser, User } from "@/types/User";

interface AddPlayersSubDialogProps {
  open: boolean;
  onClose: () => void;
  teamSize: number; // e.g. "1v1", "2v2", ...
  teamAPlayers: ShortenedUser[];
  teamBPlayers: ShortenedUser[];
  onPlayersChange: (teamA: ShortenedUser[], teamB: ShortenedUser[]) => void;
  friendships: Friendships | null;
  user: User;
}

export function AddPlayersSubDialog({
  open,
  onClose,
  teamSize,
  teamAPlayers,
  teamBPlayers,
  onPlayersChange,
  friendships,
  user
}: AddPlayersSubDialogProps) {
  const [localTeamA, setLocalTeamA] = React.useState<ShortenedUser[]>(teamAPlayers);
  const [localTeamB, setLocalTeamB] = React.useState<ShortenedUser[]>(teamBPlayers);

  React.useEffect(() => {
    setLocalTeamA(teamAPlayers);
    setLocalTeamB(teamBPlayers);
  }, [teamAPlayers, teamBPlayers]);

  function handleSavePlayers() {
    onPlayersChange(localTeamA, localTeamB);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="bg-brand-dark text-white border-0 max-w-md w-full">
        <DialogTitle className="text-white">Select Players</DialogTitle>

        <div className="space-y-4">
          {/* Team A */}
          <div>
            <Label>Team A Players</Label>
            {Array.from({ length: teamSize }).map((_, i) => (
              <Select
                key={`teamA-${i}`}
                // If we don’t already have someone in localTeamA[i],
                // we use the current user's ID as the default.
                value={localTeamA[i]?.id ?? user.id}
                onValueChange={(value) => {
                  const updated = [...localTeamA];
                  if (value === "bot") {
                    updated[i] = { id: "bot", nickname: "Filler Player" };
                  } else if (value === user.id) {
                    updated[i] = user;
                  } else {
                    const selectedFriend = friendships?.friends.find(
                      (f) => f.friend.id === value
                    )?.friend;
                    if (selectedFriend) {
                      updated[i] = selectedFriend;
                    }
                  }
                  setLocalTeamA(updated);
                }}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 w-full mt-1">
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bot">Filler Player</SelectItem>
                  <SelectItem value={user.id}>{user.nickname}</SelectItem>
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

          {/* Team B */}
          <div>
            <Label>Team B Players</Label>
            {Array.from({ length: teamSize }).map((_, i) => (
              <Select
                key={`teamB-${i}`}
                // If we don’t already have someone in localTeamB[i],
                // we use the current user's ID as the default.
                value={localTeamB[i]?.id ?? ""}
                onValueChange={(value) => {
                  const updated = [...localTeamB];
                  if (value === "bot") {
                    updated[i] = { id: "bot", nickname: "Filler Player" };
                  } else if (value === user.id) {
                    updated[i] = user;
                  } else {
                    const selectedFriend = friendships?.friends.find(
                      (f) => f.friend.id === value
                    )?.friend;
                    if (selectedFriend) {
                      updated[i] = selectedFriend;
                    }
                  }
                  setLocalTeamB(updated);
                }}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 w-full mt-1">
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bot">Filler Player</SelectItem>
                  <SelectItem value={user.id}>{user.nickname}</SelectItem>
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-brand-orange hover:bg-orange-500"
              onClick={handleSavePlayers}
            >
              Save Players
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
