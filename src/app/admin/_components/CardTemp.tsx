import React from "react";
import { CreateProfileDialog } from "./CreateProfileDialog";
import { GetAllProfilesDTO } from "@/app/api/profiles/route";
import { deleteProfile } from "../_actions/Profiles";
import { queryClient } from "@/lib/queryCLient";
import { toast } from "sonner";

interface CardTempProps {
  profile: GetAllProfilesDTO;
}

export default function CardTemp({ profile }: CardTempProps) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

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
      <div className="bg-red-200" key={profile._id}>
        <h2>{profile.name}</h2>
        <p>{profile.resume}</p>

        <div className="flex justify-between bg-green-200">
          <button onClick={() => setIsCreateOpen(true)}>Editar</button>
          <button onClick={() => handleDelete(profile._id)}>Remover</button>
        </div>
      </div>
    </>
  );
}
