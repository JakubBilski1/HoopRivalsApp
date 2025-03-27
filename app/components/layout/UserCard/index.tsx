"use client";

import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import { User } from "@/types/User";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useUser } from "@/app/context/UserContext";
import ButtonLoading from "@/app/button-loading"

interface UserCardProps {
  userData?: User;
  onLogout: () => void;
  fetchUser: () => void;
  loading?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ userData, onLogout, fetchUser, loading }) => {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    avatar: "",
    password: "",
    nickname: "",
    name: "",
    surname: "",
    email: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setUser } = useUser();

  useEffect(() => {
    if (userData) {
      setFormData({
        avatar: userData.avatarUrl || "",
        password: "",
        nickname: userData.nickname,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
      });
      setPreviewUrl(userData.avatarUrl || "");
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // For preview, create a local URL
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      // Convert file to base64 string
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        userData: formData,
      };
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(errorText);
        setIsLoading(false);
        return;
      }
      
      const responseData = await response.json();
      setUser(responseData);
      toast.success("User data updated successfully");
      setFormData({
        avatar: responseData.avatarUrl || "",
        password: "",
        nickname: responseData.nickname,
        name: responseData.name,
        surname: responseData.surname,
        email: responseData.email,
      });
      setPreviewUrl(responseData.avatarUrl || "");
      setOpen(false);
      fetchUser();
    } catch (error) {
      console.error("Failed to update user data", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="bg-gray-800 text-white">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={previewUrl || "/placeholder.webp"} alt="User Avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {userData?.name} {userData?.surname}
              </CardTitle>
              <CardDescription className="text-gray-400">@{userData?.nickname}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Button variant="default" className="bg-brand-orange hover:bg-orange-600 text-white" onClick={onLogout}>
            {loading ? <ButtonLoading /> : "Logout"}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="bg-brand-orange hover:bg-orange-600 text-white">
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your avatar, password, nickname, name, surname, and email.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Avatar upload with preview */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={previewUrl || "/placeholder.webp"} alt="Avatar Preview" />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar">Avatar</Label>
                    <input
                      id="avatar"
                      name="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      Upload Photo
                    </Button>
                  </div>
                </div>
                {/* End Avatar upload */}
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-gray-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input
                    id="nickname"
                    name="nickname"
                    type="text"
                    placeholder="Enter nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    className="bg-gray-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-gray-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="surname">Surname</Label>
                  <Input
                    id="surname"
                    name="surname"
                    type="text"
                    placeholder="Enter surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    className="bg-gray-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-700 text-white"
                  />
                </div>
                <DialogFooter className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" variant="default" disabled={isLoading}>
                    {isLoading ? <ButtonLoading /> : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
};
