import { useState } from "react";
import { ArrowLeft, Camera, User, Mail, Phone, Calendar, Edit } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  
  const [name, setName] = useState("User Name");
  const [email, setEmail] = useState("user@example.com");
  const [phone, setPhone] = useState("+1234567890");
  const [bio, setBio] = useState("Hey there! I'm using this app.");
  const [birthday, setBirthday] = useState("1990-01-01");
  const [profileImage, setProfileImage] = useState("");

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
    navigate("/profile");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isEditMode) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Edit Profile</h1>
            </div>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground">
              Save
            </Button>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex justify-center py-6">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={profileImage} alt={name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profile-image-upload"
              />
              <label htmlFor="profile-image-upload">
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-10 w-10 bg-primary text-primary-foreground shadow-lg"
                  type="button"
                  onClick={() => document.getElementById("profile-image-upload")?.click()}
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </label>
            </div>
          </div>

          {/* Profile Information Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Birthday (optional)
              </Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View Mode
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">My Profile</h1>
          </div>
          <Button 
            onClick={() => navigate("/profile?edit=true")}
            className="bg-primary text-primary-foreground gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Picture Section */}
        <div className="flex justify-center py-6">
          <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
            <AvatarImage src={profileImage} alt={name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Profile Information */}
        <div className="bg-card rounded-lg border border-border p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Name</span>
              </div>
              <p className="text-lg font-medium">{name}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Bio</span>
              </div>
              <p className="text-base">{bio}</p>
            </div>

            {birthday && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Birthday</span>
                </div>
                <p className="text-base">
                  {new Date(birthday).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Account Information</h3>
          <p className="text-sm">
            Member since: January 2024
          </p>
          <p className="text-sm text-muted-foreground">
            Some information may be visible to other users of this app.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
