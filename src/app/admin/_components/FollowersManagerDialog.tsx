"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getLatestFollowers, addFollowersRecord } from "../_actions/Followers";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";

export function FollowersManagerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [instagram, setInstagram] = useState(0);
  const [tiktok, setTiktok] = useState(0);
  const [youtube, setYoutube] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      loadFollowers();
    }
  }, [isOpen]);

  const loadFollowers = async () => {
    setIsLoading(true);
    const result = await getLatestFollowers();
    if (result.data) {
      setInstagram(result.data.instagram);
      setTiktok(result.data.tiktok);
      setYoutube(result.data.youtube);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    startTransition(async () => {
      const result = await addFollowersRecord({
        instagram: Number(instagram) || 0,
        tiktok: Number(tiktok) || 0,
        youtube: Number(youtube) || 0,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Números de seguidores atualizados!");
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          Gerenciar Seguidores
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Seguidores Sociais</DialogTitle>
          <DialogDescription>
            Atualize o número de seguidores. Isso será salvo no histórico para estatísticas futuras.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instagram" className="text-right">
                Instagram
              </Label>
              <Input
                id="instagram"
                type="number"
                value={instagram}
                onChange={(e) => setInstagram(parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tiktok" className="text-right">
                TikTok
              </Label>
              <Input
                id="tiktok"
                type="number"
                value={tiktok}
                onChange={(e) => setTiktok(parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="youtube" className="text-right">
                YouTube
              </Label>
              <Input
                id="youtube"
                type="number"
                value={youtube}
                onChange={(e) => setYoutube(parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            
            <div className="pt-2 text-sm text-center text-muted-foreground border-t mt-2">
              Total Calculado: {(Number(instagram) + Number(tiktok) + Number(youtube)).toLocaleString('pt-BR')}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button disabled={isPending || isLoading} onClick={handleSave}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
