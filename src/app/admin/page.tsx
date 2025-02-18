"use client";

import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { GetAllProfilesDTO } from "../api/profiles/route";
import { CreateProfileDialog } from "./_components/CreateProfileDialog";

export default function AdminPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { isPending, data: profiles } = useQuery<GetAllProfilesDTO[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await fetch("/api/profiles");
      return await response.json();
    },
  });

  if (isPending) return <>loading</>;

  return (
    <>
      <CreateProfileDialog onOpenChange={setIsCreateOpen} open={isCreateOpen} />
      <div className="p-4">
        <h1>Admin Page</h1>
        <p>Welcome to the admin panel.</p>
        <button onClick={() => setIsCreateOpen(true)}>Criar</button>
        <div className="flex flex-col gap-2">
          {profiles?.map((profile) => (
            <div className="bg-red-200" key={profile._id}>
              <h2>{profile.name}</h2>
              <p>{profile.resume}</p>

              <div className="flex justify-between bg-green-200">
                <button>Editar</button>
                <button>remover</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
