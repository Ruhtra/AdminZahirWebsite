"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X } from "lucide-react";

export function CategoryManager({
  availableCategories,
}: {
  availableCategories: string[];
}) {
  const { setValue, watch } = useFormContext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectedCategories = watch("categories") || [];
  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [allCategories, setAllCategories] = useState<string[]>([]);

  useEffect(() => {
    setAllCategories([
      ...new Set([...availableCategories, ...selectedCategories]),
    ]);
  }, [availableCategories, selectedCategories]);

  const addCategory = () => {
    if (
      newCategory.trim() !== "" &&
      !allCategories.some(
        (cat) => cat.toLowerCase() === newCategory.trim().toLowerCase()
      )
    ) {
      const newCat = newCategory.trim();
      setAllCategories([...allCategories, newCat]);
      setValue("categories", [...selectedCategories, newCat]);
      setNewCategory("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      addCategory();
    }
  };

  const toggleCategory = (category: string) => {
    const isSelected = selectedCategories.includes(category);
    if (isSelected) {
      setValue(
        "categories",
        selectedCategories.filter((cat: string) => cat !== category)
      );
    } else {
      setValue("categories", [...selectedCategories, category]);
    }
  };

  const filteredCategories = allCategories.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Manage Categories</h3>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Search categories"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
      </div>
      <ScrollArea className="h-[200px] border rounded-md p-2">
        {filteredCategories.map((category) => (
          <div key={category} className="flex items-center space-x-2 py-1">
            <Checkbox
              checked={selectedCategories.includes(category)}
              onCheckedChange={() => toggleCategory(category)}
            />
            <span>{category}</span>
          </div>
        ))}
      </ScrollArea>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="New category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow"
        />
        <Button type="button" onClick={addCategory} size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedCategories.map((category: string) => (
          <Badge
            key={category}
            variant="secondary"
            className="text-sm py-1 px-2"
          >
            {category}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-2 h-auto p-0"
              onClick={() => toggleCategory(category)}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
