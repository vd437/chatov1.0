import { useState } from "react";
import { Image, Video, Type, Upload, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoryPrivacySettings } from "@/components/StoryPrivacySettings";
import { toast } from "sonner";

interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: {
    id: string;
    name: string;
    avatar: string;
  };
}

export const CreateStoryDialog = ({
  open,
  onOpenChange,
  currentUser,
}: CreateStoryDialogProps) => {
  const [storyType, setStoryType] = useState<"media" | "text">("media");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [textContent, setTextContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#6366f1");
  const [textColor, setTextColor] = useState("#ffffff");
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (storyType === "media" && !mediaFile) {
      toast.error("Please select a photo or video");
      return;
    }
    if (storyType === "text" && !textContent.trim()) {
      toast.error("Please enter some text");
      return;
    }

    toast.success("Story published successfully!");
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setCaption("");
    setTextContent("");
    setBackgroundColor("#6366f1");
    setTextColor("#ffffff");
    setShowPrivacySettings(false);
  };

  if (showPrivacySettings) {
    return (
      <StoryPrivacySettings
        open={open}
        onOpenChange={onOpenChange}
        onBack={() => setShowPrivacySettings(false)}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <Tabs value={storyType} onValueChange={(v) => setStoryType(v as "media" | "text")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="media">Photo/Video</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
          </TabsList>

          <TabsContent value="media" className="space-y-4">
            {!mediaPreview ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="media-upload"
                  accept="image/*,video/*"
                  onChange={handleMediaSelect}
                  className="hidden"
                />
                <label htmlFor="media-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-2">
                      <Image className="h-8 w-8 text-muted-foreground" />
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Click to upload photo or video
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {mediaFile?.type.startsWith("video/") ? (
                    <video src={mediaPreview} controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="w-full h-full object-contain" />
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview(null);
                  }}
                  className="w-full"
                >
                  Change Media
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="caption">Caption (Optional)</Label>
              <Textarea
                id="caption"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-content">Text</Label>
              <Textarea
                id="text-content"
                placeholder="What's on your mind?"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bg-color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="bg-color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="text-color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>

            {textContent && (
              <div
                className="rounded-lg p-8 flex items-center justify-center min-h-[200px]"
                style={{ backgroundColor }}
              >
                <p
                  className="text-2xl font-bold text-center"
                  style={{ color: textColor }}
                >
                  {textContent}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPrivacySettings(true)}
            className="flex-1"
          >
            <Settings className="h-4 w-4 mr-2" />
            Privacy
          </Button>
          <Button onClick={handlePublish} className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
