import { Button } from "@/components/ui/button";
import type { GetAllProfilesDTO } from "../../api/profiles/route";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import { CreateProfileDialog } from "./CreateProfileDialog";
import { deleteProfile } from "../_actions/Profiles";
import { toast } from "sonner";
import { queryClient } from "@/lib/queryCLient";
import { useState } from "react";

interface ProfileCardProps {
  profile: GetAllProfilesDTO;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDelete = async (profileId: string) => {
    try {
      const data = await deleteProfile({
        idProfile: profileId,
      });

      if (data.error) toast(data.error);
      if (data.success) {
        toast("Profile deletado com sucesso");
        // setPreviewUrl(null);
        await queryClient.refetchQueries({
          queryKey: ["profiles"],
        });
      }
      // Aqui você pode adicionar lógica para remover o perfil da lista, se necessário
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <CreateProfileDialog
        idProfile={profile._id}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
      <Card className="overflow-hidden">
        <div className="relative aspect-square">
          <Image
            src={profile.picture || "/placeholder.svg"}
            alt={profile.name}
            fill
            className="object-cover"
          />
          {profile.promotion?.active && (
            <Badge className="absolute top-2 right-2 bg-yellow-400 text-yellow-900">
              <Star className="w-4 h-4 mr-1" />
              Promotion
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">{profile.name}</h2>
          {profile.local && (
            <p className="text-sm text-muted-foreground flex items-center mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {profile.local.city}, {profile.local.uf}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.category.categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="bg-muted p-4">
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(profile._id)}
            >
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
