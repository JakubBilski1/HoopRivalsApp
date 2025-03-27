"use client";

import { useState, useEffect } from "react";
import { User, ShortenedUser } from "@/types/User";
import { Friendships } from "@/types/Friendships";
import { UserCard } from "@/app/components/layout/UserCard";
import { StatsCards } from "@/app/components/layout/StatsCards";
import { PerformanceStats } from "@/app/components/layout/PerformanceStats";
import { FriendsList } from "@/app/components/layout/FriendsList";
import { AddFriendDialog } from "@/app/components/Dialogs/AddFriendDialog";
import { toast } from "sonner";
import { FullStatsData } from "@/types/Matches";
import Loading from "@/app/loading";
import { useUser } from "@/app/context/UserContext";
import { cookies } from "next/headers";


const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<User>();
  const [matchesModalOpen, setMatchesModalOpen] = useState(false);
  const [friendDialogOpen, setFriendDialogOpen] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [inviteSent, setInviteSent] = useState(false);
  const [stats, setStats] = useState<FullStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser } = useUser();

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stats", {
        method: "GET"
      });
      const data = await response.json();
      console.log(data);
      setStats(data.overallStats);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error fetching stats");
      setLoading(false);
    }finally {
      setLoading(false);
    }
  }

  const fetchUser = async () => {
    const response = await fetch("/api/user", {
      method: "GET"
    });
    if(response.status === 401) {
      window.location.href = "/login";
    } else if(response.status === 200) {
      const data = await response.json();
      if(!userData) {
        setUserData(data)
      } else {
        setUserData(prev => prev = data)
      }
      setUser(data);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchAllStats();
  }, []);

  

  const handleLogout = async () => {
    try {
      (await cookies()).delete('hoop-rivals-auth-token')
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUserId((prev) => (prev === id ? null : id));
  };

  const handleSendInvite = async (userId: string) => {
    try {
      const response = await fetch("/api/friendships", {
        method: "POST",
        body: JSON.stringify({
          friendUserId: userId,
        }),
      });
      if(response.status === 200) {
        toast.success("Invite sent succesfully!");
      }
      setInviteSent(true);
      setFriendDialogOpen(false);
      setFriendSearchQuery("");
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error sending invite:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 flex flex-col gap-4 mt-4">
      <UserCard userData={userData} onLogout={handleLogout} fetchUser={fetchUser} />
      {stats ?  <StatsCards stats={stats} /> : <Loading />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats ? <PerformanceStats stats={stats} /> : <Loading />}
        <FriendsList onAddFriend={() => setFriendDialogOpen(true)} inviteSent={inviteSent} setInviteSent={setInviteSent} />
      </div>
      <AddFriendDialog
        open={friendDialogOpen}
        onClose={() => setFriendDialogOpen(false)}
        friendSearchQuery={friendSearchQuery}
        setFriendSearchQuery={setFriendSearchQuery}
        selectedUserId={selectedUserId}
        handleSelectUser={handleSelectUser}
        handleSendInvite={handleSendInvite}
      />
    </div>
  );
};

export default UserProfile;