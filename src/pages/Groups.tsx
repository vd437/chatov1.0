import { useState } from "react";
import { Users, Plus, Search, Crown, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Group {
  id: string;
  name: string;
  avatar?: string;
  memberCount: number;
  isAdmin: boolean;
  unreadCount?: number;
  lastActivity: string;
}

const mockGroups: Group[] = [
  {
    id: "1",
    name: "Family Group",
    memberCount: 8,
    isAdmin: true,
    unreadCount: 5,
    lastActivity: "2 min ago",
  },
  {
    id: "2",
    name: "Work Team",
    memberCount: 15,
    isAdmin: false,
    unreadCount: 12,
    lastActivity: "1 hour ago",
  },
  {
    id: "3",
    name: "Book Club",
    memberCount: 24,
    isAdmin: false,
    lastActivity: "Yesterday",
  },
  {
    id: "4",
    name: "Fitness Buddies",
    memberCount: 10,
    isAdmin: true,
    lastActivity: "2 days ago",
  },
];

const Groups = () => {
  const navigate = useNavigate();
  const [groups] = useState(mockGroups);
  const [searchQuery, setSearchQuery] = useState("");
  const [newGroupName, setNewGroupName] = useState("");

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = () => {
    // Logic to create a new group
    setNewGroupName("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Groups</h1>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleCreateGroup}>
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="p-4 space-y-2">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-card rounded-lg border border-border p-4 hover:shadow-soft transition-all cursor-pointer"
              onClick={() => navigate(`/group/${group.id}`)}
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={group.avatar} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {group.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{group.name}</h3>
                    {group.isAdmin && (
                      <Crown className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{group.memberCount} members</span>
                    <span>•</span>
                    <span>{group.lastActivity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {group.unreadCount && (
                    <Badge className="bg-primary text-primary-foreground">
                      {group.unreadCount}
                    </Badge>
                  )}
                  {group.isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to group settings
                      }}
                    >
                      <SettingsIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Groups;
