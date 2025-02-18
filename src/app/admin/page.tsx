"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import type { GetAllProfilesDTO } from "../api/profiles/route";
import { CreateProfileDialog } from "./_components/CreateProfileDialog";
import ProfileCard from "./_components/ProfilCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { MultiSelect } from "./_components/MultiSelect";

export default function AdminPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [promotionFilter, setPromotionFilter] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<"name" | "createdAt">("name");

  const { isPending, data: profiles } = useQuery<GetAllProfilesDTO[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await fetch("/api/profiles");
      return await response.json();
    },
  });

  const filteredProfiles = useMemo(() => {
    if (!profiles) return [];
    return profiles
      .filter((profile) => {
        const nameMatch = profile.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const stateMatch = !stateFilter || profile.local?.uf === stateFilter;
        const categoryMatch =
          categoryFilters.length === 0 ||
          profile.category.categories.some((cat) =>
            categoryFilters.includes(cat)
          );
        const typeMatch =
          typeFilters.length === 0 ||
          profile.category.type.some((type) => typeFilters.includes(type));
        const promotionMatch = !promotionFilter || profile.promotion?.active;
        return (
          nameMatch &&
          stateMatch &&
          categoryMatch &&
          typeMatch &&
          promotionMatch
        );
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else {
          return sortOrder === "asc"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [
    profiles,
    searchTerm,
    stateFilter,
    categoryFilters,
    typeFilters,
    promotionFilter,
    sortOrder,
    sortBy,
  ]);

  const uniqueStates = useMemo(() => {
    if (!profiles) return [];
    return Array.from(
      new Set(profiles.map((profile) => profile.local?.uf).filter(Boolean))
    );
  }, [profiles]);

  const uniqueCategories = useMemo(() => {
    if (!profiles) return [];
    return Array.from(
      new Set(profiles.flatMap((profile) => profile.category.categories))
    );
  }, [profiles]);

  const uniqueTypes = useMemo(() => {
    if (!profiles) return [];
    return Array.from(
      new Set(profiles.flatMap((profile) => profile.category.type))
    );
  }, [profiles]);

  if (isPending)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );

  return (
    <>
      <CreateProfileDialog onOpenChange={setIsCreateOpen} open={isCreateOpen} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Profiles</h1>
          <div></div>
          <Button onClick={() => setIsCreateOpen(true)}>
            Create New Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <Input
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {uniqueStates
                .filter((state): state is string => !!state)
                .map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <MultiSelect
            options={uniqueCategories}
            selected={categoryFilters}
            onChange={setCategoryFilters}
            placeholder="Filter by categories"
          />
          <MultiSelect
            options={uniqueTypes}
            selected={typeFilters}
            onChange={setTypeFilters}
            placeholder="Filter by types"
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="promotionFilter"
              checked={promotionFilter}
              onChange={(e) => setPromotionFilter(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="promotionFilter">
              Show only profiles with promotions
            </label>
          </div>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as "name" | "createdAt")}
          >
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
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center"
          >
            {sortOrder === "asc" ? (
              <ChevronUp className="mr-2" />
            ) : (
              <ChevronDown className="mr-2" />
            )}
            {sortOrder === "asc" ? "Crescente" : "Decrescente"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map((profile) => (
            <ProfileCard key={profile._id} profile={profile} />
          ))}
        </div>
      </div>
    </>
  );
}
