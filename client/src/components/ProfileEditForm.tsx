import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Save,
  RefreshCw,
  Upload,
  FileText,
  Image,
  Music,
} from "lucide-react";

interface ProfileEditFormProps {
  user: any;
  isManaged: boolean;
  isArtist: boolean;
  isMusicianProfile: boolean;
  isProfessional: boolean;
  isFan: boolean;
  hasActiveSubscription?: boolean;
}

export default function ProfileEditForm({
  user,
  isManaged,
  isArtist,
  isMusicianProfile,
  isProfessional,
  isFan,
  hasActiveSubscription = false,
}: ProfileEditFormProps) {
  // State to track if the user has a profile
  const [hasProfile, setHasProfile] = useState(false);

  // console.log(user)

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    stageName: "",
    bio: "",
    primaryGenre: "",
    basePrice: "",
    idealPerformanceRate: "",
    minimumAcceptableRate: "",
    epkUrl: "",
    websiteUrl: "",
    bookingFormPictureUrl: "",
    profilePictureUrl: user?.avatarUrl || "",
    profileBannerUrl: user?.coverImageUrl || "",
    privacySetting: user?.privacySetting || "public",
    primaryTalentId: null,
  });


  const [uploadingFiles, setUploadingFiles] = useState({
    epk: false,
    bookingPhoto: false,
    profilePicture: false,
    profileBanner: false,
  });

  // Fetch available instruments/skills for all talent users (artists, musicians, professionals)
  const { data: availableInstruments = [] } = useQuery({
    queryKey: ["/api/instruments"],
    enabled: isArtist || isMusicianProfile || isProfessional,
  });



  
  useEffect(() => {
    if (user) {
      // Basic user info
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        privacySetting: user.privacySetting || "public",
        profilePictureUrl: user.avatarUrl || "",
        profileBannerUrl: user.coverImageUrl || "",
      }));
  
      // Multi-role support
      if (user.roleData && user.roleData.length > 0) {
        const mergedRoleData = user.roleData.reduce((acc, roleEntry) => {
          const rd = roleEntry.data || {};
          return {
            ...acc,
            stageName: rd.stageName ?? acc.stageName ?? "",
            bio: rd.bio ?? acc.bio ?? "",
            primaryGenre: rd.primaryGenre ?? acc.primaryGenre ?? "",
            basePrice: rd.basePrice ?? acc.basePrice ?? "",
            idealPerformanceRate: rd.idealPerformanceRate ?? acc.idealPerformanceRate ?? "",
            minimumAcceptableRate: rd.minimumAcceptableRate ?? acc.minimumAcceptableRate ?? "",
            epkUrl: rd.epkUrl ?? acc.epkUrl ?? "",
            bookingFormPictureUrl: rd.bookingFormPictureUrl ?? acc.bookingFormPictureUrl ?? "",
            websiteUrl: rd.websiteUrl ?? acc.websiteUrl ?? "",
            primaryTalentId: rd.primaryTalentId ?? acc.primaryTalentId ?? 1, 
          };
        }, {});
  
        setFormData((prev) => ({
          ...prev,
          ...mergedRoleData
        }));
  
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
    }
  }, [user]);
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // Validate required fields

      console.log(data)
    
       const roleDataPayload: any = {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        privacySetting: data.privacySetting,
        avatarUrl: data.profilePictureUrl,
        coverImageUrl: data.profileBannerUrl,
        stageName: data.stageName,
        bio: data.bio,
        primaryGenre: data.primaryGenre,
        basePrice: data.basePrice ? parseFloat(data.basePrice) : null,
        idealPerformanceRate: data.idealPerformanceRate
          ? parseFloat(data.idealPerformanceRate)
          : null,
        minimumAcceptableRate: data.minimumAcceptableRate
          ? parseFloat(data.minimumAcceptableRate)
          : null,
        epkUrl: data.epkUrl,
        bookingFormPictureUrl: data.bookingFormPictureUrl,
        websiteUrl: data.websiteUrl,
        primaryTalentId: data.primaryTalentId ,
      };

      await apiRequest(`/api/user/profile`, {
        method: "PATCH",
        body: JSON.stringify(roleDataPayload),
      });

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/current-user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (
    file: File,
    type: "epk" | "bookingPhoto" | "profilePicture" | "profileBanner"
  ) => {
    if (!file) return;

    setUploadingFiles((prev) => ({ ...prev, [type]: true }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("files", file);
      let category = "profile-images";
      if (type === "epk") category = "epk";
      else if (type === "bookingPhoto") category = "booking-photos";
      else if (type === "profilePicture") category = "profile-pictures";
      else if (type === "profileBanner") category = "profile-banners";

      formDataUpload.append("category", category);
      formDataUpload.append("isPublic", "false");

      const response = await fetch("/api/media/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      const uploadedFile = result.files?.[0];
      const fileUrl = uploadedFile?.url || `/uploads/${uploadedFile?.fileName}`;

      // Update the form data with the uploaded file URL
      if (type === "epk") {
        handleInputChange("epkUrl", fileUrl);
      } else if (type === "bookingPhoto") {
        handleInputChange("bookingFormPictureUrl", fileUrl);
      } else if (type === "profilePicture") {
        handleInputChange("profilePictureUrl", fileUrl);
      } else if (type === "profileBanner") {
        handleInputChange("profileBannerUrl", fileUrl);
      }

      const typeNames = {
        epk: "EPK",
        bookingPhoto: "Booking photo",
        profilePicture: "Profile picture",
        profileBanner: "Profile banner",
      };

      toast({
        title: "File Uploaded",
        description: `${typeNames[type]} uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <User className="h-5 w-5" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* Profile Picture Upload - Available to all non-fan users */}
          {(isArtist || isMusicianProfile || isProfessional )&& (
            <div className="space-y-2">
              <Label htmlFor="profilePictureUrl">Profile Picture</Label>
              <div className="flex gap-2">
                <Input
                  id="profilePictureUrl"
                  type="url"
                  value={formData.profilePictureUrl}
                  onChange={(e) =>
                    handleInputChange("profilePictureUrl", e.target.value)
                  }
                  placeholder="https://your-profile-picture.com/image.jpg or upload below"
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Or upload image:
                </span>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "profilePicture");
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingFiles.profilePicture}
                    asChild
                  >
                    <span>
                      {uploadingFiles.profilePicture ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Image className="h-4 w-4 mr-1" />
                      )}
                      {uploadingFiles.profilePicture
                        ? "Uploading..."
                        : "Upload Picture"}
                    </span>
                  </Button>
                </label>
              </div>
              {formData.profilePictureUrl && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Current profile picture:</span>{" "}
                  <a
                    href={formData.profilePictureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {formData.profilePictureUrl.includes("/uploads/")
                      ? "Uploaded image"
                      : "External URL"}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Profile Banner Upload - Available to managed users or users with active subscription */}
          {( isArtist || isMusicianProfile || isProfessional ) && (isManaged || hasActiveSubscription) && (
            <div className="space-y-2">
              <Label htmlFor="profileBannerUrl">Profile Banner</Label>
              <div className="flex gap-2">
                <Input
                  id="profileBannerUrl"
                  type="url"
                  value={formData.profileBannerUrl}
                  onChange={(e) =>
                    handleInputChange("profileBannerUrl", e.target.value)
                  }
                  placeholder="https://your-profile-banner.com/banner.jpg or upload below"
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Or upload banner:
                </span>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "profileBanner");
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingFiles.profileBanner}
                    asChild
                  >
                    <span>
                      {uploadingFiles.profileBanner ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Image className="h-4 w-4 mr-1" />
                      )}
                      {uploadingFiles.profileBanner
                        ? "Uploading..."
                        : "Upload Banner"}
                    </span>
                  </Button>
                </label>
              </div>
              {formData.profileBannerUrl && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Current profile banner:</span>{" "}
                  <a
                    href={formData.profileBannerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {formData.profileBannerUrl.includes("/uploads/")
                      ? "Uploaded image"
                      : "External URL"}
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
              />
            </div>
            {(isArtist || isMusicianProfile) && (
              <div className="space-y-2">
                <Label htmlFor="stageName">Stage Name</Label>
                <Input
                  id="stageName"
                  value={formData.stageName}
                  onChange={(e) =>
                    handleInputChange("stageName", e.target.value)
                  }
                  placeholder="Your stage/performance name"
                />
              </div>
            )}
          </div>

          {/* Bio */}
          {(isArtist ||isMusicianProfile|| isProfessional) && (
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
          )}

          {/* Primary Talent Selection for Artists, Musicians and Professionals */}
          {(isArtist || isMusicianProfile || isProfessional) && (
            <div className="space-y-2">
              <Label htmlFor="primaryTalent">
                <Music className="h-4 w-4 inline mr-1" />
                Primary Talent/Skill
              </Label>
              <Select
                value={String(formData.primaryTalentId || "")}
                onValueChange={(value) =>
                  handleInputChange(
                    "primaryTalentId",
                    value ? parseInt(value) : null
                  )
                }
              >
                <SelectTrigger id="primaryTalent">
                  <SelectValue placeholder="Select your primary talent or skill" />
                </SelectTrigger>
                <SelectContent>
                  {/* Sort instruments to show vocals first for artists */}
                  {(availableInstruments as any[])
                    .sort((a, b) => {
                      // For artists, prioritize vocals mixer_group
                      if (isArtist && a.mixer_group === "vocals") return -1;
                      if (isArtist && b.mixer_group === "vocals") return 1;
                      return a.name.localeCompare(b.name);
                    })
                    .map((instrument: any) => (
                      <SelectItem
                        key={instrument.id}
                        value={String(instrument.id)}
                      >
                        {instrument.name} - {instrument.category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {isArtist
                  ? "Select your primary performance skill (e.g., Lead Vocals, Guitar, etc.)"
                  : "This helps identify your main expertise for bookings and assignments"}
              </p>
            </div>
          )}

          {/* Artist-specific fields */}
          {isArtist && (
            <>
              <div className="space-y-2">
                <Label htmlFor="primaryGenre">Primary Genre</Label>
                <Input
                  id="primaryGenre"
                  value={formData.primaryGenre}
                  onChange={(e) =>
                    handleInputChange("primaryGenre", e.target.value)
                  }
                  placeholder="e.g., Jazz, Rock, Pop"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) =>
                      handleInputChange("basePrice", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idealPerformanceRate">Ideal Rate ($)</Label>
                  <Input
                    id="idealPerformanceRate"
                    type="number"
                    value={formData.idealPerformanceRate}
                    onChange={(e) =>
                      handleInputChange("idealPerformanceRate", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumAcceptableRate">
                    Minimum Rate ($)
                  </Label>
                  <Input
                    id="minimumAcceptableRate"
                    type="number"
                    value={formData.minimumAcceptableRate}
                    onChange={(e) =>
                      handleInputChange("minimumAcceptableRate", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              {/* EPK Upload/URL */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="epkUrl">EPK (Electronic Press Kit)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="epkUrl"
                      type="url"
                      value={formData.epkUrl}
                      onChange={(e) =>
                        handleInputChange("epkUrl", e.target.value)
                      }
                      placeholder="https://your-epk-url.com or upload file below"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Or upload EPK file:
                    </span>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "epk");
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingFiles.epk}
                        asChild
                      >
                        <span>
                          {uploadingFiles.epk ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4 mr-1" />
                          )}
                          {uploadingFiles.epk ? "Uploading..." : "Upload EPK"}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Preview uploaded files */}
                {formData.epkUrl && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Current EPK:</span>{" "}
                    <a
                      href={formData.epkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {formData.epkUrl.includes("/uploads/")
                        ? "Uploaded file"
                        : "External URL"}
                    </a>
                  </div>
                )}

                {/* Booking Photo Upload/URL */}
                <div className="space-y-2">
                  <Label htmlFor="bookingFormPictureUrl">
                    Booking Form Picture
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="bookingFormPictureUrl"
                      type="url"
                      value={formData.bookingFormPictureUrl}
                      onChange={(e) =>
                        handleInputChange(
                          "bookingFormPictureUrl",
                          e.target.value
                        )
                      }
                      placeholder="https://your-picture-url.com/image.jpg or upload file below"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Or upload image:
                    </span>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "bookingPhoto");
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingFiles.bookingPhoto}
                        asChild
                      >
                        <span>
                          {uploadingFiles.bookingPhoto ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Image className="h-4 w-4 mr-1" />
                          )}
                          {uploadingFiles.bookingPhoto
                            ? "Uploading..."
                            : "Upload Photo"}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {formData.bookingFormPictureUrl && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Current booking photo:</span>{" "}
                    <a
                      href={formData.bookingFormPictureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {formData.bookingFormPictureUrl.includes("/uploads/")
                        ? "Uploaded image"
                        : "External URL"}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Musician-specific fields */}
          {isMusicianProfile && !isArtist && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price ($)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) =>
                    handleInputChange("basePrice", e.target.value)
                  }
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idealPerformanceRate">Ideal Rate ($)</Label>
                <Input
                  id="idealPerformanceRate"
                  type="number"
                  value={formData.idealPerformanceRate}
                  onChange={(e) =>
                    handleInputChange("idealPerformanceRate", e.target.value)
                  }
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumAcceptableRate">Minimum Rate ($)</Label>
                <Input
                  id="minimumAcceptableRate"
                  type="number"
                  value={formData.minimumAcceptableRate}
                  onChange={(e) =>
                    handleInputChange("minimumAcceptableRate", e.target.value)
                  }
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          )}

          {/* Professional-specific fields */}
          {isProfessional && (
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) =>
                  handleInputChange("websiteUrl", e.target.value)
                }
                placeholder="https://your-website.com"
              />
            </div>
          )}

          {/* Privacy Settings */}
          <div className="flex items-center space-x-2">
            <Switch
              id="privacy"
              checked={formData.privacySetting === "public"}
              onCheckedChange={(checked) =>
                handleInputChange(
                  "privacySetting",
                  checked ? "public" : "private"
                )
              }
            />
            <Label htmlFor="privacy">Public Profile</Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
