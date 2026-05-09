"use client"

import { useQuery } from "@tanstack/react-query"
import { useState, useMemo, useEffect, useTransition, useDeferredValue } from "react"
import type { GetAllProfilesDTO } from "../api/profiles/route"
import { CreateProfileDialog } from "./_components/CreateProfileDialog"
import ProfileCard from "./_components/ProfilCard"
import { FollowersManagerDialog } from "./_components/FollowersManagerDialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ChevronUp, ChevronDown, Sparkles } from "lucide-react"
import { MultiSelect } from "./_components/MultiSelect"
import { Country, State } from "country-state-city"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

function removeDiacritics(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export default function AdminPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [countryFilter, setCountryFilter] = useState("all")
  const [stateFilter, setStateFilter] = useState("all")
  const [categoryFilters, setCategoryFilters] = useState<string[]>([])
  const [typeFilters, setTypeFilters] = useState<string[]>([])
  const [promotionFilter, setPromotionFilter] = useState(false)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [sortBy, setSortBy] = useState<"name" | "createdAt">("name")
  const [isPendingFilter, startTransition] = useTransition()
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const { isPending, data: profiles } = useQuery<GetAllProfilesDTO[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await fetch("/api/profiles")
      return await response.json()
    },
  })

  const uniqueCountries = useMemo(() => {
    if (!profiles) return []
    const countryCodes = Array.from(
      new Set(profiles.map((profile) => profile.local?.country).filter(Boolean)),
    ) as string[]

    return countryCodes
      .map((code) => {
        const country = Country.getCountryByCode(code)
        return country ? { code, name: country.name } : null
      })
      .filter(Boolean)
      .sort((a, b) => a!.name.localeCompare(b!.name, "pt-BR")) as Array<{
        code: string
        name: string
      }>
  }, [profiles])
  
  useEffect(() => {
    setStateFilter("all")
  }, [countryFilter])

  const uniqueStates = useMemo(() => {
    if (!profiles) return []

    const filteredByCountry =
      countryFilter === "all" || !countryFilter
        ? profiles
        : profiles.filter((profile) => profile.local?.country === countryFilter)

    // Criar um Map usando uma chave composta (país + estado)
    const stateMap = new Map()

    filteredByCountry.forEach((profile) => {
      const country = profile.local?.country
      const state = profile.local?.uf

      if (country && state) {
        const key = `${country}-${state}`
        if (!stateMap.has(key)) {
          stateMap.set(key, { country, state })
        }
      }
    })

    

    // Converter Map para array e processar os estados
    return Array.from(stateMap.values())
      .map(({ country, state }) => {
        const stateData = State.getStateByCodeAndCountry(state, country)
        return stateData ? {
          code: state,
          name: stateData.name,
          country: country
        } : null
      })
      .filter(Boolean)
      .sort((a, b) => a!.name.localeCompare(b!.name, "pt-BR")) as Array<{
        code: string
        name: string
        country: string
      }>
  }, [profiles, countryFilter])

  useMemo(() => {
    setStateFilter("all")
  }, [])

  const filteredProfiles = useMemo(() => {
    if (!profiles) return []
    const normalizedSearchTerm = removeDiacritics(deferredSearchTerm.toLowerCase())
    return profiles
      .filter((profile) => {
        const normalizedName = removeDiacritics(profile.name.toLowerCase())
        const nameMatch = normalizedName.includes(normalizedSearchTerm)

        const countryMatch = countryFilter === "all" || !countryFilter || profile.local?.country === countryFilter

        const stateMatch =
          stateFilter === "all" ||
          !stateFilter ||
          (profile.local?.uf === stateFilter && profile.local?.country === countryFilter)

        const categoryMatch =
          categoryFilters.length === 0 || profile.category.categories.some((cat) => categoryFilters.includes(cat))
        const typeMatch = typeFilters.length === 0 || profile.category.type.some((type) => typeFilters.includes(type))
        const promotionMatch = !promotionFilter || profile.promotion?.active
        return nameMatch && countryMatch && stateMatch && categoryMatch && typeMatch && promotionMatch
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        } else {
          return sortOrder === "asc"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
      })
  }, [
    profiles,
    deferredSearchTerm,
    countryFilter,
    stateFilter,
    categoryFilters,
    typeFilters,
    promotionFilter,
    sortOrder,
    sortBy,
  ])

  const uniqueCategories = useMemo(() => {
    if (!profiles) return []
    return Array.from(new Set(profiles.flatMap((profile) => profile.category.categories)))
  }, [profiles])

  const uniqueTypes = useMemo(() => {
    if (!profiles) return []
    return Array.from(new Set(profiles.flatMap((profile) => profile.category.type)))
  }, [profiles])

  if (isPending)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )

  return (
    <>
      <CreateProfileDialog onOpenChange={setIsCreateOpen} open={isCreateOpen} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Profiles</h1>
          <div className="flex gap-2">
            <FollowersManagerDialog />
            <Button variant="outline" onClick={() => window.location.href = '/admin/homepage'}>
              Gerenciar Homepage
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>Create New Profile</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <Input 
            placeholder="Search by name" 
            value={searchTerm} 
            onChange={(e) => {
              const val = e.target.value
              setSearchTerm(val) // Update input immediately
            }} 
          />
          <Select 
            value={countryFilter} 
            onValueChange={(val) => startTransition(() => setCountryFilter(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Países</SelectItem>
              {uniqueCountries.map((country, i) => (
                <SelectItem key={i} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={stateFilter}
            onValueChange={(val) => startTransition(() => setStateFilter(val))}
            disabled={countryFilter === "all" || !countryFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estados</SelectItem>
              {uniqueStates.map((state, i) => (
                <SelectItem key={i} value={state.code}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <MultiSelect
            options={uniqueCategories}
            selected={categoryFilters}
            onChange={(val) => startTransition(() => setCategoryFilters(val))}
            placeholder="Filter by categories"
          />
          <MultiSelect
            options={uniqueTypes}
            selected={typeFilters}
            onChange={(val) => startTransition(() => setTypeFilters(val))}
            placeholder="Filter by types"
          />
          <div className="flex items-center justify-between space-x-2 border rounded-md px-3 py-2 bg-background hover:bg-accent/50 transition-colors">
            <Label htmlFor="promotionFilter" className="flex items-center gap-2 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              <Sparkles className="w-4 h-4 text-brand" />
              Apenas Promoções
            </Label>
            <Switch
              id="promotionFilter"
              checked={promotionFilter}
              onCheckedChange={(val) => startTransition(() => setPromotionFilter(val))}
            />
          </div>
          <Select value={sortBy} onValueChange={(value) => startTransition(() => setSortBy(value as "name" | "createdAt"))}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="createdAt">Creation Date</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => startTransition(() => setSortOrder(sortOrder === "asc" ? "desc" : "asc"))}
            className="flex items-center"
          >
            {sortOrder === "asc" ? <ChevronUp className="mr-2" /> : <ChevronDown className="mr-2" />}
            {sortOrder === "asc" ? "Crescente" : "Decrescente"}
          </Button>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity ${isPendingFilter ? "opacity-50" : "opacity-100"}`}>
          {filteredProfiles.map((profile) => (
            <ProfileCard key={profile._id} profile={profile} />
          ))}
        </div>
      </div>
    </>
  )
}
