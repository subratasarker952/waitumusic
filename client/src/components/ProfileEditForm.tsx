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



  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",

    profilePictureUrl: user?.avatarUrl || "",
    profileBannerUrl: user?.coverImageUrl || "",
    privacySetting: user?.privacySetting || "public",

    artistPrimaryTalentId: null,
    artistStageName: "",
    artistBio: "",
    artistPrimaryGenre: "",
    artistBasePrice: "",
    artistIdealPerformanceRate: "",
    artistMinimumAcceptableRate: "",
    epkUrl: "",
    artistBookingFormPictureUrl: "",

    musicianPrimaryTalentId: null,
    musicianStageName: "",
    musicianBio: "",
    musicianPrimaryGenre: "",
    musicianBasePrice: "",
    musicianIdealPerformanceRate: "",
    musicianMinimumAcceptableRate: "",
    musicianBookingFormPictureUrl: "",


    professionalPrimaryTalentId: null,
    professionalBasePrice: "",
    professionalIdealPerformanceRate: "",
    professionalMinimumAcceptableRate: "",
    professionalBookingFormPictureUrl: "",
    websiteUrl: "",
  });


  const [uploadingFiles, setUploadingFiles] = useState({
    epk: false,
    artistBookingPhoto: false,
    musicianBookingPhoto: false,
    professionalBookingPhoto: false,
    profilePicture: false,
    profileBanner: false,
  });

  // Fetch available instruments/skills for all talent users (artists, musicians, professionals)
  const { data: availableInstruments = [] } = useQuery({
    queryKey: ["/api/instruments"],
    enabled: isArtist || isMusicianProfile || isProfessional,
  });

  // শুধু Artists/Musicians
  const artistOrMusicianTalents = (availableInstruments as any[]).filter(
    (instrument) =>
      instrument.type !== "Professional" // Professional বাদ
  );

  // শুধু Professionals
  const professionalTalents = (availableInstruments as any[]).filter(
    (instrument) =>
      instrument.type === "Professional" && instrument.mixerGroup === "PROFESSIONAL"
  );

  console.log(availableInstruments)

  useEffect(() => {
    if (!user) return;
    if (!user.roleData || user.roleData.length === 0) return;

    // 🟢 Base fields
    let nextFormData: any = {
      fullName: user.fullName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      privacySetting: user.privacySetting || "public",
      profilePictureUrl: user.avatarUrl || "",
      profileBannerUrl: user.coverImageUrl || "",
    };

    // 🟢 Merge role-based fields
    nextFormData = user.roleData.reduce((acc, roleEntry) => {
      const rd = roleEntry.data || {};
      const roleId = roleEntry.role?.id;

      // 🎤 Artist (roleId 3,4)
      if ([3, 4].includes(roleId)) {
        return {
          ...acc,
          artistStageName: rd.stageName ?? acc.artistStageName ?? "",
          artistBio: rd.bio ?? acc.artistBio ?? "",
          artistPrimaryGenre: rd.primaryGenre ?? acc.artistPrimaryGenre ?? "",
          artistBasePrice: rd.basePrice ?? acc.artistBasePrice ?? "",
          artistIdealPerformanceRate: rd.idealPerformanceRate ?? acc.artistIdealPerformanceRate ?? "",
          artistMinimumAcceptableRate: rd.minimumAcceptableRate ?? acc.artistMinimumAcceptableRate ?? "",
          artistPrimaryTalentId: rd.primaryTalentId ?? acc.artistPrimaryTalentId ?? null,
          epkUrl: rd.epkUrl ?? acc.epkUrl ?? "",
          artistBookingFormPictureUrl: rd.bookingFormPictureUrl ?? acc.artistBookingFormPictureUrl ?? "",
        };
      }

      // 🎸 Musician (roleId 5,6)
      if ([5, 6].includes(roleId)) {
        return {
          ...acc,
          musicianStageName: rd.stageName ?? acc.musicianStageName ?? "",
          musicianBio: rd.bio ?? acc.musicianBio ?? "",
          musicianPrimaryGenre: rd.primaryGenre ?? acc.musicianPrimaryGenre ?? "",
          musicianBasePrice: rd.basePrice ?? acc.musicianBasePrice ?? "",
          musicianIdealPerformanceRate: rd.idealPerformanceRate ?? acc.musicianIdealPerformanceRate ?? "",
          musicianMinimumAcceptableRate: rd.minimumAcceptableRate ?? acc.musicianMinimumAcceptableRate ?? "",
          musicianPrimaryTalentId: rd.primaryTalentId ?? acc.musicianPrimaryTalentId ?? null,
          musicianBookingFormPictureUrl: rd.bookingFormPictureUrl ?? acc.musicianBookingFormPictureUrl ?? "",
        };
      }

      // 👔 Professional (roleId 7,8)
      if ([7, 8].includes(roleId)) {
        return {
          ...acc,
          professionalPrimaryTalentId: rd.primaryTalentId ?? acc.professionalPrimaryTalentId ?? null,
          professionalBasePrice: rd.basePrice ?? acc.professionalBasePrice ?? "",
          professionalIdealPerformanceRate: rd.idealServiceRate ?? acc.professionalIdealPerformanceRate ?? "",
          professionalMinimumAcceptableRate: rd.minimumAcceptableRate ?? acc.professionalMinimumAcceptableRate ?? "",
          professionalBookingFormPictureUrl: rd.bookingFormPictureUrl ?? acc.professionalBookingFormPictureUrl ?? "",
          websiteUrl: rd.websiteUrl ?? acc.websiteUrl ?? "",
        };
      }

      return acc;
    }, nextFormData);

    // 🟢 Single update
    setFormData(nextFormData);

  }, [user]);



  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // Validate required fields
      const roleDataPayload: any = {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,

        avatarUrl: data.profilePictureUrl,
        coverImageUrl: data.profileBannerUrl,
        privacySetting: data.privacySetting,

        artistPrimaryTalentId: data.primaryTalentId,
        artistStageName: data.artistStageName,
        artistBio: data.artistBio,
        artistPrimaryGenre: data.artistPrimaryGenre,
        artistBasePrice: data.artistBasePrice ? parseFloat(data.artistBasePrice) : null,
        artistIdealPerformanceRate: data.artistIdealPerformanceRate ? parseFloat(data.artistIdealPerformanceRate) : null,
        artistMinimumAcceptableRate: data.artistMinimumAcceptableRate ? parseFloat(data.artistMinimumAcceptableRate) : null,
        epkUrl: data.epkUrl,
        artistBookingFormPictureUrl: data.artistBookingFormPictureUrl,

        musicianPrimaryTalentId: data.musicianPrimaryTalentId,
        musicianStageName: data.musicianStageName,
        musicianBio: data.musicianBio,
        musicianPrimaryGenre: data.musicianPrimaryGenre,
        musicianBasePrice: data.musicianBasePrice ? parseFloat(data.musicianBasePrice) : null,
        musicianIdealPerformanceRate: data.musicianIdealPerformanceRate ? parseFloat(data.musicianIdealPerformanceRate) : null,
        musicianMinimumAcceptableRate: data.musicianMinimumAcceptableRate ? parseFloat(data.musicianMinimumAcceptableRate) : null,
        musicianBookingFormPictureUrl: data.musicianBookingFormPictureUrl,

        professionalPrimaryTalentId: data.professionalPrimaryTalentId,
        professionalBasePrice: data.professionalBasePrice ? parseFloat(data.professionalBasePrice) : null,
        professionalIdealPerformanceRate: data.professionalIdealPerformanceRate ? parseFloat(data.professionalIdealPerformanceRate) : null,
        professionalMinimumAcceptableRate: data.professionalMinimumAcceptableRate ? parseFloat(data.professionalMinimumAcceptableRate) : null,
        professionalBookingFormPictureUrl: data.professionalBookingFormPictureUrl,
        websiteUrl: data.websiteUrl,
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
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/musicians"] });
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
    type: "epk" | "artistBookingPhoto" | "musicianBookingPhoto" | "professionalBookingPhoto" | "profilePicture" | "profileBanner"
  ) => {
    if (!file) return;

    setUploadingFiles((prev) => ({ ...prev, [type]: true }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("files", file);
      let category = "profile-images";
      if (type === "epk") category = "epk";
      else if (type === "artistBookingPhoto") category = "artistBooking-photos";
      else if (type === "musicianBookingPhoto") category = "musicianBooking-photos";
      else if (type === "professionalBookingPhoto") category = "professionalBooking-photos";
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
      } else if (type === "artistBookingPhoto") {
        handleInputChange("artistBookingFormPictureUrl", fileUrl);
      } else if (type === "musicianBookingPhoto") {
        handleInputChange("musicianBookingFormPictureUrl", fileUrl);
      } else if (type === "professionalBookingPhoto") {
        handleInputChange("professionalBookingFormPictureUrl", fileUrl);
      } else if (type === "profilePicture") {
        handleInputChange("profilePictureUrl", fileUrl);
      } else if (type === "profileBanner") {
        handleInputChange("profileBannerUrl", fileUrl);
      }

      const typeNames = {
        epk: "EPK",
        artistBookingPhoto: "Artist Booking photo",
        musicianBookingPhoto: "Musician Booking photo",
        professionalBookingPhoto: "Professional Booking photo",
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
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
          {(isArtist || isMusicianProfile || isProfessional) && (
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
          {(isArtist || isMusicianProfile || isProfessional) && (isManaged || hasActiveSubscription) && (
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

          {/* Musician specific fields */}
          {(isArtist) && (
            <>
              <div className="space-y-2">
                <Label htmlFor="artistStageName">Artist Stage Name</Label>
                <Input
                  id="artistStageName"
                  value={formData.artistStageName}
                  onChange={(e) =>
                    handleInputChange("artistStageName", e.target.value)
                  }
                  placeholder="Your stage/performance name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artistBio">Artist Bio</Label>
                <Textarea
                  id="artistBio"
                  value={formData.artistBio}
                  onChange={(e) => handleInputChange("artistBio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artistPrimaryTalent">
                  <Music className="h-4 w-4 inline mr-1" />
                  Artist Primary Talent/Skill
                </Label>
                <Select
                  value={String(formData.artistPrimaryTalentId || "")}
                  onValueChange={(value) =>
                    handleInputChange(
                      "artistPrimaryTalentId",
                      value ? parseInt(value) : null
                    )
                  }
                >
                  <SelectTrigger id="artistPrimaryTalent">
                    <SelectValue placeholder="Select your primary talent or skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Sort instruments to show vocals first for artists */}
                    {artistOrMusicianTalents
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((instrument) => (
                        <SelectItem key={instrument.id} value={String(instrument.id)}>
                          {instrument.name} - {instrument.type}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select your primary performance skill (e.g., Lead Vocals, Guitar, etc)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="artistPrimaryGenre">Artist Primary Genre</Label>
                <Input
                  id="artistPrimaryGenre"
                  value={formData.artistPrimaryGenre}
                  onChange={(e) =>
                    handleInputChange("artistPrimaryGenre", e.target.value)
                  }
                  placeholder="e.g., Jazz, Rock, Pop"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="artistBasePrice">Artist Base Price ($)</Label>
                  <Input
                    id="artistBasePrice"
                    type="number"
                    value={formData.artistBasePrice}
                    onChange={(e) =>
                      handleInputChange("artistBasePrice", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artistIdealPerformanceRate">Ideal Rate ($)</Label>
                  <Input
                    id="artistIdealPerformanceRate"
                    type="number"
                    value={formData.artistIdealPerformanceRate}
                    onChange={(e) =>
                      handleInputChange("artistIdealPerformanceRate", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artistMinimumAcceptableRate">
                    Artist Minimum Rate ($)
                  </Label>
                  <Input
                    id="artistMinimumAcceptableRate"
                    type="number"
                    value={formData.artistMinimumAcceptableRate}
                    onChange={(e) =>
                      handleInputChange("artistMinimumAcceptableRate", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
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
              </div>

              <div className="space-y-4">
                {/* Booking Photo Upload/URL */}
                <div className="space-y-2">
                  <Label htmlFor="artistBookingFormPictureUrl">
                    Artist Booking Form Picture
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="artistBookingFormPictureUrl"
                      type="url"
                      value={formData.artistBookingFormPictureUrl}
                      onChange={(e) =>
                        handleInputChange(
                          "artistBookingFormPictureUrl",
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
                          if (file) handleFileUpload(file, "artistBookingPhoto");
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingFiles.artistBookingPhoto}
                        asChild
                      >
                        <span>
                          {uploadingFiles.artistBookingPhoto ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Image className="h-4 w-4 mr-1" />
                          )}
                          {uploadingFiles.artistBookingPhoto
                            ? "Uploading..."
                            : "Upload Photo"}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {formData.artistBookingFormPictureUrl && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Current booking photo:</span>{" "}
                    <a
                      href={formData.artistBookingFormPictureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {formData.artistBookingFormPictureUrl.includes("/uploads/")
                        ? "Uploaded image"
                        : "External URL"}
                    </a>
                  </div>
                )}
              </div>
              {/* <div className="flex items-center space-x-2">
                <Switch
                  id="artistPrivacy"
                  checked={formData.artistPrivacySetting === "public"}
                  onCheckedChange={(checked) =>
                    handleInputChange(
                      "artistPrivacySetting",
                      checked ? "public" : "private"
                    )
                  }
                />
                <Label htmlFor="artistPrivacy"> Artist Public Profile</Label>
              </div> */}
            </>
          )}


          {/* Musician specific fields */}
          {(isMusicianProfile) && (
            <>
              <div className="space-y-2">
                <Label htmlFor="musicianStageName">Musician Stage Name</Label>
                <Input
                  id="musicianStageName"
                  value={formData.musicianStageName}
                  onChange={(e) =>
                    handleInputChange("musicianStageName", e.target.value)
                  }
                  placeholder="Your stage/performance name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="musicianBio">Musician Bio</Label>
                <Textarea
                  id="musicianBio"
                  value={formData.musicianBio}
                  onChange={(e) => handleInputChange("musicianBio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="musicianPrimaryTalent">
                  <Music className="h-4 w-4 inline mr-1" />
                  Musician Primary Talent/Skill
                </Label>
                <Select
                  value={String(formData.musicianPrimaryTalentId || "")}
                  onValueChange={(value) =>
                    handleInputChange(
                      "musicianPrimaryTalentId",
                      value ? parseInt(value) : null
                    )
                  }
                >
                  <SelectTrigger id="musicianPrimaryTalent">
                    <SelectValue placeholder="Select your primary talent or skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Sort instruments to show vocals first for artists */}
                    {artistOrMusicianTalents
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((instrument) => (
                        <SelectItem key={instrument.id} value={String(instrument.id)}>
                          {instrument.name} - {instrument.type}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This helps identify your main expertise for bookings and assignments
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="musicianPrimaryGenre">Musician Primary Genre</Label>
                <Input
                  id="musicianPrimaryGenre"
                  value={formData.musicianPrimaryGenre}
                  onChange={(e) =>
                    handleInputChange("musicianPrimaryGenre", e.target.value)
                  }
                  placeholder="e.g., Jazz, Rock, Pop"
                />
              </div>


              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="musicianBasePrice">Musician Base Price ($)</Label>
                  <Input
                    id="musicianBasePrice"
                    type="number"
                    value={formData.musicianBasePrice}
                    onChange={(e) =>
                      handleInputChange("musicianBasePrice", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="musicianIdealPerformanceRate">Musician Ideal Rate ($)</Label>
                  <Input
                    id="musicianIdealPerformanceRate"
                    type="number"
                    value={formData.musicianIdealPerformanceRate}
                    onChange={(e) =>
                      handleInputChange("musicianIdealPerformanceRate", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="musicianMinimumAcceptableRate">Musician Minimum Rate ($)</Label>
                  <Input
                    id="musicianMinimumAcceptableRate"
                    type="number"
                    value={formData.musicianMinimumAcceptableRate}
                    onChange={(e) =>
                      handleInputChange("musicianMinimumAcceptableRate", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* Booking Photo Upload/URL */}
                <div className="space-y-2">
                  <Label htmlFor="musicianBookingFormPictureUrl">
                    Musician Booking Form Picture
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="musicianBookingFormPictureUrl"
                      type="url"
                      value={formData.musicianBookingFormPictureUrl}
                      onChange={(e) =>
                        handleInputChange(
                          "musicianBookingFormPictureUrl",
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
                          if (file) handleFileUpload(file, "musicianBookingPhoto");
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingFiles.musicianBookingPhoto}
                        asChild
                      >
                        <span>
                          {uploadingFiles.musicianBookingPhoto ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Image className="h-4 w-4 mr-1" />
                          )}
                          {uploadingFiles.musicianBookingPhoto
                            ? "Uploading..."
                            : "Upload Photo"}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {formData.musicianBookingFormPictureUrl && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Current booking photo:</span>{" "}
                    <a
                      href={formData.musicianBookingFormPictureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {formData.musicianBookingFormPictureUrl.includes("/uploads/")
                        ? "Uploaded image"
                        : "External URL"}
                    </a>
                  </div>
                )}
              </div>

              {/* <div className="flex items-center space-x-2">
                <Switch
                  id="musicianPrivacy"
                  checked={formData.musicianPrivacySetting === "public"}
                  onCheckedChange={(checked) =>
                    handleInputChange(
                      "musicianPrivacySetting",
                      checked ? "public" : "private"
                    )
                  }
                />
                <Label htmlFor="musicianPrivacy"> Musician Public Profile</Label>
              </div> */}
            </>
          )}


          {/* Professional-specific fields */}
          {isProfessional && (<>

            {/* Primary Talent Selection for Artists, Musicians and Professionals */}
            <div className="space-y-2">
              <Label htmlFor="professionalPrimaryTalent">
                <Music className="h-4 w-4 inline mr-1" />
                Primary Talent/Skill
              </Label>
              <Select
                value={String(formData.professionalPrimaryTalentId || null)}
                onValueChange={(value) =>
                  handleInputChange(
                    "professionalPrimaryTalentId",
                    value ? parseInt(value) : null
                  )
                }
              >
                <SelectTrigger id="professionalPrimaryTalent">
                  <SelectValue placeholder="Select your primary talent or skill" />
                </SelectTrigger>
                <SelectContent>
                  {/* Sort instruments to show vocals first for artists */}
                  {professionalTalents
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((instrument) => (
                      <SelectItem key={instrument.id} value={String(instrument.id)}>
                        {instrument.name} - {instrument.type}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="professionalBasePrice">Professional Base Price ($)</Label>
                <Input
                  id="professionalBasePrice"
                  type="number"
                  value={formData.professionalBasePrice}
                  onChange={(e) =>
                    handleInputChange("professionalBasePrice", e.target.value)
                  }
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professionalIdealPerformanceRate">Professional Ideal Rate ($)</Label>
                <Input
                  id="professionalIdealPerformanceRate"
                  type="number"
                  value={formData.professionalIdealPerformanceRate}
                  onChange={(e) =>
                    handleInputChange("professionalIdealPerformanceRate", e.target.value)
                  }
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professionalMinimumAcceptableRate">Professional Minimum Rate ($)</Label>
                <Input
                  id="professionalMinimumAcceptableRate"
                  type="number"
                  value={formData.professionalMinimumAcceptableRate}
                  onChange={(e) =>
                    handleInputChange("professionalMinimumAcceptableRate", e.target.value)
                  }
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>



            <div className="space-y-4">
              {/* Booking Photo Upload/URL */}
              <div className="space-y-2">
                <Label htmlFor="professionalBookingFormPictureUrl">
                  Professional Booking Form Picture
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="professionalBookingFormPictureUrl"
                    type="url"
                    value={formData.professionalBookingFormPictureUrl}
                    onChange={(e) =>
                      handleInputChange(
                        "professionalBookingFormPictureUrl",
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
                        if (file) handleFileUpload(file, "professionalBookingPhoto");
                      }}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingFiles.professionalBookingPhoto}
                      asChild
                    >
                      <span>
                        {uploadingFiles.professionalBookingPhoto ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Image className="h-4 w-4 mr-1" />
                        )}
                        {uploadingFiles.professionalBookingPhoto
                          ? "Uploading..."
                          : "Upload Photo"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              {formData.professionalBookingFormPictureUrl && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Current booking photo:</span>{" "}
                  <a
                    href={formData.professionalBookingFormPictureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {formData.professionalBookingFormPictureUrl.includes("/uploads/")
                      ? "Uploaded image"
                      : "External URL"}
                  </a>
                </div>
              )}
            </div>

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

            {/* <div className="flex items-center space-x-2">
              <Switch
                id="professionalPrivacy"
                checked={formData.professionalPrivacySetting === "public"}
                onCheckedChange={(checked) =>
                  handleInputChange(
                    "professionalPrivacySetting",
                    checked ? "public" : "private"
                  )
                }
              />
              <Label htmlFor="professionalPrivacy"> Professional Public Profile</Label>
            </div> */}
          </>
          )}

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
            <Label htmlFor="privacy"> Public Profile</Label>
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
