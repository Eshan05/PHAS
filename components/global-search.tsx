"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
} from "@/components/ui/command";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

export default function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [inputValue, setInputValue] = React.useState<string>('');

  const categories = ['Symptom', 'Chatbot', 'Medicine', 'Disease'];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (selectedCategory) {
      setSearchQuery(value.split(':')[1] || '');
    }
  };


  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setInputValue(`${category}: `);
    setSearchQuery('');
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    setInputValue('');
    setSearchQuery('');
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col items-start space-y-2">
        <div className="flex items-center border p-2 rounded w-full">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setOpen(true)}
          >
            <SearchIcon className="w-4 h-4 aspect-square" />
          </Button>
        </div>

        {/* Command Dialog for Category Selection */}
        <CommandDialog open={open} onOpenChange={setOpen}>
          <DialogTitle className="hidden"></DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
          {!selectedCategory ? (
            <CommandInput placeholder="Search or Select Category..." />
          ) : (
            <CommandInput placeholder="Search query" />
          )}
          {!selectedCategory ? (
            <CommandList>
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup heading="Categories">
                {categories.map((category) => (
                  <CommandItem
                    key={category}
                    onSelect={() => handleCategorySelect(category)}
                  >
                    {category}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          ) : (
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
            </CommandList>
          )}
          {selectedCategory && (
            <Button variant="ghost" onClick={handleClearCategory}>
              Clear Category
            </Button>
          )}
        </CommandDialog>


      </div>
    </section>
  );
}
