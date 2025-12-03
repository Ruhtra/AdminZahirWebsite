"use client";

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
import { Country, State } from "country-state-city"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProfileCardProps {
  profile: GetAllProfilesDTO;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (profile.name == "teste") console.log(profile);

  const handleDelete = async (profileId: string) => {
    try {
      const data = await deleteProfile({
        idProfile: profileId,
      });

      if (data.error) toast(data.error);
      if (data.success) {
        toast("Profile deletado com sucesso");
        await queryClient.refetchQueries({
          queryKey: ["profiles"],
        });
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const getCountryName = (isoCode?: string) => {
    if (!isoCode) return null
    const country = Country.getCountryByCode(isoCode)
    return country?.name || isoCode
  }

  const getStateName = (countryCode?: string, stateCode?: string) => {
    if (!countryCode || !stateCode) return null
    const state = State.getStateByCodeAndCountry(stateCode, countryCode)
    return state?.name || stateCode
  }

  const getLocationString = () => {
    const country = getCountryName(profile.local?.country)
    const state = getStateName(profile.local?.country, profile.local?.uf)
    const city = profile.local?.city

    if (!country) return null

    if (city && state) {
      return `${country}, ${city}, ${state}`
    } else if (state) {
      return `${country}, ${state}`
    }
    return country
  }

  const locationString = getLocationString()

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
            src={(profile.picture || "/placeholder.svg") + `?v=${Date.now()}`}
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
          {locationString && (
            <p className="text-sm text-muted-foreground flex items-center mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {locationString}
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
              Editar
            </Button>
            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Deletar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Você tem certeza absoluta?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente o perfil e removerá todos os dados
                    associados, incluindo imagens e outros conteúdos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(profile._id)}>
                    Deletar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
