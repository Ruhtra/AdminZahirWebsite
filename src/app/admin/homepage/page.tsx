"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, GripVertical, X, Plus, Home, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { GetAllProfilesDTO } from "../../api/profiles/route"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface HomePageItem {
  profileId: string
  order: number
  profile: GetAllProfilesDTO
}

interface SortableItemProps {
  item: HomePageItem
  onRemove: (profileId: string) => void
}

function SortableItem({ item, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.profileId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? "z-50" : ""}`}
    >
      <Card
        className={`border-2 transition-all ${
          isDragging
            ? "border-primary shadow-2xl shadow-primary/20 scale-105"
            : "border-border hover:border-primary/50 hover:shadow-lg"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <button
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-1"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-6 h-6" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center border-2 border-primary/20">
                    {item.profile.picture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.profile.picture || "/placeholder.svg"}
                        alt={item.profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Home className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center border-2 border-background">
                    {item.order + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{item.profile.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.profile.category.type.slice(0, 2).map((type, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {item.profile.category.type.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.profile.category.type.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => onRemove(item.profileId)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function HomePageManager() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const { data: allProfiles, isLoading: isLoadingProfiles } = useQuery<GetAllProfilesDTO[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await fetch("/api/profiles")
      return await response.json()
    },
  })

  const { data: homePageData, isLoading: isLoadingHomePage } = useQuery<HomePageItem[]>({
    queryKey: ["homepage"],
    queryFn: async () => {
      const response = await fetch("/api/homePage")
      const data = await response.json()
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((item: any) => ({
        profileId: item.profile._id,
        order: item.order,
        profile: allProfiles?.find((p) => p._id === item.profile._id),
      })).filter((item: HomePageItem) => item.profile)
    },
    enabled: !!allProfiles,
  })

  const [homePageItems, setHomePageItems] = useState<HomePageItem[]>([])

  useMemo(() => {
    if (homePageData) {
      const sorted = [...homePageData].sort((a, b) => a.order - b.order)
      setHomePageItems(sorted)
    }
  }, [homePageData])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const updateMutation = useMutation({
    mutationFn: async (items: HomePageItem[]) => {
      const payload = items.map((item, index) => ({
        profileId: item.profileId,
        order: index,
      }))

      const response = await fetch("/api/homePage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to update homepage")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage"] })
      toast.success("Homepage atualizada com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao atualizar homepage")
    },
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setHomePageItems((items) => {
        const oldIndex = items.findIndex((item) => item.profileId === active.id)
        const newIndex = items.findIndex((item) => item.profileId === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleRemove = (profileId: string) => {
    setHomePageItems((items) => items.filter((item) => item.profileId !== profileId))
  }

  const handleAddProfile = (profile: GetAllProfilesDTO) => {
    if (homePageItems.length >= 10) {
      toast.error("Máximo de 10 perfis na homepage")
      return
    }

    if (homePageItems.some((item) => item.profileId === profile._id)) {
      toast.error("Perfil já está na homepage")
      return
    }

    const newItem: HomePageItem = {
      profileId: profile._id,
      order: homePageItems.length,
      profile,
    }

    setHomePageItems([...homePageItems, newItem])
    setIsAddDialogOpen(false)
    toast.success("Perfil adicionado!")
  }

  const handleSave = () => {
    updateMutation.mutate(homePageItems)
  }

  const filteredProfiles = useMemo(() => {
    if (!allProfiles) return []
    return allProfiles
      .filter((profile) => {
        const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase())
        const notInHomePage = !homePageItems.some((item) => item.profileId === profile._id)
        return matchesSearch && notInHomePage
      })
      .slice(0, 20)
  }, [allProfiles, searchTerm, homePageItems])

  if (isLoadingProfiles || isLoadingHomePage) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Gerenciar Homepage
            </h1>
            <p className="text-muted-foreground">
              Selecione até 10 perfis para aparecer no carrossel principal
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg border">
            <span className="font-semibold text-foreground">{homePageItems.length}</span> / 10 perfis
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={homePageItems.length >= 10} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Perfil
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Adicionar Perfil à Homepage</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Buscar perfis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {filteredProfiles.map((profile) => (
                    <Card
                      key={profile._id}
                      className="cursor-pointer hover:border-primary transition-all"
                      onClick={() => handleAddProfile(profile)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            {profile.picture ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={profile.picture || "/placeholder.svg"}
                                alt={profile.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Home className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{profile.name}</h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {profile.category.type.slice(0, 3).map((type, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredProfiles.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum perfil encontrado
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || homePageItems.length === 0}
            className="gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </div>

      {homePageItems.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Home className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum perfil na homepage</h3>
            <p className="text-muted-foreground mb-4">
              Adicione perfis para começar a montar o carrossel principal
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Perfil
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded border">
            💡 Arraste os cards para reordenar a sequência do carrossel
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={homePageItems.map((item) => item.profileId)} strategy={verticalListSortingStrategy}>
              {homePageItems.map((item) => (
                <SortableItem key={item.profileId} item={item} onRemove={handleRemove} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}
