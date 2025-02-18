"use client";

import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { GetAllProfilesDTO } from "../api/profiles/route";
import { CreateProfileDialog } from "./_components/CreateProfileDialog";
import CardTemp from "./_components/CardTemp";

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
            <CardTemp key={profile._id} profile={profile} />
          ))}
        </div>
      </div>
    </>
  );
}
