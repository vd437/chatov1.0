import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface StoryPrivacySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
}

export const StoryPrivacySettings = ({
  open,
  onOpenChange,
  onBack,
}: StoryPrivacySettingsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const allUsers: User[] = [
    { id: "1", name: "Sarah Connor", avatar: "/placeholder.svg" },
    { id: "2", name: "John Smith", avatar: "/placeholder.svg" },
    { id: "3", name: "Emma Wilson", avatar: "/placeholder.svg" },
    { id: "4", name: "Michael Brown", avatar: "/placeholder.svg" },
  ];

  const filteredUsers = allUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserBlock = (userId: string) => {
    setBlockedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = () => {
    toast.success("Privacy settings saved");
    onBack();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle>Story Privacy</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Hide Story From</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select people who won't be able to see your stories
            </p>

            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />

            <div className="border rounded-lg overflow-hidden">
              <ScrollArea className="h-[250px]">
                <div className="space-y-1 p-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                      <Checkbox
                        checked={blockedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUserBlock(user.id)}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {blockedUsers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">
                Hidden from ({blockedUsers.length})
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <ScrollArea className="max-h-[120px]">
                  <div className="space-y-1 p-2">
                    {allUsers
                      .filter((user) => blockedUsers.includes(user.id))
                      .map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-accent"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{user.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleUserBlock(user.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
