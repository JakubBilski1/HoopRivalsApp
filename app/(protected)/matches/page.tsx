// app/(protected)/matches/MatchesPage.tsx

"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Match, MatchParams } from "@/types/Matches";
import { MatchFilters } from "@/app/components/layout/matches/MatchFilters";
import { MatchesList } from "@/app/components/layout/matches/MatchesList";
import { AddMatchDialog } from "@/app/components/Dialogs/matches/AddMatchDialog";
import { EditMatchDialog } from "@/app/components/Dialogs/matches/EditMatchDialog";
import Loading from "@/app/loading";
import { Friendships } from "@/types/Friendships";
import { User } from "@/types/User";

export default function MatchesPage(): React.JSX.Element {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // ------------------------------------
  // Filter states
  // ------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMatchType, setFilterMatchType] = useState<
    "ALL" | "QUARTERS" | "POINTS"
  >("ALL");
  const [filterTeamSize, setFilterTeamSize] = useState<
    "ALL" | "1v1" | "2v2" | "3v3" | "4v4" | "5v5"
  >("ALL");
  const [filterPlayer, setFilterPlayer] = useState("");
  const [filterArena, setFilterArena] = useState("");
  const [filterDuration, setFilterDuration] = useState("");
  const [sortByScoring, setSortByScoring] = useState(false);
  const [filterWinLose, setFilterWinLose] = useState<"ALL" | "win" | "lose">(
    "ALL"
  );
  const [arenas, setArenas] = useState([]);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [friendships, setFriendships] = useState<Friendships | null>(null);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);

  const [user, setUser] = useState<User>({
    id: "",
    name: "",
    email: "",
    surname: "",
    nickname: "",
    password: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const getInitialMatchState = (): MatchParams => ({
    matchType: "QUARTERS",
    pointsToWin: null,
    teamSize: 1,
    date: new Date().toISOString().split("T")[0], // default to today
    arenaId: 0, // empty arena by default (select will show placeholder)
    teamA: [user], // always default teamA with the current user
    teamB: [],
    quarters: [
      { number: 1, duration: 12 },
      { number: 2, duration: 12 },
      { number: 3, duration: 12 },
      { number: 4, duration: 12 },
    ],
  });
  const [newMatch, setNewMatch] = useState<MatchParams>(getInitialMatchState());
  // ------------------------------------
  // Fetching data
  // ------------------------------------
  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user", {
        method: "GET"
      });
      const data = await response.json();

      // 1) Set your user
      setUser(data);

      // 2) If you want them in teamA by default:
      setNewMatch((prev) => ({
        ...prev,
        teamA: [
          {
            id: data.id,
            nickname: data.nickname,
            avatarUrl: null,
          },
        ],
      }));
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchFriendships = async () => {
    try {
      const response = await fetch("/api/friendships", {
        method: "GET"
      });
      const data = await response.json();
      setFriendships(data);
    } catch (error) {
      console.error("Error fetching friendships:", error);
    }
  };

  const fetchArenas = async () => {
    try {
      const response = await fetch("/api/arenas", {
        method: "GET"
      });
      const data = await response.json();
      setArenas(data);
    } catch (error) {
      console.error("Error fetching arenas:", error);
    }
  };

  async function fetchMatches() {
    setLoading(true);
    try {
      const response = await fetch("/api/matches");
      if (!response.ok) {
        toast.error("Failed to fetch matches");
        return;
      }
      if (response.status === 200) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------
  // Lifecycle
  // ------------------------------------
  useEffect(() => {
    fetchMatches();
    fetchFriendships();
    fetchArenas();
    fetchUser();
  }, []);

  // ------------------------------------
  // Handlers
  // ------------------------------------
  async function addMatch() {
    try {
      console.log(newMatch);
      const response = await fetch("/api/matches", {
        method: "POST",
        body: JSON.stringify({
          ...newMatch,
        }),
      });
      let error = "";
      if (!response.ok) {
        error = await response.text();
      }
      if (response.status === 400) {
        toast.error(error);
      } else if (response.status === 200) {
        console.log("Match added successfully");
        fetchMatches();
        toast.success("Match added successfully");
        setAddDialogOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updateMatch() {
    if (!editingMatch) return;
    try {
      const response = await fetch(`/api/matches/${editingMatch.id}`, {
        method: "PUT",
        body: JSON.stringify({
          date: newMatch.date,
          arenaId: newMatch.arenaId,
        }),
      });
      if (!response.ok) {
        toast.error("Failed to update match");
        return;
      }
      if (response.status === 400) {
        toast.error(await response.text());
      }
      if (response.status === 200) {
        fetchMatches();
        toast.success("Match updated successfully");
        setEditingMatch(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteMatch(id: number) {
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        toast.error("Failed to delete match");
        return;
      }
      if (response.status === 200) {
        fetchMatches();
        toast.success("Match deleted successfully");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // When user clicks edit, set editingMatch and pre-populate newMatch with date and arena
  function handleEditClick(match: Match) {
    setEditingMatch(match);
    setNewMatch({
      // Although we only allow editing date and arena, we can preserve other values
      matchType: match.matchType,
      pointsToWin: match.pointsToWin,
      teamSize: match.teamSize,
      quarters: match.quarterMatch?.quarters.map((q) => ({
        number: q.number,
        duration: q.duration,
      })) || [
        { number: 1, duration: 12 },
        { number: 2, duration: 12 },
        { number: 3, duration: 12 },
        { number: 4, duration: 12 },
      ],
      teamA:
        match.teams[0]?.teamPlayers.map((tp) => ({
          id: tp.player.id,
          nickname: tp.player.nickname,
        })) || [],
      teamB:
        match.teams[1]?.teamPlayers.map((tp) => ({
          id: tp.player.id,
          nickname: tp.player.nickname,
        })) || [],
      date: match.date.split("T")[0],
      arenaId: match.arena?.id || 1,
    });
  }

  function closeEditDialog() {
    setEditingMatch(null);
    setNewMatch(getInitialMatchState());
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mt-4 w-full">
      {/* Sidebar filters */}
      {/* <MatchFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterMatchType={filterMatchType}
        onFilterMatchTypeChange={setFilterMatchType}
        filterTeamSize={filterTeamSize}
        onFilterTeamSizeChange={setFilterTeamSize}
        filterPlayer={filterPlayer}
        onFilterPlayerChange={setFilterPlayer}
        filterArena={filterArena}
        onFilterArenaChange={setFilterArena}
        filterDuration={filterDuration}
        onFilterDurationChange={setFilterDuration}
        sortByScoring={sortByScoring}
        onSortByScoringChange={setSortByScoring}
        filterWinLose={filterWinLose}
        onFilterWinLoseChange={setFilterWinLose}
      /> */}

      {/* Main content */}
      <div className="md:h-[83vh] flex-1 bg-brand-dark p-4 overflow-auto rounded-md border">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Matches</h1>

          <AddMatchDialog
            newMatch={newMatch}
            onNewMatchChange={setNewMatch}
            onAddMatch={addMatch}
            friendships={friendships}
            arenas={arenas}
            user={user}
            dialogOpen={addDialogOpen}
            setDialogOpen={setAddDialogOpen}
            getInitialMatchState={getInitialMatchState}
          />

          <EditMatchDialog
            editingMatch={editingMatch}
            newMatch={newMatch}
            onNewMatchChange={setNewMatch}
            onClose={closeEditDialog}
            onUpdateMatch={updateMatch}
            arenas={arenas}
          />
        </div>

        {loading && (
          <div className="flex justify-center">
            <Loading />
          </div>
        )}

        {/* List of Matches */}
        <MatchesList
          matches={matches}
          onDelete={deleteMatch}
          onEdit={handleEditClick}
          fetchMatches={fetchMatches}
        />
      </div>
    </div>
  );
}
