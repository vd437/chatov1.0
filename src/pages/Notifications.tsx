import { useState } from "react";
import { Bell, Heart, MessageCircle, UserPlus, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: "like" | "comment" | "friend_request" | "message";
  user: {
    name: string;
    avatar?: string;
  };
  content: string;
  time: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "friend_request",
    user: { name: "Sarah Johnson" },
    content: "sent you a friend request",
    time: "2 min ago",
    isRead: false,
  },
  {
    id: "2",
    type: "like",
    user: { name: "Mike Chen" },
    content: "liked your story",
    time: "1 hour ago",
    isRead: false,
  },
  {
    id: "3",
    type: "comment",
    user: { name: "Emma Wilson" },
    content: "commented on your post",
    time: "3 hours ago",
    isRead: true,
  },
  {
    id: "4",
    type: "message",
    user: { name: "John Doe" },
    content: "sent you a message",
    time: "5 hours ago",
    isRead: true,
  },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-destructive" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-primary" />;
      case "friend_request":
        return <UserPlus className="h-5 w-5 text-accent" />;
      case "message":
        return <MessageCircle className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const handleAcceptRequest = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleDeclineRequest = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-2 sticky top-16 z-10 bg-background">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-accent/5 transition-colors ${
                      !notification.isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={notification.user.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {notification.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getIcon(notification.type)}
                          <p className="text-sm">
                            <span className="font-semibold">
                              {notification.user.name}
                            </span>{" "}
                            {notification.content}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notification.time}
                        </p>
                        {notification.type === "friend_request" && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(notification.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeclineRequest(notification.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="divide-y divide-border">
                {notifications
                  .filter((n) => !n.isRead)
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-accent/5 transition-colors bg-primary/5"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={notification.user.avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {notification.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getIcon(notification.type)}
                            <p className="text-sm">
                              <span className="font-semibold">
                                {notification.user.name}
                              </span>{" "}
                              {notification.content}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {notification.time}
                          </p>
                          {notification.type === "friend_request" && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptRequest(notification.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDeclineRequest(notification.id)
                                }
                              >
                                <X className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Notifications;
