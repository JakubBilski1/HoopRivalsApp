"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Friendships, Friendship } from "@/types/Friendships";
import { toast } from "sonner";

interface FriendsListProps {
  onAddFriend: () => void;
  inviteSent: boolean;
  setInviteSent: (value: boolean) => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({
  onAddFriend,
  inviteSent,
  setInviteSent,
}) => {
  const [friendships, setFriendships] = useState<Friendships | null>(null);

  // Function to fetch the current friendships data.
  const fetchFriendships = async () => {
    try {
      const response = await fetch("/api/friendships", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (!friendships) {
        setFriendships(data);
      } else {
        setFriendships((prevValue) => (prevValue = data));
      }
    } catch (error) {
      console.error("Error fetching friendships:", error);
    }
  };

  useEffect(() => {
    // This effect runs whenever `inviteSent` changes:
    fetchFriendships();

    if (inviteSent) {
      setInviteSent(false);
    }
  }, [inviteSent]);

  // Accept a friend request, then refresh the list.
  const handleAccept = async (friendId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/friendships/changeStatus", {
        method: "POST",
        body: JSON.stringify({ friendId, token, status: "ACCEPTED" }),
      });
      if (response.status === 200) {
        toast.success("Friend request accepted!");
        fetchFriendships();
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  // Decline a friend request, then refresh the list.
  const handleDecline = async (friendId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/friendships/changeStatus", {
        method: "POST",
        body: JSON.stringify({ friendId, token, status: "DECLINED" }),
      });
      if (response.status === 200) {
        toast.success("Friend request declined!");
        fetchFriendships();
      }
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  return (
    <Card className="bg-gray-800 text-white flex flex-col">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-xl">Friends & Requests</CardTitle>
          <CardDescription className="text-gray-400">
            Connect with friends and manage requests on Hoop rivals
          </CardDescription>
        </div>
        <Button
          variant="default"
          className="bg-brand-orange hover:bg-orange-600 text-white cursor-pointer"
          onClick={onAddFriend}
        >
          Add Friend
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Friends List */}
          <div>
            <h3 className="text-lg font-bold mb-2">Friends</h3>
            <ScrollArea className="h-64 rounded-md border border-gray-700">
              <div className="space-y-3 p-4">
                {friendships?.friends && friendships.friends.length > 0 ? (
                  friendships.friends.map((friendship: Friendship) => (
                    <div
                      key={friendship.friend.id}
                      className="p-3 bg-gray-700 rounded-md flex justify-between items-center"
                    >
                      <span>{friendship.friend.nickname}</span>
                      {friendship.status === "PENDING" && (
                        <span className="ml-2 text-sm text-yellow-500">
                          (pending)
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-gray-700 rounded-md">
                    No friends found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          {/* Friend Requests */}
          <div>
            <h3 className="text-lg font-bold mb-2">Friend Requests</h3>
            <ScrollArea className="h-64 rounded-md border border-gray-700">
              <div className="space-y-3 p-4">
                {friendships?.requests && friendships.requests.length > 0 ? (
                  friendships.requests.map((friendship: Friendship) => (
                    <div
                      key={friendship.friend.id}
                      className="p-2 pl-3  bg-gray-700 rounded-md flex justify-between items-center"
                    >
                      <span>{friendship.friend.nickname}</span>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-500"
                          onClick={() => handleAccept(friendship.friend.id)}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleDecline(friendship.friend.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-gray-700 rounded-md">
                    No friend requests.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
