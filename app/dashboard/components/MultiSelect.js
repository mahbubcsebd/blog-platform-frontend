'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Plus, X } from 'lucide-react';
import { useState } from 'react';

const MultiSelect = ({ options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleUnselect = (item) => {
    onChange(selected.filter((s) => s.value !== item.value));
  };

  const handleSelect = (item) => {
    if (!selected.some((s) => s.value === item.value)) {
      onChange([...selected, item]);
    }
    setInputValue('');
    setOpen(false);
  };

  // Create new tag from input
  const handleCreateTag = () => {
    if (
      inputValue.trim() &&
      !options.some((opt) => opt.value === inputValue.toLowerCase())
    ) {
      const newTag = {
        value: inputValue.toLowerCase().replace(/\s+/g, '-'),
        label: inputValue.trim(),
      };
      handleSelect(newTag);
    }
  };

  const filteredOptions = options.filter(
    (option) =>
      !selected.some((s) => s.value === option.value) &&
      option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const canCreateNew =
    inputValue.trim() &&
    !options.some(
      (opt) => opt.label.toLowerCase() === inputValue.toLowerCase()
    ) &&
    !selected.some((s) => s.label.toLowerCase() === inputValue.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[48px] p-3 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-lg transition-all"
        >
          <div className="flex gap-2 flex-wrap w-full items-center">
            {selected.length === 0 ? (
              <span className="text-slate-500 font-medium">
                Select tags to categorize your story...
              </span>
            ) : (
              <>
                {selected.slice(0, 3).map((item) => (
                  <Badge
                    variant="secondary"
                    key={item.value}
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200 rounded-full px-3 py-1 font-medium cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnselect(item);
                    }}
                  >
                    {item.label}
                    <X className="ml-1 h-3 w-3 hover:text-blue-600" />
                  </Badge>
                ))}
                {selected.length > 3 && (
                  <Badge
                    variant="outline"
                    className="bg-slate-100 text-slate-600 border-slate-300 rounded-full px-3 py-1"
                  >
                    +{selected.length - 3} more
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-slate-500 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white shadow-xl border-2 border-slate-200 rounded-xl">
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search or create tags..."
            value={inputValue}
            onValueChange={setInputValue}
            className="border-0 border-b border-slate-200 rounded-none focus:ring-0 px-4 py-3 text-sm"
          />
          <CommandList className="max-h-60">
            {canCreateNew && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateTag}
                  className="flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer rounded-lg mx-2 my-1"
                >
                  <Plus className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="text-blue-600 font-medium">
                    Create "{inputValue}"
                  </span>
                </CommandItem>
              </CommandGroup>
            )}

            {filteredOptions.length === 0 && !canCreateNew ? (
              <CommandEmpty className="py-6 text-center text-slate-500">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-slate-400">🏷️</span>
                  </div>
                  No tags found
                </div>
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option)}
                    className="flex items-center px-4 py-3 hover:bg-slate-50 cursor-pointer rounded-lg mx-2 my-1"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 text-emerald-500',
                        selected.some((s) => s.value === option.value)
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <span className="font-medium text-slate-700">
                      {option.label}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelect;
